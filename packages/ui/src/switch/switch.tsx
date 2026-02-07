"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "../utils";

export interface SwitchProps extends SwitchPrimitive.Root.Props {
  /**
   * Size variant of the switch
   * @default "default"
   */
  size?: "sm" | "default";
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <SwitchPrimitive.Root
        ref={ref}
        data-slot="switch"
        data-size={size}
        className={cn(
          "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-[background-color,border-color]",
          // Size variants
          "data-[size=default]:h-4.5 data-[size=default]:w-8",
          "data-[size=sm]:h-3.5 data-[size=sm]:w-6",
          // State colors
          "data-checked:bg-primary data-unchecked:bg-input",
          "dark:data-unchecked:bg-input/80",
          // Focus styles - outside outline like buttons
          "focus:ring-0 focus:ring-offset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50",
          // Invalid styles
          "aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 aria-invalid:transition-none aria-invalid:focus-visible:outline-destructive/50",
          // Disabled styles
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          // Click area extension
          "after:absolute after:-inset-x-3 after:-inset-y-2",
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className={cn(
            "pointer-events-none block rounded-full ring-0 transition-transform",
            "bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground",
            // Size variants for thumb
            "group-data-[size=default]/switch:size-4",
            "group-data-[size=sm]/switch:size-3",
            // Translation based on state
            "group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)]",
            "group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)]",
            "group-data-[size=default]/switch:data-unchecked:translate-x-0",
            "group-data-[size=sm]/switch:data-unchecked:translate-x-0"
          )}
        />
      </SwitchPrimitive.Root>
    );
  }
);

Switch.displayName = "Switch";
