"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { XIcon } from "lucide-react";
import { cva } from "class-variance-authority";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full h-6 px-2.5 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors select-none overflow-hidden shrink-0 has-[[data-slot=avatar]]:pl-1 bg-secondary text-secondary-foreground hover:bg-secondary-hover aria-pressed:bg-primary/10 aria-pressed:text-primary dark:aria-pressed:bg-primary/15 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3 [&_svg]:shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
);

// ---------------------------------------------------------------------------
// Toggle
// ---------------------------------------------------------------------------

export interface ToggleProps extends TogglePrimitive.Props {}

function Toggle({ className, ...props }: ToggleProps) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants(), className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ToggleRemove
// ---------------------------------------------------------------------------

export interface ToggleRemoveProps
  extends React.ComponentPropsWithRef<"button"> {}

function ToggleRemove({
  className,
  children,
  ...props
}: ToggleRemoveProps) {
  return (
    <button
      type="button"
      data-slot="toggle-remove"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 text-current/60 hover:text-current -my-px -ms-0.5 -me-1.5 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]",
        className
      )}
      {...props}
    >
      {children || <XIcon size={10} aria-hidden="true" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Toggle, ToggleRemove, toggleVariants };
