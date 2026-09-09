"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";
import { TablePagination } from "@keystoneui/react/table-pagination";
import { useMemo, useState } from "react";

const rows = Array.from({ length: 23 }, (_, index) => ({
  amount: 120 + index * 37,
  id: index + 1,
  invoice: `INV-${String(1001 + index)}`,
  status: index % 3 === 0 ? "Paid" : "Pending",
}));

export default function TablePaginationDefault() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = useMemo(
    () => rows.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
    [pageIndex, pageSize]
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <Table hoverable>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead numeric>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {page.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.invoice}</TableCell>
              <TableCell className="text-muted-foreground">
                {row.status}
              </TableCell>
              <TableCell numeric>${row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        onPageIndexChange={setPageIndex}
        onPageSizeChange={(size) => {
          setPageSize(size);
          // Page 3 of a 10-per-page list does not exist at 50 per page.
          setPageIndex(0);
        }}
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        selectedCount={0}
        totalCount={rows.length}
      />
    </div>
  );
}
