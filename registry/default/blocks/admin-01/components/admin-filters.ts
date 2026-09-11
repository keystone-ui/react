import { type Role, type Status, statusLabels } from "@/components/mock-admin";

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
  // Bare "All": the trigger and the drawer row both say Role already.
  return role === "all" ? "All" : role;
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
  return status === "all" ? "All" : statusLabels[status];
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

/**
 * Sorting is two choices, not one: which column, then which way.
 *
 * The flat cross-product this replaces listed every pairing — eleven entries
 * for five columns — so changing direction meant finding your column again in
 * a list that had grown to hold both. Split, it is five plus two, and every
 * state the column headers can reach is expressible by construction rather
 * than by remembering to add the pairing.
 */
export const SORT_KEYS: readonly { id: UserSortKey; label: string }[] = [
  { id: "id", label: "ID" },
  { id: "name", label: "Name" },
  { id: "role", label: "Role" },
  { id: "seats", label: "Seats" },
  { id: "lastActive", label: "Last active" },
];

/**
 * What a direction means for the column it applies to. "Ascending" is
 * accurate and says nothing — "A–Z" and "Newest first" say what you will see.
 */
const DIRECTION_LABELS: Record<UserSortKey, Record<SortDirection, string>> = {
  id: { asc: "First added", desc: "Last added" },
  lastActive: { asc: "Oldest first", desc: "Newest first" },
  name: { asc: "A–Z", desc: "Z–A" },
  role: { asc: "A–Z", desc: "Z–A" },
  seats: { asc: "Fewest first", desc: "Most first" },
};

export function directionLabel(
  key: UserSortKey,
  direction: SortDirection
): string {
  return DIRECTION_LABELS[key][direction];
}

/**
 * The direction a column takes when it is first chosen. Names read forwards;
 * counts and dates are asked about from the large end, which is the same rule
 * the column headers use on a first click.
 */
export function defaultDirection(key: UserSortKey): SortDirection {
  return key === "name" || key === "role" ? "asc" : "desc";
}

export function sortKeyLabel(sort: SortState | null): string {
  return sort
    ? (SORT_KEYS.find((option) => option.id === sort.key)?.label ?? "Unsorted")
    : "Unsorted";
}
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

/** "Name (A–Z)" — the column, then what the order means for it. */
export function sortLabel(sort: SortState | null): string {
  return sort
    ? `${sortKeyLabel(sort)} (${directionLabel(sort.key, sort.direction)})`
    : "Unsorted";
}
