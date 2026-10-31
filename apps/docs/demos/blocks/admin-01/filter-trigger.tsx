"use client";

import { Button, type ButtonProps } from "@keystoneui/react/button";
import { cn } from "@keystoneui/react/utils";
import { ChevronDown as ChevronDownIcon } from "lucide-react";

export interface FilterTriggerProps extends ButtonProps {
  /** Emphasises the pill when the filter holds a value. */
  active?: boolean;
  /**
   * The dimension being filtered, shown muted ahead of the value. Omit it when
   * the value names its own dimension — a date range reads as "Last 24h", and
   * "Period: Last 24h" only repeats itself.
   */
  label?: string;
  /**
   * A non-default operator, read as part of the label: "Currency is not:".
   * The default (`is`) goes unsaid, as in Notion.
   */
  operator?: string | null;
  /**
   * The pill offers an X in place of its chevron on hover and keyboard focus.
   * Only the chevron's half of the swap lives here; the X is a sibling, in
   * `PillShell`, because a button inside this button would be invalid.
   */
  removable?: boolean;
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
/**
 * The swap, in both halves. A removable pill shows its X — and hides its
 * chevron — under two conditions: pointer over the pill, or keyboard focus on
 * it. In neither case while its popup is open, where the chevron is still
 * saying what the click did.
 *
 * Each condition is one compound variant rather than a show rule plus a "not
 * while open" override: two variants of equal specificity settle by stylesheet
 * order, and Tailwind does not promise that order. `hover:` is already gated to
 * devices that can hover (`base.css`), which is what keeps the X off touch
 * screens.
 *
 * The X also turns in from -45° as it grows, so it reads as the chevron
 * turning into an X rather than one icon cross-fading over another.
 *
 * Written out literally, every class in full, because Tailwind finds classes
 * by scanning source text — a variant joined onto a utility at runtime would
 * never be generated.
 */
const CHEVRON_SWAP =
  "transition-[opacity,scale] duration-(--duration-fast) ease-(--ease-ks-out) group-hover/pill:group-not-has-[[aria-expanded=true]]/pill:scale-75 group-hover/pill:group-not-has-[[aria-expanded=true]]/pill:opacity-0 group-has-[[data-filter-pill]:focus-visible]/pill:group-not-has-[[aria-expanded=true]]/pill:scale-75 group-has-[[data-filter-pill]:focus-visible]/pill:group-not-has-[[aria-expanded=true]]/pill:opacity-0";

export const X_SWAP =
  "pointer-events-none -rotate-45 scale-75 opacity-0 transition-[opacity,scale,rotate,background-color] duration-(--duration-fast) ease-(--ease-ks-out) group-hover/pill:group-not-has-[[aria-expanded=true]]/pill:pointer-events-auto group-hover/pill:group-not-has-[[aria-expanded=true]]/pill:rotate-0 group-hover/pill:group-not-has-[[aria-expanded=true]]/pill:scale-100 group-hover/pill:group-not-has-[[aria-expanded=true]]/pill:opacity-100 group-has-[[data-filter-pill]:focus-visible]/pill:group-not-has-[[aria-expanded=true]]/pill:pointer-events-auto group-has-[[data-filter-pill]:focus-visible]/pill:group-not-has-[[aria-expanded=true]]/pill:rotate-0 group-has-[[data-filter-pill]:focus-visible]/pill:group-not-has-[[aria-expanded=true]]/pill:scale-100 group-has-[[data-filter-pill]:focus-visible]/pill:group-not-has-[[aria-expanded=true]]/pill:opacity-100";

export function FilterTrigger({
  active = false,
  children,
  className,
  label,
  operator,
  removable = false,
  ...props
}: FilterTriggerProps) {
  return (
    <Button
      className={cn(
        "gap-1.5",
        // No border or ring for the applied state. Anything bright enough to
        // scan a row of pills for reads as focus, which is a control claiming
        // the keyboard is on it. The distinction lives in the value instead:
        // an unset pill renders its "All" muted, a set one renders its value
        // at full strength — the same way a placeholder differs from an entry.
        className
      )}
      data-active={active || undefined}
      // Not `data-slot`: used through `render`, the trigger primitive merges
      // its own props over this element's and stamps its own slot, so a
      // `data-slot` here is silently discarded. This attribute is the one
      // thing that can identify a pill in the DOM.
      data-filter-label={label}
      data-filter-pill=""
      size="sm"
      variant="outline"
      {...props}
    >
      {label ? (
        <span className="font-normal text-muted-foreground" data-pill-label="">
          {operator ? `${label} ${operator}:` : `${label}:`}
        </span>
      ) : null}
      {children}
      <ChevronDownIcon
        className={cn("text-muted-foreground", removable && CHEVRON_SWAP)}
      />
    </Button>
  );
}
