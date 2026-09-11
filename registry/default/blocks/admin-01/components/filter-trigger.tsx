"use client";

import { ChevronDownIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterTriggerProps extends ButtonProps {
  /** Emphasises the pill when the filter holds a value. */
  active?: boolean;
  /**
   * The dimension being filtered, shown muted ahead of the value. Omit it when
   * the value names its own dimension — a date range reads as "Last 24h", and
   * "Period: Last 24h" only repeats itself.
   */
  label?: string;
}

/**
 * A filter pill: `Action: Deposit`, with a chevron.
 *
 * Written once rather than inlined at each call site for three reasons, none
 * of them purely cosmetic. The muted label is what separates the dimension
 * from the value at a glance. The `active` treatment is what lets you scan a
 * row of eight pills for the two that are doing something. And the chevron is
 * the one the trigger primitives disagree about — `DropdownMenuTrigger` draws
 * none, `SelectTrigger` and `ComboboxTrigger` each draw their own — so putting
 * it here is what stops a row of pills from disagreeing about its own
 * affordance depending on which primitive each one happens to use.
 *
 * Used through `render`, which is how the rest of the block composes triggers:
 *
 * ```tsx
 * <DropdownMenuTrigger render={<FilterTrigger label="Action" />}>
 *   Deposit
 * </DropdownMenuTrigger>
 * ```
 */
export function FilterTrigger({
  active = false,
  children,
  className,
  label,
  ...props
}: FilterTriggerProps) {
  return (
    <Button
      className={cn(
        "gap-1.5",
        // The ring, not a fill: an active pill still has to read as the same
        // control it was, and a filled one reads as pressed.
        active && "border-ring ring-1 ring-ring ring-inset",
        className
      )}
      data-active={active || undefined}
      // Not `data-slot`: used through `render`, the trigger primitive merges
      // its own props over this element's and stamps its own slot, so a
      // `data-slot` here is silently discarded. This attribute is the one
      // thing that can identify a pill in the DOM.
      data-filter-pill=""
      variant="outline"
      {...props}
    >
      {label ? (
        <span className="font-normal text-muted-foreground" data-pill-label="">
          {label}:
        </span>
      ) : null}
      {children}
      <ChevronDownIcon className="text-muted-foreground" />
    </Button>
  );
}
