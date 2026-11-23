#!/usr/bin/env node

/**
 * Post-bump changelog rotation.
 *
 * Runs after `changeset version` (chained via `pnpm version-packages`, which
 * runs `sync-unreleased.mjs` first). Renames the floating Unreleased entry to
 * a versioned, dated file and drops a fresh empty Unreleased stub so the next
 * round has a target.
 *
 * Accepts one input: `unreleased.mdx` exactly as `sync-unreleased.mjs` writes
 * it. The header is five LF-terminated lines: `---`, `date`, the generator's
 * `description`, the generator's `excerpt` (the empty-stub sentence or
 * "N change(s) queued for the next release."), `---`, every value on one line
 * in double quotes. N must be a safe integer that prints back as the same
 * digits. Anything else is refused before any write, with one line
 * naming the first unexpected thing and saying to run `pnpm sync-unreleased`
 * first. The body after the closing fence is copied byte for byte.
 *
 * The dated file gets a released header: `version`, the release `date`,
 * "What shipped in vX" and "N changes in this release.".
 *
 * Skips rotation entirely when the header's excerpt is the empty stub's
 * ("No changes since the last release."; the body is not searched). That
 * signals the bump didn't touch `@keystoneui/react` (e.g. an mcp-only
 * release) — the docs changelog only tracks react releases.
 *
 * Reads the bumped version from `packages/ui/package.json`. Errors out if
 * `unreleased.mdx` is missing — rotation already ran, or the file was deleted.
 * Does not stage anything in git: the human reviews the rename + new stub
 * alongside the version-bump diff before committing.
 *
 * `rotateChangelog` is the pure part, exported for
 * `apps/docs/tests/rotate-changelog.test.ts`; importing this module does
 * not touch the filesystem.
 */

import {
  existsSync,
  readFileSync,
  realpathSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// The header sync-unreleased.mjs writes, line by line: what to call each
// line in an error, and the pattern it must match.
const HEADER = [
  ["the opening `---`", /^---$/],
  ['`date: "YYYY-MM-DD"`', /^date: "\d{4}-\d{2}-\d{2}"$/],
  [
    "sync-unreleased's `description`",
    /^description: "What's coming in the next release"$/,
  ],
  ['`excerpt: "…"` on one line', /^excerpt: "([^"]*)"$/],
  ["the closing `---`", /^---$/],
];
const VERSION_RE = /^\s*["']?version["']?\s*:/;
// The excerpt sync-unreleased writes when no @keystoneui/react changesets
// are queued: this bump didn't release react, so there's nothing to rotate.
const EMPTY_EXCERPT = "No changes since the last release.";
// The excerpt it writes for N pending changes, singular or plural to match.
const QUEUED_EXCERPT_RE =
  /^([1-9]\d*) (changes?) queued for the next release\.$/;

/** Header of a released page, e.g. "What shipped in v1.0.0-beta.16". */
export function releasedDescription(version) {
  return `What shipped in v${version}`;
}

/** Excerpt of a released page, e.g. "3 changes in this release.". */
export function releasedExcerpt(count) {
  return `${count} change${count === 1 ? "" : "s"} in this release.`;
}

function refuse(what) {
  throw new Error(
    `unreleased.mdx is not what sync-unreleased writes: ${what}; run \`pnpm sync-unreleased\` first`
  );
}

/**
 * Turns the Unreleased source into a dated page and a fresh stub.
 * Returns `{ skipped: true }` for the empty stub; throws on anything
 * sync-unreleased.mjs does not write.
 */
export function rotateChangelog(original, { version, today }) {
  const lines = original.split("\n", HEADER.length);
  for (const [i, [label, pattern]] of HEADER.entries()) {
    const line = lines[i];
    if (line === undefined) {
      refuse(`the file ends before ${label}`);
    }
    if (VERSION_RE.test(line)) {
      refuse("it already has a version field — was it already rotated?");
    }
    if (line.includes("\r")) {
      refuse(`line ${i + 1} ends in CRLF`);
    }
    if (!pattern.test(line)) {
      refuse(
        `line ${i + 1} is ${JSON.stringify(line.slice(0, 80))}, expected ${label}`
      );
    }
  }
  const headerLength = lines.join("\n").length + 1;
  if (original.length < headerLength) {
    refuse("no line break after the closing `---`");
  }

  const excerpt = lines[3].match(HEADER[3][1])[1];
  if (excerpt === EMPTY_EXCERPT) {
    return { skipped: true };
  }
  const queued = excerpt.match(QUEUED_EXCERPT_RE);
  const count = Number(queued?.[1]);
  if (!queued || (count === 1) !== (queued[2] === "change")) {
    refuse(`the excerpt ${JSON.stringify(excerpt)} is not one it writes`);
  }
  // The count must survive being read and written: a safe integer that
  // prints back as the same digits.
  if (!Number.isSafeInteger(count) || String(count) !== queued[1]) {
    refuse(`the count ${queued[1]} does not survive being read as a number`);
  }

  const dated = `---
version: "${version}"
date: "${today}"
description: "${releasedDescription(version)}"
excerpt: "${releasedExcerpt(count)}"
---
${original.slice(headerLength)}`;
  const stub = `---
date: "${today}"
description: "What's coming in the next release"
excerpt: "No changes since the last release."
---

No changes merged since v${version}.
`;

  return { skipped: false, fileName: `${today}-v${version}.mdx`, dated, stub };
}

function main() {
  const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
  const UI_PKG = join(ROOT, "packages/ui/package.json");
  const CHANGELOG_DIR = join(ROOT, "apps/docs/content/changelog");
  const UNRELEASED = join(CHANGELOG_DIR, "unreleased.mdx");

  function fail(msg) {
    console.error(`rotate-changelog: ${msg}`);
    process.exit(1);
  }

  const pkgVersion = JSON.parse(readFileSync(UI_PKG, "utf8")).version;
  if (!pkgVersion) {
    fail(`could not read version from ${UI_PKG}`);
  }

  if (!existsSync(UNRELEASED)) {
    fail(
      `${UNRELEASED} not found — rotation may have already run, or the file was deleted`
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const original = readFileSync(UNRELEASED, "utf8");

  let result;
  try {
    result = rotateChangelog(original, { version: pkgVersion, today });
  } catch (error) {
    fail(error.message);
  }

  if (result.skipped) {
    console.log(
      "✓ rotate-changelog: no @keystoneui/react changes queued — skipping rotation"
    );
    return;
  }

  const target = join(CHANGELOG_DIR, result.fileName);
  if (existsSync(target)) {
    fail(`${target} already exists — refusing to overwrite`);
  }

  writeFileSync(UNRELEASED, result.dated);
  renameSync(UNRELEASED, target);
  writeFileSync(UNRELEASED, result.stub);

  console.log("✓ rotated changelog");
  console.log(
    `  ${UNRELEASED.replace(`${ROOT}/`, "")} → ${target.replace(`${ROOT}/`, "")}`
  );
  console.log(`  fresh stub at ${UNRELEASED.replace(`${ROOT}/`, "")}`);
  console.log("  review with: git status apps/docs/content/changelog/");
}

/**
 * True when this file is the program node was started with. Both sides are
 * resolved: with `--preserve-symlinks-main` `import.meta.url` keeps a
 * symlinked path, without it `process.argv[1]` does, and a mismatch would
 * skip the rotation without a word. A caller with no file path (`node -e`,
 * a module read from stdin) is not this file.
 */
function isEntryPoint() {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  let entryPath;
  try {
    entryPath = realpathSync(entry);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      return false;
    }
    throw error;
  }
  return entryPath === realpathSync(fileURLToPath(import.meta.url));
}

if (isEntryPoint()) {
  main();
}
