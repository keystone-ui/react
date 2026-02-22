"use client";

import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function InputWithField() {
  return (
    <Field>
      <FieldLabel htmlFor="input-username">Username</FieldLabel>
      <Input id="input-username" placeholder="Enter your username" />
      <FieldDescription>
        Choose a unique username for your account.
      </FieldDescription>
    </Field>
  );
}
