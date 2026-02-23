"use client";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import type * as React from "react";
import { cn } from "./utils";

// =============================================================================
// Avatar (Root)
// =============================================================================
export interface AvatarProps extends AvatarPrimitive.Root.Props {
  /**
   * Size variant of the avatar
   * @default "default"
   */
  size?: "xs" | "default" | "sm" | "lg";
}

function Avatar({ className, size = "default", ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "group/avatar relative flex size-8 shrink-0 select-none rounded-full data-[size=lg]:size-10 data-[size=sm]:size-6 data-[size=xs]:size-4",
        className
      )}
      data-size={size}
      data-slot="avatar"
      {...props}
    />
  );
}

// =============================================================================
// AvatarImage
// =============================================================================
export interface AvatarImageProps extends AvatarPrimitive.Image.Props {}

function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      data-slot="avatar-image"
      {...props}
    />
  );
}

// =============================================================================
// AvatarFallback
// =============================================================================
export interface AvatarFallbackProps extends AvatarPrimitive.Fallback.Props {}

function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground text-sm group-data-[size=sm]/avatar:text-xs group-data-[size=xs]/avatar:text-[8px]",
        className
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

// =============================================================================
// AvatarBadge
// =============================================================================
export interface AvatarBadgeProps extends React.ComponentProps<"span"> {}

function AvatarBadge({ className, ...props }: AvatarBadgeProps) {
  return (
    <span
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex select-none items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background",
        "group-data-[size=xs]/avatar:size-1.5 group-data-[size=xs]/avatar:[&>svg]:hidden",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      data-slot="avatar-badge"
      {...props}
    />
  );
}

// =============================================================================
// AvatarGroup
// =============================================================================
export interface AvatarGroupProps extends React.ComponentProps<"div"> {}

function AvatarGroup({ className, ...props }: AvatarGroupProps) {
  return (
    <div
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      data-slot="avatar-group"
      {...props}
    />
  );
}

// =============================================================================
// AvatarGroupCount
// =============================================================================
export interface AvatarGroupCountProps extends React.ComponentProps<"div"> {}

function AvatarGroupCount({ className, ...props }: AvatarGroupCountProps) {
  return (
    <div
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      data-slot="avatar-group-count"
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
};
