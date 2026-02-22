"use client";

import { Badge } from "@keystoneui/react/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";

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

const statusBadgeVariant = (status: string) => {
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

export default function TableWithBadges() {
  return (
    <Table>
      <TableCaption>Invoice statuses displayed with badges.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>
              <Badge variant={statusBadgeVariant(invoice.status)}>
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
