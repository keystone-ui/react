"use client";

import { ToggleGroup, ToggleGroupItem } from "keystoneui/toggle-group";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from "lucide-react";
import { useState } from "react";

export default function ToggleGroupSingle() {
  const [value, setValue] = useState<string[]>(["center"]);

  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup onValueChange={setValue} value={value} variant="outline">
        <ToggleGroupItem aria-label="Align left" value="left">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align center" value="center">
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align right" value="right">
          <AlignRightIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align justify" value="justify">
          <AlignJustifyIcon />
        </ToggleGroupItem>
      </ToggleGroup>
      <p className="text-muted-foreground text-sm">
        Alignment: {value.length > 0 ? value[0] : "none"}
      </p>
    </div>
  );
}
