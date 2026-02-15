"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import * as React from "react";
import { TagRemove, tagVariants } from "./tag";
import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TagGroupContext = React.createContext<{
  onRemove?: (value: string) => void;
}>({});

// ---------------------------------------------------------------------------
// TagGroup
// ---------------------------------------------------------------------------

export interface TagGroupProps extends ToggleGroupPrimitive.Props {
  /** Callback fired when a tag item's remove button is clicked */
  onRemove?: (value: string) => void;
}

function TagGroup({ className, onRemove, children, ...props }: TagGroupProps) {
  const contextValue = React.useMemo(() => ({ onRemove }), [onRemove]);

  return (
    <ToggleGroupPrimitive
      className={cn("flex flex-wrap gap-1.5", className)}
      data-slot="tag-group"
      {...props}
    >
      <TagGroupContext.Provider value={contextValue}>
        {children}
      </TagGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

// ---------------------------------------------------------------------------
// TagGroupItem
// ---------------------------------------------------------------------------

export interface TagGroupItemProps extends TogglePrimitive.Props {
  /** Unique value identifying this tag within the group */
  value: string;
}

function TagGroupItem({
  className,
  value,
  children,
  ...props
}: TagGroupItemProps) {
  const { onRemove } = React.useContext(TagGroupContext);

  return (
    <TogglePrimitive
      className={cn(tagVariants(), className)}
      data-slot="tag-group-item"
      value={value}
      {...props}
    >
      {children}
      {onRemove && (
        <TagRemove
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

export { TagGroup, TagGroupItem };
