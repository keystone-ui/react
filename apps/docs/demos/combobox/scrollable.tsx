"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@keystoneui/react/combobox";

const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
  "Gatsby",
  "Vite",
  "Create React App",
  "Angular",
  "Vue CLI",
  "Ember.js",
  "Meteor",
  "Blitz.js",
  "RedwoodJS",
  "Fresh",
  "Qwik",
  "SolidStart",
  "Analog",
  "Elder.js",
  "Sapper",
] as const;

export default function ComboboxScrollable() {
  return (
    <Combobox items={frameworks}>
      <ComboboxInput className="w-56" placeholder="Select a framework" />
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
  );
}
