#!/usr/bin/env node

/**
 * Rewrites `./utils` imports in the built registry output.
 *
 * Usage:
 *   node scripts/fix-registry-imports.mjs
 *   node scripts/fix-registry-imports.mjs --check   (CI: fail instead of write)
 *
 * `shadcn build` embeds each source file verbatim, so `packages/ui/src/*.tsx`
 * ships its own `import { cn } from "./utils"`. That is correct inside this
 * repo and wrong for a consumer: the component lands at
 * `components/ui/<name>.tsx` while `cn` lives at `lib/utils.ts`, and shadcn's
 * import rewriter leaves the specifier alone because it does not start with
 * `@/`. Verified against shadcn 4.21 with a real install -- the written file
 * kept `from "./utils"` and resolved to nothing.
 *
 * Sibling component imports (`./button`) are deliberately left as-is: those
 * resolve correctly, because every `registry:ui` item targets the same
 * `components/ui/` directory.
 *
 * This runs after `shadcn build` because that is the only point where the file
 * content exists in the output. `sync-block-copies.mjs` does the same rewrite
 * for blocks, but from source, since blocks are generated rather than embedded.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const BUILD_OUTPUT_DIR = join(ROOT, "apps/docs/public/r");

const UTILS_IMPORT_RE = /(from\s*["'])\.\/utils(["'])/g;
const UTILS_ALIAS = "$1@/lib/utils$2";

const checkOnly = process.argv.includes("--check");

function listItemFiles() {
  return readdirSync(BUILD_OUTPUT_DIR)
    .filter((name) => name.endsWith(".json") && name !== "registry.json")
    .sort();
}

function rewriteItem(json) {
  let changed = 0;
  for (const file of json.files ?? []) {
    if (typeof file.content !== "string") {
      continue;
    }
    const next = file.content.replace(UTILS_IMPORT_RE, UTILS_ALIAS);
    if (next !== file.content) {
      file.content = next;
      changed += 1;
    }
  }
  return changed;
}

function main() {
  const names = listItemFiles();
  const stale = [];
  let rewritten = 0;

  for (const name of names) {
    const path = join(BUILD_OUTPUT_DIR, name);
    const raw = readFileSync(path, "utf-8");
    const json = JSON.parse(raw);
    const changed = rewriteItem(json);

    if (changed === 0) {
      continue;
    }

    if (checkOnly) {
      stale.push(name);
      continue;
    }

    // `shadcn build` emits 2-space JSON with a trailing newline; match it so
    // the output is stable across runs.
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
    rewritten += changed;
  }

  if (checkOnly && stale.length > 0) {
    console.error(
      `fix-registry-imports: ${stale.length} built item(s) still import "./utils":\n` +
        stale.map((name) => `  - ${name}`).join("\n") +
        "\n\nRun `pnpm registry:build` to regenerate."
    );
    process.exit(1);
  }

  console.log(
    checkOnly
      ? `OK — no built item imports "./utils" (${names.length} checked).`
      : `OK — rewrote "./utils" in ${rewritten} file(s) across ${names.length} item(s).`
  );
}

main();
