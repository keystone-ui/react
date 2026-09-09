/**
 * Colour maths for the palette test: WCAG contrast, CIEDE2000 separation, and
 * simulated colour-vision deficiency.
 *
 * Parsing and conversion come from `culori`, which apps/docs already depends on
 * for the theme builder — so this file only carries what culori does not:
 * CIEDE2000 (its own `differenceCiede2000` exists but is not exposed in the
 * shape needed here) and the CVD simulation matrices.
 *
 * Deliberately in tests/ rather than src/: no production code needs it.
 */

import { converter, parse } from "culori";

const toRgb = converter("rgb");
const toLab = converter("lab");

export interface Rgb {
  b: number;
  g: number;
  r: number;
}

/** Parse any CSS colour culori understands (oklch, hex, color-mix is NOT). */
export function rgb(color: string): Rgb {
  const parsed = parse(color);
  if (!parsed) {
    throw new Error(`Unparseable colour: ${color}`);
  }
  const { b, g, r } = toRgb(parsed);
  return { b, g, r };
}

// ---------------------------------------------------------------------------
// WCAG contrast
// ---------------------------------------------------------------------------

function channelLuminance(value: number): number {
  return value <= 0.039_28 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance({ b, g, r }: Rgb): number {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

/** WCAG 2.x contrast ratio, 1–21. */
export function contrast(foreground: string, background: string): number {
  const a = relativeLuminance(rgb(foreground));
  const b = relativeLuminance(rgb(background));
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

// ---------------------------------------------------------------------------
// CIEDE2000
// ---------------------------------------------------------------------------

const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;

/**
 * CIEDE2000 perceptual difference. Roughly: 1 is a just-noticeable
 * difference, 2-3 is noticeable side by side, and anything under ~10 is
 * uncomfortably close for two categorical series in one chart.
 */
export function ciede2000(colorA: string, colorB: string): number {
  const first = toLab(parse(colorA));
  const second = toLab(parse(colorB));

  const l1 = first.l;
  const a1 = first.a;
  const b1 = first.b;
  const l2 = second.l;
  const a2 = second.a;
  const b2 = second.b;

  const kL = 1;
  const kC = 1;
  const kH = 1;

  const c1 = Math.sqrt(a1 * a1 + b1 * b1);
  const c2 = Math.sqrt(a2 * a2 + b2 * b2);
  const cBar = (c1 + c2) / 2;

  const g = 0.5 * (1 - Math.sqrt(cBar ** 7 / (cBar ** 7 + 25 ** 7)));
  const a1p = a1 * (1 + g);
  const a2p = a2 * (1 + g);

  const c1p = Math.sqrt(a1p * a1p + b1 * b1);
  const c2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = (Math.atan2(b1, a1p) * DEG + 360) % 360 || 0;
  const h2p = (Math.atan2(b2, a2p) * DEG + 360) % 360 || 0;

  const dLp = l2 - l1;
  const dCp = c2p - c1p;

  let dhp = 0;
  if (c1p * c2p !== 0) {
    const diff = h2p - h1p;
    if (Math.abs(diff) <= 180) {
      dhp = diff;
    } else if (diff > 180) {
      dhp = diff - 360;
    } else {
      dhp = diff + 360;
    }
  }
  const dHp = 2 * Math.sqrt(c1p * c2p) * Math.sin((dhp * RAD) / 2);

  const lBarP = (l1 + l2) / 2;
  const cBarP = (c1p + c2p) / 2;

  let hBarP = h1p + h2p;
  if (c1p * c2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) {
      hBarP = (h1p + h2p) / 2;
    } else if (h1p + h2p < 360) {
      hBarP = (h1p + h2p + 360) / 2;
    } else {
      hBarP = (h1p + h2p - 360) / 2;
    }
  }

  const t =
    1 -
    0.17 * Math.cos((hBarP - 30) * RAD) +
    0.24 * Math.cos(2 * hBarP * RAD) +
    0.32 * Math.cos((3 * hBarP + 6) * RAD) -
    0.2 * Math.cos((4 * hBarP - 63) * RAD);

  const dTheta = 30 * Math.exp(-(((hBarP - 275) / 25) ** 2));
  const rC = 2 * Math.sqrt(cBarP ** 7 / (cBarP ** 7 + 25 ** 7));
  const sL =
    1 + (0.015 * (lBarP - 50) ** 2) / Math.sqrt(20 + (lBarP - 50) ** 2);
  const sC = 1 + 0.045 * cBarP;
  const sH = 1 + 0.015 * cBarP * t;
  const rT = -Math.sin(2 * dTheta * RAD) * rC;

  return Math.sqrt(
    (dLp / (kL * sL)) ** 2 +
      (dCp / (kC * sC)) ** 2 +
      (dHp / (kH * sH)) ** 2 +
      rT * (dCp / (kC * sC)) * (dHp / (kH * sH))
  );
}

// ---------------------------------------------------------------------------
// Colour-vision deficiency
// ---------------------------------------------------------------------------

export type Cvd = "protanopia" | "deuteranopia" | "tritanopia";

/**
 * Brettel/Viénot-style linear approximations. Not clinically exact, but the
 * right tool for the question asked here — "would these two series still be
 * distinguishable?" — and stable enough to pin as a regression floor.
 */
const CVD_MATRIX: Record<Cvd, number[][]> = {
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Simulate a colour as seen with one form of CVD, returned as `rgb(...)`. */
export function simulate(color: string, kind: Cvd): string {
  const { b, g, r } = rgb(color);
  const [row0, row1, row2] = CVD_MATRIX[kind];
  const out = [
    clamp(row0[0] * r + row0[1] * g + row0[2] * b),
    clamp(row1[0] * r + row1[1] * g + row1[2] * b),
    clamp(row2[0] * r + row2[1] * g + row2[2] * b),
  ].map((channel) => Math.round(channel * 255));
  return `rgb(${out[0]}, ${out[1]}, ${out[2]})`;
}

// ---------------------------------------------------------------------------
// Pairs
// ---------------------------------------------------------------------------

export interface ClosestPair {
  a: string;
  b: string;
  delta: number;
}

/**
 * The worst pair in a set, by CIEDE2000.
 *
 * Every pair, not just adjacent ones: in a stacked chart or a legend any two
 * series can end up side by side, so "adjacent slots are distinct" is the
 * wrong question.
 */
export function closestPair(
  colors: readonly string[],
  transform: (color: string) => string = (color) => color
): ClosestPair {
  let worst: ClosestPair = { a: "", b: "", delta: Number.POSITIVE_INFINITY };
  for (let i = 0; i < colors.length; i += 1) {
    for (let j = i + 1; j < colors.length; j += 1) {
      const delta = ciede2000(transform(colors[i]), transform(colors[j]));
      if (delta < worst.delta) {
        worst = { a: colors[i], b: colors[j], delta };
      }
    }
  }
  return worst;
}
