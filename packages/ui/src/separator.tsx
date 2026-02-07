"use client";

import * as React from "react";
import { cn } from "./utils";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The orientation of the separator
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether the separator is decorative (not announced by screen readers)
   * @default true
   */
  decorative?: boolean;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => {
    const ariaOrientation = orientation === "vertical" ? orientation : undefined;
    const semanticProps = decorative
      ? { role: "none" }
      : { "aria-orientation": ariaOrientation, role: "separator" };

    return (
      <div
        ref={ref}
        data-slot="separator"
        data-orientation={orientation}
        className={cn(
          "bg-border shrink-0",
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          className
        )}
        {...semanticProps}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";
