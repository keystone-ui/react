"use client";

import * as React from "react";
import { cn } from "./utils";

// =============================================================================
// Table
// =============================================================================

export interface TableProps extends React.ComponentProps<"table"> {
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
  /**
   * Whether rows show a hover highlight
   * @default false
   */
  hoverable?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, size = "default", variant = "default", hoverable = false, ...props }, ref) => {
    return (
      <div
        data-slot="table-container"
        className="relative w-full overflow-x-auto"
      >
        <table
          ref={ref}
          data-slot="table"
          data-size={size}
          data-variant={variant}
          data-hoverable={hoverable || undefined}
          className={cn(
            "group/table w-full caption-bottom text-sm data-[size=sm]:text-xs",
            "data-[variant=card]:border-separate data-[variant=card]:border-spacing-y-1",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = "Table";

// =============================================================================
// TableHeader
// =============================================================================

export interface TableHeaderProps extends React.ComponentProps<"thead"> {}

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn("[&_tr]:border-b group-data-[variant=card]/table:[&_tr]:border-0", className)}
      {...props}
    />
  );
});

TableHeader.displayName = "TableHeader";

// =============================================================================
// TableBody
// =============================================================================

export interface TableBodyProps extends React.ComponentProps<"tbody"> {}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        data-slot="table-body"
        className={cn(
          "[&_tr:last-child]:border-0",
          "group-data-[variant=card]/table:[&_tr]:bg-muted/50 group-data-[hoverable]/table:group-data-[variant=card]/table:[&_tr]:hover:bg-muted/70",
          "group-data-[variant=card]/table:[&_td:first-child]:rounded-l-lg group-data-[variant=card]/table:[&_td:last-child]:rounded-r-lg",
          className
        )}
        {...props}
      />
    );
  }
);

TableBody.displayName = "TableBody";

// =============================================================================
// TableFooter
// =============================================================================

export interface TableFooterProps extends React.ComponentProps<"tfoot"> {}

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  TableFooterProps
>(({ className, ...props }, ref) => {
  return (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0 group-data-[size=sm]/table:text-xs group-data-[variant=card]/table:bg-transparent group-data-[variant=card]/table:border-0",
        className
      )}
      {...props}
    />
  );
});

TableFooter.displayName = "TableFooter";

// =============================================================================
// TableRow
// =============================================================================

export interface TableRowProps extends React.ComponentProps<"tr"> {}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        data-slot="table-row"
        className={cn(
          "group-data-[hoverable]/table:[[data-slot=table-body]_&]:hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors group-data-[variant=card]/table:border-0",
          className
        )}
        {...props}
      />
    );
  }
);

TableRow.displayName = "TableRow";

// =============================================================================
// TableHead
// =============================================================================

export interface TableHeadProps extends React.ComponentProps<"th"> {}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        data-slot="table-head"
        className={cn(
          "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 group-data-[size=sm]/table:h-8 group-data-[size=sm]/table:px-1.5 group-data-[variant=card]/table:text-muted-foreground group-data-[variant=card]/table:font-normal",
          className
        )}
        {...props}
      />
    );
  }
);

TableHead.displayName = "TableHead";

// =============================================================================
// TableCell
// =============================================================================

export interface TableCellProps extends React.ComponentProps<"td"> {}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        data-slot="table-cell"
        className={cn(
          "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 group-data-[size=sm]/table:p-1.5",
          className
        )}
        {...props}
      />
    );
  }
);

TableCell.displayName = "TableCell";

// =============================================================================
// TableCaption
// =============================================================================

export interface TableCaptionProps extends React.ComponentProps<"caption"> {}

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ className, ...props }, ref) => {
  return (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm group-data-[size=sm]/table:mt-3 group-data-[size=sm]/table:text-xs", className)}
      {...props}
    />
  );
});

TableCaption.displayName = "TableCaption";

// =============================================================================
// Exports
// =============================================================================

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
