"use client";

import React from "react";
import { cn } from "./utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /**
   * Optional additional className for the input
   */
  className?: string;
  /**
   * Size variant of the input.
   * Controls the visual height of the input (`"default"` = 40px, `"sm"` = 32px).
   * @default "default"
   */
  size?: "sm" | "default";
  /**
   * The native HTML `size` attribute for the `<input>` element.
   * Sets the visible width of the input in average character widths.
   * Use this instead of `size` when you need the native HTML behavior.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#size
   */
  htmlSize?: number;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", size = "default", htmlSize, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        data-size={size}
        size={htmlSize}
        className={cn(
          "bg-input-bg text-sm",
          "border border-input rounded-md",
          "flex w-full min-w-0 px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          size === "default" && "h-10",
          size === "sm" && "h-8",
          "placeholder:text-muted-foreground/70",
          // Focus styles
          "focus:ring-1 focus:ring-inset focus:ring-ring focus:border-ring",
          "aria-invalid:ring-destructive dark:aria-invalid:ring-destructive aria-invalid:border-destructive",
          // Special styling for different input types
          type === "search" &&
            "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
          type === "file" &&
            "file:bg-transparent text-muted-foreground/70 file:border-input file:text-foreground p-0 pr-3 italic file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:px-3 file:text-sm  file:not-italic file:inline-flex file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input"; 