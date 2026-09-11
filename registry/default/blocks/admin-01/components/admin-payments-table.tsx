"use client";

import { ExternalLinkIcon } from "lucide-react";
import { AdminPaymentsToolbar } from "@/components/admin-payments-toolbar";
import {
  PAYMENT_STATUS_VARIANT,
  type Payment,
  paymentStatusLabels,
  paymentTypeLabels,
  truncateId,
} from "@/components/mock-payments";
import type {
  PaymentFilters,
  SortOptionId,
  SortState,
} from "@/components/payment-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";

interface AdminPaymentsTableProps {
  filters: PaymentFilters;
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
  filters,
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
    <Card variant="outline">
      <CardHeader>
        <CardTitle>Payments</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <AdminPaymentsToolbar
          filters={filters}
          onChange={onFiltersChange}
          onClear={onFiltersClear}
          onSortChange={onSortChange}
          sort={sort}
        />

        <Table hoverable>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[136px]">Payment ID</TableHead>
              <TableHead>Player</TableHead>
              <TableHead numeric>Amount</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
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
                        className="cursor-pointer rounded-sm font-mono text-xs hover:underline focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2"
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
                  <TableCell numeric>
                    <span className="font-mono text-xs">{row.amount}</span>
                  </TableCell>
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
                  <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                    {row.createdAt}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
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
  );
}
