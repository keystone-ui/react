"use client";

import { DateInput } from "@keystoneui/react/date-input";
import { Field, FieldGroup, FieldLabel } from "@keystoneui/react/field";

export default function DateInputRange() {
  return (
    <FieldGroup className="flex-row items-end">
      <Field>
        <FieldLabel htmlFor="date-from">From</FieldLabel>
        <DateInput id="date-from" />
      </Field>
      <Field>
        <FieldLabel htmlFor="date-to">To</FieldLabel>
        <DateInput id="date-to" />
      </Field>
    </FieldGroup>
  );
}
