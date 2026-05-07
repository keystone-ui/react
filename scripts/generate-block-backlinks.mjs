#!/usr/bin/env node

/**
 * Auto-generates "## Related Blocks" sections inside each component MDX
 * by inverting the "Components Used" list of every block MDX.
 *
 * Usage:
 *   node scripts/generate-block-backlinks.mjs           # apply
 *   node scripts/generate-block-backlinks.mjs --dry     # report only
 *
 * Idempotent: the injected section is fenced with HTML comments so
 * re-running replaces the contents in-place without disturbing anything
 * else on the page.
 *
 *   {/* backlinks:start *\/}
 *   ## Related Blocks
 *   - [Block](/docs/blocks/block-name) — description
 *   {/* backlinks:end *\/}
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const COMPONENTS_DIR = join(ROOT, "apps/docs/content/docs/components");
const BLOCKS_DIR = join(ROOT, "apps/docs/content/docs/blocks");

const FENCE_START = "{/* backlinks:start */}";
const FENCE_END = "{/* backlinks:end */}";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");

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

function extractComponentsUsed(content) {
  const match = content.match(/## Components Used\n([\s\S]*?)(?=\n## |$)/);
  if (!match) {
    return [];
  }
  const refs = [];
  const linkMatches = match[1].matchAll(
    /\[([^\]]+)\]\(\/docs\/components\/([a-z0-9-]+)\)/g
  );
  for (const m of linkMatches) {
    refs.push(m[2]);
  }
  return refs;
}

function buildBacklinksBlock(blocks) {
  const lines = [FENCE_START, "", "## Related Blocks", ""];
  for (const block of blocks) {
    const desc = block.description ?? "";
    if (desc) {
      lines.push(`- [${block.title}](/docs/blocks/${block.name}) — ${desc}`);
    } else {
      lines.push(`- [${block.title}](/docs/blocks/${block.name})`);
    }
  }
  lines.push("", FENCE_END);
  return lines.join("\n");
}

function injectBacklinks(content, block) {
  // Replace existing fenced block, or insert before ## API Reference.
  const fenceRegex = new RegExp(
    `${escapeRegex(FENCE_START)}[\\s\\S]*?${escapeRegex(FENCE_END)}`
  );
  if (fenceRegex.test(content)) {
    return content.replace(fenceRegex, block);
  }

  const apiIdx = content.indexOf("\n## API Reference");
  if (apiIdx !== -1) {
    return `${content.slice(0, apiIdx)}\n\n${block}${content.slice(apiIdx)}`;
  }

  // Fallback: append at end.
  return `${content.replace(/\n*$/, "")}\n\n${block}\n`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

function buildComponentToBlocksIndex() {
  const blockFiles = readdirSync(BLOCKS_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .sort();

  const index = new Map();
  for (const file of blockFiles) {
    const blockName = basename(file, ".mdx");
    const content = readFileSync(join(BLOCKS_DIR, file), "utf-8");
    const fm = parseFrontmatter(content);
    if (!fm) {
      continue;
    }
    const used = extractComponentsUsed(content);
    for (const componentName of used) {
      if (!index.has(componentName)) {
        index.set(componentName, []);
      }
      index.get(componentName).push({
        name: blockName,
        title: fm.title ?? blockName,
        description: fm.description ?? "",
      });
    }
  }
  return index;
}

function processComponentFile(content, blocks) {
  if (blocks && blocks.length > 0) {
    return injectBacklinks(content, buildBacklinksBlock(blocks));
  }
  // No blocks — strip any stale fenced section.
  const fenceRegex = new RegExp(
    `\\n*${escapeRegex(FENCE_START)}[\\s\\S]*?${escapeRegex(FENCE_END)}\\n*`
  );
  return content.replace(fenceRegex, "\n");
}

function main() {
  const componentToBlocks = buildComponentToBlocksIndex();

  const componentFiles = readdirSync(COMPONENTS_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .sort();

  let changed = 0;
  for (const file of componentFiles) {
    const componentName = basename(file, ".mdx");
    const blocks = componentToBlocks.get(componentName);
    const filePath = join(COMPONENTS_DIR, file);
    const content = readFileSync(filePath, "utf-8");
    const next = processComponentFile(content, blocks);

    if (next !== content) {
      changed += 1;
      const blockCount = blocks ? blocks.length : 0;
      console.log(
        `  ${dryRun ? "(dry) " : ""}${componentName}: ${blockCount} backlink${blockCount === 1 ? "" : "s"}`
      );
      if (!dryRun) {
        writeFileSync(filePath, next);
      }
    }
  }

  console.log("");
  console.log(
    `${dryRun ? "Would update" : "Updated"} ${changed} component MDX file(s).`
  );
}

main();
