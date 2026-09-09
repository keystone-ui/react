#!/usr/bin/env node
/**
 * Generate each block's installable registry copy from its docs demo.
 *
 * Every block exists twice:
 *
 *   apps/docs/demos/blocks/<name>/*        the live preview, importing
 *                                          @keystoneui/react/* and ./siblings
 *   registry/default/blocks/<name>/        what `shadcn add` writes into a
 *     components/*                         consumer's app, importing
 *                                          @/components/ui/* and @/components/*
 *
 * The two differ only by mechanical import rewrites, and were previously kept
 * in step by hand -- roughly 2,000 lines per block, with nothing in the repo
 * noticing when an edit landed in only one of them. This applies the rewrites,
 * so the demo is the single source of truth.
 *
 *   node scripts/sync-block-copies.mjs           write the registry copies
 *   node scripts/sync-block-copies.mjs --check   fail if they are out of date
 *
 * `page.tsx` is deliberately NOT generated. It is four lines, written once per
 * block, and inferring it from `index.tsx` would mean guessing the exported
 * component name -- so it stays hand-written and is left alone here.
 *
 * The rewrites change import specifiers, which changes their sort order, so
 * the output is passed through the repo formatter (biome, via ultracite)
 * before comparison. Without that step every file would differ on ordering
 * alone and --check would be useless.
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const DEMOS_DIR = join(ROOT, "apps/docs/demos/blocks");
const REGISTRY_DIR = join(ROOT, "registry/default/blocks");

/** The entry file, which pairs with a hand-written page.tsx. */
const ENTRY_FILE = "index.tsx";

const KEYSTONE_UTILS_RE = /(["'])@keystoneui\/react\/utils\1/g;
const KEYSTONE_COMPONENT_RE = /(["'])@keystoneui\/react\/([a-z0-9-]+)\1/g;
const RELATIVE_IMPORT_RE = /(from\s*["'])\.\/([^"']+)(["'])/g;
const LUCIDE_BLOCK_RE = /import\s*\{([^}]*)\}\s*from\s*(["'])lucide-react\2/g;
const LUCIDE_ALIAS_RE = /\b[A-Za-z0-9_]+\s+as\s+([A-Za-z0-9_]+)/g;
const SOURCE_FILE_RE = /\.(tsx?|ts)$/;

/**
 * Demos import the base name and alias it (`Table as TableIcon`) so the
 * identifier does not collide with a component of the same name. lucide also
 * exports the `*Icon` name directly, and the registry copies use that, so the
 * alias is redundant there.
 */
function deAliasLucide(source) {
  return source.replace(LUCIDE_BLOCK_RE, (match, specifiers) =>
    match.replace(specifiers, specifiers.replace(LUCIDE_ALIAS_RE, "$1"))
  );
}

function rewriteImports(source) {
  let out = source;
  // `utils` is the one keystone subpath that does not land under components/ui.
  out = out.replace(KEYSTONE_UTILS_RE, "$1@/lib/utils$1");
  out = out.replace(KEYSTONE_COMPONENT_RE, "$1@/components/ui/$2$1");
  // Sibling files land flat in the consumer's components directory.
  out = out.replace(RELATIVE_IMPORT_RE, "$1@/components/$2$3");
  return deAliasLucide(out);
}

function listBlockNames(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((entry) => statSync(join(dir, entry)).isDirectory())
    .sort();
}

function listSourceFiles(dir) {
  return readdirSync(dir)
    .filter((entry) => statSync(join(dir, entry)).isFile())
    .filter((entry) => SOURCE_FILE_RE.test(entry))
    .filter((entry) => entry !== ENTRY_FILE)
    .sort();
}

/**
 * Format a directory in place with the repo's own formatter, so generated
 * output is compared against committed output on equal terms.
 */
function format(dir) {
  try {
    execFileSync(
      "npx",
      [
        "biome",
        "check",
        "--write",
        "--unsafe",
        "--no-errors-on-unmatched",
        dir,
      ],
      { cwd: ROOT, stdio: "pipe" }
    );
  } catch {
    // biome exits non-zero on findings it cannot fix. The formatting we need
    // has still been applied, and lint findings are `pnpm check`'s job.
  }
}

function generate(blockName, outDir) {
  const demoDir = join(DEMOS_DIR, blockName);
  mkdirSync(outDir, { recursive: true });
  for (const file of listSourceFiles(demoDir)) {
    const source = readFileSync(join(demoDir, file), "utf-8");
    writeFileSync(join(outDir, file), rewriteImports(source));
  }
  format(outDir);
  return listSourceFiles(demoDir);
}

/** Problems with one block's committed registry copy, if any. */
function checkBlock(blockName) {
  const target = join(REGISTRY_DIR, blockName, "components");
  const scratch = mkdtempSync(join(tmpdir(), `block-${blockName}-`));
  const problems = [];

  try {
    const files = generate(blockName, scratch);

    for (const file of files) {
      const committedPath = join(target, file);
      if (!existsSync(committedPath)) {
        problems.push(`${relative(ROOT, committedPath)} — missing`);
        continue;
      }
      const expected = readFileSync(join(scratch, file), "utf-8");
      if (readFileSync(committedPath, "utf-8") !== expected) {
        problems.push(`${relative(ROOT, committedPath)} — out of date`);
      }
    }

    // A file left behind after its demo counterpart was deleted still ships.
    if (existsSync(target)) {
      const expected = new Set(files);
      for (const file of listSourceFiles(target)) {
        if (!expected.has(file)) {
          problems.push(
            `${relative(ROOT, join(target, file))} — no matching demo file`
          );
        }
      }
    }
  } finally {
    rmSync(scratch, { force: true, recursive: true });
  }

  return problems;
}

function runCheck(blocks) {
  const problems = blocks.flatMap((blockName) => checkBlock(blockName));

  if (problems.length > 0) {
    process.stderr.write(
      `FAIL — ${problems.length} registry block file(s) out of sync with their demos:\n` +
        `${problems.map((problem) => `  - ${problem}`).join("\n")}\n\n` +
        "Run `pnpm sync:blocks` to regenerate.\n"
    );
    process.exit(1);
  }

  process.stdout.write(
    `OK — ${blocks.length} block(s) in sync with their demos.\n`
  );
}

function runSync(blocks) {
  let written = 0;
  for (const blockName of blocks) {
    written += generate(
      blockName,
      join(REGISTRY_DIR, blockName, "components")
    ).length;
  }
  process.stdout.write(
    `OK — synced ${written} file(s) across ${blocks.length} block(s).\n`
  );
}

function main() {
  const blocks = listBlockNames(DEMOS_DIR);
  if (process.argv.includes("--check")) {
    runCheck(blocks);
    return;
  }
  runSync(blocks);
}

main();
