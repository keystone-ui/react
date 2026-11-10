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
  CURRENCIES,
  type Currency,
  type Payment,
  type PaymentStatus,
  type PaymentType,
  PROVIDERS,
  type Provider,
  paymentStatusLabels,
} from "@/components/mock-payments";
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
export type ProviderFilter = "all" | Provider;

/**
 * The operator filters carry their comparison alongside their value, the way
 * Notion's do.
 *
 * Each field gets the operators that mean something for it. Currency is
 * `is` / `is not`, not `contains`: a payment holds exactly one currency, so
 * "contains USDT" would match the same rows as "is USDT" — two operators for
 * one result. `contains` belongs to text, which is where the player filter
 * uses it: "gmail" matches every gmail address. Status is a set for the same
 * reason Currency is — "everything but failed" is the question a ledger asks
 * of it as often as "only failed".
 */
export type CurrencyOperator = "is" | "isNot";
export type StatusOperator = "is" | "isNot";
export type AmountOperator = "between" | "eq" | "gt" | "lt";
export type PlayerOperator =
  | "contains"
  | "endsWith"
  | "is"
  | "isNot"
  | "notContains"
  | "startsWith";

export interface PaymentFilters {
  amountMax: string;
  amountMin: string;
  amountOp: AmountOperator;
  createdAfter: string;
  createdBefore: string;
  createdOp: DateOperator;
  /** A relative rule, `past.7.day` — see `date-filter.ts`. */
  createdRel: string;
  currencies: readonly Currency[];
  currencyOp: CurrencyOperator;
  email: string;
  player: string;
  playerOp: PlayerOperator;
  provider: ProviderFilter;
  statuses: readonly PaymentStatus[];
  statusOp: StatusOperator;
  type: TypeFilter;
}

export const EMPTY_FILTERS: PaymentFilters = {
  amountMax: "",
  amountMin: "",
  amountOp: "between",
  createdAfter: "",
  createdBefore: "",
  createdOp: "between",
  createdRel: "",
  currencies: [],
  currencyOp: "is",
  email: "",
  player: "",
  playerOp: "contains",
  provider: "all",
  statuses: [],
  statusOp: "is",
  type: "all",
};

export const STATUSES: readonly PaymentStatus[] = [
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

export function statusLabel(status: PaymentStatus): string {
  return paymentStatusLabels[status];
}

export function providerLabel(provider: ProviderFilter): string {
  return provider === "all" ? "All" : provider;
}

export const PLAYER_OPERATORS: readonly {
  label: string;
  value: PlayerOperator;
}[] = [
  // Notion's set for text, in Notion's order. `is empty` / `is not empty` are
  // left out: every payment has a player, so both would be constant.
  { label: "is", value: "is" },
  { label: "is not", value: "isNot" },
  { label: "contains", value: "contains" },
  { label: "does not contain", value: "notContains" },
  { label: "starts with", value: "startsWith" },
  { label: "ends with", value: "endsWith" },
];

export const CURRENCY_OPERATORS: readonly {
  label: string;
  value: CurrencyOperator;
}[] = [
  { label: "is", value: "is" },
  { label: "is not", value: "isNot" },
];

export const STATUS_OPERATORS: readonly {
  label: string;
  value: StatusOperator;
}[] = CURRENCY_OPERATORS;

export const AMOUNT_OPERATORS: readonly AmountOperator[] = [
  "between",
  "eq",
  "gt",
  "lt",
];

export function amountOperatorLabel(op: AmountOperator): string {
  return AMOUNT_SYMBOLS[op];
}

const AMOUNT_SYMBOLS: Record<AmountOperator, string> = {
  between: "between",
  eq: "=",
  gt: ">",
  lt: "<",
};

/** The amount operators as words, for a list where `>` alone reads oddly. */
const AMOUNT_OPERATOR_NAMES: Record<AmountOperator, string> = {
  between: "Between",
  eq: "Equal to",
  gt: "Greater than",
  lt: "Less than",
};

/** The filters that carry a comparison of their own. */
export type OperatorKey = "amount" | "currencies" | "player" | "status";

export interface OperatorChoice {
  /** What the badge or menu trigger reads: `is not`, `contains`, `>`. */
  label: string;
  /** The choices, as a list reads them: `Is not`, `Greater than`. */
  options: readonly { label: string; value: string }[];
  /** Switching to `next`, as a patch — dropping what it no longer reads. */
  patch: (next: string) => Partial<PaymentFilters>;
  value: string;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * A filter's operator: what it currently reads, the alternatives, and what
 * picking one does. One answer for the desktop chip's header menu and the
 * phone drawer's operator sheet, so the two cannot offer different lists.
 */
export function operatorChoice(
  key: OperatorKey,
  filters: PaymentFilters
): OperatorChoice {
  if (key === "amount") {
    return {
      label: amountOperatorLabel(filters.amountOp),
      options: AMOUNT_OPERATORS.map((op) => ({
        label: AMOUNT_OPERATOR_NAMES[op],
        value: op,
      })),
      patch: (next) => setAmountOp(next as AmountOperator),
      value: filters.amountOp,
    };
  }
  const [operators, value, patch] = {
    currencies: [
      CURRENCY_OPERATORS,
      filters.currencyOp,
      (next: string) => ({ currencyOp: next as CurrencyOperator }),
    ] as const,
    player: [
      PLAYER_OPERATORS,
      filters.playerOp,
      (next: string) => ({ playerOp: next as PlayerOperator }),
    ] as const,
    status: [
      STATUS_OPERATORS,
      filters.statusOp,
      (next: string) => ({ statusOp: next as StatusOperator }),
    ] as const,
  }[key];
  return {
    label: operators.find((item) => item.value === value)?.label ?? "",
    options: operators.map((item) => ({
      label: capitalize(item.label),
      value: item.value,
    })),
    patch,
    value,
  };
}

/**
 * Switching the amount operator, as a patch.
 *
 * `eq` and `gt` read one bound (`amountMin`), `lt` reads the other
 * (`amountMax`). Without dropping the bound the new operator does not read,
 * `between 10 – 500` switched to `>` would keep a hidden 500 ceiling that no
 * label shows — and switched back, it would resurface. Every surface that sets
 * the operator goes through here so none of them can forget.
 */
export function setAmountOp(op: AmountOperator): Partial<PaymentFilters> {
  if (op === "eq" || op === "gt") {
    return { amountMax: "", amountOp: op };
  }
  if (op === "lt") {
    return { amountMin: "", amountOp: op };
  }
  return { amountOp: op };
}

/**
 * The Created presets: a ledger is read from the recent end, by the day and
 * the month, which is how payments get reconciled. Each is a relative rule, so
 * a link to "past 7 days" still means the past seven days tomorrow.
 */
export const CREATED_PRESETS = datePresets([
  { dir: "this", unit: "day" },
  { count: 7, dir: "past", unit: "day" },
  { count: 30, dir: "past", unit: "day" },
  { dir: "this", unit: "week" },
  { dir: "this", unit: "month" },
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
// Sort
// ---------------------------------------------------------------------------

export type PaymentSortKey =
  | "amount"
  | "createdAt"
  | "finishedAt"
  | "playerEmail"
  | "status";

/**
 * Always set: a ledger always has an order, and "Unsorted" would mean fixture
 * order, which is no order anyone asked for.
 */
export type SortState = BaseSortState<PaymentSortKey>;

/**
 * Column first, then direction, in the order someone reaches for them on a
 * ledger: when, then how much, then who.
 */
export const SORT_KEYS: readonly { id: PaymentSortKey; label: string }[] = [
  { id: "createdAt", label: "Created" },
  { id: "finishedAt", label: "Finished" },
  { id: "amount", label: "Amount" },
  { id: "playerEmail", label: "Player" },
  { id: "status", label: "Status" },
];

/**
 * What a direction means for the column it applies to. "Descending" is
 * accurate and says nothing — "Newest first" says what you will see.
 */
const DIRECTION_LABELS: Record<
  PaymentSortKey,
  Record<SortDirection, string>
> = {
  amount: { asc: "Smallest first", desc: "Largest first" },
  createdAt: { asc: "Oldest first", desc: "Newest first" },
  finishedAt: { asc: "Oldest first", desc: "Newest first" },
  playerEmail: { asc: "A–Z", desc: "Z–A" },
  status: { asc: "A–Z", desc: "Z–A" },
};

export function directionLabel(
  key: PaymentSortKey,
  direction: SortDirection
): string {
  return DIRECTION_LABELS[key][direction];
}

/**
 * The direction a column takes when it is first chosen, from the menu or a
 * header. Names read forwards; dates and amounts are asked about from the
 * large end.
 */
export function defaultDirection(key: PaymentSortKey): SortDirection {
  return key === "playerEmail" || key === "status" ? "asc" : "desc";
}

export const DEFAULT_SORT: SortState = { direction: "desc", key: "createdAt" };

/** "Created (Newest first)" — the column, then what the order means for it. */
export function sortLabel(sort: SortState): string {
  const key = SORT_KEYS.find((option) => option.id === sort.key)?.label;
  return `${key} (${directionLabel(sort.key, sort.direction)})`;
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
    filters.currencies.includes(payment.currency) ===
      (filters.currencyOp === "is"),
  (payment, filters) => filters.type === "all" || payment.type === filters.type,
  (payment, filters) =>
    filters.statuses.length === 0 ||
    filters.statuses.includes(payment.status) === (filters.statusOp === "is"),
  (payment, filters) =>
    filters.provider === "all" || payment.provider === filters.provider,
  (payment, filters) => matchesPlayer(payment.playerEmail, filters),
  // The timestamps are ISO, so the date half compares as a string.
  (payment, filters) =>
    matchesDate(payment.createdAt.slice(0, 10), createdOf(filters), TODAY),
  (payment, filters) => matchesAmount(Number(payment.amount), filters),
];

/** Case-insensitive, and blank text never narrows, whatever the operator. */
function matchesPlayer(email: string, filters: PaymentFilters): boolean {
  const query = filters.player.trim().toLowerCase();
  if (!query) {
    return true;
  }
  const value = email.toLowerCase();
  switch (filters.playerOp) {
    case "is":
      return value === query;
    case "isNot":
      return value !== query;
    case "notContains":
      return !value.includes(query);
    case "startsWith":
      return value.startsWith(query);
    case "endsWith":
      return value.endsWith(query);
    default:
      return value.includes(query);
  }
}

/** One matcher for every amount operator; an empty bound never narrows. */
function matchesAmount(amount: number, filters: PaymentFilters): boolean {
  const { amountMax: max, amountMin: min, amountOp: op } = filters;
  switch (op) {
    case "eq":
      return !min || amount === Number(min);
    case "gt":
      return !min || amount > Number(min);
    case "lt":
      return !max || amount < Number(max);
    default:
      return (!min || amount >= Number(min)) && (!max || amount <= Number(max));
  }
}

export function matchesPaymentFilters(
  payment: Payment,
  filters: PaymentFilters
): boolean {
  return MATCHERS.every((matches) => matches(payment, filters));
}

/**
 * Amounts compare as plain numbers, across currencies — so 1 BTC sorts below
 * 600 EUR. A fixture has no exchange rates to do better with; a real ledger
 * sorts on a converted reporting-currency column, or narrows to one currency
 * first (the Currency filter) so the comparison means something.
 *
 * Dates compare as strings, which is only correct because the fixture's
 * `YYYY-MM-DD HH:mm:ss` is zero-padded and fixed-width. Parse them first if
 * yours carry offsets or mixed formats.
 */
export function sortPayments(
  rows: readonly Payment[],
  sort: SortState
): Payment[] {
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (sort.key === "amount") {
      return (Number(a.amount) - Number(b.amount)) * factor;
    }
    const left = a[sort.key];
    const right = b[sort.key];
    // A payment that has not finished has no finish time to order by, so it
    // sinks to the end in both directions rather than heading one of them —
    // "Newest first" opening on a page of dashes would answer nothing.
    if (left === null || right === null) {
      return Number(left === null) - Number(right === null);
    }
    return left.localeCompare(right) * factor;
  });
}

// ---------------------------------------------------------------------------
// The pills
// ---------------------------------------------------------------------------

export type FilterKey =
  | "amount"
  | "created"
  | "currencies"
  | "player"
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
  /**
   * The value with its comparison taken out, for the phone's applied rows,
   * which show the operator as a badge beside it: `Amount [>] 100`, where the
   * pill's `> 100` would say it twice. Absent where the two read the same.
   */
  operand?: (filters: PaymentFilters) => string | null;
  /**
   * The operator, when it is not the default. Notion's convention: `is` goes
   * unsaid — "Currency: BTC" — and only a qualifier earns words, "Currency is
   * not: BTC". Absent on filters without operators.
   */
  operator?: (filters: PaymentFilters) => string | null;
  /** The value, or `null` when the filter is unset. */
  value: (filters: PaymentFilters) => string | null;
}

/**
 * The pills a fresh table starts with: the two cuts people take first. The
 * rest are added on demand — every pill costs horizontal room, and a row that
 * always carries all six wraps before anyone has used one.
 *
 * A starting set, not a permanent one. These come off the row like any other
 * pill, so every X on the toolbar does the same thing, and `Clear all` puts
 * them back.
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
    clear: { statuses: [], statusOp: "is" },
    empty: "All",
    key: "status",
    label: "Status",
    operator: (f) => (f.statusOp === "isNot" ? "is not" : null),
    operand: (f) => {
      if (f.statuses.length === 0) {
        return null;
      }
      return f.statuses.length <= 2
        ? f.statuses.map(statusLabel).join(", ")
        : `${f.statuses.length} statuses`;
    },
    // The first pick plus a count of the rest, as Currency reads: "Failed, +1".
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
    clear: { currencies: [], currencyOp: "is" },
    empty: "All",
    key: "currencies",
    label: "Currency",
    operator: (f) => (f.currencyOp === "isNot" ? "is not" : null),
    // Two tickers still read at a glance; past that, a count says how many.
    operand: (f) => {
      if (f.currencies.length === 0) {
        return null;
      }
      return f.currencies.length <= 2
        ? f.currencies.join(", ")
        : `${f.currencies.length} currencies`;
    },
    // The first selection plus a count of the rest: "BTC, +2". A bare "3"
    // says how many without saying which, and four tickers side by side stop
    // being scannable and start being a sentence.
    value: (f) => {
      if (f.currencies.length === 0) {
        return null;
      }
      return f.currencies.length === 1
        ? f.currencies[0]
        : `${f.currencies[0]}, +${f.currencies.length - 1}`;
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
    clear: { player: "", playerOp: "contains" },
    empty: "Any",
    key: "player",
    label: "Player",
    operator: (f) =>
      f.playerOp === "contains"
        ? null
        : (PLAYER_OPERATORS.find((item) => item.value === f.playerOp)?.label ??
          null),
    value: (f) => f.player.trim() || null,
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
  {
    clear: { amountMax: "", amountMin: "", amountOp: "between" },
    empty: "Any",
    key: "amount",
    label: "Amount",
    operand: (f) => {
      // An open end reads as one here — `100 – any` — rather than the pill's
      // `from 100`, which beside a `between` badge would say it twice.
      if (f.amountOp === "between") {
        if (!(f.amountMin || f.amountMax)) {
          return null;
        }
        return `${f.amountMin || "0"} – ${f.amountMax || "any"}`;
      }
      return (f.amountOp === "lt" ? f.amountMax : f.amountMin) || null;
    },
    value: (f) => amountValue(f),
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

/**
 * The comparison is part of the value — "> 100" — rather than spelled out in
 * the label, because a symbol next to a number reads faster than "is greater
 * than" and the label stays the same width whichever operator is picked.
 */
function amountValue(f: PaymentFilters): string | null {
  if (f.amountOp === "between") {
    return rangeValue(f.amountMin, f.amountMax);
  }
  const bound = f.amountOp === "lt" ? f.amountMax : f.amountMin;
  if (!bound) {
    return null;
  }
  return `${AMOUNT_SYMBOLS[f.amountOp]} ${bound}`;
}

export function filterDef(key: FilterKey): FilterDef {
  const def = FILTERS.find((item) => item.key === key);
  if (!def) {
    throw new Error(`Unknown filter: ${key}`);
  }
  return def;
}

/**
 * Which pills the toolbar shows, in the order it shows them: the ones on the
 * row — the starting pair plus any added by hand, in the order they arrived —
 * then, the load-bearing term, any filter that holds a value without having
 * been asked for.
 *
 * That last group is what makes applied state impossible to hide. A filter
 * with a value and no pill is exactly the failure the old chip row existed to
 * paper over; here it cannot happen, rather than merely being tested for. It
 * is reachable through the mobile drawer, which sets filters that were never
 * added as pills.
 *
 * The ordering matters as much as the membership. Filtering `FILTERS` in
 * declaration order put each new pill in its canonical slot instead of at the
 * end — add Amount then Currency and Currency landed in front of it, nowhere
 * near the `+ Add filter` button you were just looking at.
 */
export function visibleKeys(
  filters: PaymentFilters,
  added: readonly FilterKey[]
): FilterKey[] {
  return visibleKeysOf(FILTERS, filters, added);
}

/** Filters still available to add — the add-filter menu's contents. */
export function addableKeys(
  filters: PaymentFilters,
  added: readonly FilterKey[]
): FilterKey[] {
  return addableKeysOf(FILTERS, filters, added);
}

/** Whether anything at all is applied, search included. */
export function hasActiveFilters(filters: PaymentFilters): boolean {
  return (
    Boolean(filters.email.trim()) ||
    FILTERS.some((def) => def.value(filters) !== null)
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

const CSV_COLUMNS: readonly CsvColumn<Payment>[] = [
  ["Payment ID", (p) => p.id],
  ["Player", (p) => p.playerEmail],
  ["Amount", (p) => p.amount],
  ["Currency", (p) => p.currency],
  ["Type", (p) => p.type],
  ["Status", (p) => p.status],
  ["Provider", (p) => p.provider],
  ["Created", (p) => p.createdAt],
  ["Finished", (p) => p.finishedAt ?? ""],
];

/**
 * The rows as CSV.
 *
 * Raw values, not the table's display: the provider's amount string rather
 * than `10,000.00` (whose comma a spreadsheet would split or misread), the
 * enum ids rather than labels, an empty cell rather than a dash for a payment
 * that has not finished. The toolbar passes every row the filters and sort
 * produced, not the current page — an export of ten rows out of eighteen is a
 * bug report waiting to happen.
 */
export function toPaymentsCsv(rows: readonly Payment[]): string {
  return toCsv(CSV_COLUMNS, rows);
}

// ---------------------------------------------------------------------------
// URL
// ---------------------------------------------------------------------------

export const PAGE_SIZES = [10, 20, 30, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

const DECIMAL = /^\d+(\.\d+)?$/;

/** The table's query as URL parameters, defaults left out. */
export function paymentsToParams(
  query: DataTableQuery<PaymentFilters, PaymentSortKey>
): Record<string, string> {
  const f = query.filters;
  return {
    q: f.email,
    type: f.type === "all" ? "" : f.type,
    status: f.statuses.join(","),
    statusOp: f.statuses.length > 0 && f.statusOp === "isNot" ? "isNot" : "",
    provider: f.provider === "all" ? "" : f.provider,
    currency: f.currencies.join(","),
    currencyOp:
      f.currencies.length > 0 && f.currencyOp === "isNot" ? "isNot" : "",
    player: f.player,
    playerOp: f.player && f.playerOp !== "contains" ? f.playerOp : "",
    ...dateFilterToParams(createdOf(f)),
    amountOp:
      (f.amountMin || f.amountMax) && f.amountOp !== "between"
        ? f.amountOp
        : "",
    min: f.amountMin,
    max: f.amountMax,
    sort: sortToParam(query.sort, DEFAULT_SORT),
    ...pageToParams(query.pageIndex, query.pageSize, DEFAULT_PAGE_SIZE),
  };
}

/** The inverse, validating every value; anything unrecognised is dropped. */
export function paymentsFromParams(
  params: URLSearchParams
): Partial<DataTableQuery<PaymentFilters, PaymentSortKey>> {
  const decimal = (key: string) => {
    const value = params.get(key) ?? "";
    return DECIMAL.test(value) ? value : "";
  };
  const currencies = (params.get("currency") ?? "")
    .split(",")
    .filter((value): value is Currency =>
      CURRENCIES.includes(value as Currency)
    );

  // A single `status=failed`, as links written before Status took several
  // values say it, still reads: a list of one.
  const statuses = (params.get("status") ?? "")
    .split(",")
    .filter((value): value is PaymentStatus =>
      STATUSES.includes(value as PaymentStatus)
    );

  return {
    filters: {
      amountMax: decimal("max"),
      amountMin: decimal("min"),
      amountOp: oneOf(params.get("amountOp"), AMOUNT_OPERATORS, "between"),
      ...createdPatch(dateFilterFromParams(params)),
      currencies,
      currencyOp: oneOf(params.get("currencyOp"), ["is", "isNot"], "is"),
      email: params.get("q") ?? "",
      player: params.get("player") ?? "",
      playerOp: oneOf(
        params.get("playerOp"),
        PLAYER_OPERATORS.map((op) => op.value),
        "contains"
      ),
      provider: oneOf(params.get("provider"), PROVIDER_OPTIONS, "all"),
      statuses,
      statusOp: oneOf(params.get("statusOp"), ["is", "isNot"], "is"),
      type: oneOf(params.get("type"), TYPE_OPTIONS, "all"),
    },
    sort: sortFromParam(
      params.get("sort"),
      SORT_KEYS.map((key) => key.id)
    ),
    ...pageFromParams(params, PAGE_SIZES),
  };
}
