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
          "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none",
          // Size variants
          "data-[size=default]:h-[18.4px] data-[size=default]:w-[32px]",
          "data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]",
          // State colors
          "data-checked:bg-primary data-unchecked:bg-input",
          "dark:data-unchecked:bg-input/80",
          // Focus styles
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          // Invalid styles
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 aria-invalid:ring-[3px]",
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
