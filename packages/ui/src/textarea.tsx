"use client";

import * as React from "react";
import { cn } from "./utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Optional additional className for the textarea
   */
  className?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "bg-input-bg text-sm",
          "rounded-md border border-input",
          "flex min-h-[80px] w-full px-3 py-2 shadow-xs outline-none transition-[color,box-shadow]",
          "placeholder:text-muted-foreground/70",
          "focus:border-ring focus:ring-1 focus:ring-ring focus:ring-inset",
          "aria-invalid:border-destructive aria-invalid:ring-destructive dark:aria-invalid:ring-destructive",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y",
          className
        )}
        data-slot="textarea"
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
