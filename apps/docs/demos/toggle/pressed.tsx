"use client";

import { Toggle } from "@keystoneui/react/toggle";
import { BookmarkIcon, StarIcon } from "lucide-react";

export default function TogglePressed() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle bookmark" defaultPressed>
        <BookmarkIcon className="group-data-pressed/toggle:fill-current" />
        Bookmark
      </Toggle>
      <Toggle aria-label="Toggle star" defaultPressed variant="outline">
        <StarIcon className="group-data-pressed/toggle:fill-current" />
        Starred
      </Toggle>
    </div>
  );
}
