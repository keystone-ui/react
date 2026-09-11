"use client";

import { Button } from "@keystoneui/react/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { Search as SearchIcon } from "lucide-react";

import { FilterTrigger } from "./filter-trigger";
import { AddFilterMenu, PaymentFilterPill } from "./payment-filter-pills";
import {
  addableKeys,
  type FilterKey,
  hasActiveFilters,
  type PaymentFilters,
  SORT_OPTIONS,
  type SortOptionId,
  type SortState,
  sortLabel,
  toSortOptionId,
  visibleKeys,
} from "./payment-filters";
import { PaymentFiltersDrawer } from "./payment-filters-drawer";

interface AdminPaymentsToolbarProps {
  added: readonly FilterKey[];
  filters: PaymentFilters;
  onAdd: (key: FilterKey) => void;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onClear: () => void;
  onRemove: (key: FilterKey) => void;
  onSortChange: (id: SortOptionId) => void;
  sort: SortState;
}

/**
 * Search, then one self-describing pill per filter, then `+ Add filter`.
 *
 * Each pill names its own dimension — `Action: Deposit` rather than `Deposit`
 * — which is what lets the control double as the record of what is applied.
 * That is why there is no chip row underneath: a chip repeating a pill you can
 * already see is a second copy of the same fact, and the two can drift.
 *
 * Six pills at once would wrap before anyone had used one, so only the two
 * most common cuts are permanent and the rest are added on demand. A filter
 * that holds a value always shows its pill regardless — see `visibleKeys`.
 *
 * Below `sm` the pills fold away and the drawer carries the whole filter set,
 * the same fork the users toolbar uses. A row of pills becomes a column of
 * pills on a phone, which buries the table it is filtering.
 */
export function AdminPaymentsToolbar({
  added,
  filters,
  onAdd,
  onChange,
  onClear,
  onRemove,
  onSortChange,
  sort,
}: AdminPaymentsToolbarProps) {
  const visible = visibleKeys(filters, added);
  const addable = addableKeys(filters, added);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="min-w-0 flex-1 sm:max-w-xs">
        <InputGroupAddon align="inline-start">
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search payments by email"
          onChange={(event) => onChange({ email: event.target.value })}
          placeholder="Search email…"
          type="search"
          value={filters.email}
        />
      </InputGroup>

      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {visible.map((key) => (
          <PaymentFilterPill
            filters={filters}
            key={key}
            onChange={onChange}
            onRemove={onRemove}
            pillKey={key}
          />
        ))}

        <AddFilterMenu keys={addable} onAdd={onAdd} />

        {/* Sorting is not filtering, but it is the same kind of control and
            reads best on the same rung. It keeps its label because "Created,
            newest" alone does not say it is an ordering. */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<FilterTrigger label="Sort" />}>
            {sortLabel(sort)}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) => onSortChange(value as SortOptionId)}
                value={toSortOptionId(sort)}
              >
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option.id} value={option.id}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters(filters) && (
          <Button onClick={onClear} variant="ghost">
            Clear all
          </Button>
        )}
      </div>

      <div className="shrink-0 sm:hidden">
        <PaymentFiltersDrawer
          filters={filters}
          onChange={onChange}
          onClear={onClear}
          onSortChange={onSortChange}
          sort={sort}
        />
      </div>
    </div>
  );
}
