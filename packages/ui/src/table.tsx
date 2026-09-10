"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  ArrowDown as ArrowDownIcon,
  ArrowUpDown as ArrowUpDownIcon,
  ArrowUp as ArrowUpIcon,
} from "lucide-react";
import type * as React from "react";
import { cn } from "./utils";

// =============================================================================
// Table
// =============================================================================

export interface TableProps extends React.ComponentProps<"table"> {
  /**
   * Classes for the scroll container that wraps the table.
   *
   * The container is otherwise unreachable, which matters for more than
   * styling: capping its height is how you get a sticky header. See the
   * `Sticky header` section of the docs -- `overflow-y` is pinned to `hidden`
   * by default on purpose (an implicit promotion to `auto` renders a permanent
   * vertical gutter inside every table on macOS with "Show scrollbars:
   * Always"), so a scrolling viewport is opt-in:
   *
   * ```tsx
   * <Table containerClassName="max-h-96 overflow-y-auto">
   *   <TableHeader className="sticky top-0 z-[var(--z-sticky)] bg-background">
   * ```
   */
  containerClassName?: string;
  /** Escape hatch for the scroll container element. */
  containerProps?: React.ComponentProps<"div">;
  /**
   * Whether rows show a hover highlight
   * @default false
   */
  hoverable?: boolean;
  /**
   * The size variant of the table
   * @default "default"
   */
  size?: "default" | "sm";
  /**
   * The visual variant of the table
   * - `default`: Standard bordered rows
   * - `card`: Spaced rows with rounded corners and background fill
   * @default "default"
   */
  variant?: "default" | "card";
}

const Table = ({
  className,
  containerClassName,
  containerProps,
  size = "default",
  variant = "default",
  hoverable = false,
  ref,
  ...props
}: TableProps & React.RefAttributes<HTMLTableElement>) => (
  <div
    {...containerProps}
    className={cn(
      // min-w-0 so the container can shrink below the table's intrinsic
      // width. As a grid or flex item its min-width would otherwise resolve to
      // min-content -- the full table width -- pushing its track open and
      // handing the document a horizontal scrollbar. It already scrolls
      // internally, so it never needs to be wider than its track.
      "relative w-full min-w-0 overflow-x-auto overflow-y-hidden",
      containerClassName,
      containerProps?.className
    )}
    data-slot="table-container"
  >
    <table
      className={cn(
        "group/table w-full caption-bottom text-sm data-[size=sm]:text-xs",
        "data-[variant=card]:border-separate data-[variant=card]:border-spacing-y-1",
        className
      )}
      data-hoverable={hoverable || undefined}
      data-size={size}
      data-slot="table"
      data-variant={variant}
      ref={ref}
      {...props}
    />
  </div>
);

Table.displayName = "Table";

// =============================================================================
// TableHeader
// =============================================================================

export interface TableHeaderProps extends React.ComponentProps<"thead"> {}

const TableHeader = ({
  className,
  ref,
  ...props
}: TableHeaderProps & React.RefAttributes<HTMLTableSectionElement>) => (
  <thead
    className={cn(
      "[&_tr]:border-b group-data-[variant=card]/table:[&_tr]:border-0",
      className
    )}
    data-slot="table-header"
    ref={ref}
    {...props}
  />
);

TableHeader.displayName = "TableHeader";

// =============================================================================
// TableBody
// =============================================================================

export interface TableBodyProps extends React.ComponentProps<"tbody"> {}

const TableBody = ({
  className,
  ref,
  ...props
}: TableBodyProps & React.RefAttributes<HTMLTableSectionElement>) => (
  <tbody
    className={cn(
      "[&_tr:last-child]:border-0",
      "group-data-[variant=card]/table:[&_tr]:bg-muted/50 group-data-[hoverable]/table:group-data-[variant=card]/table:[&_tr]:hover:bg-muted/70",
      "group-data-[variant=card]/table:[&_td:first-child]:rounded-l-lg group-data-[variant=card]/table:[&_td:last-child]:rounded-r-lg",
      className
    )}
    data-slot="table-body"
    ref={ref}
    {...props}
  />
);

TableBody.displayName = "TableBody";

// =============================================================================
// TableFooter
// =============================================================================

export interface TableFooterProps extends React.ComponentProps<"tfoot"> {}

const TableFooter = ({
  className,
  ref,
  ...props
}: TableFooterProps & React.RefAttributes<HTMLTableSectionElement>) => (
  <tfoot
    className={cn(
      "border-t bg-muted/50 font-medium group-data-[variant=card]/table:border-0 group-data-[variant=card]/table:bg-transparent group-data-[size=sm]/table:text-xs [&>tr]:last:border-b-0",
      className
    )}
    data-slot="table-footer"
    ref={ref}
    {...props}
  />
);

TableFooter.displayName = "TableFooter";

// =============================================================================
// TableRow
// =============================================================================

export interface TableRowProps extends React.ComponentProps<"tr"> {}

const TableRow = ({
  className,
  ref,
  ...props
}: TableRowProps & React.RefAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      "border-b transition-colors data-[state=selected]:bg-muted group-data-[variant=card]/table:border-0 group-data-[hoverable]/table:[[data-slot=table-body]_&]:hover:bg-muted/50",
      className
    )}
    data-slot="table-row"
    ref={ref}
    {...props}
  />
);

TableRow.displayName = "TableRow";

// =============================================================================
// TableHead
// =============================================================================

export interface TableHeadProps extends React.ComponentProps<"th"> {
  /**
   * Right-align and use tabular figures.
   *
   * `text-end` rather than `text-right` so the column flips with the writing
   * direction. `tabular-nums` matters as much as the alignment: with
   * proportional digits a column of numbers reads ragged even when flush.
   *
   * @default false
   */
  numeric?: boolean;
  /**
   * This column's sort state, which sets `aria-sort`.
   *
   * The three-way distinction is the point, and it is what hand-rolled sort
   * headers usually get wrong:
   *
   * - omitted -> no `aria-sort` attribute. The column is not sortable.
   * - `null` -> `aria-sort="none"`. Sortable, but not the active column.
   * - `"asc"` / `"desc"` -> the active column and its direction.
   *
   * Emitting `aria-sort="none"` on a column that cannot be sorted tells a
   * screen-reader user it can be.
   */
  sortDirection?: "asc" | "desc" | null;
}

const ARIA_SORT = {
  asc: "ascending",
  desc: "descending",
} as const;

const TableHead = ({
  className,
  numeric = false,
  sortDirection,
  ref,
  ...props
}: TableHeadProps & React.RefAttributes<HTMLTableCellElement>) => (
  <th
    aria-sort={
      sortDirection === undefined
        ? undefined
        : (ARIA_SORT[sortDirection as "asc" | "desc"] ?? "none")
    }
    className={cn(
      "group/table-head h-10 whitespace-nowrap px-2 text-left align-middle font-medium text-foreground data-numeric:text-end data-numeric:tabular-nums group-data-[size=sm]/table:h-8 group-data-[size=sm]/table:px-1.5 group-data-[variant=card]/table:font-normal group-data-[variant=card]/table:text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    data-numeric={numeric || undefined}
    data-slot="table-head"
    ref={ref}
    {...props}
  />
);

TableHead.displayName = "TableHead";

// =============================================================================
// TableCell
// =============================================================================

export interface TableCellProps extends React.ComponentProps<"td"> {
  /**
   * Right-align and use tabular figures. Pair with `numeric` on the matching
   * `TableHead`.
   * @default false
   */
  numeric?: boolean;
}

const TableCell = ({
  className,
  numeric = false,
  ref,
  ...props
}: TableCellProps & React.RefAttributes<HTMLTableCellElement>) => (
  <td
    className={cn(
      "whitespace-nowrap p-2 align-middle data-numeric:text-end data-numeric:tabular-nums group-data-[size=sm]/table:p-1.5 [&:has([role=checkbox])]:pr-0",
      className
    )}
    data-numeric={numeric || undefined}
    data-slot="table-cell"
    ref={ref}
    {...props}
  />
);

TableCell.displayName = "TableCell";

// =============================================================================
// TableSortButton
// =============================================================================

export interface TableSortButtonProps
  extends useRender.ComponentProps<"button"> {
  /**
   * This column's sort direction, mirroring the `sortDirection` you pass to
   * the enclosing `TableHead`. `null` means sortable but inactive.
   */
  direction?: "asc" | "desc" | null;
  /**
   * Hide the affordance icon until the header is hovered or focused.
   *
   * Off by default, deliberately. A permanently visible arrow is what makes
   * three sortable columns distinguishable from the twelve that are not, and a
   * hover-only affordance is invisible to touch entirely. Turn it on for a
   * dense table where every column sorts, so the icons stop being noise.
   *
   * @default false
   */
  revealOnHover?: boolean;
}

const SORT_ICON = {
  asc: ArrowUpIcon,
  desc: ArrowDownIcon,
} as const;

/**
 * An active marker is full strength. An inactive one sits at 40%: full
 * strength competes with the label, and invisible-until-hover is worse still
 * -- it is what makes sortable columns indistinguishable from the rest, and it
 * offers nothing at all to touch.
 */
function sortIconOpacity(
  direction: "asc" | "desc" | null,
  revealOnHover: boolean
): string {
  if (direction) {
    return "opacity-100";
  }
  if (revealOnHover) {
    return "opacity-0 group-hover/table-head:opacity-40 group-focus-visible/table-head:opacity-40";
  }
  return "opacity-40";
}

/**
 * The control inside a sortable `TableHead`.
 *
 * `aria-sort` belongs on the `th` per ARIA, so it stays on `TableHead` and
 * this is only the affordance. Polymorphic via `render`, which is what lets
 * one component serve both models: `render={<Link href={...} />}` for a
 * server-rendered table whose sort state lives in the URL, or `onClick` for
 * client-held state.
 */
function TableSortButton({
  children,
  className,
  direction = null,
  render,
  revealOnHover = false,
  ...props
}: TableSortButtonProps) {
  const Icon = direction ? SORT_ICON[direction] : ArrowUpDownIcon;

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        children: (
          <>
            {children}
            <Icon
              aria-hidden="true"
              className={cn(
                "ms-1 size-3 shrink-0",
                sortIconOpacity(direction, revealOnHover)
              )}
            />
          </>
        ),
        className: cn(
          "inline-flex cursor-pointer items-center rounded-sm font-medium text-inherit transition-colors focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 group-data-numeric/table-head:flex-row-reverse [&_svg]:pointer-events-none",
          className
        ),
        type: "button",
      },
      props
    ),
    state: { slot: "table-sort-button" },
  });
}

TableSortButton.displayName = "TableSortButton";

// =============================================================================
// TableEmpty
// =============================================================================

export interface TableEmptyProps extends React.ComponentProps<"td"> {
  /**
   * How many columns to span. Required, not defaulted.
   *
   * It cannot be derived: counting `TableHead` children of a sibling `thead`
   * would need a context the header does not populate, and would be wrong the
   * moment columns are conditionally hidden -- which is exactly what a table
   * with a column-visibility menu does.
   */
  colSpan: number;
}

/**
 * A "no rows" row. Provides the `tr`/`td` plumbing and suppresses the row
 * hover, so it is not mistaken for a selectable row; compose `Empty` inside it
 * for the message itself rather than having a second empty-state vocabulary.
 */
const TableEmpty = ({
  className,
  colSpan,
  ref,
  ...props
}: TableEmptyProps & React.RefAttributes<HTMLTableCellElement>) => (
  <tr
    className="hover:bg-transparent data-[state=selected]:bg-transparent"
    data-slot="table-empty-row"
  >
    <td
      className={cn("p-0 align-middle", className)}
      colSpan={colSpan}
      data-slot="table-empty"
      ref={ref}
      {...props}
    />
  </tr>
);

TableEmpty.displayName = "TableEmpty";

// =============================================================================
// TableCaption
// =============================================================================

export interface TableCaptionProps extends React.ComponentProps<"caption"> {}

const TableCaption = ({
  className,
  ref,
  ...props
}: TableCaptionProps & React.RefAttributes<HTMLTableCaptionElement>) => (
  <caption
    className={cn(
      "mt-4 text-muted-foreground text-sm group-data-[size=sm]/table:mt-3 group-data-[size=sm]/table:text-xs",
      className
    )}
    data-slot="table-caption"
    ref={ref}
    {...props}
  />
);

TableCaption.displayName = "TableCaption";

// =============================================================================
// Exports
// =============================================================================

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
};
