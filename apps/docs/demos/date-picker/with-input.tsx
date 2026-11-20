"use client";

import { Calendar } from "@keystoneui/react/calendar";
import { Field, FieldError, FieldLabel } from "@keystoneui/react/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useId, useState } from "react";

const DISPLAY_FORMAT = "MMMM d, yyyy";
// Typed text is read strictly in one of these shapes. `new Date(text)` is
// avoided on purpose: it accepts "1" as a date and differs between browsers.
const ACCEPTED_FORMATS = [
  DISPLAY_FORMAT,
  "MMM d, yyyy",
  "yyyy-MM-dd",
  "M/d/yyyy",
];
// date-fns reads a lone initial such as "J" as a month name, so the text must
// first have one of the accepted shapes: a month name of three letters or
// more, an ISO date, or a numeric month/day/year.
const ACCEPTED_SHAPE =
  /^(?:[a-z]{3,9} \d{1,2}, \d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})$/i;
// Anchors parsing only; a fixed date keeps render free of the clock.
const REFERENCE = new Date(2025, 0, 1);

function parseTyped(text: string): Date | undefined {
  if (!ACCEPTED_SHAPE.test(text.trim())) {
    return undefined;
  }
  for (const pattern of ACCEPTED_FORMATS) {
    const parsed = parse(text.trim(), pattern, REFERENCE);
    if (isValid(parsed) && parsed.getFullYear() >= 1000) {
      return parsed;
    }
  }
  return undefined;
}

export default function DatePickerWithInput() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 5, 1));
  const [month, setMonth] = useState<Date | undefined>(date);
  const [value, setValue] = useState(date ? format(date, DISPLAY_FORMAT) : "");
  const [invalid, setInvalid] = useState(false);

  return (
    <Field className="w-64">
      <FieldLabel htmlFor={id}>Subscription date</FieldLabel>
      <InputGroup>
        <InputGroupInput
          aria-describedby={invalid ? `${id}-error` : undefined}
          aria-invalid={invalid}
          id={id}
          onBlur={() => {
            setInvalid(value.trim() !== "" && !parseTyped(value));
          }}
          onChange={(event) => {
            const text = event.target.value;
            setValue(text);
            const parsed = parseTyped(text);
            // The selection follows the text: an empty or unreadable draft
            // selects nothing, so the grid never shows a stale day.
            setDate(parsed);
            if (parsed) {
              setMonth(parsed);
            }
            if (parsed || !text.trim()) {
              setInvalid(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
            }
            if (event.key === "Enter") {
              setInvalid(value.trim() !== "" && !parseTyped(value));
            }
          }}
          placeholder="June 1, 2025"
          value={value}
        />
        <InputGroupAddon align="inline-end">
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  aria-label="Choose date"
                  size="icon-xs"
                  variant="ghost"
                >
                  <CalendarIcon />
                </InputGroupButton>
              }
            />
            <PopoverContent
              align="end"
              alignOffset={-8}
              aria-label="Choose subscription date"
              className="w-auto overflow-hidden p-0"
              sideOffset={10}
            >
              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                onSelect={(d) => {
                  setDate(d);
                  if (d) {
                    setMonth(d);
                  }
                  setValue(d ? format(d, DISPLAY_FORMAT) : "");
                  setInvalid(false);
                  setOpen(false);
                }}
                selected={date}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
      {invalid ? (
        <FieldError id={`${id}-error`}>
          Enter a date such as June 1, 2025 or 2025-06-01.
        </FieldError>
      ) : null}
    </Field>
  );
}
