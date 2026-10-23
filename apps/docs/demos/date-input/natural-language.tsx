"use client";

import { Button } from "@keystoneui/react/button";
import { Calendar } from "@keystoneui/react/calendar";
import { Field, FieldLabel } from "@keystoneui/react/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import { addDays, addWeeks, format, nextMonday } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

// Each preset is resolved on click. Reading the clock at module scope would
// run during prerendering, where the current time is not a stable input.
const presets = [
  { label: "Tomorrow", pick: (now: Date) => addDays(now, 1) },
  { label: "Next week", pick: (now: Date) => addWeeks(now, 1) },
  { label: "Next Monday", pick: (now: Date) => nextMonday(now) },
  { label: "In 2 weeks", pick: (now: Date) => addWeeks(now, 2) },
];

export default function DatePickerNaturalLanguage() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <Field className="max-w-xs">
      <FieldLabel>Schedule Date</FieldLabel>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          render={
            <Button className="w-full justify-start" variant="outline">
              <CalendarIcon className="mr-2 size-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          }
        />
        <PopoverContent
          align="start"
          className="flex w-auto p-0"
          sideOffset={8}
        >
          <div className="flex flex-col gap-1 border-r p-3">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                onClick={() => {
                  setDate(preset.pick(new Date()));
                  setOpen(false);
                }}
                size="sm"
                variant="ghost"
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            defaultMonth={date}
            mode="single"
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
