"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { CURRENCIES, PROVIDERS } from "@/components/mock-payments";
import {
  FILTERS,
  type PaymentFilters,
  type ProviderFilter,
  SORT_OPTIONS,
  type SortOptionId,
  type SortState,
  STATUS_OPTIONS,
  statusLabel,
  TYPE_OPTIONS,
  toSortOptionId,
  typeLabel,
} from "@/components/payment-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentFiltersDrawerProps {
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onClear: () => void;
  onSortChange: (id: SortOptionId) => void;
  sort: SortState;
}

/**
 * The whole filter set, for widths where the pill row does not fit.
 *
 * A row of pills becomes a column of pills on a phone, pushing the table it is
 * filtering off the screen — so below `sm` the pills fold away and this
 * carries everything instead. Everything: the drawer is the *only* way to
 * reach these filters at that width, so anything missing here is unreachable,
 * not merely inconvenient.
 *
 * `swipeDirection="right"` with `variant="floating"`: the floating inset is
 * inert below `md`, so a phone gets the full-height sheet and a tablet gets a
 * panel with the rows still visible around it. One component, no media query.
 */
export function PaymentFiltersDrawer({
  filters,
  onChange,
  onClear,
  onSortChange,
  sort,
}: PaymentFiltersDrawerProps) {
  const [open, setOpen] = useState(false);
  const count = FILTERS.filter((def) => def.value(filters) !== null).length;

  const toggleCurrency = (currency: (typeof CURRENCIES)[number]) => {
    onChange({
      currencies: filters.currencies.includes(currency)
        ? filters.currencies.filter((item) => item !== currency)
        : [...filters.currencies, currency],
    });
  };

  return (
    <Drawer onOpenChange={setOpen} open={open} swipeDirection="right">
      <DrawerTrigger render={<Button variant="outline" />}>
        <SlidersHorizontalIcon />
        Filters
        {count > 0 && <Badge variant="secondary">{count}</Badge>}
      </DrawerTrigger>
      <DrawerContent variant="floating">
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>

        <DrawerBody className="flex flex-col gap-6">
          <Group label="Action">
            <Select
              onValueChange={(value) =>
                onChange({ type: value as PaymentFilters["type"] })
              }
              value={filters.type}
            >
              <SelectTrigger aria-label="Action" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {typeLabel(option)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Group>

          <Group label="Status">
            <Select
              onValueChange={(value) =>
                onChange({ status: value as PaymentFilters["status"] })
              }
              value={filters.status}
            >
              <SelectTrigger aria-label="Status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {statusLabel(option)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Group>

          <Group label="Currencies">
            <div className="flex flex-col gap-2">
              {CURRENCIES.map((currency) => (
                // biome-ignore lint/a11y/noLabelWithoutControl: control is inside label
                <label
                  className="flex cursor-pointer items-center gap-2.5 text-sm"
                  key={currency}
                >
                  <Checkbox
                    checked={filters.currencies.includes(currency)}
                    onCheckedChange={() => toggleCurrency(currency)}
                  />
                  {currency}
                </label>
              ))}
            </div>
          </Group>

          <Group label="Provider">
            <Select
              onValueChange={(value) =>
                onChange({ provider: value as ProviderFilter })
              }
              value={filters.provider}
            >
              <SelectTrigger aria-label="Provider" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All providers</SelectItem>
                  {PROVIDERS.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Group>

          <Group label="Created">
            <div className="grid grid-cols-2 gap-3">
              <Field htmlFor="created-after" label="After">
                <Input
                  id="created-after"
                  onChange={(event) =>
                    onChange({ createdAfter: event.target.value })
                  }
                  type="date"
                  value={filters.createdAfter}
                />
              </Field>
              <Field htmlFor="created-before" label="Before">
                <Input
                  id="created-before"
                  onChange={(event) =>
                    onChange({ createdBefore: event.target.value })
                  }
                  type="date"
                  value={filters.createdBefore}
                />
              </Field>
            </div>
          </Group>

          <Group label="Amount">
            <div className="grid grid-cols-2 gap-3">
              <Field htmlFor="amount-min" label="Min">
                <Input
                  id="amount-min"
                  inputMode="decimal"
                  onChange={(event) =>
                    onChange({ amountMin: event.target.value })
                  }
                  placeholder="0.00"
                  value={filters.amountMin}
                />
              </Field>
              <Field htmlFor="amount-max" label="Max">
                <Input
                  id="amount-max"
                  inputMode="decimal"
                  onChange={(event) =>
                    onChange({ amountMax: event.target.value })
                  }
                  placeholder="Any"
                  value={filters.amountMax}
                />
              </Field>
            </div>
          </Group>

          <Group label="Sort">
            <Select
              onValueChange={(value) => onSortChange(value as SortOptionId)}
              value={toSortOptionId(sort)}
            >
              <SelectTrigger aria-label="Sort" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Group>
        </DrawerBody>

        <DrawerFooter className="flex-row gap-2">
          <Button className="flex-1" onClick={onClear} variant="outline">
            Clear all
          </Button>
          <Button className="flex-1" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function Group({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold text-sm">{label}</h3>
      {children}
    </section>
  );
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground" htmlFor={htmlFor}>
        {label}
      </Label>
      {children}
    </div>
  );
}
