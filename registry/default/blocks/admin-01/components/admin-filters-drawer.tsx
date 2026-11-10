"use client";

import { FilterIcon } from "lucide-react";
import { useState } from "react";
import {
  activeCount,
  CREATED_PRESETS,
  createdOf,
  createdPatch,
  defaultDirection,
  directionLabel,
  FILTERS,
  type FilterKey,
  filterDef,
  OPTIONS,
  type OptionKey,
  SORT_KEYS,
  type SortState,
  STATUS_OPERATORS,
  STATUSES,
  type StatusOperator,
  sortLabel,
  statusLabel,
  type UserFilters,
  type UserSortKey,
} from "@/components/admin-filters";
import {
  DATE_OPERATORS,
  type DateOperator,
  dateOperatorLabel,
  setDateOperator,
  TODAY,
} from "@/components/date-filter";
import { DateFilterStep } from "@/components/date-filter-step";
import {
  AppliedRow,
  COLLAPSE_MS,
  Collapse,
  ColumnChecklist,
  DrawerSection,
  type DrawerView,
  DrilldownList,
  DrilldownRow,
  FILTER_SHEET,
  FilterOption,
  GROUP,
  type OperatorHandle,
  OperatorSheet,
  Options,
  SetChecklist,
  StepHeader,
  ViewSection,
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
import { useReducedMotion } from "@/components/use-reduced-motion";

interface AdminFiltersDrawerProps<C extends string> {
  filters: UserFilters;
  onChange: (patch: Partial<UserFilters>) => void;
  onSortChange: (sort: SortState) => void;
  sort: SortState;
  /** Columns and Export, which the desktop shows beside Sort. */
  view: DrawerView<C>;
}

/**
 * The steps before Created, in `FILTERS` order — the menu's rows drill into
 * them by position. Status is a set with an operator; the rest are radios.
 */
const LIST_STEPS: readonly (OptionKey | "status")[] = [
  "role",
  "status",
  "seats",
  "twoFactor",
];

/** The filters here with a comparison to choose. */
type UserOperatorKey = "created" | "status";

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
export function AdminFiltersDrawer<C extends string>({
  filters,
  onChange,
  onSortChange,
  sort,
  view,
}: AdminFiltersDrawerProps<C>) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const count = activeCount(filters);

  // The key outlives `sheetOpen` so the sheet keeps its options while it
  // slides away.
  const [sheetKey, setSheetKey] = useState<UserOperatorKey>("status");
  const [sheetOpen, setSheetOpen] = useState(false);

  const operatorFor = (key: UserOperatorKey) =>
    key === "created"
      ? {
          label: dateOperatorLabel(createdOf(filters).op),
          options: DATE_OPERATORS,
          select: (next: string) =>
            onChange(
              createdPatch(
                setDateOperator(createdOf(filters), next as DateOperator, TODAY)
              )
            ),
          value: createdOf(filters).op as string,
        }
      : {
          label:
            STATUS_OPERATORS.find((item) => item.value === filters.statusOp)
              ?.label ?? "",
          options: STATUS_OPERATORS.map((item) => ({
            label: item.label.charAt(0).toUpperCase() + item.label.slice(1),
            value: item.value,
          })),
          select: (next: string) =>
            onChange({ statusOp: next as StatusOperator }),
          value: filters.statusOp as string,
        };

  const handle = (key: UserOperatorKey): OperatorHandle => ({
    label: operatorFor(key).label,
    onOpen: () => {
      setSheetKey(key);
      setSheetOpen(true);
    },
  });
  const sheet = operatorFor(sheetKey);

  // Clears the value and keeps the operator, as the desktop popovers do; the
  // applied row's ✕ is what removes the filter outright.
  const clearFor = (key: FilterKey) => {
    const def = filterDef(key);
    return def.value(filters) === null
      ? undefined
      : () => onChange(def.clearValue ? def.clearValue(filters) : def.clear);
  };

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
      <DrawerContent className={FILTER_SHEET}>
        <div className="w-full">
          <Stepper onValueChange={setStep} value={step}>
            {/* The sheet is a fixed height, so a step's height has nothing
                to animate. */}
            <StepperContent animateHeight={false}>
              <StepperStep>
                <DrawerHeader>
                  <DrawerTitle className="text-center">Filters</DrawerTitle>
                </DrawerHeader>
                <UserFilterMenu
                  handle={handle}
                  filters={filters}
                  onRemove={(key) => onChange(filterDef(key).clear)}
                  sort={sort}
                  view={view}
                />
                {/* No `Clear all` here: each applied row carries its own ✕,
                    and a button that wipes every filter at once sat one slip
                    of the thumb from `Apply`. The toolbar keeps one. */}
                <DrawerFooter>
                  <Button className="w-full" onClick={() => setOpen(false)}>
                    Apply
                  </Button>
                </DrawerFooter>
              </StepperStep>

              {LIST_STEPS.map((key) =>
                key === "status" ? (
                  <StepperStep key={key}>
                    <StepHeader
                      onBack={() => setStep(0)}
                      onClear={clearFor("status")}
                      operator={handle("status")}
                      title="Status"
                    />
                    <SetChecklist
                      items={STATUSES}
                      label={statusLabel}
                      onChange={(next) => onChange({ statuses: next })}
                      value={filters.statuses}
                    />
                  </StepperStep>
                ) : (
                  <StepperStep key={key}>
                    <StepHeader
                      onBack={() => setStep(0)}
                      title={
                        FILTERS.find((def) => def.key === key)?.label ?? key
                      }
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
                )
              )}

              <StepperStep>
                <StepHeader
                  onBack={() => setStep(0)}
                  onClear={clearFor("created")}
                  operator={handle("created")}
                  title="Created"
                />
                <DateFilterStep
                  filter={createdOf(filters)}
                  onChange={(next) => onChange(createdPatch(next))}
                  presets={CREATED_PRESETS}
                  surface="sheet"
                  today={TODAY}
                />
              </StepperStep>

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Sort" />
                <div className="pb-4">
                  <RadioGroup
                    className={`gap-0 ${GROUP}`}
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
                    className={`mt-3 gap-0 ${GROUP}`}
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

              <StepperStep>
                <StepHeader onBack={() => setStep(0)} title="Columns" />
                <ColumnChecklist view={view} />
              </StepperStep>
            </StepperContent>
          </Stepper>
          <OperatorSheet
            onOpenChange={setSheetOpen}
            onSelect={sheet.select}
            open={sheetOpen}
            options={sheet.options}
            title={filterDef(sheetKey).label}
            value={sheet.value}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * The drilldown menu: what is applied, then everything there is — the same
 * shape as the payments menu. Generated from the descriptors so a row and its
 * step cannot disagree about their order. Sort is appended by hand because it
 * is not a filter and is not in `FILTERS`.
 */
function UserFilterMenu<C extends string>({
  filters,
  handle,
  onRemove,
  sort,
  view,
}: {
  filters: UserFilters;
  handle: (key: UserOperatorKey) => OperatorHandle;
  onRemove: (key: FilterKey) => void;
  sort: SortState;
  view: DrawerView<C>;
}) {
  const { goTo } = useStepper();
  // Step 0 is the menu itself, so the first filter is step 1.
  const steps = FILTERS.map((def, index) => ({ def, step: index + 1 }));
  const applied = steps.flatMap(({ def, step }) => {
    // Listed while it holds a value; shown beside its badge as the operand
    // where it has one, which `is empty` does not.
    if (def.value(filters) === null) {
      return [];
    }
    const value = def.operand ? def.operand(filters) : def.value(filters);
    return [{ def, step, value }];
  });
  // The row on its way out: it collapses first, and is removed — its filter
  // cleared — once the collapse is done, so the rows below slide up into its
  // place instead of jumping.
  const [leaving, setLeaving] = useState<FilterKey | null>(null);
  const reduced = useReducedMotion();
  const remove = (key: FilterKey) => {
    if (leaving) {
      return;
    }
    setLeaving(key);
    // Under reduced motion the collapse is instant, so nothing to wait for.
    window.setTimeout(
      () => {
        onRemove(key);
        setLeaving(null);
      },
      reduced ? 0 : COLLAPSE_MS
    );
  };
  // Removing the last one closes the whole section, header and all.
  const sectionOpen = !(applied.length === 1 && applied[0].def.key === leaving);

  return (
    <>
      {applied.length > 0 && (
        <Collapse open={sectionOpen}>
          <DrawerSection label="Applied filters">
            <DrilldownList>
              {applied.map(({ def, step, value }) => (
                <Collapse
                  key={def.key}
                  open={def.key !== leaving || !sectionOpen}
                >
                  <AppliedRow
                    label={def.label}
                    onEdit={() => goTo(step)}
                    onRemove={() => remove(def.key)}
                    operator={
                      def.key === "created" || def.key === "status"
                        ? handle(def.key)
                        : undefined
                    }
                    value={value}
                  />
                </Collapse>
              ))}
            </DrilldownList>
          </DrawerSection>
        </Collapse>
      )}
      <DrawerSection label="All filters">
        <DrilldownList>
          {steps.map(({ def, step }) => (
            <DrilldownRow
              key={def.key}
              label={def.label}
              onClick={() => goTo(step)}
            />
          ))}
        </DrilldownList>
      </DrawerSection>
      {/* Sort follows the filter steps, and Columns follows Sort. */}
      <ViewSection
        onColumns={() => goTo(steps.length + 2)}
        onSort={() => goTo(steps.length + 1)}
        sortValue={sortLabel(sort)}
        view={view}
      />
    </>
  );
}
