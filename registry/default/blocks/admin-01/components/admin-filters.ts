import { type CsvColumn, toCsv } from "@/components/csv";
import {
  type DateFilter,
  type DateOperator,
  dateFilterFromParams,
  dateFilterToParams,
  dateFilterValue,
  dateOperand,
  datePresets,
  dateQualifier,
  EMPTY_DATE_FILTER,
  matchesDate,
  TODAY,
} from "@/components/date-filter";
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
/**
 * Status is a set with an operator, the same as the payments Status: "every
 * account but the suspended ones" is the question as often as "only the
 * suspended ones".
 */
export type StatusOperator = "is" | "isNot";
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
  createdOp: DateOperator;
  /** A relative rule, `past.7.day` — see `date-filter.ts`. */
  createdRel: string;
  role: RoleFilter;
  search: string;
  seats: SeatsFilter;
  statuses: readonly Status[];
  statusOp: StatusOperator;
  twoFactor: TwoFactorFilter;
}

export const EMPTY_FILTERS: UserFilters = {
  createdAfter: "",
  createdBefore: "",
  createdOp: "between",
  createdRel: "",
  role: "all",
  search: "",
  seats: "all",
  statuses: [],
  statusOp: "is",
  twoFactor: "all",
};

export const STATUS_OPERATORS: readonly {
  label: string;
  value: StatusOperator;
}[] = [
  { label: "is", value: "is" },
  { label: "is not", value: "isNot" },
];

export function statusLabel(status: Status): string {
  return statusLabels[status];
}

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
  twoFactor: [
    { label: "All", value: "all" },
    { label: "Enabled", value: "on" },
    { label: "Not enabled", value: "off" },
  ],
} as const satisfies Record<
  "role" | "seats" | "twoFactor",
  readonly { label: string; value: string }[]
>;

export type OptionKey = keyof typeof OPTIONS;

function optionLabel(key: OptionKey, value: string): string | null {
  return value === "all"
    ? null
    : (OPTIONS[key].find((option) => option.value === value)?.label ?? null);
}

/**
 * The Created presets. Sign-ups are read over longer windows than payments —
 * a month's growth, a year's — so these run to the year rather than the day.
 */
export const CREATED_PRESETS = datePresets([
  { count: 30, dir: "past", unit: "day" },
  { count: 90, dir: "past", unit: "day" },
  { count: 12, dir: "past", unit: "month" },
  { dir: "this", unit: "year" },
]);

/** The Created filter as the date filter reads it. */
export function createdOf(f: {
  createdAfter: string;
  createdBefore: string;
  createdOp: DateOperator;
  createdRel: string;
}): DateFilter {
  return {
    after: f.createdAfter,
    before: f.createdBefore,
    op: f.createdOp,
    rel: f.createdRel,
  };
}

/** A date filter back as the fields it is stored in. */
export function createdPatch(filter: DateFilter) {
  return {
    createdAfter: filter.after,
    createdBefore: filter.before,
    createdOp: filter.op,
    createdRel: filter.rel,
  };
}

const CREATED_CLEAR = createdPatch(EMPTY_DATE_FILTER);

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
  /** The value without its comparison, for the phone's applied rows. */
  operand?: (filters: UserFilters) => string | null;
  /** The operator, when it is not the default: "Status is not: Suspended". */
  operator?: (filters: UserFilters) => string | null;
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
    clear: { statuses: [], statusOp: "is" },
    empty: "All",
    key: "status",
    label: "Status",
    operator: (f) => (f.statusOp === "isNot" ? "is not" : null),
    operand: (f) =>
      f.statuses.length === 0 ? null : f.statuses.map(statusLabel).join(", "),
    // The first pick plus a count of the rest, as the payments pills read.
    value: (f) => {
      if (f.statuses.length === 0) {
        return null;
      }
      const first = statusLabel(f.statuses[0]);
      return f.statuses.length === 1
        ? first
        : `${first}, +${f.statuses.length - 1}`;
    },
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
    clear: CREATED_CLEAR,
    empty: "Any",
    key: "created",
    label: "Created",
    operand: (f) => dateOperand(createdOf(f)),
    operator: (f) => dateQualifier(createdOf(f)),
    value: (f) => dateFilterValue(createdOf(f)),
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
  (user, filters) =>
    filters.statuses.length === 0 ||
    filters.statuses.includes(user.status) === (filters.statusOp === "is"),
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
  (user, filters) => matchesDate(user.createdAt, createdOf(filters), TODAY),
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

/** The table's query as URL parameters, defaults left out. */
export function usersToParams(
  query: DataTableQuery<UserFilters, UserSortKey>
): Record<string, string> {
  const f = query.filters;
  return {
    q: f.search,
    role: f.role === "all" ? "" : f.role,
    status: f.statuses.join(","),
    statusOp: f.statuses.length > 0 && f.statusOp === "isNot" ? "isNot" : "",
    seats: f.seats === "all" ? "" : f.seats,
    twoFactor: f.twoFactor === "all" ? "" : f.twoFactor,
    ...dateFilterToParams(createdOf(f)),
    sort: sortToParam(query.sort, DEFAULT_SORT),
    ...pageToParams(query.pageIndex, query.pageSize, DEFAULT_PAGE_SIZE),
  };
}

/** The inverse, validating every value; anything unrecognised is dropped. */
export function usersFromParams(
  params: URLSearchParams
): Partial<DataTableQuery<UserFilters, UserSortKey>> {
  const option = <K extends OptionKey>(key: K) =>
    oneOf(
      params.get(key),
      OPTIONS[key].map((item) => item.value),
      "all"
    );

  // A single `status=invited`, as older links say it, reads as a list of one.
  const statuses = (params.get("status") ?? "")
    .split(",")
    .filter((value): value is Status => STATUSES.includes(value as Status));

  return {
    filters: {
      ...createdPatch(dateFilterFromParams(params)),
      role: option("role") as RoleFilter,
      search: params.get("q") ?? "",
      seats: option("seats") as SeatsFilter,
      statuses,
      statusOp: oneOf(params.get("statusOp"), ["is", "isNot"], "is"),
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
