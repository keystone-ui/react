"use client";

import { DateInput } from "@keystoneui/react/date-input";
import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";

export default function DateInputWithField() {
  return (
    <Field>
      <FieldLabel htmlFor="date-event">Event Date</FieldLabel>
      <DateInput id="date-event" />
      <FieldDescription>Select the date for your event.</FieldDescription>
    </Field>
  );
}
