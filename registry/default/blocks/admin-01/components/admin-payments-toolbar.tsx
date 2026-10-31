"use client";

import { DownloadIcon, SearchIcon, XIcon } from "lucide-react";
import { ColumnsMenu } from "@/components/columns-menu";
import { downloadCsv } from "@/components/csv";
import { AddFilterMenu, usePillRow } from "@/components/filter-pills";
import { PaymentFilterPill } from "@/components/payment-filter-pills";
import {
  addableKeys,
  defaultDirection,
  directionLabel,
  filterDef,
  hasActiveFilters,
  SORT_KEYS,
  toPaymentsCsv,
  visibleKeys,
} from "@/components/payment-filters";
import { PaymentFiltersDrawer } from "@/components/payment-filters-drawer";
import { SortMenu } from "@/components/sort-menu";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import type {
  PaymentColumnId,
  PaymentsTableState,
} from "@/components/use-payments-table";

/**
 * Search, then one self-describing pill per filter, then `+ Add filter`; at the
 * far end, how the table is viewed — Columns, Export, Sort.
 *
 * Each pill names its own dimension — `Action: Deposit` rather than `Deposit`
 * — which is what lets the control double as the record of what is applied.
 * That is why there is no chip row underneath: a chip repeating a pill you can
 * already see is a second copy of the same fact, and the two can drift.
 *
 * Six pills at once would wrap before anyone had used one, so the row starts
 * with the two most common cuts and the rest are added on demand. Any pill can
 * come off again. A filter that holds a value always shows its pill
 * regardless — see `visibleKeys`.
 *
 * The right-hand group changes how the rows are shown, not which rows, so it
 * sits apart from the pills and each control names itself — `Sort:` reads as a
 * sort, not one more filter. The headers sort too, and both write the one
 * `sort` state, so a header click moves the menu's check and back.
 *
 * Below `sm` the pills and the right-hand group fold away and the drawer
 * carries the whole filter set, with Sort as its last step. A row of pills
 * becomes a column of pills on a phone, which buries the table it is
 * filtering; a CSV download on a phone lands in a files app nobody opens.
 */
export function AdminPaymentsToolbar({
  columns,
  table,
}: {
  columns: readonly { id: PaymentColumnId; label: string }[];
  table: PaymentsTableState;
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
          aria-label="Search payments by email"
          onChange={(event) => patchFilters({ email: event.target.value })}
          placeholder="Search email…"
          type="search"
          value={filters.email}
        />
      </InputGroup>

      <div
        className="hidden flex-wrap items-center gap-2 sm:flex"
        ref={row.rowRef}
      >
        {visibleKeys(filters, added).map((key) => (
          <PaymentFilterPill
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
          // Muted at rest: undoing everything is the least likely thing you
          // came here to do, and it sits next to the control you probably did.
          // It brightens on hover so it still answers when pointed at.
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
          onClick={() =>
            downloadCsv("payments.csv", toPaymentsCsv(table.result.all))
          }
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
        <PaymentFiltersDrawer
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
