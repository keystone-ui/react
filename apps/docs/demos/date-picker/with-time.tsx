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
import { ChevronDown as ChevronDownIcon } from "lucide-react";
import { useId, useState } from "react";

export default function DatePickerWithTime() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <FieldGroup className="max-w-xs flex-row">
      <Field>
        <FieldLabel htmlFor={id} id={`${id}-label`}>
          Date
        </FieldLabel>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger
            render={
              <Button
                className="w-36 justify-between font-normal data-[empty=true]:text-muted-foreground"
                data-empty={!date}
                aria-labelledby={`${id}-label ${id}`}
                id={id}
                variant="outline"
              >
                {date ? format(date, "PP") : "Select date"}
                <ChevronDownIcon className="text-muted-foreground" />
              </Button>
            }
          />
          <PopoverContent
            align="start"
            aria-label="Choose a date"
            className="w-auto overflow-hidden p-0"
          >
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
      <Field className="w-32">
        <FieldLabel htmlFor={`${id}-time`}>Time</FieldLabel>
        <Input
          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          defaultValue="10:30:00"
          id={`${id}-time`}
          step="1"
          type="time"
        />
      </Field>
    </FieldGroup>
  );
}
