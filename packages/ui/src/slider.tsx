"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "./utils";

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
      className={cn("flex w-full flex-col gap-2", className)}
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
      className={cn(
        "flex touch-none select-none items-center py-2",
        // Cursor
        "cursor-pointer data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
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
      className={cn("relative h-1 w-full rounded-full bg-muted", className)}
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
      className={cn("h-full rounded-full bg-primary", className)}
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
      className={cn(
        // Horizontal pill / capsule shape (20x13), centered on track
        "h-[0.8125rem] w-[1.25rem] -translate-y-1/2 rounded-full bg-background",
        // Soft elevated shadow
        "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.08)]",
        // Focus ring
        "focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2",
        // Active state: slightly grow + slightly deeper shadow (NOT left — must stay instant)
        "transition-[transform,box-shadow] duration-150",
        "data-[dragging]:scale-105 data-[dragging]:shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.12)]",
        // Disabled
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        // Reduced motion
        "motion-reduce:transition-none",
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
      className={cn("text-muted-foreground text-sm tabular-nums", className)}
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
  SliderTrack,
  SliderIndicator,
  SliderThumb,
  SliderValue,
};
