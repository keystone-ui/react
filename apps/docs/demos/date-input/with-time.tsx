"use client";

import { Button } from "@keystoneui/react/button";
import { Calendar } from "@keystoneui/react/calendar";
import { Field, FieldGroup, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

export default function DatePickerWithTime() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <FieldGroup className="max-w-xs flex-row">
      <Field>
        <FieldLabel htmlFor="date-time-picker">Date</FieldLabel>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger
            render={
              <Button
                className="w-36 font-normal [&>span]:w-full [&>span]:justify-between"
                id="date-time-picker"
                variant="outline"
              >
                {date ? format(date, "PPP") : "Select date"}
                <ChevronDownIcon className="text-muted-foreground" />
              </Button>
            }
          />
          <PopoverContent align="start" className="w-auto overflow-hidden p-0">
            <Calendar
              captionLayout="dropdown"
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
      <Field className="w-32">
        <FieldLabel htmlFor="time-picker">Time</FieldLabel>
        <Input
          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          defaultValue="10:30:00"
          id="time-picker"
          step="1"
          type="time"
        />
      </Field>
    </FieldGroup>
  );
}
