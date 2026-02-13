"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";

import { cn } from "./utils";
import { toggleVariants, ToggleRemove } from "./toggle";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToggleGroupContext = React.createContext<{
  onRemove?: (value: string) => void;
}>({});

// ---------------------------------------------------------------------------
// ToggleGroup
// ---------------------------------------------------------------------------

export interface ToggleGroupProps extends ToggleGroupPrimitive.Props {
  /** Callback fired when a toggle item's remove button is clicked */
  onRemove?: (value: string) => void;
}

function ToggleGroup({
  className,
  onRemove,
  children,
  ...props
}: ToggleGroupProps) {
  const contextValue = React.useMemo(() => ({ onRemove }), [onRemove]);

  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn("flex flex-wrap gap-1.5", className)}
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

export interface ToggleGroupItemProps extends TogglePrimitive.Props {
  /** Unique value identifying this toggle within the group */
  value: string;
}

function ToggleGroupItem({
  className,
  value,
  children,
  ...props
}: ToggleGroupItemProps) {
  const { onRemove } = React.useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      value={value}
      className={cn(toggleVariants(), className)}
      {...props}
    >
      {children}
      {onRemove && (
        <ToggleRemove
          onClick={(e) => {
            e.stopPropagation();
            onRemove(value);
          }}
        />
      )}
    </TogglePrimitive>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { ToggleGroup, ToggleGroupItem };
