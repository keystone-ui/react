"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// =============================================================================
// ButtonGroup
// =============================================================================
const buttonGroupVariants = cva(
  "flex w-fit items-stretch [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal: [
          "[&>*:not(:first-child):not([data-slot=button-group-separator])]:rounded-l-none",
          "[&>*:not(:first-child):not([data-slot=button-group-separator])]:border-l-0",
          "[&>*:not(:last-child):not([data-slot=button-group-separator])]:rounded-r-none",
          "[&>[data-slot=button-group-separator]+*]:rounded-l-md [&>[data-slot=button-group-separator]+*]:border-l",
        ].join(" "),
        vertical: [
          "[&>*:not(:first-child):not([data-slot=button-group-separator])]:rounded-t-none",
          "[&>*:not(:first-child):not([data-slot=button-group-separator])]:border-t-0",
          "[&>*:not(:last-child):not([data-slot=button-group-separator])]:rounded-b-none",
          "[&>[data-slot=button-group-separator]+*]:rounded-t-md [&>[data-slot=button-group-separator]+*]:border-t",
        ].join(" "),
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
);

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        data-slot="button-group"
        data-orientation={orientation}
        className={cn(buttonGroupVariants({ orientation }), className)}
        {...props}
      />
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";

// =============================================================================
// ButtonGroupText
// =============================================================================
export interface ButtonGroupTextProps extends React.HTMLAttributes<HTMLDivElement> {}

const ButtonGroupText = React.forwardRef<HTMLDivElement, ButtonGroupTextProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-muted flex items-center gap-2 rounded-md border border-border px-4 text-sm font-medium shadow-xs",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      />
    );
  }
);
ButtonGroupText.displayName = "ButtonGroupText";

// =============================================================================
// ButtonGroupSeparator
// =============================================================================
export interface ButtonGroupSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The orientation of the separator @default "vertical" */
  orientation?: "horizontal" | "vertical";
}

const ButtonGroupSeparator = React.forwardRef<HTMLDivElement, ButtonGroupSeparatorProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        data-slot="button-group-separator"
        data-orientation={orientation}
        className={cn(
          "bg-border relative self-stretch shrink-0",
          orientation === "vertical" ? "w-px h-auto" : "h-px w-auto",
          className
        )}
        {...props}
      />
    );
  }
);
ButtonGroupSeparator.displayName = "ButtonGroupSeparator";

export { ButtonGroup, ButtonGroupText, ButtonGroupSeparator, buttonGroupVariants };
