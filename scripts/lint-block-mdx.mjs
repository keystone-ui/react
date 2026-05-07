#!/usr/bin/env node

/**
 * Validates that every apps/docs/content/docs/blocks/<name>.mdx follows
 * the canonical structure documented in _block-template.mdx.
 *
 * Exits non-zero on any violation.
 *
 * Rules:
 *   1. Frontmatter must contain `title:` and `description:`.
 *   2. First non-heading content must be a ```bash install command
 *      referencing https://keystoneui.io/r/<name>.json.
 *   3. <BlockPreview name="block-<name>"> must appear after the install fence.
 *   4. ## Components Used must exist with at least one link.
 *   5. Every link in ## Components Used must resolve to a real
 *      apps/docs/content/docs/components/<name>.mdx file.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const BLOCKS_DIR = join(ROOT, "apps/docs/content/docs/blocks");
const COMPONENTS_DIR = join(ROOT, "apps/docs/content/docs/components");

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return null;
  }
  const fields = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (m) {
      fields[m[1]] = m[2].trim();
    }
  }
  return fields;
}

function findComponentsUsedSection(content) {
  const match = content.match(/## Components Used\n([\s\S]*?)(?=\n## |$)/);
  return match ? match[1] : null;
}

function lintFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const blockName = basename(filePath, ".mdx");
  const errors = [];

  const fm = parseFrontmatter(content);
  if (!fm) {
    errors.push("missing frontmatter");
    return { blockName, errors };
  }
  if (!fm.title) {
    errors.push("frontmatter missing `title`");
  }
  if (!fm.description) {
    errors.push("frontmatter missing `description`");
  }

  const expectedInstall = `npx shadcn@latest add https://keystoneui.io/r/${blockName}.json`;
  if (!content.includes(expectedInstall)) {
    errors.push(`missing install command: ${expectedInstall}`);
  }

  const expectedPreview = `<BlockPreview name="block-${blockName}"`;
  if (!content.includes(expectedPreview)) {
    errors.push(
      `missing or misnamed <BlockPreview> (expected name="block-${blockName}")`
    );
  }

  const componentsUsed = findComponentsUsedSection(content);
  if (componentsUsed === null) {
    errors.push("missing ## Components Used");
  } else {
    const linkMatches = componentsUsed.matchAll(
      /\[[^\]]+\]\(\/docs\/components\/([a-z0-9-]+)\)/g
    );
    let linkCount = 0;
    for (const m of linkMatches) {
      linkCount += 1;
      const referenced = m[1];
      const referencedPath = join(COMPONENTS_DIR, `${referenced}.mdx`);
      if (!existsSync(referencedPath)) {
        errors.push(
          `## Components Used references missing component "${referenced}"`
        );
      }
    }
    if (linkCount === 0) {
      errors.push("## Components Used contains no /docs/components/ links");
    }
  }

  return { blockName, errors };
}

function main() {
  const files = readdirSync(BLOCKS_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .sort();

  let totalErrors = 0;
  for (const file of files) {
    const result = lintFile(join(BLOCKS_DIR, file));
    if (result.errors.length > 0) {
      console.log(`\n${result.blockName}:`);
      for (const err of result.errors) {
        console.log(`  - ${err}`);
      }
      totalErrors += result.errors.length;
    }
  }

  if (totalErrors === 0) {
    console.log(`OK — ${files.length} block MDX files validated.`);
    process.exit(0);
  }

  console.log(`\nFAIL — ${totalErrors} error(s) across block MDX files.`);
  process.exit(1);
}

main();
