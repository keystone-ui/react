"use client";

import { PlusIcon, TrashIcon } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
import { Bound } from "@/components/drawer-parts";
import { FilterTrigger } from "@/components/filter-trigger";
import { PillShell, PillValue, useHoverless } from "@/components/pill-shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * The pill row's parts, shared by both tables.
 *
 * Each table owns its filter vocabulary — `payment-filters.ts`,
 * `admin-filters.ts` — and composes these with it. Nothing here knows what a
 * payment or a user is, which is what lets the two toolbars be one design
 * rather than two that drift.
 */

export interface PillOption {
  label: string;
  value: string;
}

/** What every pill takes, whatever it opens. */
interface PillBase {
  /**
   * Mount with the popup already open. Set on the pill just added from
   * `+ Add filter`: you picked "Status" because you want to filter by status,
   * so making you click the new pill as well is a wasted step. Read once, on
   * mount — after that the popup is the pill's own business.
   */
  autoOpen?: boolean;
  /** What the pill reads when nothing is set: "All" for a set, "Any" for a range. */
  empty: string;
  /** The dimension, shown muted ahead of the value. */
  label: string;
  /** Takes the pill off the row. Handed its trigger, for focus. */
  onRemove: (trigger: HTMLElement | null) => void;
  /** The value as the pill reads it, or `null` when the filter is unset. */
  value: string | null;
}

/**
 * A single-select filter — `Status: Failed`.
 *
 * Its X takes the chevron's slot on hover and keyboard focus, so the pill never
 * changes width, and Backspace removes it from the keyboard. Touch screens have
 * no hover, so their way off is a "Delete filter" row in the menu.
 *
 * Picking `All` never takes a pill off the row: removing the control from under
 * the cursor mid-interaction is worse than a pill that reads `All`. Removal is
 * always its own, explicit action.
 */
export function OptionPill({
  autoOpen = false,
  empty,
  label,
  onRemove,
  onSelect,
  options,
  selected,
  value,
}: PillBase & {
  onSelect: (value: string) => void;
  options: readonly PillOption[];
  /** The selected option's `value`, which the radio group checks. */
  selected: string;
}) {
  return (
    <PillShell label={label} onRemove={onRemove}>
      {({ keyDown, remove }) => (
        <DropdownMenu defaultOpen={autoOpen}>
          <DropdownMenuTrigger
            render={
              <FilterTrigger
                active={value !== null}
                label={label}
                onKeyDown={keyDown}
                removable
              />
            }
          >
            {/* Unset reads as a placeholder rather than a value, which is what
                separates the pills doing something from those merely present. */}
            <PillValue empty={empty} value={value} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-44"
            size="compact"
          >
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup onValueChange={onSelect} value={selected}>
                {options.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <TouchDeleteItem onRemove={remove} />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </PillShell>
  );
}

/**
 * A date range needs two fields at once, so it opens a `Popover` rather than a
 * menu. A menu is a list of choices; a pair of bounds is a tiny form.
 */
export function DateRangePill({
  after,
  autoOpen = false,
  before,
  empty,
  id,
  label,
  onAfterChange,
  onBeforeChange,
  onClear,
  onRemove,
  value,
}: PillBase & {
  after: string;
  before: string;
  /** Prefixes the two fields' ids, which must be unique on the page. */
  id: string;
  onAfterChange: (value: string) => void;
  onBeforeChange: (value: string) => void;
  onClear: () => void;
}) {
  const touch = useHoverless();

  return (
    <PillShell label={label} onRemove={onRemove}>
      {({ keyDown, remove }) => (
        <Popover defaultOpen={autoOpen}>
          <PopoverTrigger
            render={
              <FilterTrigger
                active={value !== null}
                label={label}
                onKeyDown={keyDown}
                removable
              />
            }
          >
            <PillValue empty={empty} value={value} />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Bound
                  id={`${id}-min`}
                  label="After"
                  onChange={onAfterChange}
                  type="date"
                  value={after}
                />
                <Bound
                  id={`${id}-max`}
                  label="Before"
                  onChange={onBeforeChange}
                  type="date"
                  value={before}
                />
              </div>
              {value !== null && (
                <div className="flex justify-end">
                  <Button onClick={onClear} size="xs" variant="ghost">
                    Clear
                  </Button>
                </div>
              )}
              {/* The popover's version of `TouchDeleteItem`. */}
              {touch && (
                <Button
                  className="w-full justify-start text-destructive"
                  onClick={remove}
                  variant="ghost"
                >
                  <TrashIcon />
                  Delete filter
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </PillShell>
  );
}

/**
 * The touch screen's way to remove a pill: no hover means no X, so the menu
 * carries a "Delete filter" row instead.
 *
 * Only on devices that cannot hover: on a pointer device it would be a second
 * copy of the X.
 */
function TouchDeleteItem({ onRemove }: { onRemove: () => void }) {
  const touch = useHoverless();
  if (!touch) {
    return null;
  }

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onRemove} variant="destructive">
        <TrashIcon />
        Delete filter
      </DropdownMenuItem>
    </>
  );
}

/** The `+ Add filter` menu, holding whatever is not already on the toolbar. */
export function AddFilterMenu<K extends string>({
  items,
  onAdd,
}: {
  items: readonly { key: K; label: string }[];
  onAdd: (key: K) => void;
}): ReactNode {
  const picked = useRef(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      {/* A lucide `Plus` rather than a literal "+": next to the `X` on Clear
          all, a text glyph would sit at a different weight and baseline. */}
      <DropdownMenuTrigger
        render={<Button data-add-filter="" size="sm" variant="ghost" />}
      >
        <PlusIcon />
        Add filter
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-44"
        // Picking a filter opens that filter's own popup, which takes focus;
        // returning it to this button would pull it straight back out. Closed
        // any other way — Escape, a click outside — focus comes home as usual.
        finalFocus={() => {
          const wasPick = picked.current;
          picked.current = false;
          return !wasPick;
        }}
        size="compact"
      >
        <DropdownMenuGroup>
          {items.map((item) => (
            <DropdownMenuItem
              key={item.key}
              onClick={() => {
                picked.current = true;
                onAdd(item.key);
              }}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The row's add and remove, with the focus handling both need.
 *
 * Adding remembers which pill to mount open. Removing unmounts the element
 * holding focus, which would drop focus to <body> — a keyboard user's place in
 * the page, gone. So the target is picked *before* the removal: the next pill
 * along, or, past the last one, `Add filter`, which is where the removed filter
 * has just gone back to.
 */
export function usePillRow<K extends string>({
  onAdd,
  onRemove,
}: {
  onAdd: (key: K) => void;
  onRemove: (key: K) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  // The filter most recently picked from `+ Add filter`, whose pill mounts open.
  const [opening, setOpening] = useState<K | null>(null);

  const add = (key: K) => {
    setOpening(key);
    onAdd(key);
  };

  const remove = (key: K, trigger: HTMLElement | null) => {
    const row = rowRef.current;
    const all = [
      ...(row?.querySelectorAll<HTMLElement>("[data-filter-pill]") ?? []),
    ];
    const next = all[all.indexOf(trigger as HTMLElement) + 1] ?? null;
    onRemove(key);
    // After the commit, and after Base UI has run its own focus return to a
    // trigger that no longer exists.
    requestAnimationFrame(() => {
      const target = next?.isConnected
        ? next
        : row?.querySelector<HTMLElement>("[data-add-filter]");
      target?.focus();
    });
  };

  return { add, opening, remove, rowRef };
}
