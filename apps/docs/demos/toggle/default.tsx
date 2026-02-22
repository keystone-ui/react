"use client";

import { Toggle } from "@keystoneui/react/toggle";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";

export default function ToggleDefault() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle bold">
        <BoldIcon />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <ItalicIcon />
      </Toggle>
      <Toggle aria-label="Toggle underline" defaultPressed>
        <UnderlineIcon />
      </Toggle>
    </div>
  );
}
