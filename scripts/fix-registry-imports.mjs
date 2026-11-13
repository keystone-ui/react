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
 * `cn` is the only symbol `@/lib/utils` actually has. This repo's `utils.ts`
 * also exports shared constants, and rewriting the specifier alone shipped
 * `import { cn, POPUP_ITEM_HEIGHT } from "@/lib/utils"` in four items --
 * combobox, command, dropdown-menu and select -- where the second symbol
 * resolved to nothing: a type error, and `undefined` interpolated into four
 * className templates at runtime. Those constants are therefore inlined into
 * the emitted file, which keeps the source DRY and the artefact self-contained.
 * There is no `registry:lib` item to put them in, which is the real gap.
 * Exported functions other than `cn` (`mergeClassName`) are inlined the same
 * way, copied from `utils.ts` so the shipped body cannot drift from the source.
 *
 * This runs after `shadcn build` because that is the only point where the file
 * content exists in the output. `sync-block-copies.mjs` does the same rewrite
 * for blocks, but from source, since blocks are generated rather than embedded.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const BUILD_OUTPUT_DIR = join(ROOT, "apps/docs/public/r");
export const UTILS_SOURCE = join(ROOT, "packages/ui/src/utils.ts");

const UTILS_IMPORT_RE = /(from\s*["'])\.\/utils(["'])/g;
const UTILS_ALIAS = "$1@/lib/utils$2";
const UTILS_NAMED_IMPORT_RE =
  /import\s*\{([^}]*)\}\s*from\s*["']\.\/utils["'];?\n?/;

/**
 * What `utils.ts` exports beyond `cn`, as the declaration to inline for each
 * name: its string constants and its functions. Read from source so the
 * inlined code cannot drift from the code this repo compiles against.
 * A function runs from `export function` to the first `}` at column 0.
 */
export function utilsInlinables(source) {
  const found = new Map();
  for (const match of source.matchAll(
    /export const ([A-Z][A-Z0-9_]*)\s*=\s*("(?:[^"\\]|\\.)*");/g
  )) {
    found.set(match[1], `const ${match[1]} = ${match[2]};`);
  }
  for (const match of source.matchAll(
    /^export (function ([A-Za-z_$][\w$]*)\b[\s\S]*?\n\})$/gm
  )) {
    if (match[2] !== "cn") {
      found.set(match[2], match[1]);
    }
  }
  return found;
}

const checkOnly = process.argv.includes("--check");

function listItemFiles() {
  return readdirSync(BUILD_OUTPUT_DIR)
    .filter((name) => name.endsWith(".json") && name !== "registry.json")
    .sort();
}

/**
 * Split a `./utils` import into the part `@/lib/utils` can satisfy (`cn`) and
 * the part it cannot, inlining the latter as a local declaration.
 */
function inlineUtilsSymbols(content, inlinables) {
  const match = content.match(UTILS_NAMED_IMPORT_RE);
  if (!match) {
    return content;
  }

  const symbols = match[1]
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);
  const inline = symbols.filter((symbol) => inlinables.has(symbol));
  if (inline.length === 0) {
    return content;
  }

  const keep = symbols.filter((symbol) => !inlinables.has(symbol));
  const declarations = inline
    .map((symbol) => inlinables.get(symbol))
    .join("\n");
  // An inlined helper calls `cn`, so the import must keep it.
  if (!keep.includes("cn") && /\bcn\(/.test(declarations)) {
    keep.unshift("cn");
  }
  const importLine = keep.length
    ? `import { ${keep.join(", ")} } from "./utils";\n`
    : "";

  return content.replace(
    UTILS_NAMED_IMPORT_RE,
    `${importLine}\n${declarations}\n`
  );
}

/** One emitted file's content, as a consumer must receive it. */
export function rewriteContent(content, inlinables) {
  // Inline first: it rewrites the same import statement, and needs to see
  // the `./utils` specifier before the alias replaces it.
  return inlineUtilsSymbols(content, inlinables).replace(
    UTILS_IMPORT_RE,
    UTILS_ALIAS
  );
}

function rewriteItem(json, inlinables) {
  let changed = 0;
  for (const file of json.files ?? []) {
    if (typeof file.content !== "string") {
      continue;
    }
    const next = rewriteContent(file.content, inlinables);
    if (next !== file.content) {
      file.content = next;
      changed += 1;
    }
  }
  return changed;
}

function main() {
  const names = listItemFiles();
  const inlinables = utilsInlinables(readFileSync(UTILS_SOURCE, "utf-8"));
  const stale = [];
  let rewritten = 0;

  for (const name of names) {
    const path = join(BUILD_OUTPUT_DIR, name);
    const raw = readFileSync(path, "utf-8");
    const json = JSON.parse(raw);
    const changed = rewriteItem(json, inlinables);

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

// Run only when invoked as a script, so tests can import the functions above.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
