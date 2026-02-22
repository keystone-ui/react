"use client";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

export default function FieldFieldSet() {
  return (
    <FieldSet>
      <FieldLegend>Address Information</FieldLegend>
      <FieldDescription>
        We need your address to deliver your order.
      </FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="street">Street Address</FieldLabel>
          <Input id="street" placeholder="123 Main St" type="text" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" placeholder="New York" type="text" />
          </Field>
          <Field>
            <FieldLabel htmlFor="zip">Postal Code</FieldLabel>
            <Input id="zip" placeholder="90502" type="text" />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
