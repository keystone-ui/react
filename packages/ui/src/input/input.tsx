"use client";

import React from "react";
import { cn } from "@acme/ui";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Optional additional className for the input
   */
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "bg-transparent text-sm",
          "border border-input rounded-md",
          "flex h-10 w-full min-w-0 px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "placeholder:text-muted-foreground/70",
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