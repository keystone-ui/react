"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { CURRENCIES, PROVIDERS } from "@/components/mock-payments";
import type {
  PaymentFilters,
  ProviderFilter,
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
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

interface PaymentFiltersDrawerProps {
  count: number;
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onClear: () => void;
}

/**
 * The long tail of the filter set, in a right-hand sheet.
 *
 * A panel rather than a persistent rail because this table is wide: it needs
 * roughly 1050px and the content area is 1024px at a 1280px viewport, so a
 * 300px rail would cost a third of the width the columns need and force
 * horizontal scrolling on a standard laptop. Opening on demand costs nothing
 * until it is opened.
 *
 * One `swipeDirection="right"` serves both sizes — the primitive is already
 * responsive, taking 75% of the width on a phone and settling into a floating
 * panel at `md`. There is no media query here, and so nothing to get wrong on
 * the server.
 */
export function PaymentFiltersDrawer({
  count,
  filters,
  onChange,
  onClear,
}: PaymentFiltersDrawerProps) {
  const [open, setOpen] = useState(false);

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
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>

        <DrawerBody className="flex flex-col gap-6">
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
            <NativeSelect
              aria-label="Provider"
              onChange={(event) =>
                onChange({ provider: event.target.value as ProviderFilter })
              }
              value={filters.provider}
            >
              <NativeSelectOption value="all">All providers</NativeSelectOption>
              {PROVIDERS.map((provider) => (
                <NativeSelectOption key={provider} value={provider}>
                  {provider}
                </NativeSelectOption>
              ))}
            </NativeSelect>
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
      <Label className="text-muted-foreground text-xs" htmlFor={htmlFor}>
        {label}
      </Label>
      {children}
    </div>
  );
}
