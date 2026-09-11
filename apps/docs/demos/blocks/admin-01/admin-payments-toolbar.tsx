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
import { TagGroup, TagGroupItem } from "@keystoneui/react/tag-group";
import {
  ArrowUpDown as ArrowUpDownIcon,
  Search as SearchIcon,
  Wallet as WalletIcon,
} from "lucide-react";

import { paymentStatusLabels } from "./mock-payments";
import {
  activeFilterChips,
  type PaymentFilters,
  panelFilterCount,
  SORT_OPTIONS,
  type SortOptionId,
  type SortState,
  STATUS_OPTIONS,
  type StatusFilter,
  sortLabel,
  statusLabel,
  type TypeFilter,
  toSortOptionId,
  typeLabel,
} from "./payment-filters";
import { PaymentFiltersDrawer } from "./payment-filters-drawer";

interface AdminPaymentsToolbarProps {
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onClear: () => void;
  onSortChange: (id: SortOptionId) => void;
  sort: SortState;
}

const TYPES: readonly TypeFilter[] = ["all", "deposit", "cashout"];

/**
 * Search and the three highest-frequency controls inline; the long tail behind
 * a Filters button; everything applied shown as a removable chip underneath.
 *
 * The chips are what make the panel acceptable. A filter you cannot see is a
 * filter you forget you set, and the next question is always "why am I looking
 * at four rows?" — so the applied state stays on the page whether the panel is
 * open or not, and each chip removes only itself.
 *
 * Below `sm` the three dropdowns fold away and the Filters panel carries
 * everything, the same fork the users toolbar uses.
 */
export function AdminPaymentsToolbar({
  filters,
  onChange,
  onClear,
  onSortChange,
  sort,
}: AdminPaymentsToolbarProps) {
  const chips = activeFilterChips(filters);

  // Kong splits status by payment type. That distinction only earns its keep
  // when you want different statuses per type, which the panel can express —
  // so the toolbar offers the common case, one status across both, and says
  // "Mixed" when the panel has been used to separate them.
  const unifiedStatus: StatusFilter | "mixed" =
    filters.cashoutStatus === filters.depositStatus
      ? filters.cashoutStatus
      : "mixed";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row items-center gap-2 sm:justify-between sm:gap-3">
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

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                <WalletIcon />
                {typeLabel(filters.type)}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuGroup>
                  <DropdownMenuRadioGroup
                    onValueChange={(value) =>
                      onChange({ type: value as TypeFilter })
                    }
                    value={filters.type}
                  >
                    {TYPES.map((type) => (
                      <DropdownMenuRadioItem key={type} value={type}>
                        {typeLabel(type)}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                {unifiedStatus === "mixed"
                  ? "Mixed statuses"
                  : statusLabel(unifiedStatus)}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuGroup>
                  <DropdownMenuRadioGroup
                    onValueChange={(value) =>
                      onChange({
                        cashoutStatus: value as StatusFilter,
                        depositStatus: value as StatusFilter,
                      })
                    }
                    value={unifiedStatus === "mixed" ? "" : unifiedStatus}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <DropdownMenuRadioItem key={status} value={status}>
                        {status === "all"
                          ? "All statuses"
                          : paymentStatusLabels[status]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                <ArrowUpDownIcon />
                {sortLabel(sort)}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuGroup>
                  <DropdownMenuRadioGroup
                    onValueChange={(value) =>
                      onSortChange(value as SortOptionId)
                    }
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
          </div>

          <PaymentFiltersDrawer
            count={panelFilterCount(filters)}
            filters={filters}
            onChange={onChange}
            onClear={onClear}
          />
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Held at `value={[]}` so the chip body is inert: TagGroup is a
              toggle group underneath, and an applied filter is not something
              you press — only its X does anything. */}
          <TagGroup
            onRemove={(key) => {
              const chip = chips.find((item) => item.key === key);
              if (chip) {
                onChange(chip.clear);
              }
            }}
            value={[]}
          >
            {chips.map((chip) => (
              <TagGroupItem key={chip.key} value={chip.key}>
                {chip.label}
              </TagGroupItem>
            ))}
          </TagGroup>
          <Button onClick={onClear} size="sm" variant="ghost">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
