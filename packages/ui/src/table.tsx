"use client";

import * as React from "react";
import { cn } from "./utils";

// =============================================================================
// Table
// =============================================================================

export interface TableProps extends React.ComponentProps<"table"> {
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

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      size = "default",
      variant = "default",
      hoverable = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className="relative w-full overflow-x-auto"
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
  }
);

Table.displayName = "Table";

// =============================================================================
// TableHeader
// =============================================================================

export interface TableHeaderProps extends React.ComponentProps<"thead"> {}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
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
  }
);

TableHeader.displayName = "TableHeader";

// =============================================================================
// TableBody
// =============================================================================

export interface TableBodyProps extends React.ComponentProps<"tbody"> {}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return (
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
  }
);

TableBody.displayName = "TableBody";

// =============================================================================
// TableFooter
// =============================================================================

export interface TableFooterProps extends React.ComponentProps<"tfoot"> {}

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => {
    return (
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
  }
);

TableFooter.displayName = "TableFooter";

// =============================================================================
// TableRow
// =============================================================================

export interface TableRowProps extends React.ComponentProps<"tr"> {}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
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
        className={cn(
          "h-10 whitespace-nowrap px-2 text-left align-middle font-medium text-foreground group-data-[size=sm]/table:h-8 group-data-[size=sm]/table:px-1.5 group-data-[variant=card]/table:font-normal group-data-[variant=card]/table:text-muted-foreground [&:has([role=checkbox])]:pr-0",
          className
        )}
        data-slot="table-head"
        ref={ref}
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
        className={cn(
          "whitespace-nowrap p-2 align-middle group-data-[size=sm]/table:p-1.5 [&:has([role=checkbox])]:pr-0",
          className
        )}
        data-slot="table-cell"
        ref={ref}
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
      className={cn(
        "mt-4 text-muted-foreground text-sm group-data-[size=sm]/table:mt-3 group-data-[size=sm]/table:text-xs",
        className
      )}
      data-slot="table-caption"
      ref={ref}
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
