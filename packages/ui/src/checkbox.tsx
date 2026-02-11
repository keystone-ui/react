"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "./utils";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Base styles
        "peer relative shrink-0 flex size-4 items-center justify-center rounded-sm border",
        "border-input bg-input-bg",
        // Smooth color transitions
        "transition-colors duration-150",
        // Click area extension
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        // Checked state
        "data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary",
        // Focus styles - outside border like buttons
        "focus:ring-0 focus:ring-offset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50",
        // Invalid styles - border change always, outline only on focus, no transition
        "aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 aria-invalid:transition-none",
        "aria-invalid:focus-visible:outline-destructive/50",
        "aria-invalid:data-checked:bg-destructive aria-invalid:data-checked:border-destructive aria-invalid:data-checked:text-destructive-foreground",
        // Disabled styles
        "group-has-disabled/field:opacity-50 disabled:cursor-not-allowed disabled:opacity-50",
        // Reduced motion
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        keepMounted
        className={cn(
          "[&>svg]:size-3.5 grid place-content-center text-current",
          // Micro-animation: scale + opacity transition
          "transition-[transform,opacity] duration-150",
          // Enter: animate from small + transparent
          "data-[starting-style]:scale-50 data-[starting-style]:opacity-0",
          // Exit: animate to small + transparent
          "data-[ending-style]:scale-50 data-[ending-style]:opacity-0",
          // Hide when unchecked (after exit transition completes)
          "data-[unchecked]:hidden",
          // Reduced motion
          "motion-reduce:transition-none"
        )}
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
