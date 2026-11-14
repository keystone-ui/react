"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn, mergeClassName } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SliderProps extends SliderPrimitive.Root.Props {}
export interface SliderControlProps extends SliderPrimitive.Control.Props {}
export interface SliderTrackProps extends SliderPrimitive.Track.Props {}
export interface SliderIndicatorProps extends SliderPrimitive.Indicator.Props {}
export interface SliderThumbProps extends SliderPrimitive.Thumb.Props {}
export interface SliderValueProps extends SliderPrimitive.Value.Props {}

// ---------------------------------------------------------------------------
// Slider (Root)
// ---------------------------------------------------------------------------

function Slider({ className, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={mergeClassName("flex w-full flex-col gap-2", className)}
      data-slot="slider"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SliderControl
// ---------------------------------------------------------------------------

function SliderControl({ className, ...props }: SliderControlProps) {
  return (
    <SliderPrimitive.Control
      className={mergeClassName(
        cn(
          "flex touch-none select-none items-center py-2",
          // Cursor
          "cursor-pointer data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
        ),
        className
      )}
      data-slot="slider-control"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SliderTrack
// ---------------------------------------------------------------------------

function SliderTrack({ className, ...props }: SliderTrackProps) {
  return (
    <SliderPrimitive.Track
      className={mergeClassName(
        "relative h-1 w-full rounded-full bg-muted",
        className
      )}
      data-slot="slider-track"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SliderIndicator
// ---------------------------------------------------------------------------

function SliderIndicator({ className, ...props }: SliderIndicatorProps) {
  return (
    <SliderPrimitive.Indicator
      className={mergeClassName("h-full rounded-full bg-primary", className)}
      data-slot="slider-indicator"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SliderThumb
// ---------------------------------------------------------------------------

function SliderThumb({ className, ...props }: SliderThumbProps) {
  return (
    <SliderPrimitive.Thumb
      className={mergeClassName(
        cn(
          // Horizontal pill / capsule shape (20x13), centered on track
          "h-[0.8125rem] w-[1.25rem] -translate-y-1/2 rounded-full bg-background dark:bg-white",
          // Soft elevated shadow
          "shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.08)]",
          // Hover ring
          "hover:ring-2 hover:ring-ring/20",
          // Focus ring
          "focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2",
          // Active state: slightly grow + slightly deeper shadow
          "transition-[scale,box-shadow] duration-(--duration-fast,125ms) ease-(--ease-ks-out,cubic-bezier(0.23,1,0.32,1))",
          "data-[dragging]:scale-105 data-[dragging]:shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.12)] data-[dragging]:ring-2 data-[dragging]:ring-ring/20",
          // Disabled (reduced motion handled globally by base.css). No opacity
          // here: Base UI sets the thumb's data-disabled only from the root, so
          // SliderControl is dimmed whenever it is, and the thumb (always inside
          // the control) inherits that 50%.
          "data-[disabled]:pointer-events-none"
        ),
        className
      )}
      data-slot="slider-thumb"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SliderValue
// ---------------------------------------------------------------------------

function SliderValue({ className, ...props }: SliderValueProps) {
  return (
    <SliderPrimitive.Value
      className={mergeClassName(
        "text-muted-foreground text-sm tabular-nums",
        className
      )}
      data-slot="slider-value"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
};
