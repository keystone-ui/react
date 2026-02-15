"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cva, type VariantProps } from "class-variance-authority";
import { createContext, useContext, useMemo } from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VIEW_BOX_SIZE = 100;
const STROKE_WIDTH = 8;
const RADIUS = (VIEW_BOX_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const circularProgressVariants = cva("", {
  variants: {
    color: {
      default: "[--progress-indicator:var(--primary)]",
      success: "[--progress-indicator:oklch(0.627_0.194_149.214)]",
      warning: "[--progress-indicator:oklch(0.769_0.188_70.08)]",
      destructive: "[--progress-indicator:var(--destructive)]",
    },
    size: {
      sm: "size-12",
      default: "size-16",
      lg: "size-24",
    },
  },
  defaultVariants: {
    color: "default",
    size: "default",
  },
});

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CircularProgressContextValue {
  value: number | null;
  min: number;
  max: number;
}

const CircularProgressContext = createContext<CircularProgressContextValue>({
  value: 0,
  min: 0,
  max: 100,
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CircularProgressColor = NonNullable<
  VariantProps<typeof circularProgressVariants>["color"]
>;

export type CircularProgressSize = NonNullable<
  VariantProps<typeof circularProgressVariants>["size"]
>;

export interface CircularProgressProps extends ProgressPrimitive.Root.Props {
  /** Color variant of the progress indicator */
  color?: CircularProgressColor;
  /** Size variant */
  size?: CircularProgressSize;
}

export interface CircularProgressTrackProps
  extends React.ComponentProps<"circle"> {}
export interface CircularProgressIndicatorProps
  extends React.ComponentProps<"circle"> {}
export interface CircularProgressValueProps
  extends ProgressPrimitive.Value.Props {}
export interface CircularProgressLabelProps
  extends ProgressPrimitive.Label.Props {}

// ---------------------------------------------------------------------------
// CircularProgress (Root)
// ---------------------------------------------------------------------------

function CircularProgress({
  className,
  children,
  color = "default",
  size = "default",
  value = 0,
  ...props
}: CircularProgressProps) {
  const contextValue = useMemo(
    () => ({
      value: value ?? null,
      min: (props.min as number) ?? 0,
      max: (props.max as number) ?? 100,
    }),
    [value, props.min, props.max]
  );

  return (
    <ProgressPrimitive.Root
      className={cn(
        "group/circular-progress relative inline-flex shrink-0 items-center justify-center",
        circularProgressVariants({ color, size }),
        className
      )}
      data-size={size}
      data-slot="circular-progress"
      value={value}
      {...props}
    >
      <CircularProgressContext.Provider value={contextValue}>
        {children ?? (
          <>
            <CircularProgressTrack />
            <CircularProgressIndicator />
            <CircularProgressValue />
          </>
        )}
      </CircularProgressContext.Provider>
    </ProgressPrimitive.Root>
  );
}

// ---------------------------------------------------------------------------
// CircularProgressTrack
// ---------------------------------------------------------------------------

function CircularProgressTrack({
  className,
  ...props
}: CircularProgressTrackProps) {
  return (
    <svg
      className="absolute inset-0 size-full"
      fill="none"
      viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
    >
      <circle
        className={cn("fill-none stroke-muted", className)}
        cx={VIEW_BOX_SIZE / 2}
        cy={VIEW_BOX_SIZE / 2}
        data-slot="circular-progress-track"
        r={RADIUS}
        strokeWidth={STROKE_WIDTH}
        {...props}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CircularProgressIndicator
// ---------------------------------------------------------------------------

function CircularProgressIndicator({
  className,
  ...props
}: CircularProgressIndicatorProps) {
  const { value, min, max } = useContext(CircularProgressContext);

  const normalizedValue =
    value !== null
      ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
      : null;

  const strokeDashoffset =
    normalizedValue !== null
      ? CIRCUMFERENCE - (normalizedValue / 100) * CIRCUMFERENCE
      : CIRCUMFERENCE * 0.75;

  return (
    <svg
      className={cn(
        "absolute inset-0 size-full -rotate-90",
        value === null && "animate-spin"
      )}
      fill="none"
      viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
    >
      <circle
        className={cn(
          "fill-none stroke-[var(--progress-indicator)]",
          "transition-[stroke-dashoffset] duration-500 ease-out",
          "motion-reduce:transition-none",
          value === null && "motion-reduce:animate-none",
          className
        )}
        cx={VIEW_BOX_SIZE / 2}
        cy={VIEW_BOX_SIZE / 2}
        data-slot="circular-progress-indicator"
        r={RADIUS}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        strokeWidth={STROKE_WIDTH}
        {...props}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CircularProgressValue
// ---------------------------------------------------------------------------

function CircularProgressValue({
  className,
  ...props
}: CircularProgressValueProps) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "relative font-semibold text-foreground tabular-nums",
        "group-data-[size=sm]/circular-progress:text-xs",
        "group-data-[size=default]/circular-progress:text-sm",
        "group-data-[size=lg]/circular-progress:text-lg",
        className
      )}
      data-slot="circular-progress-value"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// CircularProgressLabel
// ---------------------------------------------------------------------------

function CircularProgressLabel({
  className,
  ...props
}: CircularProgressLabelProps) {
  return (
    <ProgressPrimitive.Label
      className={cn(
        "relative text-muted-foreground",
        "group-data-[size=sm]/circular-progress:text-[10px]",
        "group-data-[size=default]/circular-progress:text-xs",
        "group-data-[size=lg]/circular-progress:text-sm",
        className
      )}
      data-slot="circular-progress-label"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  CircularProgress,
  CircularProgressTrack,
  CircularProgressIndicator,
  CircularProgressValue,
  CircularProgressLabel,
  circularProgressVariants,
};
