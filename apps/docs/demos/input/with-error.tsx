"use client";

import { Field, FieldError, FieldLabel } from "keystoneui/field";
import { Input } from "keystoneui/input";

export default function InputWithError() {
  return (
    <Field data-invalid>
      <FieldLabel htmlFor="input-invalid">Email</FieldLabel>
      <Input aria-invalid id="input-invalid" placeholder="Email" />
      <FieldError>This field contains validation errors.</FieldError>
    </Field>
  );
}
