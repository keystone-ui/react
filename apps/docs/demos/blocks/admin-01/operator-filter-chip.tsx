"use client";

import { Button } from "@keystoneui/react/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@keystoneui/react/combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import { Input } from "@keystoneui/react/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import {
  ChevronDown as ChevronDownIcon,
  CircleX as CircleXIcon,
  Ellipsis as EllipsisIcon,
  Trash2 as TrashIcon,
} from "lucide-react";
import { type RefObject, useRef } from "react";
import { Bound } from "./drawer-parts";
import { FilterTrigger } from "./filter-trigger";
import { CURRENCIES, type Currency } from "./mock-payments";
import {
  AMOUNT_OPERATORS,
  type AmountOperator,
  amountOperatorLabel,
  CURRENCY_OPERATORS,
  type CurrencyOperator,
  type FilterKey,
  filterDef,
  type PaymentFilters,
  PLAYER_OPERATORS,
  type PlayerOperator,
  setAmountOp,
} from "./payment-filters";
import { PillShell, PillValue } from "./pill-shell";

interface OperatorFilterChipProps {
  /** See `PaymentFilterPill`'s `autoOpen`. */
  autoOpen: boolean;
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onRemove: (key: FilterKey, trigger: HTMLElement | null) => void;
  pillKey: OperatorKey;
}

type OperatorKey = "amount" | "currencies" | "player";

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
              <CurrencyOptions
                field={field}
                filters={filters}
                onChange={onChange}
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

const AMOUNT_OPERATOR_NAMES: Record<AmountOperator, string> = {
  between: "Between",
  eq: "Equal to",
  gt: "Greater than",
  lt: "Less than",
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** The header's operator menu, per filter: its options and what picking does. */
function operatorMenu(
  key: OperatorKey,
  filters: PaymentFilters,
  onChange: (patch: Partial<PaymentFilters>) => void
): OperatorMenuProps {
  if (key === "amount") {
    return {
      label: amountOperatorLabel(filters.amountOp),
      onValueChange: (next) => onChange(setAmountOp(next as AmountOperator)),
      options: AMOUNT_OPERATORS.map((op) => ({
        label: AMOUNT_OPERATOR_NAMES[op],
        value: op,
      })),
      value: filters.amountOp,
    };
  }
  const [operators, value, patch] =
    key === "currencies"
      ? ([
          CURRENCY_OPERATORS,
          filters.currencyOp,
          (next: string) => ({ currencyOp: next as CurrencyOperator }),
        ] as const)
      : ([
          PLAYER_OPERATORS,
          filters.playerOp,
          (next: string) => ({ playerOp: next as PlayerOperator }),
        ] as const);
  return {
    label: operators.find((item) => item.value === value)?.label ?? "",
    onValueChange: (next) => onChange(patch(next)),
    options: operators.map((item) => ({
      label: capitalize(item.label),
      value: item.value,
    })),
    value,
  };
}

interface OperatorMenuProps {
  label: string;
  onValueChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  value: string;
}

/** The operator in the header: the current one, opening onto the rest. */
function OperatorMenu({
  label,
  onValueChange,
  options,
  value,
}: OperatorMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`Operator: ${label}`}
            className="gap-1 px-1.5 font-semibold text-sm"
            size="xs"
            variant="ghost"
          />
        }
      >
        {label}
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-36" size="compact">
        <DropdownMenuRadioGroup
          onValueChange={(next) => onValueChange(next as string)}
          value={value}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The selection as chips in a field, the options not yet picked listed under
 * it — Notion's multi-select. The chips are the answer to "what is held", read
 * in place rather than counted, and the field filters the list as you type.
 *
 * An inline `Combobox` — `inline open` keeps its list in this popover instead
 * of opening a popup of its own on top of it. So `ComboboxList` and
 * `ComboboxItem` are used bare: `ComboboxContent` always portals.
 *
 * Picked options stay in the list and gain a check, as Notion's do. Removing
 * them would shuffle every row below the one just clicked, so the next pick
 * lands on the wrong option; and clicking a checked one again unpicks it,
 * which a list of only the unpicked could never offer.
 *
 * The round X clears every chip but keeps the operator — you emptied the
 * list, not the comparison.
 */
function CurrencyOptions({
  field,
  filters,
  onChange,
}: {
  field: RefObject<HTMLInputElement | null>;
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
}) {
  const held = filters.currencies;

  return (
    <Combobox
      autoHighlight
      inline
      items={CURRENCIES}
      multiple
      onValueChange={(next: Currency[]) => onChange({ currencies: next })}
      open
      value={[...held]}
    >
      <div className="px-1 pb-2">
        {/* 32px: the toolbar's tier. `ComboboxChips` defaults to the 40px
            form-field height, which towers over the compact rows below. */}
        <ComboboxChips className="min-h-8 py-0.5 pe-1">
          <ComboboxValue>
            {(values: Currency[]) => (
              <>
                {values.map((value) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  aria-label="Search currencies"
                  ref={field}
                  placeholder={values.length > 0 ? "" : "Search…"}
                />
              </>
            )}
          </ComboboxValue>
          {held.length > 0 && (
            <Button
              aria-label="Clear currencies"
              className="ms-auto shrink-0 rounded-full text-muted-foreground"
              onClick={() => onChange({ currencies: [] })}
              size="icon-xs"
              variant="ghost"
            >
              <CircleXIcon />
            </Button>
          )}
        </ComboboxChips>
      </div>
      <ComboboxEmpty className="px-2 py-1.5 text-muted-foreground text-sm">
        No match
      </ComboboxEmpty>
      <ComboboxList className="max-h-none p-0" data-size="compact">
        {(currency: Currency) => (
          <ComboboxItem key={currency} value={currency}>
            {currency}
          </ComboboxItem>
        )}
      </ComboboxList>
    </Combobox>
  );
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
