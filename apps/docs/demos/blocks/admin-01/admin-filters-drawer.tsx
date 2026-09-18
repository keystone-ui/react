"use client";

import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@keystoneui/react/drawer";
import { RadioGroup } from "@keystoneui/react/radio-group";
import {
  Stepper,
  StepperContent,
  StepperStep,
  useStepper,
} from "@keystoneui/react/stepper";
import { cn } from "@keystoneui/react/utils";
import { Funnel as FilterIcon } from "lucide-react";
import { useState } from "react";

import {
  appliedFilters,
  defaultDirection,
  directionLabel,
  FILTERS,
  type FilterKey,
  hasActiveFilters,
  ROLES,
  roleLabel,
  SEATS_OPTIONS,
  type SeatsFilter,
  SORT_KEYS,
  type SortDirection,
  type SortOptionId,
  type SortState,
  STATUSES,
  type StatusFilter,
  sortLabel,
  statusLabel,
  TWO_FACTOR_OPTIONS,
  type TwoFactorFilter,
  type UserFilters,
  type UserSortKey,
} from "./admin-filters";
import {
  Bound,
  DrilldownList,
  DrilldownRow,
  FilterOption,
  Options,
  StepHeader,
} from "./drawer-parts";
import { statusLabels } from "./mock-admin";

interface AdminFiltersDrawerProps {
  filters: UserFilters;
  onChange: (patch: Partial<UserFilters>) => void;
  onClear: () => void;
  onSortChange: (id: SortOptionId) => void;
  /**
   * `down` gives a bottom sheet, `right` a side panel. Rendered twice behind a
   * CSS fork rather than switched at runtime — see the note on the component.
   */
  placement: "down" | "right";
  sort: SortState | null;
}

/**
 * The filter surface, at every width.
 *
 * Not a mobile fallback any more: this table's filters live here on desktop
 * too, with the applied ones shown as chips in the toolbar. One surface means
 * there is no second tree to keep in step — the failure this block shipped
 * once, where three filters existed on desktop and nowhere else.
 *
 * The body is a `Stepper`: a menu of "label + current value" rows that drill
 * into one screen per filter. Same shape as `tickets-01`'s drawer and the
 * payments one, because a filter set too large for a toolbar is the same
 * problem wherever it appears.
 *
 * The *shell* differs by width — a bottom sheet on a phone, a right-hand panel
 * on a desktop, each the idiom for its size. `swipeDirection` is a prop rather
 * than a class, so this is rendered twice behind a CSS fork instead of being
 * switched at runtime: a `useMediaQuery` would have to guess on the server and
 * flip after hydration. Both shells are mounted, only one is in the
 * accessibility tree, and the date inputs take their ids from `placement`
 * because two mounted copies cannot share them.
 *
 * The rows are generated from `FILTERS`, so a new filter is one descriptor
 * rather than a row, a step, a hand-assigned index and a count that all have
 * to agree.
 *
 * Filters apply live; `Apply` only dismisses. There is no draft state to
 * reconcile, and on a large phone the table is visible behind the sheet.
 */
export function AdminFiltersDrawer({
  filters,
  onChange,
  onClear,
  onSortChange,
  placement,
  sort,
}: AdminFiltersDrawerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const activeCount = appliedFilters(filters).length;

  return (
    <Drawer
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setStep(0);
        }
      }}
      open={open}
      swipeDirection={placement}
    >
      {/* The count is the length of the same list the chips render, so the two
          cannot disagree — unlike the payments badge this block once carried,
          which counted the panel's filters while pills showed the rest. Sort
          lives in here too and is deliberately not counted: it is not a filter,
          and a badge that ticks up when you reorder a column is lying. */}
      <DrawerTrigger render={<Button variant="outline" />}>
        <FilterIcon className="size-4" />
        Filters
        {activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}
      </DrawerTrigger>
      <DrawerContent variant={placement === "right" ? "floating" : "flush"}>
        {/* The centring column is a bottom-sheet idiom: that sheet is
            full-width, so its content needs a readable cap. The side panel is
            already capped — `sm:max-w-sm`, and `max-w-md` once `floating`
            applies at `md+` — so carrying the same `max-w-sm` into it only
            carves 32px of dead margin out of each side, on top of the 16px the
            Drawer parts already own. `px-0` because the drilldown rows bring
            their own `px-4`. */}
        <DrawerBody
          className={cn(
            "px-0",
            placement === "down" && "mx-auto w-full max-w-sm"
          )}
        >
          <Stepper onValueChange={setStep} value={step}>
            <StepperContent>
              <StepperStep>
                <DrawerHeader>
                  <DrawerTitle className="text-center">Filters</DrawerTitle>
                </DrawerHeader>
                <UserFilterMenu filters={filters} sort={sort} />
              </StepperStep>

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Role" />
                <Options
                  onValueChange={(value) =>
                    onChange({ role: value as UserFilters["role"] })
                  }
                  value={filters.role}
                >
                  <FilterOption label={roleLabel("all")} value="all" />
                  {ROLES.map((role) => (
                    <FilterOption key={role} label={role} value={role} />
                  ))}
                </Options>
              </StepperStep>

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Status" />
                <Options
                  onValueChange={(value) =>
                    onChange({ status: value as StatusFilter })
                  }
                  value={filters.status}
                >
                  <FilterOption label={statusLabel("all")} value="all" />
                  {STATUSES.map((status) => (
                    <FilterOption
                      key={status}
                      label={statusLabels[status]}
                      value={status}
                    />
                  ))}
                </Options>
              </StepperStep>

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Seats" />
                <Options
                  onValueChange={(value) =>
                    onChange({ seats: value as SeatsFilter })
                  }
                  value={filters.seats}
                >
                  {SEATS_OPTIONS.map((option) => (
                    <FilterOption
                      key={option.id}
                      label={option.label}
                      value={option.id}
                    />
                  ))}
                </Options>
              </StepperStep>

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Two-factor" />
                <Options
                  onValueChange={(value) =>
                    onChange({ twoFactor: value as TwoFactorFilter })
                  }
                  value={filters.twoFactor}
                >
                  {TWO_FACTOR_OPTIONS.map((option) => (
                    <FilterOption
                      key={option.id}
                      label={option.label}
                      value={option.id}
                    />
                  ))}
                </Options>
              </StepperStep>

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Created" />
                <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                  <Bound
                    id={`users-${placement}-created-after`}
                    label="After"
                    onChange={(value) => onChange({ createdAfter: value })}
                    value={filters.createdAfter}
                  />
                  <Bound
                    id={`users-${placement}-created-before`}
                    label="Before"
                    onChange={(value) => onChange({ createdBefore: value })}
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
                        onSortChange(
                          value === "none"
                            ? "none"
                            : (`${value}:${defaultDirection(
                                value as UserSortKey
                              )}` as SortOptionId)
                        );
                      }
                    }}
                    value={sort?.key ?? "none"}
                  >
                    <FilterOption label="Unsorted" value="none" />
                    {SORT_KEYS.map((option) => (
                      <FilterOption
                        key={option.id}
                        label={option.label}
                        value={option.id}
                      />
                    ))}
                  </RadioGroup>

                  {sort ? (
                    <RadioGroup
                      className="gap-0 divide-y divide-border-muted border-border-muted border-t"
                      onValueChange={(value) => {
                        if (value) {
                          onSortChange(
                            `${sort.key}:${
                              value as SortDirection
                            }` as SortOptionId
                          );
                        }
                      }}
                      value={sort.direction}
                    >
                      <FilterOption
                        label={directionLabel(sort.key, "asc")}
                        value="asc"
                      />
                      <FilterOption
                        label={directionLabel(sort.key, "desc")}
                        value="desc"
                      />
                    </RadioGroup>
                  ) : null}
                </div>
              </StepperStep>
            </StepperContent>
          </Stepper>
        </DrawerBody>

        {/* Outside the Stepper on purpose: `StepperContent` animates to its
            measured step height and never stretches, so a footer nested inside
            it cannot reach the foot of a full-height side panel. As a sibling
            of `DrawerBody` (flex-1) its own `mt-auto`/`shrink-0` pins it. Only
            step 0 ever had a footer — the sub-steps have a Back header and no
            apply affordance. */}
        {step === 0 && (
          <DrawerFooter
            className={cn(placement === "down" && "mx-auto w-full max-w-sm")}
          >
            {hasActiveFilters(filters) && (
              <Button className="w-full" onClick={onClear} variant="ghost">
                Clear all
              </Button>
            )}
            <Button className="w-full" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </DrawerFooter>
        )}
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
  sort: SortState | null;
}) {
  const { goTo } = useStepper();
  const items: { key: FilterKey | "sort"; label: string; value: string }[] = [
    ...FILTERS.map((def) => ({
      key: def.key,
      label: def.label,
      value: def.value(filters) ?? def.empty,
    })),
    { key: "sort" as const, label: "Sort", value: sortLabel(sort) },
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
