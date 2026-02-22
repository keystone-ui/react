"use client";

import { Field, FieldGroup, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function FieldGrid() {
  return (
    <FieldGroup className="grid grid-cols-2">
      <Field>
        <FieldLabel htmlFor="first-name">First Name</FieldLabel>
        <Input id="first-name" placeholder="Jordan" />
      </Field>
      <Field>
        <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
        <Input id="last-name" placeholder="Lee" />
      </Field>
    </FieldGroup>
  );
}
