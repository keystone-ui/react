"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Which columns the table shows.
 *
 * Checkbox items that keep the menu open: hiding three columns is three
 * clicks, not three trips through a trigger. The columns that identify a row —
 * the id or name, the selection checkbox, the row's actions — are not listed,
 * because a table without them is a table you cannot act on.
 *
 * A view preference, not part of the query: it stays out of the URL, since a
 * link you send someone should show them the same rows, not your layout.
 */
export function ColumnsMenu<C extends string>({
  columns,
  hidden,
  onToggle,
}: {
  columns: readonly { id: C; label: string }[];
  hidden: ReadonlySet<C>;
  onToggle: (id: C) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
        <SlidersHorizontalIcon />
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show columns</DropdownMenuLabel>
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              checked={!hidden.has(column.id)}
              closeOnClick={false}
              key={column.id}
              onCheckedChange={() => onToggle(column.id)}
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
