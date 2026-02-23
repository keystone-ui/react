"use client";

import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";

export default function ToggleGroupSpacing() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Joined (spacing=0)</p>
        <ToggleGroup defaultValue={["all"]} variant="outline">
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="missed">Missed</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Spaced (spacing=2)</p>
        <ToggleGroup defaultValue={["all"]} spacing={2} variant="outline">
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="missed">Missed</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
