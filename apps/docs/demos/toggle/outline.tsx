"use client";

import { Toggle } from "@keystoneui/react/toggle";
import { BoldIcon, ItalicIcon } from "lucide-react";

export default function ToggleOutline() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle italic" variant="outline">
        <ItalicIcon />
        Italic
      </Toggle>
      <Toggle aria-label="Toggle bold" variant="outline">
        <BoldIcon />
        Bold
      </Toggle>
    </div>
  );
}
