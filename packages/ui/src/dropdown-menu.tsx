"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import type * as React from "react";
import { Checkbox } from "./checkbox";
import { cn, POPUP_ITEM_HEIGHT } from "./utils";

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
      className={cn(className)}
      data-slot="dropdown-menu-trigger"
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
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50 outline-none"
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          className={cn(
            "bg-popover text-popover-foreground ring-popup-ring",
            "data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-closed:animate-out data-open:animate-in",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2",
            "z-50 max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-y-auto overflow-x-hidden rounded-lg p-1 shadow-lg outline-none ring-1 duration-100 data-closed:overflow-hidden",
            className
          )}
          data-size={size}
          data-slot="dropdown-menu-content"
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
      className={cn(
        "px-1.5 py-1 text-muted-foreground text-xs data-[inset]:pl-8",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-label"
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
      className={cn(
        "focus:bg-accent focus:text-accent-foreground",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:*:[svg]:text-destructive",
        "not-data-[variant=destructive]:focus:**:text-accent-foreground",
        `group/dropdown-menu-item relative flex ${POPUP_ITEM_HEIGHT} cursor-pointer select-none items-center gap-1.5 rounded-md px-1.5 text-sm outline-hidden`,
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-[inset]:pl-8 data-disabled:opacity-50",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-item"
      data-variant={variant}
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
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground",
        "not-data-[variant=destructive]:focus:**:text-accent-foreground",
        "data-popup-open:bg-accent data-popup-open:text-accent-foreground",
        `flex ${POPUP_ITEM_HEIGHT} cursor-pointer select-none items-center gap-1.5 rounded-md px-1.5 text-sm outline-hidden data-[inset]:pl-8`,
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-sub-trigger"
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
  extends Omit<
    DropdownMenuContentProps,
    "align" | "alignOffset" | "side" | "sideOffset"
  > {
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
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50 outline-none"
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          className={cn(
            "bg-popover text-popover-foreground ring-popup-ring",
            "data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-closed:animate-out data-open:animate-in",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "z-50 w-auto min-w-24 origin-(--transform-origin) overflow-hidden rounded-md p-1 shadow-lg ring-1 duration-100",
            className
          )}
          data-slot="dropdown-menu-sub-content"
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
      checked={checked}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground",
        variant === "indicator" && "focus:**:text-accent-foreground",
        `relative flex ${POPUP_ITEM_HEIGHT} cursor-pointer select-none items-center gap-1.5 rounded-md text-sm outline-hidden`,
        variant === "indicator" ? "pr-8 pl-1.5" : "px-1.5",
        "data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="dropdown-menu-checkbox-item"
      {...props}
    >
      {variant === "control" ? (
        <Checkbox
          checked={checked ?? false}
          className="pointer-events-none after:hidden focus-visible:outline-none"
          tabIndex={-1}
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
      className={cn(
        "focus:bg-accent focus:text-accent-foreground",
        variant === "indicator" && "focus:**:text-accent-foreground",
        `relative flex ${POPUP_ITEM_HEIGHT} cursor-pointer select-none items-center gap-1.5 rounded-md text-sm outline-hidden`,
        variant === "indicator" ? "pr-8 pl-1.5" : "px-1.5",
        "data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="dropdown-menu-radio-item"
      {...props}
    >
      {variant === "control" ? (
        <span
          className={cn(
            "relative flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border",
            "border-input bg-input-bg text-primary",
            "[[data-checked]_&]:border-primary [[data-checked]_&]:bg-primary [[data-checked]_&]:text-primary-foreground",
            "pointer-events-none"
          )}
          data-slot="dropdown-menu-radio-control"
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
      className={cn("-mx-1 my-1 h-px bg-border-muted", className)}
      data-slot="dropdown-menu-separator"
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
      className={cn(
        "ml-auto text-muted-foreground text-xs tracking-widest group-focus/dropdown-menu-item:text-accent-foreground",
        className
      )}
      data-slot="dropdown-menu-shortcut"
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
