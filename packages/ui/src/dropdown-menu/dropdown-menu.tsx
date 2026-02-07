"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { cn, POPUP_ITEM_HEIGHT } from "../utils";
import { Checkbox } from "../checkbox";

// =============================================================================
// DropdownMenu (Root)
// =============================================================================
function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

// =============================================================================
// DropdownMenuPortal
// =============================================================================
export interface DropdownMenuPortalProps extends MenuPrimitive.Portal.Props {}

function DropdownMenuPortal({ ...props }: DropdownMenuPortalProps) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

// =============================================================================
// DropdownMenuTrigger
// =============================================================================
export interface DropdownMenuTriggerProps extends MenuPrimitive.Trigger.Props {}

function DropdownMenuTrigger({
  className,
  ...props
}: DropdownMenuTriggerProps) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(className)}
      {...props}
    />
  );
}

// =============================================================================
// DropdownMenuContent
// =============================================================================
export interface DropdownMenuContentProps extends MenuPrimitive.Popup.Props {
  /**
   * Alignment of the content relative to the trigger
   * @default "start"
   */
  align?: "start" | "center" | "end";
  /**
   * Offset along the alignment axis
   * @default 0
   */
  alignOffset?: number;
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
   * Size of the menu items
   * @default "default"
   */
  size?: "default" | "compact";
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  size = "default",
  className,
  ...props
}: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          data-size={size}
          className={cn(
            "bg-popover text-popover-foreground ring-popup-ring",
            "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2",
            "z-50 max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg p-1 shadow-lg ring-1 duration-100 outline-none data-closed:overflow-hidden",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

// =============================================================================
// DropdownMenuGroup
// =============================================================================
export interface DropdownMenuGroupProps extends MenuPrimitive.Group.Props {}

function DropdownMenuGroup({ ...props }: DropdownMenuGroupProps) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

// =============================================================================
// DropdownMenuLabel
// =============================================================================
export interface DropdownMenuLabelProps extends MenuPrimitive.GroupLabel.Props {
  /**
   * Whether to add left padding for inset alignment
   * @default false
   */
  inset?: boolean;
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "text-muted-foreground px-1.5 py-1 text-xs data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  );
}

// =============================================================================
// DropdownMenuItem
// =============================================================================
export interface DropdownMenuItemProps extends MenuPrimitive.Item.Props {
  /**
   * Whether to add left padding for inset alignment
   * @default false
   */
  inset?: boolean;
  /**
   * Visual variant of the item
   * @default "default"
   */
  variant?: "default" | "destructive";
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive",
        "not-data-[variant=destructive]:focus:**:text-accent-foreground",
        `group/dropdown-menu-item relative flex ${POPUP_ITEM_HEIGHT} cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-sm outline-hidden select-none`,
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[inset]:pl-8",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

// =============================================================================
// DropdownMenuSub
// =============================================================================
export interface DropdownMenuSubProps extends MenuPrimitive.SubmenuRoot.Props {}

function DropdownMenuSub({ ...props }: DropdownMenuSubProps) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

// =============================================================================
// DropdownMenuSubTrigger
// =============================================================================
export interface DropdownMenuSubTriggerProps
  extends MenuPrimitive.SubmenuTrigger.Props {
  /**
   * Whether to add left padding for inset alignment
   * @default false
   */
  inset?: boolean;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground",
        "not-data-[variant=destructive]:focus:**:text-accent-foreground",
        "data-popup-open:bg-accent data-popup-open:text-accent-foreground",
        `flex ${POPUP_ITEM_HEIGHT} cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-sm outline-hidden select-none data-[inset]:pl-8`,
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

// =============================================================================
// DropdownMenuSubContent
// =============================================================================
export interface DropdownMenuSubContentProps
  extends Omit<DropdownMenuContentProps, "align" | "alignOffset" | "side" | "sideOffset"> {
  /**
   * Alignment of the subcontent
   * @default "start"
   */
  align?: "start" | "center" | "end";
  /**
   * Offset along the alignment axis
   * @default -3
   */
  alignOffset?: number;
  /**
   * Side of the trigger to position the popup
   * @default "right"
   */
  side?: "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  /**
   * Offset from the trigger
   * @default 0
   */
  sideOffset?: number;
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: DropdownMenuSubContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-sub-content"
          className={cn(
            "bg-popover text-popover-foreground ring-popup-ring",
            "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "z-50 w-auto min-w-24 origin-(--transform-origin) overflow-hidden rounded-md p-1 shadow-lg ring-1 duration-100",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

// =============================================================================
// DropdownMenuCheckboxItem
// =============================================================================
export interface DropdownMenuCheckboxItemProps
  extends MenuPrimitive.CheckboxItem.Props {
  /**
   * Visual style of the checkbox indicator
   * - "indicator": check icon on the right (default)
   * - "control": renders a real Checkbox component on the left
   * @default "indicator"
   */
  variant?: "indicator" | "control";
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  variant = "indicator",
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground",
        variant === "indicator" && "focus:**:text-accent-foreground",
        `relative flex ${POPUP_ITEM_HEIGHT} cursor-pointer items-center gap-1.5 rounded-md text-sm outline-hidden select-none`,
        variant === "indicator" ? "pr-8 pl-1.5" : "px-1.5",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      {variant === "control" ? (
        <Checkbox
          checked={checked ?? false}
          tabIndex={-1}
          className="pointer-events-none after:hidden focus-visible:outline-none"
        />
      ) : (
        <span
          className="pointer-events-none absolute right-2 flex items-center justify-center"
          data-slot="dropdown-menu-checkbox-item-indicator"
        >
          <MenuPrimitive.CheckboxItemIndicator>
            <CheckIcon className="size-4" />
          </MenuPrimitive.CheckboxItemIndicator>
        </span>
      )}
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

// =============================================================================
// DropdownMenuRadioGroup
// =============================================================================
export interface DropdownMenuRadioGroupProps
  extends MenuPrimitive.RadioGroup.Props {}

function DropdownMenuRadioGroup({ ...props }: DropdownMenuRadioGroupProps) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

// =============================================================================
// DropdownMenuRadioItem
// =============================================================================
export interface DropdownMenuRadioItemProps
  extends MenuPrimitive.RadioItem.Props {
  /**
   * Visual style of the radio indicator
   * - "indicator": check icon on the right (default)
   * - "control": renders a real Radio component on the left
   * @default "indicator"
   */
  variant?: "indicator" | "control";
}

function DropdownMenuRadioItem({
  className,
  children,
  variant = "indicator",
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground",
        variant === "indicator" && "focus:**:text-accent-foreground",
        `relative flex ${POPUP_ITEM_HEIGHT} cursor-pointer items-center gap-1.5 rounded-md text-sm outline-hidden select-none`,
        variant === "indicator" ? "pr-8 pl-1.5" : "px-1.5",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {variant === "control" ? (
        <span
          data-slot="dropdown-menu-radio-control"
          className={cn(
            "relative shrink-0 flex aspect-square size-4 items-center justify-center rounded-full border",
            "border-input text-primary bg-input-bg",
            "[[data-checked]_&]:bg-primary [[data-checked]_&]:border-primary [[data-checked]_&]:text-primary-foreground",
            "pointer-events-none"
          )}
        >
          <MenuPrimitive.RadioItemIndicator>
            <CircleIcon className="size-2 fill-current" />
          </MenuPrimitive.RadioItemIndicator>
        </span>
      ) : (
        <span
          className="pointer-events-none absolute right-2 flex items-center justify-center"
          data-slot="dropdown-menu-radio-item-indicator"
        >
          <MenuPrimitive.RadioItemIndicator>
            <CheckIcon className="size-4" />
          </MenuPrimitive.RadioItemIndicator>
        </span>
      )}
      {children}
    </MenuPrimitive.RadioItem>
  );
}

// =============================================================================
// DropdownMenuSeparator
// =============================================================================
export interface DropdownMenuSeparatorProps
  extends MenuPrimitive.Separator.Props {}

function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border-muted -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

// =============================================================================
// DropdownMenuShortcut
// =============================================================================
export interface DropdownMenuShortcutProps
  extends React.ComponentProps<"span"> {}

function DropdownMenuShortcut({
  className,
  ...props
}: DropdownMenuShortcutProps) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  );
}

// =============================================================================
// Exports
// =============================================================================
export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

export type { MenuRootProps as DropdownMenuProps } from "@base-ui/react/menu";
