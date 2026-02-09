"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "./utils";

// =============================================================================
// Popover (Root)
// =============================================================================
function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

// =============================================================================
// PopoverTrigger
// =============================================================================
export interface PopoverTriggerProps extends PopoverPrimitive.Trigger.Props {}

function PopoverTrigger({ className, ...props }: PopoverTriggerProps) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={className}
      {...props}
    />
  );
}

// =============================================================================
// PopoverContent
// =============================================================================
export interface PopoverContentProps extends PopoverPrimitive.Popup.Props {
  /**
   * Alignment of the content relative to the trigger
   * @default "center"
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
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50 outline-none"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "bg-popover text-popover-foreground ring-popup-ring",
            "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0",
            "data-closed:zoom-out-95 data-open:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2",
            "z-50 max-h-(--available-height) w-72 origin-(--transform-origin) overflow-auto rounded-lg p-4 shadow-lg ring-1",
            "duration-100 outline-none",
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

// =============================================================================
// PopoverHeader
// =============================================================================
export interface PopoverHeaderProps extends React.ComponentProps<"div"> {}

function PopoverHeader({ className, ...props }: PopoverHeaderProps) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 pb-2", className)}
      {...props}
    />
  );
}

// =============================================================================
// PopoverTitle
// =============================================================================
export interface PopoverTitleProps extends PopoverPrimitive.Title.Props {}

function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

// =============================================================================
// PopoverDescription
// =============================================================================
export interface PopoverDescriptionProps
  extends PopoverPrimitive.Description.Props {}

function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

// =============================================================================
// PopoverClose
// =============================================================================
export interface PopoverCloseProps extends PopoverPrimitive.Close.Props {}

function PopoverClose({ className, ...props }: PopoverCloseProps) {
  return (
    <PopoverPrimitive.Close
      data-slot="popover-close"
      className={className}
      {...props}
    />
  );
}

// =============================================================================
// PopoverArrow
// =============================================================================
export interface PopoverArrowProps extends PopoverPrimitive.Arrow.Props {}

function PopoverArrow({ className, children, ...props }: PopoverArrowProps) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      className={cn(
        "data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180",
        className,
      )}
      {...props}
    >
      {children ?? <PopoverArrowSvg />}
    </PopoverPrimitive.Arrow>
  );
}

function PopoverArrowSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-popover"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-popup-ring dark:fill-none"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="fill-none dark:fill-popup-ring"
      />
    </svg>
  );
}

// =============================================================================
// Exports
// =============================================================================
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
  PopoverArrow,
};

export type { PopoverRootProps as PopoverProps } from "@base-ui/react/popover";
