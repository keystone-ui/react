"use client";

import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function FieldDefault() {
  return (
    <Field>
      <FieldLabel htmlFor="field-username">Username</FieldLabel>
      <Input id="field-username" placeholder="Enter your username" />
      <FieldDescription>
        Choose a unique username for your account.
      </FieldDescription>
    </Field>
  );
}
