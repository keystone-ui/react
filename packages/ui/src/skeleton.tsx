import type * as React from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SkeletonProps extends React.ComponentProps<"div"> {
  /**
   * The animation style of the skeleton.
   * @default "pulse"
   */
  animationType?: "pulse" | "none";
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function Skeleton({
  className,
  animationType = "pulse",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-accent",
        animationType === "pulse" && "animate-pulse",
        className
      )}
      data-slot="skeleton"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SkeletonGroup
// ---------------------------------------------------------------------------

function SkeletonGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "before:pointer-events-none before:absolute before:inset-0 before:z-10",
        "before:bg-[linear-gradient(90deg,transparent_25%,var(--skeleton-shimmer)_50%,transparent_75%)]",
        "before:animate-skeleton-shimmer before:bg-[length:300%_100%]",
        className
      )}
      data-slot="skeleton-group"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Skeleton, SkeletonGroup };
export type { SkeletonProps };
