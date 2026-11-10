"use client";

import { useState } from "react";
import {
  DATE_MODES,
  type DateBounds,
  type DateMode,
  type DatePreset,
  fromIsoDate,
  modeFromBounds,
  presetFor,
  resolvePreset,
  setDateMode,
  tapDay,
  toIsoDate,
} from "@/components/date-filter";
import { OperatorToggle } from "@/components/drawer-parts";
import { Calendar } from "@/components/ui/calendar";
import { Toggle } from "@/components/ui/toggle";

interface DateFilterStepProps {
  bounds: DateBounds;
  onChange: (bounds: DateBounds) => void;
  presets: readonly DatePreset[];
  today: Date;
}

/**
 * A date filter's drawer step: a mode, the table's presets, and a calendar.
 *
 * Every tap applies at once, like the rest of the drawer — so there is no
 * `Apply` here, and nothing a half-finished pick can leave behind that the
 * label does not show (see `nextBetween`).
 *
 * The presets are a wrapped row rather than a swipeable strip. A strip that
 * runs off the edge hides whichever presets are past it, and there are few
 * enough to show them all in two lines.
 *
 * The mode is local and is read off the bounds when the step opens (the
 * stepper mounts only the active step), so a range set on a desktop opens in
 * the mode that shows it.
 */
export function DateFilterStep({
  bounds,
  onChange,
  presets,
  today,
}: DateFilterStepProps) {
  const [mode, setMode] = useState<DateMode>(() => modeFromBounds(bounds));
  const [month, setMonth] = useState<Date>(
    () => fromIsoDate(bounds.before || bounds.after) ?? today
  );
  const active = presetFor(bounds, presets, today);

  const pickPreset = (preset: DatePreset) => {
    const next = resolvePreset(preset.key, today);
    // `Today` is one day, so it opens `On`; `Last 7 days` is a range.
    setMode(modeFromBounds(next));
    setMonth(fromIsoDate(next.before) ?? today);
    onChange(next);
  };

  const pickDay = (date: Date | undefined) => {
    if (date) {
      onChange(tapDay(bounds, mode, toIsoDate(date)));
    }
  };

  // Both kinds of calendar share everything but their selection.
  const calendar = {
    className:
      "mx-auto bg-transparent p-0 [--cell-size:min(--spacing(10),calc(100cqw/7))]",
    // Tighter rows than the popover calendar's: a sheet is capped at 80dvh,
    // and the 8px between weeks is what pushed the last one below the fold
    // on a 667px phone. The 40px cells stay — they are the touch targets.
    classNames: {
      month: "flex w-full flex-col gap-2",
      week: "mt-0.5 flex w-full",
    },
    // Month and year as the phone's own pickers. With only arrows, a sign-up
    // from two years back is two dozen taps away; the dropdowns make any
    // month two. Ten years is a generous window for a creation date.
    captionLayout: "dropdown" as const,
    startMonth: new Date(today.getFullYear() - 10, 0, 1),
    // Nothing is created tomorrow.
    disabled: { after: today },
    endMonth: today,
    // Six rows always, so paging months does not resize the sheet.
    fixedWeeks: true,
    month,
    onMonthChange: setMonth,
    today,
  };
  const start = fromIsoDate(bounds.after || bounds.before) ?? undefined;
  const end = fromIsoDate(bounds.before || bounds.after) ?? undefined;

  return (
    <div className="pb-4">
      <OperatorToggle
        label="Created condition"
        onValueChange={(next) => {
          const nextMode = next as DateMode;
          setMode(nextMode);
          onChange(setDateMode(bounds, nextMode));
        }}
        options={DATE_MODES}
        value={mode}
      />
      <fieldset className="flex flex-wrap gap-2 px-4 pb-2">
        <legend className="sr-only">Presets</legend>
        {presets.map((preset) => (
          <Toggle
            className="rounded-full"
            key={preset.key}
            // Pressing the active preset again keeps it: these are choices,
            // like the other steps' radios, not switches.
            onPressedChange={() => pickPreset(preset)}
            pressed={active?.key === preset.key}
            size="sm"
            variant="outline"
          >
            {preset.label}
          </Toggle>
        ))}
      </fieldset>
      <p aria-live="polite" className="px-4 pb-1 text-muted-foreground text-sm">
        {dateHint(bounds, mode)}
      </p>
      <div className="@container px-4">
        {mode === "between" ? (
          <Calendar
            {...calendar}
            mode="range"
            onSelect={(_range, date) => pickDay(date)}
            selected={start ? { from: start, to: end } : undefined}
          />
        ) : (
          <Calendar
            {...calendar}
            mode="single"
            onSelect={(_day, date) => pickDay(date)}
            selected={start}
          />
        )}
      </div>
    </div>
  );
}

/**
 * The line above the calendar: what the next tap does, until there is
 * something to read back, then what is set.
 */
function dateHint(bounds: DateBounds, mode: DateMode): string {
  const { after, before } = bounds;
  switch (mode) {
    case "on":
      return after ? `On ${after}` : "Tap a day";
    case "from":
      return after ? `From ${after} to today` : "Tap the first day";
    case "to":
      return before ? `Up to and including ${before}` : "Tap the last day";
    default:
      if (after && before && after !== before) {
        return `${after} – ${before}`;
      }
      return after || before
        ? "Tap another day to make it a range"
        : "Tap a day, or two for a range";
  }
}
