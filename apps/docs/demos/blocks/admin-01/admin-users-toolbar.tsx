"use client";

import { Button } from "@keystoneui/react/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  X as XIcon,
} from "lucide-react";
import {
  addableKeys,
  defaultDirection,
  directionLabel,
  filterDef,
  hasActiveFilters,
  SORT_KEYS,
  toUsersCsv,
  visibleKeys,
} from "./admin-filters";
import { AdminFiltersDrawer } from "./admin-filters-drawer";
import { ColumnsMenu } from "./columns-menu";
import { downloadCsv } from "./csv";
import { AddFilterMenu, usePillRow } from "./filter-pills";
import { SortMenu } from "./sort-menu";
import type { UserColumnId, UsersTableState } from "./use-users-table";
import { UserFilterPill } from "./user-filter-pills";

/**
 * The users toolbar: the payments toolbar's layout over the users vocabulary.
 *
 * Search, one self-describing pill per filter, `+ Add filter`, Clear all; at
 * the far end Columns, Export and Sort. Below `sm`, search and a Filters
 * drawer. See `AdminPaymentsToolbar` for the reasoning — the point of this
 * file is that there is none of its own to give.
 */
export function AdminUsersToolbar({
  columns,
  table,
}: {
  columns: readonly { id: UserColumnId; label: string }[];
  table: UsersTableState;
}) {
  const { added, filters, patchFilters } = table;
  const row = usePillRow({
    onAdd: table.addFilter,
    onRemove: table.removeFilter,
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* A floor on the field's width, so a full row wraps its right-hand
          group onto a second line rather than crushing search to a stub. */}
      <InputGroup className="min-w-0 flex-1 sm:min-w-56 sm:max-w-xs" size="sm">
        <InputGroupAddon align="inline-start">
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search users"
          onChange={(event) => patchFilters({ search: event.target.value })}
          placeholder="Search name or email…"
          type="search"
          value={filters.search}
        />
      </InputGroup>

      <div
        className="hidden flex-wrap items-center gap-2 sm:flex"
        ref={row.rowRef}
      >
        {visibleKeys(filters, added).map((key) => (
          <UserFilterPill
            autoOpen={key === row.opening}
            filters={filters}
            key={key}
            onChange={patchFilters}
            onPin={table.addFilter}
            onRemove={row.remove}
            pillKey={key}
          />
        ))}

        <AddFilterMenu
          items={addableKeys(filters, added).map((key) => ({
            key,
            label: filterDef(key).label,
          }))}
          onAdd={row.add}
        />

        {hasActiveFilters(filters) && (
          <Button
            className="text-muted-foreground hover:text-foreground"
            onClick={table.clearFilters}
            size="sm"
            variant="ghost"
          >
            <XIcon />
            Clear all
          </Button>
        )}
      </div>

      <div className="hidden shrink-0 items-center gap-2 sm:ml-auto sm:flex">
        <ColumnsMenu
          columns={columns}
          hidden={table.hiddenColumns}
          onToggle={table.toggleColumn}
        />
        <Button
          disabled={table.loading || table.result.total === 0}
          onClick={() => downloadCsv("users.csv", toUsersCsv(table.result.all))}
          size="sm"
          variant="outline"
        >
          <DownloadIcon />
          Export
        </Button>
        <SortMenu
          defaultDirection={defaultDirection}
          directionLabel={directionLabel}
          keys={SORT_KEYS}
          onSortChange={table.setSort}
          sort={table.sort}
        />
      </div>

      <div className="shrink-0 sm:hidden">
        <AdminFiltersDrawer
          filters={filters}
          onChange={patchFilters}
          onClear={table.clearFilters}
          onSortChange={table.setSort}
          sort={table.sort}
        />
      </div>
    </div>
  );
}
