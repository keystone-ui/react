/**
 * The date filter's arithmetic, shared by both tables' `Created` filters.
 *
 * The model stays two inclusive bounds, `after` and `before`, as `YYYY-MM-DD`
 * strings — the URL, the matchers and the desktop pill all read that shape. A
 * preset is not a third kind of state: picking `Last 7 days` writes the two
 * dates it resolves to, and the label is derived back from them. The pill reads
 * `Last 7 days` while the dates still are the last seven days, and the dates
 * themselves once they are not, which is what the filter then means.
 *
 * Every conversion here is in local time. `toISOString()` is UTC, so it turns
 * the evening of the 1st into the 2nd anywhere west of Greenwich, and
 * `new Date("2026-07-01")` parses as UTC midnight, which is the 30th anywhere
 * west of it. Both bugs pass every test run in UTC.
 */

/** `YYYY-MM-DD`, or `""` for an open end. */
export interface DateBounds {
  after: string;
  before: string;
}

/**
 * The phone step's four ways of reading the two bounds.
 *
 * Notion offers nine date operators. `is empty` / `is not empty` cannot match a
 * creation date, which every row has. Strict `is before` / `is after` are each a
 * one-day twin of the inclusive pair, and offering both asks someone to decide
 * which side of midnight they meant. `is relative to today` is the presets. What
 * is left is four, which is what a segmented control holds on a phone.
 */
export type DateMode = "between" | "on" | "from" | "to";

export const DATE_MODES: readonly { label: string; value: DateMode }[] = [
  { label: "Between", value: "between" },
  { label: "On", value: "on" },
  { label: "From", value: "from" },
  { label: "To", value: "to" },
];

export type DatePresetKey =
  | "last12Months"
  | "last30Days"
  | "last7Days"
  | "lastMonth"
  | "lastYear"
  | "thisMonth"
  | "thisYear"
  | "today"
  | "yesterday";

export interface DatePreset {
  key: DatePresetKey;
  label: string;
}

const PRESET_LABELS: Record<DatePresetKey, string> = {
  last12Months: "Last 12 months",
  last30Days: "Last 30 days",
  last7Days: "Last 7 days",
  lastMonth: "Last month",
  lastYear: "Last year",
  thisMonth: "This month",
  thisYear: "This year",
  today: "Today",
  yesterday: "Yesterday",
};

/** The presets a table offers, in the order given. */
export function datePresets(keys: readonly DatePresetKey[]): DatePreset[] {
  return keys.map((key) => ({ key, label: PRESET_LABELS[key] }));
}

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

/** The bounds a preset stands for on `today`, both ends inclusive. */
export function resolvePreset(key: DatePresetKey, today: Date): DateBounds {
  const year = today.getFullYear();
  const month = today.getMonth();
  const range = (from: Date, to: Date): DateBounds => ({
    after: toIsoDate(from),
    before: toIsoDate(to),
  });

  switch (key) {
    case "today":
      return range(today, today);
    case "yesterday": {
      const yesterday = addDays(today, -1);
      return range(yesterday, yesterday);
    }
    // "Last 7 days" counts today, so it starts six days back.
    case "last7Days":
      return range(addDays(today, -6), today);
    case "last30Days":
      return range(addDays(today, -29), today);
    case "last12Months": {
      // The same day a year back, clamped (29 Feb has no twin), then one on.
      const day = Math.min(today.getDate(), daysInMonth(year - 1, month));
      return range(addDays(new Date(year - 1, month, day), 1), today);
    }
    case "thisMonth":
      return range(new Date(year, month, 1), today);
    case "lastMonth":
      return range(new Date(year, month - 1, 1), new Date(year, month, 0));
    case "thisYear":
      return range(new Date(year, 0, 1), today);
    case "lastYear":
      return range(new Date(year - 1, 0, 1), new Date(year - 1, 11, 31));
    default:
      throw new Error(`Unknown date preset: ${key satisfies never}`);
  }
}

/** The preset whose resolution the bounds are exactly, if any. */
export function presetFor(
  bounds: DateBounds,
  presets: readonly DatePreset[],
  today: Date
): DatePreset | null {
  return (
    presets.find((preset) => {
      const resolved = resolvePreset(preset.key, today);
      return (
        resolved.after === bounds.after && resolved.before === bounds.before
      );
    }) ?? null
  );
}

/**
 * What the pill and the drawer row read: the preset's name while the dates
 * still are that preset, otherwise the dates. An open end says which end it is
 * open at; a single day is just the day.
 */
export function dateRangeLabel(
  bounds: DateBounds,
  presets: readonly DatePreset[],
  today: Date
): string | null {
  const { after, before } = bounds;
  if (!(after || before)) {
    return null;
  }
  const preset = presetFor(bounds, presets, today);
  if (preset) {
    return preset.label;
  }
  if (after && before) {
    return after === before ? after : `${after} – ${before}`;
  }
  return after ? `from ${after}` : `to ${before}`;
}

/**
 * The mode a step opens in, read off the bounds — so a range set on a desktop
 * opens on a phone as the mode that can show it, rather than as `Between` with
 * an end missing.
 */
export function modeFromBounds(bounds: DateBounds): DateMode {
  const { after, before } = bounds;
  if (after && before) {
    return after === before ? "on" : "between";
  }
  if (after) {
    return "from";
  }
  if (before) {
    return "to";
  }
  return "between";
}

/**
 * Switching mode, as new bounds.
 *
 * Each mode drops the bound it does not read, so nothing narrows the table
 * that the label no longer mentions — the same rule `setAmountOp` keeps. What
 * survives is the date you were looking at: `From` keeps the start (or the only
 * date there is), `To` keeps the end, `On` keeps the start as its one day.
 * `From Jul 22` flipped to `To` is far more often a corrected direction than a
 * wish to start over, so the date crosses rather than being dropped.
 */
export function setDateMode(bounds: DateBounds, mode: DateMode): DateBounds {
  const start = bounds.after || bounds.before;
  const end = bounds.before || bounds.after;
  switch (mode) {
    case "on":
      return { after: start, before: start };
    case "from":
      return { after: start, before: "" };
    case "to":
      return { after: "", before: end };
    default:
      return bounds;
  }
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
export function nextBetween(bounds: DateBounds, day: string): DateBounds {
  const { after, before } = bounds;
  if (after && before && after !== before) {
    return { after: day, before: day };
  }
  const held = after || before;
  if (!held) {
    return { after: day, before: day };
  }
  if (held === day) {
    // Only a single day can be tapped off; an open end tapped on its own
    // date closes into that day.
    return after && before
      ? { after: "", before: "" }
      : { after: day, before: day };
  }
  return held < day
    ? { after: held, before: day }
    : { after: day, before: held };
}

/**
 * A tap on the calendar, in any mode. The single-date modes set their one
 * bound, and tapping the date already set takes it off again — the same as
 * tapping a lone day off in `Between`.
 */
export function tapDay(
  bounds: DateBounds,
  mode: DateMode,
  day: string
): DateBounds {
  switch (mode) {
    case "on":
      return bounds.after === day && bounds.before === day
        ? { after: "", before: "" }
        : { after: day, before: day };
    case "from":
      return { after: bounds.after === day ? "" : day, before: "" };
    case "to":
      return { after: "", before: bounds.before === day ? "" : day };
    default:
      return nextBetween(bounds, day);
  }
}

/**
 * The fixture's today.
 *
 * The mock rows end on 28 Aug 2026, so against the real date every recent
 * preset — `Today`, `Last 7 days` — would open onto an empty table, and every
 * test that picks one would start failing the day the data aged out of it. In
 * your app this is `new Date()`.
 */
export const TODAY = new Date(2026, 7, 28);
