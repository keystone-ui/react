"use client";

import { Checkbox } from "keystoneui/checkbox";
import { Field, FieldLabel } from "keystoneui/field";

export default function CheckboxDefault() {
  return (
    <Field orientation="horizontal">
      <Checkbox id="terms" name="terms" />
      <FieldLabel htmlFor="terms">Accept terms and conditions</FieldLabel>
    </Field>
  );
}
