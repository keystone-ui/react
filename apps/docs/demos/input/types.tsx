"use client";

import { Field, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function InputTypes() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="type-email">Email</FieldLabel>
        <Input id="type-email" placeholder="name@example.com" type="email" />
      </Field>
      <Field>
        <FieldLabel htmlFor="type-number">Number</FieldLabel>
        <Input id="type-number" placeholder="0" type="number" />
      </Field>
      <Field>
        <FieldLabel htmlFor="type-tel">Phone</FieldLabel>
        <Input id="type-tel" placeholder="+1 (555) 123-4567" type="tel" />
      </Field>
      <Field>
        <FieldLabel htmlFor="type-url">URL</FieldLabel>
        <Input id="type-url" placeholder="https://example.com" type="url" />
      </Field>
    </div>
  );
}
