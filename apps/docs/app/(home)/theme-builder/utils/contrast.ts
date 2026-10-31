import { parse, wcagContrast } from "culori";

import { resolveThemeVars } from "./generate-css-output";
import type { ThemeSettings } from "./theme-code";

/**
 * The text-on-surface pairs the builder grades, the same eleven
 * `keystoneui audit --theme` measures in a project — theme-audit-agreement
 * and theme-builder-contrast tests keep the two lists and their maths equal.
 */
export const TEXT_PAIRS = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["muted-foreground", "background"],
  ["accent-foreground", "accent"],
  ["destructive-foreground", "destructive"],
  ["success-foreground", "success"],
  ["warning-foreground", "warning"],
  ["info-foreground", "info"],
] as const;

export const AA_TEXT = 4.5;

export interface ContrastResult {
  mode: "dark" | "light";
  pair: string;
  pass: boolean;
  ratio: number;
}

/** WCAG contrast of every pair in both modes for the builder's current theme. */
export function themeContrast(settings: ThemeSettings): ContrastResult[] {
  const { darkVars, lightVars } = resolveThemeVars(settings);
  const modes = {
    dark: { ...lightVars, ...darkVars },
    light: lightVars,
  } as const;
  const results: ContrastResult[] = [];
  for (const mode of ["light", "dark"] as const) {
    for (const [fg, bg] of TEXT_PAIRS) {
      const a = parse(modes[mode][`--${fg}`] ?? "");
      const b = parse(modes[mode][`--${bg}`] ?? "");
      if (!(a && b)) {
        continue;
      }
      const ratio = wcagContrast(a, b);
      results.push({
        mode,
        pair: `${fg} on ${bg}`,
        pass: ratio >= AA_TEXT,
        ratio,
      });
    }
  }
  return results;
}
