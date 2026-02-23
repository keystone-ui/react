"use client";

import { Checkbox } from "@keystoneui/react/checkbox";
import { Field, FieldLabel } from "@keystoneui/react/field";
import { useState } from "react";

export default function CheckboxControlled() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-2">
      <Field orientation="horizontal">
        <Checkbox
          checked={checked}
          id="controlled-checkbox"
          name="controlled-checkbox"
          onCheckedChange={setChecked}
        />
        <FieldLabel htmlFor="controlled-checkbox">
          {checked ? "Checked" : "Unchecked"}
        </FieldLabel>
      </Field>
      <p className="text-muted-foreground text-sm">
        Current state: <code>{String(checked)}</code>
      </p>
    </div>
  );
}
