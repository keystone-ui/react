/**
 * `keystoneui audit --theme` measures a consumer's tokens without culori, so
 * it can ship in the CLI with no dependency. This pins it to the culori-based
 * maths palette.test.ts uses for keystone's own palettes, across every pair
 * it audits in both modes. Both clip an out-of-gamut OKLCH value to sRGB, as a
 * browser paints it -- the audit in linear light, renderedContrast after
 * gamma encoding, which agree -- so the reference is renderedContrast, not
 * contrast(). The default light `--destructive` lies outside sRGB, where the
 * unclipped ratio reads 0.24 higher than what is painted.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditTheme,
  readThemeTokens,
} from "../../../packages/keystoneui-mcp/src/theme-audit";
import { renderedContrast } from "./color-math";
import { MODES, tokenSource } from "./css-tokens";
import { REPO_ROOT } from "./registry-paths";

const GLOBAL_CSS = join(REPO_ROOT, "apps/docs/app/global.css");
const TOLERANCE = 0.01;

describe("keystoneui audit --theme", () => {
  const results = auditTheme(
    readThemeTokens(readFileSync(GLOBAL_CSS, "utf-8"))
  );
  const reference = tokenSource(GLOBAL_CSS);

  it("audits every pair in both modes", () => {
    for (const mode of MODES) {
      expect(results.filter((r) => r.mode === mode).length).toBe(11);
    }
  });

  it("reads the same tokens as the palette tests", () => {
    const tokens = readThemeTokens(readFileSync(GLOBAL_CSS, "utf-8"));
    for (const mode of MODES) {
      for (const name of ["background", "foreground", "primary", "info"]) {
        expect(tokens[mode][name], `${mode}.${name}`).toBe(
          reference[mode][name]
        );
      }
    }
  });

  it("agrees with culori on every ratio, as painted", () => {
    const drift: string[] = [];
    for (const r of results) {
      const [fg, bg] = r.pair.split(" on ");
      const expected = renderedContrast(
        reference[r.mode][fg],
        reference[r.mode][bg]
      );
      if (r.ratio === null || Math.abs(r.ratio - expected) > TOLERANCE) {
        drift.push(`${r.mode} ${r.pair}: ${r.ratio} vs ${expected.toFixed(2)}`);
      }
    }
    expect(drift).toEqual([]);
  });
});
