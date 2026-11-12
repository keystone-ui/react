"use client";

import type { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { createContext, useContext, useMemo } from "react";
import { Tag, TagRemove } from "./tag";
import { mergeClassName } from "./utils";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TagGroupContext = createContext<{
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
  const contextValue = useMemo(() => ({ onRemove }), [onRemove]);

  return (
    <ToggleGroupPrimitive
      className={mergeClassName("flex flex-wrap gap-1.5", className)}
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
  const { onRemove } = useContext(TagGroupContext);

  // Rendered through Tag so a long label gets Tag's ellipsizing span and the
  // remove button stays inside the pill. `data-slot` overrides Tag's own.
  return (
    <Tag
      className={className}
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
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { TagGroup, TagGroupItem };
