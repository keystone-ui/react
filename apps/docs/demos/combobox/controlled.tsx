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
import { useState } from "react";

const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
] as const;

export default function ComboboxControlled() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <div className="w-full max-w-xs space-y-3">
      <Combobox items={frameworks} onValueChange={setValue} value={value}>
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
      <p className="text-muted-foreground text-sm">
        Selected: {value ?? "none"}
      </p>
      <div className="flex gap-2">
        <Button onClick={() => setValue(null)} size="sm" variant="outline">
          Clear
        </Button>
        <Button
          onClick={() => setValue("SvelteKit")}
          size="sm"
          variant="outline"
        >
          Set SvelteKit
        </Button>
      </div>
    </div>
  );
}
