import type * as React from "react";

import { cn } from "./utils";

// =============================================================================
// DescriptionList
// =============================================================================

export interface DescriptionListProps extends React.ComponentProps<"dl"> {
  /**
   * How many columns the pairs flow into.
   *
   * `2` collapses to a single column below `sm`. Only `1` and `2` are offered
   * because the responsive pair is baked in — for any other arrangement leave
   * this at `1` and bring your own grid, since a `sm:grid-cols-2` emitted here
   * would survive `cn()` and beat a plain `grid-cols-*` in your `className`
   * at that breakpoint.
   * @default 1
   */
  columns?: 1 | 2;
  /**
   * How each pair is laid out.
   * - `row`: term and details on one line, details right-aligned
   * - `stacked`: term above details, left-aligned — a record/detail view
   * @default "row"
   */
  orientation?: "row" | "stacked";
  /**
   * The size variant of the description list
   * @default "default"
   */
  size?: "default" | "sm";
  /**
   * The visual variant of the description list
   * - `default`: Rows separated by bottom borders
   * - `card`: Spaced rows with rounded corners and background fill
   * @default "default"
   */
  variant?: "default" | "card";
}

const DescriptionList = ({
  className,
  columns = 1,
  orientation = "row",
  size = "default",
  variant = "default",
  ref,
  ...props
}: DescriptionListProps & React.RefAttributes<HTMLDListElement>) => (
  <dl
    className={cn(
      "group/description-list w-full text-sm",
      // Conditional rather than a `data-[columns=2]:` variant: a
      // variant-modified class is specificity (0,2,0) and would out-specify a
      // consumer's plain `className`, which is what made Card's --card-spacing
      // override silently fail. The prop is in scope here, so branch on it.
      columns === 2
        ? "grid grid-cols-1 gap-x-8 sm:grid-cols-2"
        : "flex flex-col",
      // Stacked pairs have no separators or padding to space them, so the row
      // gap is the only thing keeping one pair's value off the next pair's
      // label. Row orientation gets none: its items carry their own padding.
      orientation === "stacked" && "gap-y-4",
      "data-[variant=card]:gap-1",
      className
    )}
    data-columns={columns}
    data-orientation={orientation}
    data-size={size}
    data-slot="description-list"
    data-variant={variant}
    ref={ref}
    {...props}
  />
);

DescriptionList.displayName = "DescriptionList";

// =============================================================================
// DescriptionListItem
// =============================================================================

export interface DescriptionListItemProps extends React.ComponentProps<"div"> {}

const DescriptionListItem = ({
  className,
  ref,
  ...props
}: DescriptionListItemProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex w-full items-center justify-between px-3 py-2.5 group-data-[size=sm]/description-list:px-2.5 group-data-[size=sm]/description-list:py-1.5",
      "border-border border-b last:border-0 group-data-[variant=card]/description-list:border-0",
      "group-data-[variant=card]/description-list:rounded-lg group-data-[variant=card]/description-list:bg-muted/50",
      // Stacked drops the row chrome. Padding and separators are row-list
      // affordances; between stacked pairs in a grid they read as noise, and
      // `last:border-0` would clear the DOM-last item rather than the last of
      // each column. These must read the parent through the group — the item
      // has no access to the root's props.
      "group-data-[orientation=stacked]/description-list:flex-col group-data-[orientation=stacked]/description-list:items-start group-data-[orientation=stacked]/description-list:justify-start group-data-[orientation=stacked]/description-list:gap-1",
      "group-data-[orientation=stacked]/description-list:border-0 group-data-[orientation=stacked]/description-list:px-0 group-data-[orientation=stacked]/description-list:py-0",
      className
    )}
    data-slot="description-list-item"
    ref={ref}
    {...props}
  />
);

DescriptionListItem.displayName = "DescriptionListItem";

// =============================================================================
// DescriptionListTerm
// =============================================================================

export interface DescriptionListTermProps extends React.ComponentProps<"dt"> {}

const DescriptionListTerm = ({
  className,
  ref,
  ...props
}: DescriptionListTermProps & React.RefAttributes<HTMLElement>) => (
  <dt
    className={cn(
      "text-muted-foreground",
      "group-data-[orientation=stacked]/description-list:text-xs",
      className
    )}
    data-slot="description-list-term"
    ref={ref}
    {...props}
  />
);

DescriptionListTerm.displayName = "DescriptionListTerm";

// =============================================================================
// DescriptionListDetails
// =============================================================================

export interface DescriptionListDetailsProps
  extends React.ComponentProps<"dd"> {}

const DescriptionListDetails = ({
  className,
  ref,
  ...props
}: DescriptionListDetailsProps & React.RefAttributes<HTMLElement>) => (
  <dd
    className={cn(
      "ml-auto text-right",
      "group-data-[orientation=stacked]/description-list:ml-0 group-data-[orientation=stacked]/description-list:text-left",
      className
    )}
    data-slot="description-list-details"
    ref={ref}
    {...props}
  />
);

DescriptionListDetails.displayName = "DescriptionListDetails";

// =============================================================================
// Exports
// =============================================================================

export {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
};
