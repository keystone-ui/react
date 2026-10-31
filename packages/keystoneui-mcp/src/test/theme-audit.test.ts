import { describe, expect, it } from "vitest";

import {
  auditTheme,
  contrastRatio,
  linearRgb,
  readThemeTokens,
} from "../theme-audit.js";

describe("readThemeTokens", () => {
  it("reads :root and .dark, nested screen media included", () => {
    const tokens = readThemeTokens(`
      :root { --background: oklch(1 0 0); --foreground: oklch(0.141 0.005 285.823); }
      .dark { @media screen { --background: oklch(0.141 0.005 285.823); } }
    `);
    expect(tokens.light.background).toBe("oklch(1 0 0)");
    expect(tokens.dark.background).toBe("oklch(0.141 0.005 285.823)");
    // Dark inherits what it does not override.
    expect(tokens.dark.foreground).toBe("oklch(0.141 0.005 285.823)");
  });

  it("ignores print ink tokens and other media-scoped :root blocks", () => {
    const tokens = readThemeTokens(`
      :root { --foreground: oklch(0.3 0 0); }
      @media print { :root { --foreground: #000000; } }
    `);
    expect(tokens.light.foreground).toBe("oklch(0.3 0 0)");
  });

  it("accepts tokens declared inside @layer base", () => {
    const tokens = readThemeTokens(
      "@layer base { :root { --primary: oklch(0.5 0.2 260); } }"
    );
    expect(tokens.light.primary).toBe("oklch(0.5 0.2 260)");
  });
});

describe("contrast", () => {
  it("measures the WCAG extremes", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 1);
    expect(contrastRatio("oklch(1 0 0)", "oklch(0 0 0)")).toBeCloseTo(21, 1);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
  });

  it("skips what needs a browser instead of guessing", () => {
    expect(linearRgb("var(--primary)")).toBeNull();
    expect(linearRgb("color-mix(in oklch, red, blue)")).toBeNull();
    expect(linearRgb("oklch(1 0 0 / 10%)")).toBeNull();
  });
});

describe("auditTheme", () => {
  it("fails a pair under 4.5:1 and passes one above", () => {
    const results = auditTheme(
      readThemeTokens(`:root {
        --background: #ffffff; --foreground: #000000;
        --primary: #777777; --primary-foreground: #ffffff;
      }`)
    );
    const byPair = Object.fromEntries(
      results.filter((r) => r.mode === "light").map((r) => [r.pair, r.status])
    );
    expect(byPair["foreground on background"]).toBe("pass");
    expect(byPair["primary-foreground on primary"]).toBe("fail");
  });
});
