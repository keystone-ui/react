"use client";

import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/**
 * The parts both of this block's filter drawers are built from.
 *
 * Shared *within* the block, not across blocks. A block installs as one unit,
 * so a file here collides with nothing and costs a consumer nothing — where a
 * file shared between two blocks would land twice at the same path. That is the
 * distinction `apps/docs/tests/block-duplication.test.ts` is built around:
 * duplication across blocks can be correct, duplication inside one is just
 * duplication.
 *
 * These were three byte-identical copies of `SubHeader`, `Options` and
 * `FilterOption`, plus three near-identical `Bound`s, until that test reported
 * them.
 */

/** A drawer step's header, with the control that returns to the menu. */
export function StepHeader({
  onBack,
  title,
}: {
  onBack: () => void;
  title: string;
}) {
  return (
    <DrawerHeader>
      <div className="flex items-center gap-2">
        <Button
          aria-label="Back"
          className="-ml-1"
          onClick={onBack}
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

/**
 * One row of the drilldown menu: what it filters, what it currently holds, and
 * a chevron saying it opens.
 */
export function DrilldownRow({
  label,
  onClick,
  value,
}: {
  label: string;
  onClick: () => void;
  value: string;
}) {
  return (
    <button
      className="flex h-12 w-full cursor-pointer items-center justify-between gap-3 px-4 text-left active:text-muted-foreground"
      onClick={onClick}
      type="button"
    >
      <span className="font-medium text-sm">{label}</span>
      <span className="ml-auto inline-flex min-w-0 items-center gap-2 text-muted-foreground text-sm">
        <span className="truncate">{value}</span>
        <ChevronRightIcon className="size-4 shrink-0" />
      </span>
    </button>
  );
}

/** The list wrapper the drilldown rows sit in. */
export function DrilldownList({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-border-muted">{children}</div>;
}

/** A radio list styled as drawer rows rather than as a form control group. */
export function Options({
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

export function FilterOption({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: control is inside label
    <label className="flex h-12 cursor-pointer items-center gap-3 px-4">
      <RadioGroupItem value={value} />
      <span className="text-sm">{label}</span>
    </label>
  );
}

/**
 * One end of a range. `type` defaults to text because most bounds are numeric
 * strings; the date filters pass `type="date"`.
 */
export function Bound({
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
