/**
 * `scripts/fix-registry-imports.mjs` inlines what `utils.ts` exports beyond
 * `cn` into each emitted registry item, because a consumer's `@/lib/utils` is
 * shadcn's own file and holds `cn` alone. These tests pin that for the
 * `mergeClassName` helper: inlined once, generated from `utils.ts` itself, and
 * runnable; and an item that does not use it is left as it was.
 */

import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  rewriteContent,
  UTILS_SOURCE,
  utilsInlinables,
} from "../../../scripts/fix-registry-imports.mjs";
import {
  builtItemPath,
  listBuiltItemNames,
  type RegistryItem,
  readJson,
} from "./registry-paths";

const utilsSource = readFileSync(UTILS_SOURCE, "utf-8");
const inlinables = utilsInlinables(utilsSource);

const ALIAS_UTILS_IMPORT =
  /import\s*\{([^}]*)\}\s*from\s*["']@\/lib\/utils["'];?/g;
const HELPER_DECLARATION = /function mergeClassName\b/g;
const RELATIVE_UTILS = /["']\.\/utils["']/;

/** The helper as `utils.ts` declares it, minus `export`. */
const helperFromSource = (() => {
  const start = utilsSource.indexOf("export function mergeClassName");
  const end = utilsSource.indexOf("\n}\n", start) + 2;
  return utilsSource.slice(start + "export ".length, end);
})();

function importedFromAlias(content: string) {
  return [...content.matchAll(ALIAS_UTILS_IMPORT)].flatMap((match) =>
    match[1]
      .split(",")
      .map((symbol) => symbol.trim())
      .filter(Boolean)
  );
}

/**
 * Strip the types and run the module body with a stand-in `cn`, returning
 * what it exports. Fails on any syntax error in the emitted file.
 */
function evaluate(content: string) {
  const js = stripTypeScriptTypes(content)
    .replace(ALIAS_UTILS_IMPORT, "")
    .replace(/^export function (\w+)/gm, "exports.$1 = function $1");
  const exports: Record<string, (...args: unknown[]) => unknown> = {};
  const cn = (...inputs: unknown[]) => inputs.filter(Boolean).join(" ");
  new Function("exports", "cn", js)(exports, cn);
  return exports;
}

const USES_HELPER = `"use client";

import { cn, mergeClassName } from "./utils";

export function Part({
  className,
}: {
  className?: string | ((state: { open: boolean }) => string);
}) {
  return mergeClassName(cn("base"), className);
}
`;

const CN_ONLY = `"use client";

import { cn } from "./utils";

export function Part({ className }: { className?: string }) {
  return cn("base", className);
}
`;

describe("fix-registry-imports inlines mergeClassName", () => {
  it("reads the helper from utils.ts and does not inline cn", () => {
    expect(inlinables.get("mergeClassName")).toBe(helperFromSource);
    expect(inlinables.has("cn")).toBe(false);
  });

  it("inlines the helper exactly once and imports only cn", () => {
    const out = rewriteContent(USES_HELPER, inlinables);

    expect(out.match(HELPER_DECLARATION)).toHaveLength(1);
    expect(out).toContain(helperFromSource);
    expect(importedFromAlias(out)).toEqual(["cn"]);
    expect(out).not.toMatch(RELATIVE_UTILS);
  });

  it("emits a file that parses and runs: a function className is called with state", () => {
    const { Part } = evaluate(rewriteContent(USES_HELPER, inlinables));

    expect(Part({ className: "str" })).toBe("base str");
    const fromFunction = Part({
      className: (state: { open: boolean }) => (state.open ? "on" : "off"),
    }) as (state: { open: boolean }) => string;
    expect(fromFunction({ open: true })).toBe("base on");
    expect(fromFunction({ open: false })).toBe("base off");
  });

  it("keeps cn imported when an item imports the helper alone", () => {
    const out = rewriteContent(
      USES_HELPER.replace("{ cn, mergeClassName }", "{ mergeClassName }"),
      inlinables
    );

    expect(importedFromAlias(out)).toEqual(["cn"]);
    expect(out.match(HELPER_DECLARATION)).toHaveLength(1);
  });

  it("leaves an item that does not use the helper as it was", () => {
    const out = rewriteContent(CN_ONLY, inlinables);

    expect(out).toBe(CN_ONLY.replace('"./utils"', '"@/lib/utils"'));
  });

  it("still inlines string constants", () => {
    const out = rewriteContent(
      CN_ONLY.replace("{ cn }", "{ cn, POPUP_ITEM_HEIGHT }"),
      inlinables
    );

    expect(importedFromAlias(out)).toEqual(["cn"]);
    expect(out).toContain('const POPUP_ITEM_HEIGHT = "');
  });
});

describe("built registry items that use mergeClassName", () => {
  const users = listBuiltItemNames().flatMap((name) =>
    (readJson<RegistryItem>(builtItemPath(name)).files ?? [])
      .filter((file) => (file.content ?? "").includes("mergeClassName("))
      .map((file) => ({ name, path: file.path, content: file.content ?? "" }))
  );

  it("exist", () => {
    expect(users.length).toBeGreaterThan(0);
  });

  it("each declare the helper once, as utils.ts has it", () => {
    const offenders = users
      .filter(
        ({ content }) =>
          content.match(HELPER_DECLARATION)?.length !== 1 ||
          !content.includes(helperFromSource)
      )
      .map(({ name, path }) => join(name, path));

    expect(offenders).toEqual([]);
  });
});
