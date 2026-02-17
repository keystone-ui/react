"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "keystoneui/select";
import { AppleIcon, BananaIcon, CherryIcon, GrapeIcon } from "lucide-react";

export default function SelectWithIcons() {
  return (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">
            <AppleIcon className="size-4" />
            Apple
          </SelectItem>
          <SelectItem value="banana">
            <BananaIcon className="size-4" />
            Banana
          </SelectItem>
          <SelectItem value="cherry">
            <CherryIcon className="size-4" />
            Cherry
          </SelectItem>
          <SelectItem value="grapes">
            <GrapeIcon className="size-4" />
            Grapes
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
