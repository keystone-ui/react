"use client";

import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@keystoneui/react/drawer";
import { Input } from "@keystoneui/react/input";
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
import {
  DATE_OPERATORS,
  type DateOperator,
  dateOperatorLabel,
  setDateOperator,
  TODAY,
} from "./date-filter";
import { DateFilterStep } from "./date-filter-step";
import {
  AppliedRow,
  Bound,
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
} from "./drawer-parts";
import { CURRENCIES } from "./mock-payments";
import {
  CREATED_PRESETS,
  createdOf,
  createdPatch,
  defaultDirection,
  directionLabel,
  FILTERS,
  type FilterKey,
  filterDef,
  type OperatorKey,
  operatorChoice,
  type PaymentFilters,
  type PaymentSortKey,
  PROVIDER_OPTIONS,
  providerLabel,
  SORT_KEYS,
  type SortState,
  STATUSES,
  sortLabel,
  statusLabel,
  TYPE_OPTIONS,
  typeLabel,
} from "./payment-filters";
import { directionsFor, type SortDirection } from "./sort";
import { useReducedMotion } from "./use-reduced-motion";

interface PaymentFiltersDrawerProps<C extends string> {
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onSortChange: (sort: SortState) => void;
  sort: SortState;
  /** Columns and Export, which the desktop shows beside Sort. */
  view: DrawerView<C>;
}

/** The filters whose comparison can change, Created's date mode among them. */
type DrawerOperatorKey = OperatorKey | "created";

const OPERATOR_KEYS: readonly DrawerOperatorKey[] = [
  "status",
  "currencies",
  "player",
  "created",
  "amount",
];

function isOperatorKey(key: FilterKey): key is DrawerOperatorKey {
  return (OPERATOR_KEYS as readonly string[]).includes(key);
}

/** A filter's operator, wired to the drawer: what it reads and how to pick. */
interface DrawerOperator {
  label: string;
  options: readonly { label: string; value: string }[];
  select: (next: string) => void;
  value: string;
}

/**
 * The mobile half of the payments toolbar.
 *
 * The same bottom sheet + `Stepper` drilldown the users drawer uses: a menu
 * that opens one screen per filter is how a phone handles a filter set that
 * will not fit, and a block should not answer that question twice.
 *
 * The menu reads the way Linear's does — what is applied, as sentences you
 * can edit in place, above the list of everything you could filter by. A
 * filter's operator is a badge, in its applied row and beside its step's
 * title, and tapping it stacks a sheet of operators on this one.
 *
 * Filters apply live; `Apply` only dismisses. Sort is the last row, because
 * the desktop Sort menu is hidden at this width too, and it is not counted on
 * the trigger: it is not a filter.
 */
export function PaymentFiltersDrawer<C extends string>({
  filters,
  onChange,
  onSortChange,
  sort,
  view,
}: PaymentFiltersDrawerProps<C>) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const activeCount = FILTERS.filter(
    (def) => def.value(filters) !== null
  ).length;

  // The key outlives `sheetOpen` so the sheet keeps its options while it
  // slides away.
  const [sheetKey, setSheetKey] = useState<DrawerOperatorKey>("player");
  const [sheetOpen, setSheetOpen] = useState(false);

  const operatorFor = (key: DrawerOperatorKey): DrawerOperator => {
    if (key === "created") {
      const created = createdOf(filters);
      return {
        label: dateOperatorLabel(created.op),
        options: DATE_OPERATORS,
        select: (next) =>
          onChange(
            createdPatch(setDateOperator(created, next as DateOperator, TODAY))
          ),
        value: created.op,
      };
    }
    const choice = operatorChoice(key, filters);
    return {
      label: choice.label,
      options: choice.options,
      select: (next) => onChange(choice.patch(next)),
      value: choice.value,
    };
  };

  const handle = (key: DrawerOperatorKey): OperatorHandle => ({
    label: operatorFor(key).label,
    onOpen: () => {
      setSheetKey(key);
      setSheetOpen(true);
    },
  });

  const sheet = operatorFor(sheetKey);

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
                <PaymentFilterMenu
                  filters={filters}
                  handle={handle}
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
                <StepHeader
                  onBack={() => setStep(0)}
                  onClear={held("status", filters, onChange)}
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

              <StepperStep>
                <StepHeader
                  onBack={() => setStep(0)}
                  onClear={held("currencies", filters, onChange)}
                  operator={handle("currencies")}
                  title="Currency"
                />
                <SetChecklist
                  items={CURRENCIES}
                  label={(currency) => currency}
                  onChange={(next) => onChange({ currencies: next })}
                  value={filters.currencies}
                />
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
                  operator={handle("player")}
                  title="Player"
                />
                <div className="px-4 pb-4">
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
                    size="sm"
                    spellCheck={false}
                    value={filters.player}
                  />
                </div>
              </StepperStep>

              <StepperStep>
                <StepHeader
                  onBack={() => setStep(0)}
                  onClear={held("created", filters, onChange)}
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
                <StepHeader
                  onBack={() => setStep(0)}
                  onClear={held("amount", filters, onChange)}
                  operator={handle("amount")}
                  title="Amount"
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
                    className={`gap-0 ${GROUP}`}
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
          {/* Inside this drawer's content, which is what makes it stack on
              this drawer rather than open as a second one beside it. */}
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
const COLUMNS_STEP = SORT_STEP + 1;

/**
 * The drilldown menu: what is applied, then everything there is.
 *
 * Every applied row reads the same `FILTERS` descriptor the desktop pills do,
 * so a row and its pill cannot disagree about what is applied. The list below
 * names the filters only — the applied section already says what each holds.
 */
function PaymentFilterMenu<C extends string>({
  filters,
  handle,
  onRemove,
  sort,
  view,
}: {
  filters: PaymentFilters;
  handle: (key: DrawerOperatorKey) => OperatorHandle;
  onRemove: (key: FilterKey) => void;
  sort: SortState;
  view: DrawerView<C>;
}) {
  const { goTo } = useStepper();
  const applied = MENU_STEPS.flatMap(({ key, step }) => {
    const def = filterDef(key);
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
                      isOperatorKey(def.key) ? handle(def.key) : undefined
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
          {MENU_STEPS.map(({ key, step }) => (
            <DrilldownRow
              key={key}
              label={filterDef(key).label}
              onClick={() => goTo(step)}
            />
          ))}
        </DrilldownList>
      </DrawerSection>
      <ViewSection
        onColumns={() => goTo(COLUMNS_STEP)}
        onSort={() => goTo(SORT_STEP)}
        sortValue={sortLabel(sort)}
        view={view}
      />
    </>
  );
}

/**
 * The step header's `Clear`, for a filter that holds a value — `undefined`
 * otherwise, so the header shows no control that would do nothing. It clears
 * the value and keeps the operator, as the desktop popovers' `Clear` does;
 * removing the filter, operator and all, is the applied row's ✕.
 */
function held(
  key: FilterKey,
  filters: PaymentFilters,
  onChange: (patch: Partial<PaymentFilters>) => void
): (() => void) | undefined {
  const def = filterDef(key);
  return def.value(filters) === null
    ? undefined
    : () => onChange(def.clearValue ? def.clearValue(filters) : def.clear);
}

function Bounds({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 px-4 pb-4">{children}</div>;
}
