import type { SeriesDef } from "@/components/series-legend";

/**
 * Fixture data. Deterministic — no `Math.random()`, so Chromatic and the
 * layout tests get stable output.
 *
 * Deliberately not shared with `dashboard-01`: only the four chart
 * infrastructure files are duplicated between blocks, and duplicating the
 * content too would make both blocks the same demo twice.
 */

export interface SignupPoint {
  month: string;
  paid: number;
  trial: number;
}

export const SIGNUP_SERIES: readonly SeriesDef[] = [
  { color: 1, key: "trial", label: "Trial" },
  { color: 2, key: "paid", label: "Paid" },
];

const MONTHS = [
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
];
const TRIAL = [42, 51, 47, 39, 68, 74, 81, 77, 92, 88, 104, 118];
const PAID = [11, 14, 13, 10, 19, 22, 26, 24, 31, 29, 38, 44];

export const signupsByMonth: readonly SignupPoint[] = MONTHS.map(
  (month, index) => ({
    month,
    paid: PAID[index],
    trial: TRIAL[index],
  })
);

export interface AdminMetric {
  delta: number | null;
  deltaLabel: string | null;
  direction: "down-is-good" | "neutral" | "up-is-good";
  label: string;
  sublabel: string;
  value: string;
}

export const adminMetrics: readonly AdminMetric[] = [
  {
    delta: 0.184,
    deltaLabel: "+18.4%",
    direction: "up-is-good",
    label: "Paid accounts",
    sublabel: "44 added this month",
    value: "281",
  },
  {
    delta: 0.052,
    deltaLabel: "+5.2%",
    direction: "up-is-good",
    label: "Seats in use",
    sublabel: "of 340 licensed",
    value: "268",
  },
  {
    // Falling churn is the improvement — renders green, with a down arrow.
    delta: -0.021,
    deltaLabel: "-2.1%",
    direction: "down-is-good",
    label: "Monthly churn",
    sublabel: "trailing 30 days",
    value: "1.8%",
  },
  {
    delta: null,
    deltaLabel: null,
    direction: "neutral",
    label: "Open invites",
    sublabel: "no prior period",
    value: "2",
  },
];
