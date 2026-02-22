import { fontMap, radiusCssMap } from "../constants";
import type { ThemeState } from "../hooks/use-theme-state";
import {
  baseColors,
  calculatePrimaryForeground,
  destructiveTokens,
  findMatchingPreset,
  primaryPresets,
} from "../theme-data";

const DEFAULT_RADIUS = "0.625rem";

/**
 * Resolve dark-mode primary OKLCH values.
 * Uses predefined values for known presets, falls back to a
 * lightness-bump formula for custom slider values.
 */
function resolveDarkPrimary(
  lightL: number,
  lightC: number,
  lightH: number
): { l: number; c: number; h: number } {
  const presetId = findMatchingPreset(lightL, lightC, lightH);
  if (presetId) {
    const preset = primaryPresets[presetId];
    return {
      l: preset.darkLightness,
      c: preset.darkChroma,
      h: preset.darkHue,
    };
  }

  const darkL =
    lightL < 0.4
      ? Math.min(1 - lightL + 0.13, 0.95)
      : Math.min(lightL + 0.12, 0.95);

  return {
    l: Number(darkL.toFixed(3)),
    c: lightC,
    h: lightH,
  };
}

/**
 * Generate copy-pasteable CSS that users add to their global.css.
 */
export function generateCssOutput(state: ThemeState): string {
  const { base, primaryL, primaryC, primaryH, radius, font } = state;

  const baseColor = baseColors[base];

  const primaryValue = `oklch(${primaryL} ${primaryC} ${primaryH})`;
  const primaryFg = calculatePrimaryForeground(primaryL, primaryC, primaryH);

  const dark = resolveDarkPrimary(primaryL, primaryC, primaryH);
  const darkPrimaryValue = `oklch(${dark.l} ${dark.c} ${dark.h})`;
  const darkPrimaryFg = calculatePrimaryForeground(dark.l, dark.c, dark.h);

  const fontConfig = fontMap[font as keyof typeof fontMap] ?? fontMap.inter;

  const radiusValue =
    radius !== "default"
      ? radiusCssMap[radius as keyof typeof radiusCssMap]
      : DEFAULT_RADIUS;

  const lightVars: Record<string, string> = {
    ...baseColor.light,
    "--primary": primaryValue,
    "--primary-foreground": primaryFg,
    ...destructiveTokens.light,
    "--font-sans": `"${fontConfig.label}", sans-serif`,
    "--radius": radiusValue,
  };

  const darkVars: Record<string, string> = {
    ...baseColor.dark,
    "--primary": darkPrimaryValue,
    "--primary-foreground": darkPrimaryFg,
    ...destructiveTokens.dark,
  };

  const indent = "  ";
  const lightBlock = Object.entries(lightVars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");

  const darkBlock = Object.entries(darkVars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");

  return `/*
 * Keystone UI Theme
 * Replace your global.css with this file.
 *
 * Font: ${fontConfig.label}
 * - Next.js: load via next/font/google and apply the CSS variable to <html>
 *     import { ${fontConfig.nextFontImport} } from "next/font/google";
 *     const font = ${fontConfig.nextFontImport}({ subsets: ["latin"], variable: "${fontConfig.variable}" });
 *     <html className={font.variable}>
 * - Other: add to your <head>:
 *     <link href="${fontConfig.cdnUrl}" rel="stylesheet">
 */

@import "tailwindcss";

@import "@keystoneui/react/base.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-hover: var(--secondary-hover);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-border-muted: var(--border-muted);
  --color-popup-ring: var(--popup-ring);
  --color-input: var(--input);
  --color-input-bg: var(--input-bg);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

:root {
${lightBlock}
}

.dark {
${darkBlock}
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
}
