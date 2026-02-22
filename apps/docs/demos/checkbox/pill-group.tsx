"use client";

import { Card, CardContent } from "@keystoneui/react/card";
import { Checkbox } from "@keystoneui/react/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@keystoneui/react/field";

const options = [
  { label: "Social Media", value: "social-media" },
  { label: "Search Engine", value: "search-engine" },
  { label: "Referral", value: "referral" },
  { label: "Other", value: "other" },
];

export default function CheckboxPillGroup() {
  return (
    <Card className="py-4 shadow-none">
      <CardContent className="px-4">
        <form>
          <FieldGroup>
            <FieldSet className="gap-4">
              <FieldLegend>How did you hear about us?</FieldLegend>
              <FieldDescription className="line-clamp-1">
                Select the option that best describes how you heard about us.
              </FieldDescription>
              <FieldGroup className="flex flex-row flex-wrap gap-2 rounded-full">
                {options.map((option) => (
                  <FieldLabel
                    className="w-fit!"
                    htmlFor={option.value}
                    key={option.value}
                  >
                    <Field
                      className="gap-1.5 overflow-hidden px-3! py-1.5! transition-all duration-100 ease-linear group-has-data-checked/field-label:px-2!"
                      orientation="horizontal"
                    >
                      <Checkbox
                        className="-ml-6 -translate-x-1 rounded-full transition-all duration-100 ease-linear data-checked:ml-0 data-checked:translate-x-0"
                        defaultChecked={option.value === "social-media"}
                        id={option.value}
                        value={option.value}
                      />
                      <FieldTitle>{option.label}</FieldTitle>
                    </Field>
                  </FieldLabel>
                ))}
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
