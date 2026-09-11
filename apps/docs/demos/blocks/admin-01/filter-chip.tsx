"use client";

import { Badge } from "@keystoneui/react/badge";
import { X as XIcon } from "lucide-react";

export interface FilterChipProps {
  label: string;
  onRemove: () => void;
  value: string;
}

/**
 * An applied filter: `Role: Admin ✕`.
 *
 * Built on `Badge`, not `Tag`, and the reason is semantic before it is
 * practical. `Tag` extends Base UI's Toggle — it is a *selectable token*, with
 * `aria-pressed`, a pointer cursor and a hover fill. An applied filter is not
 * selectable: it is a label with one action attached. Rendering it as a toggle
 * would announce a pressed state that means nothing and offer an affordance
 * that does nothing.
 *
 * The practical half follows from the same fact. Because `Tag` and
 * `TagGroupItem` are buttons, putting `TagRemove` inside one emits
 * `<button>…<button/></button>` — invalid, and the label stays focusable.
 * `Badge` is a polymorphic `<span>`, so the remove button nests validly.
 *
 * It does borrow `Tag`'s height. `Badge` defaults to 20px, which is right for
 * a status badge with nothing to hit and cramped for one carrying a target.
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
    <Badge
      className="h-6 gap-1 pr-1 pl-2.5"
      data-filter-chip=""
      variant="secondary"
    >
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
