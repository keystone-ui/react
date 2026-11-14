"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva } from "class-variance-authority";
import { X as XIcon } from "lucide-react";
import type * as React from "react";
import { Children } from "react";

import { cn } from "./utils";

/** Spaces, tabs and line breaks: what CSS collapses. Not `\s`, which has NBSP. */
const COLLAPSIBLE_WHITESPACE = /^[ \t\n\r\f]+$/;

/**
 * Wraps bare text children in a span that can ellipsize. A flex row cannot
 * ellipsize its own text — it sits in an anonymous flex item — and a
 * fixed-height row has nowhere to wrap it to. Adjacent strings and numbers
 * (`{count} items`) share one span; elements pass through untouched.
 *
 * A run of only collapsible whitespace (the `{" "}` JSX puts between an icon
 * and a label) passes through bare: as an anonymous flex item layout ignores
 * it, whereas a span would be one more item and add a second gap. A
 * non-breaking space is content, so it is not in the pattern and stays wrapped.
 */
function wrapText(
  children: React.ReactNode,
  className: string
): React.ReactNode {
  const out: React.ReactNode[] = [];
  let text = "";
  const flush = () => {
    if (COLLAPSIBLE_WHITESPACE.test(text)) {
      out.push(text);
      text = "";
    } else if (text) {
      out.push(
        <span className={className} key={`text-${out.length}`}>
          {text}
        </span>
      );
      text = "";
    }
  };
  for (const child of Children.toArray(children)) {
    if (typeof child === "string" || typeof child === "number") {
      text += child;
    } else {
      flush();
      out.push(child);
    }
  }
  flush();
  return out;
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const tagVariants = cva(
  "inline-flex h-6 min-w-0 max-w-full cursor-pointer touch-manipulation select-none items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full bg-secondary px-2.5 font-medium text-secondary-foreground text-xs transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 has-[[data-slot=avatar]]:pl-1 aria-pressed:bg-primary/10 aria-pressed:text-primary dark:aria-pressed:bg-primary/15 [&_svg:not([class*='size-'])]:size-3 [&_svg]:pointer-events-none [&_svg]:shrink-0"
);

// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------

export interface TagProps extends TogglePrimitive.Props {}

function Tag({ className, children, ...props }: TagProps) {
  return (
    <TogglePrimitive
      className={cn(tagVariants(), className)}
      data-slot="tag"
      {...props}
    >
      {wrapText(children, "min-w-0 truncate")}
    </TogglePrimitive>
  );
}

// ---------------------------------------------------------------------------
// TagRemove
// ---------------------------------------------------------------------------

export interface TagRemoveProps extends React.ComponentPropsWithRef<"button"> {}

function TagRemove({
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: TagRemoveProps) {
  const hasCustomChildren = !!children;
  return (
    <button
      aria-label={ariaLabel ?? (hasCustomChildren ? undefined : "Remove")}
      className={cn(
        "relative -my-px -ms-0.5 -me-1.5 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 text-current/60 transition-[color] before:absolute before:-inset-3.5 before:content-[''] hover:text-current focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2",
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
