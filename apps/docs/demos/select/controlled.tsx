"use client";

import { Button } from "@keystoneui/react/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@keystoneui/react/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";
import { useState } from "react";

export default function SelectControlled() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <FieldGroup className="w-full max-w-xs">
      <Field>
        <FieldLabel>Fruit</FieldLabel>
        <Select onValueChange={setValue} value={value}>
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectItem value="grapes">Grapes</SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription>Selected value: {value ?? "none"}</FieldDescription>
      </Field>
      <Field orientation="horizontal">
        <Button onClick={() => setValue(null)} size="sm" variant="outline">
          Clear
        </Button>
        <Button onClick={() => setValue("banana")} size="sm" variant="outline">
          Set Banana
        </Button>
      </Field>
    </FieldGroup>
  );
}
