"use client";

import { ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AdminPaymentsToolbar } from "@/components/admin-payments-toolbar";
import {
  PAYMENT_STATUS_VARIANT,
  type Payment,
  paymentStatusLabels,
  paymentTypeLabels,
  truncateId,
} from "@/components/mock-payments";
import type {
  FilterKey,
  PaymentFilters,
  PaymentSortKey,
  SortOptionId,
  SortState,
} from "@/components/payment-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
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

interface AdminPaymentsTableProps {
  addedFilters: readonly FilterKey[];
  filters: PaymentFilters;
  onFilterAdd: (key: FilterKey) => void;
  onFiltersChange: (patch: Partial<PaymentFilters>) => void;
  onFiltersClear: () => void;
  onOpenPayment: (id: string) => void;
  onPageIndexChange: (index: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (id: SortOptionId) => void;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  rows: readonly Payment[];
  sort: SortState;
  totalCount: number;
}

export function AdminPaymentsTable({
  addedFilters,
  filters,
  onFilterAdd,
  onFiltersChange,
  onFiltersClear,
  onOpenPayment,
  onPageIndexChange,
  onPageSizeChange,
  onSortChange,
  pageCount,
  pageIndex,
  pageSize,
  rows,
  sort,
  totalCount,
}: AdminPaymentsTableProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      {/* A real `h1`, and the page's only heading. `CardTitle` renders a div,
          so the section had no heading outline at all — a screen reader moving
          by headings found nothing here. It also sat inside the card, which
          made the panel announce itself rather than the page. */}
      <h1 className="font-semibold text-2xl tracking-tight">Payments</h1>

      <Card variant="outline">
        <CardContent className="flex flex-col gap-4">
          <AdminPaymentsToolbar
            added={addedFilters}
            filters={filters}
            onAdd={onFilterAdd}
            onChange={onFiltersChange}
            onClear={onFiltersClear}
          />

          <ResultSummary
            pageIndex={pageIndex}
            pageSize={pageSize}
            rowCount={rows.length}
            totalCount={totalCount}
          />

          <Table hoverable>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[136px]">Payment ID</TableHead>
                {/* Only the four columns that actually sort carry a button.
                  `sortDirection` is omitted rather than passed as `null` on
                  the rest — `null` claims a column sorts and is merely
                  inactive, which would put `aria-sort` on eight headers when
                  four of them do nothing. */}
                <SortableHead
                  columnKey="playerEmail"
                  onSort={onSortChange}
                  sort={sort}
                >
                  Player
                </SortableHead>
                <SortableHead
                  columnKey="amount"
                  numeric
                  onSort={onSortChange}
                  sort={sort}
                >
                  Amount
                </SortableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Type</TableHead>
                <SortableHead
                  columnKey="status"
                  onSort={onSortChange}
                  sort={sort}
                >
                  Status
                </SortableHead>
                <SortableHead
                  columnKey="createdAt"
                  onSort={onSortChange}
                  sort={sort}
                >
                  Created
                </SortableHead>
                <TableHead>Finished</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={8}>
                  No payments match these filters.
                </TableEmpty>
              ) : (
                rows.map((row) => (
                  <TableRow className="group/row" key={row.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* Middle-truncated: the head and tail are what someone
                          eyeballs against another system, and the full value is
                          one click away on the clipboard or the record. */}
                        <button
                          className="cursor-pointer rounded-sm font-mono text-muted-foreground text-xs hover:underline focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2"
                          onClick={() => onOpenPayment(row.id)}
                          type="button"
                        >
                          {truncateId(row.id)}
                        </button>
                        <CopyButton size="icon-xs" value={row.id} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{row.playerEmail}</span>
                        <Button
                          aria-label={`Open payment ${truncateId(row.id)}`}
                          className="shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover/row:opacity-100"
                          onClick={() => onOpenPayment(row.id)}
                          size="sm"
                          variant="outline"
                        >
                          <ExternalLinkIcon className="size-3.5" />
                          Open
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell numeric>{row.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.currency}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {paymentTypeLabels[row.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={PAYMENT_STATUS_VARIANT[row.status]}>
                        {paymentStatusLabels[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.createdAt}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.finishedAt ?? "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination
            onPageIndexChange={onPageIndexChange}
            onPageSizeChange={onPageSizeChange}
            pageCount={pageCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalCount={totalCount}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * A sortable column header.
 *
 * Clicking an inactive column sorts it descending first — for dates and
 * amounts the interesting end is the large one, and starting ascending would
 * make every first click a wasted one.
 */
function SortableHead({
  children,
  columnKey,
  numeric,
  onSort,
  sort,
}: {
  children: ReactNode;
  columnKey: PaymentSortKey;
  numeric?: boolean;
  onSort: (id: SortOptionId) => void;
  sort: SortState;
}) {
  const active = sort.key === columnKey;
  const direction = active ? sort.direction : null;

  return (
    <TableHead numeric={numeric} sortDirection={direction}>
      <TableSortButton
        direction={direction}
        onClick={() =>
          onSort(
            `${columnKey}:${active && sort.direction === "desc" ? "asc" : "desc"}`
          )
        }
      >
        {children}
      </TableSortButton>
    </TableHead>
  );
}

/**
 * How much of the result set is on screen.
 *
 * The pagination footer answers "which page", which is a different question —
 * it reads `Page 1 of 2` whether that page holds ten rows or one. This says
 * how many rows there are and which of them you are looking at.
 *
 * `aria-live` because it is the only feedback a filter change produces for
 * someone who cannot see the table shrink. Polite, so it waits its turn
 * rather than interrupting the control being operated.
 */
function ResultSummary({
  pageIndex,
  pageSize,
  rowCount,
  totalCount,
}: {
  pageIndex: number;
  pageSize: number;
  rowCount: number;
  totalCount: number;
}) {
  // The empty row already says no payments match; a summary reading "0 of 0"
  // underneath it just says the same thing with less grace.
  if (totalCount === 0) {
    return null;
  }

  const first = pageIndex * pageSize + 1;
  const last = pageIndex * pageSize + rowCount;

  return (
    <p aria-live="polite" className="text-muted-foreground text-sm">
      Showing {first}–{last} of {totalCount}{" "}
      {totalCount === 1 ? "payment" : "payments"}
    </p>
  );
}
