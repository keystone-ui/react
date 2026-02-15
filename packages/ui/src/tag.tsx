"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva } from "class-variance-authority";
import { XIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const tagVariants = cva(
  "inline-flex h-6 shrink-0 cursor-pointer select-none items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full bg-secondary px-2.5 font-medium text-secondary-foreground text-xs transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 has-[[data-slot=avatar]]:pl-1 aria-pressed:bg-primary/10 aria-pressed:text-primary dark:aria-pressed:bg-primary/15 [&_svg:not([class*='size-'])]:size-3 [&_svg]:pointer-events-none [&_svg]:shrink-0"
);

// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------

export interface TagProps extends TogglePrimitive.Props {}

function Tag({ className, ...props }: TagProps) {
  return (
    <TogglePrimitive
      className={cn(tagVariants(), className)}
      data-slot="tag"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// TagRemove
// ---------------------------------------------------------------------------

export interface TagRemoveProps extends React.ComponentPropsWithRef<"button"> {}

function TagRemove({ className, children, ...props }: TagRemoveProps) {
  return (
    <button
      className={cn(
        "-my-px -ms-0.5 -me-1.5 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 text-current/60 outline-none transition-[color,box-shadow] hover:text-current focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2",
        className
      )}
      data-slot="tag-remove"
      type="button"
      {...props}
    >
      {children || <XIcon aria-hidden="true" size={10} />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Tag, TagRemove, tagVariants };
