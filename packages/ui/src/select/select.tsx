"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn, POPUP_ITEM_HEIGHT } from "../utils";

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
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
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
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
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
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group border-input data-placeholder:text-muted-foreground/70 bg-input-bg flex w-fit items-center justify-between gap-1.5 rounded-md border py-2 pr-2 pl-3 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none select-none focus:ring-1 focus:ring-inset focus:ring-ring focus:border-ring data-[popup-open]:ring-1 data-[popup-open]:ring-inset data-[popup-open]:ring-ring data-[popup-open]:border-ring aria-invalid:ring-destructive dark:aria-invalid:ring-destructive aria-invalid:border-destructive disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-10 data-[size=sm]:h-9 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-150 ease-out group-data-[popup-open]:rotate-180" />
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
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "bg-popover text-popover-foreground ring-popup-ring data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-hidden rounded-lg shadow-lg ring-1 duration-100 data-[align-trigger=true]:animate-none",
            className
          )}
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
      data-slot="select-label"
      className={cn("text-muted-foreground px-1.5 py-1 text-xs", className)}
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
      data-slot="select-item"
      className={cn(
        `focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground relative flex ${POPUP_ITEM_HEIGHT} w-full cursor-pointer items-center gap-1.5 rounded-md text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2`,
        showDefaultIndicator ? "pr-8 pl-1.5" : "px-2",
        className
      )}
      {...props}
    >
      {showCustomIndicator && (
        <SelectPrimitive.ItemIndicator
          render={<span className="flex items-center justify-center" />}
          keepMounted
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
      data-slot="select-separator"
      className={cn("bg-border-muted pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

// =============================================================================
// SelectScrollUpButton
// =============================================================================
export interface SelectScrollUpButtonProps
  extends React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow> {}

function SelectScrollUpButton({ className, ...props }: SelectScrollUpButtonProps) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "bg-popover sticky top-0 z-10 flex h-6 w-full cursor-default items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
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
      data-slot="select-scroll-down-button"
      className={cn(
        "bg-popover sticky bottom-0 z-10 flex h-6 w-full cursor-default items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
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
