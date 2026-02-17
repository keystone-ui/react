"use client";

import { DateInput } from "keystoneui/date-input";
import { Field, FieldDescription, FieldLabel } from "keystoneui/field";

export default function DateInputDateOfBirth() {
  return (
    <Field>
      <FieldLabel htmlFor="dob">Date of Birth</FieldLabel>
      <DateInput id="dob" max="2010-12-31" min="1900-01-01" />
      <FieldDescription>
        You must be at least 16 years old to create an account.
      </FieldDescription>
    </Field>
  );
}
