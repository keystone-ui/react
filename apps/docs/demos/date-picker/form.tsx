"use client";

import { Button } from "@keystoneui/react/button";
import { Calendar } from "@keystoneui/react/calendar";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@keystoneui/react/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useId, useState } from "react";

export default function DatePickerForm() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState<Date | undefined>(undefined);

  return (
    <form
      className="flex w-64 flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!date) {
          setError("Choose a start date.");
          setSubmitted(undefined);
          return;
        }
        setError(undefined);
        setSubmitted(date);
      }}
    >
      <Field>
        <FieldLabel htmlFor={id} id={`${id}-label`}>
          Start date
        </FieldLabel>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger
            render={
              <Button
                aria-describedby={error ? `${id}-error` : `${id}-hint`}
                aria-invalid={error ? true : undefined}
                className="justify-start font-normal data-[empty=true]:text-muted-foreground"
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
            aria-label="Choose start date"
            className="w-auto overflow-hidden p-0"
          >
            <Calendar
              defaultMonth={date}
              mode="single"
              onSelect={(d) => {
                setDate(d);
                setError(undefined);
                setOpen(false);
              }}
              selected={date}
            />
          </PopoverContent>
        </Popover>
        {error ? (
          <FieldError id={`${id}-error`}>{error}</FieldError>
        ) : (
          <FieldDescription id={`${id}-hint`}>
            Your plan starts on this day.
          </FieldDescription>
        )}
      </Field>
      <Button className="self-start" type="submit">
        Continue
      </Button>
      {submitted ? (
        <p className="text-muted-foreground text-sm" role="status">
          Starts {format(submitted, "PPP")}.
        </p>
      ) : null}
    </form>
  );
}
