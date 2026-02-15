"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "./utils";

// =============================================================================
// TooltipProvider
// =============================================================================
export interface TooltipProviderProps extends TooltipPrimitive.Provider.Props {}

function TooltipProvider({ delay = 0, ...props }: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  );
}

// =============================================================================
// Tooltip (Root)
// =============================================================================
function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

// =============================================================================
// TooltipTrigger
// =============================================================================
export interface TooltipTriggerProps extends TooltipPrimitive.Trigger.Props {}

function TooltipTrigger({ className, ...props }: TooltipTriggerProps) {
  return (
    <TooltipPrimitive.Trigger
      className={className}
      data-slot="tooltip-trigger"
      {...props}
    />
  );
}

// =============================================================================
// TooltipContent
// =============================================================================
export interface TooltipContentProps extends TooltipPrimitive.Popup.Props {
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
   * Side of the trigger to position the tooltip
   * @default "top"
   */
  side?: "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  /**
   * Offset from the trigger
   * @default 4
   */
  sideOffset?: number;
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <TooltipPrimitive.Popup
          className={cn(
            "bg-foreground text-background",
            "data-closed:animate-out data-open:animate-in",
            "data-open:fade-in-0 data-closed:fade-out-0",
            "data-open:zoom-in-95 data-closed:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2",
            "z-50 w-fit max-w-xs origin-(--transform-origin) rounded-md px-3 py-1.5 text-xs",
            className
          )}
          data-slot="tooltip-content"
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow
            className={cn(
              "z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground",
              "data-[side=bottom]:top-1",
              "data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2",
              "data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2",
              "data-[side=top]:-bottom-2.5",
              "data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2",
              "data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2"
            )}
          />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

// =============================================================================
// Exports
// =============================================================================
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

export type { TooltipRootProps as TooltipProps } from "@base-ui/react/tooltip";
