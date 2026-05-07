"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { cn } from "./utils";

type TabsValue = string | number | null;
type TabsListVariant = "default" | "line";

const TabsActiveContext = React.createContext<TabsValue>(null);
const TabsTriggerContext = React.createContext<{ isActive: boolean }>({
  isActive: false,
});

const MORPH_SPRING = { type: "spring", duration: 0.35, bounce: 0 } as const;

// =============================================================================
// Tabs (Root)
// =============================================================================
export interface TabsProps extends TabsPrimitive.Root.Props {}

function Tabs({
  className,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState<TabsValue>(
    defaultValue ?? null
  );
  const activeValue = value ?? internalValue;

  const handleValueChange: TabsPrimitive.Root.Props["onValueChange"] = (
    next,
    eventDetails
  ) => {
    setInternalValue(next);
    onValueChange?.(next, eventDetails);
  };

  return (
    <TabsActiveContext.Provider value={activeValue}>
      <TabsPrimitive.Root
        className={cn(
          "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
          className
        )}
        data-slot="tabs"
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        orientation={orientation}
        value={value}
        {...props}
      />
    </TabsActiveContext.Provider>
  );
}

// =============================================================================
// TabsList
// =============================================================================
const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center justify-center rounded-lg p-1 text-muted-foreground data-[shape=pill]:rounded-full data-[variant=line]:rounded-none group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const TabsListContext = React.createContext<{
  morphing: boolean;
  variant: TabsListVariant;
  pillId: string;
}>({
  morphing: false,
  variant: "default",
  pillId: "",
});

export interface TabsListProps
  extends TabsPrimitive.List.Props,
    VariantProps<typeof tabsListVariants> {
  /**
   * Collapse inactive triggers to icon-only and reveal the label only on the
   * active tab. Each trigger should pair an icon with `<TabsTriggerLabel>`.
   */
  morphing?: boolean;
  /** Enable horizontal scroll with gradient fades and arrow navigation */
  scrollable?: boolean;
  /**
   * Shape of the tab list and its triggers
   * @default "rounded"
   */
  shape?: "rounded" | "pill";
}

function TabsList({
  className,
  variant = "default",
  shape = "rounded",
  scrollable,
  morphing = false,
  children,
  ...props
}: TabsListProps) {
  const pillId = React.useId();
  const contextValue = React.useMemo(
    () => ({ morphing, variant: variant ?? "default", pillId }),
    [morphing, variant, pillId]
  );

  if (scrollable) {
    return (
      <TabsListContext.Provider value={contextValue}>
        <ScrollableTabsList
          className={className}
          morphing={morphing}
          shape={shape}
          variant={variant}
          {...props}
        >
          {children}
        </ScrollableTabsList>
      </TabsListContext.Provider>
    );
  }

  // In morphing mode the active pill is a motion.span layoutId={pillId}
  // rendered inside the active TabsTrigger — suppress Base UI's CSS indicator.
  return (
    <TabsListContext.Provider value={contextValue}>
      <TabsPrimitive.List
        className={cn(tabsListVariants({ variant }), className)}
        data-morphing={morphing || undefined}
        data-shape={shape}
        data-slot="tabs-list"
        data-variant={variant}
        {...props}
      >
        {!morphing && <TabsIndicator />}
        {children}
      </TabsPrimitive.List>
    </TabsListContext.Provider>
  );
}

// =============================================================================
// ScrollableTabsList (internal)
// =============================================================================
/** Pixels to scroll per arrow click in scrollable tabs */
const SCROLL_AMOUNT = 150;

function ScrollableTabsList({
  className,
  variant = "default",
  shape = "rounded",
  morphing = false,
  children,
  ...props
}: Omit<TabsListProps, "scrollable">) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    updateScrollState();

    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    // Also observe the inner list so we detect when items are added/removed
    const list = el.firstElementChild;
    if (list) {
      observer.observe(list);
    }

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  };

  return (
    <div className="relative" data-slot="tabs-list-wrapper">
      {canScrollLeft && (
        <button
          aria-label="Scroll tabs left"
          className="absolute top-0 left-0 z-10 flex h-full cursor-pointer items-center justify-center pr-1 pl-0.5"
          data-slot="tabs-scroll-button"
          onClick={scrollLeft}
          type="button"
        >
          <ChevronLeftIcon className="size-4 text-muted-foreground" />
        </button>
      )}

      <div
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-scrollable
        data-slot="tabs-list-scroll"
        ref={scrollRef}
      >
        <TabsPrimitive.List
          className={cn(tabsListVariants({ variant }), className)}
          data-morphing={morphing || undefined}
          data-shape={shape}
          data-slot="tabs-list"
          data-variant={variant}
          {...props}
        >
          {!morphing && <TabsIndicator />}
          {children}
        </TabsPrimitive.List>
      </div>

      {canScrollRight && (
        <button
          aria-label="Scroll tabs right"
          className="absolute top-0 right-0 z-10 flex h-full cursor-pointer items-center justify-center pr-0.5 pl-1"
          data-slot="tabs-scroll-button"
          onClick={scrollRight}
          type="button"
        >
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

// =============================================================================
// TabsTrigger
// =============================================================================
export interface TabsTriggerProps extends TabsPrimitive.Tab.Props {}

function TabsTrigger({
  className,
  children,
  value,
  ...props
}: TabsTriggerProps) {
  const { morphing, variant, pillId } = React.useContext(TabsListContext);
  const activeValue = React.useContext(TabsActiveContext);
  const isActive = activeValue === value;
  const shouldReduceMotion = useReducedMotion();

  const triggerContext = React.useMemo(() => ({ isActive }), [isActive]);

  return (
    <TabsTriggerContext.Provider value={triggerContext}>
      <TabsPrimitive.Tab
        className={cn(
          // Base styles
          "group/tabs-trigger relative z-[1] inline-flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-2 py-0.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
          // Shape-aware styles
          "group-data-[shape=pill]/tabs-list:rounded-full group-data-[shape=pill]/tabs-list:px-3",
          // Orientation-aware styles
          "group-data-[orientation=vertical]/tabs:h-8 group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:flex-initial group-data-[orientation=vertical]/tabs:justify-start",
          // Active state (text color only — background/shadow handled by indicator/pill)
          "data-active:text-foreground dark:data-active:text-foreground",
          // Morphing: triggers size to content so the active one can grow to
          // fit its label. Width animation lives on TabsTriggerLabel (motion).
          // Gap collapses to 0 — the label carries its own left padding so the
          // icon→label spacing animates with the motion spring.
          "data-[morphing]:flex-initial data-[morphing]:gap-0",
          className
        )}
        data-morphing={morphing || undefined}
        data-slot="tabs-trigger"
        value={value}
        {...props}
      >
        {morphing && isActive && (
          <motion.span
            aria-hidden
            className={cn(
              "absolute -z-[1]",
              // Default variant in morphing mode: always a fully-rounded pill,
              // no shadow. `rounded-full` is self-correcting under FLIP scale
              // (corners stay clamped at 50% of the shorter axis), and dropping
              // the shadow avoids the shadow-stretch artifact mid-morph.
              variant === "default" &&
                "inset-0 rounded-full bg-background dark:bg-input-bg",
              variant === "line" &&
                "right-0 bottom-0 left-0 h-0.5 bg-foreground"
            )}
            data-slot="tabs-morphing-pill"
            layoutId={pillId}
            transition={shouldReduceMotion ? { duration: 0 } : MORPH_SPRING}
          />
        )}
        {children}
      </TabsPrimitive.Tab>
    </TabsTriggerContext.Provider>
  );
}

// =============================================================================
// TabsTriggerLabel
// =============================================================================
export interface TabsTriggerLabelProps extends React.ComponentProps<"span"> {}

/**
 * Wraps a tab's text label so it can collapse to width 0 when the parent
 * `TabsList` has `morphing` enabled and the trigger is not active. The active
 * tab springs from 0 to natural width via `motion`, and the icon→label
 * spacing lives inside the label so it animates together with the width.
 *
 * Outside `morphing` mode this renders a plain `<span>`.
 */
function TabsTriggerLabel({
  className,
  children,
  ...props
}: TabsTriggerLabelProps) {
  const { morphing } = React.useContext(TabsListContext);
  const { isActive } = React.useContext(TabsTriggerContext);
  const shouldReduceMotion = useReducedMotion();

  if (!morphing) {
    return (
      <span className={className} data-slot="tabs-trigger-label" {...props}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      animate={{
        width: isActive ? "auto" : 0,
        opacity: isActive ? 1 : 0,
      }}
      className={cn(
        "inline-block overflow-hidden whitespace-nowrap",
        className
      )}
      data-slot="tabs-trigger-label"
      initial={false}
      transition={shouldReduceMotion ? { duration: 0 } : MORPH_SPRING}
      {...(props as React.ComponentProps<typeof motion.span>)}
    >
      <span className="pl-1.5">{children}</span>
    </motion.span>
  );
}

// =============================================================================
// TabsIndicator
// =============================================================================
export interface TabsIndicatorProps extends TabsPrimitive.Indicator.Props {}

function TabsIndicator({ className, ...props }: TabsIndicatorProps) {
  return (
    <TabsPrimitive.Indicator
      className={cn(
        // Positioning via Base UI CSS custom properties
        "absolute top-[var(--active-tab-top)] left-[var(--active-tab-left)] h-[var(--active-tab-height)] w-[var(--active-tab-width)]",
        // Sliding animation (reduced motion handled globally by base.css)
        "transition-[top,right,bottom,left,width,height] duration-200 ease-out",
        // Default variant: pill/card sliding behind active tab
        "group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:bg-background group-data-[variant=default]/tabs-list:shadow-sm",
        "group-data-[variant=default]/tabs-list:group-data-[shape=pill]/tabs-list:rounded-full",
        "dark:group-data-[variant=default]/tabs-list:bg-input-bg",
        // Line variant (horizontal): 2px bar at bottom
        "group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:top-auto group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:bottom-0 group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:h-0.5",
        "group-data-[variant=line]/tabs-list:bg-foreground",
        // Line variant (vertical): 2px bar on the right edge
        "group-data-[variant=line]/tabs-list:data-[orientation=vertical]:-right-1 group-data-[variant=line]/tabs-list:data-[orientation=vertical]:left-auto group-data-[variant=line]/tabs-list:data-[orientation=vertical]:w-0.5",
        className
      )}
      data-slot="tabs-indicator"
      renderBeforeHydration
      {...props}
    />
  );
}

// =============================================================================
// TabsContent
// =============================================================================
export interface TabsContentProps extends TabsPrimitive.Panel.Props {}

function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Panel
      className={cn("flex-1 text-sm outline-none", className)}
      data-slot="tabs-content"
      {...props}
    />
  );
}

export {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
  TabsTriggerLabel,
  tabsListVariants,
};
