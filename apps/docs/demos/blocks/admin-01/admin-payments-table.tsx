"use client";

import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import { Card, CardContent } from "@keystoneui/react/card";
import { Checkbox } from "@keystoneui/react/checkbox";
import { CopyButton } from "@keystoneui/react/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  SelectionBar,
  SelectionBarButton,
  SelectionBarClose,
  SelectionBarGroup,
  SelectionBarLabel,
} from "@keystoneui/react/selection-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  Download as DownloadIcon,
  Eye as EyeIcon,
  Ellipsis as MoreHorizontalIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { AdminPaymentsToolbar } from "./admin-payments-toolbar";
import { downloadCsv } from "./csv";
import { FilteredEmpty } from "./filtered-empty";
import {
  formatAmount,
  PAYMENT_STATUS_VARIANT,
  type Payment,
  paymentStatusLabels,
  payments,
  paymentTypeLabels,
  truncateId,
} from "./mock-payments";
import {
  defaultDirection,
  hasActiveFilters,
  PAGE_SIZES,
  type PaymentSortKey,
  toPaymentsCsv,
} from "./payment-filters";
import { ResultSummary } from "./result-summary";
import { SkeletonRows } from "./skeleton-rows";
import { SortableHead } from "./sort-menu";
import type { PaymentColumnId, PaymentsTableState } from "./use-payments-table";

interface PaymentColumn {
  cell: (row: Payment) => ReactNode;
  /** Classes for the body cell. */
  className?: string;
  id: PaymentColumnId;
  label: string;
  numeric?: boolean;
  /** Present on the columns that sort. */
  sortKey?: PaymentSortKey;
}

/**
 * The columns a person can show or hide, in order. The payment id, the
 * selection checkbox and the actions are not here: they identify and act on a
 * row, so they are always on.
 */
const COLUMNS: readonly PaymentColumn[] = [
  {
    cell: (row) => <span className="truncate">{row.playerEmail}</span>,
    id: "playerEmail",
    label: "Player",
    sortKey: "playerEmail",
  },
  {
    // The raw string rides along, so a test can read the value the sort used
    // rather than parsing the formatted one back.
    cell: (row) => (
      <span data-amount={row.amount}>
        {formatAmount(row.amount, row.currency)}
      </span>
    ),
    id: "amount",
    label: "Amount",
    numeric: true,
    sortKey: "amount",
  },
  {
    cell: (row) => <Badge variant="outline">{row.currency}</Badge>,
    id: "currency",
    label: "Currency",
  },
  {
    cell: (row) => (
      <Badge variant="outline">{paymentTypeLabels[row.type]}</Badge>
    ),
    id: "type",
    label: "Type",
  },
  {
    cell: (row) => (
      <Badge variant={PAYMENT_STATUS_VARIANT[row.status]}>
        {paymentStatusLabels[row.status]}
      </Badge>
    ),
    id: "status",
    label: "Status",
    sortKey: "status",
  },
  {
    cell: (row) => row.createdAt,
    className: "text-muted-foreground",
    id: "createdAt",
    label: "Created",
    sortKey: "createdAt",
  },
  {
    cell: (row) => row.finishedAt ?? "-",
    className: "text-muted-foreground",
    id: "finishedAt",
    label: "Finished",
    sortKey: "finishedAt",
  },
];

const PAYMENT_COLUMNS = COLUMNS.map(({ id, label }) => ({ id, label }));

export function AdminPaymentsTable({
  onOpenPayment,
  table,
}: {
  onOpenPayment: (id: string) => void;
  table: PaymentsTableState;
}) {
  const { loading, result, selected } = table;
  const visible = COLUMNS.filter(
    (column) => !table.hiddenColumns.has(column.id)
  );
  const allOnPageSelected =
    result.page.length > 0 && result.page.every((row) => selected.has(row.id));

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        {/* A real `h1`, and the page's only heading. `CardTitle` renders a div,
            so the section had no heading outline at all — a screen reader
            moving by headings found nothing here. It also sat inside the card,
            which made the panel announce itself rather than the page. */}
        <h1 className="font-semibold text-2xl tracking-tight">Payments</h1>

        <Card variant="outline">
          <CardContent className="flex flex-col gap-4">
            <AdminPaymentsToolbar columns={PAYMENT_COLUMNS} table={table} />

            {/* `aria-busy` is the loading announcement; the skeleton rows
                underneath are hidden from assistive tech. */}
            <Table aria-busy={loading} hoverable>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Select all payments on this page"
                      checked={allOnPageSelected}
                      disabled={loading}
                      onCheckedChange={(checked) =>
                        table.togglePage(checked === true)
                      }
                    />
                  </TableHead>
                  <TableHead className="w-[136px]">Payment ID</TableHead>
                  {visible.map((column) =>
                    column.sortKey ? (
                      <SortableHead
                        columnKey={column.sortKey}
                        defaultDirection={defaultDirection}
                        key={column.id}
                        numeric={column.numeric}
                        onSortChange={table.setSort}
                        sort={table.sort}
                      >
                        {column.label}
                      </SortableHead>
                    ) : (
                      // Not sortable, so no `sortDirection` at all — see
                      // `SortableHead`.
                      <TableHead key={column.id} numeric={column.numeric}>
                        {column.label}
                      </TableHead>
                    )
                  )}
                  {/* No visible label: the column is one icon wide, and
                      "Actions" above it would size the column from the header
                      rather than from the control. */}
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <SkeletonRows
                    checkbox
                    columns={visible.length + 1}
                    count={result.page.length || table.pageSize}
                  />
                ) : null}
                {!loading && result.page.length === 0 ? (
                  <FilteredEmpty
                    colSpan={visible.length + 3}
                    filtered={hasActiveFilters(table.filters)}
                    noun="payments"
                    onClear={table.clearFilters}
                  />
                ) : null}
                {loading
                  ? null
                  : result.page.map((row) => (
                      <TableRow
                        className="group/row"
                        data-state={
                          selected.has(row.id) ? "selected" : undefined
                        }
                        key={row.id}
                      >
                        <TableCell>
                          <Checkbox
                            aria-label={`Select payment ${truncateId(row.id)}`}
                            checked={selected.has(row.id)}
                            onCheckedChange={() => table.toggleRow(row.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {/* Middle-truncated: the head and tail are what
                                someone eyeballs against another system, and
                                the full value is one click away on the
                                clipboard or the record. */}
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
                        {visible.map((column) => (
                          <TableCell
                            className={column.className}
                            data-column={column.id}
                            key={column.id}
                            numeric={column.numeric}
                          >
                            {column.cell(row)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <RowActions
                            onOpen={() => onOpenPayment(row.id)}
                            paymentId={row.id}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>

            {/* Composed rather than props-driven: the info slot's only
                props-driven content is a selection count, which the
                `SelectionBar` already states — at every width, where this slot
                is `hidden lg:block`. */}
            <TablePagination
              pageCount={result.pageCount}
              pageIndex={table.pageIndex}
            >
              <TablePaginationInfo>
                <ResultSummary
                  noun={["payment", "payments"]}
                  pageIndex={table.pageIndex}
                  pageSize={table.pageSize}
                  rowCount={result.page.length}
                  totalCount={result.total}
                />
              </TablePaginationInfo>
              <TablePaginationControls>
                <TablePaginationPageSize
                  onValueChange={table.setPageSize}
                  options={PAGE_SIZES}
                  value={table.pageSize}
                />
                <TablePaginationStatus
                  pageCount={result.pageCount}
                  pageIndex={table.pageIndex}
                />
                <TablePaginationButtons
                  onPageIndexChange={table.setPageIndex}
                  pageCount={result.pageCount}
                  pageIndex={table.pageIndex}
                />
              </TablePaginationControls>
            </TablePagination>
          </CardContent>
        </Card>
      </div>

      <PaymentSelectionBar onClear={table.clearSelection} selected={selected} />
    </>
  );
}

/**
 * What to do with the rows you ticked. Only actions this block can actually
 * perform: a ledger's real bulk actions — refund, retry, mark reviewed — need a
 * backend, and a button that does nothing is worse than none.
 *
 * It reads from every payment, not the current result, because a selection
 * outlives the filter that was on when you made it.
 */
function PaymentSelectionBar({
  onClear,
  selected,
}: {
  onClear: () => void;
  selected: ReadonlySet<string>;
}) {
  const [copied, setCopied] = useState(false);
  const rows = payments.filter((payment) => selected.has(payment.id));

  return (
    <SelectionBar open={selected.size > 0}>
      <SelectionBarClose onClick={onClear} />
      <SelectionBarGroup>
        <SelectionBarLabel>
          {selected.size} {selected.size === 1 ? "payment" : "payments"}{" "}
          selected
        </SelectionBarLabel>
      </SelectionBarGroup>
      <SelectionBarButton
        onClick={() =>
          downloadCsv("payments-selected.csv", toPaymentsCsv(rows))
        }
      >
        <DownloadIcon />
        Export
      </SelectionBarButton>
      <SelectionBarButton
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(
              rows.map((row) => row.id).join("\n")
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // Insecure context or permission denied; nothing to undo.
          }
        }}
      >
        <CopyIcon />
        {copied ? "Copied" : "Copy IDs"}
      </SelectionBarButton>
    </SelectionBar>
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
 * that one is the fast path for a value the table shows cut down, this one is
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
