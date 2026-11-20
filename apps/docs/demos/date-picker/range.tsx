"use client";

import { Button } from "@keystoneui/react/button";
import { Calendar } from "@keystoneui/react/calendar";
import { Field, FieldLabel } from "@keystoneui/react/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useId, useState } from "react";

// The shape Calendar's range mode selects. Declared here rather than imported
// from react-day-picker, which is Calendar's dependency, not this file's.
interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

// A fixed initial range: the demo is prerendered, so render must not read
// the clock.
const initialRange: DateRange = {
  from: new Date(2025, 0, 20),
  to: addDays(new Date(2025, 0, 20), 20),
};

function formatRange(range: DateRange | undefined) {
  if (!range?.from) {
    return "Pick a date range";
  }
  if (!range.to) {
    return format(range.from, "LLL dd, y");
  }
  return `${format(range.from, "LLL dd, y")} – ${format(range.to, "LLL dd, y")}`;
}

export default function DatePickerRange() {
  const [range, setRange] = useState<DateRange | undefined>(initialRange);
  const id = useId();

  return (
    <Field className="w-auto">
      <FieldLabel htmlFor={id} id={`${id}-label`}>
        Stay
      </FieldLabel>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              className="w-64 justify-start font-normal"
              aria-labelledby={`${id}-label ${id}`}
              id={id}
              variant="outline"
            >
              <CalendarIcon data-icon="inline-start" />
              {formatRange(range)}
            </Button>
          }
        />
        <PopoverContent
          align="start"
          aria-label="Choose stay dates"
          className="w-auto overflow-hidden p-0"
        >
          <Calendar
            defaultMonth={range?.from}
            mode="range"
            numberOfMonths={2}
            onSelect={setRange}
            resetOnSelect
            selected={range}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
