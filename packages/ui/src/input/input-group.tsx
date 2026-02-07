"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";
import { Button } from "../button";
import { Input } from "./input";

// =============================================================================
// InputGroup
// =============================================================================
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
        role="group"
        ref={ref}
        className={cn(
          "group/input-group border-input bg-input-bg relative flex w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none",
          "h-10 min-w-0",

          // Alignment variants - adjust input padding based on addon position
          "has-[>[data-align=inline-start]]:[&_[data-slot=input-group-control]]:pl-2",
          "has-[>[data-align=inline-end]]:[&_[data-slot=input-group-control]]:pr-2",
          "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&_[data-slot=input-group-control]]:pb-3",
          "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&_[data-slot=input-group-control]]:pt-3",

          // Focus state
          "has-[[data-slot=input-group-control]:focus]:border-ring has-[[data-slot=input-group-control]:focus]:ring-ring has-[[data-slot=input-group-control]:focus]:ring-1 has-[[data-slot=input-group-control]:focus]:ring-inset",

          // Error state
          "has-[[data-slot][aria-invalid=true]]:ring-1 has-[[data-slot][aria-invalid=true]]:ring-inset has-[[data-slot][aria-invalid=true]]:ring-destructive has-[[data-slot][aria-invalid=true]]:border-destructive",

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

// =============================================================================
// InputGroupAddon
// =============================================================================
const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm select-none [&>svg:not([class*='size-'])]:size-4 group-data-[disabled=true]/input-group:opacity-50",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-3 has-[>button]:-ml-2",
        "inline-end":
          "order-last pr-3 has-[>button]:-mr-2",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 group-has-[[data-slot=input-group-control]]/input-group:pt-2.5",
        "block-end":
          "order-last w-full justify-start px-3 pb-3 group-has-[[data-slot=input-group-control]]/input-group:pb-2.5",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
);

export interface InputGroupAddonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inputGroupAddonVariants> {
  /**
   * The children of the addon
   */
  children: React.ReactNode;
}

export const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align = "inline-start", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        data-slot="input-group-addon"
        data-align={align}
        className={cn(inputGroupAddonVariants({ align }), className)}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) {
            return;
          }
          e.currentTarget.parentElement?.querySelector<HTMLInputElement>("[data-slot=input-group-control]")?.focus();
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InputGroupAddon.displayName = "InputGroupAddon";

// =============================================================================
// InputGroupButton
// =============================================================================
const inputGroupButtonVariants = cva(
  "text-sm shadow-none flex gap-2 items-center",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 px-2 rounded-sm [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
        sm: "h-8 px-2.5 gap-1.5 rounded-md has-[>svg]:px-2.5",
        "icon-xs": "size-6 rounded-sm p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 rounded-md p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
);

export interface InputGroupButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "size">,
    VariantProps<typeof inputGroupButtonVariants> {
  /**
   * The type of button
   * @default "button"
   */
  type?: "button" | "submit" | "reset";
  /**
   * The variant of the button
   * @default "ghost"
   */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const InputGroupButton = React.forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  ({ className, type = "button", variant = "ghost", size = "xs", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type={type}
        data-size={size}
        variant={variant}
        className={cn(inputGroupButtonVariants({ size }), className)}
        {...props}
      />
    );
  }
);
InputGroupButton.displayName = "InputGroupButton";

// =============================================================================
// InputGroupText
// =============================================================================
export interface InputGroupTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const InputGroupText = React.forwardRef<HTMLSpanElement, InputGroupTextProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      />
    );
  }
);
InputGroupText.displayName = "InputGroupText";

// =============================================================================
// InputGroupInput
// =============================================================================
export interface InputGroupInputProps extends React.ComponentProps<typeof Input> {}

export const InputGroupInput = React.forwardRef<HTMLInputElement, InputGroupInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        data-slot="input-group-control"
        className={cn(
          "flex-1 rounded-none border-0 bg-transparent dark:bg-transparent shadow-none",
          "focus:ring-0 focus:border-transparent focus:shadow-none",
          className
        )}
        {...props}
      />
    );
  }
);
InputGroupInput.displayName = "InputGroupInput";

// Export variants for external use
export { inputGroupAddonVariants, inputGroupButtonVariants };
