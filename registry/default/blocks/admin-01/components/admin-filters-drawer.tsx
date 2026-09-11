"use client";

import { ArrowLeftIcon, ChevronRightIcon, FilterIcon } from "lucide-react";
import { useState } from "react";
import {
  defaultDirection,
  directionLabel,
  ROLES,
  type RoleFilter,
  roleLabel,
  SORT_KEYS,
  type SortDirection,
  type SortOptionId,
  type SortState,
  STATUSES,
  type StatusFilter,
  sortLabel,
  statusLabel,
  type UserSortKey,
} from "@/components/admin-filters";
import { statusLabels } from "@/components/mock-admin";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Stepper,
  StepperContent,
  StepperStep,
  useStepper,
} from "@/components/ui/stepper";

interface AdminFiltersDrawerProps {
  activeCount: number;
  onClearAll: () => void;
  onRoleFilterChange: (role: RoleFilter) => void;
  onSortChange: (id: SortOptionId) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  roleFilter: RoleFilter;
  sort: SortState | null;
  statusFilter: StatusFilter;
}

/**
 * The mobile half of the users toolbar.
 *
 * A bottom sheet whose body is a `Stepper`: a menu of "label + current value"
 * rows that drill into one screen per filter. Same shape as `tickets-01`'s
 * drawer, because the pattern is the block-level answer to a toolbar that
 * cannot fit — not something each block should reinvent.
 *
 * No `swipeDirection` is passed: the primitive's default is `down`, which is
 * what supplies the bottom-sheet geometry and the drag handle.
 *
 * Filters apply live, with no draft state — `Apply` only dismisses. That is
 * `tickets-01`'s behaviour too, and it is the right one here: the table is
 * visible behind the sheet on larger phones, so a pick shows its effect
 * immediately.
 */
export function AdminFiltersDrawer({
  activeCount,
  onClearAll,
  onRoleFilterChange,
  onSortChange,
  onStatusFilterChange,
  roleFilter,
  sort,
  statusFilter,
}: AdminFiltersDrawerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

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
      {/* The count is on the trigger because the desktop `Clear N` button is
          hidden at this width -- without it, a filtered table on a phone gives
          no sign that anything is filtering it. */}
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
                <FilterMenu
                  roleValue={roleLabel(roleFilter)}
                  sortValue={sortLabel(sort)}
                  statusValue={statusLabel(statusFilter)}
                />
                <DrawerFooter>
                  {activeCount > 0 && (
                    <Button
                      className="w-full"
                      onClick={onClearAll}
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
                <SubHeader title="Role" />
                <div className="pb-4">
                  <RadioGroup
                    className="gap-0 divide-y divide-border-muted"
                    onValueChange={(value) => {
                      if (value) {
                        onRoleFilterChange(value as RoleFilter);
                      }
                    }}
                    value={roleFilter}
                  >
                    <FilterOption label="All" value="all" />
                    {ROLES.map((role) => (
                      <FilterOption key={role} label={role} value={role} />
                    ))}
                  </RadioGroup>
                </div>
              </StepperStep>

              <StepperStep>
                <SubHeader title="Status" />
                <div className="pb-4">
                  <RadioGroup
                    className="gap-0 divide-y divide-border-muted"
                    onValueChange={(value) => {
                      if (value) {
                        onStatusFilterChange(value as StatusFilter);
                      }
                    }}
                    value={statusFilter}
                  >
                    <FilterOption label="All" value="all" />
                    {STATUSES.map((status) => (
                      <FilterOption
                        key={status}
                        label={statusLabels[status]}
                        value={status}
                      />
                    ))}
                  </RadioGroup>
                </div>
              </StepperStep>

              <StepperStep>
                <SubHeader title="Sort" />
                {/* Column, then direction — the same split the desktop menu
                    makes, so the two surfaces ask the same two questions. */}
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
        </div>
      </DrawerContent>
    </Drawer>
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

function FilterMenu({
  roleValue,
  sortValue,
  statusValue,
}: {
  roleValue: string;
  sortValue: string;
  statusValue: string;
}) {
  const { goTo } = useStepper();
  const items = [
    { label: "Role", step: 1, value: roleValue },
    { label: "Status", step: 2, value: statusValue },
    { label: "Sort", step: 3, value: sortValue },
  ];

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
