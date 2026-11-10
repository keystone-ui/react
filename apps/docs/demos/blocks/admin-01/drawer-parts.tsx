"use client";

import { Button } from "@keystoneui/react/button";
import { DrawerHeader, DrawerTitle } from "@keystoneui/react/drawer";
import { Input } from "@keystoneui/react/input";
import { Label } from "@keystoneui/react/label";
import { RadioGroup, RadioGroupItem } from "@keystoneui/react/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";
import {
  ArrowLeft as ArrowLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import type { ReactNode } from "react";

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

/**
 * A drawer step's header, with the control that returns to the menu and, on a
 * step whose value takes more than one tap to undo, a `Clear`.
 *
 * Pass `onClear` only while the filter holds a value: a `Clear` that clears
 * nothing is a control that does nothing. The radio steps never take one —
 * their `All` row is already the way back.
 */
export function StepHeader({
  onBack,
  onClear,
  title,
}: {
  onBack: () => void;
  onClear?: () => void;
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
        {onClear ? (
          <Button
            aria-label={`Clear ${title} filter`}
            className="-mr-2 ml-auto"
            onClick={onClear}
            size="xs"
            variant="ghost"
          >
            Clear
          </Button>
        ) : null}
      </div>
    </DrawerHeader>
  );
}

/**
 * A step's operator, as a segmented control above its values.
 *
 * Only for two to four short options, which fit one row on a phone. More than
 * that and the step uses a full-width `NativeSelect` instead — the phone's own
 * picker for one-of-many. Not a segmented strip that scrolls, which hides
 * whichever options are past the edge, and not a menu, which is a popup inside
 * a sheet with targets sized for a pointer.
 */
export function OperatorToggle({
  label,
  onValueChange,
  options,
  value,
}: {
  label: string;
  onValueChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  value: string;
}) {
  return (
    <div className="px-4 pb-3">
      <ToggleGroup
        aria-label={label}
        className="w-full"
        onValueChange={(next) => {
          // A segmented control always holds one value; pressing the active
          // segment again would otherwise empty it.
          if (next[0]) {
            onValueChange(next[0] as string);
          }
        }}
        size="sm"
        value={[value]}
        variant="outline"
      >
        {options.map((option) => (
          <ToggleGroupItem
            className="flex-1"
            key={option.value}
            value={option.value}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
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
