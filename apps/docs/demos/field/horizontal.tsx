"use client";

import { Field, FieldLabel } from "keystoneui/field";
import { Input } from "keystoneui/input";

export default function FieldHorizontal() {
  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor="horizontal-name">Name</FieldLabel>
      <Input id="horizontal-name" placeholder="Evil Rabbit" />
    </Field>
  );
}
