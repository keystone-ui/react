"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check as CheckIcon } from "lucide-react";
import { cn } from "./utils";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        // Base styles
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-sm border",
        "border-input bg-input-bg",
        // Smooth color transitions
        "transition-colors duration-(--duration-fast,125ms)",
        // Click area extension — bumped toward AAA touch target (~36×24)
        "after:absolute after:-inset-x-4 after:-inset-y-3",
        // Checked state
        "data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        // Focus styles - outside border like buttons
        "focus:ring-0 focus:ring-offset-0 focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2",
        // Invalid styles - border change always, outline only on focus, no transition
        "aria-invalid:border-destructive aria-invalid:transition-none dark:aria-invalid:border-destructive/50",
        "aria-invalid:focus-visible:outline-destructive/50",
        "aria-invalid:data-checked:border-destructive aria-invalid:data-checked:bg-destructive aria-invalid:data-checked:text-destructive-foreground",
        // Disabled styles
        "disabled:cursor-not-allowed disabled:opacity-50 group-has-disabled/field:opacity-50",
        className
      )}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          "grid place-content-center text-current [&>svg]:size-3.5",
          // Micro-animation: scale + opacity transition
          // Tailwind v4 `scale-*` sets the standalone `scale` property, so it
          // must be named here — `transform` would leave it snapping.
          "transition-[scale,opacity] duration-(--duration-fast,125ms) ease-(--ease-ks-out,cubic-bezier(0.23,1,0.32,1))",
          // Unchecked: small + transparent (never scale(0)). Kept mounted so
          // the uncheck plays out instead of vanishing.
          "data-[unchecked]:scale-90 data-[unchecked]:opacity-0",
          "data-[checked]:scale-100 data-[indeterminate]:scale-100 data-[checked]:opacity-100 data-[indeterminate]:opacity-100"
        )}
        data-slot="checkbox-indicator"
        keepMounted
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
