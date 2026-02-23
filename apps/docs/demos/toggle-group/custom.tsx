"use client";

import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";
import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";
import { useState } from "react";

export default function ToggleGroupCustom() {
  const [fontWeight, setFontWeight] = useState<string[]>(["normal"]);
  const current = fontWeight[0] || "normal";

  return (
    <Field>
      <FieldLabel>Font Weight</FieldLabel>
      <ToggleGroup
        onValueChange={setFontWeight}
        size="lg"
        spacing={2}
        value={fontWeight}
        variant="outline"
      >
        <ToggleGroupItem
          aria-label="Light"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="light"
        >
          <span className="font-light text-2xl leading-none">Aa</span>
          <span className="text-muted-foreground text-xs">Light</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Normal"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="normal"
        >
          <span className="font-normal text-2xl leading-none">Aa</span>
          <span className="text-muted-foreground text-xs">Normal</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Medium"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="medium"
        >
          <span className="font-medium text-2xl leading-none">Aa</span>
          <span className="text-muted-foreground text-xs">Medium</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Bold"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="bold"
        >
          <span className="font-bold text-2xl leading-none">Aa</span>
          <span className="text-muted-foreground text-xs">Bold</span>
        </ToggleGroupItem>
      </ToggleGroup>
      <FieldDescription>
        Use{" "}
        <code className="rounded-md bg-muted px-1 py-0.5 font-mono">
          font-{current}
        </code>{" "}
        to set the font weight.
      </FieldDescription>
    </Field>
  );
}
