"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { cn } from "./utils";

// =============================================================================
// InputGroupContext
// =============================================================================
type InputGroupSize = "sm" | "default";

const InputGroupContext = React.createContext<{ size: InputGroupSize }>({
  size: "default",
});

// =============================================================================
// InputGroup
// =============================================================================
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The children of the input group
   */
  children: React.ReactNode;
  /**
   * Optional additional className for the input group
   */
  className?: string;
  /**
   * Size variant of the input group
   * @default "default"
   */
  size?: "sm" | "default";
}

export const InputGroup = ({
  className,
  children,
  size = "default",
  ref,
  ...props
}: InputGroupProps & React.RefAttributes<HTMLDivElement>) => {
  const contextValue = React.useMemo(() => ({ size }), [size]);
  return (
    <InputGroupContext.Provider value={contextValue}>
      <div
        className={cn(
          "group/input-group relative flex w-full items-center rounded-md border border-input bg-input-bg shadow-xs outline-none transition-[color,box-shadow]",
          "min-w-0",
          size === "default" && "h-10",
          size === "sm" && "h-8",

          // Textarea: auto-height, bottom-align addon so it stays anchored as textarea grows
          "has-[>textarea]:h-auto has-[>textarea]:items-end",
          "has-[>textarea]:[&_[data-slot=input-group-addon]]:pb-2",

          // Alignment variants - adjust input padding based on addon position
          "has-[>[data-align=inline-start]]:[&_[data-slot=input-group-control]]:pl-1.5",
          "has-[>[data-align=inline-end]]:[&_[data-slot=input-group-control]]:pr-1.5",
          "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&_[data-slot=input-group-control]]:pb-3",
          "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&_[data-slot=input-group-control]]:pt-3",

          // Focus state
          "has-[[data-slot=input-group-control]:focus]:border-ring has-[[data-slot=input-group-control]:focus]:ring-1 has-[[data-slot=input-group-control]:focus]:ring-ring has-[[data-slot=input-group-control]:focus]:ring-inset",

          // Error state
          "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-1 has-[[data-slot][aria-invalid=true]]:ring-destructive has-[[data-slot][aria-invalid=true]]:ring-inset",

          className
        )}
        data-input=""
        data-size={size}
        data-slot="input-group"
        ref={ref}
        role="group"
        {...props}
      >
        {children}
      </div>
    </InputGroupContext.Provider>
  );
};
InputGroup.displayName = "InputGroup";

// =============================================================================
// InputGroupAddon
// =============================================================================
const inputGroupAddonVariants = cva(
  "group/input-group-addon flex h-auto cursor-text select-none items-center justify-center gap-1 py-1.5 text-muted-foreground text-sm group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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

export const InputGroupAddon = ({
  className,
  align = "inline-start",
  children,
  ref,
  ...props
}: InputGroupAddonProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(inputGroupAddonVariants({ align }), className)}
    data-align={align}
    data-slot="input-group-addon"
    onClick={(e) => {
      if ((e.target as HTMLElement).closest("button, select")) {
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
InputGroupAddon.displayName = "InputGroupAddon";

// =============================================================================
// InputGroupButton
// =============================================================================
const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-sm shadow-none",
  {
    variants: {
      size: {
        // Auto-fit the parent InputGroup with a 4px inset all around (one
        // tier smaller than the group, anchored to the input frame via the
        // addon's negative margin). Block addons: 32px toolbar height.
        // Icon-only when the only direct child is an svg.
        auto: [
          "rounded-[calc(var(--radius)-5px)]",
          "[&>svg:not([class*='size-'])]:size-4",
          // Default group (40px) — 32px button (4px inset)
          "group-data-[size=default]/input-group:h-8",
          "group-data-[size=default]/input-group:gap-1.5",
          "group-data-[size=default]/input-group:px-2.5",
          // Sm group (32px) — 24px button (4px inset), 14px icon (matches xs)
          "group-data-[size=sm]/input-group:h-6",
          "group-data-[size=sm]/input-group:gap-1",
          "group-data-[size=sm]/input-group:px-2",
          "group-data-[size=sm]/input-group:[&>svg:not([class*='size-'])]:size-3.5",
          // Icon-only (only direct child is svg): square + p-0
          "has-[>svg:only-child]:p-0",
          "group-data-[size=default]/input-group:has-[>svg:only-child]:size-8",
          "group-data-[size=sm]/input-group:has-[>svg:only-child]:size-6",
          // Block addons: 32px toolbar height regardless of group size
          "group-data-[align=block-start]/input-group-addon:h-8",
          "group-data-[align=block-end]/input-group-addon:h-8",
          "group-data-[align=block-start]/input-group-addon:px-2.5",
          "group-data-[align=block-end]/input-group-addon:px-2.5",
          "group-data-[align=block-start]/input-group-addon:has-[>svg:only-child]:size-8",
          "group-data-[align=block-end]/input-group-addon:has-[>svg:only-child]:size-8",
          // Multi-button addon (sibling buttons present): compact 24px chips
          // so two/three buttons fit cleanly without extending past the input
          // frame. Stays out of block-addon scope (toolbars handle their own sizing).
          "group-has-[>button~button]/input-group-addon:h-6",
          "group-has-[>button~button]/input-group-addon:gap-1",
          "group-has-[>button~button]/input-group-addon:px-2",
          "group-has-[>button~button]/input-group-addon:[&>svg:not([class*='size-'])]:size-3.5",
          "group-has-[>button~button]/input-group-addon:has-[>svg:only-child]:size-6",
        ].join(" "),
        xs: "h-6 gap-1 rounded-sm px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
        "icon-xs": "size-6 rounded-sm p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 rounded-md p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "auto",
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

export const InputGroupButton = ({
  className,
  type = "button",
  variant = "ghost",
  size = "auto",
  ref,
  ...props
}: InputGroupButtonProps & React.RefAttributes<HTMLButtonElement>) => (
  <Button
    className={cn(inputGroupButtonVariants({ size }), className)}
    data-size={size}
    ref={ref}
    type={type}
    variant={variant}
    {...props}
  />
);
InputGroupButton.displayName = "InputGroupButton";

// =============================================================================
// InputGroupText
// =============================================================================
export interface InputGroupTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export const InputGroupText = ({
  className,
  ref,
  ...props
}: InputGroupTextProps & React.RefAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "flex items-center gap-2 text-muted-foreground text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      className
    )}
    ref={ref}
    {...props}
  />
);
InputGroupText.displayName = "InputGroupText";

// =============================================================================
// InputGroupInput
// =============================================================================
export interface InputGroupInputProps
  extends React.ComponentProps<typeof Input> {}

export const InputGroupInput = ({
  className,
  size,
  ref,
  ...props
}: InputGroupInputProps & React.RefAttributes<HTMLInputElement>) => {
  const { size: groupSize } = React.useContext(InputGroupContext);
  return (
    <Input
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none dark:bg-transparent",
        "focus:border-transparent focus:shadow-none focus:ring-0",
        className
      )}
      data-slot="input-group-control"
      ref={ref}
      size={size ?? groupSize}
      {...props}
    />
  );
};
InputGroupInput.displayName = "InputGroupInput";

// =============================================================================
// InputGroupTextarea
// =============================================================================
export interface InputGroupTextareaProps
  extends React.ComponentProps<typeof Textarea> {}

export const InputGroupTextarea = ({
  className,
  ref,
  ...props
}: InputGroupTextareaProps & React.RefAttributes<HTMLTextAreaElement>) => (
  <Textarea
    className={cn(
      "field-sizing-content min-h-10 flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none md:py-2.5 dark:bg-transparent",
      "focus:border-transparent focus:shadow-none focus:ring-0",
      className
    )}
    data-slot="input-group-control"
    ref={ref}
    {...props}
  />
);
InputGroupTextarea.displayName = "InputGroupTextarea";

// Export variants for external use
export { inputGroupAddonVariants, inputGroupButtonVariants };
