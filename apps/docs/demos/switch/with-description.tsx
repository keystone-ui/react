"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "keystoneui/field";
import { Switch } from "keystoneui/switch";

export default function SwitchWithDescription() {
  return (
    <Field className="max-w-sm" orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor="share-devices">Share across devices</FieldLabel>
        <FieldDescription>
          Focus is shared across devices, and turns off when you leave the app.
        </FieldDescription>
      </FieldContent>
      <Switch id="share-devices" />
    </Field>
  );
}
