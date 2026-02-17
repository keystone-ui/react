"use client";

import { Field, FieldDescription, FieldLabel } from "keystoneui/field";
import { Input } from "keystoneui/input";

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
