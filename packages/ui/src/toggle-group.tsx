"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import type { VariantProps } from "class-variance-authority";
import { type CSSProperties, createContext, useContext, useMemo } from "react";
import { toggleVariants } from "./toggle";
import { cn, mergeClassName } from "./utils";

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
  variant?: "default" | "outline" | "secondary";
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
      className={mergeClassName(
        cn(
          "group/toggle-group flex w-fit items-center",
          // One radius for every size, because the items now have one too. The
          // `sm` tier used to clamp the container to `min(var(--radius-md),10px)`
          // while the first and last items stayed at `rounded-l-lg`/`rounded-r-lg`
          // — 8px around 10px, so the item corners overhung the group by 2px.
          // Container and items are separate declarations, so nothing but this
          // comment and `control-ladder.spec.ts` keeps them agreeing.
          spacing === 0 && "rounded-md",
          orientation === "vertical" && "flex-col items-stretch"
        ),
        className
      )}
      data-orientation={orientation}
      data-slot="toggle-group"
      // Base UI picks the roving-focus arrow keys from this prop: without it
      // a vertical group still moved on ArrowLeft/ArrowRight.
      orientation={orientation}
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

// A joined item cannot shrink on press like a lone Toggle: its neighbour
// shares its edge, so the scale opens a gap between them. It shows the press
// with its variant's hover fill instead (the same tokens as `toggleVariants`'
// `hover:`), which also gives a touch press, where hover never applies,
// something to see. An item that is already on keeps its on fill.
//
// Every press class uses a chain a consumer would write themselves
// (`active:`, `dark:active:`), so their own `active:bg-*` or
// `dark:active:bg-*` in `className` replaces it through the class merge. An
// item that is on keeps its on fill while held, because Tailwind emits
// `aria-pressed:` after `active:` at equal specificity.
//
// Dark outline needs a `dark:active:` fill to outrank Toggle's own
// `dark:bg-input-bg`, and that fill would also cover an item that is on.
// So its colour comes from `--ks-toggle-press` (internal to this component:
// not a theme token, not documented API): the hover fill
// (`input/50`) for an off item, and for an on item exactly what Toggle shows
// it while held without this rule (`input-bg`, or `input/50` under a
// hovering pointer). The setters only set the property, so a consumer's
// `dark:active:bg-*` still replaces the fill itself.
const joinedPressVariants = {
  default: "active:bg-muted active:text-foreground",
  outline: [
    "active:bg-accent active:text-accent-foreground",
    "dark:active:bg-(color:--ks-toggle-press)",
    "dark:[--ks-toggle-press:color-mix(in_oklab,var(--input)_50%,transparent)]",
    "dark:aria-pressed:[--ks-toggle-press:var(--input-bg)]",
    "dark:aria-pressed:hover:[--ks-toggle-press:color-mix(in_oklab,var(--input)_50%,transparent)]",
  ].join(" "),
  secondary: "active:bg-secondary-hover active:text-secondary-foreground",
} as const;

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
      className={mergeClassName(
        cn(
          toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
          "shrink-0 focus:z-10 focus-visible:z-10",
          isJoined && "rounded-none active:scale-100",
          isJoined && joinedPressVariants[resolvedVariant ?? "default"],
          isJoined && isHorizontal && "first:rounded-l-md last:rounded-r-md",
          isJoined && !isHorizontal && "first:rounded-t-md last:rounded-b-md",
          isJoined && isOutline && isHorizontal && "border-l-0 first:border-l",
          isJoined && isOutline && !isHorizontal && "border-t-0 first:border-t"
        ),
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
