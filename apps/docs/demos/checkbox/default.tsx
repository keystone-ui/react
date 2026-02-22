"use client";

import { Checkbox } from "@keystoneui/react/checkbox";
import { Field, FieldLabel } from "@keystoneui/react/field";

export default function CheckboxDefault() {
  return (
    <Field orientation="horizontal">
      <Checkbox id="terms" name="terms" />
      <FieldLabel htmlFor="terms">Accept terms and conditions</FieldLabel>
    </Field>
  );
}
