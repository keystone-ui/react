"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { toggleVariants } from "./toggle";
import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type ToggleGroupContextValue = VariantProps<typeof toggleVariants>;

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  variant: "default",
  size: "default",
});

// ---------------------------------------------------------------------------
// ToggleGroup
// ---------------------------------------------------------------------------

export interface ToggleGroupProps
  extends ToggleGroupPrimitive.Props,
    ToggleGroupContextValue {}

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: ToggleGroupProps) {
  const contextValue = React.useMemo(
    () => ({ variant, size }),
    [variant, size]
  );

  return (
    <ToggleGroupPrimitive
      className={cn("flex items-center gap-1", className)}
      data-slot="toggle-group"
      {...props}
    >
      <ToggleGroupContext.Provider value={contextValue}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

// ---------------------------------------------------------------------------
// ToggleGroupItem
// ---------------------------------------------------------------------------

export interface ToggleGroupItemProps
  extends TogglePrimitive.Props,
    ToggleGroupContextValue {
  /** Unique value identifying this toggle within the group */
  value: string;
}

function ToggleGroupItem({
  className,
  variant,
  size,
  value,
  children,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext);
  const resolvedVariant = variant ?? context.variant;
  const resolvedSize = size ?? context.size;

  return (
    <TogglePrimitive
      className={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        className
      )}
      data-slot="toggle-group-item"
      value={value}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { ToggleGroup, ToggleGroupItem };
