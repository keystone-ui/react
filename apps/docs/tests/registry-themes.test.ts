/**
 * The style and theme items must exist, be schema-valid, and agree with the
 * canonical token set.
 *
 * Before the fix these items were absent entirely: registry.json carried zero
 * `registry:style` and zero `registry:theme` items even though the seven
 * definitions existed at packages/ui/registry/, because no build step read
 * that directory. Every documented theme-install URL 404'd.
 *
 * Note that `shadcn build` is not a safety net here: when an item fails
 * `registryItemSchema` it logs "Invalid registry item found" and *continues*,
 * exiting 0. A malformed theme would therefore be silently dropped from the
 * output by a green build. Hence validating the built files here.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// `shadcn` is a devDependency of the monorepo root, which is what
// `pnpm registry:build` runs. Resolved through Node's upward node_modules
// walk from apps/docs.
import { registryItemSchema } from "shadcn/schema";
import { describe, expect, it } from "vitest";

import {
  builtItemPath,
  REPO_ROOT,
  type RegistryItem,
  readJson,
  readRegistry,
} from "./registry-paths";

/** The style item, served at /r/default.json. */
const STYLE_ITEM = "default";

/** The theme items, served at /r/themes/<name>.json. */
const THEME_ITEMS = [
  "themes/default",
  "themes/gray",
  "themes/neutral",
  "themes/slate",
  "themes/stone",
  "themes/zinc",
];

/**
 * The canonical 24-token set. apps/docs/app/global.css and
 * apps/storybook/.storybook/preview.css are byte-identical on these tokens and
 * are the canonical source; the registry items must not drift from them.
 */
const CANONICAL_CSS = join(REPO_ROOT, "apps", "docs", "app", "global.css");
const TOKEN_DECL_RE = /--([a-z0-9-]+)\s*:\s*([^;]+);/g;
const ROOT_BLOCK_RE = /:root\s*\{([^}]*)\}/g;
const DARK_BLOCK_RE = /\.dark\s*\{([^}]*)\}/g;
const BACKGROUND_DECL_RE = /--background\s*:/;

function tokenBlock(css: string, blockRe: RegExp): Record<string, string> {
  blockRe.lastIndex = 0;
  let match = blockRe.exec(css);
  while (match !== null) {
    const body = match[1];
    // Skip unrelated :root blocks (the docs site also declares Fumadocs vars).
    if (BACKGROUND_DECL_RE.test(body)) {
      const tokens: Record<string, string> = {};
      TOKEN_DECL_RE.lastIndex = 0;
      let decl = TOKEN_DECL_RE.exec(body);
      while (decl !== null) {
        tokens[decl[1]] = decl[2].trim();
        decl = TOKEN_DECL_RE.exec(body);
      }
      return tokens;
    }
    match = blockRe.exec(css);
  }
  throw new Error(`No token block found in ${CANONICAL_CSS}`);
}

const canonicalCss = readFileSync(CANONICAL_CSS, "utf-8");
const canonical = {
  light: tokenBlock(canonicalCss, ROOT_BLOCK_RE),
  dark: tokenBlock(canonicalCss, DARK_BLOCK_RE),
};

const registry = readRegistry();
const byName = new Map(registry.items.map((item) => [item.name, item]));

describe("registry style item", () => {
  it("declares exactly one registry:style item, named `default`", () => {
    const styles = registry.items.filter((i) => i.type === "registry:style");
    expect(styles.map((i) => i.name)).toEqual([STYLE_ITEM]);
  });

  it("is built to apps/docs/public/r/default.json", () => {
    expect(existsSync(builtItemPath(STYLE_ITEM))).toBe(true);
  });

  it("carries the css, cssVars and package dependency a style needs", () => {
    const item = readJson<RegistryItem>(builtItemPath(STYLE_ITEM));
    expect(item.dependencies).toContain("@keystoneui/react");
    // A style installs the whole setup, so it needs the Tailwind @theme
    // registration as well as the raw token values.
    expect(Object.keys(item.cssVars ?? {}).sort()).toEqual([
      "dark",
      "light",
      "theme",
    ]);
    expect(item.css).toBeDefined();
    expect(
      Object.keys(item.css ?? {}).some((k) =>
        k.includes("@keystoneui/react/base.css")
      )
    ).toBe(true);
  });
});

describe("registry theme items", () => {
  it("declares exactly the six documented registry:theme items", () => {
    const themes = registry.items
      .filter((i) => i.type === "registry:theme")
      .map((i) => i.name)
      .sort();
    expect(themes).toEqual(THEME_ITEMS);
  });

  it.each(THEME_ITEMS)("%s is built to a real file", (name) => {
    expect(existsSync(builtItemPath(name))).toBe(true);
  });

  it.each(THEME_ITEMS)("%s carries light and dark cssVars only", (name) => {
    const item = readJson<RegistryItem>(builtItemPath(name));
    // A theme swaps token values; it must not re-install base.css or @theme.
    expect(Object.keys(item.cssVars ?? {}).sort()).toEqual(["dark", "light"]);
    expect(item.css).toBeUndefined();
  });

  it.each(THEME_ITEMS)("%s defines the full canonical token set", (name) => {
    const item = readJson<RegistryItem>(builtItemPath(name));
    for (const mode of ["light", "dark"] as const) {
      const missing = Object.keys(canonical[mode]).filter(
        (token) => !(token in (item.cssVars?.[mode] ?? {}))
      );
      expect(missing, `${name} is missing ${mode} tokens`).toEqual([]);
    }
  });
});

describe("shadcn registry-item schema", () => {
  it.each([STYLE_ITEM, ...THEME_ITEMS])(
    "%s parses against the schema",
    (name) => {
      const item = readJson<unknown>(builtItemPath(name));
      const result = registryItemSchema.safeParse(item);
      expect(
        result.success ? [] : result.error.issues.map((i) => i.message)
      ).toEqual([]);
    }
  );

  it("every built style/theme item is also declared in registry.json", () => {
    for (const name of [STYLE_ITEM, ...THEME_ITEMS]) {
      expect(byName.has(name), `${name} missing from registry.json`).toBe(true);
    }
  });
});

describe("canonical token agreement", () => {
  // The default install path is: add the style, optionally re-apply the
  // default/zinc theme. Those must produce the same tokens as the app CSS,
  // otherwise re-applying the default theme silently changes the design.
  it.each([STYLE_ITEM, "themes/default", "themes/zinc"])(
    "%s matches apps/docs/app/global.css exactly",
    (name) => {
      const item = readJson<RegistryItem>(builtItemPath(name));
      const drift: string[] = [];
      for (const mode of ["light", "dark"] as const) {
        for (const [token, value] of Object.entries(canonical[mode])) {
          const actual = item.cssVars?.[mode]?.[token];
          if (actual !== value) {
            drift.push(`${mode}.${token}: css=${value} item=${actual}`);
          }
        }
      }
      expect(drift).toEqual([]);
    }
  );
});
