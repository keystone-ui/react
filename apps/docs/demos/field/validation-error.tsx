"use client";

import { Field, FieldError, FieldLabel } from "keystoneui/field";
import { Input } from "keystoneui/input";

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
