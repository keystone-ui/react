"use client";

import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import { Card, CardContent } from "@keystoneui/react/card";
import { CopyButton } from "@keystoneui/react/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
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
import {
  TablePagination,
  TablePaginationButtons,
  TablePaginationControls,
  TablePaginationInfo,
  TablePaginationPageSize,
  TablePaginationStatus,
} from "@keystoneui/react/table-pagination";
import {
  Copy as CopyIcon,
  Eye as EyeIcon,
  Ellipsis as MoreHorizontalIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { AdminPaymentsToolbar } from "./admin-payments-toolbar";
import {
  PAYMENT_STATUS_VARIANT,
  type Payment,
  paymentStatusLabels,
  paymentTypeLabels,
  truncateId,
} from "./mock-payments";
import type {
  FilterKey,
  PaymentFilters,
  PaymentSortKey,
  SortOptionId,
  SortState,
} from "./payment-filters";
import { ResultSummary } from "./result-summary";

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
                {/* No visible label: the column is one icon wide, and "Actions"
                    above it would size the column from the header rather than
                    from the control. */}
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={9}>
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
                      <span className="truncate">{row.playerEmail}</span>
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
                    <TableCell>
                      <RowActions
                        onOpen={() => onOpenPayment(row.id)}
                        paymentId={row.id}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Composed rather than props-driven: the info slot only renders a
              selection count from props, and this table has no selection. The
              parts are otherwise the default composition. */}
          <TablePagination pageCount={pageCount} pageIndex={pageIndex}>
            <TablePaginationInfo>
              <ResultSummary
                noun={["payment", "payments"]}
                pageIndex={pageIndex}
                pageSize={pageSize}
                rowCount={rows.length}
                totalCount={totalCount}
              />
            </TablePaginationInfo>
            <TablePaginationControls>
              <TablePaginationPageSize
                onValueChange={onPageSizeChange}
                value={pageSize}
              />
              <TablePaginationStatus
                pageCount={pageCount}
                pageIndex={pageIndex}
              />
              <TablePaginationButtons
                onPageIndexChange={onPageIndexChange}
                pageCount={pageCount}
                pageIndex={pageIndex}
              />
            </TablePaginationControls>
          </TablePagination>
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
 * Row actions, in a trailing menu rather than a hover-revealed button.
 *
 * The button it replaces was unreachable on touch: there is no hover, and
 * `focus-visible:opacity-100` only rescues a keyboard. A ledger is also where
 * per-row actions accumulate — refund, export receipt, open the player — and a
 * menu absorbs those where a row of inline buttons cannot.
 *
 * "Copy payment ID" duplicates the icon button beside the id deliberately:
 * that one is the fast path for a value the table shows truncated, this one is
 * the labelled path for anyone who would not read an unlabelled icon.
 */
function RowActions({
  onOpen,
  paymentId,
}: {
  onOpen: () => void;
  paymentId: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
        <MoreHorizontalIcon />
        <span className="sr-only">
          Actions for payment {truncateId(paymentId)}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onOpen}>
            <EyeIcon />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              // No "Copied" state to hold — the menu closes on click — so this
              // needs none of what `CopyButton` manages beyond awaiting the
              // write and not throwing where the clipboard is unavailable.
              try {
                await navigator.clipboard.writeText(paymentId);
              } catch {
                // Insecure context or permission denied; nothing to undo.
              }
            }}
          >
            <CopyIcon />
            Copy payment ID
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
