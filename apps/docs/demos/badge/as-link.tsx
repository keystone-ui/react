"use client";

import { Badge } from "@keystoneui/react/badge";
import { ArrowUpRightIcon } from "lucide-react";

export default function BadgeAsLink() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        render={
          // biome-ignore lint/a11y/useAnchorContent: children injected via Base UI render prop
          <a aria-label="Open link" href="#link" />
        }
      >
        Open Link
        <ArrowUpRightIcon data-icon="inline-end" />
      </Badge>
      <Badge
        render={
          // biome-ignore lint/a11y/useAnchorContent: children injected via Base UI render prop
          <a aria-label="Secondary link" href="#link" />
        }
        variant="secondary"
      >
        Secondary Link
        <ArrowUpRightIcon data-icon="inline-end" />
      </Badge>
      <Badge
        render={
          // biome-ignore lint/a11y/useAnchorContent: children injected via Base UI render prop
          <a aria-label="Outline link" href="#link" />
        }
        variant="outline"
      >
        Outline Link
        <ArrowUpRightIcon data-icon="inline-end" />
      </Badge>
    </div>
  );
}
