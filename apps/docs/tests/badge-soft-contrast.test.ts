/**
 * A soft status Badge's text has to stay readable on every table row it can
 * sit on: plain, hovered and selected, in both themes.
 *
 * Badge text is 12px at weight 500 (10px at `size="sm"`), which is not large
 * text, so WCAG 2.x SC 1.4.3 asks for 4.5:1. A selected or hovered row paints
 * a darker surface than the page, and a soft Badge's translucent fill lets
 * that surface through, so the row can pull the text under 4.5 where the page
 * background does not.
 *
 * Everything is read from the sources a consumer gets, never a copy in this
 * file: the soft classes from `packages/ui/src/badge.tsx`, the palette steps
 * from Tailwind's own `theme.css`, the surfaces from `apps/docs/app/global.css`
 * and the background utilities TableRow applies from `packages/ui/src/table.tsx`.
 * Each colour carries its own alpha and its `/NN` opacity modifier (none means
 * opaque). The row surface is painted over the page, the Badge fill over the
 * row and the text over the fill, in gamma-encoded sRGB, the way Chromium
 * paints it, with every colour clipped to the sRGB gamut first. A class the
 * test cannot model (an unknown variant, a modifier that is not a number, a
 * colour it cannot resolve) throws with the class in the message rather than
 * being skipped.
 *
 * Compared with figures measured in Chromium, this pipeline agrees to within
 * 0.08. Not covered: a row both hovered and selected, P3 displays, other
 * engines, APCA.
 */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import { parse } from "culori";
import { describe, expect, it } from "vitest";

import { contrast, rgb } from "./color-math";
import { MODES, type Mode, tokenSource } from "./css-tokens";
import { REPO_ROOT } from "./registry-paths";

const MIN_TEXT_CONTRAST = 4.5;

const BADGE_SOURCE = readFileSync(
  join(REPO_ROOT, "packages", "ui", "src", "badge.tsx"),
  "utf-8"
);
const TABLE_SOURCE = readFileSync(
  join(REPO_ROOT, "packages", "ui", "src", "table.tsx"),
  "utf-8"
);
const TAILWIND_THEME = readFileSync(
  createRequire(import.meta.url).resolve("tailwindcss/theme.css"),
  "utf-8"
);
const tokens = tokenSource(
  join(REPO_ROOT, "apps", "docs", "app", "global.css")
);

const STATUS_COLORS_RE = /const STATUS_COLORS = \{([\s\S]*?)\n\} as const;/;
const TONE_RE =
  /(\w+):\s*\{\s*\[SOLID\]:\s*"[^"]*",\s*\[SOFT\]:\s*"([^"]*)",?\s*\}/g;
const TABLE_ROW_RE = /const TableRow = [\s\S]*?className=\{cn\(\s*"([^"]*)"/;
const WHITESPACE_RE = /\s+/;
const ARBITRARY_RE = /^\[(.+)\]$/;
const UNDERSCORE_RE = /_/g;
const MODIFIER_RE = /^\d+(\.\d+)?$/;

const DARK = "dark";
const HOVER = "hover";
const SELECTED = "data-[state=selected]";

/** Every soft tone's class string, keyed by tone, as `badge.tsx` ships it. */
function softClasses(): Record<string, string> {
  const block = BADGE_SOURCE.match(STATUS_COLORS_RE)?.[1] ?? "";
  return Object.fromEntries(
    Array.from(block.matchAll(TONE_RE), ([, tone, soft]) => [tone, soft])
  );
}

/** TableRow's own class string, the first argument of its `cn()`. */
function tableRowClasses(): string {
  const classes = TABLE_SOURCE.match(TABLE_ROW_RE)?.[1];
  if (!classes) {
    throw new Error("No TableRow cn() class string in table.tsx");
  }
  return classes;
}

/**
 * Split at each `separator` that sits outside `[…]`, the way
 * Tailwind reads `variant:variant:utility` and `utility/modifier`.
 */
function splitOutsideBrackets(value: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;
    } else if (char === separator && depth === 0) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

/** A class as its variants and its utility. */
function readClass(token: string): { utility: string; variants: string[] } {
  const parts = splitOutsideBrackets(token, ":");
  return { utility: parts.at(-1) ?? "", variants: parts.slice(0, -1) };
}

interface Paint {
  /** Overall alpha: the colour's own alpha times the `/NN` modifier. */
  alpha: number;
  color: string;
}

/**
 * The colour a `<prefix>-<value>[/<modifier>]` utility paints, or undefined
 * when the utility has another prefix. `resolve` turns a named value into a
 * CSS colour; an arbitrary `[…]` value is used as written.
 */
function readPaint(
  token: string,
  utility: string,
  prefix: string,
  resolve: (name: string) => string | undefined
): Paint | undefined {
  if (!utility.startsWith(`${prefix}-`)) {
    return;
  }
  const [value, modifier, ...rest] = splitOutsideBrackets(
    utility.slice(prefix.length + 1),
    "/"
  );
  if (
    rest.length > 0 ||
    (modifier !== undefined && !MODIFIER_RE.test(modifier))
  ) {
    throw new Error(`Unmodelled opacity modifier in "${token}"`);
  }
  const arbitrary = value.match(ARBITRARY_RE)?.[1];
  const color = arbitrary
    ? arbitrary.replace(UNDERSCORE_RE, " ")
    : resolve(value);
  const parsed = color === undefined ? undefined : parse(color);
  if (color === undefined || parsed === undefined) {
    throw new Error(`Cannot resolve the colour of "${token}"`);
  }
  const ownAlpha = parsed.alpha ?? 1;
  const modifierAlpha = modifier === undefined ? 1 : Number(modifier) / 100;
  return { alpha: ownAlpha * modifierAlpha, color };
}

/** A palette step from Tailwind's theme. */
function paletteStep(name: string): string | undefined {
  return TAILWIND_THEME.match(
    new RegExp(`--color-${name}:\\s*([^;]+);`)
  )?.[1]?.trim();
}

/** The text and fill paint a soft tone has in a mode. */
function softPaint(classes: string, mode: Mode) {
  let text: Paint | undefined;
  let fill: Paint | undefined;
  for (const token of classes.split(WHITESPACE_RE)) {
    const { utility, variants } = readClass(token);
    const isDark = variants.length === 1 && variants[0] === DARK;
    if (variants.length > 0 && !isDark) {
      throw new Error(`Unmodelled variant on a soft Badge class "${token}"`);
    }
    if (isDark && mode === "light") {
      continue;
    }
    // A dark: class wins over the base one, as it does in the cascade.
    const textPaint = readPaint(token, utility, "text", paletteStep);
    if (textPaint && (isDark || text === undefined)) {
      text = textPaint;
    }
    const fillPaint = readPaint(token, utility, "bg", paletteStep);
    if (fillPaint && (isDark || fill === undefined)) {
      fill = fillPaint;
    }
  }
  if (!(text && fill)) {
    throw new Error(`No soft text or fill in "${classes}" for ${mode}`);
  }
  return { fill, text };
}

type RowState = "plain" | "hovered" | "selected";

/**
 * The background each row state gets from TableRow's classes in a mode.
 *
 * A `group-…` or arbitrary `[…]` variant only narrows where a background
 * applies (a hoverable table, a body row), so it is passed over; `hover` and
 * `data-[state=selected]` pick the state and `dark` the mode. Any other
 * variant on a background utility is one this test does not model, and
 * throws.
 */
function rowBackgrounds(mode: Mode): Partial<Record<RowState, Paint>> {
  const found: Partial<Record<RowState, Paint>> = {};
  for (const token of tableRowClasses().split(WHITESPACE_RE)) {
    const { utility, variants } = readClass(token);
    const paint = readPaint(token, utility, "bg", (name) => tokens[mode][name]);
    if (!paint) {
      continue;
    }
    let state: RowState = "plain";
    let darkOnly = false;
    for (const variant of variants) {
      if (variant === HOVER || variant === SELECTED) {
        if (state !== "plain") {
          throw new Error(`Unmodelled row state in "${token}"`);
        }
        state = variant === HOVER ? "hovered" : "selected";
      } else if (variant === DARK) {
        darkOnly = true;
      } else if (!(variant.startsWith("group-") || variant.startsWith("["))) {
        throw new Error(`Unmodelled variant on a row background "${token}"`);
      }
    }
    if (darkOnly && mode === "light") {
      continue;
    }
    if (found[state] && !darkOnly) {
      throw new Error(`Two backgrounds for a ${state} row, at "${token}"`);
    }
    found[state] = paint;
  }
  return found;
}

const clip = (value: number) => Math.min(1, Math.max(0, value));

/** A colour clipped to sRGB, as `[r, g, b]` in 0–1, its alpha ignored. */
function srgb(color: string): [number, number, number] {
  const { b, g, r } = rgb(color);
  return [clip(r), clip(g), clip(b)];
}

/** `top` painted over the opaque `bottom`, in gamma-encoded sRGB. */
function over(top: Paint, bottom: string): string {
  const a = srgb(top.color);
  const b = srgb(bottom);
  const mixed = a.map(
    (channel, i) => top.alpha * channel + (1 - top.alpha) * b[i]
  );
  return `color(srgb ${mixed.join(" ")})`;
}

/** The opaque surface of each row state, painted over the page. */
function rowSurfaces(mode: Mode): Record<RowState, string> {
  const page = over({ alpha: 1, color: tokens[mode].background }, "white");
  const backgrounds = rowBackgrounds(mode);
  const surface = (state: RowState) => {
    const paint = backgrounds[state] ?? backgrounds.plain;
    const plain = backgrounds.plain ? over(backgrounds.plain, page) : page;
    return paint && state !== "plain" ? over(paint, plain) : plain;
  };
  return {
    plain: surface("plain"),
    hovered: surface("hovered"),
    selected: surface("selected"),
  };
}

const TONES = ["success", "warning", "info", "red"];

describe("soft status Badge text on table rows", () => {
  it("reads every soft tone and every row surface from the sources", () => {
    // Guards the test: a parse that found nothing would pass every check below.
    expect(Object.keys(softClasses()).sort()).toEqual([...TONES].sort());
    // The two row states this test models are both painted by TableRow.
    for (const mode of MODES) {
      const states = Object.keys(rowBackgrounds(mode));
      expect(states).toContain("hovered");
      expect(states).toContain("selected");
    }
  });

  it.each(MODES)(
    "keeps every soft tone at 4.5:1 on every row in %s",
    (mode) => {
      const classes = softClasses();
      const failures: string[] = [];
      for (const tone of TONES) {
        const { fill, text } = softPaint(classes[tone], mode);
        for (const [row, surface] of Object.entries(rowSurfaces(mode))) {
          const badge = over(fill, surface);
          const ratio = contrast(over(text, badge), badge);
          if (ratio < MIN_TEXT_CONTRAST) {
            failures.push(
              `${mode} ${tone} on a ${row} row: ${ratio.toFixed(2)}`
            );
          }
        }
      }
      expect(failures).toEqual([]);
    }
  );
});
