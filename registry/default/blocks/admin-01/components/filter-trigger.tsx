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
        // A brighter border, not a ring: `ring-ring` is the focus colour, so a
        // pill holding a value looked exactly like a focused one.
        //
        // Written as `data-[active]:` variants rather than a plain conditional
        // string because `Button`'s outline variant carries `dark:border-input`
        // — (0,2,0), which out-specifies a plain `border-ring` at (0,1,0), so
        // the conditional version was silently dead in dark mode and only the
        // ring ever showed. Stacking `dark:` onto the data variant takes it to
        // (0,3,0), which wins in both themes.
        "data-[active]:border-ring data-[active]:dark:border-ring",
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
