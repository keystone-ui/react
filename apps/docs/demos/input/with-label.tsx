"use client";

import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function InputWithLabel() {
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" placeholder="Enter your username" />
      <FieldDescription>
        Choose a unique username for your account.
      </FieldDescription>
    </Field>
  );
}
