"use client";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  directionsFor,
  type SortDirection,
  type SortState,
} from "@/components/sort";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableHead, TableSortButton } from "@/components/ui/table";

const DIRECTION_ICON = { asc: ArrowUpIcon, desc: ArrowDownIcon } as const;

/**
 * The toolbar's Sort menu: which column, then which way.
 *
 * Two radio groups rather than every column × direction pair, so flipping the
 * direction does not mean finding the column again. A new column takes its
 * natural direction, and the direction list leads with it, so the common pick
 * is always the first one. The directions are named for the column —
 * `Newest first`, `A–Z` — because "ascending" says nothing about what you will
 * see.
 *
 * It writes the same `sort` the column headers do, so a header click moves this
 * menu's check and the other way round, with no syncing code.
 */
export function SortMenu<K extends string>({
  defaultDirection,
  directionLabel,
  keys,
  onSortChange,
  sort,
}: {
  defaultDirection: (key: K) => SortDirection;
  directionLabel: (key: K, direction: SortDirection) => string;
  keys: readonly { id: K; label: string }[];
  onSortChange: (sort: SortState<K>) => void;
  sort: SortState<K>;
}) {
  const label = keys.find((option) => option.id === sort.key)?.label ?? "Sort";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
        <ArrowUpDownIcon />
        <span className="font-normal text-muted-foreground">Sort:</span>
        {label}
        <span className="font-normal text-muted-foreground">
          ({directionLabel(sort.key, sort.direction)})
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            onValueChange={(value) => {
              const key = value as K;
              onSortChange({ direction: defaultDirection(key), key });
            }}
            value={sort.key}
          >
            {keys.map((option) => (
              <DropdownMenuRadioItem key={option.id} value={option.id}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            onValueChange={(value) =>
              onSortChange({ direction: value as SortDirection, key: sort.key })
            }
            value={sort.direction}
          >
            {directionsFor(defaultDirection(sort.key)).map((direction) => {
              const Icon = DIRECTION_ICON[direction];
              return (
                <DropdownMenuRadioItem key={direction} value={direction}>
                  <Icon />
                  {directionLabel(sort.key, direction)}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * A sortable column header.
 *
 * Clicking an inactive column sorts it in its natural direction — the same
 * `defaultDirection` the Sort menu uses, so a header and the menu agree on
 * what picking a column means. Clicking the active one flips it. There is no
 * third, unsorted click: these tables always have an order.
 *
 * Only on columns that sort. A column that does not passes no `sortDirection`
 * to its `TableHead` at all — `null` would claim it sorts and is merely
 * inactive, and put `aria-sort` on a header that does nothing.
 */
export function SortableHead<K extends string>({
  children,
  className,
  columnKey,
  defaultDirection,
  numeric,
  onSortChange,
  sort,
}: {
  children: ReactNode;
  className?: string;
  columnKey: K;
  defaultDirection: (key: K) => SortDirection;
  numeric?: boolean;
  onSortChange: (sort: SortState<K>) => void;
  sort: SortState<K>;
}) {
  const active = sort.key === columnKey;
  const direction = active ? sort.direction : null;
  const flipped: SortDirection = sort.direction === "asc" ? "desc" : "asc";

  return (
    <TableHead
      className={className}
      numeric={numeric}
      sortDirection={direction}
    >
      <TableSortButton
        direction={direction}
        onClick={() =>
          onSortChange({
            direction: active ? flipped : defaultDirection(columnKey),
            key: columnKey,
          })
        }
      >
        {children}
      </TableSortButton>
    </TableHead>
  );
}
