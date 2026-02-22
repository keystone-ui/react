"use client";

import { Toggle } from "@keystoneui/react/toggle";
import { BoldIcon, BookmarkIcon, ItalicIcon } from "lucide-react";

export default function ToggleWithText() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle italic">
        <ItalicIcon />
        Italic
      </Toggle>
      <Toggle aria-label="Toggle bold">
        <BoldIcon />
        Bold
      </Toggle>
      <Toggle aria-label="Toggle bookmark">
        <BookmarkIcon />
        Bookmark
      </Toggle>
    </div>
  );
}
