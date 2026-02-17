"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type * as React from "react";
import { cn, POPUP_ITEM_HEIGHT } from "./utils";

// =============================================================================
// Select (Root)
// =============================================================================
const Select = SelectPrimitive.Root;

// =============================================================================
// SelectGroup
// =============================================================================
export interface SelectGroupProps extends SelectPrimitive.Group.Props {}

function SelectGroup({ className, ...props }: SelectGroupProps) {
  return (
    <SelectPrimitive.Group
      className={cn("scroll-my-1 p-1", className)}
      data-slot="select-group"
      {...props}
    />
  );
}

// =============================================================================
// SelectValue
// =============================================================================
export interface SelectValueProps extends SelectPrimitive.Value.Props {}

function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <SelectPrimitive.Value
      className={cn("flex flex-1 text-left", className)}
      data-slot="select-value"
      {...props}
    />
  );
}

// =============================================================================
// SelectTrigger
// =============================================================================
export interface SelectTriggerProps extends SelectPrimitive.Trigger.Props {
  /**
   * Size variant of the trigger
   * @default "default"
   */
  size?: "sm" | "default";
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "group flex w-fit select-none items-center justify-between gap-1.5 whitespace-nowrap rounded-md border border-input bg-input-bg py-2 pr-1.5 pl-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus:border-ring focus:ring-1 focus:ring-ring focus:ring-inset disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive data-[size=default]:h-10 data-[size=sm]:h-8 data-[popup-open]:border-ring data-placeholder:text-muted-foreground/70 data-[popup-open]:ring-1 data-[popup-open]:ring-ring data-[popup-open]:ring-inset *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:aria-invalid:ring-destructive [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-size={size}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-data-[popup-open]:rotate-180" />
        }
      />
    </SelectPrimitive.Trigger>
  );
}

// =============================================================================
// SelectContent
// =============================================================================
export interface SelectContentProps extends SelectPrimitive.Popup.Props {
  /**
   * Side of the trigger to position the popup
   * @default "bottom"
   */
  side?: "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  /**
   * Offset from the trigger
   * @default 4
   */
  sideOffset?: number;
  /**
   * Alignment of the content
   * @default "center"
   */
  align?: "start" | "center" | "end";
  /**
   * Offset along the alignment axis
   * @default 0
   */
  alignOffset?: number;
  /**
   * Whether to align the selected item with the trigger
   * @default false
   */
  alignItemWithTrigger?: boolean;
  /**
   * Size of the menu items
   * @default "default"
   */
  size?: "default" | "compact";
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = false,
  size = "default",
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          className={cn(
            "data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-lg ring-1 ring-popup-ring duration-100 data-[align-trigger=true]:animate-none data-closed:animate-out data-open:animate-in motion-reduce:animate-none",
            className
          )}
          data-align-trigger={alignItemWithTrigger}
          data-size={size}
          data-slot="select-content"
          {...props}
        >
          <SelectPrimitive.List className="max-h-(--available-height) overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SelectScrollUpButton />
            {children}
            <SelectScrollDownButton />
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

// =============================================================================
// SelectLabel
// =============================================================================
export interface SelectLabelProps extends SelectPrimitive.GroupLabel.Props {}

function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.GroupLabel
      className={cn("px-1.5 py-1 text-muted-foreground text-xs", className)}
      data-slot="select-label"
      {...props}
    />
  );
}

// =============================================================================
// SelectItem
// =============================================================================
export interface SelectItemProps extends SelectPrimitive.Item.Props {
  children: React.ReactNode;
  /**
   * Custom indicator to show when item is selected.
   * Set to `null` to hide the indicator.
   * @default <CheckIcon />
   */
  indicator?: React.ReactNode;
}

function SelectItem({
  className,
  children,
  indicator,
  ...props
}: SelectItemProps) {
  const showDefaultIndicator = indicator === undefined;
  const showCustomIndicator = indicator !== undefined && indicator !== null;

  return (
    <SelectPrimitive.Item
      className={cn(
        `relative flex focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground ${POPUP_ITEM_HEIGHT} w-full cursor-pointer select-none items-center gap-1.5 rounded-md text-sm outline-hidden data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2`,
        showDefaultIndicator ? "pr-8 pl-1.5" : "px-2",
        className
      )}
      data-slot="select-item"
      {...props}
    >
      {showCustomIndicator && (
        <SelectPrimitive.ItemIndicator
          keepMounted
          render={<span className="flex items-center justify-center" />}
        >
          {indicator}
        </SelectPrimitive.ItemIndicator>
      )}
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      {showDefaultIndicator && (
        <SelectPrimitive.ItemIndicator
          render={
            <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
          }
        >
          <CheckIcon className="pointer-events-none" />
        </SelectPrimitive.ItemIndicator>
      )}
    </SelectPrimitive.Item>
  );
}

// =============================================================================
// SelectSeparator
// =============================================================================
export interface SelectSeparatorProps extends SelectPrimitive.Separator.Props {}

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      className={cn(
        "pointer-events-none -mx-1 my-1 h-px bg-border-muted",
        className
      )}
      data-slot="select-separator"
      {...props}
    />
  );
}

// =============================================================================
// SelectScrollUpButton
// =============================================================================
export interface SelectScrollUpButtonProps
  extends React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow> {}

function SelectScrollUpButton({
  className,
  ...props
}: SelectScrollUpButtonProps) {
  return (
    <SelectPrimitive.ScrollUpArrow
      className={cn(
        "sticky top-0 z-10 flex h-6 w-full cursor-default items-center justify-center bg-popover [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="select-scroll-up-button"
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

// =============================================================================
// SelectScrollDownButton
// =============================================================================
export interface SelectScrollDownButtonProps
  extends React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow> {}

function SelectScrollDownButton({
  className,
  ...props
}: SelectScrollDownButtonProps) {
  return (
    <SelectPrimitive.ScrollDownArrow
      className={cn(
        "sticky bottom-0 z-10 flex h-6 w-full cursor-default items-center justify-center bg-popover [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="select-scroll-down-button"
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

export type { SelectRootProps as SelectProps } from "@base-ui/react/select";
