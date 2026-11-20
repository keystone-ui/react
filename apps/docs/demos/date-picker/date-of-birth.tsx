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
import { ChevronDown as ChevronDownIcon } from "lucide-react";
import { useId, useState } from "react";

// The year dropdown starts here, so a birth year decades back is two picks
// away instead of dozens of month clicks.
const firstMonth = new Date(1900, 0);

export default function DatePickerDateOfBirth() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const [date, setDate] = useState<Date | undefined>(undefined);
  // Read when the popup opens, not during render: the demo is prerendered,
  // and a birth date can be today but never later.
  const [today, setToday] = useState<Date>();

  return (
    <Field className="w-auto">
      <FieldLabel htmlFor={id} id={`${id}-label`}>
        Date of birth
      </FieldLabel>
      <Popover
        onOpenChange={(next) => {
          if (next) {
            setToday(new Date());
          }
          setOpen(next);
        }}
        open={open}
      >
        <PopoverTrigger
          render={
            <Button
              className="w-48 justify-between font-normal data-[empty=true]:text-muted-foreground"
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
          aria-label="Choose date of birth"
          className="w-auto overflow-hidden p-0"
        >
          <Calendar
            captionLayout="dropdown"
            defaultMonth={date}
            disabled={today && { after: today }}
            endMonth={today}
            mode="single"
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
            selected={date}
            startMonth={firstMonth}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
