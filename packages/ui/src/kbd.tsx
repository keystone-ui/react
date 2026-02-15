"use client";

import * as React from "react";
import { cn } from "./utils";

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
        className={cn(
          "pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm border bg-muted px-1.5 font-medium font-sans text-muted-foreground text-xs",
          "[&_svg:not([class*='size-'])]:size-3",
          // Tooltip context styling
          "[[data-slot=tooltip-content]_&]:border-transparent [[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background",
          "dark:[[data-slot=tooltip-content]_&]:bg-background/10",
          className
        )}
        data-slot="kbd"
        ref={ref}
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
        className={cn("inline-flex items-center gap-1", className)}
        data-slot="kbd-group"
        ref={ref}
        {...props}
      />
    );
  }
);
KbdGroup.displayName = "KbdGroup";
