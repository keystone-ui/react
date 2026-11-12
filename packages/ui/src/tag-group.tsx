"use client";

import type { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import type * as React from "react";
import { createContext, useContext, useMemo } from "react";
import { flushSync } from "react-dom";
import { Tag, TagRemove } from "./tag";
import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type Orientation = NonNullable<ToggleGroupPrimitive.Props["orientation"]>;

const TagGroupContext = createContext<{
  onRemove?: (value: string) => void;
  orientation: Orientation;
}>({ orientation: "horizontal" });

// ---------------------------------------------------------------------------
// TagGroup
// ---------------------------------------------------------------------------

export interface TagGroupProps extends ToggleGroupPrimitive.Props {
  /** Callback fired when a tag item's remove button is clicked */
  onRemove?: (value: string) => void;
}

function TagGroup({ className, onRemove, children, ...props }: TagGroupProps) {
  const orientation = props.orientation ?? "horizontal";
  const contextValue = useMemo(
    () => ({ onRemove, orientation }),
    [onRemove, orientation]
  );

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

/** The keys the group's own handler moves focus with, per orientation. */
const NAVIGATION_KEYS: Record<Orientation, readonly string[]> = {
  horizontal: ["ArrowLeft", "ArrowRight", "Home", "End"],
  vertical: ["ArrowUp", "ArrowDown", "Home", "End"],
};

/**
 * Keys pressed on an item's remove button act from that item's toggle, as
 * they did when the X sat inside it. Shift+Tab goes to the toggle. For the
 * group's navigation keys the toggle is focused first, synchronously, so that
 * Base UI's own focus handling makes it the group's current item; the event
 * then reaches the group's key handler, which moves on from it with the
 * group's orientation, direction, disabled items and `loopFocus`.
 */
function handleRemoveKeyDown(
  event: React.KeyboardEvent<HTMLButtonElement>,
  orientation: Orientation
) {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }
  const toggle = event.currentTarget.parentElement?.querySelector<HTMLElement>(
    ':scope > [data-slot="tag-toggle"]'
  );
  if (!toggle) {
    return;
  }
  if (event.key === "Tab" && event.shiftKey) {
    event.preventDefault();
    toggle.focus();
    return;
  }
  if (!event.shiftKey && NAVIGATION_KEYS[orientation].includes(event.key)) {
    flushSync(() => toggle.focus());
  }
}

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
  const { onRemove, orientation } = useContext(TagGroupContext);

  // Rendered through Tag so a long label gets Tag's ellipsizing span. With
  // `onRemove` the X is Tag's `remove`: a sibling of the toggle inside the
  // pill. `data-slot` overrides Tag's own.
  return (
    <Tag
      className={className}
      data-slot="tag-group-item"
      remove={
        onRemove ? (
          <TagRemove
            onClick={() => onRemove(value)}
            onKeyDown={(event) => handleRemoveKeyDown(event, orientation)}
          />
        ) : undefined
      }
      value={value}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { TagGroup, TagGroupItem };
