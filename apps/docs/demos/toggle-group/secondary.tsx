"use client";

import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";

export default function ToggleGroupSecondary() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Joined (spacing=0)</p>
        <ToggleGroup defaultValue={["medium"]} variant="secondary">
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
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Spaced (spacing=2)</p>
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
      </div>
    </div>
  );
}
