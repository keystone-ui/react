"use client";

import { Field, FieldError, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function FieldValidationError() {
  return (
    <Field data-invalid>
      <FieldLabel htmlFor="field-email">Email</FieldLabel>
      <Input
        aria-invalid
        defaultValue="invalid-email"
        id="field-email"
        type="email"
      />
      <FieldError>Enter a valid email address.</FieldError>
    </Field>
  );
}
