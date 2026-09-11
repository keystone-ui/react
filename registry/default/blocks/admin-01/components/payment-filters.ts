import {
  type Currency,
  type Payment,
  type PaymentStatus,
  type PaymentType,
  type Provider,
  paymentStatusLabels,
} from "@/components/mock-payments";

/**
 * The payments filter vocabulary, owned in one place.
 *
 * Eleven filters is past what a toolbar row can hold, so most of them live in
 * a panel. That only works if what is applied stays visible while the panel is
 * shut — hence `activeFilterChips`, which turns the state into a list of
 * labelled, individually removable entries. Without it the panel hides the
 * answer to "why am I looking at four rows?".
 */

export type TypeFilter = "all" | PaymentType;
export type StatusFilter = "all" | PaymentStatus;
export type ProviderFilter = "all" | Provider;

export interface PaymentFilters {
  amountMax: string;
  amountMin: string;
  cashoutStatus: StatusFilter;
  createdAfter: string;
  createdBefore: string;
  currencies: readonly Currency[];
  depositStatus: StatusFilter;
  email: string;
  provider: ProviderFilter;
  type: TypeFilter;
}

export const EMPTY_FILTERS: PaymentFilters = {
  amountMax: "",
  amountMin: "",
  cashoutStatus: "all",
  createdAfter: "",
  createdBefore: "",
  currencies: [],
  depositStatus: "all",
  email: "",
  provider: "all",
  type: "all",
};

export const STATUS_OPTIONS: readonly StatusFilter[] = [
  "all",
  "completed",
  "in-progress",
  "failed",
];

const TYPE_LABELS: Record<TypeFilter, string> = {
  all: "All types",
  cashout: "Cashout",
  deposit: "Deposit",
};

export function typeLabel(type: TypeFilter): string {
  return TYPE_LABELS[type];
}

export function statusLabel(status: StatusFilter): string {
  return status === "all" ? "All statuses" : paymentStatusLabels[status];
}

export function providerLabel(provider: ProviderFilter): string {
  return provider === "all" ? "All providers" : provider;
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
 * A list rather than a single predicate with ten early returns: a filter set is
 * exactly a conjunction, and writing it as one keeps each rule readable on its
 * own and makes adding the eleventh a one-line change.
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
  // Status is held per type, so each one only judges its own rows.
  (payment, filters) => {
    const wanted =
      payment.type === "cashout"
        ? filters.cashoutStatus
        : filters.depositStatus;
    return wanted === "all" || payment.status === wanted;
  },
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
// Applied state
// ---------------------------------------------------------------------------

export interface FilterChip {
  /** The patch that removes just this one. */
  clear: Partial<PaymentFilters>;
  key: string;
  label: string;
}

/**
 * One entry per applied filter, each knowing how to remove itself.
 *
 * Currencies expand to one chip per selection rather than a single "3
 * currencies" chip: the point of a chip is to be removable, and removing a
 * whole multi-select is a different action from dropping one value from it.
 */
export function activeFilterChips(filters: PaymentFilters): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.email.trim()) {
    chips.push({
      clear: { email: "" },
      key: "email",
      label: `Email: ${filters.email.trim()}`,
    });
  }

  for (const currency of filters.currencies) {
    chips.push({
      clear: {
        currencies: filters.currencies.filter((item) => item !== currency),
      },
      key: `currency:${currency}`,
      label: currency,
    });
  }

  if (filters.type !== "all") {
    chips.push({
      clear: { type: "all" },
      key: "type",
      label: typeLabel(filters.type),
    });
  }

  if (filters.cashoutStatus !== "all") {
    chips.push({
      clear: { cashoutStatus: "all" },
      key: "cashoutStatus",
      label: `Cashout: ${statusLabel(filters.cashoutStatus)}`,
    });
  }

  if (filters.depositStatus !== "all") {
    chips.push({
      clear: { depositStatus: "all" },
      key: "depositStatus",
      label: `Deposit: ${statusLabel(filters.depositStatus)}`,
    });
  }

  if (filters.provider !== "all") {
    chips.push({
      clear: { provider: "all" },
      key: "provider",
      label: filters.provider,
    });
  }

  if (filters.createdAfter) {
    chips.push({
      clear: { createdAfter: "" },
      key: "createdAfter",
      label: `After ${filters.createdAfter}`,
    });
  }

  if (filters.createdBefore) {
    chips.push({
      clear: { createdBefore: "" },
      key: "createdBefore",
      label: `Before ${filters.createdBefore}`,
    });
  }

  if (filters.amountMin) {
    chips.push({
      clear: { amountMin: "" },
      key: "amountMin",
      label: `≥ ${filters.amountMin}`,
    });
  }

  if (filters.amountMax) {
    chips.push({
      clear: { amountMax: "" },
      key: "amountMax",
      label: `≤ ${filters.amountMax}`,
    });
  }

  return chips;
}

/**
 * How many filters live only in the panel — the number the Filters button
 * carries. Type and the statuses are excluded because they have their own
 * controls in the toolbar, and counting a filter you can already see would
 * make the badge read as a second, contradictory signal.
 */
export function panelFilterCount(filters: PaymentFilters): number {
  return (
    filters.currencies.length +
    (filters.provider === "all" ? 0 : 1) +
    (filters.createdAfter ? 1 : 0) +
    (filters.createdBefore ? 1 : 0) +
    (filters.amountMin ? 1 : 0) +
    (filters.amountMax ? 1 : 0)
  );
}
