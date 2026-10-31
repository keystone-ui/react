// @vitest-environment node

/**
 * Structural assertions on `base.css`, which no component test can see:
 * this project runs jsdom with no CSS, so the cascade decisions below are
 * checked against the source text instead.
 *
 * Three things are pinned here, each the result of a bug:
 *
 *  - Motion tokens are namespaced `--ease-ks-*`. A `--ease-out` entry in
 *    `@theme` makes Tailwind emit an `ease-out` utility, which replaces the
 *    framework's own `ease-out` for *every consumer app*, not just this
 *    library. Components reach the custom curve via `ease-(--ease-ks-out)`
 *    so the bare utilities mean what Tailwind says they mean.
 *
 *  - The reduced-motion rule is unlayered and `!important`-free. Unlayered
 *    author styles beat every cascade layer, so a zero-specificity rule still
 *    overrides `duration-*` / `animate-*` utilities (in `@layer utilities`)
 *    while any consumer selector can override it back. Inside `@layer base`
 *    the rule would lose to every utility and silently do nothing. Spinners
 *    and indeterminate progress are exempt -- a stopped spinner reads as a
 *    hung UI -- and the view-transition pseudo-elements are zeroed by name,
 *    because `*` never matches a pseudo-element.
 *
 *  - The scrollbar skin is opt-in. A bare `*` selector restyled the page
 *    scrollbar of every app that imported the file.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SRC_DIR = import.meta.dirname;
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g;
/** The stylesheet with comments blanked out -- comments quote literal times. */
const css = readFileSync(join(SRC_DIR, "base.css"), "utf-8").replace(
  CSS_COMMENT,
  (comment) => " ".repeat(comment.length)
);

const THEME_OPEN = /@theme\s*\{/g;
const REDUCED_MOTION_OPEN =
  /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/;
const LAYER_BASE_OPEN = /@layer\s+base\s*\{/g;
const IMPORTANT = /!important/;
const LEGACY_EASE_TOKEN = /--ease-(?:in-)?out\s*:/;
const NAMESPACED_EASE_OUT = /--ease-ks-out\s*:/;
const NAMESPACED_EASE_IN_OUT = /--ease-ks-in-out\s*:/;
const LEGACY_EASE_REFERENCE = /var\(--ease-(?:in-)?out\)/;
const TIME_LITERAL = /\b\d+(?:\.\d+)?m?s\b/g;
const ZEROED_TIME = /^0\.01ms$/;
const DURATION_TOKENS = [
  "--duration-fast",
  "--duration-base",
  "--duration-slow",
  "--duration-drawer",
];
const VIEW_TRANSITION_PSEUDOS = [
  "::view-transition-group(*)",
  "::view-transition-old(*)",
  "::view-transition-new(*)",
];
const REDUCED_MOTION_EXEMPTIONS = [".animate-spin", "[data-indeterminate]"];
const BARE_STAR_SCROLLBAR = /^\s*\*\s*\{[^}]*scrollbar-width/m;
const BARE_STAR_WEBKIT_SCROLLBAR = /^\s*\*::-webkit-scrollbar/m;
const SCROLLBAR_OPT_IN = /\.ks-scrollbar/;
const TEST_FILE = /\.test\.tsx?$/;
const COMPONENT_FILE = /\.tsx$/;
/**
 * A bare `ease-out` / `ease-in-out` utility: the token at a class-list
 * boundary (start, whitespace, quote, or a variant's `:`). Matches
 * `duration-200 ease-out` and `md:ease-in-out`; does not match
 * `ease-(--ease-ks-out)`, whose var contains neither token.
 */
const BARE_EASE_UTILITY = /(?:^|[\s"'`:])ease-(?:in-)?out(?=[\s"'`]|$)/m;

/** The text between the brace opened at `openIndex` and its match. */
function blockAfter(openIndex: number): string {
  let depth = 0;
  for (let i = openIndex; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return css.slice(openIndex + 1, i);
      }
    }
  }
  throw new Error(`unbalanced braces after index ${openIndex}`);
}

/** Every top-level `@theme { ... }` body, concatenated. */
function themeBlocks(): string {
  const bodies: string[] = [];
  for (const m of css.matchAll(THEME_OPEN)) {
    bodies.push(blockAfter(m.index + m[0].length - 1));
  }
  return bodies.join("\n");
}

function reducedMotionBlock(): { start: number; body: string } {
  const m = css.match(REDUCED_MOTION_OPEN);
  if (m?.index === undefined) {
    throw new Error("base.css has no prefers-reduced-motion block");
  }
  const openIndex = m.index + m[0].length - 1;
  return { start: m.index, body: blockAfter(openIndex) };
}

/** Brace depth at `index`, counting from the top of the file. */
function depthAt(index: number): number {
  let depth = 0;
  for (let i = 0; i < index; i++) {
    if (css[i] === "{") {
      depth++;
    } else if (css[i] === "}") {
      depth--;
    }
  }
  return depth;
}

function componentSources(): Array<{ file: string; source: string }> {
  return readdirSync(SRC_DIR)
    .filter((f) => COMPONENT_FILE.test(f) && !TEST_FILE.test(f))
    .map((file) => ({
      file,
      source: readFileSync(join(SRC_DIR, file), "utf-8"),
    }));
}

/**
 * Demos and stories are published surfaces too -- demos ship through the
 * registry, so a bare `ease-out` there lands in a consumer's codebase with a
 * curve the library's own components do not use.
 */
const SURFACE_DIRS = [
  join(SRC_DIR, "../../../apps/docs/demos"),
  join(SRC_DIR, "../../../apps/storybook/stories"),
];

function surfaceSources(): Array<{ file: string; source: string }> {
  return SURFACE_DIRS.flatMap((dir) =>
    readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && COMPONENT_FILE.test(entry.name))
      .map((entry) => {
        const file = join(entry.parentPath, entry.name);
        return { file, source: readFileSync(file, "utf-8") };
      })
  );
}

describe("motion tokens", () => {
  it("namespaces the easing tokens so Tailwind's ease-out and ease-in-out survive", () => {
    const theme = themeBlocks();
    expect(theme).not.toMatch(LEGACY_EASE_TOKEN);
    expect(theme).toMatch(NAMESPACED_EASE_OUT);
    expect(theme).toMatch(NAMESPACED_EASE_IN_OUT);
  });

  it("references only the namespaced tokens", () => {
    expect(css).not.toMatch(LEGACY_EASE_REFERENCE);
  });

  it("derives every transition time from a duration token", () => {
    // Strip the token definitions (where literal times belong) and the
    // reduced-motion block (which zeroes them). Nothing left may carry a
    // literal time, or zeroing the tokens would leave that transition
    // running for reduced-motion users.
    let rest = css;
    for (const m of [...css.matchAll(THEME_OPEN)].reverse()) {
      const body = blockAfter(m.index + m[0].length - 1);
      rest =
        rest.slice(0, m.index) +
        rest.slice(m.index + m[0].length + body.length + 1);
    }
    const reduced = rest.match(REDUCED_MOTION_OPEN);
    if (reduced?.index !== undefined) {
      const body = reducedMotionBlock().body;
      rest =
        rest.slice(0, reduced.index) +
        rest.slice(reduced.index + reduced[0].length + body.length + 1);
    }
    const literals = [...rest.matchAll(TIME_LITERAL)].map((m) => m[0]);
    expect(literals).toEqual([]);
  });

  it("no component uses the bare ease-out or ease-in-out utility", () => {
    const offenders = componentSources()
      .filter(({ source }) => BARE_EASE_UTILITY.test(source))
      .map(({ file }) => file);
    expect(offenders).toEqual([]);
  });

  it("no docs demo or story uses the bare ease-out or ease-in-out utility", () => {
    const offenders = surfaceSources()
      .filter(({ source }) => BARE_EASE_UTILITY.test(source))
      .map(({ file }) => file.split("/apps/")[1]);
    expect(offenders).toEqual([]);
  });
});

describe("reduced motion", () => {
  it("is unlayered, so it still beats Tailwind's utilities without !important", () => {
    const { start, body } = reducedMotionBlock();
    expect(depthAt(start)).toBe(0);
    expect(body).not.toMatch(IMPORTANT);
  });

  it("is not wrapped in @layer base", () => {
    const { start } = reducedMotionBlock();
    for (const m of css.matchAll(LAYER_BASE_OPEN)) {
      const openIndex = m.index + m[0].length - 1;
      const end = openIndex + blockAfter(openIndex).length + 1;
      expect(start >= m.index && start <= end).toBe(false);
    }
  });

  it("zeroes the duration tokens so the library's own [data-slot] transitions stop too", () => {
    const { body } = reducedMotionBlock();
    for (const token of DURATION_TOKENS) {
      const declaration = body.match(new RegExp(`${token}\\s*:\\s*([^;]+);`));
      expect(declaration?.[1].trim(), token).toMatch(ZEROED_TIME);
    }
  });

  it("zeroes the view-transition pseudo-elements by name", () => {
    const { body } = reducedMotionBlock();
    for (const pseudo of VIEW_TRANSITION_PSEUDOS) {
      expect(body).toContain(pseudo);
    }
  });

  it("exempts spinners and indeterminate progress", () => {
    const { body } = reducedMotionBlock();
    for (const selector of REDUCED_MOTION_EXEMPTIONS) {
      expect(body).toContain(selector);
    }
  });
});

describe("scrollbar skin", () => {
  it("is opt-in via .ks-scrollbar rather than a bare * selector", () => {
    expect(css).toMatch(SCROLLBAR_OPT_IN);
    expect(css).not.toMatch(BARE_STAR_SCROLLBAR);
    expect(css).not.toMatch(BARE_STAR_WEBKIT_SCROLLBAR);
  });
});

const TYPESET_BLOCK = /@utility typeset\s*\{([\s\S]*?)\n\}/;
const NESTED_SELECTOR = /^\s*&\s+([^{]+)\{/gm;
const ORDER_DEPENDENT = /:last-child|:last-of-type|:only-child|~|:has\(/;
const RAW_COLOR = /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch)\(/i;

describe("typeset", () => {
  const block = TYPESET_BLOCK.exec(css)?.[1] ?? "";
  const selectors = [...block.matchAll(NESTED_SELECTOR)].map((m) =>
    m[1].trim()
  );

  it("is an @utility with nested element rules", () => {
    expect(block).not.toBe("");
    expect(selectors.length).toBeGreaterThan(15);
  });

  it("wraps every element selector in :where() so element classes win", () => {
    expect(selectors.filter((s) => !s.startsWith(":where("))).toEqual([]);
  });

  it("never depends on what comes after an element, so streaming is stable", () => {
    expect(selectors.filter((s) => ORDER_DEPENDENT.test(s))).toEqual([]);
  });

  it("reads its knobs with fallbacks and colours only from tokens", () => {
    for (const knob of [
      "--typeset-size",
      "--typeset-leading",
      "--typeset-flow",
    ]) {
      expect(block).toMatch(new RegExp(`var\\(${knob},`));
    }
    expect(block).not.toMatch(RAW_COLOR);
  });
});
