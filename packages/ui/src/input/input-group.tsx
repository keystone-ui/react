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
          "group",
          "transition-[color,box-shadow] shadow-xs flex border rounded-md has-[[data-slot=input]:focus]:ring-1 has-[[data-slot=input]:focus]:ring-inset has-[[data-slot=input]:focus]:ring-ring has-[[data-slot=input]:focus]:border-ring has-[[data-slot=input]:focus]:outline-none",
          "relative",
          // Remove border styling from input when inside InputGroup
          "**:data-[slot=input]:border-0",
          "**:data-[slot=input]:rounded-none",
          "**:data-[slot=input]:shadow-none",

          // Add margin/padding/radius to input when start/end exists
          "[&:has([data-slot=start])]:**:data-[slot=input]:-ms-px",
          "[&:has([data-slot=end])]:**:data-[slot=input]:-me-px",

          "[&:has([data-slot=start])]:**:data-[slot=input]:rounded-e-md",
          "[&:has([data-slot=end])]:**:data-[slot=input]:rounded-s-md",
          
          // Adjust input padding when using inline variants
          "[&:has([data-variant=inline][data-slot=start])]:**:data-[slot=input]:pl-1.5",
          "[&:has([data-variant=inline][data-slot=end])]:**:data-[slot=input]:pr-1.5",
          
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
          "text-muted-foreground inline-flex items-center text-sm",
          "placeholder:text-muted-foreground/70",
          "relative", // Need relative position for absolute pseudo-elements

          // Use pseudo-elements instead of borders for box variant
          "data-[slot=start]:data-[variant=box]:after:content-['']",
          "data-[slot=start]:data-[variant=box]:after:absolute",
          "data-[slot=start]:data-[variant=box]:after:right-0",
          "data-[slot=start]:data-[variant=box]:after:top-0", 
          "data-[slot=start]:data-[variant=box]:after:bottom-0",
          "group-has-[[data-slot=input]:focus]:data-[slot=start]:data-[variant=box]:after:top-[1px]",
          "group-has-[[data-slot=input]:focus]:data-[slot=start]:data-[variant=box]:after:bottom-[1px]",
          "data-[slot=start]:data-[variant=box]:after:w-[1px]",
          "data-[slot=start]:data-[variant=box]:after:bg-border",
          
          "data-[slot=end]:data-[variant=box]:after:content-['']",
          "data-[slot=end]:data-[variant=box]:after:absolute", 
          "data-[slot=end]:data-[variant=box]:after:left-0",
          "data-[slot=end]:data-[variant=box]:after:top-0",
          "data-[slot=end]:data-[variant=box]:after:bottom-0", 
          "group-has-[[data-slot=input]:focus]:data-[slot=end]:data-[variant=box]:after:top-[1px]",
          "group-has-[[data-slot=input]:focus]:data-[slot=end]:data-[variant=box]:after:bottom-[1px]",
          "data-[slot=end]:data-[variant=box]:after:w-[1px]", 
          "data-[slot=end]:data-[variant=box]:after:bg-border",
          
          // Adjust padding based on position and variant
          "data-[slot=start]:pl-3",
          "data-[slot=start]:data-[variant=box]:pr-3",
          "data-[slot=start]:data-[variant=inline]:pr-1.5",

          "data-[slot=end]:pr-3",
          "data-[slot=end]:data-[variant=box]:pl-3",
          "data-[slot=end]:data-[variant=inline]:pl-1.5",
          
          // Remove padding from adornment when it has a button
          "data-[slot=start]:[&:has(button)]:p-0", 
          "data-[slot=end]:[&:has(button)]:p-0",
          "data-[slot=start]:data-[variant=box]:[&:has(button)]:p-0", 
          "data-[slot=start]:data-[variant=inline]:[&:has(button)]:p-0",
          "data-[slot=end]:data-[variant=box]:[&:has(button)]:p-0", 
          "data-[slot=end]:data-[variant=inline]:[&:has(button)]:p-0",

          // Apply padding directly to AdornmentButton based on position and variant
          "data-[slot=start]:**:data-[slot=adornment-button]:pl-3",
          "data-[slot=start]:data-[variant=box]:**:data-[slot=adornment-button]:pr-3",
          "data-[slot=start]:data-[variant=inline]:**:data-[slot=adornment-button]:pr-3",
          "data-[slot=end]:**:data-[slot=adornment-button]:pr-3",
          "data-[slot=end]:data-[variant=box]:**:data-[slot=adornment-button]:pl-3",
          "data-[slot=end]:data-[variant=inline]:**:data-[slot=adornment-button]:pl-3",
          
          // Adjust border radius based on position
          "data-[slot=start]:rounded-s-md",
          "data-[slot=end]:rounded-e-md",
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

// AdornmentButton component
export interface AdornmentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Optional additional className for the button
   */
  className?: string;
  /**
   * The content of the button
   */
  children: React.ReactNode;
}

export const AdornmentButton = React.forwardRef<HTMLButtonElement, AdornmentButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-slot="adornment-button"
        className={cn(
          "flex h-full items-center",
          "text-muted-foreground hover:text-foreground",
          "transition-colors",
          "relative z-20",
          
          // Focus styles for keyboard navigation
          "focus-visible:outline-none",
          "focus-visible:text-foreground",
          "focus-visible:bg-accent/30",
          "focus-visible:ring-2",
          "focus-visible:ring-ring",
          "focus-visible:ring-inset",
          "focus-visible:rounded-sm",

          // Position-specific styles will be applied via context from parent
          // or can be added with className
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AdornmentButton.displayName = "AdornmentButton"; 