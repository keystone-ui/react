"use client";

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft as ChevronsLeftIcon,
  ChevronsRight as ChevronsRightIcon,
} from "lucide-react";
import type * as React from "react";
import { useId } from "react";

import { Button } from "./button";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "./utils";

/**
 * The footer of a paginated data table: how many rows are selected, how many
 * per page, which page, and the four navigation buttons.
 *
 * Deliberately separate from `Pagination`, which is an anchor-based list of
 * page links (`nav > ul > li > a`, `aria-current="page"`). This is a toolbar
 * with an opaque page index and no per-page URLs, it needs `aria-live` rather
 * than `aria-current`, and it depends on `Select` and `Label` -- merging the
 * two would drag Base UI's Select into every bundle that only wanted page
 * links, and add both to `pagination`'s registry dependencies.
 *
 * Named `table-pagination`, not `data-table-pagination`: "data table" implies
 * a TanStack Table binding that does not exist here.
 */

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;

// ---------------------------------------------------------------------------
// TablePaginationInfo
// ---------------------------------------------------------------------------

export interface TablePaginationInfoProps extends React.ComponentProps<"div"> {
  /** Rows currently selected. */
  selectedCount?: number;
  /** Rows in the whole result set, not just this page. */
  totalCount?: number;
}

export const TablePaginationInfo = ({
  children,
  className,
  ref,
  selectedCount,
  totalCount,
  ...props
}: TablePaginationInfoProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    // The count changes as a result of clicking a checkbox somewhere else
    // entirely, so it has to announce itself.
    aria-live="polite"
    className={cn(
      "hidden flex-1 text-muted-foreground text-sm lg:block",
      className
    )}
    data-slot="table-pagination-info"
    ref={ref}
    {...props}
  >
    {children ??
      (selectedCount === undefined
        ? null
        : `${selectedCount} of ${totalCount ?? 0} row(s) selected.`)}
  </div>
);

TablePaginationInfo.displayName = "TablePaginationInfo";

// ---------------------------------------------------------------------------
// TablePaginationPageSize
// ---------------------------------------------------------------------------

export interface TablePaginationPageSizeProps
  extends Omit<React.ComponentProps<"div">, "onChange"> {
  /** @default "Rows per page" */
  label?: string;
  /** Receives a `number`, never the Select's string value. */
  onValueChange?: (size: number) => void;
  /** @default [10, 20, 30, 50] */
  options?: readonly number[];
  value?: number;
}

export const TablePaginationPageSize = ({
  className,
  label = "Rows per page",
  onValueChange,
  options = DEFAULT_PAGE_SIZE_OPTIONS,
  ref,
  value,
  ...props
}: TablePaginationPageSizeProps & React.RefAttributes<HTMLDivElement>) => {
  // The Label has to point at the trigger, or the control has no accessible
  // name beyond its current value.
  const selectId = useId();

  return (
    <div
      className={cn("hidden items-center gap-2 lg:flex", className)}
      data-slot="table-pagination-page-size"
      ref={ref}
      {...props}
    >
      <Label className="font-medium text-sm" htmlFor={selectId}>
        {label}
      </Label>
      <Select
        onValueChange={(next) => {
          if (next) {
            onValueChange?.(Number(next));
          }
        }}
        value={value === undefined ? undefined : String(value)}
      >
        <SelectTrigger className="w-20" id={selectId} size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

TablePaginationPageSize.displayName = "TablePaginationPageSize";

// ---------------------------------------------------------------------------
// TablePaginationStatus
// ---------------------------------------------------------------------------

export interface TablePaginationStatusProps
  extends React.ComponentProps<"div"> {
  pageCount: number;
  /** 0-based. */
  pageIndex: number;
}

export const TablePaginationStatus = ({
  children,
  className,
  pageCount,
  pageIndex,
  ref,
  ...props
}: TablePaginationStatusProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    // Paging swaps the table's contents with no other visible confirmation, so
    // without this a screen-reader user hears nothing at all after clicking
    // "next page".
    aria-live="polite"
    className={cn(
      "flex w-fit items-center justify-center font-medium text-sm tabular-nums",
      className
    )}
    data-slot="table-pagination-status"
    ref={ref}
    {...props}
  >
    {/* Clamped so an empty result set reads "Page 1 of 1", not "Page 1 of 0". */}
    {children ?? `Page ${pageIndex + 1} of ${Math.max(1, pageCount)}`}
  </div>
);

TablePaginationStatus.displayName = "TablePaginationStatus";

// ---------------------------------------------------------------------------
// TablePaginationButtons
// ---------------------------------------------------------------------------

export interface TablePaginationButtonsProps
  extends React.ComponentProps<"div"> {
  onPageIndexChange?: (index: number) => void;
  pageCount: number;
  /** 0-based. */
  pageIndex: number;
  /**
   * Render the first/last buttons. They are hidden below `lg` regardless.
   * @default true
   */
  showEdgeButtons?: boolean;
}

/**
 * The four navigation buttons. This is where the disabled arithmetic lives,
 * and it is the actual duplicated logic that justifies a component rather than
 * a documented composition.
 */
export const TablePaginationButtons = ({
  className,
  onPageIndexChange,
  pageCount,
  pageIndex,
  ref,
  showEdgeButtons = true,
  ...props
}: TablePaginationButtonsProps & React.RefAttributes<HTMLDivElement>) => {
  const lastIndex = Math.max(0, pageCount - 1);
  const canGoPrev = pageIndex > 0;
  const canGoNext = pageIndex < lastIndex;

  return (
    <div
      className={cn("ml-auto flex items-center gap-2 lg:ml-0", className)}
      data-slot="table-pagination-buttons"
      ref={ref}
      {...props}
    >
      {showEdgeButtons && (
        <Button
          aria-label="Go to first page"
          className="hidden lg:flex"
          disabled={!canGoPrev}
          onClick={() => onPageIndexChange?.(0)}
          size="icon-sm"
          variant="outline"
        >
          <ChevronsLeftIcon />
        </Button>
      )}
      <Button
        aria-label="Go to previous page"
        disabled={!canGoPrev}
        onClick={() => onPageIndexChange?.(pageIndex - 1)}
        size="icon-sm"
        variant="outline"
      >
        <ChevronLeftIcon />
      </Button>
      <Button
        aria-label="Go to next page"
        disabled={!canGoNext}
        onClick={() => onPageIndexChange?.(pageIndex + 1)}
        size="icon-sm"
        variant="outline"
      >
        <ChevronRightIcon />
      </Button>
      {showEdgeButtons && (
        <Button
          aria-label="Go to last page"
          className="hidden lg:flex"
          disabled={!canGoNext}
          onClick={() => onPageIndexChange?.(lastIndex)}
          size="icon-sm"
          variant="outline"
        >
          <ChevronsRightIcon />
        </Button>
      )}
    </div>
  );
};

TablePaginationButtons.displayName = "TablePaginationButtons";

// ---------------------------------------------------------------------------
// TablePaginationControls
// ---------------------------------------------------------------------------

export interface TablePaginationControlsProps
  extends React.ComponentProps<"div"> {}

/**
 * The right-hand cluster: page size, page status, and the navigation buttons.
 *
 * Named because `TablePagination` accepts `children` to replace its default
 * composition entirely, and a consumer who takes that path otherwise has no
 * way to reproduce this grouping except by copying its classes. It was the one
 * unnamed structural element among five named parts, and all three blocks in
 * this repo had copied the string verbatim.
 *
 * Full width below `lg` so the controls fill the row once the info slot is
 * hidden, and intrinsic above it so they sit at the end.
 */
export const TablePaginationControls = ({
  className,
  ref,
  ...props
}: TablePaginationControlsProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex w-full items-center gap-6 lg:w-fit lg:gap-8",
      className
    )}
    data-slot="table-pagination-controls"
    ref={ref}
    {...props}
  />
);

TablePaginationControls.displayName = "TablePaginationControls";

// ---------------------------------------------------------------------------
// TablePagination
// ---------------------------------------------------------------------------

export interface TablePaginationProps extends React.ComponentProps<"div"> {
  onPageIndexChange?: (index: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageCount: number;
  /** 0-based. */
  pageIndex: number;
  pageSize?: number;
  /** @default [10, 20, 30, 50] */
  pageSizeOptions?: readonly number[];
  /** Omit to hide the selection line entirely. */
  selectedCount?: number;
  /**
   * Render the first/last buttons.
   * @default true
   */
  showEdgeButtons?: boolean;
  totalCount?: number;
}

/**
 * Props-driven for the common case; pass `children` to compose the parts
 * yourself instead. Same shape as `Progress`, which also renders a default
 * composition when given no children.
 */
export const TablePagination = ({
  children,
  className,
  onPageIndexChange,
  onPageSizeChange,
  pageCount,
  pageIndex,
  pageSize,
  pageSizeOptions,
  ref,
  selectedCount,
  showEdgeButtons = true,
  totalCount,
  ...props
}: TablePaginationProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center justify-between gap-4 px-2", className)}
    data-slot="table-pagination"
    ref={ref}
    {...props}
  >
    {children ?? (
      <>
        <TablePaginationInfo
          selectedCount={selectedCount}
          totalCount={totalCount}
        />
        <TablePaginationControls>
          {pageSize === undefined ? null : (
            <TablePaginationPageSize
              onValueChange={onPageSizeChange}
              options={pageSizeOptions}
              value={pageSize}
            />
          )}
          <TablePaginationStatus pageCount={pageCount} pageIndex={pageIndex} />
          <TablePaginationButtons
            onPageIndexChange={onPageIndexChange}
            pageCount={pageCount}
            pageIndex={pageIndex}
            showEdgeButtons={showEdgeButtons}
          />
        </TablePaginationControls>
      </>
    )}
  </div>
);

TablePagination.displayName = "TablePagination";
