"use client";

import { Field, FieldDescription, FieldLabel } from "keystoneui/field";
import { Textarea } from "keystoneui/textarea";
import { useState } from "react";

const MAX_LENGTH = 200;

export default function TextareaCharacterCount() {
  const [value, setValue] = useState("");

  return (
    <Field>
      <FieldLabel htmlFor="textarea-char-count">Bio</FieldLabel>
      <Textarea
        id="textarea-char-count"
        maxLength={MAX_LENGTH}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tell us about yourself..."
        value={value}
      />
      <FieldDescription>
        {value.length}/{MAX_LENGTH} characters
      </FieldDescription>
    </Field>
  );
}
