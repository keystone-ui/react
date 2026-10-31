/**
 * Theme codes from the keystone theme builder (`k1_<base>_<L>_<C>_<H>_<radius>_<font>`).
 *
 * The docs site owns the codec and serves each code as a shadcn
 * `registry:theme` item at /r/theme/<code>.json; this side only checks the
 * shape and builds the commands, so the CLI never drifts from the site's
 * theme data.
 */

const THEME_CODE_RE =
  /^k1_([a-z]+)_(\d+(?:\.\d+)?)_(\d+(?:\.\d+)?)_(\d+(?:\.\d+)?)_([a-z]+)_([a-z-]+)$/;

export type ThemePart = "font" | "theme";

export interface ThemeCodeFields {
  base: string;
  font: string;
  primary: string;
  radius: string;
}

export function parseThemeCode(code: string): ThemeCodeFields | null {
  const match = THEME_CODE_RE.exec(code);
  if (!match) {
    return null;
  }
  const [, base, l, c, h, radius, font] = match;
  return { base, font, primary: `oklch(${l} ${c} ${h})`, radius };
}

export function themeInstallCommand(
  code: string,
  siteUrl: string,
  only: ThemePart[] = []
): string {
  const query = only.length > 0 ? `?only=${only.join(",")}` : "";
  return `npx shadcn@latest add ${siteUrl}/r/theme/${code}.json${query}`;
}

/** Re-open the theme in the builder, whose URL state uses these keys. */
export function themeBuilderUrl(code: string, siteUrl: string): string | null {
  const match = THEME_CODE_RE.exec(code);
  if (!match) {
    return null;
  }
  const [, base, primaryL, primaryC, primaryH, radius, font] = match;
  const params = new URLSearchParams({
    base,
    primaryL,
    primaryC,
    primaryH,
    radius,
    font,
  });
  return `${siteUrl}/theme-builder?${params}`;
}

export function parseThemeParts(value: string | undefined): ThemePart[] {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is ThemePart => part === "theme" || part === "font");
}
