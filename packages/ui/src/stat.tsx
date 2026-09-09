"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  ArrowDown as ArrowDownIcon,
  ArrowUp as ArrowUpIcon,
} from "lucide-react";
import type * as React from "react";
import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Which direction of movement counts as an improvement for this metric.
 *
 * This is the whole point of the component. Revenue going up is good; p95
 * latency going up is not; a headcount going up is neither. Colour has to come
 * from what the metric *means*, not from the sign of the delta.
 */
export type StatDirection = "up-is-good" | "down-is-good" | "neutral";

export type StatTone = "positive" | "negative" | "neutral";

// ---------------------------------------------------------------------------
// Tone
// ---------------------------------------------------------------------------

/**
 * Resolve a delta and a metric direction to a tone.
 *
 * Exported because the same decision has to be made outside a `StatDelta` —
 * a table cell showing a change, a sparkline caption — and it is the piece
 * that is easy to get subtly wrong.
 *
 * `0` is neutral rather than positive: "unchanged" is not an improvement.
 * `null` and `undefined` are neutral too, so a metric with no comparison
 * period renders without claiming a direction.
 */
export function deltaTone(
  value: number | null | undefined,
  direction: StatDirection = "up-is-good"
): StatTone {
  if (value == null || value === 0 || direction === "neutral") {
    return "neutral";
  }
  const improving = direction === "up-is-good" ? value > 0 : value < 0;
  return improving ? "positive" : "negative";
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

/**
 * `negative` is `text-destructive`, not `text-warning`. A metric that got
 * worse is bad news and there is already a token for that; `--warning` means
 * caution or an approaching threshold. One channel, one meaning — a page where
 * amber means both "worse" and "stale" teaches readers to ignore it.
 *
 * Reach `--warning` deliberately via the `tone` prop when the number really is
 * a caution state.
 */
const statDeltaVariants = cva(
  "inline-flex items-center gap-0.5 font-medium text-xs tabular-nums [&_svg:not([class*='size-'])]:size-3 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        positive: "text-success",
        negative: "text-destructive",
        neutral: "text-muted-foreground",
        warning: "text-warning",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
);

// ---------------------------------------------------------------------------
// StatValue
// ---------------------------------------------------------------------------

export interface StatValueProps extends React.ComponentProps<"div"> {}

/**
 * The headline number. `tabular-nums` is not cosmetic here: with proportional
 * digits a live-updating figure changes width on every tick and the row jitters.
 */
export const StatValue = ({
  className,
  ref,
  ...props
}: StatValueProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-baseline gap-2 font-semibold text-2xl tabular-nums",
      className
    )}
    data-slot="stat-value"
    ref={ref}
    {...props}
  />
);

StatValue.displayName = "StatValue";

// ---------------------------------------------------------------------------
// StatDelta
// ---------------------------------------------------------------------------

export interface StatDeltaProps
  extends Omit<React.ComponentProps<"span">, "children">,
    VariantProps<typeof statDeltaVariants> {
  /** The rendered text, e.g. `"+12%"` or `"−3.2 days"`. */
  children?: React.ReactNode;
  /**
   * Which direction is an improvement for this metric.
   * @default "up-is-good"
   */
  direction?: StatDirection;
  /**
   * Show the arrow. The arrow follows the **sign**; the colour follows the
   * tone — so a green down-arrow is correct for a `down-is-good` metric that
   * improved.
   * @default true
   */
  showIcon?: boolean;
  /**
   * Override the derived tone. Use it for a caution state (`"warning"`), or
   * where the direction cannot be expressed as up/down.
   */
  tone?: StatTone | "warning";
  /**
   * The signed change. Drives the arrow and, with `direction`, the tone.
   *
   * Formatting is deliberately not handled here: pass the display text as
   * `children`. Formatting a delta means choosing a locale, a digit count and
   * a unit, none of which a component should decide for every consumer.
   */
  value?: number | null;
}

export const StatDelta = ({
  children,
  className,
  direction = "up-is-good",
  ref,
  showIcon = true,
  tone,
  value,
  ...props
}: StatDeltaProps & React.RefAttributes<HTMLSpanElement>) => {
  const resolved = tone ?? deltaTone(value, direction);
  const showArrow = showIcon && value != null && value !== 0;
  // Tone is conveyed by colour, which alone fails WCAG 1.4.1. The qualifier is
  // suppressed when the caller supplies their own accessible name.
  const qualifier =
    props["aria-label"] === undefined && resolved !== "neutral"
      ? {
          negative: "declining",
          positive: "improving",
          warning: "needs attention",
        }[resolved]
      : null;

  return (
    <span
      className={cn(statDeltaVariants({ tone: resolved }), className)}
      data-slot="stat-delta"
      data-tone={resolved}
      ref={ref}
      {...props}
    >
      {showArrow &&
        (value > 0 ? (
          <ArrowUpIcon aria-hidden="true" />
        ) : (
          <ArrowDownIcon aria-hidden="true" />
        ))}
      {children}
      {qualifier ? <span className="sr-only"> {qualifier}</span> : null}
    </span>
  );
};

StatDelta.displayName = "StatDelta";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { statDeltaVariants };
