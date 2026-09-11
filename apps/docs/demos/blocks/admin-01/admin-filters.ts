import { type Role, type Status, statusLabels, type User } from "./mock-admin";

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
// The filter model
// ---------------------------------------------------------------------------

export type SeatsFilter = "all" | "none" | "one" | "many";
export type TwoFactorFilter = "all" | "off" | "on";

export interface UserFilters {
  createdAfter: string;
  createdBefore: string;
  role: RoleFilter;
  search: string;
  seats: SeatsFilter;
  status: StatusFilter;
  twoFactor: TwoFactorFilter;
}

export const EMPTY_FILTERS: UserFilters = {
  createdAfter: "",
  createdBefore: "",
  role: "all",
  search: "",
  seats: "all",
  status: "all",
  twoFactor: "all",
};

export type FilterKey = "created" | "role" | "seats" | "status" | "twoFactor";

export interface FilterDef {
  /** The patch that resets this filter. */
  clear: Partial<UserFilters>;
  /** What the drawer row reads when nothing is set. */
  empty: string;
  key: FilterKey;
  label: string;
  /** The value, or `null` when the filter is unset. */
  value: (filters: UserFilters) => string | null;
}

export const SEATS_OPTIONS: readonly { id: SeatsFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "none", label: "No seats" },
  { id: "one", label: "One seat" },
  { id: "many", label: "More than one" },
];

export const TWO_FACTOR_OPTIONS: readonly {
  id: TwoFactorFilter;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "on", label: "Enabled" },
  { id: "off", label: "Not enabled" },
];

function optionLabel(
  options: readonly { id: string; label: string }[],
  id: string
): string {
  return options.find((option) => option.id === id)?.label ?? "All";
}

/** An open-ended range still has to say which end it is open at. */
function rangeValue(after: string, before: string): string | null {
  if (after && before) {
    return `${after} – ${before}`;
  }
  if (after) {
    return `from ${after}`;
  }
  if (before) {
    return `to ${before}`;
  }
  return null;
}

/**
 * One descriptor per filter, and the only place a filter is declared.
 *
 * The chip row, the drawer's rows and steps, the active count and the
 * predicate all derive from this list, which is what keeps this layout and the
 * pills on the payments table two *renderings* of one model rather than two
 * implementations. It is also what removes the drawer's old hazard: its step
 * indices were hand-assigned integers in two places that had to be kept in
 * step with each other by hand.
 */
export const FILTERS: readonly FilterDef[] = [
  {
    clear: { role: "all" },
    empty: "All",
    key: "role",
    label: "Role",
    value: (f) => (f.role === "all" ? null : f.role),
  },
  {
    clear: { status: "all" },
    empty: "All",
    key: "status",
    label: "Status",
    value: (f) => (f.status === "all" ? null : statusLabels[f.status]),
  },
  {
    clear: { seats: "all" },
    empty: "All",
    key: "seats",
    label: "Seats",
    value: (f) =>
      f.seats === "all" ? null : optionLabel(SEATS_OPTIONS, f.seats),
  },
  {
    clear: { twoFactor: "all" },
    empty: "All",
    key: "twoFactor",
    label: "Two-factor",
    value: (f) =>
      f.twoFactor === "all"
        ? null
        : optionLabel(TWO_FACTOR_OPTIONS, f.twoFactor),
  },
  {
    clear: { createdAfter: "", createdBefore: "" },
    empty: "Any",
    key: "created",
    label: "Created",
    value: (f) => rangeValue(f.createdAfter, f.createdBefore),
  },
];

export function filterDef(key: FilterKey): FilterDef {
  const def = FILTERS.find((item) => item.key === key);
  if (!def) {
    throw new Error(`Unknown filter: ${key}`);
  }
  return def;
}

/** One entry per applied filter — the chip row, and the active count. */
export function appliedFilters(
  filters: UserFilters
): { def: FilterDef; value: string }[] {
  return FILTERS.flatMap((def) => {
    const value = def.value(filters);
    return value === null ? [] : [{ def, value }];
  });
}

/** Search is applied but is not a chip: the field itself shows its own state. */
export function hasActiveFilters(filters: UserFilters): boolean {
  return Boolean(filters.search.trim()) || appliedFilters(filters).length > 0;
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

type UserMatcher = (user: User, filters: UserFilters) => boolean;

/** One predicate per filter, each returning `true` when the filter is unset. */
const MATCHERS: readonly UserMatcher[] = [
  (user, filters) => {
    const query = filters.search.trim().toLowerCase();
    return (
      !query ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  },
  (user, filters) => filters.role === "all" || user.role === filters.role,
  (user, filters) => filters.status === "all" || user.status === filters.status,
  (user, filters) => {
    if (filters.seats === "all") {
      return true;
    }
    if (filters.seats === "none") {
      return user.seats === 0;
    }
    return filters.seats === "one" ? user.seats === 1 : user.seats > 1;
  },
  (user, filters) =>
    filters.twoFactor === "all" ||
    user.twoFactor === (filters.twoFactor === "on"),
  // `createdAt` is an ISO date, so it compares as a string.
  (user, filters) =>
    !filters.createdAfter || user.createdAt >= filters.createdAfter,
  (user, filters) =>
    !filters.createdBefore || user.createdAt <= filters.createdBefore,
];

export function matchesUserFilters(user: User, filters: UserFilters): boolean {
  return MATCHERS.every((matches) => matches(user, filters));
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
