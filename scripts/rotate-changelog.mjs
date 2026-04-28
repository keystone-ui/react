#!/usr/bin/env node

/**
 * Post-bump changelog rotation.
 *
 * Runs after `changeset version` (chained via `pnpm version-packages`).
 * Renames the floating Unreleased entry to a versioned, dated file and
 * drops a fresh empty Unreleased stub so the next round has a target.
 *
 * Reads the bumped version from `packages/ui/package.json`. Errors out if
 * `unreleased.mdx` is missing — that means rotation already ran, or someone
 * deleted it by hand and there's nothing to rotate.
 *
 * Does not stage anything in git: the human reviews the rename + new stub
 * alongside the version-bump diff before committing.
 */

import {
  existsSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

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
const targetName = `${today}-v${pkgVersion}.mdx`;
const target = join(CHANGELOG_DIR, targetName);

if (existsSync(target)) {
  fail(`${target} already exists — refusing to overwrite`);
}

const original = readFileSync(UNRELEASED, "utf8");
const fmMatch = original.match(/^---\n([\s\S]*?)\n---\n?/);
if (!fmMatch) {
  fail(`${UNRELEASED} is missing YAML frontmatter`);
}

const [, fmBody] = fmMatch;
const rest = original.slice(fmMatch[0].length);
const fmLines = fmBody.split("\n");

const dateLineIdx = fmLines.findIndex((l) => /^date:\s/.test(l));
const versionLineIdx = fmLines.findIndex((l) => /^version:\s/.test(l));

if (versionLineIdx !== -1) {
  fail(
    `${UNRELEASED} already has a version field — was it already rotated?`
  );
}

if (dateLineIdx === -1) {
  fmLines.unshift(`date: "${today}"`);
} else {
  fmLines[dateLineIdx] = `date: "${today}"`;
}

fmLines.unshift(`version: "${pkgVersion}"`);

const stamped = `---\n${fmLines.join("\n")}\n---\n${rest}`;
writeFileSync(UNRELEASED, stamped);
renameSync(UNRELEASED, target);

const stub = `---
date: "${today}"
description: "What's coming in the next release"
excerpt: "No changes since the last release."
---

No changes merged since v${pkgVersion}.
`;
writeFileSync(UNRELEASED, stub);

console.log(`✓ rotated changelog`);
console.log(`  ${UNRELEASED.replace(`${ROOT}/`, "")} → ${target.replace(`${ROOT}/`, "")}`);
console.log(`  fresh stub at ${UNRELEASED.replace(`${ROOT}/`, "")}`);
console.log(`  review with: git status apps/docs/content/changelog/`);
