import {
  type Currency,
  type Payment,
  type PaymentStatus,
  type PaymentType,
  PROVIDERS,
  type Provider,
  paymentStatusLabels,
} from "@/components/mock-payments";

/**
 * The payments filter vocabulary, owned in one place.
 *
 * Every filter is a pill that names its own dimension — `Action: Deposit`, not
 * `Deposit`. A bare value turns ambiguous the moment it sits beside another
 * one: is "Deposit" a type or a status? Naming the dimension also lets the
 * control double as the record of what is applied, which is why there is no
 * separate chip row here. A chip repeating a visible pill is a second
 * representation of the same fact, and two representations can disagree.
 *
 * `FILTERS` below is the single source of truth that the toolbar pills, the
 * add-filter menu and the mobile drawer all read.
 */

export type TypeFilter = "all" | PaymentType;
export type StatusFilter = "all" | PaymentStatus;
export type ProviderFilter = "all" | Provider;

export interface PaymentFilters {
  amountMax: string;
  amountMin: string;
  createdAfter: string;
  createdBefore: string;
  currencies: readonly Currency[];
  email: string;
  provider: ProviderFilter;
  status: StatusFilter;
  type: TypeFilter;
}

export const EMPTY_FILTERS: PaymentFilters = {
  amountMax: "",
  amountMin: "",
  createdAfter: "",
  createdBefore: "",
  currencies: [],
  email: "",
  provider: "all",
  status: "all",
  type: "all",
};

export const STATUS_OPTIONS: readonly StatusFilter[] = [
  "all",
  "completed",
  "in-progress",
  "failed",
];

export const TYPE_OPTIONS: readonly TypeFilter[] = [
  "all",
  "deposit",
  "cashout",
];

export const PROVIDER_OPTIONS: readonly ProviderFilter[] = [
  "all",
  ...PROVIDERS,
];

/**
 * The unset value reads as a bare "All" because the pill already says which
 * dimension it belongs to — "Action: All types" would say it twice.
 */
const TYPE_LABELS: Record<TypeFilter, string> = {
  all: "All",
  cashout: "Cashout",
  deposit: "Deposit",
};

export function typeLabel(type: TypeFilter): string {
  return TYPE_LABELS[type];
}

export function statusLabel(status: StatusFilter): string {
  return status === "all" ? "All" : paymentStatusLabels[status];
}

export function providerLabel(provider: ProviderFilter): string {
  return provider === "all" ? "All" : provider;
}

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

export type PaymentSortKey = "amount" | "createdAt" | "playerEmail" | "status";
export type SortDirection = "asc" | "desc";

export interface SortState {
  direction: SortDirection;
  key: PaymentSortKey;
}

export type SortOptionId = `${PaymentSortKey}:${SortDirection}`;

export const SORT_OPTIONS: readonly { id: SortOptionId; label: string }[] = [
  { id: "createdAt:desc", label: "Created, newest" },
  { id: "createdAt:asc", label: "Created, oldest" },
  { id: "amount:desc", label: "Amount, largest" },
  { id: "amount:asc", label: "Amount, smallest" },
  { id: "playerEmail:asc", label: "Player A–Z" },
  { id: "playerEmail:desc", label: "Player Z–A" },
  { id: "status:asc", label: "Status A–Z" },
  { id: "status:desc", label: "Status Z–A" },
];

export const DEFAULT_SORT: SortState = { direction: "desc", key: "createdAt" };

export function toSortOptionId(sort: SortState): SortOptionId {
  return `${sort.key}:${sort.direction}`;
}

export function fromSortOptionId(id: SortOptionId): SortState {
  const [key, direction] = id.split(":");
  return { direction: direction as SortDirection, key: key as PaymentSortKey };
}

export function sortLabel(sort: SortState): string {
  const id = toSortOptionId(sort);
  return SORT_OPTIONS.find((option) => option.id === id)?.label ?? "Sort";
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

type PaymentMatcher = (payment: Payment, filters: PaymentFilters) => boolean;

/**
 * One predicate per filter, each returning `true` when the filter is unset.
 *
 * A list rather than a single predicate with nine early returns: a filter set
 * is exactly a conjunction, and writing it as one keeps each rule readable on
 * its own and makes adding the tenth a one-line change.
 */
const MATCHERS: readonly PaymentMatcher[] = [
  (payment, filters) => {
    const query = filters.email.trim().toLowerCase();
    return !query || payment.playerEmail.toLowerCase().includes(query);
  },
  (payment, filters) =>
    filters.currencies.length === 0 ||
    filters.currencies.includes(payment.currency),
  (payment, filters) => filters.type === "all" || payment.type === filters.type,
  (payment, filters) =>
    filters.status === "all" || payment.status === filters.status,
  (payment, filters) =>
    filters.provider === "all" || payment.provider === filters.provider,
  // The timestamps are ISO, so the date half compares as a string.
  (payment, filters) =>
    !filters.createdAfter ||
    payment.createdAt.slice(0, 10) >= filters.createdAfter,
  (payment, filters) =>
    !filters.createdBefore ||
    payment.createdAt.slice(0, 10) <= filters.createdBefore,
  (payment, filters) =>
    !filters.amountMin || Number(payment.amount) >= Number(filters.amountMin),
  (payment, filters) =>
    !filters.amountMax || Number(payment.amount) <= Number(filters.amountMax),
];

export function matchesPaymentFilters(
  payment: Payment,
  filters: PaymentFilters
): boolean {
  return MATCHERS.every((matches) => matches(payment, filters));
}

export function sortPayments(
  rows: readonly Payment[],
  sort: SortState
): Payment[] {
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) =>
    sort.key === "amount"
      ? (Number(a.amount) - Number(b.amount)) * factor
      : a[sort.key].localeCompare(b[sort.key]) * factor
  );
}

// ---------------------------------------------------------------------------
// The pills
// ---------------------------------------------------------------------------

export type FilterKey =
  | "amount"
  | "created"
  | "currencies"
  | "provider"
  | "status"
  | "type";

export interface FilterDef {
  /** The patch that resets this filter. */
  clear: Partial<PaymentFilters>;
  /**
   * What the pill reads when nothing is set. "All" suits a set of options;
   * a range is not a set, so its bounds read as "Any".
   */
  empty: string;
  key: FilterKey;
  /** The dimension, shown muted ahead of the value. */
  label: string;
  /** The value, or `null` when the filter is unset. */
  value: (filters: PaymentFilters) => string | null;
}

/**
 * Two filters sit on the toolbar permanently because they are the cuts people
 * take first. The rest are added on demand: every pill costs horizontal room,
 * and a row that always carries all six wraps before anyone has used one.
 */
export const DEFAULT_KEYS: readonly FilterKey[] = ["type", "status"];

export const FILTERS: readonly FilterDef[] = [
  {
    clear: { type: "all" },
    empty: "All",
    key: "type",
    label: "Action",
    value: (f) => (f.type === "all" ? null : typeLabel(f.type)),
  },
  {
    clear: { status: "all" },
    empty: "All",
    key: "status",
    label: "Status",
    value: (f) => (f.status === "all" ? null : statusLabel(f.status)),
  },
  {
    clear: { currencies: [] },
    empty: "All",
    key: "currencies",
    label: "Currency",
    // One selection reads as itself; several read as a count, because four
    // tickers side by side stop being scannable and start being a sentence.
    value: (f) => {
      if (f.currencies.length === 0) {
        return null;
      }
      return f.currencies.length === 1
        ? f.currencies[0]
        : String(f.currencies.length);
    },
  },
  {
    clear: { provider: "all" },
    empty: "All",
    key: "provider",
    label: "Provider",
    value: (f) => (f.provider === "all" ? null : f.provider),
  },
  {
    clear: { createdAfter: "", createdBefore: "" },
    empty: "Any",
    key: "created",
    label: "Created",
    value: (f) => rangeValue(f.createdAfter, f.createdBefore),
  },
  {
    clear: { amountMax: "", amountMin: "" },
    empty: "Any",
    key: "amount",
    label: "Amount",
    value: (f) => rangeValue(f.amountMin, f.amountMax),
  },
];

/** An open-ended range still has to say which end it is open at. */
function rangeValue(min: string, max: string): string | null {
  if (min && max) {
    return `${min} – ${max}`;
  }
  if (min) {
    return `from ${min}`;
  }
  if (max) {
    return `to ${max}`;
  }
  return null;
}

export function filterDef(key: FilterKey): FilterDef {
  const def = FILTERS.find((item) => item.key === key);
  if (!def) {
    throw new Error(`Unknown filter: ${key}`);
  }
  return def;
}

/**
 * Which pills the toolbar shows: the permanent ones, the ones added by hand,
 * and — the load-bearing term — every filter that currently holds a value.
 *
 * That last one is what makes applied state impossible to hide. A filter with
 * a value and no pill is exactly the failure the old chip row existed to paper
 * over; here it cannot happen, rather than merely being tested for.
 */
export function visibleKeys(
  filters: PaymentFilters,
  added: readonly FilterKey[]
): FilterKey[] {
  return FILTERS.filter(
    (def) =>
      DEFAULT_KEYS.includes(def.key) ||
      added.includes(def.key) ||
      def.value(filters) !== null
  ).map((def) => def.key);
}

/** Filters still available to add — the add-filter menu's contents. */
export function addableKeys(
  filters: PaymentFilters,
  added: readonly FilterKey[]
): FilterKey[] {
  const visible = visibleKeys(filters, added);
  return FILTERS.filter((def) => !visible.includes(def.key)).map(
    (def) => def.key
  );
}

/** Whether anything at all is applied, search included. */
export function hasActiveFilters(filters: PaymentFilters): boolean {
  return (
    Boolean(filters.email.trim()) ||
    FILTERS.some((def) => def.value(filters) !== null)
  );
}
