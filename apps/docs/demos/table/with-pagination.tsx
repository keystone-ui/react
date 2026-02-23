"use client";

import { Badge } from "@keystoneui/react/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@keystoneui/react/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";
import { useMemo, useState } from "react";

const allInvoices = Array.from({ length: 20 }, (_, i) => ({
  invoice: `INV${String(i + 1).padStart(3, "0")}`,
  status: (["Paid", "Pending", "Unpaid"] as const)[i % 3],
  amount: `$${((i + 1) * 75).toFixed(2)}`,
  method: (["Credit Card", "PayPal", "Bank Transfer"] as const)[i % 3],
}));

const PAGE_SIZE = 5;

const statusVariant = (status: string) => {
  switch (status) {
    case "Paid":
      return "secondary" as const;
    case "Pending":
      return "outline" as const;
    case "Unpaid":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

export default function TableWithPagination() {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(allInvoices.length / PAGE_SIZE);

  const rows = useMemo(
    () => allInvoices.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [page]
  );

  return (
    <div className="flex flex-col gap-4">
      <Table hoverable>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((invoice) => (
            <TableRow key={invoice.invoice}>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(invoice.status)}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>{invoice.method}</TableCell>
              <TableCell className="text-right">{invoice.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Page {page + 1} of {pageCount}
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className={page === 0 ? "pointer-events-none opacity-50" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => p - 1);
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                className={
                  page >= pageCount - 1 ? "pointer-events-none opacity-50" : ""
                }
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => p + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
