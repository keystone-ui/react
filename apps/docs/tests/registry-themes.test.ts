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
 *
 * ## Why tokens are classified explicitly
 *
 * This file used to derive "the canonical token set" positionally: it scraped
 * the *first* `:root` block containing `--background` and required all six
 * theme items to declare every token found there. Two problems with that:
 *
 *   1. Adding any token to that block silently obligated 6 theme items x 2
 *      modes of hand edits, with the failure arriving as twelve confusing
 *      assertion failures rather than as a decision.
 *   2. The escape hatch was equally silent. A token declared in a *second*
 *      `:root` block was skipped by the scrape -- and therefore covered by no
 *      test at all, free to drift between global.css, preview.css and the
 *      style item. That is precisely the drift this file exists to catch.
 *
 * So the classification is now a list, not an accident. Every token in the
 * canonical CSS must appear in exactly one of THEME_TOKENS or
 * STYLE_ONLY_TOKENS, and `canonical CSS classifies every token it declares`
 * fails when a new token belongs to neither. Both classes are still checked
 * for cross-file agreement; only THEME_TOKENS are required of theme items.
 *
 * The block reader is also brace-aware rather than `[^}]*`, so a token block
 * wrapping its declarations in a nested at-rule (`.dark { @media screen { … } }`)
 * is read correctly instead of terminating on the inner brace.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

// `shadcn` is a devDependency of the monorepo root, which is what
// `pnpm registry:build` runs. Resolved through Node's upward node_modules
// walk from apps/docs.
import { registryItemSchema } from "shadcn/schema";
import { describe, expect, it } from "vitest";

import { tokenSource } from "./css-tokens";
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
 * Tokens whose values are what a theme *is*. Every theme item must declare
 * all of these, in both modes.
 *
 * Adding one here is a deliberate cost: 6 theme items x 2 modes of edits.
 */
const THEME_TOKENS = [
  "accent",
  "accent-foreground",
  "background",
  "border",
  "border-muted",
  "card",
  "card-foreground",
  "destructive",
  "destructive-foreground",
  "foreground",
  "input",
  "input-bg",
  "muted",
  "muted-foreground",
  "popover",
  "popover-foreground",
  "popup-ring",
  "primary",
  "primary-foreground",
  "radius",
  "ring",
  "secondary",
  "secondary-foreground",
  "secondary-hover",
  "skeleton-shimmer",
] as const;

/**
 * Theme tokens that do not vary by *mode*, so the canonical CSS declares them
 * once in `:root` and there is no `.dark` counterpart to check.
 *
 * `--radius` is the whole list: a theme may change the radius scale, but light
 * and dark share it. The theme items still carry it in both modes (harmless
 * duplication that predates this test), so this exempts the CSS side only.
 */
const MODE_INVARIANT_THEME_TOKENS: readonly string[] = ["radius"];

/**
 * Tokens that are part of the design system but do NOT vary by theme, so the
 * style item carries them and the six theme items deliberately do not.
 *
 * These are still held to cross-file agreement (see "canonical token
 * agreement" below) -- being theme-independent buys an exemption from the
 * theme items, not from having a single source of truth.
 */
const STYLE_ONLY_TOKENS: readonly string[] = [
  // Status tones: the same hues in every theme, exactly as --destructive is.
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  // Sidebar surface: aliases of theme tokens, so they follow the active theme
  // without each theme item restating them. Read by an imported shadcn
  // sidebar; keystone ships none of its own.
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  // Categorical chart ramp: five slots, the same hues in every theme.
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

const CANONICAL_CSS = join(REPO_ROOT, "apps", "docs", "app", "global.css");
const STORYBOOK_CSS = join(
  REPO_ROOT,
  "apps",
  "storybook",
  ".storybook",
  "preview.css"
);

const canonical = tokenSource(CANONICAL_CSS);
const storybook = tokenSource(STORYBOOK_CSS);

const registry = readRegistry();
const byName = new Map(registry.items.map((item) => [item.name, item]));

describe("canonical token classification", () => {
  it("classifies every token the canonical CSS declares", () => {
    const classified = new Set<string>([...THEME_TOKENS, ...STYLE_ONLY_TOKENS]);
    const unclassified = new Set<string>();

    for (const mode of ["light", "dark"] as const) {
      for (const token of Object.keys(canonical[mode])) {
        if (!classified.has(token)) {
          unclassified.add(token);
        }
      }
    }

    // A new token must be a deliberate choice: THEME_TOKENS obligates all six
    // theme items, STYLE_ONLY_TOKENS declares it theme-independent.
    expect([...unclassified].sort()).toEqual([]);
  });

  it("declares every theme token in both modes of the canonical CSS", () => {
    const missing: string[] = [];
    for (const mode of ["light", "dark"] as const) {
      for (const token of THEME_TOKENS) {
        if (mode === "dark" && MODE_INVARIANT_THEME_TOKENS.includes(token)) {
          continue;
        }
        if (!(token in canonical[mode])) {
          missing.push(`${mode}.${token}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("does not classify a token as both theme-scoped and style-only", () => {
    const overlap = STYLE_ONLY_TOKENS.filter((token) =>
      (THEME_TOKENS as readonly string[]).includes(token)
    );
    expect(overlap).toEqual([]);
  });
});

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

  it.each(THEME_ITEMS)("%s defines every theme token", (name) => {
    const item = readJson<RegistryItem>(builtItemPath(name));
    for (const mode of ["light", "dark"] as const) {
      const missing = THEME_TOKENS.filter(
        (token) => !(token in (item.cssVars?.[mode] ?? {}))
      );
      expect(missing, `${name} is missing ${mode} tokens`).toEqual([]);
    }
  });

  it.each(THEME_ITEMS)("%s does not declare style-only tokens", (name) => {
    const item = readJson<RegistryItem>(builtItemPath(name));
    const leaked: string[] = [];
    for (const mode of ["light", "dark"] as const) {
      for (const token of STYLE_ONLY_TOKENS) {
        if (token in (item.cssVars?.[mode] ?? {})) {
          leaked.push(`${mode}.${token}`);
        }
      }
    }
    // A theme-independent token shipped inside a theme item means re-applying
    // a theme can silently change something the theme does not own.
    expect(leaked).toEqual([]);
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
  //
  // Theme items are compared on THEME_TOKENS only; the style item is compared
  // on everything, which is what keeps STYLE_ONLY_TOKENS covered.
  it.each([
    [STYLE_ITEM, [...THEME_TOKENS, ...STYLE_ONLY_TOKENS]] as const,
    ["themes/default", THEME_TOKENS] as const,
    ["themes/zinc", THEME_TOKENS] as const,
  ])("%s matches apps/docs/app/global.css exactly", (name, tokens) => {
    const item = readJson<RegistryItem>(builtItemPath(name));
    const drift: string[] = [];
    for (const mode of ["light", "dark"] as const) {
      for (const token of tokens) {
        const expected = canonical[mode][token];
        if (expected === undefined) {
          continue;
        }
        const actual = item.cssVars?.[mode]?.[token];
        if (actual !== expected) {
          drift.push(`${mode}.${token}: css=${expected} item=${actual}`);
        }
      }
    }
    expect(drift).toEqual([]);
  });

  // Storybook renders every component against its own copy of the tokens. A
  // divergence here means a component looks correct in Storybook and wrong in
  // the docs (or the reverse), which is the hardest kind of drift to notice.
  it("apps/storybook/.storybook/preview.css matches global.css exactly", () => {
    const drift: string[] = [];
    for (const mode of ["light", "dark"] as const) {
      const seen = new Set([
        ...Object.keys(canonical[mode]),
        ...Object.keys(storybook[mode]),
      ]);
      for (const token of seen) {
        const expected = canonical[mode][token];
        const actual = storybook[mode][token];
        if (actual !== expected) {
          drift.push(`${mode}.${token}: docs=${expected} storybook=${actual}`);
        }
      }
    }
    expect(drift.sort()).toEqual([]);
  });
});
