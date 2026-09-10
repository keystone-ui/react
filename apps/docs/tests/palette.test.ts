/**
 * The palette must stay legible, and stay legible under colour-vision
 * deficiency.
 *
 * Nothing here asserts a standard the palette does not meet. Every threshold
 * is a **floor pinned at what the palette actually achieves today**, with the
 * measured figure in a comment beside it, so this fails when a change makes
 * something worse and not before. The point is to stop silent regression, not
 * to claim compliance.
 *
 * It reads the real sources a consumer installs -- `apps/docs/app/global.css`
 * for the app tokens and `packages/ui/registry/themes/*.json` for the six
 * themes -- never a second copy of the values in TypeScript. A test that
 * asserts against its own duplicate of the data is the drift it exists to
 * catch.
 *
 * Not covered: tokens whose value is a `color-mix()` or a `var()` reference,
 * since resolving those needs a browser. That is most of the `--sidebar-*`
 * set, by design.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ciede2000, closestPair, contrast, simulate } from "./color-math";
import { MODES, type Mode, tokenSource } from "./css-tokens";
import { REPO_ROOT, type RegistryItem, readJson } from "./registry-paths";

const GLOBAL_CSS = join(REPO_ROOT, "apps", "docs", "app", "global.css");
const THEME_NAMES = ["default", "gray", "neutral", "slate", "stone", "zinc"];

const RESOLVABLE_RE = /^(oklch|rgb|hsl|#)/;
const THEME_INLINE_RE = /@theme inline\s*\{([\s\S]*?)\n\}/;

const css = readFileSync(GLOBAL_CSS, "utf-8");
const appTokens = tokenSource(GLOBAL_CSS);

const chartRamp = (mode: Mode) =>
  [1, 2, 3, 4, 5].map((slot) => appTokens[mode][`chart-${slot}`]);

// ---------------------------------------------------------------------------
// Chart ramp
// ---------------------------------------------------------------------------

describe("chart ramp", () => {
  it.each(MODES)("declares five slots in %s", (mode) => {
    expect(chartRamp(mode).filter(Boolean)).toHaveLength(5);
  });

  // A "colour" that barely differs from the surface it sits on is a shade of
  // the card, not a category. Measured: 1.85 (light slot 5 — yellow on white is
  // intrinsically low-contrast, and pushing it darker turns it olive) / 5.24
  // (dark slot 3).
  const MIN_CARD_CONTRAST: Record<Mode, number> = { dark: 5, light: 1.8 };

  it.each(MODES)("keeps every slot off the card surface in %s", (mode) => {
    const card = appTokens[mode].card;
    const failures = chartRamp(mode)
      .map((color, index) => ({
        ratio: contrast(color, card),
        slot: index + 1,
      }))
      .filter(({ ratio }) => ratio < MIN_CARD_CONTRAST[mode]);
    expect(failures).toEqual([]);
  });

  // Worst pair across ALL pairs, not adjacent ones: in a stacked chart or a
  // legend any two series can end up side by side.
  // Measured: 30.3 (light) / 27.9 (dark).
  const MIN_NORMAL: Record<Mode, number> = { dark: 26, light: 28 };

  it.each(MODES)("separates every pair in normal vision in %s", (mode) => {
    const worst = closestPair(chartRamp(mode));
    expect(
      worst.delta,
      `closest pair in ${mode}: ${worst.a} vs ${worst.b}`
    ).toBeGreaterThanOrEqual(MIN_NORMAL[mode]);
  });

  // The figures that actually shaped this ramp, and the argument for five slots
  // rather than twelve. Measured worst-of-three: 11.1 in both modes.
  //
  // Getting here took work. A ramp built by pairing each hue with its natural
  // lightness measured 6-7, and a straight port of a twelve-slot palette
  // measured 0.9 under tritanopia in light mode -- below a just-noticeable
  // difference, i.e. two series a tritanope cannot tell apart at all. The fix
  // is that separation comes from *lightness*, which every form of CVD
  // preserves, so the ramp deliberately staggers lightness rather than relying
  // on hue. Pushing it further (an aggressive stagger reached 22) turns the
  // yellow slot olive, which is where the trade-off was drawn.
  //
  // 11 is comfortably distinguishable; a just-noticeable difference is 1-2.
  // Colour is still never the only encoding in a keystone chart -- legends
  // carry labels and values.
  const MIN_CVD: Record<Mode, number> = { dark: 10, light: 10 };

  it.each(MODES)("separates every pair under simulated CVD in %s", (mode) => {
    const ramp = chartRamp(mode);
    const results = (["protanopia", "deuteranopia", "tritanopia"] as const).map(
      (kind) => ({
        kind,
        worst: closestPair(ramp, (color) => simulate(color, kind)),
      })
    );
    const failures = results.filter(({ worst }) => worst.delta < MIN_CVD[mode]);
    expect(
      failures.map((f) => `${f.kind}: ${f.worst.a} vs ${f.worst.b}`)
    ).toEqual([]);
  });

  it.each(MODES)("re-steps the ramp for %s rather than reusing", (mode) => {
    const other: Mode = mode === "light" ? "dark" : "light";
    // Not a style preference: the light ramp's lightness is tuned against a
    // white card, so reusing it on a dark one reads muddy.
    expect(chartRamp(mode)).not.toEqual(chartRamp(other));
  });

  // A slot with no Tailwind alias is invisible to the utility layer, and the
  // failure mode is a transparent band rather than an error.
  it("aliases every slot into Tailwind", () => {
    const baseCss = readFileSync(
      join(REPO_ROOT, "packages", "ui", "src", "base.css"),
      "utf-8"
    );
    const themeBlock = css.match(THEME_INLINE_RE)?.[1] ?? "";
    const missing = [1, 2, 3, 4, 5].filter(
      (slot) =>
        !(
          themeBlock.includes(`--color-chart-${slot}:`) ||
          baseCss.includes(`--color-chart-${slot}:`)
        )
    );
    expect(missing).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Status tones
// ---------------------------------------------------------------------------

describe("status tones", () => {
  // Text on a filled chip of the same tone. AA for normal text is 4.5.
  // Measured: success 4.60/6.55, warning 6.97/8.72.
  const MIN_ON_FILL = 4.5;

  it.each(MODES)(
    "keeps success and warning readable on their fill in %s",
    (mode) => {
      const failures: string[] = [];
      for (const tone of ["success", "warning"]) {
        const ratio = contrast(
          appTokens[mode][`${tone}-foreground`],
          appTokens[mode][tone]
        );
        if (ratio < MIN_ON_FILL) {
          failures.push(`${tone}: ${ratio.toFixed(2)}`);
        }
      }
      expect(failures).toEqual([]);
    }
  );

  // `--destructive-foreground` on `--destructive` does NOT clear AA, and this
  // test records that rather than hiding it: measured 4.47 light / 2.63 dark,
  // against a 4.5 requirement. Both values predate this suite.
  //
  // Not silently changed, because `--destructive-foreground` is the label
  // colour on every destructive Button in every theme, so re-picking it is a
  // visual change that deserves its own decision. Pinned just under the
  // measured figures so it cannot get worse in the meantime.
  const DESTRUCTIVE_ON_FILL: Record<Mode, number> = { dark: 2.6, light: 4.4 };

  it.each(MODES)("does not regress destructive-foreground in %s", (mode) => {
    const ratio = contrast(
      appTokens[mode]["destructive-foreground"],
      appTokens[mode].destructive
    );
    expect(ratio).toBeGreaterThanOrEqual(DESTRUCTIVE_ON_FILL[mode]);
    // Documents the shortfall so it shows up when someone reads the suite.
    expect(ratio).toBeLessThan(MIN_ON_FILL);
  });

  // The reason --warning-foreground is dark rather than near-white like every
  // other *-foreground. Near-white on amber-500 is about 1.9:1.
  it.each(MODES)("would fail with a near-white warning text in %s", (mode) => {
    const nearWhite = appTokens[mode]["destructive-foreground"];
    expect(contrast(nearWhite, appTokens[mode].warning)).toBeLessThan(
      MIN_ON_FILL
    );
  });

  // Success and destructive are the two tones a reader has to tell apart at a
  // glance in a metric delta, and they are the classic red/green trap.
  // Measured worst-of-three: 50.3 (light) / 39.4 (dark) -- they separate by
  // lightness, not hue, which is what makes a red/green pair safe here.
  it.each(MODES)(
    "keeps success and destructive apart under CVD in %s",
    (mode) => {
      const worst = Math.min(
        ...(["protanopia", "deuteranopia", "tritanopia"] as const).map((kind) =>
          ciede2000(
            simulate(appTokens[mode].success, kind),
            simulate(appTokens[mode].destructive, kind)
          )
        )
      );
      // They stay distinct by lightness, which is what makes them safe. Colour is
      // still never the only channel -- StatDelta ships an arrow and an sr-only
      // qualifier alongside.
      expect(worst).toBeGreaterThanOrEqual(35);
    }
  );
});

// ---------------------------------------------------------------------------
// Theme items
// ---------------------------------------------------------------------------

describe("theme legibility", () => {
  const themeTokens = (name: string) => {
    const item = readJson<RegistryItem>(
      join(REPO_ROOT, "packages", "ui", "registry", "themes", `${name}.json`)
    );
    return item.cssVars as Record<Mode, Record<string, string>>;
  };

  const cases = THEME_NAMES.flatMap((name) =>
    MODES.map((mode) => [name, mode] as const)
  );

  // Never measured before this test existed. AA for normal text is 4.5;
  // muted-foreground is body-adjacent copy, so it has to clear it.
  it.each(cases)(
    "%s/%s: muted-foreground clears AA on both surfaces",
    (name, mode) => {
      const tokens = themeTokens(name)[mode];
      const failures: string[] = [];
      for (const surface of ["background", "card"]) {
        const ratio = contrast(tokens["muted-foreground"], tokens[surface]);
        if (ratio < 4.5) {
          failures.push(`on ${surface}: ${ratio.toFixed(2)}`);
        }
      }
      expect(failures).toEqual([]);
    }
  );

  // Primary is a button fill, so its label has to be readable on it.
  // Measured minimum: 8.98.
  it.each(cases)(
    "%s/%s: primary-foreground clears AA on primary",
    (name, mode) => {
      const tokens = themeTokens(name)[mode];
      expect(
        contrast(tokens["primary-foreground"], tokens.primary)
      ).toBeGreaterThanOrEqual(4.5);
    }
  );

  // Body text. Measured minimum: 15.6 -- comfortably AAA, and worth pinning
  // so a future theme cannot quietly ship at 5.
  it.each(cases)(
    "%s/%s: foreground is high-contrast on background",
    (name, mode) => {
      const tokens = themeTokens(name)[mode];
      expect(
        contrast(tokens.foreground, tokens.background)
      ).toBeGreaterThanOrEqual(12);
    }
  );

  it.each(THEME_NAMES)("%s declares only resolvable colour values", (name) => {
    // Guards the test itself: a token switched to color-mix() or var() would
    // otherwise silently drop out of every assertion above.
    const tokens = themeTokens(name);
    const checked = [
      "background",
      "card",
      "foreground",
      "muted-foreground",
      "primary",
      "primary-foreground",
    ];
    const unresolvable: string[] = [];
    for (const mode of MODES) {
      for (const token of checked) {
        const value = tokens[mode][token];
        if (!RESOLVABLE_RE.test(value)) {
          unresolvable.push(`${mode}.${token}: ${value}`);
        }
      }
    }
    expect(unresolvable).toEqual([]);
  });
});
