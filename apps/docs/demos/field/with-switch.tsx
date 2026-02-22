"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@keystoneui/react/field";
import { Switch } from "@keystoneui/react/switch";

export default function FieldWithSwitch() {
  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor="field-switch">Share across devices</FieldLabel>
        <FieldDescription>
          Focus is shared across devices, and turns off when you leave the app.
        </FieldDescription>
      </FieldContent>
      <Switch id="field-switch" />
    </Field>
  );
}
