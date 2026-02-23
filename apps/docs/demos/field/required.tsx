"use client";

import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function FieldRequired() {
  return (
    <div className="w-full max-w-xs">
      <Field>
        <FieldLabel htmlFor="required-email">
          Email<span className="ml-1 text-destructive">*</span>
        </FieldLabel>
        <Input id="required-email" required type="email" />
        <FieldDescription>We&apos;ll never share your email.</FieldDescription>
      </Field>
    </div>
  );
}
