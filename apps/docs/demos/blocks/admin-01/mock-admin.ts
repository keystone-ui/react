import type { SeriesDef } from "./series-legend";

/**
 * Fixture data. Deterministic — no `Math.random()`, so Chromatic and the
 * layout tests get stable output.
 *
 * Deliberately not shared with `dashboard-01`: only the four chart
 * infrastructure files are duplicated between blocks, and duplicating the
 * content too would make both blocks the same demo twice.
 */

export type Role = "Admin" | "Billing" | "Member" | "Viewer";
export type Status = "active" | "invited" | "suspended";

export interface User {
  email: string;
  id: string;
  lastActive: string;
  name: string;
  role: Role;
  seats: number;
  status: Status;
}

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

export const users: readonly User[] = [
  {
    email: "ada@northwind.io",
    id: "u_01",
    lastActive: "2 hours ago",
    name: "Ada Okonkwo",
    role: "Admin",
    seats: 1,
    status: "active",
  },
  {
    email: "bruno@northwind.io",
    id: "u_02",
    lastActive: "yesterday",
    name: "Bruno Salgado",
    role: "Member",
    seats: 1,
    status: "active",
  },
  {
    email: "chen@northwind.io",
    id: "u_03",
    lastActive: "3 days ago",
    name: "Chen Wei",
    role: "Billing",
    seats: 1,
    status: "active",
  },
  {
    email: "dara@northwind.io",
    id: "u_04",
    lastActive: "never",
    name: "Dara Whitfield",
    role: "Viewer",
    seats: 0,
    status: "invited",
  },
  {
    email: "eli@northwind.io",
    id: "u_05",
    lastActive: "5 minutes ago",
    name: "Eli Fontaine",
    role: "Member",
    seats: 1,
    status: "active",
  },
  {
    email: "farah@northwind.io",
    id: "u_06",
    lastActive: "2 weeks ago",
    name: "Farah Nasser",
    role: "Member",
    seats: 1,
    status: "suspended",
  },
  {
    email: "gus@northwind.io",
    id: "u_07",
    lastActive: "never",
    name: "Gus Lindqvist",
    role: "Viewer",
    seats: 0,
    status: "invited",
  },
  {
    email: "hana@northwind.io",
    id: "u_08",
    lastActive: "1 hour ago",
    name: "Hana Sato",
    role: "Admin",
    seats: 1,
    status: "active",
  },
  {
    email: "iris@northwind.io",
    id: "u_09",
    lastActive: "4 days ago",
    name: "Iris Bello",
    role: "Member",
    seats: 1,
    status: "active",
  },
  {
    email: "jonas@northwind.io",
    id: "u_10",
    lastActive: "1 month ago",
    name: "Jonas Petrov",
    role: "Viewer",
    seats: 0,
    status: "suspended",
  },
];

export const statusLabels: Record<Status, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
};

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
