"use client";

import { Field, FieldDescription, FieldLabel } from "keystoneui/field";
import { Textarea } from "keystoneui/textarea";

export default function TextareaDisabled() {
  return (
    <Field data-disabled>
      <FieldLabel htmlFor="textarea-disabled">Message</FieldLabel>
      <Textarea
        disabled
        id="textarea-disabled"
        placeholder="Type your message here."
      />
      <FieldDescription>This field is currently disabled.</FieldDescription>
    </Field>
  );
}
