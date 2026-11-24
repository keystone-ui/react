/**
 * Unreleased sync (`scripts/sync-unreleased.mjs`) and the release path it
 * feeds: `pnpm version-packages` runs sync, then `changeset version`, then
 * `scripts/rotate-changelog.mjs`.
 *
 * Every test copies both scripts into a throwaway tree under the OS temp dir
 * (removed afterwards), shaped like the repo, and runs them as subprocesses
 * from there. No test reads or writes the committed changelog or
 * `.changeset/`, runs `changeset version`, or depends on today's date.
 */

import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parse } from "yaml";

const REPO_ROOT = join(import.meta.dirname, "../../..");
const SCRIPTS = ["sync-unreleased.mjs", "rotate-changelog.mjs"];
const VERSION = "0.0.0-sync-test.0";
const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n/;

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

/**
 * A throwaway tree shaped like the repo, in a folder named `repoName`: both
 * scripts, a minimal UI manifest, an empty changelog folder and a
 * `.changeset/` holding the given changesets.
 */
function scratchRepo(changesets: Record<string, string>, repoName = "repo") {
  const base = mkdtempSync(join(tmpdir(), "ks-sync-unreleased-"));
  temps.push(base);
  const repo = join(base, repoName);
  const changelog = join(repo, "apps/docs/content/changelog");
  mkdirSync(join(repo, "scripts"), { recursive: true });
  mkdirSync(join(repo, "packages/ui"), { recursive: true });
  mkdirSync(join(repo, ".changeset"), { recursive: true });
  mkdirSync(changelog, { recursive: true });
  for (const script of SCRIPTS) {
    writeFileSync(
      join(repo, "scripts", script),
      readFileSync(join(REPO_ROOT, "scripts", script))
    );
  }
  writeFileSync(
    join(repo, "packages/ui/package.json"),
    JSON.stringify({ name: "@keystoneui/react", version: VERSION })
  );
  for (const [name, source] of Object.entries(changesets)) {
    writeFileSync(join(repo, ".changeset", name), source);
  }
  return { repo, changelog };
}

function run(repo: string, script: string) {
  return spawnSync(process.execPath, [join(repo, "scripts", script)], {
    encoding: "utf8",
    timeout: 30_000,
  });
}

function header(source: string): Record<string, unknown> {
  const match = source.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error("missing frontmatter");
  }
  return parse(match[1]);
}

const PATCH = `---
"@keystoneui/react": patch
---

Restore keyboard focus after a menu closes.
`;

describe("sync-unreleased CLI", () => {
  // A checkout folder whose name a file URL percent-encodes: the script must
  // find its files under the real name, not under `my%20checkout`.
  it.each([
    ["a space", "my checkout"],
    ["a percent sign and a hash", "100% #1"],
  ])("syncs from a checkout path holding %s", (_label, repoName) => {
    const { repo, changelog } = scratchRepo({ "patch.md": PATCH }, repoName);

    const result = run(repo, "sync-unreleased.mjs");

    expect(result.status, result.stderr).toBe(0);
    const page = readFileSync(join(changelog, "unreleased.mdx"), "utf8");
    expect(header(page)).toMatchObject({
      excerpt: "1 change queued for the next release.",
    });
    expect(page).toContain("### Restore keyboard focus after a menu closes.");
  });
});

describe("sync then rotate", () => {
  // The sentinel is the header's excerpt alone: a released change whose
  // notes quote the empty stub's excerpt line is still a release.
  it("rotates a release whose changeset quotes the empty stub's excerpt line", () => {
    const { repo, changelog } = scratchRepo({
      "quote.md": `---
"@keystoneui/react": patch
---

Skip rotation for an empty stub.

A stub's header reads:

    excerpt: "No changes since the last release."

and quoted at the start of a line:

excerpt: "No changes since the last release."
`,
    });

    const sync = run(repo, "sync-unreleased.mjs");
    expect(sync.status, sync.stderr).toBe(0);
    const rotate = run(repo, "rotate-changelog.mjs");

    expect(rotate.status, rotate.stderr).toBe(0);
    expect(rotate.stdout).not.toContain("skipping");
    const names = readdirSync(changelog);
    expect(names).toHaveLength(2);
    const dated = names.find((n) => n.endsWith(`-v${VERSION}.mdx`));
    expect(dated).toBeDefined();
    const page = readFileSync(join(changelog, dated as string), "utf8");
    expect(header(page)).toMatchObject({
      version: VERSION,
      excerpt: "1 change in this release.",
    });
    expect(page).toContain(
      '    excerpt: "No changes since the last release."\n'
    );
    expect(page).toContain('\nexcerpt: "No changes since the last release."\n');
    expect(
      header(readFileSync(join(changelog, "unreleased.mdx"), "utf8"))
    ).toMatchObject({ excerpt: "No changes since the last release." });
  });

  it("skips rotation when no @keystoneui/react change is queued", () => {
    const { repo, changelog } = scratchRepo({
      "mcp.md": `---
"@keystoneui/mcp": patch
---

An MCP-only fix.
`,
    });

    expect(run(repo, "sync-unreleased.mjs").status).toBe(0);
    const before = readFileSync(join(changelog, "unreleased.mdx"), "utf8");
    const rotate = run(repo, "rotate-changelog.mjs");

    expect(rotate.status, rotate.stderr).toBe(0);
    expect(rotate.stdout).toContain("skipping");
    expect(readdirSync(changelog)).toEqual(["unreleased.mdx"]);
    expect(readFileSync(join(changelog, "unreleased.mdx"), "utf8")).toBe(
      before
    );
  });
});
