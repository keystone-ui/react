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
] as const;
export type FontId = (typeof fontIds)[number];

export interface FontConfig {
  id: FontId;
  label: string;
  variable: string;
  cdnUrl: string;
}

export const fonts: FontConfig[] = [
  {
    id: "inter",
    label: "Inter",
    variable: "--font-inter",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
  },
  {
    id: "geist",
    label: "Geist",
    variable: "--font-geist",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    variable: "--font-dm-sans",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..900&display=swap",
  },
  {
    id: "figtree",
    label: "Figtree",
    variable: "--font-figtree",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&display=swap",
  },
  {
    id: "public-sans",
    label: "Public Sans",
    variable: "--font-public-sans",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=Public+Sans:wght@100..900&display=swap",
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    variable: "--font-jetbrains-mono",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap",
  },
];

export const fontMap = Object.fromEntries(
  fonts.map((f) => [f.id, f])
) as Record<FontId, FontConfig>;
