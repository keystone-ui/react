"use client";

import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";
import { Textarea } from "@keystoneui/react/textarea";

export default function FieldTextareaExample() {
  return (
    <div className="w-full max-w-xs">
      <Field>
        <FieldLabel htmlFor="feedback">Feedback</FieldLabel>
        <Textarea
          id="feedback"
          placeholder="Your feedback helps us improve..."
          rows={4}
        />
        <FieldDescription>
          Share your thoughts about our service.
        </FieldDescription>
      </Field>
    </div>
  );
}
