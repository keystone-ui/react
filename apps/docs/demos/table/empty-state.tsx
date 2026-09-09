"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@keystoneui/react/empty";
import {
  Table,
  TableBody,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";
import { Inbox as InboxIcon } from "lucide-react";

export default function TableEmptyState() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* TableEmpty owns the tr/td plumbing and the hover suppression, so
            the message itself is still just an Empty. */}
        <TableEmpty colSpan={4}>
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>No invoices found</EmptyTitle>
              <EmptyDescription>
                There are no invoices matching your filters.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </TableEmpty>
      </TableBody>
    </Table>
  );
}
