"use client";

import { Calendar } from "@keystoneui/react/calendar";
import { Input } from "@keystoneui/react/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@keystoneui/react/native-select";
import { Toggle } from "@keystoneui/react/toggle";
import { useState } from "react";
import {
  type DateFilter,
  type DatePreset,
  fromIsoDate,
  highlightOf,
  presetFilter,
  presetFor,
  RELATIVE_UNITS,
  type Relative,
  type RelativeUnit,
  relativeOf,
  setRelative,
  tapDay,
  toIsoDate,
} from "./date-filter";
import { Collapse } from "./drawer-parts";

interface DateFilterStepProps {
  filter: DateFilter;
  onChange: (filter: DateFilter) => void;
  presets: readonly DatePreset[];
  /**
   * Where it sits. A phone sheet gives it the drawer's 16px gutters and boxes
   * the calendar like the sheet's lists; a desktop popover has its own padding
   * and surface, so it takes neither.
   */
  surface: "popover" | "sheet";
  today: Date;
}

/**
 * The body of a date filter, on either surface: the presets, the pickers for
 * a relative rule, and a calendar.
 *
 * The operator is not in here — it is the header's, a badge on the phone and a
 * menu on the desktop — and every change applies at once, so there is no
 * `Apply` either.
 *
 * The calendar always shows what the filter covers: the picked day or range,
 * or the days a rule resolves to today, so `Past 7 days` is something you can
 * see. Tapping a day under a rule turns it into `is` that day.
 */
export function DateFilterStep({
  filter,
  onChange,
  presets,
  surface,
  today,
}: DateFilterStepProps) {
  const shown = highlightOf(filter, today);
  const [month, setMonth] = useState<Date>(
    () => fromIsoDate(shown?.before ?? "") ?? today
  );
  const active = presetFor(filter, presets);
  const sheet = surface === "sheet";
  const gutter = sheet ? "mx-4" : "";

  const pick = (next: DateFilter) => {
    const range = highlightOf(next, today);
    const end = fromIsoDate(range?.before ?? "");
    if (end) {
      setMonth(end);
    }
    onChange(next);
  };

  const blank = filter.op === "empty" || filter.op === "notEmpty";
  // The gap under each part, inside its collapse so a closed part takes none.
  const gap = sheet ? "pb-3" : "pb-2";

  // On a phone the presets are one swipeable row above the calendar; a mouse
  // cannot swipe, and most cannot scroll sideways without Shift, so on the
  // desktop they wrap into a footer under it instead — every one visible, the
  // way the calendar docs' presets sit.
  const presetRow = (
    <fieldset
      className={
        sheet
          ? `min-w-0 ${gap}`
          : "-mx-2 mt-2 -mb-1 min-w-0 border-border-muted border-t px-3 pt-3 pb-2"
      }
    >
      <legend className="sr-only">Presets</legend>
      <div
        className={
          sheet
            ? `ks-scroll-fade-x ${gutter} flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`
            : "flex flex-wrap gap-2"
        }
      >
        {presets.map((preset) => (
          <Toggle
            className="h-(--ks-control-xs,1.5rem) min-w-0 shrink-0 rounded-sm px-2.5 text-xs"
            key={preset.label}
            // Pressing the active preset again keeps it: these are choices.
            onPressedChange={() => pick(presetFilter(preset))}
            pressed={active?.label === preset.label}
            size="sm"
            variant="outline"
          >
            {preset.label}
          </Toggle>
        ))}
      </div>
    </fieldset>
  );

  // Each part that comes and goes with the operator opens and closes in
  // place (see `Collapse`), so switching to `is relative to today` slides the
  // calendar down under its pickers instead of jumping it 44px, and on the
  // desktop the popover resizes rather than snapping.
  return (
    <div className={sheet ? "pb-4" : "pb-1"}>
      {sheet ? presetRow : null}

      <Collapse open={filter.op === "relative"}>
        <RelativePicker
          className={`${gutter} ${gap}`}
          onChange={(rel) => pick(setRelative(filter, rel))}
          rel={relativeOf(filter)}
        />
      </Collapse>

      <Collapse open={blank}>
        <p
          className={`${sheet ? "px-4" : "px-2"} ${gap} text-muted-foreground text-sm`}
        >
          {filter.op === "notEmpty"
            ? "Matches every row with a date."
            : "Matches rows with no date."}
        </p>
      </Collapse>

      <Collapse open={!blank}>
        <FilterCalendar
          filter={filter}
          month={month}
          onChange={onChange}
          onMonthChange={setMonth}
          sheet={sheet}
          today={today}
        />
      </Collapse>

      {sheet ? null : presetRow}
    </div>
  );
}

/**
 * The calendar: a range for `is between` and for a rule, a single day for the
 * rest, always showing what the filter covers today.
 */
function FilterCalendar({
  filter,
  month,
  onChange,
  onMonthChange,
  sheet,
  today,
}: {
  filter: DateFilter;
  month: Date;
  onChange: (filter: DateFilter) => void;
  onMonthChange: (month: Date) => void;
  sheet: boolean;
  today: Date;
}) {
  const shown = highlightOf(filter, today);
  const start = fromIsoDate(shown?.after ?? "") ?? undefined;
  const end = fromIsoDate(shown?.before ?? "") ?? undefined;
  const onDay = (date: Date | undefined) => {
    if (date) {
      onChange(tapDay(filter, toIsoDate(date)));
    }
  };
  // Both kinds of calendar share everything but their selection.
  const calendar = {
    captionLayout: "dropdown" as const,
    className: sheet
      ? "mx-auto bg-transparent p-0 [--cell-size:min(--spacing(10),calc(100cqw/7))]"
      : // 36px, near the calendar docs' 38: the caption row is one cell
        // tall, and at the default 30px the 32px month/year selects stuck out.
        "mx-auto bg-transparent p-0 [--cell-size:--spacing(9)]",
    classNames: sheet
      ? { month: "flex w-full flex-col gap-2", week: "mt-0.5 flex w-full" }
      : undefined,
    // Nothing is created tomorrow.
    disabled: { after: today },
    endMonth: today,
    fixedWeeks: true,
    month,
    onMonthChange,
    startMonth: new Date(today.getFullYear() - 10, 0, 1),
    today,
    // Monday, so "This week" and the calendar agree on where a week starts.
    weekStartsOn: 1 as const,
  };

  return (
    <div
      className={
        sheet ? "mx-4 rounded-xl bg-muted p-3 dark:bg-muted/50" : undefined
      }
    >
      {/* On the sheet's `muted` box, light mode remaps `muted` to the page
          colour so today and a range's middle stay visible on it. */}
      <div
        className={
          sheet ? "@container not-dark:[--muted:var(--background)]" : undefined
        }
      >
        {filter.op === "between" || filter.op === "relative" ? (
          <Calendar
            {...calendar}
            mode="range"
            onSelect={(_range, date) => onDay(date)}
            selected={start ? { from: start, to: end } : undefined}
          />
        ) : (
          <Calendar
            {...calendar}
            mode="single"
            onSelect={(_day, date) => onDay(date)}
            selected={start}
          />
        )}
      </div>
    </div>
  );
}

const UNIT_LABELS: Record<RelativeUnit, [string, string]> = {
  day: ["day", "days"],
  month: ["month", "months"],
  week: ["week", "weeks"],
  year: ["year", "years"],
};

/**
 * `Past [7] [days]` / `This [week]` — Notion's pickers, minus `Next`, which on
 * a creation date could only match nothing.
 */
function RelativePicker({
  className,
  onChange,
  rel,
}: {
  className: string;
  onChange: (rel: Relative) => void;
  rel: Relative;
}) {
  const plural = rel.dir === "past" && rel.count !== 1 ? 1 : 0;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <NativeSelect
        aria-label="Relative to today"
        className="w-24"
        onChange={(event) =>
          onChange(
            event.target.value === "this"
              ? { dir: "this", unit: rel.unit }
              : { count: 1, dir: "past", unit: rel.unit }
          )
        }
        size="sm"
        value={rel.dir}
      >
        <NativeSelectOption value="past">Past</NativeSelectOption>
        <NativeSelectOption value="this">This</NativeSelectOption>
      </NativeSelect>
      {rel.dir === "past" && (
        <Input
          aria-label="How many"
          className="w-16"
          inputMode="numeric"
          min={1}
          onChange={(event) => {
            const count = Number.parseInt(event.target.value, 10);
            if (count >= 1 && count <= 999) {
              onChange({ ...rel, count });
            }
          }}
          size="sm"
          type="number"
          value={rel.count}
        />
      )}
      <NativeSelect
        aria-label="Unit"
        className="flex-1"
        onChange={(event) =>
          onChange({ ...rel, unit: event.target.value as RelativeUnit })
        }
        size="sm"
        value={rel.unit}
      >
        {RELATIVE_UNITS.map((unit) => (
          <NativeSelectOption key={unit} value={unit}>
            {UNIT_LABELS[unit][plural]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}
