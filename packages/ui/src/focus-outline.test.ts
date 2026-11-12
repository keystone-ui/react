// @vitest-environment node

/**
 * A focus outline width never sits beside a bare `outline-none`.
 *
 * In Tailwind v4 `outline-none` (and `outline-hidden`) set
 * `--tw-outline-style: none`, and `focus-visible:outline-2` only sets the
 * width plus `outline-style: var(--tw-outline-style)`. Together the outline
 * computes to `none`: TagRemove and the Toast close button showed no keyboard
 * focus at all while their class lists read like Button's. Drop the bare
 * `outline-none` (Button's pattern), or name the style in the same variant
 * (`focus-visible:outline-solid`).
 *
 * `focus:outline-none` breaks it the same way. Scanned per string literal: one class string is one element's classes.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SRC_DIR = import.meta.dirname;
const SOURCE_FILE = /\.tsx?$/;

// Bare, or under a variant that is also active while :focus-visible is.
const BARE_NONE =
  /(?<![\w:/-])(?:focus:|focus-visible:)?outline-(?:none|hidden)(?![\w-])/;
// A width: a number, an arbitrary length (`[3px]`, `[0.125rem]`), or an
// explicit `length:` hint. `[color:…]`, `[#f00]` and bare `(--var)` are colours.
const VARIANT_WIDTH =
  /:outline-(?:\d+|\[(?:\d*\.?\d+(?:px|r?em|ch|ex|vh|vw)?|length:[^\]]+)\]|\(length:[^)]+\))(?![\w-])/;
// Only a style that also applies on keyboard focus overrides the variable:
// bare, `focus:` or `focus-visible:`. `hover:outline-solid` does not.
const FOCUS_STYLE =
  /(?<![\w:/-])(?:focus:|focus-visible:)?outline-(?:solid|dashed|dotted|double)(?![\w-])/;
const STRING_LITERAL = /"([^"\n]*)"|`([^`]*)`|'([^'\n]*)'/g;

// Anchors that pick each library-painted part's own class literal.
const BREADCRUMB_LINK = /hover:text-foreground/;
const CAROUSEL_DOT = /after:-inset-x-\[3px\]/;
const TABS_SCROLL_BUTTON = /^absolute top-0 (?:left|right)-0 z-10 /;
const TOAST_BUTTON = /inline-flex h-7 cursor-pointer/;
const CODE_BLOCK_CONTENT = /\[counter-reset:code-line\]/;
const WHITESPACE = /\s+/;
// A ring of real width, bare or under a variant active on keyboard focus:
// `ring` (1px), a non-zero number, an arbitrary length, or a `length:` hint.
// Zero-width resets (`focus:ring-0`), colours, `ring-offset-*` and
// `ring-inset` paint no ring.
const FOCUS_RING =
  /(?<![\w:/-])(?:focus:|focus-visible:)?ring(?:-(?:0*[1-9]\d*|\[(?!0*\.?0*(?:px|r?em)?\])(?:\d*\.?\d+(?:px|r?em|ch|ex|vh|vw)?|length:[^\]]+)\]|\(length:[^)]+\)))?(?![\w-])/;

/** Draws a ring of real width while focused by keyboard. */
function mixesInAFocusRing(classes: string): boolean {
  return FOCUS_RING.test(classes);
}

/** The string literals in `file` that `anchor` picks. */
function literalsOf(file: string, anchor: RegExp): string[] {
  const source = readFileSync(join(SRC_DIR, file), "utf-8");
  return [...source.matchAll(STRING_LITERAL)]
    .map((m) => m[1] ?? m[2] ?? m[3] ?? "")
    .filter((classes) => anchor.test(classes));
}

function hidesItsOwnOutline(classes: string): boolean {
  return (
    BARE_NONE.test(classes) &&
    VARIANT_WIDTH.test(classes) &&
    !FOCUS_STYLE.test(classes)
  );
}

function offenders(): string[] {
  const found: string[] = [];
  for (const file of readdirSync(SRC_DIR)) {
    if (
      !SOURCE_FILE.test(file) ||
      file.includes(".test.") ||
      file.includes(".stories.")
    ) {
      continue;
    }
    const source = readFileSync(join(SRC_DIR, file), "utf-8");
    for (const match of source.matchAll(STRING_LITERAL)) {
      const classes = match[1] ?? match[2] ?? match[3] ?? "";
      if (hidesItsOwnOutline(classes)) {
        const line = source.slice(0, match.index).split("\n").length;
        found.push(`${file}:${line}`);
      }
    }
  }
  return found;
}

describe("focus outline", () => {
  it("the pattern catches what it claims to", () => {
    expect(hidesItsOwnOutline("outline-none focus-visible:outline-2 p-0")).toBe(
      true
    );
    expect(
      hidesItsOwnOutline("outline-hidden focus-visible:outline-[3px]")
    ).toBe(true);
    // Button's pattern: no bare outline-none.
    expect(
      hidesItsOwnOutline(
        "focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2"
      )
    ).toBe(false);
    // The style is named in the variant, so the variable is overridden.
    expect(
      hidesItsOwnOutline(
        "outline-none focus-visible:outline-solid focus-visible:outline-2"
      )
    ).toBe(false);
    // `focus:` is also active while focusing by keyboard.
    expect(
      hidesItsOwnOutline("focus:outline-none focus-visible:outline-2")
    ).toBe(true);
    // A variant that is not active on focus does not count.
    expect(
      hidesItsOwnOutline("data-open:outline-none focus-visible:outline-2")
    ).toBe(false);
    // Colour and offset are not widths.
    expect(
      hidesItsOwnOutline("outline-none focus-visible:outline-offset-2")
    ).toBe(false);
    // Only a style that applies on keyboard focus exempts the pair: a
    // hover-only style leaves the focused outline at `none`.
    expect(
      hidesItsOwnOutline(
        "outline-none focus-visible:outline-2 hover:outline-solid"
      )
    ).toBe(true);
    expect(
      hidesItsOwnOutline(
        "outline-none focus:outline-solid focus-visible:outline-2"
      )
    ).toBe(false);
    // An arbitrary colour is not a width; arbitrary lengths still are.
    expect(
      hidesItsOwnOutline(
        "outline-none focus-visible:outline-[color:var(--ring)] focus-visible:ring-1"
      )
    ).toBe(false);
    expect(hidesItsOwnOutline("outline-none focus-visible:outline-[3px]")).toBe(
      true
    );
    expect(
      hidesItsOwnOutline("outline-none focus-visible:outline-[0.125rem]")
    ).toBe(true);
    expect(
      hidesItsOwnOutline(
        "outline-none focus-visible:outline-[length:var(--ring-width)]"
      )
    ).toBe(true);
    expect(
      hidesItsOwnOutline("outline-none focus-visible:outline-[#f00]")
    ).toBe(false);
  });

  it("the mixed-ring check catches real ring widths", () => {
    // A covered part's real class literal with a ring added must fail: the
    // ring-based controls use `focus:ring-1`, which is also active on
    // keyboard focus and paints a box-shadow ring beside the outline.
    const [breadcrumbLink] = literalsOf("breadcrumb.tsx", BREADCRUMB_LINK);
    expect(mixesInAFocusRing(breadcrumbLink)).toBe(false);
    expect(mixesInAFocusRing(`${breadcrumbLink} focus:ring-1`)).toBe(true);

    for (const ring of [
      "ring",
      "ring-1",
      "ring-2",
      "ring-[3px]",
      "ring-[0.125rem]",
      "ring-(length:--ring-width)",
      "focus:ring",
      "focus:ring-1",
      "focus:ring-[3px]",
      "focus-visible:ring",
      "focus-visible:ring-2",
      "focus-visible:ring-[length:var(--ring-width)]",
    ]) {
      expect(mixesInAFocusRing(`p-0 ${ring} text-sm`), ring).toBe(true);
    }
    // Zero-width resets (Button's `focus:ring-0`), colours, offsets, inset,
    // and variants that are not active on keyboard focus draw no ring.
    for (const notARing of [
      "focus:ring-0 focus:ring-offset-0",
      "ring-0",
      "focus-visible:ring-[0px]",
      "focus-visible:ring-ring/50",
      "focus-visible:ring-[color:var(--ring)]",
      "focus-visible:ring-offset-2",
      "focus-visible:ring-inset",
      "aria-invalid:ring-destructive/20",
      "hover:ring-2",
      "data-open:ring-1",
      "outline-ring/50 focus-visible:outline-ring/50",
    ]) {
      expect(mixesInAFocusRing(`p-0 ${notARing} text-sm`), notARing).toBe(
        false
      );
    }
  });

  it("never pairs a bare outline-none with a variant outline width", () => {
    expect(offenders()).toEqual([]);
  });

  // Parts the library paints itself draw Button's outline, not the browser's
  // 1px `auto` ring (audit A11). Each anchor picks the part's own class
  // literal; `count` pins how many literals it must match, so a reworded
  // string fails here instead of silently matching nothing. The stories
  // measure the computed outline in a browser.
  it("library-painted parts carry Button's focus outline", () => {
    const BUTTON_OUTLINE = [
      "focus-visible:outline-2",
      "focus-visible:outline-ring/50",
      "focus-visible:outline-offset-2",
    ];
    // The CodeBlock root clips overflow, so its scroll region's outline is
    // drawn inside its box.
    const INSET_OUTLINE = [
      "focus-visible:outline-2",
      "focus-visible:outline-ring/50",
      "focus-visible:-outline-offset-2",
    ];
    const parts = [
      {
        part: "BreadcrumbLink",
        file: "breadcrumb.tsx",
        anchor: BREADCRUMB_LINK,
        count: 1,
        outline: BUTTON_OUTLINE,
      },
      {
        part: "CarouselDots dot",
        file: "carousel.tsx",
        anchor: CAROUSEL_DOT,
        count: 1,
        outline: BUTTON_OUTLINE,
      },
      {
        part: "Tabs scroll buttons",
        file: "tabs.tsx",
        anchor: TABS_SCROLL_BUTTON,
        count: 2,
        outline: BUTTON_OUTLINE,
      },
      {
        part: "Toast action and cancel",
        file: "toast.tsx",
        anchor: TOAST_BUTTON,
        count: 2,
        outline: BUTTON_OUTLINE,
      },
      {
        part: "CodeBlockContent",
        file: "code-block.tsx",
        anchor: CODE_BLOCK_CONTENT,
        count: 1,
        outline: INSET_OUTLINE,
      },
    ];

    const missing: string[] = [];
    for (const { part, file, anchor, count, outline } of parts) {
      const literals = literalsOf(file, anchor);
      expect(literals, part).toHaveLength(count);
      for (const classes of literals) {
        const tokens = classes.split(WHITESPACE);
        const absent = outline.filter((c) => !tokens.includes(c));
        if (absent.length > 0) {
          missing.push(`${part}: ${absent.join(" ")}`);
        }
        // Outline-based, so never mixed with the ring-based pattern.
        if (mixesInAFocusRing(classes)) {
          missing.push(`${part}: mixes in a focus ring`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
