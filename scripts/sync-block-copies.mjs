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
 * Single-file blocks (`apps/docs/demos/blocks/<name>.tsx`, e.g. signin-01)
 * are generated too. The demo wraps the real component in a default-exported
 * preview shell; the registry copy is that component alone, exported by name
 * (`export function SignInForm`) and written to the one `registry:component`
 * path `registry.json` lists for the block. The default export is dropped --
 * in a consumer's app the hand-written `page.tsx` plays that role.
 *
 * `page.tsx` is deliberately NOT generated. It is four lines, written once per
 * block, and inferring it from `index.tsx` would mean guessing the exported
 * component name -- so it stays hand-written and is left alone here.
 *
 * The rewrites change import specifiers, which changes their sort order, so
 * the output is passed through the repo formatter (biome, via ultracite)
 * before comparison. Without that step every file would differ on ordering
 * alone and --check would be useless.
 *
 * --check therefore generates into the *real* target directory and restores
 * the previous contents afterwards, rather than into a scratch dir. Biome
 * resolves its configuration from the file's location upward, and biome.jsonc
 * carries path-scoped overrides (the vendored chart layer among them), so a
 * temp directory outside the repo is formatted under different rules and the
 * comparison is meaningless.
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative } from "node:path";

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
const REGISTRY_JSON = join(ROOT, "registry.json");
/** The demo-only preview shell: the default export, always the file's tail. */
const DEFAULT_EXPORT_RE =
  /\n(?:\/\*\*[\s\S]*?\*\/\s*)?export default function \w+\([^)]*\)\s*\{[\s\S]*\}\s*$/;
const JSX_COMPONENT_RE = /<([A-Z][A-Za-z0-9]*)\b/g;

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

function listSingleFileBlockNames(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((entry) => entry.endsWith(".tsx"))
    .filter((entry) => statSync(join(dir, entry)).isFile())
    .map((entry) => entry.replace(/\.tsx$/, ""))
    .sort();
}

/** The single `registry:component` file `registry.json` lists for a block. */
function registryComponentPath(blockName) {
  const registry = JSON.parse(readFileSync(REGISTRY_JSON, "utf-8"));
  const item = registry.items.find((entry) => entry.name === blockName);
  if (!item) {
    throw new Error(`registry.json has no item named "${blockName}"`);
  }
  const components = (item.files ?? []).filter(
    (file) => file.type === "registry:component"
  );
  if (components.length !== 1) {
    throw new Error(
      `${blockName}: a single-file block needs exactly one registry:component file in registry.json, found ${components.length}`
    );
  }
  return join(ROOT, components[0].path);
}

/**
 * Turn a single-file demo into the installable component: drop the default
 * preview shell and export, by name, the component that shell renders.
 */
function toRegistryComponent(source, blockName) {
  const shell = DEFAULT_EXPORT_RE.exec(source);
  if (!shell) {
    throw new Error(
      `${blockName}: expected the demo to end in \`export default function\``
    );
  }
  const body = source.slice(0, shell.index);
  const declared = new Set(
    [...body.matchAll(/^function ([A-Z][A-Za-z0-9]*)\(/gm)].map((m) => m[1])
  );
  const rendered = [...shell[0].matchAll(JSX_COMPONENT_RE)]
    .map((m) => m[1])
    .find((name) => declared.has(name));
  if (!rendered) {
    throw new Error(
      `${blockName}: the default export must render a component declared in the same file`
    );
  }
  const exported = body.replace(
    new RegExp(`^function ${rendered}\\(`, "m"),
    `export function ${rendered}(`
  );
  return `${rewriteImports(exported).trimEnd()}\n`;
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
  const files = listSourceFiles(demoDir);
  mkdirSync(outDir, { recursive: true });

  for (const file of files) {
    const source = readFileSync(join(demoDir, file), "utf-8");
    writeFileSync(join(outDir, file), rewriteImports(source));
  }

  // Remove anything whose demo counterpart is gone. Without this a deleted
  // file keeps shipping to consumers, which is how a block ends up installing
  // a component nothing imports.
  const expected = new Set(files);
  for (const file of listSourceFiles(outDir)) {
    if (!expected.has(file)) {
      rmSync(join(outDir, file), { force: true });
    }
  }

  format(outDir);
  return files;
}

function generateSingleFile(blockName, outFile) {
  const source = readFileSync(join(DEMOS_DIR, `${blockName}.tsx`), "utf-8");
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, toRegistryComponent(source, blockName));
  format(outFile);
  return [basename(outFile)];
}

/** Problems with one block's committed registry copy, if any. */
function checkBlock(blockName, single = false) {
  const target = single
    ? dirname(registryComponentPath(blockName))
    : join(REGISTRY_DIR, blockName, "components");
  const problems = [];

  // Snapshot, regenerate in place, compare, restore. Generating elsewhere
  // would be formatted under different biome rules -- see the note at the top.
  const before = existsSync(target)
    ? new Map(
        listSourceFiles(target).map((file) => [
          file,
          readFileSync(join(target, file), "utf-8"),
        ])
      )
    : new Map();

  try {
    const files = single
      ? generateSingleFile(blockName, registryComponentPath(blockName))
      : generate(blockName, target);

    for (const file of files) {
      const committed = before.get(file);
      if (committed === undefined) {
        problems.push(`${relative(ROOT, join(target, file))} — missing`);
        continue;
      }
      if (readFileSync(join(target, file), "utf-8") !== committed) {
        problems.push(`${relative(ROOT, join(target, file))} — out of date`);
      }
    }

    // A file left behind after its demo counterpart was deleted still ships.
    const expected = new Set(files);
    for (const file of before.keys()) {
      if (!expected.has(file)) {
        problems.push(
          `${relative(ROOT, join(target, file))} — no matching demo file`
        );
      }
    }
  } finally {
    // Restore exactly what was committed, including files the generator would
    // not have produced.
    for (const file of listSourceFiles(target)) {
      if (!before.has(file)) {
        rmSync(join(target, file), { force: true });
      }
    }
    for (const [file, content] of before) {
      writeFileSync(join(target, file), content);
    }
  }

  return problems;
}

function runCheck(blocks, singles) {
  const problems = [
    ...blocks.flatMap((blockName) => checkBlock(blockName)),
    ...singles.flatMap((blockName) => checkBlock(blockName, true)),
  ];

  if (problems.length > 0) {
    process.stderr.write(
      `FAIL — ${problems.length} registry block file(s) out of sync with their demos:\n` +
        `${problems.map((problem) => `  - ${problem}`).join("\n")}\n\n` +
        "Run `pnpm sync:blocks` to regenerate.\n"
    );
    process.exit(1);
  }

  process.stdout.write(
    `OK — ${blocks.length + singles.length} block(s) in sync with their demos.\n`
  );
}

function runSync(blocks, singles) {
  let written = 0;
  for (const blockName of blocks) {
    written += generate(
      blockName,
      join(REGISTRY_DIR, blockName, "components")
    ).length;
  }
  for (const blockName of singles) {
    written += generateSingleFile(
      blockName,
      registryComponentPath(blockName)
    ).length;
  }
  process.stdout.write(
    `OK — synced ${written} file(s) across ${blocks.length + singles.length} block(s).\n`
  );
}

function main() {
  const blocks = listBlockNames(DEMOS_DIR);
  const singles = listSingleFileBlockNames(DEMOS_DIR);
  if (process.argv.includes("--check")) {
    runCheck(blocks, singles);
    return;
  }
  runSync(blocks, singles);
}

main();
