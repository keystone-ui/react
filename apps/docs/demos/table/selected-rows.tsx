"use client";

import { Badge } from "@keystoneui/react/badge";
import { Checkbox } from "@keystoneui/react/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";
import { useState } from "react";

const invoices = [
  {
    invoice: "INV001",
    status: "Paid",
    method: "Credit Card",
    amount: "$250.00",
  },
  { invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
  {
    invoice: "INV003",
    status: "Unpaid",
    method: "Bank Transfer",
    amount: "$350.00",
  },
  {
    invoice: "INV004",
    status: "Paid",
    method: "Credit Card",
    amount: "$450.00",
  },
  { invoice: "INV005", status: "Paid", method: "PayPal", amount: "$550.00" },
];

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

export default function TableSelectedRows() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["INV001"]));

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === invoices.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(invoices.map((i) => i.invoice)));
    }
  };

  const allSelected = selected.size === invoices.length;

  return (
    <Table>
      <TableCaption>
        {selected.size} of {invoices.length} row(s) selected.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              aria-label="Select all"
              checked={allSelected}
              indeterminate={selected.size > 0 && !allSelected}
              onCheckedChange={toggleAll}
            />
          </TableHead>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow
            data-state={selected.has(invoice.invoice) ? "selected" : undefined}
            key={invoice.invoice}
          >
            <TableCell>
              <Checkbox
                aria-label={`Select ${invoice.invoice}`}
                checked={selected.has(invoice.invoice)}
                onCheckedChange={() => toggleRow(invoice.invoice)}
              />
            </TableCell>
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
  );
}
