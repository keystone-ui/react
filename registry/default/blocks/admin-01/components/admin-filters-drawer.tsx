"use client";

import { FilterIcon } from "lucide-react";
import { useState } from "react";
import {
  activeCount,
  defaultDirection,
  directionLabel,
  FILTERS,
  hasActiveFilters,
  OPTIONS,
  type OptionKey,
  SORT_KEYS,
  type SortState,
  sortLabel,
  type UserFilters,
  type UserSortKey,
} from "@/components/admin-filters";
import {
  Bound,
  DrilldownList,
  DrilldownRow,
  FilterOption,
  Options,
  StepHeader,
} from "@/components/drawer-parts";
import { directionsFor, type SortDirection } from "@/components/sort";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Stepper,
  StepperContent,
  StepperStep,
  useStepper,
} from "@/components/ui/stepper";

interface AdminFiltersDrawerProps {
  filters: UserFilters;
  onChange: (patch: Partial<UserFilters>) => void;
  onClear: () => void;
  onSortChange: (sort: SortState) => void;
  sort: SortState;
}

/** The single-select filters, in `FILTERS` order; Created and Sort follow. */
const OPTION_STEPS: readonly OptionKey[] = [
  "role",
  "status",
  "seats",
  "twoFactor",
];

/**
 * The phone half of the users toolbar — the same bottom sheet and `Stepper`
 * drilldown as the payments one, because the two tables are one design.
 *
 * Desktop has the pills; below `sm` they would wrap into a column that buries
 * the table, so the whole filter set folds in here: a menu of "label + current
 * value" rows that each open one screen. The rows come from `FILTERS`, the same
 * descriptors the pills read, so a row and its pill cannot disagree.
 *
 * No `swipeDirection`: the primitive's default is `down`, which supplies the
 * bottom-sheet geometry and the drag handle.
 *
 * Filters apply live; `Apply` only dismisses. There is no draft state to
 * reconcile, and on a large phone the table is visible behind the sheet.
 */
export function AdminFiltersDrawer({
  filters,
  onChange,
  onClear,
  onSortChange,
  sort,
}: AdminFiltersDrawerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const count = activeCount(filters);

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
          width — without it a filtered table gives no sign of being filtered.
          Sort is deliberately not counted: it is not a filter, and a badge that
          ticks up when you reorder a column is lying. */}
      <DrawerTrigger render={<Button size="sm" variant="outline" />}>
        <FilterIcon className="size-4" />
        Filters
        {count > 0 && <Badge variant="secondary">{count}</Badge>}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <Stepper onValueChange={setStep} value={step}>
            <StepperContent>
              <StepperStep>
                <DrawerHeader>
                  <DrawerTitle className="text-center">Filters</DrawerTitle>
                </DrawerHeader>
                <UserFilterMenu filters={filters} sort={sort} />
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

              {OPTION_STEPS.map((key) => (
                <StepperStep key={key}>
                  <StepHeader
                    onBack={() => setStep(0)}
                    title={FILTERS.find((def) => def.key === key)?.label ?? key}
                  />
                  <Options
                    onValueChange={(value) => onChange({ [key]: value })}
                    value={filters[key]}
                  >
                    {OPTIONS[key].map((option) => (
                      <FilterOption
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </Options>
                </StepperStep>
              ))}

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Created" />
                <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                  <Bound
                    id="users-drawer-created-after"
                    label="After"
                    onChange={(value) => onChange({ createdAfter: value })}
                    type="date"
                    value={filters.createdAfter}
                  />
                  <Bound
                    id="users-drawer-created-before"
                    label="Before"
                    onChange={(value) => onChange({ createdBefore: value })}
                    type="date"
                    value={filters.createdBefore}
                  />
                </div>
              </StepperStep>

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Sort" />
                <div className="pb-4">
                  <RadioGroup
                    className="gap-0 divide-y divide-border-muted"
                    onValueChange={(value) => {
                      if (value) {
                        const key = value as UserSortKey;
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

/**
 * The drilldown menu, generated from the descriptors so a row and its step
 * cannot disagree about their order. Sort is appended by hand because it is
 * not a filter and is not in `FILTERS`.
 */
function UserFilterMenu({
  filters,
  sort,
}: {
  filters: UserFilters;
  sort: SortState;
}) {
  const { goTo } = useStepper();
  const items = [
    ...FILTERS.map((def) => ({
      key: def.key as string,
      label: def.label,
      value: def.value(filters) ?? def.empty,
    })),
    { key: "sort", label: "Sort", value: sortLabel(sort) },
  ];

  return (
    <DrilldownList>
      {items.map((item, index) => (
        <DrilldownRow
          key={item.key}
          label={item.label}
          // Step 0 is the menu itself, so the first row is step 1.
          onClick={() => goTo(index + 1)}
          value={item.value}
        />
      ))}
    </DrilldownList>
  );
}
