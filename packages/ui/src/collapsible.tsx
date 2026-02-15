"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import * as React from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RenderProp =
  | React.ReactElement
  | ((props: any, state: any) => React.ReactElement);
type ClassNameProp = string | ((state: any) => string);

type CollapsibleRootBaseProps = Omit<
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>,
  "className" | "render"
>;

type CollapsibleTriggerBaseProps = Omit<
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>,
  "className" | "render"
>;

type CollapsiblePanelBaseProps = Omit<
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Panel>,
  "className" | "render" | "keepMounted" | "hiddenUntilFound"
>;

export type CollapsibleProps = CollapsibleRootBaseProps & {
  /** Optional class name or function that returns a class name */
  className?: ClassNameProp;
  /** Optional render function */
  render?: RenderProp;
};

export type CollapsibleTriggerProps = CollapsibleTriggerBaseProps & {
  /** Optional class name or function that returns a class name */
  className?: ClassNameProp;
  /** Optional render function */
  render?: RenderProp;
};

export type CollapsibleContentProps = CollapsiblePanelBaseProps & {
  /** Whether to keep the panel mounted when closed @default false */
  keepMounted?: boolean;
  /** Whether to use hidden="until-found" for browser search @default false */
  hiddenUntilFound?: boolean;
  /** Optional class name or function that returns a class name */
  className?: ClassNameProp;
  /** Optional render function */
  render?: RenderProp;
};

// ---------------------------------------------------------------------------
// Collapsible (root)
// ---------------------------------------------------------------------------

const Collapsible = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.Root>,
  CollapsibleProps
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Root
    className={className}
    data-slot="collapsible"
    ref={ref}
    {...props}
  />
));

Collapsible.displayName = "Collapsible";

// ---------------------------------------------------------------------------
// CollapsibleTrigger
// ---------------------------------------------------------------------------

const CollapsibleTrigger = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.Trigger>,
  CollapsibleTriggerProps
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    className={className}
    data-slot="collapsible-trigger"
    ref={ref}
    {...props}
  />
));

CollapsibleTrigger.displayName = "CollapsibleTrigger";

// ---------------------------------------------------------------------------
// CollapsibleContent
// ---------------------------------------------------------------------------

const CollapsibleContent = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.Panel>,
  CollapsibleContentProps
>(({ className, ...props }, ref) => {
  const baseClasses = cn(
    "overflow-hidden",
    // CSS transition on height — smoothly cancellable mid-animation
    "h-[var(--collapsible-panel-height)] transition-[height] duration-200 ease-out",
    // Enter: start from 0 height
    "data-[starting-style]:h-0",
    // Exit: collapse to 0 height
    "data-[ending-style]:h-0",
    // Respect reduced motion
    "motion-reduce:transition-none"
  );

  return (
    <CollapsiblePrimitive.Panel
      className={cn(baseClasses, className)}
      data-slot="collapsible-content"
      ref={ref}
      {...props}
    />
  );
});

CollapsibleContent.displayName = "CollapsibleContent";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
