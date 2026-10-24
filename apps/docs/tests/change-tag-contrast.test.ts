/**
 * Change tags on /changelog are 12px text on a small pill. The library's
 * status tokens (`--success`, `--warning`) are tuned as fills, not as text
 * on the page background, so a pill built from `text-warning` on a 15%
 * tint falls under 2:1 in light mode. Measure every variant in both modes
 * against the AA floor for small text, blending translucent fills over the
 * page background the way the browser does.
 */
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { variantClasses } from "@/components/change-tag-variants";
import { contrast, rgb } from "./color-math";
import { MODES, tokenSource } from "./css-tokens";

const GLOBAL_CSS = join(import.meta.dirname, "../app/global.css");
const AA_SMALL_TEXT = 4.5;

const BG_CLASS = /(?:^|\s)bg-([a-z][a-z-]*?)(?:\/(\d+))?(?=\s|$)/;
const TEXT_CLASS = /(?:^|\s)text-([a-z][a-z-]*)(?=\s|$)/;

const tokens = tokenSource(GLOBAL_CSS);

function cssRgb(channel: number): number {
  return Math.round(Math.min(Math.max(channel, 0), 1) * 255);
}

/** `fill` at `alpha` composited over `page`, as the browser paints it. */
function composite(fill: string, alpha: number, page: string): string {
  const f = rgb(fill);
  const p = rgb(page);
  const mix = (a: number, b: number) => cssRgb(a * alpha + b * (1 - alpha));
  return `rgb(${mix(f.r, p.r)} ${mix(f.g, p.g)} ${mix(f.b, p.b)})`;
}

function token(mode: (typeof MODES)[number], name: string): string {
  const value = tokens[mode][name];
  if (!value) {
    throw new Error(`No --${name} token in ${mode} mode`);
  }
  return value;
}

describe("change tag colours", () => {
  for (const [variant, classes] of Object.entries(variantClasses)) {
    const bg = BG_CLASS.exec(classes);
    const text = TEXT_CLASS.exec(classes);

    it(`${variant} names a background and a text token`, () => {
      expect(bg?.[1], classes).toBeDefined();
      expect(text?.[1], classes).toBeDefined();
    });

    for (const mode of MODES) {
      it(`${variant} meets AA for small text in ${mode} mode`, () => {
        const page = token(mode, "background");
        const fillToken = token(mode, bg?.[1] ?? "");
        const alpha = bg?.[2] ? Number(bg[2]) / 100 : 1;
        const fill = alpha < 1 ? composite(fillToken, alpha, page) : fillToken;
        const ratio = contrast(token(mode, text?.[1] ?? ""), fill);
        expect(
          ratio,
          `${variant} ${mode}: ${ratio.toFixed(2)}:1`
        ).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
      });
    }
  }
});
