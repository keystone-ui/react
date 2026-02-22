"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@keystoneui/react/combobox";

interface Framework {
  label: string;
  value: string;
  description: string;
}

const frameworks: Framework[] = [
  { label: "Next.js", value: "next", description: "React framework by Vercel" },
  {
    label: "SvelteKit",
    value: "sveltekit",
    description: "Svelte meta-framework",
  },
  { label: "Nuxt", value: "nuxt", description: "Vue.js framework" },
  { label: "Remix", value: "remix", description: "Full stack React framework" },
  { label: "Astro", value: "astro", description: "Content-focused framework" },
];

export default function ComboboxCustomItems() {
  return (
    <Combobox
      items={frameworks}
      itemToStringValue={(framework: Framework) => framework.label}
    >
      <ComboboxInput placeholder="Select a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(framework) => (
            <ComboboxItem
              className="py-2"
              key={framework.value}
              value={framework}
            >
              <div className="flex flex-col">
                <span className="font-medium">{framework.label}</span>
                <span className="text-muted-foreground text-xs">
                  {framework.description}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
