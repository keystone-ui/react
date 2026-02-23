#!/usr/bin/env node
/**
 * Get theme variables and design tokens for Keystone UI.
 *
 * Usage:
 *   node get_theme.mjs
 *
 * Output:
 *   Theme variables organized by light/dark with OKLCH color format
 */

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/keystone-ui/react/refs/heads/main";

const FALLBACK_THEME = {
  light: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.141 0.005 285.823)",
    card: "oklch(1 0 0)",
    "card-foreground": "oklch(0.141 0.005 285.823)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.141 0.005 285.823)",
    primary: "oklch(0.21 0.006 285.885)",
    "primary-foreground": "oklch(0.985 0 0)",
    secondary: "oklch(0.967 0.001 286.375)",
    "secondary-foreground": "oklch(0.21 0.006 285.885)",
    muted: "oklch(0.967 0.001 286.375)",
    "muted-foreground": "oklch(0.552 0.016 285.938)",
    accent: "oklch(0.967 0.001 286.375)",
    "accent-foreground": "oklch(0.21 0.006 285.885)",
    destructive: "oklch(0.577 0.245 27.325)",
    "destructive-foreground": "oklch(0.971 0.013 17.38)",
    border: "oklch(0.92 0.004 286.32)",
    input: "oklch(0.92 0.004 286.32)",
    ring: "oklch(0.705 0.015 286.067)",
    radius: "0.625rem",
  },
  dark: {
    background: "oklch(0.141 0.005 285.823)",
    foreground: "oklch(0.985 0 0)",
    card: "oklch(0.21 0.006 285.885)",
    "card-foreground": "oklch(0.985 0 0)",
    popover: "oklch(0.21 0.006 285.885)",
    "popover-foreground": "oklch(0.985 0 0)",
    primary: "oklch(0.92 0.004 286.32)",
    "primary-foreground": "oklch(0.21 0.006 285.885)",
    secondary: "oklch(0.274 0.006 286.033)",
    "secondary-foreground": "oklch(0.985 0 0)",
    muted: "oklch(0.274 0.006 286.033)",
    "muted-foreground": "oklch(0.705 0.015 286.067)",
    accent: "oklch(0.274 0.006 286.033)",
    "accent-foreground": "oklch(0.985 0 0)",
    destructive: "oklch(0.704 0.191 22.216)",
    "destructive-foreground": "oklch(0.971 0.013 17.38)",
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(1 0 0 / 15%)",
    ring: "oklch(0.552 0.016 285.938)",
    radius: "0.625rem",
  },
};

function formatVariables(vars) {
  return Object.entries(vars)
    .map(([name, value]) => `  --${name}: ${value};`)
    .join("\n");
}

async function fetchFromGitHub() {
  const url = `${GITHUB_RAW_BASE}/packages/ui/registry/default.json`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "KeystoneUI-Skill/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.cssVars?.light && data.cssVars?.dark) {
      return {
        light: data.cssVars.light,
        dark: data.cssVars.dark,
        source: "github",
      };
    }

    return null;
  } catch (error) {
    console.error(`# GitHub Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.error("# Fetching Keystone UI theme variables...");

  let data = await fetchFromGitHub();

  if (!data) {
    console.error("# GitHub failed, using embedded fallback...");
    data = { ...FALLBACK_THEME, source: "fallback" };
  }

  console.log("/* Keystone UI Theme Variables */");
  console.log("/* Color Space: OKLCH */");
  console.log(`/* Source: ${data.source} */`);
  console.log();
  console.log(":root {");
  console.log(formatVariables(data.light));
  console.log("}");
  console.log();
  console.log(".dark {");
  console.log(formatVariables(data.dark));
  console.log("}");

  console.error("\n# Raw JSON:");
  console.error(JSON.stringify(data, null, 2));
}

main();
