"use client";

import { Button } from "@keystoneui/react/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
} from "@keystoneui/react/combobox";

interface Country {
  code: string;
  value: string;
  label: string;
}

const countries: Country[] = [
  { code: "us", value: "united-states", label: "United States" },
  { code: "gb", value: "united-kingdom", label: "United Kingdom" },
  { code: "ca", value: "canada", label: "Canada" },
  { code: "de", value: "germany", label: "Germany" },
  { code: "fr", value: "france", label: "France" },
  { code: "jp", value: "japan", label: "Japan" },
  { code: "au", value: "australia", label: "Australia" },
  { code: "br", value: "brazil", label: "Brazil" },
];

export default function ComboboxPopup() {
  return (
    <Combobox
      items={countries}
      itemToStringValue={(country: Country) => country.label}
    >
      <ComboboxTrigger
        render={
          <Button
            className="w-64 justify-between font-normal focus-visible:border-ring focus-visible:outline-0 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset"
            variant="outline"
          >
            <ComboboxValue placeholder="Select a country" />
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxInput placeholder="Search" showTrigger={false} />
        <ComboboxSeparator className="my-0" />
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.code} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
