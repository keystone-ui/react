import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const calloutVariants = cva(
  [
    "grid gap-0.5 rounded-lg border px-4 py-3 text-left text-sm w-full relative group/callout",
    // SVG boilerplate
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    // Grid layout when an icon SVG is a direct child
    "has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2",
    // Icon spans both title + description rows
    "*:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current",
    // Reserve right padding when an action slot is present
    "has-data-[slot=callout-action]:pr-18",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-card text-card-foreground border-border-muted *:data-[slot=callout-description]:text-muted-foreground",
        success: [
          "bg-green-500/15 dark:bg-green-500/10",
          "border-green-500/20 dark:border-green-500/15",
          "text-green-700 dark:text-green-400",
          "*:data-[slot=callout-description]:text-green-700/80 dark:*:data-[slot=callout-description]:text-green-400/80",
        ].join(" "),
        warning: [
          "bg-yellow-500/15 dark:bg-yellow-500/10",
          "border-yellow-500/20 dark:border-yellow-500/15",
          "text-yellow-700 dark:text-yellow-300",
          "*:data-[slot=callout-description]:text-yellow-700/80 dark:*:data-[slot=callout-description]:text-yellow-300/80",
        ].join(" "),
        error: [
          "bg-red-500/15 dark:bg-red-500/10",
          "border-red-500/20 dark:border-red-500/15",
          "text-red-700 dark:text-red-400",
          "*:data-[slot=callout-description]:text-red-700/80 dark:*:data-[slot=callout-description]:text-red-400/80",
        ].join(" "),
        info: [
          "bg-blue-500/15 dark:bg-blue-500/10",
          "border-blue-500/20 dark:border-blue-500/15",
          "text-blue-700 dark:text-blue-400",
          "*:data-[slot=callout-description]:text-blue-700/80 dark:*:data-[slot=callout-description]:text-blue-400/80",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type CalloutVariantsProps = VariantProps<typeof calloutVariants>;

// ---------------------------------------------------------------------------
// Callout
// ---------------------------------------------------------------------------

export interface CalloutProps
  extends React.ComponentProps<"div">,
    CalloutVariantsProps {}

const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="callout"
        role="alert"
        className={cn(calloutVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Callout.displayName = "Callout";

// ---------------------------------------------------------------------------
// CalloutTitle
// ---------------------------------------------------------------------------

export interface CalloutTitleProps extends React.ComponentProps<"div"> {}

const CalloutTitle = React.forwardRef<HTMLDivElement, CalloutTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="callout-title"
        className={cn(
          "font-medium group-has-[>svg]/callout:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
          className
        )}
        {...props}
      />
    );
  }
);

CalloutTitle.displayName = "CalloutTitle";

// ---------------------------------------------------------------------------
// CalloutDescription
// ---------------------------------------------------------------------------

export interface CalloutDescriptionProps extends React.ComponentProps<"div"> {}

const CalloutDescription = React.forwardRef<
  HTMLDivElement,
  CalloutDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="callout-description"
      className={cn(
        "text-sm text-balance md:text-pretty group-has-[>svg]/callout:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  );
});

CalloutDescription.displayName = "CalloutDescription";

// ---------------------------------------------------------------------------
// CalloutAction
// ---------------------------------------------------------------------------

export interface CalloutActionProps extends React.ComponentProps<"div"> {}

const CalloutAction = React.forwardRef<HTMLDivElement, CalloutActionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="callout-action"
        className={cn("absolute top-3 right-3", className)}
        {...props}
      />
    );
  }
);

CalloutAction.displayName = "CalloutAction";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Callout, CalloutTitle, CalloutDescription, CalloutAction, calloutVariants };
