"use client";

import React from "react";
import { cn } from "@acme/ui";

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional additional className for the input group
   */
  className?: string;
  /**
   * The children of the input group
   */
  children: React.ReactNode;
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        data-slot="input-group"
        ref={ref}
        className={cn(
          "transition-[color,box-shadow] shadow-xs flex border rounded-md focus-within:ring-1 focus-within:ring-inset focus-within:ring-ring focus-within:border-ring focus-within:outline-none",
          // Remove border styling from input when inside InputGroup
          "[&>[data-slot=input]]:border-0",
          "[&>[data-slot=input]]:rounded-none",
          "[&>[data-slot=input]]:shadow-none",
          // Add padding to input when start/end exists
          "[&:has([data-slot=start])>[data-slot=input]]:-ms-px",
          "[&:has([data-slot=end])>[data-slot=input]]:-me-px",

          "[&:has([data-slot=start])>[data-slot=input]]:-ms-px",
          "[&:has([data-slot=start])>[data-slot=input]]:rounded-e-md",

          "[&:has([data-slot=end])>[data-slot=input]]:-me-px",
          "[&:has([data-slot=end])>[data-slot=input]]:rounded-s-md",
          
          // Adjust input padding when using inline variants
          "[&:has([data-variant=inline][data-slot=start])>[data-slot=input]]:pl-1.5",
          "[&:has([data-variant=inline][data-slot=end])>[data-slot=input]]:pr-1.5",
          
          // Add divide-x by default, remove for inline variants
          "divide-x divide-border",
          "has-[[data-variant=inline]]:divide-x-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

InputGroup.displayName = "InputGroup";

// InputAdornment component
export interface InputAdornmentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional additional className for the adornment
   */
  className?: string;
  /**
   * The content of the adornment
   */
  children: React.ReactNode;
  /**
   * The position of the adornment
   */
  position: "start" | "end";
  /**
   * The variant of the adornment
   * @default "box"
   */
  variant?: "box" | "inline";
}

export const InputAdornment = React.forwardRef<HTMLDivElement, InputAdornmentProps>(
  ({ className, children, position, variant = "box", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot={position === "start" ? "start" : "end"}
        data-variant={variant}
        className={cn(
          "inline-flex items-center",
          "bg-background text-muted-foreground -z-10 inline-flex items-center text-sm",
          "placeholder:text-muted-foreground/70",
          // Adjust padding based on position and variant
          position === "start" 
            ? "pl-3 " + (variant === "inline" ? "pr-1.5" : "pr-3")
            : "pr-3 " + (variant === "inline" ? "pl-1.5" : "pl-3"),
          position === "start" ? "rounded-s-md" : "rounded-e-md",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

InputAdornment.displayName = "InputAdornment"; 