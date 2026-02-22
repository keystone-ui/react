"use client";

import { Checkbox } from "@keystoneui/react/checkbox";
import { Field, FieldLabel } from "@keystoneui/react/field";

export default function CheckboxDisabled() {
  return (
    <Field data-disabled orientation="horizontal">
      <Checkbox disabled id="notifications" name="notifications" />
      <FieldLabel htmlFor="notifications">Enable notifications</FieldLabel>
    </Field>
  );
}
