"use client";

import { Button } from "@keystoneui/react/button";
import {
  DropdownMenu,
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
import {
  ArrowUpDown as ArrowUpDownIcon,
  Search as SearchIcon,
  X as XIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  appliedFilters,
  defaultDirection,
  directionLabel,
  hasActiveFilters,
  SORT_KEYS,
  type SortDirection,
  type SortOptionId,
  type SortState,
  sortKeyLabel,
  type UserFilters,
  type UserSortKey,
} from "./admin-filters";
import { AdminFiltersDrawer } from "./admin-filters-drawer";
import { FilterChip } from "./filter-chip";

interface AdminUsersToolbarProps {
  filters: UserFilters;
  onChange: (patch: Partial<UserFilters>) => void;
  onClear: () => void;
  onSortChange: (id: SortOptionId) => void;
  sort: SortState | null;
}

/**
 * Search, one Filters button, one Sort — and what is applied as a chip row.
 *
 * The alternative to the payments table's inline pills, and the right shape
 * for a different job. Pills suit a table you sit in front of flipping a
 * filter at a time: two clicks to change one, and you can see what is
 * filterable without opening anything. This suits a table you filter once and
 * then read: the chip row *is* the answer to "what is applied", where a row of
 * pills makes you scan six to find the two that are set.
 *
 * It also removes a fork. The drawer is the filter surface at every width, so
 * there is no desktop tree and mobile tree to keep in step — which is how this
 * block once shipped filters that were reachable on no phone at all.
 *
 * Sort keeps its own trigger at `sm+` and its drawer step below. Sorting is
 * not filtering, and burying a one-click control on desktop to make the layout
 * look tidier would be a regression.
 */
export function AdminUsersToolbar({
  filters,
  onChange,
  onClear,
  onSortChange,
  sort,
}: AdminUsersToolbarProps) {
  const applied = appliedFilters(filters);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row items-center gap-2 sm:gap-3">
        <InputGroup className="min-w-0 flex-1 sm:max-w-xs">
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search users"
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Search name or email…"
            type="search"
            value={filters.search}
          />
        </InputGroup>

        {/* No count badge: the chips below say which filters, not how many.
            Two shells, one body — a bottom sheet on a phone and a right-hand
            panel on a desktop. Only one is in the accessibility tree at a
            time, so `getByRole` and a screen reader both see exactly one. */}
        <div className="shrink-0 sm:hidden">
          <AdminFiltersDrawer
            filters={filters}
            onChange={onChange}
            onClear={onClear}
            onSortChange={onSortChange}
            placement="down"
            sort={sort}
          />
        </div>
        <div className="hidden shrink-0 sm:block">
          <AdminFiltersDrawer
            filters={filters}
            onChange={onChange}
            onClear={onClear}
            onSortChange={onSortChange}
            placement="right"
            sort={sort}
          />
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <ArrowUpDownIcon />
              <TriggerLabel>Sort</TriggerLabel>
              {sortKeyLabel(sort)}
              {sort ? (
                <span className="font-normal text-muted-foreground">
                  ({directionLabel(sort.key, sort.direction)})
                </span>
              ) : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  onValueChange={(value) =>
                    onSortChange(
                      value === "none"
                        ? "none"
                        : (`${value}:${defaultDirection(
                            value as UserSortKey
                          )}` as SortOptionId)
                    )
                  }
                  value={sort?.key ?? "none"}
                >
                  <DropdownMenuRadioItem value="none">
                    Unsorted
                  </DropdownMenuRadioItem>
                  {SORT_KEYS.map((option) => (
                    <DropdownMenuRadioItem key={option.id} value={option.id}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>

              {sort ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      onValueChange={(value) =>
                        onSortChange(
                          `${sort.key}:${
                            value as SortDirection
                          }` as SortOptionId
                        )
                      }
                      value={sort.direction}
                    >
                      <DropdownMenuRadioItem value="asc">
                        {directionLabel(sort.key, "asc")}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="desc">
                        {directionLabel(sort.key, "desc")}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Keyed to `hasActiveFilters`, not to the chips: search is applied state
          with no chip of its own — the field shows it — so gating on chips
          alone left a searched table with nothing to clear it from.

          At every width, because on a phone this is the one place a filter can
          be seen and removed without reopening the drawer. */}
      {hasActiveFilters(filters) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {applied.map(({ def, value }) => (
            <FilterChip
              key={def.key}
              label={def.label}
              onRemove={() => onChange(def.clear)}
              value={value}
            />
          ))}
          {/* `xs`, so it matches the 24px chips it sits among rather than the
              40px controls above them. It is in the chip row, not the control
              row, and the sweep in `e2e/control-heights.spec.ts` only compares
              controls that share a visual row. */}
          <Button
            className="text-muted-foreground hover:text-foreground"
            onClick={onClear}
            size="xs"
            variant="ghost"
          >
            <XIcon />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * The dimension a filter trigger acts on, muted ahead of its value.
 *
 * A second copy rather than a shared part: presentational code in two blocks
 * is the same demo twice, and installable copies are flat, so two blocks
 * shipping one basename would overwrite each other.
 */
function TriggerLabel({ children }: { children: ReactNode }) {
  return <span className="font-normal text-muted-foreground">{children}:</span>;
}
