"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import * as React from "react";
import { cn } from "./utils";

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
        className={cn(
          "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-[background-color,border-color]",
          // Size variants
          "data-[size=default]:h-4.5 data-[size=default]:w-8",
          "data-[size=sm]:h-3.5 data-[size=sm]:w-6",
          // State colors
          "data-checked:bg-primary data-unchecked:bg-input",
          "dark:data-unchecked:bg-input/80",
          // Focus styles - outside outline like buttons
          "focus:ring-0 focus:ring-offset-0 focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2",
          // Invalid styles
          "aria-invalid:border-destructive aria-invalid:transition-none aria-invalid:focus-visible:outline-destructive/50 dark:aria-invalid:border-destructive/50",
          // Disabled styles
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          // Click area extension
          "after:absolute after:-inset-x-3 after:-inset-y-2",
          className
        )}
        data-size={size}
        data-slot="switch"
        ref={ref}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "pointer-events-none block rounded-full ring-0 transition-transform",
            "bg-background dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground",
            // Size variants for thumb
            "group-data-[size=default]/switch:size-4",
            "group-data-[size=sm]/switch:size-3",
            // Translation based on state
            "group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)]",
            "group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)]",
            "group-data-[size=default]/switch:data-unchecked:translate-x-0",
            "group-data-[size=sm]/switch:data-unchecked:translate-x-0"
          )}
          data-slot="switch-thumb"
        />
      </SwitchPrimitive.Root>
    );
  }
);

Switch.displayName = "Switch";
