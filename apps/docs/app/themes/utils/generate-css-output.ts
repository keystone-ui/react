import { fontMap, radiusCssMap } from "../constants";
import type { ThemeState } from "../hooks/use-theme-state";
import {
  baseColors,
  calculatePrimaryForeground,
  destructiveTokens,
} from "../theme-data";

/**
 * Generate copy-pasteable CSS that users add to their global.css.
 */
export function generateCssOutput(state: ThemeState): string {
  const { base, primaryL, primaryC, primaryH, radius, font } = state;

  const baseColor = baseColors[base];

  const primaryValue = `oklch(${primaryL} ${primaryC} ${primaryH})`;
  const primaryFg = calculatePrimaryForeground(primaryL, primaryC, primaryH);

  const darkPrimaryL = Math.min(primaryL + 0.12, 0.95);
  const darkPrimaryValue = `oklch(${darkPrimaryL} ${primaryC} ${primaryH})`;
  const darkPrimaryFg = calculatePrimaryForeground(
    darkPrimaryL,
    primaryC,
    primaryH
  );

  const fontConfig = fontMap[font as keyof typeof fontMap] ?? fontMap.inter;
  const fontSansValue = `var(${fontConfig.variable})`;

  const lightVars: Record<string, string> = {
    ...baseColor.light,
    "--primary": primaryValue,
    "--primary-foreground": primaryFg,
    ...destructiveTokens.light,
    "--font-sans": fontSansValue,
  };

  const darkVars: Record<string, string> = {
    ...baseColor.dark,
    "--primary": darkPrimaryValue,
    "--primary-foreground": darkPrimaryFg,
    ...destructiveTokens.dark,
  };

  if (radius !== "default") {
    const radiusValue = radiusCssMap[radius as keyof typeof radiusCssMap];
    lightVars["--radius"] = radiusValue;
    darkVars["--radius"] = radiusValue;
  }

  const indent = "  ";
  const lightBlock = Object.entries(lightVars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");

  const darkBlock = Object.entries(darkVars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");

  return `/*
 * Keystone UI Theme
 * Add this to your global.css
 * Make sure to load the ${fontConfig.label} font in your app.
 */

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
  color-scheme: dark;
${darkBlock}
}`;
}
