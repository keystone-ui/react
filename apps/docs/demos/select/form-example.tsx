"use client";

import { Button } from "@keystoneui/react/button";
import { Field, FieldGroup, FieldLabel } from "@keystoneui/react/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";

const countries: Record<string, string> = {
  us: "United States",
  ca: "Canada",
  uk: "United Kingdom",
  au: "Australia",
};

const states: Record<string, string> = {
  ca: "California",
  ny: "New York",
  tx: "Texas",
  fl: "Florida",
};

export default function SelectFormExample() {
  return (
    <form
      className="w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Country</FieldLabel>
          <Select defaultValue="us" items={countries} name="country">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(countries).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>State</FieldLabel>
          <Select items={states} name="state">
            <SelectTrigger>
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(states).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field orientation="horizontal">
          <Button type="reset" variant="outline">
            Reset
          </Button>
          <Button type="submit">Submit</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
