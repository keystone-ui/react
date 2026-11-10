"use client";

import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import { Checkbox } from "@keystoneui/react/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@keystoneui/react/drawer";
import { Input } from "@keystoneui/react/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@keystoneui/react/native-select";
import { RadioGroup } from "@keystoneui/react/radio-group";
import {
  Stepper,
  StepperContent,
  StepperStep,
  useStepper,
} from "@keystoneui/react/stepper";
import { Funnel as FilterIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { TODAY } from "./date-filter";
import { DateFilterStep } from "./date-filter-step";
import {
  Bound,
  DrilldownList,
  DrilldownRow,
  FilterOption,
  OperatorToggle,
  Options,
  StepHeader,
} from "./drawer-parts";
import { CURRENCIES } from "./mock-payments";
import {
  AMOUNT_OPERATORS,
  type AmountOperator,
  amountOperatorLabel,
  CREATED_PRESETS,
  CURRENCY_OPERATORS,
  type CurrencyOperator,
  defaultDirection,
  directionLabel,
  FILTERS,
  type FilterKey,
  filterDef,
  hasActiveFilters,
  type PaymentFilters,
  type PaymentSortKey,
  PLAYER_OPERATORS,
  type PlayerOperator,
  PROVIDER_OPTIONS,
  providerLabel,
  SORT_KEYS,
  type SortState,
  STATUS_OPTIONS,
  setAmountOp,
  sortLabel,
  statusLabel,
  TYPE_OPTIONS,
  typeLabel,
} from "./payment-filters";
import { directionsFor, type SortDirection } from "./sort";

interface PaymentFiltersDrawerProps {
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onClear: () => void;
  onSortChange: (sort: SortState) => void;
  sort: SortState;
}

/**
 * The mobile half of the payments toolbar.
 *
 * The same bottom sheet + `Stepper` drilldown the users drawer uses, and for
 * the same reason: a menu of "label + current value" rows that open one screen
 * per filter is how a phone handles a filter set that will not fit, and a
 * block should not answer that question twice in two different ways. This
 * started life as a scrolling column of selects — a desktop panel put on a
 * phone — which is exactly the reinvention the users drawer warns against.
 *
 * No `swipeDirection`: the primitive's default is `down`, which is what
 * supplies the bottom-sheet geometry and the drag handle. No `variant` either
 * — `floating` only applies from `md` up, and this drawer is `sm:hidden`, so
 * it could never have taken effect.
 *
 * Filters apply live; `Apply` only dismisses. Same as the users drawer.
 *
 * Sort is the last row, because the desktop Sort menu is hidden at this width
 * too. It is not counted on the trigger: it is not a filter, and a badge that
 * ticks up when you reorder a column is lying.
 */
export function PaymentFiltersDrawer({
  filters,
  onChange,
  onClear,
  onSortChange,
  sort,
}: PaymentFiltersDrawerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const activeCount = FILTERS.filter(
    (def) => def.value(filters) !== null
  ).length;

  return (
    <Drawer
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setStep(0);
        }
      }}
      open={open}
    >
      {/* The count is on the trigger because the pills are hidden at this
          width — without it a filtered table gives no sign of being filtered. */}
      <DrawerTrigger render={<Button size="sm" variant="outline" />}>
        <FilterIcon className="size-4" />
        Filters
        {activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <Stepper onValueChange={setStep} value={step}>
            <StepperContent>
              <StepperStep>
                <DrawerHeader>
                  <DrawerTitle className="text-center">Filters</DrawerTitle>
                </DrawerHeader>
                <PaymentFilterMenu filters={filters} sort={sort} />
                <DrawerFooter>
                  {hasActiveFilters(filters) && (
                    <Button
                      className="w-full"
                      onClick={onClear}
                      variant="ghost"
                    >
                      Clear all
                    </Button>
                  )}
                  <Button className="w-full" onClick={() => setOpen(false)}>
                    Apply
                  </Button>
                </DrawerFooter>
              </StepperStep>

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Action" />
                <Options
                  onValueChange={(value) =>
                    onChange({ type: value as PaymentFilters["type"] })
                  }
                  value={filters.type}
                >
                  {TYPE_OPTIONS.map((option) => (
                    <FilterOption
                      key={option}
                      label={typeLabel(option)}
                      value={option}
                    />
                  ))}
                </Options>
              </StepperStep>

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Status" />
                <Options
                  onValueChange={(value) =>
                    onChange({ status: value as PaymentFilters["status"] })
                  }
                  value={filters.status}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <FilterOption
                      key={option}
                      label={statusLabel(option)}
                      value={option}
                    />
                  ))}
                </Options>
              </StepperStep>

              <StepperStep>
                <StepHeader
                  onBack={() => setStep(0)}
                  onClear={held("currencies", filters, onChange)}
                  title="Currency"
                />
                <OperatorToggle
                  label="Currency operator"
                  onValueChange={(op) =>
                    onChange({ currencyOp: op as CurrencyOperator })
                  }
                  options={CURRENCY_OPERATORS}
                  value={filters.currencyOp}
                />
                {/* Checkboxes, not radios: this is the one multi-select in the
                    set, so it is the one screen you do not leave per pick. */}
                <div className="divide-y divide-border-muted pb-4">
                  {CURRENCIES.map((currency) => (
                    // biome-ignore lint/a11y/noLabelWithoutControl: control is inside label
                    <label
                      className="flex h-12 cursor-pointer items-center gap-3 px-4"
                      key={currency}
                    >
                      <Checkbox
                        checked={filters.currencies.includes(currency)}
                        onCheckedChange={() =>
                          onChange({
                            currencies: filters.currencies.includes(currency)
                              ? filters.currencies.filter(
                                  (item) => item !== currency
                                )
                              : [...filters.currencies, currency],
                          })
                        }
                      />
                      <span className="text-sm">{currency}</span>
                    </label>
                  ))}
                </div>
              </StepperStep>

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Provider" />
                <Options
                  onValueChange={(value) =>
                    onChange({ provider: value as PaymentFilters["provider"] })
                  }
                  value={filters.provider}
                >
                  {PROVIDER_OPTIONS.map((option) => (
                    <FilterOption
                      key={option}
                      label={providerLabel(option)}
                      value={option}
                    />
                  ))}
                </Options>
              </StepperStep>

              <StepperStep>
                <StepHeader
                  onBack={() => setStep(0)}
                  onClear={held("player", filters, onChange)}
                  title="Player"
                />
                {/* Six operators do not fit a segmented row on a phone, so the
                    phone's own picker — full width, so the operator and the
                    field below it read as one condition rather than a stray
                    control beside an input. */}
                <div className="flex flex-col gap-2 px-4 pb-4">
                  <NativeSelect
                    aria-label="Player operator"
                    className="w-full"
                    onChange={(event) =>
                      onChange({
                        playerOp: event.target.value as PlayerOperator,
                      })
                    }
                    value={filters.playerOp}
                  >
                    {PLAYER_OPERATORS.map((op) => (
                      <NativeSelectOption key={op.value} value={op.value}>
                        {op.label.charAt(0).toUpperCase() + op.label.slice(1)}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {/* Not `Bound`: that is for numbers and dates, and its
                      decimal keypad cannot type an email. */}
                  <Input
                    aria-label="Player email"
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    enterKeyHint="done"
                    id="drawer-player"
                    inputMode="email"
                    onChange={(event) =>
                      onChange({ player: event.target.value })
                    }
                    placeholder="e.g. gmail"
                    spellCheck={false}
                    value={filters.player}
                  />
                </div>
              </StepperStep>

              <StepperStep>
                <StepHeader
                  onBack={() => setStep(0)}
                  onClear={held("created", filters, onChange)}
                  title="Created"
                />
                <DateFilterStep
                  bounds={{
                    after: filters.createdAfter,
                    before: filters.createdBefore,
                  }}
                  onChange={({ after, before }) =>
                    onChange({ createdAfter: after, createdBefore: before })
                  }
                  presets={CREATED_PRESETS}
                  today={TODAY}
                />
              </StepperStep>

              <StepperStep>
                <StepHeader
                  onBack={() => setStep(0)}
                  onClear={held("amount", filters, onChange)}
                  title="Amount"
                />
                <OperatorToggle
                  label="Amount operator"
                  onValueChange={(op) =>
                    onChange(setAmountOp(op as AmountOperator))
                  }
                  options={AMOUNT_OPERATORS.map((op) => ({
                    label: amountOperatorLabel(op),
                    value: op,
                  }))}
                  value={filters.amountOp}
                />
                {filters.amountOp === "between" ? (
                  <Bounds>
                    <Bound
                      id="drawer-amount-min"
                      label="Min"
                      onChange={(value) => onChange({ amountMin: value })}
                      placeholder="0.00"
                      value={filters.amountMin}
                    />
                    <Bound
                      id="drawer-amount-max"
                      label="Max"
                      onChange={(value) => onChange({ amountMax: value })}
                      placeholder="Any"
                      value={filters.amountMax}
                    />
                  </Bounds>
                ) : (
                  <div className="px-4 pb-4">
                    <Bound
                      id="drawer-amount-value"
                      label="Amount"
                      onChange={(value) =>
                        onChange(
                          filters.amountOp === "lt"
                            ? { amountMax: value }
                            : { amountMin: value }
                        )
                      }
                      placeholder="0.00"
                      value={
                        filters.amountOp === "lt"
                          ? filters.amountMax
                          : filters.amountMin
                      }
                    />
                  </div>
                )}
              </StepperStep>

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Sort" />
                <div className="pb-4">
                  <RadioGroup
                    className="gap-0 divide-y divide-border-muted"
                    onValueChange={(value) => {
                      if (value) {
                        const key = value as PaymentSortKey;
                        onSortChange({ direction: defaultDirection(key), key });
                      }
                    }}
                    value={sort.key}
                  >
                    {SORT_KEYS.map((option) => (
                      <FilterOption
                        key={option.id}
                        label={option.label}
                        value={option.id}
                      />
                    ))}
                  </RadioGroup>
                  <RadioGroup
                    className="gap-0 divide-y divide-border-muted border-border-muted border-t"
                    onValueChange={(value) => {
                      if (value) {
                        onSortChange({
                          direction: value as SortDirection,
                          key: sort.key,
                        });
                      }
                    }}
                    value={sort.direction}
                  >
                    {directionsFor(defaultDirection(sort.key)).map(
                      (direction) => (
                        <FilterOption
                          key={direction}
                          label={directionLabel(sort.key, direction)}
                          value={direction}
                        />
                      )
                    )}
                  </RadioGroup>
                </div>
              </StepperStep>
            </StepperContent>
          </Stepper>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const MENU_STEPS = [
  { key: "type", step: 1 },
  { key: "status", step: 2 },
  { key: "currencies", step: 3 },
  { key: "provider", step: 4 },
  { key: "player", step: 5 },
  { key: "created", step: 6 },
  { key: "amount", step: 7 },
] as const;

/** After every filter step, so adding a filter never renumbers it. */
const SORT_STEP = MENU_STEPS.length + 1;

/**
 * The drilldown menu. Every row's value comes from the same `FILTERS`
 * descriptor the desktop pills read, so a row and its pill cannot disagree
 * about what is applied.
 */
function PaymentFilterMenu({
  filters,
  sort,
}: {
  filters: PaymentFilters;
  sort: SortState;
}) {
  const { goTo } = useStepper();

  const items = MENU_STEPS.map(({ key, step }) => {
    const def = filterDef(key);
    const value = def.value(filters);
    // The same operator the pill shows, so `is not` set on a desktop is not
    // invisible on a phone — the row would otherwise read "BTC" for a table
    // that excludes it.
    const operator = value === null ? null : def.operator?.(filters);
    // A row has room the pill does not, so a multi-select says what the
    // number counts rather than leaving a bare "3".
    const shown =
      key === "currencies" && filters.currencies.length > 1
        ? `${filters.currencies.length} selected`
        : (value ?? def.empty);
    return {
      label: def.label,
      step,
      value: operator ? `${operator} ${shown}` : shown,
    };
  });

  return (
    <DrilldownList>
      {items.map((item) => (
        <DrilldownRow
          key={item.step}
          label={item.label}
          onClick={() => goTo(item.step)}
          value={item.value}
        />
      ))}
      <DrilldownRow
        label="Sort"
        onClick={() => goTo(SORT_STEP)}
        value={sortLabel(sort)}
      />
    </DrilldownList>
  );
}

/**
 * The step header's `Clear`, for a filter that holds a value — `undefined`
 * otherwise, so the header shows no control that would do nothing. Resets to
 * the same patch the pill's X does, operator included.
 */
function held(
  key: FilterKey,
  filters: PaymentFilters,
  onChange: (patch: Partial<PaymentFilters>) => void
): (() => void) | undefined {
  const def = filterDef(key);
  return def.value(filters) === null ? undefined : () => onChange(def.clear);
}

function Bounds({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 px-4 pb-4">{children}</div>;
}
