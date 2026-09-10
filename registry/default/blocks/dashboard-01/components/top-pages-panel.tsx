"use client";

import { formatValue } from "@/components/chart-formatters";
import type { PageRow } from "@/components/mock-analytics";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";

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
    // The table goes in CardContent, so the title, the row separators and the
    // cell text all share the card's horizontal padding. Zeroing the spacing
    // is for a card that is *only* a table -- with a title above it, a flush
    // table leaves the heading indented three times further than the columns.
    <Card variant="outline">
      <CardHeader>
        <CardTitle>Top pages</CardTitle>
      </CardHeader>

      <CardContent>
        <Table hoverable>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  numeric={column.numeric}
                  // `null`, not omitted: every column here sorts, so each one
                  // reports aria-sort="none" until it becomes the active column.
                  sortDirection={
                    sort?.key === column.key ? sort.direction : null
                  }
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
      </CardContent>

      <CardFooter>
        <TablePagination
          className="w-full px-0"
          onPageIndexChange={onPageIndexChange}
          pageCount={pageCount}
          pageIndex={pageIndex}
        />
      </CardFooter>
    </Card>
  );
}
