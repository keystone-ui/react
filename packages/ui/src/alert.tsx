import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const alertVariants = cva(
  [
    "grid gap-0.5 rounded-lg border px-4 py-3 text-left text-sm w-full relative group/alert",
    // SVG boilerplate
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    // Grid layout when an icon SVG is a direct child
    "has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2",
    // Icon spans both title + description rows
    "*:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current",
    // Reserve right padding when an action slot is present
    "has-data-[slot=alert-action]:pr-18",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-card text-card-foreground border-border-muted *:data-[slot=alert-description]:text-muted-foreground",
        success: [
          "bg-green-500/15 dark:bg-green-500/10",
          "border-green-500/20 dark:border-green-500/15",
          "text-green-700 dark:text-green-400",
          "*:data-[slot=alert-description]:text-green-700/80 dark:*:data-[slot=alert-description]:text-green-400/80",
        ].join(" "),
        warning: [
          "bg-yellow-500/15 dark:bg-yellow-500/10",
          "border-yellow-500/20 dark:border-yellow-500/15",
          "text-yellow-700 dark:text-yellow-300",
          "*:data-[slot=alert-description]:text-yellow-700/80 dark:*:data-[slot=alert-description]:text-yellow-300/80",
        ].join(" "),
        error: [
          "bg-red-500/15 dark:bg-red-500/10",
          "border-red-500/20 dark:border-red-500/15",
          "text-red-700 dark:text-red-400",
          "*:data-[slot=alert-description]:text-red-700/80 dark:*:data-[slot=alert-description]:text-red-400/80",
        ].join(" "),
        info: [
          "bg-blue-500/15 dark:bg-blue-500/10",
          "border-blue-500/20 dark:border-blue-500/15",
          "text-blue-700 dark:text-blue-400",
          "*:data-[slot=alert-description]:text-blue-700/80 dark:*:data-[slot=alert-description]:text-blue-400/80",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type AlertVariantsProps = VariantProps<typeof alertVariants>;

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------

export interface AlertProps
  extends React.ComponentProps<"div">,
    AlertVariantsProps {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="alert"
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Alert.displayName = "Alert";

// ---------------------------------------------------------------------------
// AlertTitle
// ---------------------------------------------------------------------------

export interface AlertTitleProps extends React.ComponentProps<"div"> {}

const AlertTitle = React.forwardRef<HTMLDivElement, AlertTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="alert-title"
        className={cn(
          "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
          className
        )}
        {...props}
      />
    );
  }
);

AlertTitle.displayName = "AlertTitle";

// ---------------------------------------------------------------------------
// AlertDescription
// ---------------------------------------------------------------------------

export interface AlertDescriptionProps extends React.ComponentProps<"div"> {}

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  AlertDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance md:text-pretty group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  );
});

AlertDescription.displayName = "AlertDescription";

// ---------------------------------------------------------------------------
// AlertAction
// ---------------------------------------------------------------------------

export interface AlertActionProps extends React.ComponentProps<"div"> {}

const AlertAction = React.forwardRef<HTMLDivElement, AlertActionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="alert-action"
        className={cn("absolute top-3 right-3", className)}
        {...props}
      />
    );
  }
);

AlertAction.displayName = "AlertAction";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants };
