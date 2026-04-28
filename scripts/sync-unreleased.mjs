#!/usr/bin/env node

/**
 * Auto-syncs `apps/docs/content/changelog/unreleased.mdx` from
 * unconsumed `.changeset/*.md` files so the docs `/changelog` page
 * always reflects what's queued for the next release without manual
 * editing.
 *
 * Pairs with `scripts/rotate-changelog.mjs`:
 *   1. `pnpm version-packages` runs this BEFORE `changeset version` so
 *      the rotated dated mdx inherits real auto-generated content.
 *   2. After `changeset version` consumes/marks the changesets, the
 *      rotate script renames unreleased.mdx → dated.mdx and writes a
 *      fresh empty stub. Re-running this script in that state would
 *      produce an identical empty stub (idempotent).
 *
 * Pre-release mode: `.changeset/pre.json.changesets[]` lists changesets
 * already rolled into a prior bump. Those are excluded so they don't
 * resurrect in Unreleased.
 */

import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const CHANGESET_DIR = join(ROOT, ".changeset");
const PRE_JSON = join(CHANGESET_DIR, "pre.json");
const UI_PKG = join(ROOT, "packages/ui/package.json");
const UNRELEASED = join(
  ROOT,
  "apps/docs/content/changelog/unreleased.mdx"
);

const IGNORED_FILES = new Set(["README.md"]);
const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
const BUMP_RE = /^"?([@a-zA-Z0-9/_-]+)"?\s*:\s*(major|minor|patch)\s*$/gm;

function fail(msg) {
  console.error(`sync-unreleased: ${msg}`);
  process.exit(1);
}

const pkgVersion = JSON.parse(readFileSync(UI_PKG, "utf8")).version;
if (!pkgVersion) {
  fail(`could not read version from ${UI_PKG}`);
}

const today = new Date().toISOString().slice(0, 10);

let consumed = new Set();
if (existsSync(PRE_JSON)) {
  const pre = JSON.parse(readFileSync(PRE_JSON, "utf8"));
  consumed = new Set(pre.changesets ?? []);
}

const allChangesetFiles = readdirSync(CHANGESET_DIR).filter(
  (f) => f.endsWith(".md") && !IGNORED_FILES.has(f)
);

const unconsumed = allChangesetFiles.filter(
  (f) => !consumed.has(f.replace(/\.md$/, ""))
);

const buckets = { major: [], minor: [], patch: [] };
const packagesTouched = new Set();

for (const file of unconsumed) {
  const raw = readFileSync(join(CHANGESET_DIR, file), "utf8");
  const fmMatch = raw.match(FRONTMATTER_RE);
  if (!fmMatch) {
    continue;
  }
  const [, fm, body] = fmMatch;

  let highest = null;
  for (const [, pkg, bump] of fm.matchAll(BUMP_RE)) {
    packagesTouched.add(pkg);
    if (bump === "major") {
      highest = "major";
    } else if (bump === "minor" && highest !== "major") {
      highest = "minor";
    } else if (bump === "patch" && highest === null) {
      highest = "patch";
    }
  }

  if (highest === null) {
    continue;
  }

  const trimmed = body.trim();
  if (!trimmed) {
    continue;
  }

  buckets[highest].push(trimmed);
}

const total =
  buckets.major.length + buckets.minor.length + buckets.patch.length;

function renderEntry(rawBody) {
  const lines = rawBody.split("\n");
  const firstLine = lines[0].trim().replace(/^\*\*/, "").replace(/\*\*$/, "");
  const rest = lines.slice(1).join("\n").trim();
  return rest ? `### ${firstLine}\n\n${rest}` : `### ${firstLine}`;
}

function renderSection(label, entries) {
  if (entries.length === 0) {
    return null;
  }
  const rendered = entries.map(renderEntry).join("\n\n---\n\n");
  return `## ${label}\n\n${rendered}`;
}

const sections = [
  renderSection("Major changes", buckets.major),
  renderSection("Minor changes", buckets.minor),
  renderSection("Patch changes", buckets.patch),
].filter(Boolean);

const empty = total === 0;
const excerpt = empty
  ? "No changes since the last release."
  : `${total} change${total === 1 ? "" : "s"} queued for the next release.`;

const body = empty
  ? `No changes merged since v${pkgVersion}.\n`
  : `${sections.join("\n\n")}\n`;

const output = `---
date: "${today}"
description: "What's coming in the next release"
excerpt: "${excerpt}"
---

${body}`;

writeFileSync(UNRELEASED, output);

if (empty) {
  console.log("✓ synced unreleased.mdx (empty stub — no unconsumed changesets)");
} else {
  console.log(
    `✓ synced unreleased.mdx (${total} change${total === 1 ? "" : "s"} from ${unconsumed.length} changeset${unconsumed.length === 1 ? "" : "s"})`
  );
}
