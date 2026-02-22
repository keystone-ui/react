"use client";

import { Checkbox } from "@keystoneui/react/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@keystoneui/react/field";

export default function CheckboxWithDescription() {
  return (
    <Field orientation="horizontal">
      <Checkbox defaultChecked id="terms" name="terms" />
      <FieldContent>
        <FieldLabel htmlFor="terms">Accept terms and conditions</FieldLabel>
        <FieldDescription>
          By clicking this checkbox, you agree to the terms and conditions.
        </FieldDescription>
      </FieldContent>
    </Field>
  );
}
