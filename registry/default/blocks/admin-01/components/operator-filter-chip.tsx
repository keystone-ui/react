"use client";

import { EllipsisIcon, TrashIcon } from "lucide-react";
import { type RefObject, useRef } from "react";
import { Bound } from "@/components/drawer-parts";
import { FilterTrigger } from "@/components/filter-trigger";
import { CURRENCIES } from "@/components/mock-payments";
import {
  type FilterKey,
  filterDef,
  type OperatorKey,
  operatorChoice,
  type PaymentFilters,
  STATUSES,
  statusLabel,
} from "@/components/payment-filters";
import { PillShell, PillValue } from "@/components/pill-shell";
import {
  OperatorMenu,
  type OperatorMenuProps,
  SetOptions,
} from "@/components/set-pill";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface OperatorFilterChipProps {
  /** See `PaymentFilterPill`'s `autoOpen`. */
  autoOpen: boolean;
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onRemove: (key: FilterKey, trigger: HTMLElement | null) => void;
  pillKey: OperatorKey;
}

/**
 * A filter that carries a comparison: `Currency is not: BTC`, `Amount: > 100`.
 *
 * Notion's arrangement. The popover's header names the dimension and holds the
 * operator as a menu of its own — `Currency [is ⌄]` — so changing the
 * comparison never costs the value you already picked. The `⋯` beside it holds
 * "Delete filter".
 *
 * It takes the same X swap and Backspace as the simple pill — every pill on
 * the row comes off the same way, whatever kind it is. The `⋯` is the second
 * way, and on a touch screen, which never sees the X, the only one; so this
 * kind needs no separate touch fallback.
 *
 * Every operator really filters — `matchesPaymentFilters` reads them — so the
 * chip is the record of what is applied, the same as the simple pill.
 */
export function OperatorFilterChip({
  autoOpen,
  filters,
  onChange,
  onRemove,
  pillKey,
}: OperatorFilterChipProps) {
  const def = filterDef(pillKey);
  const value = def.value(filters);
  // An operator with nothing to compare against narrows nothing, so the chip
  // does not claim one: "Currency is not: All" would read as a contradiction.
  const operator = value === null ? null : (def.operator?.(filters) ?? null);
  // Opening lands in the field, not on the operator button that comes first:
  // the value is what you came to set, and typing should start filtering
  // straight away. Amount has no single field, so it keeps the default.
  const field = useRef<HTMLInputElement>(null);

  return (
    <PillShell
      label={def.label}
      onRemove={(trigger) => onRemove(pillKey, trigger)}
    >
      {({ keyDown, remove }) => (
        <Popover defaultOpen={autoOpen}>
          <PopoverTrigger
            render={
              <FilterTrigger
                active={value !== null}
                label={def.label}
                onKeyDown={keyDown}
                operator={operator}
                removable
              />
            }
          >
            <PillValue empty={def.empty} value={value} />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-64 p-1"
            initialFocus={() => field.current ?? true}
          >
            <div className="flex items-center gap-1 py-1 ps-2 pe-1">
              <span className="text-muted-foreground text-sm">{def.label}</span>
              <OperatorMenu {...operatorMenu(pillKey, filters, onChange)} />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      aria-label="More actions"
                      className="ms-auto text-muted-foreground"
                      size="icon-xs"
                      variant="ghost"
                    />
                  }
                >
                  <EllipsisIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-44"
                  size="compact"
                >
                  <DropdownMenuItem onClick={remove} variant="destructive">
                    <TrashIcon />
                    Delete filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {pillKey === "currencies" && (
              <SetOptions
                field={field}
                items={CURRENCIES}
                label={(currency) => currency}
                noun="currencies"
                onValueChange={(next) => onChange({ currencies: next })}
                value={filters.currencies}
              />
            )}
            {pillKey === "status" && (
              <SetOptions
                field={field}
                items={STATUSES}
                label={statusLabel}
                noun="statuses"
                onValueChange={(next) => onChange({ statuses: next })}
                value={filters.statuses}
              />
            )}
            {pillKey === "amount" && (
              <AmountFields filters={filters} onChange={onChange} />
            )}
            {pillKey === "player" && (
              <PlayerField
                field={field}
                filters={filters}
                onChange={onChange}
              />
            )}
          </PopoverContent>
        </Popover>
      )}
    </PillShell>
  );
}

/** The header's operator menu: the shared choice, wired to this chip. */
function operatorMenu(
  key: OperatorKey,
  filters: PaymentFilters,
  onChange: (patch: Partial<PaymentFilters>) => void
): OperatorMenuProps {
  const choice = operatorChoice(key, filters);
  return {
    label: choice.label,
    onValueChange: (next) => onChange(choice.patch(next)),
    options: choice.options,
    value: choice.value,
  };
}

/**
 * Free text, so a plain field: case-insensitive, and blank means no filter
 * whatever the operator says.
 */
function PlayerField({
  field,
  filters,
  onChange,
}: {
  field: RefObject<HTMLInputElement | null>;
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-2 pt-1">
      <Input
        aria-label="Player email"
        ref={field}
        onChange={(event) => onChange({ player: event.target.value })}
        placeholder="e.g. gmail"
        size="sm"
        value={filters.player}
      />
      {filters.player.trim() && (
        <div className="flex justify-end">
          <Button
            onClick={() => onChange({ player: "" })}
            size="xs"
            variant="ghost"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * One field for a one-sided comparison, two for `between`. The field reads
 * whichever bound the operator compares against — see `setAmountOp`.
 */
function AmountFields({
  filters,
  onChange,
}: {
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
}) {
  const op = filters.amountOp;
  const held = filterDef("amount").value(filters) !== null;

  return (
    <div className="flex flex-col gap-3 p-2">
      {op === "between" ? (
        <div className="grid grid-cols-2 gap-3">
          <Bound
            id="amount-min"
            label="Min"
            onChange={(next) => onChange({ amountMin: next })}
            placeholder="0.00"
            value={filters.amountMin}
          />
          <Bound
            id="amount-max"
            label="Max"
            onChange={(next) => onChange({ amountMax: next })}
            placeholder="Any"
            value={filters.amountMax}
          />
        </div>
      ) : (
        <Bound
          id="amount-value"
          label="Amount"
          onChange={(next) =>
            onChange(op === "lt" ? { amountMax: next } : { amountMin: next })
          }
          placeholder="0.00"
          value={op === "lt" ? filters.amountMax : filters.amountMin}
        />
      )}
      {held && (
        <div className="flex justify-end">
          <Button
            onClick={() => onChange({ amountMax: "", amountMin: "" })}
            size="xs"
            variant="ghost"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
