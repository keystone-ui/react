"use client";

import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";

export default function ToggleGroupDisabled() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Disabled Group</p>
        <ToggleGroup defaultValue={["bold"]} disabled variant="outline">
          <ToggleGroupItem aria-label="Toggle bold" value="bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle italic" value="italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle underline" value="underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Individual Disabled Items</p>
        <ToggleGroup defaultValue={["bold"]} multiple variant="outline">
          <ToggleGroupItem aria-label="Toggle bold" value="bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle italic" disabled value="italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle underline" value="underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
