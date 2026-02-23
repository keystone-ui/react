"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@keystoneui/react/combobox";
import { useState } from "react";

const countries = [
  { code: "us", label: "United States", flag: "🇺🇸" },
  { code: "gb", label: "United Kingdom", flag: "🇬🇧" },
  { code: "de", label: "Germany", flag: "🇩🇪" },
  { code: "fr", label: "France", flag: "🇫🇷" },
  { code: "jp", label: "Japan", flag: "🇯🇵" },
  { code: "ca", label: "Canada", flag: "🇨🇦" },
  { code: "au", label: "Australia", flag: "🇦🇺" },
  { code: "br", label: "Brazil", flag: "🇧🇷" },
  { code: "in", label: "India", flag: "🇮🇳" },
  { code: "kr", label: "South Korea", flag: "🇰🇷" },
];

export default function ComboboxCountries() {
  const [selected, setSelected] = useState<(typeof countries)[number] | null>(
    null
  );

  return (
    <Combobox
      items={countries}
      itemToStringValue={(country: (typeof countries)[number]) => country.label}
      onValueChange={setSelected}
      value={selected}
    >
      <ComboboxInput className="w-64" placeholder="Search countries..." />
      <ComboboxContent>
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {(country) => (
            <ComboboxItem key={country.code} value={country}>
              <span className="text-base">{country.flag}</span>
              <span>{country.label}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
