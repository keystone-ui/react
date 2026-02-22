"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@keystoneui/react/field";
import { RadioGroup, RadioGroupItem } from "@keystoneui/react/radio-group";

export default function RadioGroupWithDescription() {
  return (
    <RadioGroup defaultValue="comfortable">
      <Field orientation="horizontal">
        <RadioGroupItem id="desc-r1" value="default" />
        <FieldContent>
          <FieldLabel htmlFor="desc-r1">Default</FieldLabel>
          <FieldDescription>
            Standard spacing for most use cases.
          </FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem id="desc-r2" value="comfortable" />
        <FieldContent>
          <FieldLabel htmlFor="desc-r2">Comfortable</FieldLabel>
          <FieldDescription>More space between elements.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem id="desc-r3" value="compact" />
        <FieldContent>
          <FieldLabel htmlFor="desc-r3">Compact</FieldLabel>
          <FieldDescription>
            Minimal spacing for dense layouts.
          </FieldDescription>
        </FieldContent>
      </Field>
    </RadioGroup>
  );
}
