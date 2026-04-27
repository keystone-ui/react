"use client";

import { Button } from "@keystoneui/react/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";
import {
  ArrowUpDownIcon,
  KanbanIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  TableIcon,
} from "lucide-react";

import { statusLabels, type TicketStatus } from "./mock-tickets";
import { TicketsFiltersDrawer } from "./tickets-filters-drawer";
import { type TicketColumnId, ticketColumns } from "./tickets-table";

export type SortPreset =
  | "manual"
  | "board-order"
  | "priority-desc"
  | "past-due"
  | "escalated";
export type ViewMode = "table" | "board";
export type StatusFilter = "all" | TicketStatus;

export const sortPresetLabels: Record<SortPreset, string> = {
  manual: "Manual",
  "board-order": "Board order",
  "priority-desc": "Priority high → low",
  "past-due": "Past due first",
  escalated: "Escalated first",
};

interface TicketsToolbarProps {
  onSearchChange: (next: string) => void;
  onSortPresetChange: (next: SortPreset) => void;
  onStatusFilterChange: (next: StatusFilter) => void;
  onToggleColumn: (id: TicketColumnId) => void;
  onViewChange: (next: ViewMode) => void;
  searchQuery: string;
  sortPreset: SortPreset;
  statusFilter: StatusFilter;
  view: ViewMode;
  visibleColumns: Set<TicketColumnId>;
}

export function TicketsToolbar({
  searchQuery,
  onSearchChange,
  view,
  onViewChange,
  sortPreset,
  onSortPresetChange,
  statusFilter,
  onStatusFilterChange,
  visibleColumns,
  onToggleColumn,
}: TicketsToolbarProps) {
  return (
    <div className="flex flex-row items-center gap-2 sm:justify-between sm:gap-3">
      <InputGroup className="min-w-0 flex-1 sm:max-w-md">
        <InputGroupAddon align="inline-start">
          <SearchIcon className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tickets by subject, customer, or ID…"
          type="search"
          value={searchQuery}
        />
      </InputGroup>

      {/* Mobile: single Filters button → opens drawer */}
      <div className="shrink-0 sm:hidden">
        <TicketsFiltersDrawer
          onSortPresetChange={onSortPresetChange}
          onStatusFilterChange={onStatusFilterChange}
          onToggleColumn={onToggleColumn}
          onViewChange={onViewChange}
          sortPreset={sortPreset}
          statusFilter={statusFilter}
          view={view}
          visibleColumns={visibleColumns}
        />
      </div>

      {/* Desktop: full button cluster */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            <ArrowUpDownIcon />
            {sortPresetLabels[sortPreset]}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  onSortPresetChange(value as SortPreset)
                }
                value={sortPreset}
              >
                {(
                  [
                    "manual",
                    "board-order",
                    "priority-desc",
                    "past-due",
                    "escalated",
                  ] as const
                ).map((preset) => (
                  <DropdownMenuRadioItem key={preset} value={preset}>
                    {sortPresetLabels[preset]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            <SlidersHorizontalIcon />
            Table options
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              {ticketColumns.map((column) => {
                const checked = visibleColumns.has(column.id);
                return (
                  <DropdownMenuCheckboxItem
                    checked={checked}
                    closeOnClick={false}
                    key={column.id}
                    onCheckedChange={() => onToggleColumn(column.id)}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            {statusFilter === "all"
              ? "All Statuses"
              : statusLabels[statusFilter]}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  onStatusFilterChange(value as StatusFilter)
                }
                value={statusFilter}
              >
                <DropdownMenuRadioItem value="all">
                  All Statuses
                </DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value="open">Open</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pending">
                  Pending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="resolved">
                  Resolved
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="closed">
                  Closed
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToggleGroup
          aria-label="View"
          onValueChange={(next) => {
            const last = next.at(-1);
            if (last === "board" || last === "table") {
              onViewChange(last);
            }
          }}
          value={[view]}
          variant="outline"
        >
          <ToggleGroupItem aria-label="Board view" value="board">
            <KanbanIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Table view" value="table">
            <TableIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
