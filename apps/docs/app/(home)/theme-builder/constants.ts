export const THEME_PREVIEW_ID = "theme-preview";
export const THEME_STYLE_ID = "theme-builder-css";

// ---------------------------------------------------------------------------
// Radius
// ---------------------------------------------------------------------------

export const radiusIds = [
  "default",
  "none",
  "small",
  "medium",
  "large",
] as const;
export type RadiusId = (typeof radiusIds)[number];

export const radiusOptions: Array<{
  id: RadiusId;
  label: string;
  description?: string;
  cssValue: string | null;
}> = [
  {
    id: "default",
    label: "Default",
    description: "Use radius from style",
    cssValue: null,
  },
  { id: "none", label: "None", cssValue: "0" },
  { id: "small", label: "Small", cssValue: "0.45rem" },
  { id: "medium", label: "Medium", cssValue: "0.625rem" },
  { id: "large", label: "Large", cssValue: "0.875rem" },
];

export const radiusCssMap = Object.fromEntries(
  radiusOptions
    .filter((r) => r.cssValue !== null)
    .map((r) => [r.id, r.cssValue])
) as Record<Exclude<RadiusId, "default">, string>;

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

export const fontIds = [
  "inter",
  "geist",
  "dm-sans",
  "figtree",
  "public-sans",
  "jetbrains-mono",
  "source-serif",
] as const;
export type FontId = (typeof fontIds)[number];

export interface FontConfig {
  cdnUrl: string;
  /** The CSS generic family the stack falls back to. */
  generic: "monospace" | "sans-serif" | "serif";
  id: FontId;
  label: string;
  /** next/font/google import name (e.g. `Inter`, `DM_Sans`) */
  nextFontImport: string;
  variable: string;
}

export const fonts: FontConfig[] = [
  {
    id: "inter",
    generic: "sans-serif",
    label: "Inter",
    nextFontImport: "Inter",
    variable: "--font-inter",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
  },
  {
    id: "geist",
    generic: "sans-serif",
    label: "Geist",
    nextFontImport: "Geist",
    variable: "--font-geist",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap",
  },
  {
    id: "dm-sans",
    generic: "sans-serif",
    label: "DM Sans",
    nextFontImport: "DM_Sans",
    variable: "--font-dm-sans",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..900&display=swap",
  },
  {
    id: "figtree",
    generic: "sans-serif",
    label: "Figtree",
    nextFontImport: "Figtree",
    variable: "--font-figtree",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&display=swap",
  },
  {
    id: "public-sans",
    generic: "sans-serif",
    label: "Public Sans",
    nextFontImport: "Public_Sans",
    variable: "--font-public-sans",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=Public+Sans:wght@100..900&display=swap",
  },
  {
    id: "jetbrains-mono",
    generic: "monospace",
    label: "JetBrains Mono",
    nextFontImport: "JetBrains_Mono",
    variable: "--font-jetbrains-mono",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap",
  },
  {
    // An editorial, print-first face — shadcn's Sera style covers the same
    // ground with a whole style; here it is one font choice.
    id: "source-serif",
    generic: "serif",
    label: "Source Serif 4",
    nextFontImport: "Source_Serif_4",
    variable: "--font-source-serif",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,200..900&display=swap",
  },
];

export const fontMap = Object.fromEntries(
  fonts.map((f) => [f.id, f])
) as Record<FontId, FontConfig>;
