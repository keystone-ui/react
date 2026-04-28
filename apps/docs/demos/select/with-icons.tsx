"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";
import {
  Apple as AppleIcon,
  Banana as BananaIcon,
  Cherry as CherryIcon,
  Grape as GrapeIcon,
} from "lucide-react";
import type { ReactNode } from "react";

const fruits: Record<string, ReactNode> = {
  apple: (
    <>
      <AppleIcon className="size-4" />
      Apple
    </>
  ),
  banana: (
    <>
      <BananaIcon className="size-4" />
      Banana
    </>
  ),
  cherry: (
    <>
      <CherryIcon className="size-4" />
      Cherry
    </>
  ),
  grapes: (
    <>
      <GrapeIcon className="size-4" />
      Grapes
    </>
  ),
};

export default function SelectWithIcons() {
  return (
    <Select items={fruits}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          {Object.entries(fruits).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
