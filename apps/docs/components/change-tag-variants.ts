/**
 * Colour recipes for the changelog's change tags. Kept in a plain module so
 * tests/change-tag-contrast.test.ts can measure them without rendering.
 */
export type ChangeTagVariant =
  | "added"
  | "changed"
  | "fixed"
  | "removed"
  | "deprecated"
  | "security";

/**
 * The tone is carried by the fill; the text is the page foreground. Status
 * tokens as *text* on a tinted pill fall short of AA for 12px type in light
 * mode (`text-warning` lands under 2:1), and the library's rule forbids a
 * `dark:` override on a status tone, so the fill is the only place the colour
 * can live. tests/change-tag-contrast.test.ts measures every pair.
 */
export const variantClasses: Record<ChangeTagVariant, string> = {
  added: "bg-success/20 text-foreground",
  changed: "bg-primary text-primary-foreground",
  fixed: "bg-warning/25 text-foreground",
  removed: "bg-destructive/20 text-foreground",
  deprecated: "bg-muted text-foreground",
  security: "bg-destructive/20 font-semibold text-foreground",
};

export const variantLabels: Record<ChangeTagVariant, string> = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  removed: "Removed",
  deprecated: "Deprecated",
  security: "Security",
};
