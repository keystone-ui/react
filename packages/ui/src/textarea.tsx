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
        ref={ref}
        data-slot="textarea"
        className={cn(
          "bg-input-bg text-sm",
          "border border-input rounded-md",
          "flex min-h-[80px] w-full px-3 py-2 shadow-xs transition-[color,box-shadow] outline-none",
          "placeholder:text-muted-foreground/70",
          "focus:ring-1 focus:ring-inset focus:ring-ring focus:border-ring",
          "aria-invalid:ring-destructive dark:aria-invalid:ring-destructive aria-invalid:border-destructive",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
