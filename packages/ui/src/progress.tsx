"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const progressVariants = cva("", {
  variants: {
    color: {
      default: "[--progress-indicator:var(--primary)]",
      success: "[--progress-indicator:oklch(0.627_0.194_149.214)]", // green-500
      warning: "[--progress-indicator:oklch(0.769_0.188_70.08)]", // amber-500
      destructive: "[--progress-indicator:var(--destructive)]",
    },
  },
  defaultVariants: {
    color: "default",
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProgressColor = NonNullable<
  VariantProps<typeof progressVariants>["color"]
>;

export interface ProgressProps extends ProgressPrimitive.Root.Props {
  /** Color variant of the progress indicator */
  color?: ProgressColor;
}

export interface ProgressTrackProps extends ProgressPrimitive.Track.Props {}
export interface ProgressIndicatorProps
  extends ProgressPrimitive.Indicator.Props {}
export interface ProgressLabelProps extends ProgressPrimitive.Label.Props {}
export interface ProgressValueProps extends ProgressPrimitive.Value.Props {}

// ---------------------------------------------------------------------------
// Progress (Root)
// ---------------------------------------------------------------------------

function Progress({
  className,
  children,
  color = "default",
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "flex w-full flex-col gap-2",
        progressVariants({ color }),
        className
      )}
      {...props}
    >
      {children ?? (
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      )}
    </ProgressPrimitive.Root>
  );
}

// ---------------------------------------------------------------------------
// ProgressTrack
// ---------------------------------------------------------------------------

function ProgressTrack({ className, ...props }: ProgressTrackProps) {
  return (
    <ProgressPrimitive.Track
      data-slot="progress-track"
      className={cn(
        "relative h-1 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ProgressIndicator
// ---------------------------------------------------------------------------

function ProgressIndicator({ className, ...props }: ProgressIndicatorProps) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(
        "h-full rounded-full bg-[var(--progress-indicator)]",
        // Smooth width animation
        "transition-[width] duration-500 ease-out",
        // Indeterminate: animated sliding bar
        "data-[indeterminate]:animate-progress-indeterminate data-[indeterminate]:w-1/3",
        // Reduced motion
        "motion-reduce:transition-none motion-reduce:data-[indeterminate]:animate-none",
        className
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ProgressLabel
// ---------------------------------------------------------------------------

function ProgressLabel({ className, ...props }: ProgressLabelProps) {
  return (
    <ProgressPrimitive.Label
      data-slot="progress-label"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ProgressValue
// ---------------------------------------------------------------------------

function ProgressValue({ className, ...props }: ProgressValueProps) {
  return (
    <ProgressPrimitive.Value
      data-slot="progress-value"
      className={cn("text-sm text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
  progressVariants,
};
