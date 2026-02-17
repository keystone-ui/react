"use client";

import { Field, FieldLabel } from "keystoneui/field";
import { Switch } from "keystoneui/switch";

export default function SwitchDisabled() {
  return (
    <Field className="w-fit" data-disabled orientation="horizontal">
      <Switch disabled id="switch-disabled" />
      <FieldLabel htmlFor="switch-disabled">Disabled</FieldLabel>
    </Field>
  );
}
