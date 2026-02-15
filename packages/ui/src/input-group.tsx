"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { cn } from "./utils";

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
  /**
   * Size variant of the input group
   * @default "default"
   */
  size?: "sm" | "default";
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, size = "default", ...props }, ref) => {
    return (
      <div
        className={cn(
          "group/input-group relative flex w-full items-center rounded-md border border-input bg-input-bg shadow-xs outline-none transition-[color,box-shadow]",
          "min-w-0",
          size === "default" && "h-10",
          size === "sm" && "h-8",

          // Textarea: auto-height when containing a textarea
          "has-[>textarea]:h-auto",

          // Alignment variants - adjust input padding based on addon position
          "has-[>[data-align=inline-start]]:[&_[data-slot=input-group-control]]:pl-2",
          "has-[>[data-align=inline-end]]:[&_[data-slot=input-group-control]]:pr-2",
          "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&_[data-slot=input-group-control]]:pb-3",
          "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&_[data-slot=input-group-control]]:pt-3",

          // Focus state
          "has-[[data-slot=input-group-control]:focus]:border-ring has-[[data-slot=input-group-control]:focus]:ring-1 has-[[data-slot=input-group-control]:focus]:ring-ring has-[[data-slot=input-group-control]:focus]:ring-inset",

          // Error state
          "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-1 has-[[data-slot][aria-invalid=true]]:ring-destructive has-[[data-slot][aria-invalid=true]]:ring-inset",

          className
        )}
        data-size={size}
        data-slot="input-group"
        ref={ref}
        role="group"
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
  "flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-muted-foreground text-sm group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-3 has-[>button]:-ml-2",
        "inline-end": "order-last pr-3 has-[>button]:-mr-2",
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

export const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  InputGroupAddonProps
>(({ className, align = "inline-start", children, ...props }, ref) => {
  return (
    <div
      className={cn(inputGroupAddonVariants({ align }), className)}
      data-align={align}
      data-slot="input-group-addon"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement
          ?.querySelector<HTMLInputElement>("[data-slot=input-group-control]")
          ?.focus();
      }}
      ref={ref}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
});
InputGroupAddon.displayName = "InputGroupAddon";

// =============================================================================
// InputGroupButton
// =============================================================================
const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-sm px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
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
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  InputGroupButtonProps
>(
  (
    { className, type = "button", variant = "ghost", size = "xs", ...props },
    ref
  ) => {
    return (
      <Button
        className={cn(inputGroupButtonVariants({ size }), className)}
        data-size={size}
        ref={ref}
        type={type}
        variant={variant}
        {...props}
      />
    );
  }
);
InputGroupButton.displayName = "InputGroupButton";

// =============================================================================
// InputGroupText
// =============================================================================
export interface InputGroupTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  InputGroupTextProps
>(({ className, ...props }, ref) => {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-muted-foreground text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
InputGroupText.displayName = "InputGroupText";

// =============================================================================
// InputGroupInput
// =============================================================================
export interface InputGroupInputProps
  extends React.ComponentProps<typeof Input> {}

export const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  InputGroupInputProps
>(({ className, ...props }, ref) => {
  return (
    <Input
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none dark:bg-transparent",
        "focus:border-transparent focus:shadow-none focus:ring-0",
        className
      )}
      data-slot="input-group-control"
      ref={ref}
      {...props}
    />
  );
});
InputGroupInput.displayName = "InputGroupInput";

// =============================================================================
// InputGroupTextarea
// =============================================================================
export interface InputGroupTextareaProps
  extends React.ComponentProps<typeof Textarea> {}

export const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  InputGroupTextareaProps
>(({ className, ...props }, ref) => {
  return (
    <Textarea
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none dark:bg-transparent",
        "focus:border-transparent focus:shadow-none focus:ring-0",
        className
      )}
      data-slot="input-group-control"
      ref={ref}
      {...props}
    />
  );
});
InputGroupTextarea.displayName = "InputGroupTextarea";

// Export variants for external use
export { inputGroupAddonVariants, inputGroupButtonVariants };
