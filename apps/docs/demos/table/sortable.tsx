"use client";

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
import { useMemo, useState } from "react";

type SortKey = "deploys" | "leadTime" | "squad";
type SortDirection = "asc" | "desc";

interface Row {
  deploys: number;
  leadTime: number;
  squad: string;
}

const rows: Row[] = [
  { deploys: 42, leadTime: 72, squad: "Platform" },
  { deploys: 31, leadTime: 124, squad: "Payments" },
  { deploys: 18, leadTime: 227, squad: "Growth" },
  { deploys: 27, leadTime: 96, squad: "Identity" },
];

const columns = [
  { key: "squad", label: "Squad", numeric: false },
  { key: "deploys", label: "Deploys", numeric: true },
  { key: "leadTime", label: "Lead time p50", numeric: true },
] as const;

const formatLeadTime = (minutes: number) =>
  minutes < 60
    ? `${minutes}m`
    : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

export default function TableSortable() {
  // Three-state cycle: unsorted -> desc -> asc -> unsorted. A new column starts
  // descending, which is what you want for a metric.
  const [sort, setSort] = useState<{
    direction: SortDirection;
    key: SortKey;
  } | null>({ direction: "desc", key: "deploys" });

  const sorted = useMemo(() => {
    if (!sort) {
      return rows;
    }
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      if (typeof left === "string" && typeof right === "string") {
        return left.localeCompare(right) * factor;
      }
      return ((left as number) - (right as number)) * factor;
    });
  }, [sort]);

  const cycle = (key: SortKey) => {
    setSort((current) => {
      if (current?.key !== key) {
        return { direction: "desc", key };
      }
      if (current.direction === "desc") {
        return { direction: "asc", key };
      }
      return null;
    });
  };

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              numeric={column.numeric}
              // Omitted would mean "not sortable"; null means sortable but
              // not the active column.
              sortDirection={sort?.key === column.key ? sort.direction : null}
            >
              <TableSortButton
                direction={sort?.key === column.key ? sort.direction : null}
                onClick={() => cycle(column.key)}
              >
                {column.label}
              </TableSortButton>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.length === 0 ? (
          <TableEmpty colSpan={columns.length}>
            <p className="py-10 text-center text-muted-foreground text-sm">
              No squads in this period.
            </p>
          </TableEmpty>
        ) : (
          sorted.map((row) => (
            <TableRow key={row.squad}>
              <TableCell className="font-medium">{row.squad}</TableCell>
              <TableCell numeric>{row.deploys}</TableCell>
              <TableCell numeric>{formatLeadTime(row.leadTime)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
