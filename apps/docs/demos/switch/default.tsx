"use client";

import { Field, FieldLabel } from "keystoneui/field";
import { Switch } from "keystoneui/switch";

export default function SwitchDefault() {
  return (
    <Field className="w-fit" orientation="horizontal">
      <Switch id="airplane-mode" />
      <FieldLabel htmlFor="airplane-mode">Airplane Mode</FieldLabel>
    </Field>
  );
}
