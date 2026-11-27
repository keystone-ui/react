/**
 * Component page layout: preview first, `## Installation`, then `## Usage`
 * holding the import line. The older `## Import` section is retired.
 *
 *  - `scripts/lint-component-mdx.mjs` refuses a page with `## Import` and
 *    accepts a `## Usage` with an import alone or an import plus a snippet.
 *  - `scripts/add-component.mjs` scaffolds a page the linter accepts untouched.
 *  - `scripts/migrate-component-mdx.mjs` moves an `## Import` block under
 *    `## Usage` byte for byte, adds a snippet only where the default demo is a
 *    bare `return` of one element built from the page's own import, and a
 *    second run changes nothing.
 *
 * Every test copies the scripts it runs into a throwaway tree under the OS
 * temp dir (removed afterwards) and runs them as subprocesses from there: the
 * scripts resolve the repo from their own location. No test writes to the repo.
 */

import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const REPO_ROOT = join(import.meta.dirname, "../../..");
const PAGES = "apps/docs/content/docs/components";
const IMPORT_HEADING = /^## Import/m;

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function tempRepo(copied: string[]) {
  // realpath: on macOS the temp dir is a /var symlink to /private/var.
  const repo = realpathSync(mkdtempSync(join(tmpdir(), "ks-mdx-layout-")));
  temps.push(repo);
  for (const path of copied) {
    put(repo, path, readFileSync(join(REPO_ROOT, path), "utf8"));
  }
  return repo;
}

function put(repo: string, path: string, content: string) {
  mkdirSync(dirname(join(repo, path)), { recursive: true });
  writeFileSync(join(repo, path), content);
}

function read(repo: string, path: string) {
  return readFileSync(join(repo, path), "utf8");
}

function node(repo: string, script: string, ...args: string[]) {
  return spawnSync(process.execPath, [join(repo, script), ...args], {
    encoding: "utf8",
    timeout: 30_000,
  });
}

const INSTALLATION = (name: string) => `## Installation

<CodeBlockTabs items={["CLI", "Manual"]}>

\`\`\`bash tab="CLI"
npx shadcn@latest add https://keystoneui.io/r/${name}.json
\`\`\`

</CodeBlockTabs>
`;

const API = `## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| \`className\` | \`string\` | - | Additional CSS classes |
`;

const FRONTMATTER = `---
title: Probe
description: A probe component.
---
`;

/** A tree holding the linter, one demo name and one single-export source. */
function lintRepo(page: string) {
  const repo = tempRepo(["scripts/lint-component-mdx.mjs"]);
  put(
    repo,
    "apps/docs/demos/manifest.json",
    JSON.stringify({ "probe-default": {} })
  );
  put(repo, "packages/ui/src/probe.tsx", "export function Probe() {}\n");
  put(repo, `${PAGES}/probe.mdx`, page);
  return repo;
}

const IMPORT =
  '```tsx\nimport { Probe } from "@keystoneui/react/probe";\n```\n';

describe("lint-component-mdx", () => {
  it("refuses a page with ## Import and names the fix", () => {
    const repo = lintRepo(
      `${FRONTMATTER}\n## Import\n\n${IMPORT}\n## Usage\n\n<ComponentPreview name="probe-default" />\n\n${INSTALLATION("probe")}\n${API}`
    );

    const result = node(repo, "scripts/lint-component-mdx.mjs");

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("## Import");
    expect(result.stdout).toContain("migrate-component-mdx.mjs");
  });

  it.each([
    ["two spaces after the hashes", "##  Import"],
    ["a tab after the hashes", "##\tImport"],
    ["closing hashes", "## Import ##"],
    ["a Setext underline", "Import\n------"],
  ])("refuses an Import heading written with %s", (_label, heading) => {
    const repo = lintRepo(
      `${FRONTMATTER}\n<ComponentPreview name="probe-default" />\n\n${INSTALLATION("probe")}\n## Usage\n\n${IMPORT}\n${API}\n${heading}\n`
    );

    const result = node(repo, "scripts/lint-component-mdx.mjs");

    expect(result.stdout).toContain("is retired");
    expect(result.status).toBe(1);
  });

  it.each([
    ["backtick", "```md\n## Import\n```"],
    ["tilde", "~~~md\n## Import\n~~~"],
  ])("accepts a literal ## Import inside a %s fence", (_label, block) => {
    const repo = lintRepo(
      `${FRONTMATTER}\n<ComponentPreview name="probe-default" />\n\n${INSTALLATION("probe")}\n## Usage\n\n${IMPORT}\n${block}\n\n${API}`
    );

    const result = node(repo, "scripts/lint-component-mdx.mjs");

    expect(result.stdout).toContain("OK");
    expect(result.status).toBe(0);
  });

  it("accepts a ## Usage holding only the import", () => {
    const repo = lintRepo(
      `${FRONTMATTER}\n<ComponentPreview name="probe-default" />\n\n${INSTALLATION("probe")}\n## Usage\n\n${IMPORT}\n${API}`
    );

    const result = node(repo, "scripts/lint-component-mdx.mjs");

    expect(result.stdout).toContain("OK");
    expect(result.status).toBe(0);
  });

  it("accepts a ## Usage holding the import and a snippet", () => {
    const repo = lintRepo(
      `${FRONTMATTER}\n<ComponentPreview name="probe-default" />\n\n${INSTALLATION("probe")}\n## Usage\n\n${IMPORT}\n\`\`\`tsx\n<Probe />\n\`\`\`\n\n${API}`
    );

    const result = node(repo, "scripts/lint-component-mdx.mjs");

    expect(result.stdout).toContain("OK");
    expect(result.status).toBe(0);
  });
});

describe("add-component scaffold", () => {
  it("writes a page the linter accepts untouched", () => {
    const repo = tempRepo([
      "scripts/add-component.mjs",
      "scripts/gen-demos.mjs",
      "scripts/lib/demo-entries.mjs",
      "scripts/lint-component-mdx.mjs",
      "packages/ui/package.json",
      "packages/ui/tsup.config.ts",
      "packages/ui/src/_registry.ts",
      `${PAGES}/meta.json`,
    ]);
    mkdirSync(join(repo, "apps/storybook/stories"), { recursive: true });
    mkdirSync(join(repo, "apps/docs/demos"), { recursive: true });

    const scaffold = node(repo, "scripts/add-component.mjs", "ScaffoldProbe");
    expect(scaffold.status, scaffold.stderr).toBe(0);
    const page = read(repo, `${PAGES}/scaffold-probe.mdx`);
    expect(page).not.toMatch(IMPORT_HEADING);
    expect(page).toContain(
      '## Usage\n\n```tsx\nimport { ScaffoldProbe } from "@keystoneui/react/scaffold-probe";\n```\n\n```tsx\n<ScaffoldProbe>'
    );

    const lint = node(repo, "scripts/lint-component-mdx.mjs");

    expect(lint.stdout).toContain("OK");
    expect(lint.status).toBe(0);
  });
});

/** A tree holding the codemod, one page and its default demo. */
function migrateRepo(page: string, demo: string) {
  const repo = tempRepo(["scripts/migrate-component-mdx.mjs"]);
  put(repo, `${PAGES}/probe.mdx`, page);
  put(repo, "apps/docs/demos/probe/default.tsx", demo);
  return repo;
}

/** Run the usage-import transform; the caller asserts the exit status. */
function migrate(repo: string, ...args: string[]) {
  return node(
    repo,
    "scripts/migrate-component-mdx.mjs",
    "--only",
    "usage-import",
    ...args
  );
}

const DEMO_HEAD = `"use client";

import { Probe, ProbePart } from "@keystoneui/react/probe";
`;

const demoReturning = (body: string) => `${DEMO_HEAD}
export default function ProbeDefault() {
  ${body}
}
`;

const PREVIEW = '<ComponentPreview name="probe-default" />';

const OLD_PAGE = (usageExtra = "") => `${FRONTMATTER}
## Import

\`\`\`tsx
import {
  Probe,
  ProbePart,
} from "@keystoneui/react/probe";
\`\`\`

## Usage

<ComponentPreview name="probe-default" />
${usageExtra}
${INSTALLATION("probe")}
## Examples

### Big

<ComponentPreview name="probe-big" />

${API}`;

describe("migrate-component-mdx usage-import", () => {
  it("moves the import under ## Usage after Installation, preview first, snippet from a bare one-element demo", () => {
    const repo = migrateRepo(
      OLD_PAGE(),
      `${DEMO_HEAD}
export default function ProbeDefault() {
  return (
    <Probe size={2}>
      <ProbePart label="x" />
    </Probe>
  );
}
`
    );

    const result = node(
      repo,
      "scripts/migrate-component-mdx.mjs",
      "--only",
      "usage-import"
    );

    expect(result.status, result.stderr).toBe(0);
    expect(read(repo, `${PAGES}/probe.mdx`)).toBe(`${FRONTMATTER}
<ComponentPreview name="probe-default" />

${INSTALLATION("probe")}
## Usage

\`\`\`tsx
import {
  Probe,
  ProbePart,
} from "@keystoneui/react/probe";
\`\`\`

\`\`\`tsx
<Probe size={2}>
  <ProbePart label="x" />
</Probe>
\`\`\`

## Examples

### Big

<ComponentPreview name="probe-big" />

${API}`);
  });

  it.each([
    [
      "statements before the return",
      "const x = 1;\n  return <Probe size={x} />;",
    ],
    ["an intrinsic root", "return <div><Probe /></div>;"],
    ["a name the import lacks", "return <Probe icon={<StarIcon />} />;"],
    ["a fragment root", "return <><Probe /></>;"],
    ["a spread of a name the import lacks", "return <Probe {...demoProps} />;"],
  ])("keeps import only for %s", (_label, body) => {
    const repo = migrateRepo(OLD_PAGE(), demoReturning(body));

    const result = migrate(repo);

    expect(result.status, result.stderr).toBe(0);
    const page = read(repo, `${PAGES}/probe.mdx`);
    expect(page).toContain(
      '## Usage\n\n```tsx\nimport {\n  Probe,\n  ProbePart,\n} from "@keystoneui/react/probe";\n```\n\n## Examples'
    );
  });

  it("keeps prose and an existing snippet under ## Usage, in order, and adds none", () => {
    const repo = migrateRepo(
      OLD_PAGE("\nSome prose.\n\n```tsx\n<Probe custom />\n```\n"),
      `${DEMO_HEAD}
export default function ProbeDefault() {
  return <Probe />;
}
`
    );

    const result = migrate(repo);

    expect(result.status, result.stderr).toBe(0);
    const page = read(repo, `${PAGES}/probe.mdx`);
    expect(page).toContain(
      '} from "@keystoneui/react/probe";\n```\n\nSome prose.\n\n```tsx\n<Probe custom />\n```\n\n## Examples'
    );
    expect(page).not.toContain("```tsx\n<Probe />\n```");
  });

  it("changes nothing on a second run, and --dry writes nothing", () => {
    const repo = migrateRepo(
      OLD_PAGE(),
      `${DEMO_HEAD}
export default function ProbeDefault() {
  return <Probe />;
}
`
    );
    const before = read(repo, `${PAGES}/probe.mdx`);

    const dry = migrate(repo, "--dry");
    expect(dry.status, dry.stderr).toBe(0);
    expect(dry.stdout).toContain("Would change 1 of 1 files.");
    expect(read(repo, `${PAGES}/probe.mdx`)).toBe(before);

    const first = migrate(repo);
    expect(first.status, first.stderr).toBe(0);
    const once = read(repo, `${PAGES}/probe.mdx`);
    expect(once).not.toBe(before);
    const second = migrate(repo);
    expect(second.status, second.stderr).toBe(0);
    expect(second.stdout).toContain("Changed 0 of 1 files.");

    expect(read(repo, `${PAGES}/probe.mdx`)).toBe(once);
  });

  it("snippets a demo whose default function declares a return type", () => {
    const repo = migrateRepo(
      OLD_PAGE(),
      `${DEMO_HEAD}import type { ReactElement } from "react";

export default function ProbeDefault(): ReactElement {
  return <Probe size={2} />;
}
`
    );

    const result = migrate(repo);

    expect(result.status, result.stderr).toBe(0);
    expect(read(repo, `${PAGES}/probe.mdx`)).toContain(
      '} from "@keystoneui/react/probe";\n```\n\n```tsx\n<Probe size={2} />\n```\n\n## Examples'
    );
  });

  it("adds no snippet when ## Usage already has one in a ~~~ fence", () => {
    const repo = migrateRepo(
      OLD_PAGE("\n~~~tsx\n<Probe custom />\n~~~\n"),
      demoReturning("return <Probe />;")
    );

    const result = migrate(repo);

    expect(result.status, result.stderr).toBe(0);
    const page = read(repo, `${PAGES}/probe.mdx`);
    expect(page).toContain(
      '} from "@keystoneui/react/probe";\n```\n\n~~~tsx\n<Probe custom />\n~~~\n\n## Examples'
    );
    expect(page).not.toContain("```tsx\n<Probe />\n```");
  });

  it("leaves a fenced copy of the default preview whole and moves the live one", () => {
    const literal = `\`\`\`mdx\n${PREVIEW}\n\`\`\``;
    const repo = migrateRepo(
      OLD_PAGE().replace(PREVIEW, `${literal}\n\n${PREVIEW}`),
      demoReturning("return <Probe />;")
    );

    const result = migrate(repo);

    expect(result.status, result.stderr).toBe(0);
    const page = read(repo, `${PAGES}/probe.mdx`);
    expect(page).toContain(`${FRONTMATTER}\n${PREVIEW}\n\n## Installation`);
    expect(page).toContain(
      `\`\`\`tsx\n<Probe />\n\`\`\`\n\n${literal}\n\n## Examples`
    );
    // One live preview at the top, one inside the literal example.
    expect(page.split(PREVIEW)).toHaveLength(3);
  });

  it("keeps a literal ## Import inside a ~~~ fence and the prose after it", () => {
    const literal = "~~~md\n## Import\nExample text.\n~~~";
    const prose = "Keep this authored paragraph.";
    const repo = migrateRepo(
      OLD_PAGE().replace(
        "## Installation",
        `${literal}\n\n${prose}\n\n## Installation`
      ),
      demoReturning("return <Probe />;")
    );

    const result = migrate(repo);

    expect(result.status, result.stderr).toBe(0);
    const page = read(repo, `${PAGES}/probe.mdx`);
    expect(page).toContain(`${literal}\n\n${prose}\n`);
    expect(page.match(/^## Import/gm)).toHaveLength(1);
  });

  it.each([
    [
      "a second ## Import",
      (page: string) =>
        page.replace(
          "## Usage",
          '## Import\n\n```tsx\nimport { Spinner } from "@keystoneui/react/spinner";\n```\n\nKeep the loading-state note.\n\n## Usage'
        ),
    ],
    [
      "a second ## Usage",
      (page: string) =>
        page.replace("## Examples", "## Usage\n\nMore usage.\n\n## Examples"),
    ],
    [
      "no ## Usage and the default preview under ## Examples",
      (page: string) =>
        page
          .replace(`## Usage\n\n${PREVIEW}\n`, "")
          .replace("## Examples\n", `## Examples\n\n${PREVIEW}\n`),
    ],
  ])("leaves a page with %s intact and exits 1", (_label, edit) => {
    const repo = migrateRepo(
      edit(OLD_PAGE()),
      demoReturning("return <Probe />;")
    );
    const before = read(repo, `${PAGES}/probe.mdx`);

    const result = migrate(repo);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("probe:");
    expect(read(repo, `${PAGES}/probe.mdx`)).toBe(before);
  });
});
