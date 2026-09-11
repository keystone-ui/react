"use client";

import { Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { FilterTrigger } from "@/components/filter-trigger";
import { CURRENCIES, type Currency } from "@/components/mock-payments";
import {
  DEFAULT_KEYS,
  type FilterKey,
  filterDef,
  type PaymentFilters,
  PROVIDER_OPTIONS,
  providerLabel,
  STATUS_OPTIONS,
  statusLabel,
  TYPE_OPTIONS,
  typeLabel,
} from "@/components/payment-filters";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PillProps {
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onRemove: (key: FilterKey) => void;
}

/**
 * One pill per visible filter.
 *
 * Every pill carries its own `Remove filter`, except the two permanent ones —
 * removing a pill you cannot add back would be a trap. Setting a pill to `All`
 * deliberately does *not* remove it: taking the control out from under the
 * cursor mid-interaction is worse than leaving a pill that reads `All`.
 *
 * The footer says what is selected on the left and offers the one useful
 * action on the right: `Clear` while the filter holds a value, `Remove filter`
 * once it is empty. A pill that is doing something should be emptied before it
 * is thrown away, and a filter you can still see the effect of is not one you
 * meant to delete.
 */
export function PaymentFilterPill({
  filters,
  onChange,
  onRemove,
  pillKey,
}: PillProps & { pillKey: FilterKey }) {
  const def = filterDef(pillKey);
  const value = def.value(filters);
  const shared = {
    active: value !== null,
    label: def.label,
  };
  const body = value ?? def.empty;

  if (pillKey === "created" || pillKey === "amount") {
    return (
      <RangePill
        filters={filters}
        onChange={onChange}
        onRemove={onRemove}
        pillKey={pillKey}
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<FilterTrigger {...shared} />}>
        {body}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuGroup>
          {pillKey === "currencies" ? (
            <CurrencyItems filters={filters} onChange={onChange} />
          ) : (
            <RadioItems
              filters={filters}
              onChange={onChange}
              pillKey={pillKey}
            />
          )}
        </DropdownMenuGroup>
        <MenuFooter
          filters={filters}
          onChange={onChange}
          onRemove={onRemove}
          pillKey={pillKey}
        />
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
  onRemove,
  pillKey,
}: PillProps & { pillKey: FilterKey }) {
  const def = filterDef(pillKey);
  const value = def.value(filters);
  const isDate = pillKey === "created";

  return (
    <Popover>
      <PopoverTrigger
        render={<FilterTrigger active={value !== null} label={def.label} />}
      >
        {value ?? def.empty}
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
          <div className="flex justify-between gap-2">
            <Button
              onClick={() => onChange(def.clear)}
              size="sm"
              variant="ghost"
            >
              Reset
            </Button>
            <Button onClick={() => onRemove(pillKey)} size="sm" variant="ghost">
              <Trash2Icon />
              Remove filter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Bound({
  id,
  label,
  onChange,
  placeholder,
  type,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground" htmlFor={id}>
        {label}
      </Label>
      <Input
        id={id}
        inputMode={type === "text" ? "decimal" : undefined}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </div>
  );
}

/**
 * The menu's footer: what is selected on the left, the way out on the right.
 *
 * A multi-select needs to say how many it holds, because the pill only has
 * room for the first one and a count of the rest — "BTC, +2" tells you the
 * shape but the footer is where the number is spelled out. `Clear` empties
 * the filter without taking the pill off the row; `Remove filter` takes the
 * pill away, and only appears for the pills that can be added back.
 */
function MenuFooter({
  filters,
  onChange,
  onRemove,
  pillKey,
}: {
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onRemove: (key: FilterKey) => void;
  pillKey: FilterKey;
}) {
  const def = filterDef(pillKey);
  const hasValue = def.value(filters) !== null;
  const removable = !DEFAULT_KEYS.includes(pillKey);
  const selectedCount =
    pillKey === "currencies" ? filters.currencies.length : 0;

  if (!(hasValue || removable)) {
    return null;
  }

  return (
    <>
      <DropdownMenuSeparator />
      <div className="flex h-9 items-center justify-between gap-3 px-2">
        <span className="text-muted-foreground text-sm">
          {selectedCount > 0 ? `${selectedCount} selected` : ""}
        </span>
        {hasValue ? (
          <Button onClick={() => onChange(def.clear)} size="sm" variant="ghost">
            Clear
          </Button>
        ) : (
          <Button onClick={() => onRemove(pillKey)} size="sm" variant="ghost">
            <Trash2Icon />
            Remove filter
          </Button>
        )}
      </div>
    </>
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
      <DropdownMenuTrigger
        render={<Button className="gap-1.5" variant="ghost" />}
      >
        <span aria-hidden="true">+</span>
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
