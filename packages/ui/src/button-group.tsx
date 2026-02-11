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
          // Input focus fix: keep 1px border, transparent when unfocused
          "[&>[data-slot]~[data-slot=input]]:border-l",
          "[&>[data-slot]~[data-slot=input]:not(:focus)]:border-l-transparent",
          // Subtle separator between adjacent buttons
          "[&>[data-slot=button]:has(+[data-slot=button])]:border-r-0!",
          "[&>[data-slot=button]:has(+[data-slot=button])]:shadow-none",
          "[&>[data-slot=button]~[data-slot=button]]:before:content-['']",
          "[&>[data-slot=button]~[data-slot=button]]:before:absolute",
          "[&>[data-slot=button]~[data-slot=button]]:before:left-0",
          "[&>[data-slot=button]~[data-slot=button]]:before:top-[25%]",
          "[&>[data-slot=button]~[data-slot=button]]:before:w-px",
          "[&>[data-slot=button]~[data-slot=button]]:before:h-[50%]",
          "[&>[data-slot=button]~[data-slot=button]]:before:bg-current",
          "[&>[data-slot=button]~[data-slot=button]]:before:opacity-15",
          "[&>[data-slot=button]~[data-slot=button]]:before:rounded-sm",
        ].join(" "),
        vertical: [
          "flex-col",
          "[&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg!",
          "[&>[data-slot]~[data-slot]]:rounded-t-none",
          "[&>[data-slot]~[data-slot]]:border-t-0",
          "*:data-[slot]:rounded-b-none",
          // Input focus fix: keep 1px border, transparent when unfocused
          "[&>[data-slot]~[data-slot=input]]:border-t",
          "[&>[data-slot]~[data-slot=input]:not(:focus)]:border-t-transparent",
          // Subtle separator between adjacent buttons
          "[&>[data-slot=button]:has(+[data-slot=button])]:border-b-0!",
          "[&>[data-slot=button]:has(+[data-slot=button])]:shadow-none",
          "[&>[data-slot=button]~[data-slot=button]]:before:content-['']",
          "[&>[data-slot=button]~[data-slot=button]]:before:absolute",
          "[&>[data-slot=button]~[data-slot=button]]:before:top-0",
          "[&>[data-slot=button]~[data-slot=button]]:before:left-[25%]",
          "[&>[data-slot=button]~[data-slot=button]]:before:h-px",
          "[&>[data-slot=button]~[data-slot=button]]:before:w-[50%]",
          "[&>[data-slot=button]~[data-slot=button]]:before:bg-current",
          "[&>[data-slot=button]~[data-slot=button]]:before:opacity-15",
          "[&>[data-slot=button]~[data-slot=button]]:before:rounded-sm",
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

export { ButtonGroup, ButtonGroupText, buttonGroupVariants };
