"use client";

import { Card, CardHeader, CardTitle } from "@keystoneui/react/card";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
} from "@keystoneui/react/table";
import { TablePagination } from "@keystoneui/react/table-pagination";

import { formatValue } from "./chart-formatters";
import type { PageRow } from "./mock-analytics";

export type PageSortKey = "bounce" | "conversion" | "path" | "views";
export type SortDirection = "asc" | "desc";

const columns = [
  { key: "path", label: "Page", numeric: false },
  { key: "views", label: "Views", numeric: true },
  { key: "bounce", label: "Bounce", numeric: true },
  { key: "conversion", label: "Conversion", numeric: true },
] as const;

interface TopPagesPanelProps {
  onPageIndexChange: (index: number) => void;
  onSort: (key: PageSortKey) => void;
  pageCount: number;
  pageIndex: number;
  rows: readonly PageRow[];
  sort: { direction: SortDirection; key: PageSortKey } | null;
}

export function TopPagesPanel({
  onPageIndexChange,
  onSort,
  pageCount,
  pageIndex,
  rows,
  sort,
}: TopPagesPanelProps) {
  return (
    // The header keeps its padding while the table runs edge to edge, so the
    // table sits in a bare sibling rather than in CardContent.
    <Card variant="outline">
      <CardHeader>
        <CardTitle>Top pages</CardTitle>
      </CardHeader>

      <Table hoverable>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                numeric={column.numeric}
                // `null`, not omitted: every column here sorts, so each one
                // reports aria-sort="none" until it becomes the active column.
                sortDirection={sort?.key === column.key ? sort.direction : null}
              >
                <TableSortButton
                  direction={sort?.key === column.key ? sort.direction : null}
                  onClick={() => onSort(column.key)}
                >
                  {column.label}
                </TableSortButton>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableEmpty colSpan={columns.length}>
              <p className="py-10 text-center text-muted-foreground text-sm">
                No pages in this period.
              </p>
            </TableEmpty>
          ) : (
            rows.map((row) => (
              <TableRow key={row.path}>
                <TableCell className="font-medium">{row.path}</TableCell>
                <TableCell numeric>
                  {formatValue(row.views, "number")}
                </TableCell>
                <TableCell numeric>
                  {formatValue(row.bounce, "percent")}
                </TableCell>
                <TableCell numeric>
                  {formatValue(row.conversion, "percent")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="px-2 pb-1">
        <TablePagination
          onPageIndexChange={onPageIndexChange}
          pageCount={pageCount}
          pageIndex={pageIndex}
        />
      </div>
    </Card>
  );
}
