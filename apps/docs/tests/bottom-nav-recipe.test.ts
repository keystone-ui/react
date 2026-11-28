/**
 * bottom-nav-01 ships one way to keep page content clear of the bar, with
 * ordinary document scrolling: the page's `<main>` reserves exactly the
 * bar's height (border included) plus the bottom safe area, and the bar
 * itself adds a scroll-padding rule for `html` so a focused control is not
 * scrolled under it. The e2e spec measures the preview; this pins that the
 * installed page, the component's comment and the docs teach the same
 * classes and the same CSS, so a reader copying any of them gets the
 * measured layout. Class strings are compared as token sets, so reordering
 * is fine and a comment cannot stand in for markup that drifted.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "../../..");
const DEMO = "apps/docs/demos/blocks/bottom-nav-01.tsx";
const COMPONENT =
  "registry/default/blocks/bottom-nav-01/components/bottom-nav.tsx";
const PAGE = "registry/default/blocks/bottom-nav-01/page.tsx";
const MDX = "apps/docs/content/docs/blocks/bottom-nav-01.mdx";
// The page padding is a recipe, so it lives in a guide; the block page keeps
// the rule the bar adds.
const GUIDE =
  "apps/docs/content/docs/(getting-started)/guides/keep-content-clear-of-the-bottom-nav.mdx";

const BAR_HEIGHT =
  "h-[calc(var(--bottom-nav-height,4rem)+env(safe-area-inset-bottom))]";
const RESERVE = [
  "pb-[calc(var(--bottom-nav-height,4rem)+env(safe-area-inset-bottom))]",
  "md:pb-0",
  "print:pb-0",
];

const MAIN_CLASSES = /<main className="([^"]*)"/g;
const NAV_CLASSES = /<nav[^>]*?className="([^"]*)"/;
const CSS_CONSTANT = /SCROLL_PADDING_CSS = `([^`]*)`/;
const CSS_FENCE = /```css\n([\s\S]*?)```/;
const NAV_SLOT = /<nav[^>]*?data-slot="([^"]*)"/;
// One rule in one media query: `@media <query> { <selector> { <decls> } }`.
const MEDIA_RULE = /^@media ([^{]+?) \{ ([^{]+?) \{ ([^}]*?) \} \}$/;
// `element:where(<argument>)`, the argument kept whole.
const WHERE_SELECTOR = /^([a-z]+):where\((.*)\)$/;
const WHITESPACE = /\s+/g;

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

function tokens(classes: string): string[] {
  return classes.split(WHITESPACE).filter(Boolean).sort();
}

function squash(css: string): string {
  return css.replace(WHITESPACE, " ").trim();
}

function parseRule(css: string) {
  const [, media, selector, body] = MEDIA_RULE.exec(squash(css)) ?? [];
  const [, element, where] = WHERE_SELECTOR.exec(selector ?? "") ?? [];
  const declarations = (body ?? "")
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const colon = declaration.indexOf(":");
      return [
        declaration.slice(0, colon).trim(),
        declaration.slice(colon + 1).trim(),
      ];
    });
  return {
    declarations,
    media,
    selector: { element: element ?? selector, where },
  };
}

describe("bottom-nav-01 clearance recipe", () => {
  it("the bar's height is the variable plus the safe area", () => {
    for (const path of [DEMO, COMPONENT]) {
      const nav = NAV_CLASSES.exec(read(path))?.[1] ?? "";
      expect(tokens(nav), path).toContain(BAR_HEIGHT);
    }
  });

  for (const [path, expected] of [
    // The preview's markup and the component comment's snippet.
    [DEMO, 2],
    [PAGE, 1],
    [MDX, 0],
    [GUIDE, 1],
  ] as const) {
    it(`every <main> in ${path} reserves exactly the bar, nothing else`, () => {
      const mains = [...read(path).matchAll(MAIN_CLASSES)].map((m) =>
        tokens(m[1] ?? "")
      );
      expect(mains).toHaveLength(expected);
      for (const classes of mains) {
        expect(classes).toEqual([...RESERVE].sort());
      }
    });
  }

  it("the component and its installed copy add the scroll-padding rule, at the end side, only while a bar is mounted", () => {
    const source = read(DEMO);
    const css = CSS_CONSTANT.exec(source)?.[1] ?? "";
    const rule = parseRule(css);
    expect(rule.media).toBe("screen and (width < 48rem)");
    // `html` itself, but only while the document holds a bar.
    expect(rule.selector).toEqual({
      element: "html",
      where: `:has([data-slot="${NAV_SLOT.exec(source)?.[1]}"])`,
    });
    // The end side only: the start side is the page's (a sticky header).
    expect(rule.declarations).toEqual([
      [
        "scroll-padding-block-end",
        "calc(var(--bottom-nav-height, 4rem) + env(safe-area-inset-bottom) + 1rem)",
      ],
    ]);
    expect(CSS_CONSTANT.exec(read(COMPONENT))?.[1]).toBe(css);
  });

  it("the docs show the same CSS the bar adds", () => {
    const shown = CSS_FENCE.exec(read(MDX))?.[1] ?? "";
    const added = CSS_CONSTANT.exec(read(DEMO))?.[1] ?? "";
    expect(squash(shown)).toContain("scroll-padding-block");
    expect(squash(shown)).toBe(squash(added));
  });
});
