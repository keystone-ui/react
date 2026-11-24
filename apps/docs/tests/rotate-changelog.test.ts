/**
 * Changelog rotation (`scripts/rotate-changelog.mjs`).
 *
 * `pnpm version-packages` turns `unreleased.mdx` into a dated page. Through
 * beta.15 the dated page kept the Unreleased header ("What's coming in the
 * next release" / "N changes queued for the next release."), so every release
 * shipped a heading that announced itself as unreleased.
 *
 * Rotation accepts one input: the page exactly as
 * `scripts/sync-unreleased.mjs` writes it (`pnpm version-packages` runs sync
 * first). These tests run the rotation as a pure function, run the CLI as a
 * subprocess in a throwaway folder under the OS temp dir (removed
 * afterwards), and audit the dated pages the site's changelog collection
 * loads: those committed under `content/changelog/`, and scratch folders
 * for the audit's own cases. Only the one audit of `content/changelog/`
 * reads the committed pages; no test
 * depends on today's date or the time zone. No network, no
 * `changeset version`, no writes inside the repo.
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, posix, win32 } from "node:path";
import { pathToFileURL } from "node:url";
import { frontmatter as siteFrontmatter } from "fumadocs-core/content/md/frontmatter";
import { afterEach, describe, expect, it } from "vitest";
import { parse } from "yaml";

import {
  displayPath,
  rotateChangelog,
} from "../../../scripts/rotate-changelog.mjs";

const REPO_ROOT = join(import.meta.dirname, "../../..");
const SCRIPT = join(REPO_ROOT, "scripts/rotate-changelog.mjs");
const CHANGELOG_DIR = join(import.meta.dirname, "../content/changelog");

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---(?:\n|$)/;
const FRONTMATTER_BLOCK_RE = /^---\n[\s\S]*?\n---\n/;
const ALREADY_ROTATED_RE = /already has a version field/;
const RUN_SYNC_RE = /run `pnpm sync-unreleased` first/;
const ENTRY_HEADING_RE = /^### /gm;
const LINE_BREAK_RE = /[\r\n]/;

/** The texts sync-unreleased.mjs writes for a pending (unreleased) page. */
const PENDING_DESCRIPTION = "What's coming in the next release";
const PENDING_EMPTY_EXCERPT = "No changes since the last release.";
const PENDING_QUEUED_EXCERPT_RE =
  /^([1-9]\d*) (changes?) queued for the next release\.$/;

type Header = Record<string, unknown>;

/** Parses an MDX file's frontmatter as YAML. */
function frontmatter(source: string): Header {
  const match = source.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error("missing frontmatter");
  }
  return parse(match[1]) as Header;
}

/** The body after the frontmatter block, byte for byte. */
function body(source: string): string {
  return source.replace(FRONTMATTER_BLOCK_RE, "");
}

/**
 * True when a decoded value, trimmed, is a text sync-unreleased.mjs writes
 * for a pending page, whatever YAML scalar style carried it. The queued
 * excerpt counts only with the generator's noun ("1 change", "2 changes"),
 * the same rule as the generator and rotation.
 */
function isPendingText(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }
  const text = value.trim();
  if (text === PENDING_DESCRIPTION || text === PENDING_EMPTY_EXCERPT) {
    return true;
  }
  const queued = text.match(PENDING_QUEUED_EXCERPT_RE);
  return queued !== null && (queued[1] === "1") === (queued[2] === "change");
}

/** True for a string that is not empty once trimmed. */
function isFilledString(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * The header fields of a dated page that are not a released one, read with
 * the site's own parser (`fumadocs-core/content/md/frontmatter`); what it
 * leaves in the body is body. `version` and `description` must be strings
 * with a non-whitespace character, and neither `description` nor a present
 * `excerpt` may be one of the pending texts the generator writes. `excerpt`
 * may be absent; when present it must be a string. Further schema checks
 * are the build's. Returns the failing field names, `[]` for a released
 * header.
 */
function releasedHeaderProblems(source: string): string[] {
  let data: unknown;
  try {
    data = siteFrontmatter(source).data;
  } catch {
    return ["frontmatter"];
  }
  const { version, description, excerpt } = (
    typeof data === "object" && data !== null ? data : {}
  ) as Header;
  const problems: string[] = [];
  if (!isFilledString(version)) {
    problems.push("version");
  }
  if (!isFilledString(description) || isPendingText(description)) {
    problems.push("description");
  }
  if (
    excerpt !== undefined &&
    (typeof excerpt !== "string" || isPendingText(excerpt))
  ) {
    problems.push("excerpt");
  }
  return problems;
}

/**
 * The site's own glob: `tinyglobby`, which `fumadocs-mdx` calls to list a
 * collection's files. Not a dependency of this app, so it is resolved
 * through `fumadocs-mdx`; if that fails, this file fails to load.
 */
const siteGlob = createRequire(
  createRequire(import.meta.url).resolve("fumadocs-mdx/package.json")
)("tinyglobby") as {
  globSync: (pattern: string, options: { cwd: string }) => string[];
};

/**
 * The entries the site's changelog collection loads from `dir`, minus the
 * top-level `unreleased.mdx`: the relative paths the site's glob returns
 * for the collection's pattern, called as `fumadocs-mdx` calls it
 * (`glob(patterns, { cwd: base })`), with only the exact path
 * `unreleased.mdx` removed, sorted.
 */
function datedPagePaths(dir: string): string[] {
  return siteGlob
    .globSync("**/*.{mdx,md}", { cwd: dir })
    .filter((path) => path !== "unreleased.mdx")
    .sort();
}

/** Each dated page under `dir` with its failing header fields. */
function auditChangelogDir(dir: string): Record<string, string[]> {
  return Object.fromEntries(
    datedPagePaths(dir).map((path) => [
      path,
      releasedHeaderProblems(readFileSync(join(dir, path), "utf8")),
    ])
  );
}

/** A header in sync-unreleased.mjs's exact shape, with the given excerpt. */
function syncHeader(excerpt: string): string {
  return `---
date: "2026-11-20"
description: "What's coming in the next release"
excerpt: "${excerpt}"
---
`;
}

/**
 * An Unreleased file exactly as sync-unreleased.mjs renders one: one
 * `### ` entry per changeset, separated by `---` inside the section.
 */
function unreleased(count: number): string {
  const noun = count === 1 ? "change" : "changes";
  const entries = Array.from(
    { length: count },
    (_, i) =>
      `### Entry ${i + 1}\n\nBody text that mentions the next release in prose stays as written.`
  ).join("\n\n---\n\n");
  return `${syncHeader(`${count} ${noun} queued for the next release.`)}
## Minor changes

${entries}
`;
}

/** The empty stub sync-unreleased.mjs writes when nothing is queued. */
const EMPTY_STUB = `${syncHeader(PENDING_EMPTY_EXCERPT)}
No changes merged since v1.0.0-beta.15.
`;

const OPTIONS = { version: "1.0.0-beta.16", today: "2026-11-21" };

/**
 * What a rotation that ran returns. The script is plain JavaScript, whose
 * inferred `skipped` is `boolean` on both arms, so checking it cannot narrow
 * the result: the strings are checked here, at run time, instead.
 */
interface Rotation {
  dated: string;
  fileName: string;
  stub: string;
}

function rotated(source: string): Rotation {
  const result = rotateChangelog(source, OPTIONS);
  if (result.skipped) {
    throw new Error("rotation skipped a non-empty Unreleased file");
  }
  const { dated, fileName, stub } = result;
  if (
    typeof dated !== "string" ||
    typeof fileName !== "string" ||
    typeof stub !== "string"
  ) {
    throw new Error("rotation returned without a dated page, name or stub");
  }
  return { dated, fileName, stub };
}

const BODY = "\n### Restore focus.\n";

/**
 * Inputs sync-unreleased.mjs never writes. Rotation refuses each one and
 * writes nothing; the user is told to run `pnpm sync-unreleased` first.
 */
const OUT_OF_CONTRACT: [string, string][] = [
  [
    "an extra field between description and excerpt",
    `---
date: "2026-11-20"
description: "What's coming in the next release"
release.channel: beta
excerpt: "1 change queued for the next release."
---
${BODY}`,
  ],
  [
    "a folded excerpt",
    `---
date: "2026-11-20"
description: "What's coming in the next release"
excerpt: >-
  1 change queued for the next release.
---
${BODY}`,
  ],
  [
    "a block excerpt",
    `---
date: "2026-11-20"
description: "What's coming in the next release"
excerpt: |
  1 change queued for the next release.
---
${BODY}`,
  ],
  [
    "a folded description",
    `---
date: "2026-11-20"
description: >-
  What's coming in the next release
excerpt: "1 change queued for the next release."
---
${BODY}`,
  ],
  [
    "a single-quoted excerpt",
    `---
date: "2026-11-20"
description: "What's coming in the next release"
excerpt: '1 change queued for the next release.'
---
${BODY}`,
  ],
  [
    "a single-quoted description",
    `---
date: "2026-11-20"
description: 'What''s coming in the next release'
excerpt: "1 change queued for the next release."
---
${BODY}`,
  ],
  [
    "a bare excerpt",
    `---
date: "2026-11-20"
description: "What's coming in the next release"
excerpt: 1 change queued for the next release.
---
${BODY}`,
  ],
  [
    "a bare date",
    `---
date: 2026-11-20
description: "What's coming in the next release"
excerpt: "1 change queued for the next release."
---
${BODY}`,
  ],
  [
    "a hand-written excerpt",
    `${syncHeader("Restores keyboard focus.")}${BODY}`,
  ],
  [
    "a hand-written description",
    `---
date: "2026-11-20"
description: "Focus fixes"
excerpt: "1 change queued for the next release."
---
${BODY}`,
  ],
  [
    "a plural count of one",
    `${syncHeader("1 changes queued for the next release.")}${BODY}`,
  ],
  [
    "a singular count of two",
    `${syncHeader("2 change queued for the next release.")}${BODY}`,
  ],
  [
    "a zero count",
    `${syncHeader("0 changes queued for the next release.")}${BODY}`,
  ],
  [
    "a zero-padded count",
    `${syncHeader("01 changes queued for the next release.")}${BODY}`,
  ],
  [
    "fields in another order",
    `---
description: "What's coming in the next release"
date: "2026-11-20"
excerpt: "1 change queued for the next release."
---
${BODY}`,
  ],
  [
    "quoted keys",
    `---
"date": "2026-11-20"
"description": "What's coming in the next release"
"excerpt": "1 change queued for the next release."
---
${BODY}`,
  ],
  [
    "a trailing comment on the excerpt",
    `---
date: "2026-11-20"
description: "What's coming in the next release"
excerpt: "No changes since the last release." # hand-tidied
---
${BODY}`,
  ],
  [
    "a blank line before the closing fence",
    `---
date: "2026-11-20"
description: "What's coming in the next release"
excerpt: "2 changes queued for the next release."

---
${BODY}`,
  ],
  [
    "an LF header with a CRLF closing fence",
    `---
date: "2026-11-20"
description: "What's coming in the next release"
excerpt: "1 change queued for the next release."
---\r
${BODY}`,
  ],
  ["a fully CRLF file", unreleased(1).replaceAll("\n", "\r\n")],
  ["no opening fence", `date: "2026-11-20"\n${BODY}`],
  [
    "no closing fence",
    `---
date: "2026-11-20"
description: "What's coming in the next release"
excerpt: "1 change queued for the next release."
`,
  ],
  ["an empty file", ""],
  ["a file cut off after the date", '---\ndate: "2026-11-20"'],
  [
    "no line break after the closing fence",
    syncHeader("1 change queued for the next release.").slice(0, -1),
  ],
  // Counts that do not survive being read and written as a number.
  [
    "a count past the safe integers (9007199254740993)",
    `${syncHeader("9007199254740993 changes queued for the next release.")}${BODY}`,
  ],
  [
    "a count of 310 nines",
    `${syncHeader(`${"9".repeat(310)} changes queued for the next release.`)}${BODY}`,
  ],
];

describe("rotateChangelog, in contract", () => {
  it("the three-change fixture has three entries, like the generator", () => {
    expect(unreleased(3).match(ENTRY_HEADING_RE)).toHaveLength(3);
  });

  // The exact bytes 91d5c96c writes for the same input.
  it.each([
    [1, "1 change in this release."],
    [2, "2 changes in this release."],
    [3, "3 changes in this release."],
  ])(
    "writes the dated page for %i changeset(s) byte for byte",
    (count, excerpt) => {
      expect(rotated(unreleased(count)).dated).toBe(`---
version: "1.0.0-beta.16"
date: "2026-11-21"
description: "What shipped in v1.0.0-beta.16"
excerpt: "${excerpt}"
---
${body(unreleased(count))}`);
    }
  );

  it("gives the dated page a released header, not the Unreleased one", () => {
    expect(frontmatter(rotated(unreleased(3)).dated)).toEqual({
      version: "1.0.0-beta.16",
      date: "2026-11-21",
      description: "What shipped in v1.0.0-beta.16",
      excerpt: "3 changes in this release.",
    });
  });

  it("names the file by date and version", () => {
    expect(rotated(unreleased(3)).fileName).toBe(
      "2026-11-21-v1.0.0-beta.16.mdx"
    );
  });

  it.each([
    ["a later --- line", "\n---\n\nAfter a rule.\n\n---\n"],
    [
      "the empty-stub excerpt line",
      '\n### Restore focus.\n\n    excerpt: "No changes since the last release."\n',
    ],
    ["the empty-stub sentence", `\n${PENDING_EMPTY_EXCERPT}\n`],
    ["CRLF line endings", "\r\n### Restore focus.\r\n\r\nText.\r\n"],
    ["no trailing newline", "\n### Restore focus."],
    ["nothing", ""],
  ])("copies a body holding %s byte for byte", (_label, rest) => {
    const source = `${syncHeader("1 change queued for the next release.")}${rest}`;
    const result = rotated(source);

    expect(result.dated.endsWith(`\n---\n${rest}`)).toBe(true);
    expect(body(result.dated)).toBe(rest);
    expect(frontmatter(result.dated).excerpt).toBe("1 change in this release.");
  });

  it("writes a fresh Unreleased stub that still reads as unreleased", () => {
    expect(rotated(unreleased(3)).stub).toBe(`---
date: "2026-11-21"
description: "What's coming in the next release"
excerpt: "No changes since the last release."
---

No changes merged since v1.0.0-beta.16.
`);
  });

  it("skips the empty stub", () => {
    expect(rotateChangelog(EMPTY_STUB, OPTIONS)).toEqual({ skipped: true });
  });

  it("accepts the largest safe count and writes it unchanged", () => {
    const source = `${syncHeader("9007199254740991 changes queued for the next release.")}${BODY}`;
    expect(frontmatter(rotated(source).dated).excerpt).toBe(
      "9007199254740991 changes in this release."
    );
  });
});

describe("rotateChangelog, out of contract", () => {
  it.each(OUT_OF_CONTRACT)(
    "refuses %s with one line that says to run sync first",
    (_label, source) => {
      let message = "";
      try {
        rotateChangelog(source, OPTIONS);
      } catch (error) {
        message = (error as Error).message;
      }
      expect(message).toMatch(RUN_SYNC_RE);
      expect(message).not.toMatch(LINE_BREAK_RE);
    }
  );

  // Reads and writes back unchanged, but is not a safe integer.
  it("refuses a count one past the largest safe integer (9007199254740992)", () => {
    const source = `${syncHeader("9007199254740992 changes queued for the next release.")}${BODY}`;
    expect(() => rotateChangelog(source, OPTIONS)).toThrow(RUN_SYNC_RE);
  });

  it("refuses a file that was already rotated", () => {
    const already = `---
version: "1.0.0-beta.15"
date: "2026-11-20"
description: "What shipped in v1.0.0-beta.15"
excerpt: "3 changes in this release."
---

Body.
`;
    expect(() => rotateChangelog(already, OPTIONS)).toThrow(ALREADY_ROTATED_RE);
    expect(() => rotateChangelog(already, OPTIONS)).toThrow(RUN_SYNC_RE);
  });
});

// The CLI prints the files it wrote relative to the checkout, with forward
// slashes on every platform. Windows paths are exercised through
// node:path's win32 functions, the ones node uses there.
describe("displayPath", () => {
  it.each([
    [
      "a Windows root with a space",
      win32,
      "C:\\work\\my checkout",
      "C:\\work\\my checkout\\apps\\docs\\content\\changelog\\unreleased.mdx",
    ],
    [
      "a Windows drive root",
      win32,
      "D:\\",
      "D:\\apps\\docs\\content\\changelog\\unreleased.mdx",
    ],
    [
      "a POSIX root with a space",
      posix,
      "/work/my checkout",
      "/work/my checkout/apps/docs/content/changelog/unreleased.mdx",
    ],
  ])("shortens a file under %s", (_label, pathApi, root, file) => {
    expect(displayPath(root, file, pathApi)).toBe(
      "apps/docs/content/changelog/unreleased.mdx"
    );
  });
});

describe("rotate-changelog CLI", () => {
  const temps: string[] = [];
  const version = "0.0.0-rotate-test.0";

  afterEach(() => {
    for (const dir of temps.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  /**
   * A throwaway tree shaped like the repo: the script, a minimal UI manifest
   * and a changelog folder holding only the given Unreleased file. No
   * committed page is copied, so no run can collide with one.
   */
  function scratchRepo(source = unreleased(1), repoName = "repo") {
    const base = mkdtempSync(join(tmpdir(), "ks-rotate-changelog-"));
    temps.push(base);
    const repo = join(base, repoName);
    const changelog = join(repo, "apps/docs/content/changelog");
    mkdirSync(join(repo, "scripts"), { recursive: true });
    mkdirSync(join(repo, "packages/ui"), { recursive: true });
    mkdirSync(changelog, { recursive: true });
    writeFileSync(
      join(repo, "scripts/rotate-changelog.mjs"),
      readFileSync(SCRIPT)
    );
    writeFileSync(
      join(repo, "packages/ui/package.json"),
      JSON.stringify({ name: "@keystoneui/react", version })
    );
    writeFileSync(join(changelog, "unreleased.mdx"), source);
    const link = join(base, "link");
    symlinkSync(repo, link, "dir");
    return { base, repo, link, changelog };
  }

  /** Every file in the folder with its bytes, for a before/after compare. */
  function snapshot(dir: string) {
    return readdirSync(dir)
      .sort()
      .map((name) => [name, readFileSync(join(dir, name), "latin1")]);
  }

  function run(args: string[], options: { input?: string } = {}) {
    return spawnSync(process.execPath, args, {
      encoding: "utf8",
      input: options.input,
      timeout: 30_000,
    });
  }

  it("rotates when run through a preserved symlink", () => {
    const { link, changelog } = scratchRepo();

    const result = run([
      "--preserve-symlinks-main",
      join(link, "scripts/rotate-changelog.mjs"),
    ]);

    expect(result.status, result.stderr).toBe(0);
    const names = readdirSync(changelog);
    expect(names).toHaveLength(2);
    const dated = names.find((n) => n.endsWith(`-v${version}.mdx`));
    expect(dated).toBeDefined();
    const source = readFileSync(join(changelog, dated as string), "utf8");
    expect(releasedHeaderProblems(source)).toEqual([]);
    // The generated page's name agrees with its header's date and version.
    const header = frontmatter(source);
    expect(dated).toBe(`${header.date}-v${header.version}.mdx`);
    expect(
      frontmatter(readFileSync(join(changelog, "unreleased.mdx"), "utf8"))
    ).toMatchObject({ excerpt: PENDING_EMPTY_EXCERPT });
  });

  it("rotates when run by its plain path", () => {
    const { repo, changelog } = scratchRepo();

    const result = run([join(repo, "scripts/rotate-changelog.mjs")]);

    expect(result.status, result.stderr).toBe(0);
    expect(readdirSync(changelog)).toHaveLength(2);
    expect(
      frontmatter(readFileSync(join(changelog, "unreleased.mdx"), "utf8"))
    ).toMatchObject({ excerpt: PENDING_EMPTY_EXCERPT });
  });

  // A checkout folder whose name a file URL percent-encodes: the script must
  // find its files under the real name, not under `my%20checkout`.
  it.each([
    ["a space", "my checkout"],
    ["a percent sign and a hash", "100% #1"],
  ])("rotates from a checkout path holding %s", (_label, repoName) => {
    const { repo, changelog } = scratchRepo(unreleased(1), repoName);

    const result = run([join(repo, "scripts/rotate-changelog.mjs")]);

    expect(result.status, result.stderr).toBe(0);
    expect(readdirSync(changelog)).toHaveLength(2);
    expect(result.stdout).toContain(
      "apps/docs/content/changelog/unreleased.mdx →"
    );
    expect(result.stdout).not.toContain(repo);
  });

  // The sentinel is the header's excerpt alone: a released change whose
  // notes quote the empty stub's excerpt line is still a release.
  it("rotates a release whose body quotes the empty stub's excerpt line", () => {
    const source = `${syncHeader("1 change queued for the next release.")}
## Patch changes

### Skip rotation for an empty stub.

A stub reads:

    excerpt: "No changes since the last release."

and quoted at the start of a line:

excerpt: "No changes since the last release."
`;
    const { repo, changelog } = scratchRepo(source);

    const result = run([join(repo, "scripts/rotate-changelog.mjs")]);

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).not.toContain("skipping");
    const dated = readdirSync(changelog).find((n) =>
      n.endsWith(`-v${version}.mdx`)
    );
    expect(dated).toBeDefined();
    const page = readFileSync(join(changelog, dated as string), "utf8");
    expect(frontmatter(page).excerpt).toBe("1 change in this release.");
    expect(body(page)).toBe(body(source));
  });

  it("skips the empty stub and leaves the folder as it was", () => {
    const { repo, changelog } = scratchRepo(EMPTY_STUB);
    const before = snapshot(changelog);

    const result = run([join(repo, "scripts/rotate-changelog.mjs")]);

    expect(result.status, result.stderr).toBe(0);
    expect(snapshot(changelog)).toEqual(before);
  });

  it.each(OUT_OF_CONTRACT)(
    "exits non-zero on %s and leaves the folder as it was",
    (_label, source) => {
      const { repo, changelog } = scratchRepo(source);
      const before = snapshot(changelog);

      const result = run([join(repo, "scripts/rotate-changelog.mjs")]);

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(RUN_SYNC_RE);
      expect(result.stderr.trimEnd().split("\n")).toHaveLength(1);
      expect(snapshot(changelog)).toEqual(before);
    }
  );

  it("exits non-zero through a preserved symlink when Unreleased is missing", () => {
    const { link, changelog } = scratchRepo();
    rmSync(join(changelog, "unreleased.mdx"));

    const result = run([
      "--preserve-symlinks-main",
      join(link, "scripts/rotate-changelog.mjs"),
    ]);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("not found");
  });

  it("exits non-zero through a preserved symlink on an already-rotated file", () => {
    const already = `---\nversion: "1.0.0-beta.15"\ndate: "2026-11-20"\n---\n\nBody.\n`;
    const { link, changelog } = scratchRepo(already);
    const before = snapshot(changelog);

    const result = run([
      "--preserve-symlinks-main",
      join(link, "scripts/rotate-changelog.mjs"),
    ]);

    expect(result.status).not.toBe(0);
    expect(snapshot(changelog)).toEqual(before);
  });

  it("does nothing and does not throw when imported from stdin", () => {
    const { repo, changelog } = scratchRepo();
    const before = snapshot(changelog);
    const url = pathToFileURL(join(repo, "scripts/rotate-changelog.mjs")).href;

    const result = run(["--input-type=module", "-"], {
      input: `const m = await import(${JSON.stringify(url)});\nconsole.log(typeof m.rotateChangelog);\n`,
    });

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe("function");
    expect(snapshot(changelog)).toEqual(before);
    expect(existsSync(join(changelog, "unreleased.mdx"))).toBe(true);
  });
});

describe("released-header check", () => {
  const RELEASED = 'version: "8.0.7"\ndate: "2026-11-21"';
  const page = (header: string) =>
    `---\n${header}\n---\n\n### Restore keyboard focus.\n`;

  it.each([
    [
      "the empty-stub excerpt",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: "No changes since the last release."`,
    ],
    [
      "a queued excerpt",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: "3 changes queued for the next release."`,
    ],
    [
      "a singular queued excerpt",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: "1 change queued for the next release."`,
    ],
    [
      "the pending description",
      `${RELEASED}\ndescription: "What's coming in the next release"\nexcerpt: "3 changes in this release."`,
    ],
    [
      "a folded (>-) pending description",
      `${RELEASED}\ndescription: >-\n  What's coming in the next release\nexcerpt: Fixes.`,
    ],
    [
      "a folded (>) pending description",
      `${RELEASED}\ndescription: >\n  What's coming in the next release\nexcerpt: Fixes.`,
    ],
    [
      "a folded (>-) queued excerpt over two lines",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: >-\n  1 change queued\n  for the next release.`,
    ],
    [
      "a folded (>) queued excerpt",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: >\n  2 changes queued for the next release.`,
    ],
    [
      "a literal (|) queued excerpt",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: |\n  1 change queued for the next release.`,
    ],
    [
      "a literal (|) empty-stub excerpt",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: |\n  No changes since the last release.`,
    ],
    [
      "a bare queued excerpt",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: 1 change queued for the next release.`,
    ],
    [
      "a single-quoted queued excerpt",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: '3 changes queued for the next release.'`,
    ],
    [
      "a pending excerpt text in the description",
      `${RELEASED}\ndescription: "3 changes queued for the next release."`,
    ],
    ["a missing description", `${RELEASED}\nexcerpt: Focus restored.`],
    [
      "a non-string description",
      `${RELEASED}\ndescription: [Focus, restored]\nexcerpt: Focus restored.`,
    ],
    [
      "an empty description",
      `${RELEASED}\ndescription: ""\nexcerpt: Focus restored.`,
    ],
  ])("rejects %s", (_label, header) => {
    expect(releasedHeaderProblems(page(header))).not.toEqual([]);
  });

  it("rejects an empty version", () => {
    const header = `version: ""\ndate: "2026-11-21"\ndescription: "What shipped"`;
    expect(releasedHeaderProblems(page(header))).toEqual(["version"]);
  });

  it.each([
    ["no excerpt", `${RELEASED}\ndescription: "What shipped in v8.0.7"`],
    [
      "an unquoted excerpt",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: More readable button labels.`,
    ],
    [
      "a hand-written excerpt containing Queued",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: "Queued uploads now resume after reconnecting."`,
    ],
    [
      "a hand-written excerpt about the next release",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: "Focus fixes coming in the next release."`,
    ],
    [
      "a count whose noun the generator would not write",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: "2 change queued for the next release."`,
    ],
    [
      "a released excerpt",
      `${RELEASED}\ndescription: "What shipped in v8.0.7"\nexcerpt: "3 changes in this release."`,
    ],
  ])("accepts %s", (_label, header) => {
    expect(releasedHeaderProblems(page(header))).toEqual([]);
  });
});

describe("dated changelog pages", () => {
  const audit = auditChangelogDir(CHANGELOG_DIR);
  const dated = Object.keys(audit);

  it("finds the dated pages", () => {
    expect(dated.length).toBeGreaterThan(10);
  });

  it.each(dated)("%s has a released header", (name) => {
    expect(audit[name]).toEqual([]);
  });
});

describe("dated-page audit on a scratch folder", () => {
  const temps: string[] = [];

  afterEach(() => {
    for (const dir of temps.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  /**
   * A throwaway changelog folder holding the given files (relative path to
   * contents), plus an `outside/` folder beside it for link targets.
   */
  function scratchChangelog(files: Record<string, string>) {
    const base = mkdtempSync(join(tmpdir(), "ks-changelog-audit-"));
    temps.push(base);
    const dir = join(base, "changelog");
    mkdirSync(join(base, "outside"));
    mkdirSync(dir);
    for (const [path, contents] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), contents);
    }
    return { base, dir, outside: join(base, "outside") };
  }

  const released = (version: string) => `---
version: "${version}"
date: "2032-02-29"
description: "What shipped in v${version}"
excerpt: "1 change in this release."
---

### Restore keyboard focus.
`;
  const pendingDescription = (version: string) => `---
version: "${version}"
date: "2032-02-29"
description: "What's coming in the next release"
excerpt: "1 change in this release."
---

### Restore keyboard focus.
`;

  it("selects the paths the site's glob loads, minus the top-level Unreleased page", () => {
    const { dir, outside } = scratchChangelog({
      "a.md": "x",
      "_draft.md": "x",
      "archive/b.mdx": "x",
      "dir.mdx/e.mdx": "x",
      "nested/unreleased.mdx": "x",
      "unreleased.mdx": "x",
      ".hidden.mdx": "x",
      ".hidden-dir/h.mdx": "x",
      "upper.MDX": "x",
      "notes.txt": "x",
      "readme.mdx.bak": "x",
    });
    mkdirSync(join(outside, "linked"));
    writeFileSync(join(outside, "linked/c.mdx"), "x");
    writeFileSync(join(outside, "f.md"), "x");
    symlinkSync(join(outside, "linked"), join(dir, "linked-directory"), "dir");
    symlinkSync(join(outside, "f.md"), join(dir, "linked-file.md"));
    symlinkSync(join(outside, "f.md"), join(dir, ".hidden-link.md"));
    symlinkSync(join(outside, "missing.mdx"), join(dir, "broken.mdx"));

    // What tinyglobby (the site's glob, via fumadocs-mdx) returns on the
    // same folder, without `unreleased.mdx`.
    expect(datedPagePaths(dir)).toEqual([
      "_draft.md",
      "a.md",
      "archive/b.mdx",
      "dir.mdx/e.mdx",
      "linked-directory/c.mdx",
      "linked-file.md",
      "nested/unreleased.mdx",
    ]);
  });

  it("fails a top-level .md page with the pending description", () => {
    const { dir } = scratchChangelog({
      "2032-02-29-v8.0.0.mdx": released("8.0.0"),
      "2032-02-29-v8.0.1.md": pendingDescription("8.0.1"),
    });
    expect(auditChangelogDir(dir)).toEqual({
      "2032-02-29-v8.0.0.mdx": [],
      "2032-02-29-v8.0.1.md": ["description"],
    });
  });

  it("fails a nested .mdx page with the pending description", () => {
    const { dir } = scratchChangelog({
      "2032-02-29-v8.0.0.mdx": released("8.0.0"),
      "archive/2032-02-29-v8.0.2.mdx": pendingDescription("8.0.2"),
    });
    expect(auditChangelogDir(dir)).toEqual({
      "2032-02-29-v8.0.0.mdx": [],
      "archive/2032-02-29-v8.0.2.mdx": ["description"],
    });
  });

  it("fails a page whose header ends at a ---note line, for a missing version", () => {
    const { dir } = scratchChangelog({
      "2032-02-29-v8.0.3.mdx": `---
date: "2032-02-29"
description: "What shipped in v8.0.3"
---note: public
version: "8.0.3"
---

### Restore keyboard focus.
`,
    });
    expect(auditChangelogDir(dir)).toEqual({
      "2032-02-29-v8.0.3.mdx": ["version"],
    });
  });

  it("audits every file inside a directory the glob matches by name", () => {
    const { dir } = scratchChangelog({
      "archive.mdx/release.md": released("8.0.4"),
      "archive.mdx/notes.txt": pendingDescription("8.0.5"),
    });
    expect(auditChangelogDir(dir)).toEqual({
      "archive.mdx/notes.txt": ["description"],
      "archive.mdx/release.md": [],
    });
  });

  it("leaves out a page the site's glob leaves out behind two directory links", () => {
    const { base, dir } = scratchChangelog({
      "visible.md": released("8.0.6"),
    });
    mkdirSync(join(base, "releases"));
    mkdirSync(join(base, "releases-v1"));
    writeFileSync(
      join(base, "releases-v1/release.md"),
      pendingDescription("8.0.7")
    );
    symlinkSync("../releases", join(dir, "history"), "dir");
    symlinkSync("../releases-v1", join(base, "releases/older"), "dir");
    expect(auditChangelogDir(dir)).toEqual({ "visible.md": [] });
  });

  it("skips a link through a file and still audits the page beside it", () => {
    const { dir } = scratchChangelog({
      "live.md": released("8.0.8"),
    });
    symlinkSync("live.md/missing", join(dir, "broken.mdx"));
    expect(auditChangelogDir(dir)).toEqual({ "live.md": [] });
  });
});
