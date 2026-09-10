"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";

const rows = Array.from({ length: 24 }, (_, index) => ({
  deploys: 60 - index * 2,
  id: index + 1,
  squad: `Squad ${String(index + 1).padStart(2, "0")}`,
}));

export default function TableStickyHeader() {
  return (
    <Table
      // The container pins overflow-y to hidden by default, because letting it
      // be promoted to auto renders a permanent vertical gutter inside every
      // table on macOS with "Show scrollbars: Always". A scrolling viewport is
      // therefore opt-in, and it needs a height cap: `position: sticky`
      // resolves against the nearest scrollport, so without one there is
      // nothing for the header to stick within.
      containerClassName="max-h-64 overflow-y-auto"
      hoverable
    >
      <TableHeader className="sticky top-0 z-[var(--z-sticky)] bg-background print:static">
        <TableRow>
          <TableHead>Squad</TableHead>
          <TableHead numeric>Deploys</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.squad}</TableCell>
            <TableCell numeric>{row.deploys}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
