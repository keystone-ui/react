"use client";

import { Button } from "@keystoneui/react/button";
import { Calendar } from "@keystoneui/react/calendar";
import { Field, FieldLabel } from "@keystoneui/react/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

export default function DatePickerControlled() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);

  return (
    <div className="flex max-w-xs flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="date-controlled">Controlled Date</FieldLabel>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger
            render={
              <Button
                className="justify-start font-normal"
                id="date-controlled"
                variant="outline"
              >
                <CalendarIcon data-icon="inline-start" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-auto p-0">
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
      <div className="flex gap-2">
        <Button onClick={() => setDate(new Date())} size="sm" variant="outline">
          Today
        </Button>
        <Button onClick={() => setDate(undefined)} size="sm" variant="outline">
          Clear
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Selected: {date ? format(date, "yyyy-MM-dd") : "none"}
      </p>
    </div>
  );
}
