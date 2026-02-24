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
   * The native HTML `size` attribute for the `<input>` element.
   * Sets the visible width of the input in average character widths.
   * Use this instead of `size` when you need the native HTML behavior.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#size
   */
  htmlSize?: number;
  /**
   * Size variant of the input.
   * Controls the visual height of the input (`"default"` = 40px, `"sm"` = 32px).
   * @default "default"
   */
  size?: "sm" | "default";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", size = "default", htmlSize, ...props }, ref) => {
    return (
      <input
        className={cn(
          "bg-input-bg text-base md:text-sm",
          "rounded-md border border-input",
          "flex w-full min-w-0 px-3 py-1 shadow-xs outline-none transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          size === "default" && "h-10",
          size === "sm" && "h-8",
          "placeholder:text-muted-foreground/70",
          // Focus styles
          "focus:border-ring focus:ring-1 focus:ring-ring focus:ring-inset",
          "aria-invalid:border-destructive aria-invalid:ring-destructive dark:aria-invalid:ring-destructive",
          // Special styling for different input types
          type === "search" &&
            "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
          type === "file" &&
            "p-0 pr-3 text-muted-foreground/70 italic file:me-3 file:inline-flex file:h-full file:border-0 file:border-input file:border-r file:border-solid file:bg-transparent file:px-3 file:font-medium file:text-foreground file:text-sm file:not-italic",
          className
        )}
        data-input=""
        data-size={size}
        data-slot="input"
        ref={ref}
        size={htmlSize}
        type={type}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
