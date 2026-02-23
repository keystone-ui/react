"use client";

import { useEffect } from "react";

import {
  fontMap,
  radiusCssMap,
  THEME_PREVIEW_ID,
  THEME_STYLE_ID,
} from "../constants";
import {
  baseColors,
  calculatePrimaryForeground,
  destructiveTokens,
} from "../theme-data";

import type { ThemeState } from "./use-theme-state";

/**
 * Inject a <link> for a Google Font if not already present.
 */
function injectFontLink(variable: string, url: string) {
  const id = `font-link-${variable}`;
  if (document.getElementById(id)) {
    return;
  }
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

function buildVarsBlock(vars: Record<string, string>, indent = "  "): string {
  return Object.entries(vars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");
}

/**
 * Syncs the current theme‑builder state to a scoped <style> element
 * so the preview container picks up the overridden CSS custom properties.
 */
export function useCssSync(state: ThemeState) {
  const { base, primaryL, primaryC, primaryH, radius, font } = state;

  useEffect(() => {
    const baseColor = baseColors[base];
    const lightBase = baseColor.light;
    const darkBase = baseColor.dark;

    const primaryValue = `oklch(${primaryL} ${primaryC} ${primaryH})`;
    const primaryFg = calculatePrimaryForeground(primaryL, primaryC, primaryH);

    // For dark mode, bump lightness slightly for better visibility
    const darkPrimaryL = Math.min(primaryL + 0.12, 0.95);
    const darkPrimaryValue = `oklch(${darkPrimaryL} ${primaryC} ${primaryH})`;
    const darkPrimaryFg = calculatePrimaryForeground(
      darkPrimaryL,
      primaryC,
      primaryH
    );

    // Merge tokens
    const lightVars: Record<string, string> = {
      ...lightBase,
      "--primary": primaryValue,
      "--primary-foreground": primaryFg,
      "--ring": primaryValue,
      ...destructiveTokens.light,
    };

    const darkVars: Record<string, string> = {
      ...darkBase,
      "--primary": darkPrimaryValue,
      "--primary-foreground": darkPrimaryFg,
      "--ring": darkPrimaryValue,
      ...destructiveTokens.dark,
    };

    // Radius — "default" means use the style's built-in --radius
    if (radius !== "default") {
      const radiusValue = radiusCssMap[radius as keyof typeof radiusCssMap];
      lightVars["--radius"] = radiusValue;
      darkVars["--radius"] = radiusValue;
    }

    // Font
    const fontConfig = fontMap[font as keyof typeof fontMap] ?? fontMap.inter;
    injectFontLink(fontConfig.variable, fontConfig.cdnUrl);
    const fontSansValue = `var(${fontConfig.variable})`;
    lightVars["--font-sans"] = fontSansValue;
    darkVars["--font-sans"] = fontSansValue;

    // Inject font family CSS variable definition
    const fontVarId = "theme-builder-font-var";
    let fontVarEl = document.getElementById(
      fontVarId
    ) as HTMLStyleElement | null;
    if (!fontVarEl) {
      fontVarEl = document.createElement("style");
      fontVarEl.id = fontVarId;
      document.head.appendChild(fontVarEl);
    }
    fontVarEl.textContent = `:root { ${fontConfig.variable}: "${fontConfig.label}", sans-serif; }`;

    // Build scoped CSS — the preview container uses a data attribute for mode
    const css = `
#${THEME_PREVIEW_ID}[data-mode="light"] {
${buildVarsBlock(lightVars)}
}
#${THEME_PREVIEW_ID}[data-mode="dark"] {
${buildVarsBlock(darkVars)}
}`;

    let styleEl = document.getElementById(
      THEME_STYLE_ID
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = THEME_STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;

    return () => {
      document.getElementById(THEME_STYLE_ID)?.remove();
      document.getElementById(fontVarId)?.remove();
    };
  }, [base, primaryL, primaryC, primaryH, radius, font]);
}
