"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { cn } from "../utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../input/input-group";
import { Button } from "../button";

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
      data-slot="combobox-trigger"
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />
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
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
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
   * Show the dropdown trigger button
   * @default true
   */
  showTrigger?: boolean;
  /**
   * Show the clear button when a value is selected
   * @default false
   */
  showClear?: boolean;
  /**
   * Children to render inside the input group (e.g., InputGroupAddon)
   */
  children?: React.ReactNode;
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
            size="icon-xs"
            variant="ghost"
            render={<ComboboxTrigger />}
            data-slot="combobox-trigger-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
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
}

function ComboboxContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxContentProps) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            "bg-popover text-popover-foreground ring-border/10",
            "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2",
            "group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))]",
            "origin-(--transform-origin) overflow-hidden rounded-lg shadow-lg ring-1 duration-100",
            "data-[chips=true]:min-w-(--anchor-width)",
            "*:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-10 *:data-[slot=input-group]:shadow-none",
            className
          )}
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
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className
      )}
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
      data-slot="combobox-item"
      className={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground",
        "relative flex h-9 w-full cursor-pointer items-center gap-1.5 rounded-md pr-8 pl-1.5 text-sm outline-hidden select-none",
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
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
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  );
}

// =============================================================================
// ComboboxLabel
// =============================================================================
export interface ComboboxLabelProps extends ComboboxPrimitive.GroupLabel.Props {}

function ComboboxLabel({ className, ...props }: ComboboxLabelProps) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
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
      data-slot="combobox-empty"
      className={cn(
        "text-muted-foreground hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex",
        className
      )}
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
      data-slot="combobox-separator"
      className={cn("bg-border/50 -mx-1 my-1 h-px", className)}
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
        ref={ref}
        data-slot="combobox-chips"
        className={cn(
          "border-input dark:bg-input/30 flex min-h-10 flex-wrap items-center gap-1 rounded-md border bg-transparent bg-clip-padding px-2.5 py-1 text-sm shadow-xs transition-colors",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-1",
          "has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive dark:has-aria-invalid:border-destructive/50 has-aria-invalid:ring-1",
          "has-data-[slot=combobox-chip]:px-1",
          className
        )}
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
      data-slot="combobox-chip"
      className={cn(
        "bg-muted text-foreground flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap",
        "has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
        "has-data-[slot=combobox-chip-remove]:pr-0",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon" />}
          className="-ml-1 size-5 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
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
export interface ComboboxChipsInputProps extends ComboboxPrimitive.Input.Props {}

function ComboboxChipsInput({ className, ...props }: ComboboxChipsInputProps) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chips-input"
      className={cn("min-w-16 flex-1 outline-none", className)}
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
