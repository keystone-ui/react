import { type Role, type Status, statusLabels } from "./mock-admin";

/**
 * The filter and sort vocabulary, owned in one place.
 *
 * The toolbar, the mobile drawer and the page all need the same option lists
 * and labels. `tickets-01` declares its lists twice — inline in the toolbar and
 * again in the drawer — which works until someone adds an option to one of
 * them. One owner, imported three ways, avoids that.
 *
 * Sort types live here too rather than in `admin-users-table.tsx`, so the
 * dependency runs one way: table and toolbar both import this, and this imports
 * neither.
 */

export type RoleFilter = "all" | Role;
export type StatusFilter = "all" | Status;

export type UserSortKey = "id" | "lastActive" | "name" | "role" | "seats";
export type SortDirection = "asc" | "desc";

export interface SortState {
  direction: SortDirection;
  key: UserSortKey;
}

/** "all" is rendered separately above the separator, so it is not in here. */
export const ROLES: readonly Role[] = ["Admin", "Billing", "Member", "Viewer"];
export const STATUSES: readonly Status[] = ["active", "invited", "suspended"];

export function roleLabel(role: RoleFilter): string {
  return role === "all" ? "All roles" : role;
}

/** Shared by the table's Status cell and the detail view, so they cannot drift. */
export const STATUS_VARIANT: Record<
  Status,
  "default" | "outline" | "secondary"
> = {
  active: "secondary",
  invited: "outline",
  suspended: "outline",
};

export function statusLabel(status: StatusFilter): string {
  return status === "all" ? "All statuses" : statusLabels[status];
}

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

/**
 * A sort state flattened to a single string, so one `RadioGroup` can drive it.
 *
 * The toolbar and the table headers write the *same* `sort` state — picking
 * "Name Z–A" moves the header arrow, and clicking a header updates the
 * toolbar's label, with no syncing code. That only holds if every state the
 * headers can reach is nameable here, so all eight key × direction pairs are
 * listed even though a few are unlikely to be picked from the menu. A state the
 * headers could produce but the toolbar could not name would leave the radio
 * group with nothing selected.
 */
export type SortOptionId = "none" | `${UserSortKey}:${SortDirection}`;

export const SORT_OPTIONS: readonly { id: SortOptionId; label: string }[] = [
  { id: "none", label: "Unsorted" },
  { id: "id:asc", label: "ID, first added" },
  { id: "id:desc", label: "ID, last added" },
  { id: "name:asc", label: "Name A–Z" },
  { id: "name:desc", label: "Name Z–A" },
  { id: "role:asc", label: "Role A–Z" },
  { id: "role:desc", label: "Role Z–A" },
  { id: "seats:desc", label: "Seats, most first" },
  { id: "seats:asc", label: "Seats, fewest first" },
  { id: "lastActive:desc", label: "Last active, newest" },
  { id: "lastActive:asc", label: "Last active, oldest" },
];

export function toSortOptionId(sort: SortState | null): SortOptionId {
  return sort ? `${sort.key}:${sort.direction}` : "none";
}

export function fromSortOptionId(id: SortOptionId): SortState | null {
  if (id === "none") {
    return null;
  }
  const [key, direction] = id.split(":");
  return { direction: direction as SortDirection, key: key as UserSortKey };
}

export function sortLabel(sort: SortState | null): string {
  const id = toSortOptionId(sort);
  return SORT_OPTIONS.find((option) => option.id === id)?.label ?? "Unsorted";
}
