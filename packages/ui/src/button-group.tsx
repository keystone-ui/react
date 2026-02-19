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
    "[&>[data-slot=input]]:focus:relative [&>[data-slot=input]]:focus:z-10",
    "[&>input]:flex-1",
    // Disable pressed scale animation inside groups (looks jarring with shared borders)
    "[&_button]:active:scale-100!",
    // Strip individual child shadows — the group container owns the shadow
    "[&>[data-slot=button]]:shadow-none",
    "[&>[data-slot=input]]:shadow-none",
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
          "[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg!",
          "[&>[data-slot]~[data-slot]]:rounded-l-none",
          "[&>[data-slot]~[data-slot]:not([data-slot=input])]:border-l-0",
          "*:data-[slot]:rounded-r-none",
          // Input focus fix (non-button predecessors only): keep 1px border,
          // transparent when unfocused, negative margin to overlap preceding border.
          // Uses ~ (general sibling) instead of + because Base UI Select renders a
          // hidden <select> between the trigger and the input, breaking adjacency.
          "[&>[data-slot]:not([data-slot=button])~[data-slot=input]]:-ml-px",
          "[&>[data-slot]:not([data-slot=button])~[data-slot=input]]:border-l",
          "[&>[data-slot]:not([data-slot=button])~[data-slot=input]:not(:focus)]:border-l-transparent",
          // Input after button: keep left border but transparent when unfocused,
          // negative margin to overlap — so both ring layers render on focus
          "[&>[data-slot=button]+[data-slot=input]]:-ml-px",
          "[&>[data-slot=button]+[data-slot=input]]:border-l",
          "[&>[data-slot=button]+[data-slot=input]:not(:focus)]:border-l-transparent",
          // Input before button: keep right border but transparent when unfocused,
          // negative margin to overlap — so both ring layers render on focus
          "[&>[data-slot=input]:has(+[data-slot=button])]:-mr-px",
          "[&>[data-slot=input]:has(+[data-slot=button])]:border-r",
          "[&>[data-slot=input]:has(+[data-slot=button]):not(:focus)]:border-r-transparent",
          // Subtle separator between adjacent buttons and between buttons and inputs
          "[&>[data-slot=button]:has(+:is([data-slot=button],[data-slot=input]))]:border-r-0!",
          "[&>[data-slot=button]~[data-slot=button]]:before:content-['']",
          "[&>[data-slot=button]~[data-slot=button]]:before:absolute",
          "[&>[data-slot=button]~[data-slot=button]]:before:left-0",
          "[&>[data-slot=button]~[data-slot=button]]:before:top-[25%]",
          "[&>[data-slot=button]~[data-slot=button]]:before:w-px",
          "[&>[data-slot=button]~[data-slot=button]]:before:h-[50%]",
          "[&>[data-slot=button]~[data-slot=button]]:before:bg-current",
          "[&>[data-slot=button]~[data-slot=button]]:before:opacity-15",
          "[&>[data-slot=button]~[data-slot=button]]:before:rounded-sm",
          // Subtle separator: button → input (via after: on the button)
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:content-['']",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:absolute",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:right-0",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:top-[25%]",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:w-px",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:h-[50%]",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:bg-current",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:opacity-15",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:rounded-sm",
          // Subtle separator: input → button (via before: on the button)
          "[&>[data-slot=input]+[data-slot=button]]:before:content-['']",
          "[&>[data-slot=input]+[data-slot=button]]:before:absolute",
          "[&>[data-slot=input]+[data-slot=button]]:before:left-0",
          "[&>[data-slot=input]+[data-slot=button]]:before:top-[25%]",
          "[&>[data-slot=input]+[data-slot=button]]:before:w-px",
          "[&>[data-slot=input]+[data-slot=button]]:before:h-[50%]",
          "[&>[data-slot=input]+[data-slot=button]]:before:bg-current",
          "[&>[data-slot=input]+[data-slot=button]]:before:opacity-15",
          "[&>[data-slot=input]+[data-slot=button]]:before:rounded-sm",
        ].join(" "),
        vertical: [
          "flex-col",
          "[&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg!",
          "[&>[data-slot]~[data-slot]]:rounded-t-none",
          "[&>[data-slot]~[data-slot]:not([data-slot=input])]:border-t-0",
          "*:data-[slot]:rounded-b-none",
          // Input focus fix (non-button predecessors only): keep 1px border,
          // transparent when unfocused, negative margin to overlap preceding border.
          // Uses ~ (general sibling) instead of + because Base UI Select renders a
          // hidden <select> between the trigger and the input, breaking adjacency.
          "[&>[data-slot]:not([data-slot=button])~[data-slot=input]]:-mt-px",
          "[&>[data-slot]:not([data-slot=button])~[data-slot=input]]:border-t",
          "[&>[data-slot]:not([data-slot=button])~[data-slot=input]:not(:focus)]:border-t-transparent",
          // Input after button: keep top border but transparent when unfocused,
          // negative margin to overlap — so both ring layers render on focus
          "[&>[data-slot=button]+[data-slot=input]]:-mt-px",
          "[&>[data-slot=button]+[data-slot=input]]:border-t",
          "[&>[data-slot=button]+[data-slot=input]:not(:focus)]:border-t-transparent",
          // Input before button: keep bottom border but transparent when unfocused,
          // negative margin to overlap — so both ring layers render on focus
          "[&>[data-slot=input]:has(+[data-slot=button])]:-mb-px",
          "[&>[data-slot=input]:has(+[data-slot=button])]:border-b",
          "[&>[data-slot=input]:has(+[data-slot=button]):not(:focus)]:border-b-transparent",
          // Subtle separator between adjacent buttons and between buttons and inputs
          "[&>[data-slot=button]:has(+:is([data-slot=button],[data-slot=input]))]:border-b-0!",
          "[&>[data-slot=button]~[data-slot=button]]:before:content-['']",
          "[&>[data-slot=button]~[data-slot=button]]:before:absolute",
          "[&>[data-slot=button]~[data-slot=button]]:before:top-0",
          "[&>[data-slot=button]~[data-slot=button]]:before:left-[25%]",
          "[&>[data-slot=button]~[data-slot=button]]:before:h-px",
          "[&>[data-slot=button]~[data-slot=button]]:before:w-[50%]",
          "[&>[data-slot=button]~[data-slot=button]]:before:bg-current",
          "[&>[data-slot=button]~[data-slot=button]]:before:opacity-15",
          "[&>[data-slot=button]~[data-slot=button]]:before:rounded-sm",
          // Subtle separator: button → input (via after: on the button)
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:content-['']",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:absolute",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:bottom-0",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:left-[25%]",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:h-px",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:w-[50%]",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:bg-current",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:opacity-15",
          "[&>[data-slot=button]:has(+[data-slot=input])]:after:rounded-sm",
          // Subtle separator: input → button (via before: on the button)
          "[&>[data-slot=input]+[data-slot=button]]:before:content-['']",
          "[&>[data-slot=input]+[data-slot=button]]:before:absolute",
          "[&>[data-slot=input]+[data-slot=button]]:before:top-0",
          "[&>[data-slot=input]+[data-slot=button]]:before:left-[25%]",
          "[&>[data-slot=input]+[data-slot=button]]:before:h-px",
          "[&>[data-slot=input]+[data-slot=button]]:before:w-[50%]",
          "[&>[data-slot=input]+[data-slot=button]]:before:bg-current",
          "[&>[data-slot=input]+[data-slot=button]]:before:opacity-15",
          "[&>[data-slot=input]+[data-slot=button]]:before:rounded-sm",
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
