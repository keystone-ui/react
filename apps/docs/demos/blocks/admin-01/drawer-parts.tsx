"use client";

import { Button } from "@keystoneui/react/button";
import { Checkbox } from "@keystoneui/react/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@keystoneui/react/drawer";
import { Input } from "@keystoneui/react/input";
import { Label } from "@keystoneui/react/label";
import { RadioGroup, RadioGroupItem } from "@keystoneui/react/radio-group";
import {
  ArrowLeft as ArrowLeftIcon,
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  X as XIcon,
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
 * The badges are 20px, the height of `Badge` itself, so they read as words in
 * the row's sentence rather than as buttons beside it. They are buttons all
 * the same, and a thumb needs more than 20px: the tappable area runs 10px past
 * the badge above and below, 40px in all, inside the 44px row and short of
 * the next one. `overflow-visible` because `Button` clips, and would clip
 * this too.
 */
/**
 * A badge inside a `GROUP` box. The badge's own `secondary` reads on the
 * sheet, as in a step's header, but a light-mode box is `muted` — the same
 * grey — so inside one it turns white, the way the box's rows lift off it.
 */
const IN_GROUP = "bg-background dark:bg-secondary";

const BADGE =
  "h-5 overflow-visible rounded-full px-2 font-normal after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-['']";

/**
 * Every filter sheet — the drawer and the operator sheet stacked on it — is
 * one fixed height rather than the height of what it holds.
 *
 * Fitted to its content, a four-row step sat low on the screen with the table
 * looming over it, and the sheet jumped in height at every drill. Fixed, it
 * stays put from step to step, and two stacked sheets line up exactly, the one
 * behind peeking out by the stack's offset alone. 80dvh is the drawer's own
 * cap. A `className`, so it wins over the stack's layered height rule.
 */
export const FILTER_SHEET = "h-[80dvh]";

/** A filter's operator, as the drawer shows it: what it reads, and a way in. */
export interface OperatorHandle {
  label: string;
  onOpen: () => void;
}

/**
 * The operator as a badge — `Player [contains ⌄]` — opening the operator
 * sheet. The same control in a step's header and in an applied filter's row,
 * so the comparison is changed the same way wherever it is read.
 */
export function OperatorBadge({
  dimension,
  inGroup = false,
  operator,
}: {
  /** Sitting in a `GROUP` box rather than on the sheet. */
  inGroup?: boolean;
  /** The filter it belongs to, for the accessible name. */
  dimension: string;
  operator: OperatorHandle;
}) {
  return (
    <Button
      aria-haspopup="dialog"
      aria-label={`${dimension} condition: ${operator.label}`}
      className={`shrink-0 gap-0.5 ${BADGE} ${inGroup ? IN_GROUP : ""}`}
      onClick={operator.onOpen}
      size="xs"
      variant="secondary"
    >
      {operator.label}
      <ChevronDownIcon className="size-3 text-muted-foreground" />
    </Button>
  );
}

/**
 * A drawer step's header: the way back to the menu, the filter's name with
 * its operator beside it, and — on a step whose value takes more than one tap
 * to undo — a `Clear`.
 *
 * The operator sits by the title rather than above the values because it is
 * part of the title's sentence, `Player contains`, and it hands the values the
 * height a segmented row used to take. Pass `onClear` only while the filter
 * holds a value: a `Clear` that clears nothing is a control that does nothing.
 */
export function StepHeader({
  onBack,
  onClear,
  operator,
  title,
}: {
  onBack: () => void;
  onClear?: () => void;
  operator?: OperatorHandle;
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
        {operator ? (
          <OperatorBadge dimension={title} operator={operator} />
        ) : null}
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
 * The operator picker: a drawer stacked on the filter drawer, one radio row
 * per operator, closing on the pick.
 *
 * A sheet rather than a menu: a menu is a popup sized for a pointer, sitting
 * inside a sheet; this is the phone's own idiom for one of several, with 44px
 * rows and the drawer it came from still showing behind it. Render it inside
 * the filter drawer's content — that is what makes it nest.
 */
/** The pause between picking an operator and its sheet closing. */
const SELECT_BEAT_MS = 120;

export function OperatorSheet({
  onOpenChange,
  onSelect,
  open,
  options,
  title,
  value,
}: {
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
  open: boolean;
  options: readonly { label: string; value: string }[];
  title: string;
  value: string;
}) {
  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent className={FILTER_SHEET}>
        <div className="w-full">
          {/* The step's header, so the stacked sheet reads as one more step
              with a way back, rather than a dead end you swipe away. */}
          <StepHeader onBack={() => onOpenChange(false)} title={title} />
          <Options
            onValueChange={(next) => {
              onSelect(next);
              // A beat for the radio to fill before the sheet slides away,
              // so the pick is seen to land on the row you meant.
              window.setTimeout(() => onOpenChange(false), SELECT_BEAT_MS);
            }}
            value={value}
          >
            {options.map((option) => (
              <FilterOption
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Options>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * How long a collapse takes, and so how long a removed row waits before it is
 * actually removed. The `--duration-base` token's 180ms, read in JS too.
 */
export const COLLAPSE_MS = 180;

/**
 * Opens and closes its content by its own height: `grid-template-rows` from
 * `1fr` to `0fr`, with opacity, so whatever sits below slides rather than
 * jumping. CSS rather than a JS height animation — the browser interpolates
 * `fr` rows itself — and on the duration tokens, so reduced motion makes it
 * instant along with everything else. Closed content stays mounted and goes
 * `inert`, out of the tab order and the accessibility tree.
 */
export function Collapse({
  children,
  open,
}: {
  children: ReactNode;
  open: boolean;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-(--duration-base) ease-(--ease-ks-out) ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      data-collapse={open ? "open" : "closed"}
      inert={!open}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/** A labelled group of rows in the drawer's menu: `Applied filters`. */
export function DrawerSection({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <section aria-label={label}>
      <h3 className="px-7 pt-3 pb-1.5 font-medium text-muted-foreground text-xs">
        {label}
      </h3>
      {children}
    </section>
  );
}

/**
 * One applied filter, as a sentence: `Currency [is not] [BTC, ETH] ✕`.
 *
 * The value opens the filter's step, the operator its sheet, the ✕ clears it.
 * A filter without operators has no badge for one — a badge that looks
 * tappable and does nothing would be the one dead control on the screen.
 */
export function AppliedRow({
  label,
  onEdit,
  onRemove,
  operator,
  value,
}: {
  label: string;
  onEdit: () => void;
  onRemove: () => void;
  operator?: OperatorHandle;
  /** `null` for an operator with nothing beside it: `Created [is empty]`. */
  value: string | null;
}) {
  return (
    <div
      className="flex h-11 items-center gap-2 px-3"
      data-applied-filter={label}
    >
      <span className="shrink-0 font-medium text-sm">{label}</span>
      {operator ? (
        <OperatorBadge dimension={label} inGroup operator={operator} />
      ) : null}
      {value === null ? null : (
        <Button
          aria-label={`${label}: ${value}`}
          className={`min-w-0 justify-start ${BADGE} ${IN_GROUP}`}
          onClick={onEdit}
          size="xs"
          variant="secondary"
        >
          <span className="min-w-0 truncate">{value}</span>
        </Button>
      )}
      <Button
        aria-label={`Remove ${label} filter`}
        className="-mr-2 ml-auto shrink-0"
        onClick={onRemove}
        size="icon-sm"
        variant="ghost"
      >
        <XIcon className="size-4" />
      </Button>
    </div>
  );
}

/**
 * One row of the drilldown menu: what it filters, and a chevron saying it
 * opens. A filter's value is not repeated here — the applied section above is
 * where the menu says what is set, and one fact in two places can disagree.
 * `value` is for rows that are not filters, like Sort.
 */
export function DrilldownRow({
  label,
  onClick,
  value,
}: {
  label: string;
  onClick: () => void;
  value?: string;
}) {
  return (
    <button
      className="flex h-11 w-full cursor-pointer items-center justify-between gap-3 px-3 text-left active:text-muted-foreground"
      onClick={onClick}
      type="button"
    >
      <span className="font-medium text-sm">{label}</span>
      <span className="ml-auto inline-flex min-w-0 items-center gap-2 text-muted-foreground text-sm">
        {value ? <span className="truncate">{value}</span> : null}
        <ChevronRightIcon className="size-4 shrink-0" />
      </span>
    </button>
  );
}

/**
 * A list of rows as one rounded box, inset from the sheet's edges — the
 * phone's grouped list. The box says which rows belong together under a
 * section's heading, and the dividers stop at its edge, so they read as
 * separators within a group rather than as rules across the whole sheet.
 *
 * The fill is a step off the sheet's `popover` either way, but which way
 * differs: in light the sheet is white, so the box is `muted` and its badges
 * go back to white on it; in dark the sheet is already a mid surface, so the
 * box is half of `muted` and the `secondary` badges sit a step above it.
 * `w-auto` because `RadioGroup` ships `w-full`, which beside `mx-4` pushed
 * the box 32px past the sheet's right edge.
 * Light-mode `muted/50` on white was all but invisible, and so were the
 * badges on it.
 */
export const GROUP =
  "mx-4 w-auto divide-y divide-border-muted overflow-hidden rounded-xl bg-muted dark:bg-muted/50";

/** The list wrapper the drilldown rows sit in. */
export function DrilldownList({ children }: { children: ReactNode }) {
  return <div className={GROUP}>{children}</div>;
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
        className={`gap-0 ${GROUP}`}
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
    <label className="flex h-11 cursor-pointer items-center gap-3 px-3">
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
        // The filter surfaces are dense screens, so `sm` (32px) like the
        // toolbar they belong to. Touch keeps 16px text at either size, so
        // iOS does not zoom on focus.
        size="sm"
        type={type}
        value={value}
      />
    </div>
  );
}

/**
 * A set filter's values as checkboxes: Status, Currency. Checkboxes, not
 * radios, so it is the one kind of screen you do not leave per pick.
 */
export function SetChecklist<T extends string>({
  items,
  label,
  onChange,
  value,
}: {
  items: readonly T[];
  label: (item: T) => string;
  onChange: (next: T[]) => void;
  value: readonly T[];
}) {
  return (
    <div className="pb-4">
      <div className={GROUP}>
        {items.map((item) => (
          // biome-ignore lint/a11y/noLabelWithoutControl: control is inside label
          <label
            className="flex h-11 cursor-pointer items-center gap-3 px-3"
            key={item}
          >
            <Checkbox
              checked={value.includes(item)}
              onCheckedChange={() =>
                onChange(
                  value.includes(item)
                    ? value.filter((held) => held !== item)
                    : [...value, item]
                )
              }
            />
            <span className="text-sm">{label(item)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
