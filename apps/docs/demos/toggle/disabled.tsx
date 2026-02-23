"use client";

import { Toggle } from "@keystoneui/react/toggle";
import { BoldIcon, ItalicIcon } from "lucide-react";

export default function ToggleDisabled() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle disabled" disabled>
        <BoldIcon />
        Disabled
      </Toggle>
      <Toggle aria-label="Toggle disabled outline" disabled variant="outline">
        <ItalicIcon />
        Disabled
      </Toggle>
    </div>
  );
}
