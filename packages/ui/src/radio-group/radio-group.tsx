"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { CircleIcon } from "lucide-react";
import { cn } from "../utils";

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  );
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        // Base styles
        "peer relative shrink-0 flex aspect-square size-4 items-center justify-center rounded-full border",
        "border-input text-primary dark:bg-input/30",
        // Click area extension
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        // Checked state - primary bg with white indicator
        "data-checked:bg-primary data-checked:border-primary data-checked:text-primary-foreground",
        // Focus styles - outside border like buttons/checkbox
        "focus:ring-0 focus:ring-offset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline",
        // Invalid styles - border and indicator red, outline only on focus, no transition
        "aria-invalid:border-destructive aria-invalid:text-destructive dark:aria-invalid:border-destructive/50 aria-invalid:transition-none",
        "aria-invalid:focus-visible:outline-destructive/50",
        // Invalid + checked - red bg with white indicator (like checked but red)
        "aria-invalid:data-checked:bg-destructive aria-invalid:data-checked:border-destructive aria-invalid:data-checked:text-destructive-foreground",
        // Disabled styles
        "group-has-disabled/field:opacity-50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator data-slot="radio-group-indicator">
        <CircleIcon className="size-2 fill-current" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
