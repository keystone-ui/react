import type { SeriesDef } from "./series-legend";

/**
 * Fixture data.
 *
 * Deterministic on purpose — no `Math.random()`. Chromatic diffs this block on
 * every commit, and the overflow test measures its layout; either would be
 * unusable against output that changes on each render.
 */

export interface RevenuePoint {
  direct: number;
  organic: number;
  other: number;
  paid: number;
  referral: number;
  week: string;
}

export interface ChannelPoint {
  sessions: number;
  week: string;
}

export interface PageRow {
  bounce: number;
  conversion: number;
  path: string;
  views: number;
}

export interface Metric {
  delta: number | null;
  deltaLabel: string | null;
  direction: "down-is-good" | "neutral" | "up-is-good";
  label: string;
  sublabel: string;
  value: string;
}

export const REVENUE_SERIES: readonly SeriesDef[] = [
  { color: 1, key: "organic", label: "Organic" },
  { color: 2, key: "direct", label: "Direct" },
  { color: 3, key: "referral", label: "Referral" },
  { color: 4, key: "paid", label: "Paid" },
  // Not a category — a fold of everything too small to name. A categorical hue
  // here would claim a channel that does not exist.
  { key: "other", label: "Other", token: "muted-foreground" },
];

const WEEKS = [
  "Jun 2",
  "Jun 9",
  "Jun 16",
  "Jun 23",
  "Jun 30",
  "Jul 7",
  "Jul 14",
  "Jul 21",
  "Jul 28",
  "Aug 4",
  "Aug 11",
  "Aug 18",
];

// A fixed multiplier per week, so the shape is varied but reproducible.
const SHAPE = [
  0.82, 0.88, 0.94, 0.91, 1.02, 1.08, 1.04, 1.14, 1.19, 1.12, 1.26, 1.31,
];

export const revenueByWeek: readonly RevenuePoint[] = WEEKS.map(
  (week, index) => {
    const factor = SHAPE[index];
    const round = (base: number) => Math.round(base * factor);
    return {
      direct: round(5400),
      organic: round(8200),
      other: round(900),
      paid: round(3100),
      referral: round(2600),
      week,
    };
  }
);

export const sessionsByWeek: readonly ChannelPoint[] = WEEKS.map(
  (week, index) => ({
    sessions: Math.round(18_400 * SHAPE[index]),
    week,
  })
);

export const topPages: readonly PageRow[] = [
  { bounce: 0.31, conversion: 0.048, path: "/pricing", views: 48_210 },
  {
    bounce: 0.52,
    conversion: 0.011,
    path: "/blog/scaling-postgres",
    views: 31_884,
  },
  { bounce: 0.28, conversion: 0.062, path: "/docs/quickstart", views: 27_450 },
  { bounce: 0.44, conversion: 0.019, path: "/changelog", views: 19_003 },
  { bounce: 0.61, conversion: 0.004, path: "/blog/hiring", views: 15_772 },
  { bounce: 0.24, conversion: 0.081, path: "/signup", views: 12_940 },
  { bounce: 0.38, conversion: 0.026, path: "/integrations", views: 9812 },
  { bounce: 0.47, conversion: 0.014, path: "/about", views: 7106 },
];

export const metrics: readonly Metric[] = [
  {
    delta: 0.124,
    deltaLabel: "+12.4%",
    direction: "up-is-good",
    label: "Revenue",
    sublabel: "vs previous 12 weeks",
    value: "$248,910",
  },
  {
    delta: 0.081,
    deltaLabel: "+8.1%",
    direction: "up-is-good",
    label: "Sessions",
    sublabel: "220,800 total",
    value: "18.4k / wk",
  },
  {
    // Falling is the improvement here — the tile the `direction` prop exists
    // for. It renders green, with a down arrow.
    delta: -0.052,
    deltaLabel: "-5.2%",
    direction: "down-is-good",
    label: "Bounce rate",
    sublabel: "across all pages",
    value: "38.4%",
  },
  {
    delta: null,
    deltaLabel: null,
    direction: "neutral",
    label: "Active accounts",
    sublabel: "no prior period",
    value: "1,204",
  },
];

export const RANGES = ["4w", "12w", "26w"] as const;
export type Range = (typeof RANGES)[number];

/** Trailing slice of the fixture, so the range control does something real. */
export function weeksFor(range: Range): number {
  if (range === "4w") {
    return 4;
  }
  return range === "12w" ? 12 : WEEKS.length;
}
