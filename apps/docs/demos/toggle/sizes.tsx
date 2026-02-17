"use client";

import { Toggle } from "keystoneui/toggle";
import { StarIcon } from "lucide-react";

export default function ToggleSizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle small" size="sm" variant="outline">
        <StarIcon />
        Small
      </Toggle>
      <Toggle aria-label="Toggle default" size="default" variant="outline">
        <StarIcon />
        Default
      </Toggle>
      <Toggle aria-label="Toggle large" size="lg" variant="outline">
        <StarIcon />
        Large
      </Toggle>
    </div>
  );
}
