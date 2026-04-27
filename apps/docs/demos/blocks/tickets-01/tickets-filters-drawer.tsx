"use client";

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
import { useState } from "react";

import { statusLabels } from "./mock-tickets";
import { type TicketColumnId, ticketColumns } from "./tickets-table";
import {
  type SortPreset,
  type StatusFilter,
  sortPresetLabels,
  type ViewMode,
} from "./tickets-toolbar";

const SORT_OPTIONS: SortPreset[] = [
  "manual",
  "board-order",
  "priority-desc",
  "past-due",
  "escalated",
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: statusLabels.open },
  { value: "pending", label: statusLabels.pending },
  { value: "resolved", label: statusLabels.resolved },
  { value: "closed", label: statusLabels.closed },
];

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "table", label: "Table" },
  { value: "board", label: "Board" },
];

interface TicketsFiltersDrawerProps {
  onSortPresetChange: (next: SortPreset) => void;
  onStatusFilterChange: (next: StatusFilter) => void;
  onToggleColumn: (id: TicketColumnId) => void;
  onViewChange: (next: ViewMode) => void;
  sortPreset: SortPreset;
  statusFilter: StatusFilter;
  view: ViewMode;
  visibleColumns: Set<TicketColumnId>;
}

export function TicketsFiltersDrawer({
  sortPreset,
  onSortPresetChange,
  statusFilter,
  onStatusFilterChange,
  view,
  onViewChange,
  visibleColumns,
  onToggleColumn,
}: TicketsFiltersDrawerProps) {
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
      <DrawerTrigger render={<Button variant="outline" />}>
        <FilterIcon className="size-4" />
        Filters
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
                  sortLabel={sortPresetLabels[sortPreset]}
                  statusLabel={
                    statusFilter === "all"
                      ? "All Statuses"
                      : statusLabels[statusFilter]
                  }
                  viewLabel={view === "board" ? "Board" : "Table"}
                  visibleColumnsCount={visibleColumns.size}
                />
                <DrawerFooter>
                  <Button className="w-full" onClick={() => setOpen(false)}>
                    Apply
                  </Button>
                </DrawerFooter>
              </StepperStep>

              <StepperStep>
                <SubHeader title="Sort by" />
                <div className="pb-4">
                  <RadioGroup
                    className="gap-0 divide-y divide-border-muted"
                    onValueChange={(val) => {
                      if (val) {
                        onSortPresetChange(val as SortPreset);
                      }
                    }}
                    value={sortPreset}
                  >
                    {SORT_OPTIONS.map((preset) => (
                      // biome-ignore lint/a11y/noLabelWithoutControl: control is inside label
                      <label
                        className="flex h-12 cursor-pointer items-center gap-3 px-4"
                        key={preset}
                      >
                        <RadioGroupItem value={preset} />
                        <span className="text-sm">
                          {sortPresetLabels[preset]}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </StepperStep>

              <StepperStep>
                <SubHeader title="Status" />
                <div className="pb-4">
                  <RadioGroup
                    className="gap-0 divide-y divide-border-muted"
                    onValueChange={(val) => {
                      if (val) {
                        onStatusFilterChange(val as StatusFilter);
                      }
                    }}
                    value={statusFilter}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      // biome-ignore lint/a11y/noLabelWithoutControl: control is inside label
                      <label
                        className="flex h-12 cursor-pointer items-center gap-3 px-4"
                        key={option.value}
                      >
                        <RadioGroupItem value={option.value} />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </StepperStep>

              <StepperStep>
                <SubHeader title="Columns" />
                <div className="divide-y divide-border-muted pb-4">
                  {ticketColumns.map((column) => (
                    // biome-ignore lint/a11y/noLabelWithoutControl: control is inside label
                    <label
                      className="flex h-12 cursor-pointer items-center gap-3 px-4"
                      key={column.id}
                    >
                      <Checkbox
                        checked={visibleColumns.has(column.id)}
                        onCheckedChange={() => onToggleColumn(column.id)}
                      />
                      <span className="text-sm">{column.label}</span>
                    </label>
                  ))}
                </div>
              </StepperStep>

              <StepperStep>
                <SubHeader title="View" />
                <div className="pb-4">
                  <RadioGroup
                    className="gap-0 divide-y divide-border-muted"
                    onValueChange={(val) => {
                      if (val === "table" || val === "board") {
                        onViewChange(val);
                      }
                    }}
                    value={view}
                  >
                    {VIEW_OPTIONS.map((option) => (
                      // biome-ignore lint/a11y/noLabelWithoutControl: control is inside label
                      <label
                        className="flex h-12 cursor-pointer items-center gap-3 px-4"
                        key={option.value}
                      >
                        <RadioGroupItem value={option.value} />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
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

function FilterMenu({
  sortLabel,
  statusLabel,
  viewLabel,
  visibleColumnsCount,
}: {
  sortLabel: string;
  statusLabel: string;
  viewLabel: string;
  visibleColumnsCount: number;
}) {
  const { goTo } = useStepper();
  const items: { label: string; value: string; step: number }[] = [
    { label: "Sort by", value: sortLabel, step: 1 },
    { label: "Status", value: statusLabel, step: 2 },
    {
      label: "Columns",
      value: `${visibleColumnsCount} visible`,
      step: 3,
    },
    { label: "View", value: viewLabel, step: 4 },
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
