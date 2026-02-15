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
    const ariaOrientation =
      orientation === "vertical" ? orientation : undefined;
    const semanticProps = decorative
      ? { role: "none" }
      : { "aria-orientation": ariaOrientation, role: "separator" };

    return (
      <div
        className={cn(
          "shrink-0 bg-border",
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          className
        )}
        data-orientation={orientation}
        data-slot="separator"
        ref={ref}
        {...semanticProps}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";
