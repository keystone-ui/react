import { type CsvColumn, toCsv } from "@/components/csv";
import {
  addableKeys as addableKeysOf,
  visibleKeys as visibleKeysOf,
} from "@/components/filter-row";
import {
  type Role,
  type Status,
  statusLabels,
  type User,
} from "@/components/mock-admin";
import type {
  SortState as BaseSortState,
  SortDirection,
} from "@/components/sort";
import {
  oneOf,
  pageFromParams,
  pageToParams,
  sortFromParam,
  sortToParam,
} from "@/components/url-params";
import type { DataTableQuery } from "@/components/use-data-table";

/**
 * The users table's filter and sort vocabulary, owned in one place.
 *
 * The pills, the phone drawer, the URL and the page all need the same option
 * lists and labels. One owner, imported each way, is what keeps an option
 * added to one of them from going missing in another. It is the same shape as
 * `payment-filters.ts`, so both toolbars are one design over two vocabularies.
 */

export type RoleFilter = "all" | Role;
export type StatusFilter = "all" | Status;
export type SeatsFilter = "all" | "none" | "one" | "many";
export type TwoFactorFilter = "all" | "off" | "on";

export const ROLES: readonly Role[] = ["Admin", "Billing", "Member", "Viewer"];
export const STATUSES: readonly Status[] = ["active", "invited", "suspended"];

/** Shared by the table's Status cell and the detail view, so they cannot drift. */
export const STATUS_VARIANT: Record<
  Status,
  "default" | "outline" | "secondary"
> = {
  active: "secondary",
  invited: "outline",
  suspended: "outline",
};

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

/**
 * Each single-select filter's options, `All` first. The pills and the drawer
 * both list these, so the two cannot offer different choices.
 *
 * The unset value reads as a bare "All" because the pill already says which
 * dimension it belongs to — "Role: All roles" would say it twice.
 */
export const OPTIONS = {
  role: [
    { label: "All", value: "all" },
    ...ROLES.map((role) => ({ label: role, value: role })),
  ],
  seats: [
    { label: "All", value: "all" },
    { label: "No seats", value: "none" },
    { label: "One seat", value: "one" },
    { label: "More than one", value: "many" },
  ],
  status: [
    { label: "All", value: "all" },
    ...STATUSES.map((status) => ({
      label: statusLabels[status],
      value: status,
    })),
  ],
  twoFactor: [
    { label: "All", value: "all" },
    { label: "Enabled", value: "on" },
    { label: "Not enabled", value: "off" },
  ],
} as const satisfies Record<
  "role" | "seats" | "status" | "twoFactor",
  readonly { label: string; value: string }[]
>;

export type OptionKey = keyof typeof OPTIONS;

function optionLabel(key: OptionKey, value: string): string | null {
  return value === "all"
    ? null
    : (OPTIONS[key].find((option) => option.value === value)?.label ?? null);
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

// ---------------------------------------------------------------------------
// The pills
// ---------------------------------------------------------------------------

export type FilterKey = "created" | "role" | "seats" | "status" | "twoFactor";

export interface FilterDef {
  /** The patch that resets this filter. */
  clear: Partial<UserFilters>;
  /** What the pill reads when nothing is set. */
  empty: string;
  key: FilterKey;
  /** The dimension, shown muted ahead of the value. */
  label: string;
  /** The value, or `null` when the filter is unset. */
  value: (filters: UserFilters) => string | null;
}

/**
 * One descriptor per filter, and the only place a filter is declared. The
 * pills, the drawer's rows and steps, the active count and the URL all derive
 * from this list.
 */
export const FILTERS: readonly FilterDef[] = [
  {
    clear: { role: "all" },
    empty: "All",
    key: "role",
    label: "Role",
    value: (f) => optionLabel("role", f.role),
  },
  {
    clear: { status: "all" },
    empty: "All",
    key: "status",
    label: "Status",
    value: (f) => optionLabel("status", f.status),
  },
  {
    clear: { seats: "all" },
    empty: "All",
    key: "seats",
    label: "Seats",
    value: (f) => optionLabel("seats", f.seats),
  },
  {
    clear: { twoFactor: "all" },
    empty: "All",
    key: "twoFactor",
    label: "Two-factor",
    value: (f) => optionLabel("twoFactor", f.twoFactor),
  },
  {
    clear: { createdAfter: "", createdBefore: "" },
    empty: "Any",
    key: "created",
    label: "Created",
    value: (f) => rangeValue(f.createdAfter, f.createdBefore),
  },
];

/** The two cuts people take first; the rest are added on demand. */
export const DEFAULT_KEYS: readonly FilterKey[] = ["role", "status"];

export function filterDef(key: FilterKey): FilterDef {
  const def = FILTERS.find((item) => item.key === key);
  if (!def) {
    throw new Error(`Unknown filter: ${key}`);
  }
  return def;
}

export function visibleKeys(
  filters: UserFilters,
  added: readonly FilterKey[]
): FilterKey[] {
  return visibleKeysOf(FILTERS, filters, added);
}

export function addableKeys(
  filters: UserFilters,
  added: readonly FilterKey[]
): FilterKey[] {
  return addableKeysOf(FILTERS, filters, added);
}

/** How many filters hold a value — the phone drawer trigger's badge. */
export function activeCount(filters: UserFilters): number {
  return FILTERS.filter((def) => def.value(filters) !== null).length;
}

/** Whether anything at all is applied, search included. */
export function hasActiveFilters(filters: UserFilters): boolean {
  return Boolean(filters.search.trim()) || activeCount(filters) > 0;
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

export type UserSortKey = "id" | "lastActive" | "name" | "role" | "seats";

/**
 * Always set, like the payments sort. The "Unsorted" option this replaces
 * meant fixture order, which is no order anyone asked for, and it gave the
 * headers a third click that undid the second.
 */
export type SortState = BaseSortState<UserSortKey>;

export const SORT_KEYS: readonly { id: UserSortKey; label: string }[] = [
  { id: "name", label: "Name" },
  { id: "role", label: "Role" },
  { id: "seats", label: "Seats" },
  { id: "lastActive", label: "Last active" },
  { id: "id", label: "ID" },
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
 * The direction a column takes when it is first chosen, from the menu or a
 * header. Names read forwards; counts and recency are asked about from the
 * large end.
 */
export function defaultDirection(key: UserSortKey): SortDirection {
  return key === "name" || key === "role" ? "asc" : "desc";
}

export const DEFAULT_SORT: SortState = { direction: "asc", key: "name" };

/** "Name (A–Z)" — the column, then what the order means for it. */
export function sortLabel(sort: SortState): string {
  const key = SORT_KEYS.find((option) => option.id === sort.key)?.label;
  return `${key} (${directionLabel(sort.key, sort.direction)})`;
}

const RELATIVE = /^(\d+|an?) (minute|hour|day|week|month|year)s? ago$/;
const MINUTES = {
  day: 1440,
  hour: 60,
  minute: 1,
  month: 43_200,
  week: 10_080,
  year: 525_600,
} as const;

/**
 * How long ago "Last active" was, in minutes, or `null` for "never".
 *
 * The fixture stores the text the table shows — "2 hours ago" — rather than a
 * timestamp, and that text does not sort: "yesterday" comes after "5 minutes
 * ago" alphabetically. A real table sorts on the timestamp behind the label.
 */
export function minutesAgo(text: string): number | null {
  if (text === "never") {
    return null;
  }
  if (text === "yesterday") {
    return MINUTES.day;
  }
  const match = RELATIVE.exec(text);
  if (!match) {
    return null;
  }
  const count = Number.isNaN(Number(match[1])) ? 1 : Number(match[1]);
  return count * MINUTES[match[2] as keyof typeof MINUTES];
}

/**
 * Users who have never been active have no recency to order by, so they sink
 * to the end in both directions — the same rule as an unfinished payment.
 */
export function sortUsers(rows: readonly User[], sort: SortState): User[] {
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (sort.key === "lastActive") {
      const left = minutesAgo(a.lastActive);
      const right = minutesAgo(b.lastActive);
      if (left === null || right === null) {
        return Number(left === null) - Number(right === null);
      }
      // Fewer minutes ago is newer, so "Newest first" (desc) is ascending
      // minutes.
      return (right - left) * factor;
    }
    if (sort.key === "seats") {
      return (a.seats - b.seats) * factor;
    }
    return a[sort.key].localeCompare(b[sort.key]) * factor;
  });
}

// ---------------------------------------------------------------------------
// URL
// ---------------------------------------------------------------------------

export const PAGE_SIZES = [5, 10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 5;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The table's query as URL parameters, defaults left out. */
export function usersToParams(
  query: DataTableQuery<UserFilters, UserSortKey>
): Record<string, string> {
  const f = query.filters;
  return {
    q: f.search,
    role: f.role === "all" ? "" : f.role,
    status: f.status === "all" ? "" : f.status,
    seats: f.seats === "all" ? "" : f.seats,
    twoFactor: f.twoFactor === "all" ? "" : f.twoFactor,
    from: f.createdAfter,
    to: f.createdBefore,
    sort: sortToParam(query.sort, DEFAULT_SORT),
    ...pageToParams(query.pageIndex, query.pageSize, DEFAULT_PAGE_SIZE),
  };
}

/** The inverse, validating every value; anything unrecognised is dropped. */
export function usersFromParams(
  params: URLSearchParams
): Partial<DataTableQuery<UserFilters, UserSortKey>> {
  const date = (key: string) => {
    const value = params.get(key) ?? "";
    return ISO_DATE.test(value) ? value : "";
  };
  const option = <K extends OptionKey>(key: K) =>
    oneOf(
      params.get(key),
      OPTIONS[key].map((item) => item.value),
      "all"
    );

  return {
    filters: {
      createdAfter: date("from"),
      createdBefore: date("to"),
      role: option("role") as RoleFilter,
      search: params.get("q") ?? "",
      seats: option("seats") as SeatsFilter,
      status: option("status") as StatusFilter,
      twoFactor: option("twoFactor") as TwoFactorFilter,
    },
    sort: sortFromParam(
      params.get("sort"),
      SORT_KEYS.map((key) => key.id)
    ),
    ...pageFromParams(params, PAGE_SIZES),
  };
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

const CSV_COLUMNS: readonly CsvColumn<User>[] = [
  ["User ID", (u) => u.id],
  ["Name", (u) => u.name],
  ["Email", (u) => u.email],
  ["Role", (u) => u.role],
  ["Status", (u) => u.status],
  ["Seats", (u) => String(u.seats)],
  ["Two-factor", (u) => (u.twoFactor ? "on" : "off")],
  ["Created", (u) => u.createdAt],
  ["Last sign-in", (u) => u.lastSignIn],
];

/** Raw values, as the payments export writes them: ids, not labels. */
export function toUsersCsv(rows: readonly User[]): string {
  return toCsv(CSV_COLUMNS, rows);
}
