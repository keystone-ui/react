import * as React from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SkeletonProps extends React.ComponentProps<"div"> {
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
      data-slot="skeleton"
      className={cn(
        "bg-accent rounded-md",
        animationType === "pulse" && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SkeletonGroup
// ---------------------------------------------------------------------------

function SkeletonGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton-group"
      className={cn(
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:z-10 before:pointer-events-none",
        "before:bg-[linear-gradient(90deg,transparent_25%,var(--skeleton-shimmer)_50%,transparent_75%)]",
        "before:bg-[length:300%_100%] before:animate-skeleton-shimmer",
        className
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Skeleton, SkeletonGroup };
export type { SkeletonProps };
