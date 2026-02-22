"use client";

import { Button } from "@keystoneui/react/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";
import { MoreHorizontalIcon } from "lucide-react";

const products = [
  { name: "Wireless Mouse", price: "$29.99" },
  { name: "Mechanical Keyboard", price: "$129.99" },
  { name: "USB-C Hub", price: "$49.99" },
];

export default function TableActions() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.name}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.price}</TableCell>
            <TableCell className="text-right">
              <Button size="icon-sm" variant="ghost">
                <MoreHorizontalIcon />
                <span className="sr-only">Open menu</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
