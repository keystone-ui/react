"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// =============================================================================
// ButtonGroup
// =============================================================================
const buttonGroupVariants = cva(
  [
    "flex w-fit items-stretch",
    "*:focus-visible:z-10 *:focus-visible:relative",
    "[&>input]:flex-1",
    // Nesting: add gap between nested ButtonGroups
    "has-[>[data-slot=button-group]]:gap-2",
    // Select: handle hidden select element as last child
    "has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg",
    "[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit",
  ].join(" "),
  {
    variants: {
      orientation: {
        horizontal: [
          "[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg!",
          "[&>[data-slot]~[data-slot]]:rounded-l-none",
          "[&>[data-slot]~[data-slot]]:border-l-0",
          "*:data-[slot]:rounded-r-none",
          // Separator: remove border from element before separator
          "[&>*:has(+[data-slot=button-group-separator])]:border-r-0",
          // Input focus fix: keep 1px border, transparent when unfocused
          "[&>[data-slot]~[data-slot=input]]:border-l",
          "[&>[data-slot]~[data-slot=input]:not(:focus)]:border-l-transparent",
        ].join(" "),
        vertical: [
          "flex-col",
          "[&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg!",
          "[&>[data-slot]~[data-slot]]:rounded-t-none",
          "[&>[data-slot]~[data-slot]]:border-t-0",
          "*:data-[slot]:rounded-b-none",
          "[&>*:has(+[data-slot=button-group-separator])]:border-b-0",
          // Input focus fix: keep 1px border, transparent when unfocused
          "[&>[data-slot]~[data-slot=input]]:border-t",
          "[&>[data-slot]~[data-slot=input]:not(:focus)]:border-t-transparent",
        ].join(" "),
      },
    },
    defaultVariants: { orientation: "horizontal" },
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
        data-slot="button-group-text"
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
          "bg-input relative self-stretch",
          orientation === "vertical" ? "w-px" : "h-px",
          className
        )}
        {...props}
      />
    );
  }
);
ButtonGroupSeparator.displayName = "ButtonGroupSeparator";

export { ButtonGroup, ButtonGroupText, ButtonGroupSeparator, buttonGroupVariants };
