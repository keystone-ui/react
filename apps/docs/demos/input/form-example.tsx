"use client";

import { Button } from "@keystoneui/react/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function InputFormExample() {
  return (
    <form className="w-full max-w-sm" onSubmit={(e) => e.preventDefault()}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="form-name">Name</FieldLabel>
          <Input id="form-name" placeholder="Evil Rabbit" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="form-email">Email</FieldLabel>
          <Input
            id="form-email"
            placeholder="john@example.com"
            required
            type="email"
          />
          <FieldDescription>
            We'll never share your email with anyone.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="form-password">Password</FieldLabel>
          <Input
            id="form-password"
            placeholder="••••••••"
            required
            type="password"
          />
        </Field>
        <Field orientation="horizontal">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
