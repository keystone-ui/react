import { type FontId, fontIds, type RadiusId, radiusIds } from "../constants";
import { type BaseColorId, baseColorIds } from "../theme-data";

/**
 * A theme as a short, URL-safe, human-readable code:
 *
 *   k1_zinc_0.21_0.006_285.885_default_geist
 *   │  │    └─ primary L/C/H ─┘   │       └ font
 *   │  └ base colour             └ radius
 *   └ format version
 *
 * The code is the whole theme, so `/r/theme/<code>.json` can serve it as a
 * shadcn `registry:theme` item with no storage behind it, and a code pasted
 * into an issue says what it is. `k1` versions the format: a change to the
 * fields gets a new prefix rather than reinterpreting old codes.
 */

export interface ThemeSettings {
  base: BaseColorId;
  font: FontId;
  primaryC: number;
  primaryH: number;
  primaryL: number;
  radius: RadiusId;
}

const VERSION = "k1";
const SEPARATOR = "_";
const NUMBER_RE = /^\d+(?:\.\d{1,4})?$/;

/** Trim float noise from a colour-picker drag: 0.2100000001 -> 0.21. */
function short(value: number): string {
  return String(Number(value.toFixed(4)));
}

export function encodeThemeCode(settings: ThemeSettings): string {
  return [
    VERSION,
    settings.base,
    short(settings.primaryL),
    short(settings.primaryC),
    short(settings.primaryH),
    settings.radius,
    settings.font,
  ].join(SEPARATOR);
}

function inRange(raw: string, min: number, max: number): number | null {
  if (!NUMBER_RE.test(raw)) {
    return null;
  }
  const value = Number(raw);
  return value >= min && value <= max ? value : null;
}

function isOneOf<T extends string>(
  list: readonly T[],
  value: string
): value is T {
  return (list as readonly string[]).includes(value);
}

/** The settings a code describes, or null for anything malformed. */
export function decodeThemeCode(code: string): ThemeSettings | null {
  const parts = code.split(SEPARATOR);
  if (parts.length !== 7 || parts[0] !== VERSION) {
    return null;
  }
  const [, base, l, c, h, radius, font] = parts;
  const primaryL = inRange(l, 0, 1);
  const primaryC = inRange(c, 0, 0.4);
  const primaryH = inRange(h, 0, 360);
  if (
    !(
      isOneOf(baseColorIds, base) &&
      isOneOf(radiusIds, radius) &&
      isOneOf(fontIds, font)
    ) ||
    primaryL === null ||
    primaryC === null ||
    primaryH === null
  ) {
    return null;
  }
  return { base, font, primaryC, primaryH, primaryL, radius };
}
