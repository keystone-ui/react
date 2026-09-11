"use client";

import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FilterChipProps {
  label: string;
  onRemove: () => void;
  value: string;
}

/**
 * An applied filter: `Role: Admin ✕`.
 *
 * Built on `Badge` rather than `TagGroup`. `TagGroupItem` renders its body as a
 * toggle button and appends the remove control *inside* it, so a removable tag
 * emits `<button>…<button/></button>` — invalid, and the body stays focusable
 * when it should be a label. `Badge` is a polymorphic `<span>`, so the remove
 * button nests validly.
 *
 * The chip is the only representation of this filter's state: the control that
 * sets it lives in the drawer. That is the condition under which a chip is
 * right — where the control is visible, as on the payments table, a chip
 * repeating it is a second copy of one fact and the two can drift.
 *
 * `Remove ${label} filter`, not a bare "Remove": four chips announcing
 * "Remove" leave a screen reader to work out which from context it does not
 * have, the same rule the row-action triggers follow.
 */
export function FilterChip({ label, onRemove, value }: FilterChipProps) {
  return (
    <Badge className="gap-1 pr-1" data-filter-chip="" variant="secondary">
      <span className="font-normal text-muted-foreground">{label}:</span>
      {value}
      <button
        aria-label={`Remove ${label} filter`}
        className="relative -my-px -me-0.5 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors before:absolute before:-inset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2"
        onClick={onRemove}
        type="button"
      >
        <XIcon className="size-3" />
      </button>
    </Badge>
  );
}
