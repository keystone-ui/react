"use client";

import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";

export default function ToggleGroupSecondary() {
  return (
    <ToggleGroup defaultValue={["medium"]} spacing={2} variant="secondary">
      <ToggleGroupItem className="px-6" value="low">
        Low
      </ToggleGroupItem>
      <ToggleGroupItem className="px-6" value="medium">
        Medium
      </ToggleGroupItem>
      <ToggleGroupItem className="px-6" value="high">
        High
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
