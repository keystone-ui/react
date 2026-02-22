"use client";

import { Field, FieldGroup, FieldLabel } from "@keystoneui/react/field";
import { Switch } from "@keystoneui/react/switch";

export default function SwitchSizes() {
  return (
    <FieldGroup className="w-full max-w-40">
      <Field orientation="horizontal">
        <Switch id="switch-sm" size="sm" />
        <FieldLabel htmlFor="switch-sm">Small</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Switch id="switch-default" size="default" />
        <FieldLabel htmlFor="switch-default">Default</FieldLabel>
      </Field>
    </FieldGroup>
  );
}
