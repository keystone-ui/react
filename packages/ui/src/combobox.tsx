"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";
import { cn, POPUP_ITEM_HEIGHT } from "./utils";

// =============================================================================
// Combobox (Root)
// =============================================================================
const Combobox = ComboboxPrimitive.Root;

// =============================================================================
// ComboboxValue
// =============================================================================
export interface ComboboxValueProps extends ComboboxPrimitive.Value.Props {}

function ComboboxValue({ ...props }: ComboboxValueProps) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

// =============================================================================
// ComboboxTrigger
// =============================================================================
export interface ComboboxTriggerProps extends ComboboxPrimitive.Trigger.Props {}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxTriggerProps) {
  return (
    <ComboboxPrimitive.Trigger
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      data-slot="combobox-trigger"
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  );
}

// =============================================================================
// ComboboxClear
// =============================================================================
export interface ComboboxClearProps extends ComboboxPrimitive.Clear.Props {}

function ComboboxClear({ className, ...props }: ComboboxClearProps) {
  return (
    <ComboboxPrimitive.Clear
      className={cn(className)}
      data-slot="combobox-clear"
      render={<InputGroupButton size="icon-xs" variant="ghost" />}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  );
}

// =============================================================================
// ComboboxInput
// =============================================================================
export interface ComboboxInputProps extends ComboboxPrimitive.Input.Props {
  /**
   * Children to render inside the input group (e.g., InputGroupAddon)
   */
  children?: React.ReactNode;
  /**
   * Show the clear button when a value is selected
   * @default false
   */
  showClear?: boolean;
  /**
   * Show the dropdown trigger button
   * @default true
   */
  showTrigger?: boolean;
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxInputProps) {
  return (
    <InputGroup className={cn("w-auto", className)}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            data-slot="combobox-trigger-button"
            disabled={disabled}
            render={<ComboboxTrigger />}
            size="icon-xs"
            variant="ghost"
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

// =============================================================================
// ComboboxContent
// =============================================================================
export interface ComboboxContentProps extends ComboboxPrimitive.Popup.Props {
  /**
   * Alignment of the content
   * @default "start"
   */
  align?: "start" | "center" | "end";
  /**
   * Offset along the alignment axis
   * @default 0
   */
  alignOffset?: number;
  /**
   * Custom anchor element (used for chips mode)
   */
  anchor?: React.RefObject<HTMLElement | null>;
  /**
   * Side of the trigger to position the popup
   * @default "bottom"
   */
  side?: "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  /**
   * Offset from the trigger
   * @default 6
   */
  sideOffset?: number;
  /**
   * Size of the menu items
   * @default "default"
   */
  size?: "default" | "compact";
}

function ComboboxContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  size = "default",
  ...props
}: ComboboxContentProps) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <ComboboxPrimitive.Popup
          className={cn(
            "bg-popover text-popover-foreground ring-popup-ring",
            "data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-closed:animate-out data-open:animate-in motion-reduce:animate-none",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2",
            "group/combobox-content relative max-h-(--available-height) w-(--anchor-width) min-w-[calc(var(--anchor-width)+--spacing(7))] max-w-(--available-width)",
            "origin-(--transform-origin) overflow-hidden rounded-lg shadow-lg ring-1 duration-100",
            "data-[chips=true]:min-w-(--anchor-width)",
            "*:data-[slot=input-group]:!border-0 *:data-[slot=input-group]:!shadow-none *:data-[slot=input-group]:!ring-0 *:data-[slot=input-group]:rounded-none *:data-[slot=input-group]:bg-transparent",
            className
          )}
          data-chips={!!anchor}
          data-size={size}
          data-slot="combobox-content"
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

// =============================================================================
// ComboboxList
// =============================================================================
export interface ComboboxListProps extends ComboboxPrimitive.List.Props {}

function ComboboxList({ className, ...props }: ComboboxListProps) {
  return (
    <ComboboxPrimitive.List
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className
      )}
      data-slot="combobox-list"
      {...props}
    />
  );
}

// =============================================================================
// ComboboxItem
// =============================================================================
export interface ComboboxItemProps extends ComboboxPrimitive.Item.Props {
  children: React.ReactNode;
}

function ComboboxItem({ className, children, ...props }: ComboboxItemProps) {
  return (
    <ComboboxPrimitive.Item
      className={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground",
        `relative flex ${POPUP_ITEM_HEIGHT} w-full cursor-pointer select-none items-center gap-1.5 rounded-md pr-8 pl-1.5 text-sm outline-hidden`,
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="combobox-item"
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

// =============================================================================
// ComboboxGroup
// =============================================================================
export interface ComboboxGroupProps extends ComboboxPrimitive.Group.Props {}

function ComboboxGroup({ className, ...props }: ComboboxGroupProps) {
  return (
    <ComboboxPrimitive.Group
      className={cn(className)}
      data-slot="combobox-group"
      {...props}
    />
  );
}

// =============================================================================
// ComboboxLabel
// =============================================================================
export interface ComboboxLabelProps
  extends ComboboxPrimitive.GroupLabel.Props {}

function ComboboxLabel({ className, ...props }: ComboboxLabelProps) {
  return (
    <ComboboxPrimitive.GroupLabel
      className={cn("px-1.5 py-1 text-muted-foreground text-xs", className)}
      data-slot="combobox-label"
      {...props}
    />
  );
}

// =============================================================================
// ComboboxCollection
// =============================================================================
export interface ComboboxCollectionProps
  extends ComboboxPrimitive.Collection.Props {}

function ComboboxCollection({ ...props }: ComboboxCollectionProps) {
  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
  );
}

// =============================================================================
// ComboboxEmpty
// =============================================================================
export interface ComboboxEmptyProps extends ComboboxPrimitive.Empty.Props {}

function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return (
    <ComboboxPrimitive.Empty
      className={cn(
        "hidden w-full justify-center py-2 text-center text-muted-foreground text-sm group-data-empty/combobox-content:flex",
        className
      )}
      data-slot="combobox-empty"
      {...props}
    />
  );
}

// =============================================================================
// ComboboxSeparator
// =============================================================================
export interface ComboboxSeparatorProps
  extends ComboboxPrimitive.Separator.Props {}

function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  return (
    <ComboboxPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border-muted", className)}
      data-slot="combobox-separator"
      {...props}
    />
  );
}

// =============================================================================
// ComboboxChips
// =============================================================================
export interface ComboboxChipsProps
  extends React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips>,
    ComboboxPrimitive.Chips.Props {}

const ComboboxChips = React.forwardRef<HTMLDivElement, ComboboxChipsProps>(
  ({ className, ...props }, ref) => {
    return (
      <ComboboxPrimitive.Chips
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1 rounded-md border border-input bg-input-bg bg-clip-padding px-2.5 py-1 text-sm shadow-xs transition-colors",
          "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50",
          "has-aria-invalid:border-destructive has-aria-invalid:ring-1 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
          "has-data-[slot=combobox-chip]:px-1",
          className
        )}
        data-slot="combobox-chips"
        ref={ref}
        {...props}
      />
    );
  }
);
ComboboxChips.displayName = "ComboboxChips";

// =============================================================================
// ComboboxChip
// =============================================================================
export interface ComboboxChipProps extends ComboboxPrimitive.Chip.Props {
  /**
   * Show the remove button on the chip
   * @default true
   */
  showRemove?: boolean;
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxChipProps) {
  return (
    <ComboboxPrimitive.Chip
      className={cn(
        "flex h-5.5 w-fit items-center justify-center gap-1 whitespace-nowrap rounded-sm bg-muted px-1.5 font-medium text-foreground text-xs",
        "has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
        "has-data-[slot=combobox-chip-remove]:pr-0",
        className
      )}
      data-slot="combobox-chip"
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          className="-ml-1 size-5 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
          render={<Button size="icon" variant="ghost" />}
        >
          <XIcon className="pointer-events-none size-3" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

// =============================================================================
// ComboboxChipsInput
// =============================================================================
export interface ComboboxChipsInputProps
  extends ComboboxPrimitive.Input.Props {}

function ComboboxChipsInput({ className, ...props }: ComboboxChipsInputProps) {
  return (
    <ComboboxPrimitive.Input
      className={cn("min-w-16 flex-1 outline-none", className)}
      data-slot="combobox-chips-input"
      {...props}
    />
  );
}

// =============================================================================
// useComboboxAnchor Hook
// =============================================================================
function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

// =============================================================================
// Exports
// =============================================================================
export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};

export type { ComboboxRootProps as ComboboxProps } from "@base-ui/react/combobox";
