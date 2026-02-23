"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import type { VariantProps } from "class-variance-authority";
import { type CSSProperties, createContext, useContext, useMemo } from "react";
import { toggleVariants } from "./toggle";
import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> & {
  spacing?: number;
  orientation?: "horizontal" | "vertical";
};

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  variant: "default",
  size: "default",
  spacing: 0,
  orientation: "horizontal",
});

// ---------------------------------------------------------------------------
// ToggleGroup
// ---------------------------------------------------------------------------

export interface ToggleGroupProps
  extends ToggleGroupPrimitive.Props,
    VariantProps<typeof toggleVariants> {
  /**
   * The layout direction of the toggle group.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * The size applied to all items in the group.
   * @default "default"
   */
  size?: "sm" | "default" | "lg";
  /**
   * Gap between items using the spacing scale. When `0`, items join
   * together with connected borders (like ButtonGroup).
   * @default 0
   */
  spacing?: number;
  /**
   * The visual style applied to all items in the group.
   * @default "default"
   */
  variant?: "default" | "outline";
}

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  orientation = "horizontal",
  children,
  style,
  ...props
}: ToggleGroupProps) {
  const contextValue = useMemo(
    () => ({ variant, size, spacing, orientation }),
    [variant, size, spacing, orientation]
  );

  return (
    <ToggleGroupPrimitive
      className={cn(
        "group/toggle-group flex w-fit items-center",
        spacing === 0 && "rounded-lg",
        spacing === 0 &&
          size === "sm" &&
          "rounded-[min(var(--radius-md),10px)]",
        orientation === "vertical" && "flex-col items-stretch",
        className
      )}
      data-orientation={orientation}
      data-slot="toggle-group"
      style={
        spacing > 0
          ? ({ ...style, gap: `${spacing * 0.25}rem` } as CSSProperties)
          : style
      }
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
    VariantProps<typeof toggleVariants> {
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
  const context = useContext(ToggleGroupContext);
  const resolvedVariant = variant ?? context.variant;
  const resolvedSize = size ?? context.size;
  const isJoined = context.spacing === 0;
  const isHorizontal = context.orientation !== "vertical";
  const isOutline = resolvedVariant === "outline";

  return (
    <TogglePrimitive
      className={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        "shrink-0 focus:z-10 focus-visible:z-10",
        isJoined && "rounded-none",
        isJoined && isHorizontal && "first:rounded-l-lg last:rounded-r-lg",
        isJoined && !isHorizontal && "first:rounded-t-lg last:rounded-b-lg",
        isJoined && isOutline && isHorizontal && "border-l-0 first:border-l",
        isJoined && isOutline && !isHorizontal && "border-t-0 first:border-t",
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
