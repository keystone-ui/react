"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Status tones
// ---------------------------------------------------------------------------

/** The two appearances of a status tone. */
const SOLID = "solid";
const SOFT = "soft";

/**
 * The red status tone is `error`. `destructive` is its deprecated alias: it
 * draws exactly what `error` draws, in either appearance, and keeps
 * `data-variant="destructive"` so existing selectors still match.
 */
const RED_TONE_NAMES = ["error", "destructive"] as const;

const STATUS_TONE_NAMES: readonly string[] = [
  "success",
  "warning",
  "info",
  ...RED_TONE_NAMES,
];

/**
 * Status colours are Tailwind palette steps, not theme tokens: Badge is the
 * one component allowed a palette of its own (`status-tokens.test.ts`).
 * Soft takes the solid fill's colour at 15% for the fill and 30% for the
 * border, with a text step that stays legible on that tint.
 */
const STATUS_COLORS = {
  success: {
    [SOLID]: "bg-green-700 text-green-50 dark:bg-green-500 dark:text-green-950",
    [SOFT]:
      "border-green-700/30 bg-green-700/15 text-green-800 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-400",
  },
  warning: {
    [SOLID]: "bg-amber-400 text-amber-950",
    [SOFT]:
      "border-amber-400/30 bg-amber-400/15 text-amber-700 dark:text-amber-400",
  },
  info: {
    [SOLID]: "bg-blue-600 text-blue-50 dark:bg-blue-400 dark:text-blue-950",
    [SOFT]:
      "border-blue-600/30 bg-blue-600/15 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/15 dark:text-blue-400",
  },
  red: {
    [SOLID]: "bg-red-700 text-red-50 dark:bg-red-400 dark:text-red-950",
    [SOFT]:
      "border-red-700/30 bg-red-700/15 text-red-700 dark:border-red-400/30 dark:bg-red-400/15 dark:text-red-400",
  },
} as const;

/**
 * A linked status Badge keeps its fill on hover and underlines instead. The
 * offset is 2px, as for the link variant: Badge clips overflow, and at
 * size="sm" a 4px offset puts the underline outside the 16px box.
 */
const STATUS_LINK = "underline-offset-2 [a]:hover:underline";

/**
 * The red tone keeps the focus-ring colour `destructive` always had, so a
 * consumer who adds a ring width (`focus-visible:ring-2`) keeps its colour.
 */
const RED_RING =
  "focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40";

type StatusVariant =
  | "success"
  | "warning"
  | "info"
  | (typeof RED_TONE_NAMES)[number];

const STATUS_TONES: {
  variants: StatusVariant[];
  colors: (typeof STATUS_COLORS)[keyof typeof STATUS_COLORS];
}[] = [
  { variants: ["success"], colors: STATUS_COLORS.success },
  { variants: ["warning"], colors: STATUS_COLORS.warning },
  { variants: ["info"], colors: STATUS_COLORS.info },
  { variants: [...RED_TONE_NAMES], colors: STATUS_COLORS.red },
];

const statusCompounds = STATUS_TONES.flatMap(({ variants, colors }) =>
  ([SOLID, SOFT] as const).map((appearance) => ({
    variant: variants,
    appearance,
    class: colors[appearance],
  }))
);

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const badgeClasses = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border border-transparent font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [a]:transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary-hover",
        success: STATUS_LINK,
        warning: STATUS_LINK,
        info: STATUS_LINK,
        [RED_TONE_NAMES[0]]: `${STATUS_LINK} ${RED_RING}`,
        [RED_TONE_NAMES[1]]: `${STATUS_LINK} ${RED_RING}`,
        outline: "border-border text-foreground [a]:hover:bg-muted",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-2 hover:underline",
      },
      appearance: {
        [SOLID]: "",
        [SOFT]: "",
      },
      size: {
        default: "h-5 px-2 text-xs",
        sm: "h-4 px-1.5 text-[10px]",
      },
    },
    compoundVariants: statusCompounds,
    defaultVariants: {
      variant: "default",
      appearance: SOLID,
      size: "default",
    },
  }
);

/**
 * Badge's classes, merged: a soft tone's border replaces the base transparent
 * one, so the helper can be applied directly to any element.
 */
const badgeVariants = (props?: Parameters<typeof badgeClasses>[0]) =>
  cn(badgeClasses(props));

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

interface BadgeProps
  extends useRender.ComponentProps<"span">,
    VariantProps<typeof badgeClasses> {
  /**
   * How a status tone is filled: a solid fill, or a soft tint with a border.
   * Other variants ignore it.
   * @default "solid"
   */
  appearance?: typeof SOLID | typeof SOFT;
  /**
   * The size of the badge.
   * @default "default"
   */
  size?: "default" | "sm";
  /**
   * The visual style of the badge. `success`, `warning`, `info` and `error`
   * are status tones and follow `appearance`.
   *
   * `destructive` is deprecated: use `error`. It draws the same Badge
   * (solid by default) and will be removed in a later release.
   * @default "default"
   */
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "info"
    | "error"
    | BadgeDestructiveVariant
    | "outline"
    | "ghost"
    | "link";
}

/**
 * @deprecated Use `variant="error"`, which draws the same Badge. `destructive`
 * will be removed from Badge in a later release.
 */
type BadgeDestructiveVariant = "destructive";

function Badge({
  className,
  variant = "default",
  appearance = SOLID,
  size,
  render,
  ...props
}: BadgeProps) {
  const isStatus = STATUS_TONE_NAMES.includes(variant);
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      {
        className: badgeVariants({ variant, appearance, size, className }),
      },
      props
    ),
    state: {
      slot: "badge",
      variant,
      appearance: isStatus ? appearance : undefined,
    },
  });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export type { BadgeProps };
export { Badge, badgeVariants };
