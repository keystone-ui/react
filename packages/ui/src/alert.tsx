import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const alertVariants = cva(
  [
    "group/alert relative grid w-full gap-0.5 rounded-lg border px-4 py-3 text-left text-sm",
    // SVG boilerplate
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
          "border-border-muted bg-card text-card-foreground *:data-[slot=alert-description]:text-muted-foreground",
        // Status variants tint the surface and the icon from the status
        // token; the text stays neutral. The tokens are tuned as fills, so
        // `text-warning` on a tint would fall under 2:1 — the icon and border
        // carry the signal, as Toast's do.
        success:
          "border-success/30 bg-success/10 text-card-foreground *:data-[slot=alert-description]:text-muted-foreground *:[svg]:text-success",
        warning:
          "border-warning/40 bg-warning/10 text-card-foreground *:data-[slot=alert-description]:text-muted-foreground *:[svg]:text-warning",
        error:
          "border-destructive/30 bg-destructive/10 text-card-foreground *:data-[slot=alert-description]:text-muted-foreground *:[svg]:text-destructive",
        info: "border-info/30 bg-info/10 text-card-foreground *:data-[slot=alert-description]:text-muted-foreground *:[svg]:text-info",
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
    AlertVariantsProps {
  /**
   * The visual style of the alert.
   * @default "default"
   */
  variant?: "default" | "success" | "warning" | "error" | "info";
}

const Alert = ({
  className,
  variant,
  ref,
  ...props
}: AlertProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(alertVariants({ variant }), className)}
    data-slot="alert"
    ref={ref}
    role="alert"
    {...props}
  />
);

Alert.displayName = "Alert";

// ---------------------------------------------------------------------------
// AlertTitle
// ---------------------------------------------------------------------------

export interface AlertTitleProps extends React.ComponentProps<"div"> {}

const AlertTitle = ({
  className,
  ref,
  ...props
}: AlertTitleProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
      className
    )}
    data-slot="alert-title"
    ref={ref}
    {...props}
  />
);

AlertTitle.displayName = "AlertTitle";

// ---------------------------------------------------------------------------
// AlertDescription
// ---------------------------------------------------------------------------

export interface AlertDescriptionProps extends React.ComponentProps<"div"> {}

const AlertDescription = ({
  className,
  ref,
  ...props
}: AlertDescriptionProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "text-balance text-sm group-has-[>svg]/alert:col-start-2 md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
      className
    )}
    data-slot="alert-description"
    ref={ref}
    {...props}
  />
);

AlertDescription.displayName = "AlertDescription";

// ---------------------------------------------------------------------------
// AlertAction
// ---------------------------------------------------------------------------

export interface AlertActionProps extends React.ComponentProps<"div"> {}

const AlertAction = ({
  className,
  ref,
  ...props
}: AlertActionProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn("absolute top-3 right-3", className)}
    data-slot="alert-action"
    ref={ref}
    {...props}
  />
);

AlertAction.displayName = "AlertAction";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants };
