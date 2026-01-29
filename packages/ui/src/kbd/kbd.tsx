"use client";

import * as React from "react";
import { cn } from "../utils";

// =============================================================================
// Kbd
// =============================================================================
export interface KbdProps extends React.ComponentProps<"kbd"> {
  /**
   * Optional additional className for the kbd
   */
  className?: string;
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        data-slot="kbd"
        className={cn(
          "pointer-events-none inline-flex h-5 min-w-5 w-fit items-center justify-center gap-1 rounded-sm border bg-muted px-1.5 font-sans text-xs font-medium text-muted-foreground select-none",
          "[&_svg:not([class*='size-'])]:size-3",
          // Tooltip context styling
          "[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background [[data-slot=tooltip-content]_&]:border-transparent",
          "dark:[[data-slot=tooltip-content]_&]:bg-background/10",
          className
        )}
        {...props}
      />
    );
  }
);
Kbd.displayName = "Kbd";

// =============================================================================
// KbdGroup
// =============================================================================
export interface KbdGroupProps extends React.ComponentProps<"div"> {
  /**
   * Optional additional className for the kbd group
   */
  className?: string;
}

export const KbdGroup = React.forwardRef<HTMLDivElement, KbdGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="kbd-group"
        className={cn("inline-flex items-center gap-1", className)}
        {...props}
      />
    );
  }
);
KbdGroup.displayName = "KbdGroup";
