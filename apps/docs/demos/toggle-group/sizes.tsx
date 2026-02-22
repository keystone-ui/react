"use client";

import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";
import { ListChecksIcon, ListIcon, ListOrderedIcon } from "lucide-react";

export default function ToggleGroupSizes() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Small</p>
        <ToggleGroup multiple size="sm" variant="outline">
          <ToggleGroupItem aria-label="Toggle list" value="list">
            <ListIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle ordered list" value="ordered">
            <ListOrderedIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle checklist" value="checks">
            <ListChecksIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Default</p>
        <ToggleGroup multiple size="default" variant="outline">
          <ToggleGroupItem aria-label="Toggle list" value="list">
            <ListIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle ordered list" value="ordered">
            <ListOrderedIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle checklist" value="checks">
            <ListChecksIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Large</p>
        <ToggleGroup multiple size="lg" variant="outline">
          <ToggleGroupItem aria-label="Toggle list" value="list">
            <ListIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle ordered list" value="ordered">
            <ListOrderedIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle checklist" value="checks">
            <ListChecksIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
