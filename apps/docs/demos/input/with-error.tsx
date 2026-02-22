"use client";

import { Field, FieldError, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function InputWithError() {
  return (
    <Field data-invalid>
      <FieldLabel htmlFor="input-invalid">Email</FieldLabel>
      <Input aria-invalid id="input-invalid" placeholder="Email" />
      <FieldError>This field contains validation errors.</FieldError>
    </Field>
  );
}
