"use client";

import { Button } from "@keystoneui/react/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import { Plus as PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Bound } from "./drawer-parts";
import { FilterTrigger } from "./filter-trigger";
import { CURRENCIES, type Currency } from "./mock-payments";
import {
  type FilterKey,
  filterDef,
  type PaymentFilters,
  PROVIDER_OPTIONS,
  providerLabel,
  STATUS_OPTIONS,
  statusLabel,
  TYPE_OPTIONS,
  typeLabel,
} from "./payment-filters";

interface PillProps {
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  /**
   * Pins the pill to the row. Clearing calls it so that a pill which was only
   * showing because it held a value — one set from the mobile drawer, say —
   * does not vanish under the cursor the moment it is emptied.
   */
  onPin: (key: FilterKey) => void;
}

/**
 * One pill per visible filter.
 *
 * A pill is never removed from inside its own menu. Setting one back to `All`
 * leaves it on the row on purpose — taking the control out from under the
 * cursor mid-interaction is worse than a pill that reads `All` — and an empty
 * pill has nothing to remove that `Clear all` does not already handle. So the
 * menu holds options and, once something is chosen, a `Clear`.
 */
export function PaymentFilterPill({
  filters,
  onChange,
  onPin,
  pillKey,
}: PillProps & { pillKey: FilterKey }) {
  const def = filterDef(pillKey);
  // Every change made through a pill also pins it. Without this a pill that
  // is only on the row because it holds a value — one set from the mobile
  // drawer — disappears the moment you empty it, taking the control out from
  // under the cursor. Emptying a filter is the one moment you are most likely
  // to want to set it to something else.
  const change = (patch: Partial<PaymentFilters>) => {
    onChange(patch);
    onPin(pillKey);
  };
  const value = def.value(filters);
  const shared = {
    active: value !== null,
    label: def.label,
  };
  // Unset reads as a placeholder rather than a value, which is what separates
  // the pills doing something from the ones merely present.
  const body = <PillValue empty={def.empty} value={value} />;

  if (pillKey === "created" || pillKey === "amount") {
    return <RangePill filters={filters} onChange={change} pillKey={pillKey} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<FilterTrigger {...shared} />}>
        {body}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuGroup>
          {pillKey === "currencies" ? (
            <CurrencyItems filters={filters} onChange={change} />
          ) : (
            <RadioItems filters={filters} onChange={change} pillKey={pillKey} />
          )}
        </DropdownMenuGroup>
        {/* Only the multi-select earns a footer: a single-select's list
            already starts with "All", which is its own clear. */}
        {pillKey === "currencies" && (
          <MenuFooter
            count={filters.currencies.length}
            onClear={() => change(def.clear)}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RadioItems({
  filters,
  onChange,
  pillKey,
}: {
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  pillKey: FilterKey;
}) {
  if (pillKey === "type") {
    return (
      <DropdownMenuRadioGroup
        onValueChange={(value) =>
          onChange({ type: value as PaymentFilters["type"] })
        }
        value={filters.type}
      >
        {TYPE_OPTIONS.map((option) => (
          <DropdownMenuRadioItem key={option} value={option}>
            {typeLabel(option)}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    );
  }

  if (pillKey === "status") {
    return (
      <DropdownMenuRadioGroup
        onValueChange={(value) =>
          onChange({ status: value as PaymentFilters["status"] })
        }
        value={filters.status}
      >
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuRadioItem key={option} value={option}>
            {statusLabel(option)}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    );
  }

  return (
    <DropdownMenuRadioGroup
      onValueChange={(value) =>
        onChange({ provider: value as PaymentFilters["provider"] })
      }
      value={filters.provider}
    >
      {PROVIDER_OPTIONS.map((option) => (
        <DropdownMenuRadioItem key={option} value={option}>
          {providerLabel(option)}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

/**
 * `DropdownMenuCheckboxItem` keeps the menu open on click, which is what a
 * multi-select wants — picking three currencies should not cost three trips.
 */
function CurrencyItems({
  filters,
  onChange,
}: {
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
}) {
  const toggle = (currency: Currency) =>
    onChange({
      currencies: filters.currencies.includes(currency)
        ? filters.currencies.filter((item) => item !== currency)
        : [...filters.currencies, currency],
    });

  return (
    <>
      {CURRENCIES.map((currency) => (
        <DropdownMenuCheckboxItem
          checked={filters.currencies.includes(currency)}
          key={currency}
          onCheckedChange={() => toggle(currency)}
          variant="control"
        >
          {currency}
        </DropdownMenuCheckboxItem>
      ))}
    </>
  );
}

/**
 * Ranges need two fields at once, so they open a `Popover` rather than a menu.
 * A menu is a list of choices; a pair of bounds is a tiny form.
 */
function RangePill({
  filters,
  onChange,
  pillKey,
}: Omit<PillProps, "onPin"> & { pillKey: FilterKey }) {
  const def = filterDef(pillKey);
  const value = def.value(filters);
  const isDate = pillKey === "created";

  return (
    <Popover>
      <PopoverTrigger
        render={<FilterTrigger active={value !== null} label={def.label} />}
      >
        <PillValue empty={def.empty} value={value} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Bound
              id={`${pillKey}-min`}
              label={isDate ? "After" : "Min"}
              onChange={(next) =>
                onChange(isDate ? { createdAfter: next } : { amountMin: next })
              }
              placeholder={isDate ? undefined : "0.00"}
              type={isDate ? "date" : "text"}
              value={isDate ? filters.createdAfter : filters.amountMin}
            />
            <Bound
              id={`${pillKey}-max`}
              label={isDate ? "Before" : "Max"}
              onChange={(next) =>
                onChange(isDate ? { createdBefore: next } : { amountMax: next })
              }
              placeholder={isDate ? undefined : "Any"}
              type={isDate ? "date" : "text"}
              value={isDate ? filters.createdBefore : filters.amountMax}
            />
          </div>
          {value !== null && (
            <div className="flex justify-end">
              <Button
                onClick={() => onChange(def.clear)}
                size="xs"
                variant="ghost"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * The menu's footer: what is held on the left, the way to empty it on the
 * right.
 *
 * It exists only while the filter holds a value. An empty filter has nothing
 * to say and nothing to undo, and a footer offering an action that would do
 * nothing is just a row you have to read past to reach the options.
 *
 * The count is the point of it: the pill has room for the first value and a
 * tally of the rest — "BTC, +2" — so the footer is where that number gets
 * spelled out.
 */
function MenuFooter({
  count,
  onClear,
}: {
  count: number;
  onClear: () => void;
}) {
  if (count === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenuSeparator />
      {/* A uniform `p-1.5` is what makes every gap here come out equal. The
          content's own `p-1` already insets 4px on the right and bottom and
          the separator's `my-1` gives 4px above, so adding the same 6px on
          all four sides lands the button 10px from each — and lands the count
          at the same 10px an item's text starts from (4px content + `px-1.5`),
          so it lines up with the options above it. */}
      <div className="flex items-center justify-between gap-3 p-1.5">
        <span className="text-muted-foreground text-xs">{count} selected</span>
        <Button onClick={onClear} size="xs" variant="ghost">
          Clear
        </Button>
      </div>
    </>
  );
}

/**
 * The pill's value, in its own slot so the set and unset cases are the same
 * element rather than a span and a bare text node — which is what lets a test
 * compare their colours at all.
 */
function PillValue({ empty, value }: { empty: string; value: string | null }) {
  return (
    <span
      className={value === null ? "font-normal text-muted-foreground" : ""}
      data-pill-value=""
    >
      {value ?? empty}
    </span>
  );
}

/** The `+ Add filter` menu, holding whatever is not already on the toolbar. */
export function AddFilterMenu({
  keys,
  onAdd,
}: {
  keys: readonly FilterKey[];
  onAdd: (key: FilterKey) => void;
}): ReactNode {
  if (keys.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      {/* A lucide `Plus` rather than a literal "+": next to the `X` on Clear
          all, a text glyph would sit at a different weight and baseline. */}
      <DropdownMenuTrigger render={<Button variant="ghost" />}>
        <PlusIcon />
        Add filter
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuGroup>
          {keys.map((key) => (
            <DropdownMenuItem key={key} onClick={() => onAdd(key)}>
              {filterDef(key).label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
