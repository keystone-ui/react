"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "./utils";

// =============================================================================
// Tabs (Root)
// =============================================================================
export interface TabsProps extends TabsPrimitive.Root.Props {}

function Tabs({ className, orientation = "horizontal", ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  );
}

// =============================================================================
// TabsList
// =============================================================================
const tabsListVariants = cva(
  "relative rounded-lg p-1 data-[variant=line]:rounded-none data-[shape=pill]:rounded-full group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
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

export interface TabsListProps
  extends TabsPrimitive.List.Props,
    VariantProps<typeof tabsListVariants> {
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
  children,
  ...props
}: TabsListProps) {
  if (scrollable) {
    return (
      <ScrollableTabsList className={className} variant={variant} shape={shape} {...props}>
        {children}
      </ScrollableTabsList>
    );
  }

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-shape={shape}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      <TabsIndicator />
      {children}
    </TabsPrimitive.List>
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
  children,
  ...props
}: Omit<TabsListProps, "scrollable">) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    // Also observe the inner list so we detect when items are added/removed
    const list = el.firstElementChild;
    if (list) observer.observe(list);

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
    <div data-slot="tabs-list-wrapper" className="relative">
      {canScrollLeft && (
        <button
          type="button"
          data-slot="tabs-scroll-button"
          aria-label="Scroll tabs left"
          onClick={scrollLeft}
          className="absolute left-0 top-0 z-10 flex h-full cursor-pointer items-center justify-center pl-0.5 pr-1"
        >
          <ChevronLeftIcon className="text-muted-foreground size-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        data-slot="tabs-list-scroll"
        data-scrollable
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <TabsPrimitive.List
          data-slot="tabs-list"
          data-variant={variant}
          data-shape={shape}
          className={cn(
            tabsListVariants({ variant }),
            className
          )}
          {...props}
        >
          <TabsIndicator />
          {children}
        </TabsPrimitive.List>
      </div>

      {canScrollRight && (
        <button
          type="button"
          data-slot="tabs-scroll-button"
          aria-label="Scroll tabs right"
          onClick={scrollRight}
          className="absolute right-0 top-0 z-10 flex h-full cursor-pointer items-center justify-center pl-1 pr-0.5"
        >
          <ChevronRightIcon className="text-muted-foreground size-4" />
        </button>
      )}
    </div>
  );
}

// =============================================================================
// TabsTrigger
// =============================================================================
export interface TabsTriggerProps extends TabsPrimitive.Tab.Props {}

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        // Base styles
        "text-muted-foreground hover:text-foreground relative z-[1] inline-flex h-8 cursor-pointer flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-0.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Shape-aware styles
        "group-data-[shape=pill]/tabs-list:rounded-full group-data-[shape=pill]/tabs-list:px-3",
        // Orientation-aware styles
        "group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:h-8 group-data-[orientation=vertical]/tabs:flex-initial group-data-[orientation=vertical]/tabs:justify-start",
        // Active state (text color only — background/shadow handled by indicator)
        "data-active:text-foreground dark:data-active:text-foreground",
        className
      )}
      {...props}
    />
  );
}

// =============================================================================
// TabsIndicator
// =============================================================================
export interface TabsIndicatorProps extends TabsPrimitive.Indicator.Props {}

function TabsIndicator({ className, ...props }: TabsIndicatorProps) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(
        // Positioning via Base UI CSS custom properties
        "absolute top-[var(--active-tab-top)] left-[var(--active-tab-left)] w-[var(--active-tab-width)] h-[var(--active-tab-height)]",
        // Sliding animation
        "transition-[top,right,bottom,left,width,height] duration-200 ease-out",
        // Reduced motion
        "motion-reduce:transition-none",
        // Default variant: pill/card sliding behind active tab
        "group-data-[variant=default]/tabs-list:bg-background group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:shadow-sm",
        "group-data-[variant=default]/tabs-list:group-data-[shape=pill]/tabs-list:rounded-full",
        "dark:group-data-[variant=default]/tabs-list:border dark:group-data-[variant=default]/tabs-list:border-input dark:group-data-[variant=default]/tabs-list:bg-input-bg",
        // Line variant (horizontal): 2px bar at bottom
        "group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:top-auto group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:bottom-0 group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:h-0.5",
        "group-data-[variant=line]/tabs-list:bg-foreground",
        // Line variant (vertical): 2px bar on the right edge
        "group-data-[variant=line]/tabs-list:data-[orientation=vertical]:left-auto group-data-[variant=line]/tabs-list:data-[orientation=vertical]:-right-1 group-data-[variant=line]/tabs-list:data-[orientation=vertical]:w-0.5",
        className
      )}
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
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsIndicator, TabsContent, tabsListVariants };
