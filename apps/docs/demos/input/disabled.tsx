"use client";

import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function InputDisabled() {
  return (
    <Field data-disabled>
      <FieldLabel htmlFor="input-disabled">Email</FieldLabel>
      <Input disabled id="input-disabled" placeholder="Email" type="email" />
      <FieldDescription>This field is currently disabled.</FieldDescription>
    </Field>
  );
}
