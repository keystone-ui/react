/**
 * Theme data for the Keystone UI Theme Builder.
 *
 * Two independent axes:
 *   1. Base color (gray scale) — structural tokens
 *   2. Primary color (accent)  — brand tokens
 *
 * All values are OKLCH, sourced from Tailwind CSS v4 color scales.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BaseColorTokens {
  "--accent": string;
  "--accent-foreground": string;
  "--background": string;
  "--border": string;
  "--border-muted": string;
  "--card": string;
  "--card-foreground": string;
  "--foreground": string;
  "--input": string;
  "--input-bg": string;
  "--muted": string;
  "--muted-foreground": string;
  "--popover": string;
  "--popover-foreground": string;
  "--popup-ring": string;
  "--secondary": string;
  "--secondary-foreground": string;
  "--secondary-hover": string;
  "--skeleton-shimmer": string;
}

export interface BaseColor {
  dark: BaseColorTokens;
  id: BaseColorId;
  label: string;
  light: BaseColorTokens;
}

export interface PrimaryPreset {
  chroma: number;
  darkChroma: number;
  darkHue: number;
  /** Dark-mode OKLCH overrides (lighter variant for dark backgrounds) */
  darkLightness: number;
  hue: number;
  id: PrimaryPresetId;
  label: string;
  lightness: number;
  /** Representative swatch color (light mode) */
  swatch: string;
}

// ---------------------------------------------------------------------------
// IDs
// ---------------------------------------------------------------------------

export const baseColorIds = [
  "zinc",
  "slate",
  "stone",
  "gray",
  "neutral",
] as const;
export type BaseColorId = (typeof baseColorIds)[number];

export const primaryPresetIds = [
  "zinc",
  "blue",
  "green",
  "orange",
  "red",
  "rose",
  "violet",
  "emerald",
  "cyan",
] as const;
export type PrimaryPresetId = (typeof primaryPresetIds)[number];

// ---------------------------------------------------------------------------
// Base Colors (gray scales)
// ---------------------------------------------------------------------------

export const baseColors: Record<BaseColorId, BaseColor> = {
  zinc: {
    id: "zinc",
    label: "Zinc",
    light: {
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.141 0.005 285.823)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.141 0.005 285.823)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.141 0.005 285.823)",
      "--secondary": "oklch(0.967 0.001 286.375)",
      "--secondary-hover": "color-mix(in oklch, var(--secondary) 97%, black)",
      "--secondary-foreground": "oklch(0.21 0.006 285.885)",
      "--muted": "oklch(0.967 0.001 286.375)",
      "--muted-foreground": "oklch(0.552 0.016 285.938)",
      "--accent": "oklch(0.967 0.001 286.375)",
      "--accent-foreground": "oklch(0.21 0.006 285.885)",
      "--border": "oklch(0.92 0.004 286.32)",
      "--border-muted": "oklch(0.92 0.004 286.32 / 0.5)",
      "--popup-ring": "oklch(0.92 0.004 286.32 / 0.1)",
      "--input": "oklch(0.92 0.004 286.32)",
      "--input-bg": "transparent",
      "--skeleton-shimmer": "oklch(1 0 0 / 0.06)",
    },
    dark: {
      "--background": "oklch(0.141 0.005 285.823)",
      "--foreground": "oklch(0.985 0 0)",
      "--card": "oklch(0.21 0.006 285.885)",
      "--card-foreground": "oklch(0.985 0 0)",
      "--popover": "oklch(0.21 0.006 285.885)",
      "--popover-foreground": "oklch(0.985 0 0)",
      "--secondary": "oklch(0.274 0.006 286.033)",
      "--secondary-hover": "color-mix(in oklch, var(--secondary) 97%, white)",
      "--secondary-foreground": "oklch(0.985 0 0)",
      "--muted": "oklch(0.274 0.006 286.033)",
      "--muted-foreground": "oklch(0.705 0.015 286.067)",
      "--accent": "oklch(0.274 0.006 286.033)",
      "--accent-foreground": "oklch(0.985 0 0)",
      "--border": "oklch(1 0 0 / 10%)",
      "--border-muted": "oklch(1 0 0 / 5%)",
      "--popup-ring": "oklch(1 0 0 / 3%)",
      "--input": "oklch(1 0 0 / 15%)",
      "--input-bg": "oklch(1 0 0 / 5%)",
      "--skeleton-shimmer": "oklch(1 0 0 / 0.1)",
    },
  },

  slate: {
    id: "slate",
    label: "Slate",
    light: {
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.129 0.042 264.695)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.129 0.042 264.695)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.129 0.042 264.695)",
      "--secondary": "oklch(0.968 0.007 247.896)",
      "--secondary-hover": "color-mix(in oklch, var(--secondary) 97%, black)",
      "--secondary-foreground": "oklch(0.208 0.042 265.755)",
      "--muted": "oklch(0.968 0.007 247.896)",
      "--muted-foreground": "oklch(0.554 0.046 257.417)",
      "--accent": "oklch(0.968 0.007 247.896)",
      "--accent-foreground": "oklch(0.208 0.042 265.755)",
      "--border": "oklch(0.929 0.013 255.508)",
      "--border-muted": "oklch(0.929 0.013 255.508 / 0.5)",
      "--popup-ring": "oklch(0.929 0.013 255.508 / 0.1)",
      "--input": "oklch(0.929 0.013 255.508)",
      "--input-bg": "transparent",
      "--skeleton-shimmer": "oklch(1 0 0 / 0.06)",
    },
    dark: {
      "--background": "oklch(0.129 0.042 264.695)",
      "--foreground": "oklch(0.984 0.003 247.858)",
      "--card": "oklch(0.208 0.042 265.755)",
      "--card-foreground": "oklch(0.984 0.003 247.858)",
      "--popover": "oklch(0.208 0.042 265.755)",
      "--popover-foreground": "oklch(0.984 0.003 247.858)",
      "--secondary": "oklch(0.279 0.041 260.031)",
      "--secondary-hover": "color-mix(in oklch, var(--secondary) 97%, white)",
      "--secondary-foreground": "oklch(0.984 0.003 247.858)",
      "--muted": "oklch(0.279 0.041 260.031)",
      "--muted-foreground": "oklch(0.704 0.04 256.788)",
      "--accent": "oklch(0.279 0.041 260.031)",
      "--accent-foreground": "oklch(0.984 0.003 247.858)",
      "--border": "oklch(1 0 0 / 10%)",
      "--border-muted": "oklch(1 0 0 / 5%)",
      "--popup-ring": "oklch(1 0 0 / 3%)",
      "--input": "oklch(1 0 0 / 15%)",
      "--input-bg": "oklch(1 0 0 / 5%)",
      "--skeleton-shimmer": "oklch(1 0 0 / 0.1)",
    },
  },

  stone: {
    id: "stone",
    label: "Stone",
    light: {
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.147 0.004 49.25)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.147 0.004 49.25)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.147 0.004 49.25)",
      "--secondary": "oklch(0.97 0.001 106.424)",
      "--secondary-hover": "color-mix(in oklch, var(--secondary) 97%, black)",
      "--secondary-foreground": "oklch(0.216 0.006 56.043)",
      "--muted": "oklch(0.97 0.001 106.424)",
      "--muted-foreground": "oklch(0.553 0.013 58.071)",
      "--accent": "oklch(0.97 0.001 106.424)",
      "--accent-foreground": "oklch(0.216 0.006 56.043)",
      "--border": "oklch(0.923 0.003 48.717)",
      "--border-muted": "oklch(0.923 0.003 48.717 / 0.5)",
      "--popup-ring": "oklch(0.923 0.003 48.717 / 0.1)",
      "--input": "oklch(0.923 0.003 48.717)",
      "--input-bg": "transparent",
      "--skeleton-shimmer": "oklch(1 0 0 / 0.06)",
    },
    dark: {
      "--background": "oklch(0.147 0.004 49.25)",
      "--foreground": "oklch(0.985 0.001 106.423)",
      "--card": "oklch(0.216 0.006 56.043)",
      "--card-foreground": "oklch(0.985 0.001 106.423)",
      "--popover": "oklch(0.216 0.006 56.043)",
      "--popover-foreground": "oklch(0.985 0.001 106.423)",
      "--secondary": "oklch(0.268 0.007 34.298)",
      "--secondary-hover": "color-mix(in oklch, var(--secondary) 97%, white)",
      "--secondary-foreground": "oklch(0.985 0.001 106.423)",
      "--muted": "oklch(0.268 0.007 34.298)",
      "--muted-foreground": "oklch(0.709 0.01 56.259)",
      "--accent": "oklch(0.268 0.007 34.298)",
      "--accent-foreground": "oklch(0.985 0.001 106.423)",
      "--border": "oklch(1 0 0 / 10%)",
      "--border-muted": "oklch(1 0 0 / 5%)",
      "--popup-ring": "oklch(1 0 0 / 3%)",
      "--input": "oklch(1 0 0 / 15%)",
      "--input-bg": "oklch(1 0 0 / 5%)",
      "--skeleton-shimmer": "oklch(1 0 0 / 0.1)",
    },
  },

  gray: {
    id: "gray",
    label: "Gray",
    light: {
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.13 0.028 261.692)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.13 0.028 261.692)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.13 0.028 261.692)",
      "--secondary": "oklch(0.967 0.003 264.542)",
      "--secondary-hover": "color-mix(in oklch, var(--secondary) 97%, black)",
      "--secondary-foreground": "oklch(0.21 0.034 264.665)",
      "--muted": "oklch(0.967 0.003 264.542)",
      "--muted-foreground": "oklch(0.551 0.027 264.364)",
      "--accent": "oklch(0.967 0.003 264.542)",
      "--accent-foreground": "oklch(0.21 0.034 264.665)",
      "--border": "oklch(0.928 0.006 264.531)",
      "--border-muted": "oklch(0.928 0.006 264.531 / 0.5)",
      "--popup-ring": "oklch(0.928 0.006 264.531 / 0.1)",
      "--input": "oklch(0.928 0.006 264.531)",
      "--input-bg": "transparent",
      "--skeleton-shimmer": "oklch(1 0 0 / 0.06)",
    },
    dark: {
      "--background": "oklch(0.13 0.028 261.692)",
      "--foreground": "oklch(0.985 0.002 247.839)",
      "--card": "oklch(0.21 0.034 264.665)",
      "--card-foreground": "oklch(0.985 0.002 247.839)",
      "--popover": "oklch(0.21 0.034 264.665)",
      "--popover-foreground": "oklch(0.985 0.002 247.839)",
      "--secondary": "oklch(0.278 0.033 256.848)",
      "--secondary-hover": "color-mix(in oklch, var(--secondary) 97%, white)",
      "--secondary-foreground": "oklch(0.985 0.002 247.839)",
      "--muted": "oklch(0.278 0.033 256.848)",
      "--muted-foreground": "oklch(0.707 0.022 261.325)",
      "--accent": "oklch(0.278 0.033 256.848)",
      "--accent-foreground": "oklch(0.985 0.002 247.839)",
      "--border": "oklch(1 0 0 / 10%)",
      "--border-muted": "oklch(1 0 0 / 5%)",
      "--popup-ring": "oklch(1 0 0 / 3%)",
      "--input": "oklch(1 0 0 / 15%)",
      "--input-bg": "oklch(1 0 0 / 5%)",
      "--skeleton-shimmer": "oklch(1 0 0 / 0.1)",
    },
  },

  neutral: {
    id: "neutral",
    label: "Neutral",
    light: {
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.145 0 0)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.145 0 0)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.145 0 0)",
      "--secondary": "oklch(0.97 0 0)",
      "--secondary-hover": "color-mix(in oklch, var(--secondary) 97%, black)",
      "--secondary-foreground": "oklch(0.205 0 0)",
      "--muted": "oklch(0.97 0 0)",
      "--muted-foreground": "oklch(0.556 0 0)",
      "--accent": "oklch(0.97 0 0)",
      "--accent-foreground": "oklch(0.205 0 0)",
      "--border": "oklch(0.922 0 0)",
      "--border-muted": "oklch(0.922 0 0 / 0.5)",
      "--popup-ring": "oklch(0.922 0 0 / 0.1)",
      "--input": "oklch(0.922 0 0)",
      "--input-bg": "transparent",
      "--skeleton-shimmer": "oklch(1 0 0 / 0.06)",
    },
    dark: {
      "--background": "oklch(0.145 0 0)",
      "--foreground": "oklch(0.985 0 0)",
      "--card": "oklch(0.205 0 0)",
      "--card-foreground": "oklch(0.985 0 0)",
      "--popover": "oklch(0.205 0 0)",
      "--popover-foreground": "oklch(0.985 0 0)",
      "--secondary": "oklch(0.269 0 0)",
      "--secondary-hover": "color-mix(in oklch, var(--secondary) 97%, white)",
      "--secondary-foreground": "oklch(0.985 0 0)",
      "--muted": "oklch(0.269 0 0)",
      "--muted-foreground": "oklch(0.708 0 0)",
      "--accent": "oklch(0.269 0 0)",
      "--accent-foreground": "oklch(0.985 0 0)",
      "--border": "oklch(1 0 0 / 10%)",
      "--border-muted": "oklch(1 0 0 / 5%)",
      "--popup-ring": "oklch(1 0 0 / 3%)",
      "--input": "oklch(1 0 0 / 15%)",
      "--input-bg": "oklch(1 0 0 / 5%)",
      "--skeleton-shimmer": "oklch(1 0 0 / 0.1)",
    },
  },
};

// ---------------------------------------------------------------------------
// Primary Color Presets
// ---------------------------------------------------------------------------

export const primaryPresets: Record<PrimaryPresetId, PrimaryPreset> = {
  zinc: {
    id: "zinc",
    label: "Zinc",
    swatch: "oklch(0.141 0.005 285.823)",
    lightness: 0.21,
    chroma: 0.006,
    hue: 285.885,
    darkLightness: 0.92,
    darkChroma: 0.004,
    darkHue: 286.32,
  },
  blue: {
    id: "blue",
    label: "Blue",
    swatch: "oklch(0.546 0.245 262.881)",
    lightness: 0.546,
    chroma: 0.245,
    hue: 262.881,
    darkLightness: 0.666,
    darkChroma: 0.245,
    darkHue: 262.881,
  },
  green: {
    id: "green",
    label: "Green",
    swatch: "oklch(0.627 0.194 149.214)",
    lightness: 0.627,
    chroma: 0.194,
    hue: 149.214,
    darkLightness: 0.747,
    darkChroma: 0.194,
    darkHue: 149.214,
  },
  orange: {
    id: "orange",
    label: "Orange",
    swatch: "oklch(0.646 0.222 41.116)",
    lightness: 0.646,
    chroma: 0.222,
    hue: 41.116,
    darkLightness: 0.766,
    darkChroma: 0.222,
    darkHue: 41.116,
  },
  red: {
    id: "red",
    label: "Red",
    swatch: "oklch(0.577 0.245 27.325)",
    lightness: 0.577,
    chroma: 0.245,
    hue: 27.325,
    darkLightness: 0.697,
    darkChroma: 0.245,
    darkHue: 27.325,
  },
  rose: {
    id: "rose",
    label: "Rose",
    swatch: "oklch(0.586 0.253 17.585)",
    lightness: 0.586,
    chroma: 0.253,
    hue: 17.585,
    darkLightness: 0.706,
    darkChroma: 0.253,
    darkHue: 17.585,
  },
  violet: {
    id: "violet",
    label: "Violet",
    swatch: "oklch(0.541 0.281 293.009)",
    lightness: 0.541,
    chroma: 0.281,
    hue: 293.009,
    darkLightness: 0.661,
    darkChroma: 0.281,
    darkHue: 293.009,
  },
  emerald: {
    id: "emerald",
    label: "Emerald",
    swatch: "oklch(0.596 0.145 163.225)",
    lightness: 0.596,
    chroma: 0.145,
    hue: 163.225,
    darkLightness: 0.716,
    darkChroma: 0.145,
    darkHue: 163.225,
  },
  cyan: {
    id: "cyan",
    label: "Cyan",
    swatch: "oklch(0.609 0.126 221.723)",
    lightness: 0.609,
    chroma: 0.126,
    hue: 221.723,
    darkLightness: 0.729,
    darkChroma: 0.126,
    darkHue: 221.723,
  },
};

// ---------------------------------------------------------------------------
// Destructive (fixed — not user-configurable)
// ---------------------------------------------------------------------------

export const destructiveTokens = {
  light: {
    "--destructive": "oklch(0.577 0.245 27.325)",
    "--destructive-foreground": "oklch(0.971 0.013 17.38)",
  },
  dark: {
    "--destructive": "oklch(0.704 0.191 22.216)",
    "--destructive-foreground": "oklch(0.971 0.013 17.38)",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Calculate foreground color for a given primary color.
 * Uses OKLCH perceptual lightness: > 0.65 gets dark text, otherwise white.
 */
export function calculatePrimaryForeground(
  lightness: number,
  chroma: number,
  hue: number
): string {
  if (lightness > 0.65) {
    return `oklch(0.15 ${Math.min(chroma * 0.2, 0.03).toFixed(4)} ${hue.toFixed(2)})`;
  }
  return "oklch(0.985 0 0)";
}

/**
 * Find which preset matches the given OKLCH values, if any.
 */
export function findMatchingPreset(
  lightness: number,
  chroma: number,
  hue: number
): PrimaryPresetId | undefined {
  for (const preset of Object.values(primaryPresets)) {
    if (
      Math.abs(preset.lightness - lightness) < 0.001 &&
      Math.abs(preset.chroma - chroma) < 0.001 &&
      Math.abs(preset.hue - hue) < 0.01
    ) {
      return preset.id;
    }
  }
  return undefined;
}
