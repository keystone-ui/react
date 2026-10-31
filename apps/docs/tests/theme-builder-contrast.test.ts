/**
 * The theme builder grades contrast live with culori; `keystoneui audit
 * --theme` grades a project's CSS without it. Same pairs, same answers.
 */

import { describe, expect, it } from "vitest";

import {
  TEXT_PAIRS,
  themeContrast,
} from "@/app/(home)/theme-builder/utils/contrast";
import { generateCssOutput } from "@/app/(home)/theme-builder/utils/generate-css-output";
import type { ThemeSettings } from "@/app/(home)/theme-builder/utils/theme-code";
import {
  auditTheme,
  TEXT_PAIRS as CLI_PAIRS,
  readThemeTokens,
} from "../../../packages/keystoneui-mcp/src/theme-audit";

const DEFAULT: ThemeSettings = {
  base: "zinc",
  font: "geist",
  primaryC: 0.006,
  primaryH: 285.885,
  primaryL: 0.21,
  radius: "default",
};

describe("theme builder contrast", () => {
  it("grades the same pairs as the CLI", () => {
    expect(TEXT_PAIRS.map((p) => p.join(" on "))).toEqual(
      CLI_PAIRS.map((p) => p.join(" on "))
    );
  });

  it("grades every pair in both modes", () => {
    expect(themeContrast(DEFAULT)).toHaveLength(22);
  });

  it.each([
    DEFAULT,
    { ...DEFAULT, base: "slate", primaryC: 0.2, primaryH: 262, primaryL: 0.55 },
    { ...DEFAULT, base: "stone", primaryC: 0.15, primaryH: 140, primaryL: 0.7 },
  ] as ThemeSettings[])(
    "agrees with the CLI on the CSS it exports ($base, L=$primaryL)",
    (settings) => {
      const builder = themeContrast(settings);
      const cli = auditTheme(readThemeTokens(generateCssOutput(settings)));
      for (const b of builder) {
        const c = cli.find((r) => r.mode === b.mode && r.pair === b.pair);
        expect(c?.ratio, `${b.mode} ${b.pair}`).toBeCloseTo(b.ratio, 0);
        expect(c?.status === "pass", `${b.mode} ${b.pair}`).toBe(b.pass);
      }
    }
  );

  it("flags a mid-lightness primary that no foreground can clear", () => {
    // The builder picks the primary's foreground, so a pale primary just
    // gets dark text. Around L 0.6 neither near-white nor near-black reaches
    // 4.5:1 — measured 3.49:1 for this green.
    const mid = themeContrast({
      ...DEFAULT,
      primaryC: 0.2,
      primaryH: 145,
      primaryL: 0.6,
    });
    const primary = mid.find(
      (r) => r.mode === "light" && r.pair === "primary-foreground on primary"
    );
    expect(primary?.pass).toBe(false);
    expect(primary?.ratio).toBeLessThan(4.5);
  });
});
