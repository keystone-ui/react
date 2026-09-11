import type { SeriesDef } from "@/components/series-legend";

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
  createdAt: string;
  email: string;
  id: string;
  /** Null for the founding account — renders as the empty case on the detail view. */
  invitedBy: string | null;
  lastActive: string;
  lastSignIn: string;
  name: string;
  role: Role;
  seats: number;
  status: Status;
  twoFactor: boolean;
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
    createdAt: "2024-03-04",
    email: "ada@northwind.io",
    id: "usr_3f9a2c81",
    invitedBy: null,
    lastActive: "2 hours ago",
    lastSignIn: "2026-09-11 08:12",
    name: "Ada Okonkwo",
    role: "Admin",
    seats: 1,
    status: "active",
    twoFactor: true,
  },
  {
    createdAt: "2024-06-18",
    email: "bruno@northwind.io",
    id: "usr_7b4e1d02",
    invitedBy: "Ada Okonkwo",
    lastActive: "yesterday",
    lastSignIn: "2026-09-10 17:40",
    name: "Bruno Salgado",
    role: "Member",
    seats: 1,
    status: "active",
    twoFactor: true,
  },
  {
    createdAt: "2024-08-02",
    email: "chen@northwind.io",
    id: "usr_1c8d5f63",
    invitedBy: "Ada Okonkwo",
    lastActive: "3 days ago",
    lastSignIn: "2026-09-08 09:05",
    name: "Chen Wei",
    role: "Billing",
    seats: 1,
    status: "active",
    twoFactor: false,
  },
  {
    createdAt: "2025-01-15",
    email: "dara@northwind.io",
    id: "usr_9a2e4b07",
    invitedBy: "Bruno Salgado",
    lastActive: "never",
    lastSignIn: "2026-09-11 07:58",
    name: "Dara Whitfield",
    role: "Viewer",
    seats: 0,
    status: "invited",
    twoFactor: true,
  },
  {
    createdAt: "2025-02-27",
    email: "eli@northwind.io",
    id: "usr_4d6f0c95",
    invitedBy: "Ada Okonkwo",
    lastActive: "5 minutes ago",
    lastSignIn: "2026-08-29 14:22",
    name: "Eli Fontaine",
    role: "Member",
    seats: 1,
    status: "active",
    twoFactor: false,
  },
  {
    createdAt: "2025-04-09",
    email: "farah@northwind.io",
    id: "usr_8e1b7a24",
    invitedBy: "Dara Whitfield",
    lastActive: "2 weeks ago",
    lastSignIn: "2026-09-09 11:31",
    name: "Farah Nasser",
    role: "Member",
    seats: 1,
    status: "suspended",
    twoFactor: true,
  },
  {
    createdAt: "2025-05-21",
    email: "gus@northwind.io",
    id: "usr_2f5c9d38",
    invitedBy: "Bruno Salgado",
    lastActive: "never",
    lastSignIn: "2026-07-14 16:03",
    name: "Gus Lindqvist",
    role: "Viewer",
    seats: 0,
    status: "invited",
    twoFactor: false,
  },
  {
    createdAt: "2025-07-30",
    email: "hana@northwind.io",
    id: "usr_6b3a8e51",
    invitedBy: "Ada Okonkwo",
    lastActive: "1 hour ago",
    lastSignIn: "2026-09-11 06:47",
    name: "Hana Sato",
    role: "Admin",
    seats: 1,
    status: "active",
    twoFactor: true,
  },
  {
    createdAt: "2025-09-12",
    email: "iris@northwind.io",
    id: "usr_0d7f2c46",
    invitedBy: "Farah Nasser",
    lastActive: "4 days ago",
    lastSignIn: "2026-09-02 10:19",
    name: "Iris Bello",
    role: "Member",
    seats: 1,
    status: "active",
    twoFactor: false,
  },
  {
    createdAt: "2025-11-05",
    email: "jonas@northwind.io",
    id: "usr_5a9e3b18",
    invitedBy: "Dara Whitfield",
    lastActive: "1 month ago",
    lastSignIn: "2026-06-23 13:55",
    name: "Jonas Petrov",
    role: "Viewer",
    seats: 0,
    status: "suspended",
    twoFactor: false,
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
