"use client";

import { Button } from "@keystoneui/react/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@keystoneui/react/combobox";
import { Field, FieldLabel } from "@keystoneui/react/field";

const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
] as const;

export default function ComboboxFormExample() {
  return (
    <form
      className="w-full max-w-sm space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Field>
        <FieldLabel>Framework</FieldLabel>
        <Combobox defaultValue="Next.js" items={frameworks} name="framework">
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
      <div className="flex gap-2">
        <Button type="reset" variant="outline">
          Reset
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
