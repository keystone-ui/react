/**
 * The date filter, shared by both tables' `Created` filters: Notion's nine
 * operators, relative rules, presets, and the arithmetic under them.
 *
 * A filter is an operator plus what that operator reads: one date (`is`,
 * `is before`, …), two (`is between`), a rule (`is relative to today` —
 * `Past 7 days`, `This month`), or nothing (`is empty`). A rule is stored as a
 * rule and resolved against today each time, so a link to "the past 7 days"
 * still means the past 7 days tomorrow; the presets are rules too.
 *
 * Every conversion here is in local time. `toISOString()` is UTC, so it turns
 * the evening of the 1st into the 2nd anywhere west of Greenwich, and
 * `new Date("2026-07-01")` parses as UTC midnight, which is the 30th anywhere
 * west of it. Both bugs pass every test run in UTC.
 */

export type DateOperator =
  | "after"
  | "before"
  | "between"
  | "empty"
  | "is"
  | "notEmpty"
  | "onOrAfter"
  | "onOrBefore"
  | "relative";

/** Notion's list, in Notion's order. */
export const DATE_OPERATORS: readonly { label: string; value: DateOperator }[] =
  [
    { label: "Is", value: "is" },
    { label: "Is before", value: "before" },
    { label: "Is after", value: "after" },
    { label: "Is on or before", value: "onOrBefore" },
    { label: "Is on or after", value: "onOrAfter" },
    { label: "Is between", value: "between" },
    { label: "Is relative to today", value: "relative" },
    { label: "Is empty", value: "empty" },
    { label: "Is not empty", value: "notEmpty" },
  ];

/** An operator as a badge or trigger reads it: `is before`. */
export function dateOperatorLabel(op: DateOperator): string {
  const label = DATE_OPERATORS.find((item) => item.value === op)?.label ?? "";
  return label.charAt(0).toLowerCase() + label.slice(1);
}

/** The operators that compare against one date. */
const SINGLE: readonly DateOperator[] = [
  "is",
  "before",
  "after",
  "onOrBefore",
  "onOrAfter",
];

export type RelativeUnit = "day" | "month" | "week" | "year";

/**
 * A rule relative to today. `Past` counts back from today, today included;
 * `This` is the calendar period today falls in. There is no `Next`: nothing is
 * created in the future, so it could only ever match nothing.
 */
export type Relative =
  | { count: number; dir: "past"; unit: RelativeUnit }
  | { dir: "this"; unit: RelativeUnit };

export const RELATIVE_UNITS: readonly RelativeUnit[] = [
  "day",
  "week",
  "month",
  "year",
];

/** The filter, whole. `after` is the date the single-date operators read. */
export interface DateFilter {
  after: string;
  before: string;
  op: DateOperator;
  /** A relative rule as the URL writes it — `past.7.day`, `this.week` — or `""`. */
  rel: string;
}

export const EMPTY_DATE_FILTER: DateFilter = {
  after: "",
  before: "",
  op: "between",
  rel: "",
};

/** The rule a relative filter starts with when nothing else says. */
export const DEFAULT_RELATIVE: Relative = { dir: "this", unit: "week" };

// ---------------------------------------------------------------------------
// Local dates
// ---------------------------------------------------------------------------

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A local date as `YYYY-MM-DD`. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * `YYYY-MM-DD` as local midnight, or `null` for anything else — including a
 * well-formed string naming a day that does not exist, like `2026-02-30`,
 * which `Date` would otherwise roll over into March.
 */
export function fromIsoDate(value: string): Date | null {
  const match = ISO_DATE.exec(value);
  if (!match) {
    return null;
  }
  const [year, month, day] = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  ];
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

/** Calendar days, not 24-hour steps: a DST day is 23 or 25 hours long. */
function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** The same day `months` back, clamped: 31 Mar minus a month is 28/29 Feb. */
function monthsBack(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() - months, 1);
  const day = Math.min(
    date.getDate(),
    daysInMonth(target.getFullYear(), target.getMonth())
  );
  return new Date(target.getFullYear(), target.getMonth(), day);
}

// ---------------------------------------------------------------------------
// Relative rules
// ---------------------------------------------------------------------------

const RELATIVE_PARAM =
  /^(past)\.(\d{1,3})\.(day|week|month|year)$|^(this)\.(day|week|month|year)$/;

/** `past.7.day` / `this.week` as a rule, or `null` when it is not one. */
export function parseRelative(value: string): Relative | null {
  const match = RELATIVE_PARAM.exec(value);
  if (!match) {
    return null;
  }
  if (match[1]) {
    const count = Number(match[2]);
    return count >= 1
      ? { count, dir: "past", unit: match[3] as RelativeUnit }
      : null;
  }
  return { dir: "this", unit: match[5] as RelativeUnit };
}

export function relativeToParam(rel: Relative): string {
  return rel.dir === "past"
    ? `past.${rel.count}.${rel.unit}`
    : `this.${rel.unit}`;
}

/** `Past 7 days`, `Past week`, `This month`, `Today`. */
export function relativeLabel(rel: Relative): string {
  if (rel.dir === "this") {
    return rel.unit === "day" ? "Today" : `This ${rel.unit}`;
  }
  return rel.count === 1
    ? `Past ${rel.unit}`
    : `Past ${rel.count} ${rel.unit}s`;
}

/**
 * The days a rule covers on `today`, both ends included.
 *
 * `Past 7 days` is seven calendar days ending today. Notion's runs eight — its
 * "past week" on the 10th starts on the 3rd — which is a day more than the
 * label says. Weeks start on Monday, as the calendar does.
 */
export function resolveRelative(
  rel: Relative,
  today: Date
): { after: string; before: string } {
  const range = (from: Date, to: Date) => ({
    after: toIsoDate(from),
    before: toIsoDate(to),
  });
  const year = today.getFullYear();
  const month = today.getMonth();

  if (rel.dir === "this") {
    switch (rel.unit) {
      case "day":
        return range(today, today);
      case "week": {
        // getDay() is 0 for Sunday; Monday starts the week.
        const monday = addDays(today, -((today.getDay() + 6) % 7));
        return range(monday, addDays(monday, 6));
      }
      case "month":
        return range(new Date(year, month, 1), new Date(year, month + 1, 0));
      default:
        return range(new Date(year, 0, 1), new Date(year, 11, 31));
    }
  }

  switch (rel.unit) {
    case "day":
      return range(addDays(today, -(rel.count - 1)), today);
    case "week":
      return range(addDays(today, -(7 * rel.count - 1)), today);
    case "month":
      return range(addDays(monthsBack(today, rel.count), 1), today);
    default:
      return range(addDays(monthsBack(today, 12 * rel.count), 1), today);
  }
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

export interface DatePreset {
  label: string;
  rel: Relative;
}

/** Presets are rules: a label and the relative filter it sets. */
export function datePresets(rules: readonly Relative[]): DatePreset[] {
  return rules.map((rel) => ({ label: relativeLabel(rel), rel }));
}

/** The preset a filter is exactly, if any. */
export function presetFor(
  filter: DateFilter,
  presets: readonly DatePreset[]
): DatePreset | null {
  if (filter.op !== "relative") {
    return null;
  }
  return (
    presets.find((preset) => relativeToParam(preset.rel) === filter.rel) ?? null
  );
}

/** A preset as a filter. */
export function presetFilter(preset: DatePreset): DateFilter {
  return {
    after: "",
    before: "",
    op: "relative",
    rel: relativeToParam(preset.rel),
  };
}

// ---------------------------------------------------------------------------
// Reading a filter
// ---------------------------------------------------------------------------

/** The rule a relative filter holds, falling back to the default one. */
export function relativeOf(filter: DateFilter): Relative {
  return parseRelative(filter.rel) ?? DEFAULT_RELATIVE;
}

/** Whether the filter narrows anything. */
export function isDateFilterSet(filter: DateFilter): boolean {
  switch (filter.op) {
    case "empty":
    case "notEmpty":
      return true;
    case "relative":
      return parseRelative(filter.rel) !== null;
    case "between":
      return Boolean(filter.after || filter.before);
    default:
      return Boolean(filter.after);
  }
}

/**
 * The days a filter highlights on a calendar — the range a rule resolves to,
 * or the picked dates — or `null` when there is nothing to show.
 */
export function highlightOf(
  filter: DateFilter,
  today: Date
): { after: string; before: string } | null {
  if (filter.op === "relative") {
    const rel = parseRelative(filter.rel);
    return rel ? resolveRelative(rel, today) : null;
  }
  if (filter.op === "between") {
    return filter.after || filter.before
      ? {
          after: filter.after || filter.before,
          before: filter.before || filter.after,
        }
      : null;
  }
  if (SINGLE.includes(filter.op) && filter.after) {
    return { after: filter.after, before: filter.after };
  }
  return null;
}

/**
 * Whether a row's date (`YYYY-MM-DD`, or `""` for none) passes. An operator
 * with nothing picked narrows nothing, the same as every other filter.
 */
export function matchesDate(
  value: string,
  filter: DateFilter,
  today: Date
): boolean {
  const { after, before, op } = filter;
  switch (op) {
    case "empty":
      return value === "";
    case "notEmpty":
      return value !== "";
    case "relative": {
      const rel = parseRelative(filter.rel);
      if (!rel) {
        return true;
      }
      const range = resolveRelative(rel, today);
      return value >= range.after && value <= range.before;
    }
    case "between":
      return (!after || value >= after) && (!before || value <= before);
    default:
      if (!after) {
        return true;
      }
      if (op === "is") {
        return value === after;
      }
      if (op === "before") {
        return value !== "" && value < after;
      }
      if (op === "after") {
        return value > after;
      }
      if (op === "onOrBefore") {
        return value !== "" && value <= after;
      }
      return value >= after;
  }
}

/**
 * What the pill reads after its label, or `null` when unset. `is`,
 * `is between` and a rule go unsaid — a single date, a range and `Past 7 days`
 * each say what they are — so only a qualifier earns words, which is
 * `dateQualifier`'s job.
 */
export function dateFilterValue(filter: DateFilter): string | null {
  if (!isDateFilterSet(filter)) {
    return null;
  }
  switch (filter.op) {
    case "empty":
      return "Empty";
    case "notEmpty":
      return "Not empty";
    case "relative":
      return relativeLabel(relativeOf(filter));
    default:
      return dateOperand(filter);
  }
}

/** The operator the pill names, when it is not one that goes unsaid. */
export function dateQualifier(filter: DateFilter): string | null {
  if (!isDateFilterSet(filter)) {
    return null;
  }
  return ["before", "after", "onOrBefore", "onOrAfter"].includes(filter.op)
    ? dateOperatorLabel(filter.op)
    : null;
}

/**
 * The value with its operator taken out, for a row that shows the operator as
 * a badge of its own — `Created [is before] 2026-07-01`. `null` where there is
 * no value to show beside the badge (`is empty`).
 */
export function dateOperand(filter: DateFilter): string | null {
  if (!isDateFilterSet(filter)) {
    return null;
  }
  switch (filter.op) {
    case "empty":
    case "notEmpty":
      return null;
    case "relative":
      return relativeLabel(relativeOf(filter));
    case "between": {
      const { after, before } = filter;
      if (after && before) {
        return after === before ? after : `${after} – ${before}`;
      }
      return after ? `${after} – any` : `any – ${before}`;
    }
    default:
      return filter.after;
  }
}

// ---------------------------------------------------------------------------
// Changing a filter
// ---------------------------------------------------------------------------

/**
 * Switching operator, as the new filter. Each drops what it does not read, so
 * nothing narrows the table that the label no longer mentions — the rule
 * `setAmountOp` keeps — but the date you were looking at carries over: a range
 * switched to `is before` keeps its start, a rule switched to `is between`
 * becomes the dates it covers today.
 */
export function setDateOperator(
  filter: DateFilter,
  op: DateOperator,
  today: Date
): DateFilter {
  const shown = highlightOf(filter, today);
  if (op === "empty" || op === "notEmpty") {
    return { after: "", before: "", op, rel: "" };
  }
  if (op === "relative") {
    const rel =
      filter.op === "relative" ? filter.rel : relativeToParam(DEFAULT_RELATIVE);
    return { after: "", before: "", op, rel };
  }
  if (op === "between") {
    return {
      after: shown?.after ?? "",
      before: shown?.before ?? "",
      op,
      rel: "",
    };
  }
  return { after: shown?.after ?? "", before: "", op, rel: "" };
}

/** A new rule for a relative filter. */
/**
 * Clearing the value but keeping the operator — what a step's or popover's
 * `Clear` does, as opposed to removing the filter. Only the single-date
 * operators have a value apart from their operator to clear; a rule *is* its
 * value, and `is empty` has none, so those go back to the default filter
 * rather than keeping an operator that would show a rule while narrowing
 * nothing.
 */
export function clearDateValue(filter: DateFilter): DateFilter {
  return SINGLE.includes(filter.op)
    ? { after: "", before: "", op: filter.op, rel: "" }
    : EMPTY_DATE_FILTER;
}

export function setRelative(filter: DateFilter, rel: Relative): DateFilter {
  return {
    ...filter,
    after: "",
    before: "",
    op: "relative",
    rel: relativeToParam(rel),
  };
}

/**
 * A tap on the calendar in `Between` mode.
 *
 * One tap is a day, a second makes it a range (in whichever order they came),
 * and a tap on a finished range starts again. react-day-picker's own range
 * logic instead moves whichever end is nearer, so a third tap quietly
 * shortens the range you had; and its reset option starts a range with an
 * open end, which — since the drawer applies live — would show every row after
 * that day until the second tap. This never leaves an end open that you did
 * not open.
 */
export function nextBetween(
  bounds: { after: string; before: string },
  day: string
): { after: string; before: string } {
  const { after, before } = bounds;
  if (after && before && after !== before) {
    return { after: day, before: day };
  }
  const held = after || before;
  if (!held) {
    return { after: day, before: day };
  }
  if (held === day) {
    return after && before
      ? { after: "", before: "" }
      : { after: day, before: day };
  }
  return held < day
    ? { after: held, before: day }
    : { after: day, before: held };
}

/**
 * A tap on the calendar. The single-date operators set their date, and
 * tapping the date already set takes it off; a rule gives way to the day
 * tapped, as `is` — the calendar is where you go to name a day.
 */
export function tapDay(filter: DateFilter, day: string): DateFilter {
  switch (filter.op) {
    case "between":
      return { ...nextBetween(filter, day), op: "between", rel: "" };
    case "relative":
    case "empty":
    case "notEmpty":
      return { after: day, before: "", op: "is", rel: "" };
    default:
      return {
        after: filter.after === day ? "" : day,
        before: "",
        op: filter.op,
        rel: "",
      };
  }
}

// ---------------------------------------------------------------------------
// The URL
// ---------------------------------------------------------------------------

const OPERATOR_VALUES = DATE_OPERATORS.map((item) => item.value);

/** The filter as URL parameters, defaults left out. */
export function dateFilterToParams(filter: DateFilter): Record<string, string> {
  if (!isDateFilterSet(filter)) {
    return { createdOp: "", from: "", rel: "", to: "" };
  }
  return {
    // `between` goes unsaid only with both ends: an open one would read back
    // as the `on or after` an older link means.
    createdOp:
      filter.op === "between" && filter.after && filter.before ? "" : filter.op,
    from: filter.op === "relative" ? "" : filter.after,
    rel: filter.op === "relative" ? filter.rel : "",
    to: filter.op === "between" ? filter.before : "",
  };
}

/**
 * The inverse, validating every value. Links written before the operators
 * existed carry only `from` / `to`; they read as the range they always meant —
 * both ends `is between`, one end `is on or after` / `is on or before`.
 */
export function dateFilterFromParams(params: URLSearchParams): DateFilter {
  const date = (key: string) => {
    const value = params.get(key) ?? "";
    return fromIsoDate(value) ? value : "";
  };
  const from = date("from");
  const to = date("to");
  const named = params.get("createdOp");
  const op = OPERATOR_VALUES.includes(named as DateOperator)
    ? (named as DateOperator)
    : null;

  if (op === "relative") {
    const rel = params.get("rel") ?? "";
    return parseRelative(rel)
      ? { after: "", before: "", op, rel }
      : EMPTY_DATE_FILTER;
  }
  if (op === "empty" || op === "notEmpty") {
    return { after: "", before: "", op, rel: "" };
  }
  if (op && op !== "between") {
    return { after: from, before: "", op, rel: "" };
  }
  if (!op && from && !to) {
    return { after: from, before: "", op: "onOrAfter", rel: "" };
  }
  if (!op && to && !from) {
    return { after: to, before: "", op: "onOrBefore", rel: "" };
  }
  return { after: from, before: to, op: "between", rel: "" };
}

/**
 * The fixture's today.
 *
 * The mock rows end on 28 Aug 2026, so against the real date every recent
 * preset — `Today`, `Past 7 days` — would open onto an empty table, and every
 * test that picks one would start failing the day the data aged out of it. In
 * your app this is `new Date()`.
 */
export const TODAY = new Date(2026, 7, 28);
