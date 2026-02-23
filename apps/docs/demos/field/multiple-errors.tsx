"use client";

import { Field, FieldError, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function FieldMultipleErrors() {
  return (
    <div className="w-full max-w-xs">
      <Field data-invalid>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input aria-invalid defaultValue="abc" id="password" type="password" />
        <FieldError
          errors={[
            { message: "Must be at least 8 characters" },
            { message: "Must contain a number" },
            { message: "Must contain a special character" },
          ]}
        />
      </Field>
    </div>
  );
}
