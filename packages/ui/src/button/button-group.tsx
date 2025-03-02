"use client";

import React from "react";
import { cn } from "@acme/ui";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional additional className for the button group
   */
  className?: string;
  /**
   * Whether the buttons should be attached (no gap between them)
   * @default true
   */
  attached?: boolean;
  /**
   * The orientation of the button group
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, attached = true, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          attached ? [
            // No gap when attached
            "overflow-hidden",
            // Horizontal orientation styles
            orientation === "horizontal" && [
              "*:not-first:border-l-0",
              "*:not-first:rounded-l-none",
              "*:not-last:rounded-r-none",
            ],
            // Vertical orientation styles
            orientation === "vertical" && [
              "*:not-first:border-t-0",
              "*:not-first:rounded-t-none",
              "*:not-last:rounded-b-none",
            ],
          ] : "gap-2",
          className
        )}
        data-orientation={orientation}
        data-attached={attached}
        {...props}
      />
    );
  }
);

ButtonGroup.displayName = "ButtonGroup"; 