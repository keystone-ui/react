import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { REPO_ROOT } from "./registry-paths";

/**
 * The derived radius scale: ratios, in one file.
 *
 * `--radius` is a theme token and every theme item carries it. The derivation
 * -- `--radius-sm` … `--radius-4xl` -- is library mechanism, and it lives in
 * `packages/ui/src/base.css` alone.
 *
 * **One source.** Tailwind takes the *later* `@theme inline` block whole, so a
 * second copy in an app's own CSS wins and never reports the conflict. Four
 * files used to carry one (global.css, preview.css, the theme-builder's
 * export, and the registry:style item), which meant base.css's copy had no
 * effect anywhere -- editing it changed nothing -- and a consumer's copy was
 * frozen at install time, so a scale corrected in the library would never have
 * reached them.
 *
 * **Ratios, not offsets.** `calc(var(--radius) - 4px)` stops being
 * proportional the moment the base moves: at `--radius: 0` it left
 * `--radius-4xl` at 16px and drove `--radius-sm` to -4px, so /theme-builder's
 * "sharp" preset never produced a square corner. It also mixed units, so the
 * scale differed at any root font size other than 16px. Ratios make both
 * impossible by construction, which is a stronger guarantee than measuring one
 * rendered corner.
 *
 * `registry-themes.test.ts` cannot catch any of this: its token reader filters
 * to `:root`/`.dark` rules that declare `--background`, and the scale lives in
 * an `@theme inline` block that declares no colors.
 */

/** The multipliers, and the px each yields at the 0.625rem default. */
const SCALE = [
  { tier: "sm", ratio: 0.6, atDefault: 6 },
  { tier: "md", ratio: 0.8, atDefault: 8 },
  { tier: "lg", ratio: 1, atDefault: 10 },
  { tier: "xl", ratio: 1.4, atDefault: 14 },
  { tier: "2xl", ratio: 1.8, atDefault: 18 },
  { tier: "3xl", ratio: 2.2, atDefault: 22 },
  { tier: "4xl", ratio: 2.6, atDefault: 26 },
] as const;

const DEFAULT_RADIUS_PX = 10;

/** Any declaration of a derived tier, however it is spelled. */
const ANY_DERIVED = /--radius-(?:sm|md|lg|xl|2xl|3xl|4xl)\s*:/;

/** The old spelling: `calc(var(--radius) - 4px)` and friends. */
const PIXEL_OFFSET = /--radius-[a-z0-9]+:\s*calc\([^)]*[-+]\s*\d/;

/** Same as ANY_DERIVED, globally, to count how many tiers a file declares. */
const EVERY_DERIVED = /--radius-(?:sm|md|lg|xl|2xl|3xl|4xl)\s*:/g;

const SOURCE = "packages/ui/src/base.css";

/**
 * Real CSS that imports `@keystoneui/react/base.css`, or emits CSS that does.
 * Each carried a copy of the scale before. Zero tolerance: any declaration
 * here shadows the library's.
 */
const STYLESHEETS = [
  "apps/docs/app/global.css",
  "apps/storybook/.storybook/preview.css",
  "apps/docs/app/theme-builder/utils/generate-css-output.ts",
];

/**
 * Prose that shows CSS. These may demonstrate overriding a single tier -- that
 * is documented and supported -- but must never reproduce the block, because a
 * reader copies what they see and then silently owns a frozen scale.
 */
const DOCS = [
  "apps/docs/content/docs/(getting-started)/theming/customization.mdx",
  "apps/docs/content/docs/(getting-started)/installation/quick-start.mdx",
];

/** More than one tier in a file's CSS is a copied block, not an example. */
const COPIED_BLOCK_THRESHOLD = 2;

function read(relative: string): string {
  return readFileSync(join(REPO_ROOT, relative), "utf-8");
}

describe("radius scale", () => {
  const source = read(SOURCE);

  it.each(SCALE)("declares --radius-$tier as a ratio", ({ tier, ratio }) => {
    // `lg` is the base itself, so it is `var(--radius)` with no calc().
    const expected =
      ratio === 1
        ? `--radius-${tier}: var(--radius);`
        : `--radius-${tier}: calc(var(--radius) * ${ratio});`;

    expect(source).toContain(expected);
  });

  it("uses no pixel offsets anywhere in the scale", () => {
    const block = source.slice(
      source.indexOf("@theme inline"),
      source.indexOf("}", source.indexOf("--radius-4xl"))
    );

    // The old spelling. An offset is not proportional and mixes units with
    // the rem base, so the scale would differ at a non-16px root font size.
    expect(block).not.toMatch(PIXEL_OFFSET);
  });

  it.each(SCALE)(
    "resolves --radius-$tier to $atDefault px at the default",
    ({ ratio, atDefault }) => {
      // Pins the claim that the move from offsets to ratios changed nothing
      // for anyone who had not themed --radius.
      expect(DEFAULT_RADIUS_PX * ratio).toBeCloseTo(atDefault, 5);
    }
  );

  it("collapses every tier to zero at --radius: 0", () => {
    // Structural, not measured: a ratio of zero is zero. Under the old
    // offsets this was 16px at --radius-4xl and -4px at --radius-sm.
    for (const { tier, ratio } of SCALE) {
      expect(0 * ratio, `--radius-${tier}`).toBe(0);
    }
  });

  it.each(STYLESHEETS)("%s does not shadow the scale", (relative) => {
    expect(read(relative)).not.toMatch(ANY_DERIVED);
  });

  it.each(DOCS)("%s does not reproduce the scale", (relative) => {
    const declared = read(relative).match(EVERY_DERIVED);

    expect(declared?.length ?? 0).toBeLessThan(COPIED_BLOCK_THRESHOLD);
  });

  it("is absent from the registry:style item", () => {
    const style = JSON.parse(read("packages/ui/registry/default.json"));
    const theme: Record<string, string> = style.cssVars?.theme ?? {};

    // `radius` itself is a theme token and belongs in light/dark, not here.
    expect(
      Object.keys(theme).filter((key) => key.startsWith("radius"))
    ).toEqual([]);
  });
});
