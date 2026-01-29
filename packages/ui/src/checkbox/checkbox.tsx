"use client";

import * as React from "react";
import { cn } from "../utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /**
   * Optional additional className for the checkbox
   */
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        role="checkbox"
        data-slot="checkbox"
        className={cn(
          "peer size-4 shrink-0 appearance-none rounded border border-input bg-transparent",
          "checked:bg-primary checked:border-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Checkmark styling using pseudo-element
          "relative",
          "checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center",
          "checked:before:content-['✓'] checked:before:text-[10px] checked:before:font-bold checked:before:text-primary-foreground checked:before:leading-none",
          className
        )}
        {...props}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";
