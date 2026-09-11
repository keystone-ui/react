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
import { Label } from "@keystoneui/react/label";
import { RadioGroup, RadioGroupItem } from "@keystoneui/react/radio-group";
import {
  Stepper,
  StepperContent,
  StepperStep,
  useStepper,
} from "@keystoneui/react/stepper";
import {
  ArrowLeft as ArrowLeftIcon,
  ChevronRight as ChevronRightIcon,
  Funnel as FilterIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { CURRENCIES } from "./mock-payments";
import {
  FILTERS,
  filterDef,
  hasActiveFilters,
  type PaymentFilters,
  PROVIDER_OPTIONS,
  providerLabel,
  STATUS_OPTIONS,
  statusLabel,
  TYPE_OPTIONS,
  typeLabel,
} from "./payment-filters";

interface PaymentFiltersDrawerProps {
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onClear: () => void;
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
 */
export function PaymentFiltersDrawer({
  filters,
  onChange,
  onClear,
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
      <DrawerTrigger render={<Button variant="outline" />}>
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
                <FilterMenu filters={filters} />
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
                <SubHeader title="Action" />
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
                <SubHeader title="Status" />
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
                <SubHeader title="Currency" />
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
                <SubHeader title="Provider" />
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
                <SubHeader title="Created" />
                <Bounds>
                  <Bound
                    id="drawer-created-after"
                    label="After"
                    onChange={(value) => onChange({ createdAfter: value })}
                    type="date"
                    value={filters.createdAfter}
                  />
                  <Bound
                    id="drawer-created-before"
                    label="Before"
                    onChange={(value) => onChange({ createdBefore: value })}
                    type="date"
                    value={filters.createdBefore}
                  />
                </Bounds>
              </StepperStep>

              <StepperStep>
                <SubHeader title="Amount" />
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
  { key: "created", step: 5 },
  { key: "amount", step: 6 },
] as const;

/**
 * The drilldown menu. Every row's value comes from the same `FILTERS`
 * descriptor the desktop pills read, so a row and its pill cannot disagree
 * about what is applied.
 */
function FilterMenu({ filters }: { filters: PaymentFilters }) {
  const { goTo } = useStepper();

  const items = MENU_STEPS.map(({ key, step }) => {
    const def = filterDef(key);
    return {
      label: def.label,
      step,
      // A row has room the pill does not, so a multi-select says what the
      // number counts rather than leaving a bare "3".
      value:
        key === "currencies" && filters.currencies.length > 1
          ? `${filters.currencies.length} selected`
          : (def.value(filters) ?? def.empty),
    };
  });

  return (
    <div className="divide-y divide-border-muted">
      {items.map((item) => (
        <button
          className="flex h-12 w-full cursor-pointer items-center justify-between gap-3 px-4 text-left active:text-muted-foreground"
          key={item.step}
          onClick={() => goTo(item.step)}
          type="button"
        >
          <span className="font-medium text-sm">{item.label}</span>
          <span className="ml-auto inline-flex min-w-0 items-center gap-2 text-muted-foreground text-sm">
            <span className="truncate">{item.value}</span>
            <ChevronRightIcon className="size-4 shrink-0" />
          </span>
        </button>
      ))}
    </div>
  );
}

function Options({
  children,
  onValueChange,
  value,
}: {
  children: ReactNode;
  onValueChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="pb-4">
      <RadioGroup
        className="gap-0 divide-y divide-border-muted"
        onValueChange={(next) => {
          if (next) {
            onValueChange(next as string);
          }
        }}
        value={value}
      >
        {children}
      </RadioGroup>
    </div>
  );
}

function FilterOption({ label, value }: { label: string; value: string }) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: control is inside label
    <label className="flex h-12 cursor-pointer items-center gap-3 px-4">
      <RadioGroupItem value={value} />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function Bounds({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 px-4 pb-4">{children}</div>;
}

function Bound({
  id,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
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

function SubHeader({ title }: { title: string }) {
  const { goTo } = useStepper();
  return (
    <DrawerHeader>
      <div className="flex items-center gap-2">
        <Button
          aria-label="Back"
          className="-ml-1"
          onClick={() => goTo(0)}
          size="icon-xs"
          variant="ghost"
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <DrawerTitle>{title}</DrawerTitle>
      </div>
    </DrawerHeader>
  );
}
