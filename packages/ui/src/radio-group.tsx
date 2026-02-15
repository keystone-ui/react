"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { CircleIcon } from "lucide-react";
import { cn } from "./utils";

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      className={cn("grid w-full gap-2", className)}
      data-slot="radio-group"
      {...props}
    />
  );
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      className={cn(
        // Base styles
        "peer relative flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border",
        "border-input bg-input-bg text-primary",
        // Smooth color transitions
        "transition-colors duration-150",
        // Click area extension
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        // Checked state - primary bg with white indicator
        "data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
        // Focus styles - outside border like buttons/checkbox
        "focus:ring-0 focus:ring-offset-0 focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2",
        // Invalid styles - border and indicator red, outline only on focus, no transition
        "aria-invalid:border-destructive aria-invalid:text-destructive aria-invalid:transition-none dark:aria-invalid:border-destructive/50",
        "aria-invalid:focus-visible:outline-destructive/50",
        // Invalid + checked - red bg with white indicator (like checked but red)
        "aria-invalid:data-checked:border-destructive aria-invalid:data-checked:bg-destructive aria-invalid:data-checked:text-destructive-foreground",
        // Disabled styles
        "disabled:cursor-not-allowed disabled:opacity-50 group-has-disabled/field:opacity-50",
        // Reduced motion
        "motion-reduce:transition-none",
        className
      )}
      data-slot="radio-group-item"
      {...props}
    >
      <RadioPrimitive.Indicator
        className={cn(
          // Micro-animation: scale + opacity transition
          "transition-[transform,opacity] duration-150",
          // Hidden when unchecked
          "data-[unchecked]:scale-0 data-[unchecked]:opacity-0",
          // Visible when checked
          "data-[checked]:scale-100 data-[checked]:opacity-100",
          // Reduced motion
          "motion-reduce:transition-none"
        )}
        data-slot="radio-group-indicator"
        keepMounted
      >
        <CircleIcon className="size-2 fill-current" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
