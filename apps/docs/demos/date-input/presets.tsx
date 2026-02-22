"use client";

import { Button } from "@keystoneui/react/button";
import { DateInput } from "@keystoneui/react/date-input";
import { Field, FieldLabel } from "@keystoneui/react/field";
import { useState } from "react";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function DateInputPresets() {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor="date-presets">Date</FieldLabel>
        <DateInput
          id="date-presets"
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Today", days: 0 },
          { label: "Tomorrow", days: 1 },
          { label: "In a week", days: 7 },
          { label: "In 2 weeks", days: 14 },
        ].map((preset) => (
          <Button
            key={preset.days}
            onClick={() =>
              setValue(formatDate(addDays(new Date(), preset.days)))
            }
            size="xs"
            variant="outline"
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
