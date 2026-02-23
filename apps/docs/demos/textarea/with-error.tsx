"use client";

import { Field, FieldError, FieldLabel } from "@keystoneui/react/field";
import { Textarea } from "@keystoneui/react/textarea";

export default function TextareaWithError() {
  return (
    <Field data-invalid>
      <FieldLabel htmlFor="textarea-error">Message</FieldLabel>
      <Textarea
        aria-invalid
        id="textarea-error"
        placeholder="Enter your message"
      />
      <FieldError>This field contains validation errors.</FieldError>
    </Field>
  );
}
