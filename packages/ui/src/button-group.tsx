"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "./utils";

// =============================================================================
// ButtonGroup
// =============================================================================
const buttonGroupVariants = cva(
  [
    "flex w-fit items-stretch rounded-lg shadow-xs",
    "*:focus-visible:relative *:focus-visible:z-10",
    "[&>[data-input]]:focus-within:relative [&>[data-input]]:focus-within:z-10",
    "[&>input]:flex-1",
    "[&_button]:active:scale-100!",
    // Strip individual child shadows — the group container owns the shadow
    "[&>[data-slot=button]]:shadow-none",
    "[&>[data-input]]:shadow-none",
    "[&>[data-slot=select-trigger]]:shadow-none",
    "[&>[data-slot=button-group-text]]:shadow-none",
    // Nesting: add gap between nested ButtonGroups, remove parent shadow
    "has-[>[data-slot=button-group]]:gap-2",
    "has-[>[data-slot=button-group]]:shadow-none",
    "[&>[data-slot=button-group]]:shadow-none",
    // Select: handle hidden select element as last child
    "has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg",
    "[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit",
  ].join(" "),
  {
    variants: {
      orientation: {
        horizontal: [
          // Rounding
          "[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg!",
          "[&>[data-slot]~[data-slot]]:rounded-l-none",
          "*:data-[slot]:rounded-r-none",
          // Shared-edge border removal — both sides, uses ~ to skip hidden elements
          "[&>[data-slot]~[data-slot]]:border-l-0",
          "[&>[data-slot]:has(~[data-slot])]:border-r-0",
          // Universal separator for all adjacent slotted siblings
          "[&>[data-slot]~[data-slot]]:before:content-['']",
          "[&>[data-slot]~[data-slot]]:before:absolute",
          "[&>[data-slot]~[data-slot]]:before:left-0",
          "[&>[data-slot]~[data-slot]]:before:top-[25%]",
          "[&>[data-slot]~[data-slot]]:before:w-px",
          "[&>[data-slot]~[data-slot]]:before:h-[50%]",
          "[&>[data-slot]~[data-slot]]:before:bg-current",
          "[&>[data-slot]~[data-slot]]:before:opacity-15",
          "[&>[data-slot]~[data-slot]]:before:rounded-sm",
          // Button → input separator: <input> is void and can't have ::before,
          // so place ::after on the preceding button instead
          "[&>[data-slot]:has(+[data-input])]:after:content-['']",
          "[&>[data-slot]:has(+[data-input])]:after:absolute",
          "[&>[data-slot]:has(+[data-input])]:after:right-0",
          "[&>[data-slot]:has(+[data-input])]:after:top-[25%]",
          "[&>[data-slot]:has(+[data-input])]:after:w-px",
          "[&>[data-slot]:has(+[data-input])]:after:h-[50%]",
          "[&>[data-slot]:has(+[data-input])]:after:bg-current",
          "[&>[data-slot]:has(+[data-input])]:after:opacity-15",
          "[&>[data-slot]:has(+[data-input])]:after:rounded-sm",
        ].join(" "),
        vertical: [
          "flex-col",
          // Rounding
          "[&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg!",
          "[&>[data-slot]~[data-slot]]:rounded-t-none",
          "*:data-[slot]:rounded-b-none",
          // Shared-edge border removal — both sides, uses ~ to skip hidden elements
          "[&>[data-slot]~[data-slot]]:border-t-0",
          "[&>[data-slot]:has(~[data-slot])]:border-b-0",
          // Universal separator for all adjacent slotted siblings
          "[&>[data-slot]~[data-slot]]:before:content-['']",
          "[&>[data-slot]~[data-slot]]:before:absolute",
          "[&>[data-slot]~[data-slot]]:before:top-0",
          "[&>[data-slot]~[data-slot]]:before:left-[25%]",
          "[&>[data-slot]~[data-slot]]:before:h-px",
          "[&>[data-slot]~[data-slot]]:before:w-[50%]",
          "[&>[data-slot]~[data-slot]]:before:bg-current",
          "[&>[data-slot]~[data-slot]]:before:opacity-15",
          "[&>[data-slot]~[data-slot]]:before:rounded-sm",
          // Button → input separator: <input> is void and can't have ::before
          "[&>[data-slot]:has(+[data-input])]:after:content-['']",
          "[&>[data-slot]:has(+[data-input])]:after:absolute",
          "[&>[data-slot]:has(+[data-input])]:after:bottom-0",
          "[&>[data-slot]:has(+[data-input])]:after:left-[25%]",
          "[&>[data-slot]:has(+[data-input])]:after:h-px",
          "[&>[data-slot]:has(+[data-input])]:after:w-[50%]",
          "[&>[data-slot]:has(+[data-input])]:after:bg-current",
          "[&>[data-slot]:has(+[data-input])]:after:opacity-15",
          "[&>[data-slot]:has(+[data-input])]:after:rounded-sm",
          "[&>[data-slot]~[data-slot]]:before:rounded-sm",
        ].join(" "),
      },
    },
    defaultVariants: { orientation: "horizontal" },
  }
);

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {
  /**
   * The layout direction of the button group.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        className={cn(buttonGroupVariants({ orientation }), className)}
        data-orientation={orientation}
        data-slot="button-group"
        ref={ref}
        role="group"
        {...props}
      />
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";

// =============================================================================
// ButtonGroupText
// =============================================================================
export interface ButtonGroupTextProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ButtonGroupText = React.forwardRef<HTMLDivElement, ButtonGroupTextProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-border bg-muted px-4 font-medium text-sm shadow-xs",
          "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
          className
        )}
        data-slot="button-group-text"
        ref={ref}
        {...props}
      />
    );
  }
);
ButtonGroupText.displayName = "ButtonGroupText";

export { ButtonGroup, ButtonGroupText, buttonGroupVariants };
