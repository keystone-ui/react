/**
 * Fixture users. Deterministic — no `Math.random()`, so Chromatic and the
 * layout tests get stable output.
 *
 * One file, read in two places: `use-users-table.ts` hands `users` to the
 * table, and `users-view.tsx` (or admin-01's `admin-page.tsx`) looks up the
 * open user. Swap the `users` array for your own rows, and keep `User`,
 * `Role`, `Status` and `statusLabels`: the table, filters and record import
 * them.
 */

export type Role = "Admin" | "Billing" | "Member" | "Viewer";
export type Status = "active" | "invited" | "suspended";

export interface User {
  createdAt: string;
  email: string;
  id: string;
  /** The inviting user's id. Null for the founding account. */
  invitedBy: string | null;
  lastActive: string;
  lastSignIn: string;
  name: string;
  role: Role;
  seats: number;
  status: Status;
  twoFactor: boolean;
}

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
    invitedBy: "usr_3f9a2c81",
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
    invitedBy: "usr_3f9a2c81",
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
    invitedBy: "usr_7b4e1d02",
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
    invitedBy: "usr_3f9a2c81",
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
    invitedBy: "usr_9a2e4b07",
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
    invitedBy: "usr_7b4e1d02",
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
    invitedBy: "usr_3f9a2c81",
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
    invitedBy: "usr_8e1b7a24",
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
    invitedBy: "usr_9a2e4b07",
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
