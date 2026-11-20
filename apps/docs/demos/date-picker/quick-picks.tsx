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
import { useId, useState } from "react";

// Each pick is resolved on click. Reading the clock at module scope would
// run during prerendering, where the current time is not a stable input.
const picks = [
  { label: "Tomorrow", pick: (now: Date) => addDays(now, 1) },
  { label: "Next week", pick: (now: Date) => addWeeks(now, 1) },
  { label: "Next Monday", pick: (now: Date) => nextMonday(now) },
  { label: "In 2 weeks", pick: (now: Date) => addWeeks(now, 2) },
];

export default function DatePickerQuickPicks() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <Field className="w-auto">
      <FieldLabel htmlFor={id} id={`${id}-label`}>
        Publish on
      </FieldLabel>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          render={
            <Button
              className="w-56 justify-start font-normal data-[empty=true]:text-muted-foreground"
              data-empty={!date}
              aria-labelledby={`${id}-label ${id}`}
              id={id}
              variant="outline"
            >
              <CalendarIcon data-icon="inline-start" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          }
        />
        <PopoverContent
          align="start"
          aria-label="Choose publication date"
          className="flex w-auto overflow-hidden p-0"
          sideOffset={8}
        >
          <div className="flex flex-col gap-1 border-r p-3">
            {picks.map((item) => (
              <Button
                className="justify-start"
                key={item.label}
                onClick={() => {
                  setDate(item.pick(new Date()));
                  setOpen(false);
                }}
                size="sm"
                variant="ghost"
              >
                {item.label}
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
