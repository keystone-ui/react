/**
 * Hardening invariants for .github/workflows/*.yml.
 *
 * These are the rules a reviewer would otherwise have to remember on every
 * workflow edit: actions pinned to a commit (a moved tag cannot run new code
 * here), least-privilege tokens, secrets bound to the steps that use them,
 * `bash` so a failing command inside a pipe fails the step, and deploy jobs
 * that skip pull requests from forks instead of failing on missing secrets.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const REPO_ROOT = resolve(import.meta.dirname, "../../..");
const WORKFLOWS_DIR = join(REPO_ROOT, ".github/workflows");
const DEPENDABOT_FILE = join(REPO_ROOT, ".github/dependabot.yml");

const WORKFLOW_FILE = /\.ya?ml$/;
const USES_LINE = /^\s*-?\s*uses:\s*(\S+)(.*)$/;
const SHA_PINNED = /^[\w.-]+\/[\w.-]+(?:\/[\w./-]+)?@[0-9a-f]{40}$/;
const VERSION_COMMENT = /^\s+#\s*v?\d+(?:\.\d+)*\s*$/;

const FORK_GUARD =
  "github.event.pull_request.head.repo.full_name == github.repository";
const DEPENDABOT_GUARD = "github.actor != 'dependabot[bot]'";
// Dependabot can also push to main (`@dependabot merge`), and a skipped
// deploy there would leave production stale behind a green run. The actor
// check therefore belongs to the pull_request branch of the expression only.
const PR_ONLY_DEPENDABOT_GUARD = `(${DEPENDABOT_GUARD} && ${FORK_GUARD})`;
const CANCEL_PULL_REQUESTS_ONLY = "github.event_name == 'pull_request'";
// Always available, so it needs no guard.
const GITHUB_TOKEN = "secrets.GITHUB_TOKEN";

interface Step {
  env?: Record<string, unknown>;
  if?: string;
  name?: string;
  run?: string;
  uses?: string;
  with?: Record<string, unknown>;
}

interface Job {
  env?: Record<string, unknown>;
  if?: string;
  permissions?: Record<string, string> | string;
  steps?: Step[];
}

interface Workflow {
  concurrency?: { "cancel-in-progress"?: unknown };
  defaults?: { run?: { shell?: string } };
  env?: Record<string, unknown>;
  jobs: Record<string, Job>;
  on: Record<
    string,
    { branches?: unknown; "branches-ignore"?: unknown; paths?: unknown } | null
  >;
  permissions?: Record<string, string> | string;
}

const workflows = readdirSync(WORKFLOWS_DIR)
  .filter((file) => WORKFLOW_FILE.test(file))
  .sort()
  .map((file) => {
    const text = readFileSync(join(WORKFLOWS_DIR, file), "utf8");
    return { file, text, doc: parse(text) as Workflow };
  });

// release.yml opens the version PR, publishes with an OIDC token and creates
// GitHub releases, so it is the one workflow allowed write scopes up top.
const TOP_LEVEL_WRITE_ALLOWED: Record<string, string[]> = {
  "release.yml": ["contents", "pull-requests", "id-token"],
};

function mentionsSecret(value: unknown): boolean {
  return JSON.stringify(value ?? {}).includes("secrets.");
}

function stepsUsingRepositorySecrets(job: Job): Step[] {
  // `run:` counts too: a secret passed on the command line needs the same
  // guards as one bound through `env:` or `with:`.
  return (job.steps ?? []).filter((step) =>
    JSON.stringify({ env: step.env, with: step.with, run: step.run })
      .replaceAll(GITHUB_TOKEN, "")
      .includes("secrets.")
  );
}

function findStep(file: string, stepName: string): Step | undefined {
  const workflow = workflows.find((w) => w.file === file);
  return Object.values(workflow?.doc.jobs ?? {})
    .flatMap((job) => job.steps ?? [])
    .find((step) => step.name === stepName);
}

describe("GitHub Actions workflows", () => {
  it("finds the workflows", () => {
    expect(workflows.map((w) => w.file)).toEqual([
      "ci.yml",
      "deploy-docs.yml",
      "deploy-storybook.yml",
      "release.yml",
    ]);
  });

  it("pins every action to a full commit SHA with a version comment", () => {
    const failures: string[] = [];

    for (const { file, text } of workflows) {
      for (const line of text.split("\n")) {
        const match = USES_LINE.exec(line);
        if (!match) {
          continue;
        }
        const [, ref, rest] = match;
        if (!SHA_PINNED.test(ref)) {
          failures.push(`${file}: ${ref} is not pinned to a commit SHA`);
        } else if (!VERSION_COMMENT.test(rest)) {
          failures.push(`${file}: ${ref} has no "# vX.Y.Z" comment`);
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it("declares top-level permissions, read-only unless the workflow publishes", () => {
    for (const { file, doc } of workflows) {
      expect(doc.permissions, `${file} has no permissions block`).toBeDefined();
      if (typeof doc.permissions !== "object") {
        continue;
      }
      const writes = Object.entries(doc.permissions)
        .filter(([, level]) => level === "write")
        .map(([scope]) => scope)
        .sort();
      expect(writes, `${file} grants write scopes`).toEqual(
        [...(TOP_LEVEL_WRITE_ALLOWED[file] ?? [])].sort()
      );
    }
  });

  it("binds secrets to steps, never to a whole workflow or job", () => {
    for (const { file, doc } of workflows) {
      expect(
        mentionsSecret(doc.env),
        `${file} binds a secret at workflow level`
      ).toBe(false);
      for (const [name, job] of Object.entries(doc.jobs)) {
        expect(
          mentionsSecret(job.env),
          `${file} › ${name} binds a secret at job level`
        ).toBe(false);
      }
    }
  });

  it("runs every shell step with bash, so a failure inside a pipe fails the step", () => {
    for (const { file, doc } of workflows) {
      expect(doc.defaults?.run?.shell, file).toBe("bash");
    }
  });

  it("runs on every pull request, whatever branch it targets", () => {
    // A stacked PR targets another PR's branch. Filtering `pull_request` to
    // `main` meant those PRs ran only the deploy workflows and no checks.
    for (const { file, doc } of workflows) {
      const pullRequest = doc.on.pull_request;
      if (pullRequest === undefined) {
        continue;
      }
      expect(
        pullRequest?.branches,
        `${file} filters pull_request by branch`
      ).toBeUndefined();
      // The other spellings of the same filter.
      expect(
        pullRequest?.["branches-ignore"],
        `${file} filters pull_request by branches-ignore`
      ).toBeUndefined();
      expect(
        pullRequest?.paths,
        `${file} filters pull_request by paths`
      ).toBeUndefined();
    }
  });

  it("tells a contributor how to fix registry drift", () => {
    const drift = findStep("ci.yml", "Registry drift");
    expect(drift?.run).toContain("::error::");
    expect(drift?.run).toContain("pnpm registry:build");
  });

  it("prints the Worker log only when there is one", () => {
    // A failure before `Start workerd` has no log; `cat` on a missing file
    // would add a second red step for nothing.
    const log = findStep("ci.yml", "Worker log");
    expect(log?.if).toContain("hashFiles(");
  });

  it("skips jobs that need repository secrets for fork and Dependabot PRs", () => {
    // Neither receives repository secrets, so without a guard the job fails
    // on authentication: for a fork, with an error the contributor cannot
    // fix; for Dependabot, on every weekly action bump.
    let guardedJobs = 0;
    for (const { file, doc } of workflows) {
      for (const [name, job] of Object.entries(doc.jobs)) {
        if (stepsUsingRepositorySecrets(job).length === 0) {
          continue;
        }
        guardedJobs++;
        expect(job.if, `${file} › ${name} needs a fork guard`).toContain(
          FORK_GUARD
        );
        expect(
          job.if,
          `${file} › ${name} needs a PR-only Dependabot guard`
        ).toContain(PR_ONLY_DEPENDABOT_GUARD);
        expect(
          job.if?.split(DEPENDABOT_GUARD).length,
          `${file} › ${name} checks the actor outside the pull_request branch`
        ).toBe(2);
      }
    }
    expect(guardedJobs).toBeGreaterThan(0);
  });

  it("cancels superseded runs only for pull requests", () => {
    // Cancelling a production deploy half-way leaves no smoke test behind
    // the version that did go live.
    for (const { file, doc } of workflows) {
      const cancel = doc.concurrency?.["cancel-in-progress"];
      if (cancel === undefined) {
        continue;
      }
      if (cancel === false) {
        continue;
      }
      expect(
        String(cancel),
        `${file} cancels in-progress runs unconditionally`
      ).toContain(CANCEL_PULL_REQUESTS_ONLY);
    }
  });

  it("fails CI when the committed registry drifts from its sources", () => {
    const ci = workflows.find((w) => w.file === "ci.yml");
    const runs = Object.values(ci?.doc.jobs ?? {})
      .flatMap((job) => job.steps ?? [])
      .map((step) => step.run ?? "");
    const drift = runs.find(
      (run) =>
        run.includes("registry:build") && run.includes("git diff --exit-code")
    );
    expect(drift).toBeDefined();
    // `git diff` ignores untracked files, so a new block's JSON that the
    // build created would pass unless it is first marked intent-to-add.
    expect(drift).toContain("git add --intent-to-add");
  });
});

describe("Dependabot", () => {
  it("keeps the pinned actions current", () => {
    expect(existsSync(DEPENDABOT_FILE)).toBe(true);
    const config = parse(readFileSync(DEPENDABOT_FILE, "utf8")) as {
      updates?: { "package-ecosystem": string }[];
    };
    expect(config.updates?.map((u) => u["package-ecosystem"])).toContain(
      "github-actions"
    );
  });
});
