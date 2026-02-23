"use client";

import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function InputWithHelperText() {
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="password">Password</FieldLabel>
      <Input id="password" placeholder="••••••••" type="password" />
      <FieldDescription>
        Must be at least 8 characters with one uppercase letter and one number.
      </FieldDescription>
    </Field>
  );
}
