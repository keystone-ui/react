"use client";

import { Toggle } from "@keystoneui/react/toggle";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
} from "lucide-react";

export default function ToggleSecondary() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle bold" variant="secondary">
        <BoldIcon />
        Bold
      </Toggle>
      <Toggle aria-label="Toggle italic" defaultPressed variant="secondary">
        <ItalicIcon />
        Italic
      </Toggle>
      <Toggle aria-label="Toggle underline" variant="secondary">
        <UnderlineIcon />
        Underline
      </Toggle>
    </div>
  );
}
