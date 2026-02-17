"use client";

import { Field, FieldDescription, FieldLabel } from "keystoneui/field";
import { Textarea } from "keystoneui/textarea";

export default function TextareaWithField() {
  return (
    <Field>
      <FieldLabel htmlFor="bio">Bio</FieldLabel>
      <Textarea id="bio" placeholder="Tell us about yourself..." />
      <FieldDescription>
        Write a short introduction about yourself.
      </FieldDescription>
    </Field>
  );
}
