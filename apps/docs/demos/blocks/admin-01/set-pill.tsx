"use client";

import { Button } from "@keystoneui/react/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@keystoneui/react/combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import {
  ChevronDown as ChevronDownIcon,
  CircleX as CircleXIcon,
  Ellipsis as EllipsisIcon,
  Trash2 as TrashIcon,
} from "lucide-react";
import { type RefObject, useRef } from "react";
import { FilterTrigger } from "./filter-trigger";
import { PillShell, PillValue } from "./pill-shell";

/**
 * A set filter with an operator — `Status is not: Failed, +1` — and the two
 * parts it is made of, the header's operator menu and the multi-select list.
 *
 * Nothing here knows what a payment or a user is. The payments chip uses the
 * parts for Currency and Status beside its Amount and Player fields; the users
 * table, whose only set filter is Status, uses `SetPill` whole.
 */

/**
 * A set filter as a pill: the trigger names the dimension and, when it is not
 * the default, the operator; the popover's header holds the operator menu and
 * "Delete filter" behind `⋯`, and the list under it holds the picks. The same
 * arrangement as the payments operator chip, so the two tables' Status pills
 * are one control.
 */
export function SetPill<T extends string>({
  autoOpen = false,
  empty,
  itemLabel,
  items,
  label,
  noun,
  onRemove,
  onSelectedChange,
  operator,
  selected,
  value,
}: {
  autoOpen?: boolean;
  empty: string;
  itemLabel: (item: T) => string;
  items: readonly T[];
  label: string;
  /** The plural for the field's accessible names: `statuses`. */
  noun: string;
  onRemove: (trigger: HTMLElement | null) => void;
  onSelectedChange: (next: T[]) => void;
  operator: OperatorMenuProps;
  selected: readonly T[];
  /** The value as the pill reads it, or `null` when nothing is picked. */
  value: string | null;
}) {
  const field = useRef<HTMLInputElement>(null);
  // An operator with nothing to compare narrows nothing, so the trigger only
  // names a qualifier once something is picked: never "Status is not: All".
  const qualifier =
    value !== null && operator.value !== operator.options[0]?.value
      ? operator.label
      : null;

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
                operator={qualifier}
                removable
              />
            }
          >
            <PillValue empty={empty} value={value} />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-64 p-1"
            initialFocus={() => field.current ?? true}
          >
            <div className="flex items-center gap-1 py-1 ps-2 pe-1">
              <span className="text-muted-foreground text-sm">{label}</span>
              <OperatorMenu {...operator} />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      aria-label="More actions"
                      className="ms-auto text-muted-foreground"
                      size="icon-xs"
                      variant="ghost"
                    />
                  }
                >
                  <EllipsisIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-44"
                  size="compact"
                >
                  <DropdownMenuItem onClick={remove} variant="destructive">
                    <TrashIcon />
                    Delete filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <SetOptions
              field={field}
              items={items}
              label={itemLabel}
              noun={noun}
              onValueChange={onSelectedChange}
              value={selected}
            />
          </PopoverContent>
        </Popover>
      )}
    </PillShell>
  );
}

export interface OperatorMenuProps {
  label: string;
  onValueChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  value: string;
}

/** The operator in the header: the current one, opening onto the rest. */
export function OperatorMenu({
  label,
  onValueChange,
  options,
  value,
}: OperatorMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`Operator: ${label}`}
            className="gap-1 px-1.5 font-semibold text-sm"
            size="xs"
            variant="ghost"
          />
        }
      >
        {label}
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-36" size="compact">
        <DropdownMenuRadioGroup
          onValueChange={(next) => onValueChange(next as string)}
          value={value}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The selection as chips in a field, the options not yet picked listed under
 * it — Notion's multi-select. The chips are the answer to "what is held", read
 * in place rather than counted, and the field filters the list as you type.
 *
 * An inline `Combobox` — `inline open` keeps its list in this popover instead
 * of opening a popup of its own on top of it. So `ComboboxList` and
 * `ComboboxItem` are used bare: `ComboboxContent` always portals.
 *
 * Picked options stay in the list and gain a check, as Notion's do. Removing
 * them would shuffle every row below the one just clicked, so the next pick
 * lands on the wrong option; and clicking a checked one again unpicks it,
 * which a list of only the unpicked could never offer.
 *
 * The round X clears every chip but keeps the operator — you emptied the
 * list, not the comparison.
 */
export function SetOptions<T extends string>({
  field,
  items,
  label,
  noun,
  onValueChange,
  value,
}: {
  field: RefObject<HTMLInputElement | null>;
  items: readonly T[];
  /** What a value reads as: `In progress` for `in-progress`. */
  label: (item: T) => string;
  /** The plural the field's accessible names use: `currencies`. */
  noun: string;
  onValueChange: (next: T[]) => void;
  value: readonly T[];
}) {
  return (
    <Combobox
      autoHighlight
      inline
      itemToStringLabel={(item: T) => label(item)}
      items={items}
      multiple
      onValueChange={(next: T[]) => onValueChange(next)}
      open
      value={[...value]}
    >
      <div className="px-1 pb-2">
        {/* 32px: the toolbar's tier. `ComboboxChips` defaults to the 40px
            form-field height, which towers over the compact rows below. */}
        <ComboboxChips className="min-h-8 py-0.5 pe-1">
          <ComboboxValue>
            {(values: T[]) => (
              <>
                {values.map((item) => (
                  <ComboboxChip key={item}>{label(item)}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  aria-label={`Search ${noun}`}
                  placeholder={values.length > 0 ? "" : "Search…"}
                  ref={field}
                />
              </>
            )}
          </ComboboxValue>
          {value.length > 0 && (
            <Button
              aria-label={`Clear ${noun}`}
              className="ms-auto shrink-0 rounded-full text-muted-foreground"
              onClick={() => onValueChange([])}
              size="icon-xs"
              variant="ghost"
            >
              <CircleXIcon />
            </Button>
          )}
        </ComboboxChips>
      </div>
      <ComboboxEmpty className="px-2 py-1.5 text-muted-foreground text-sm">
        No match
      </ComboboxEmpty>
      <ComboboxList className="max-h-none p-0" data-size="compact">
        {(item: T) => (
          <ComboboxItem key={item} value={item}>
            {label(item)}
          </ComboboxItem>
        )}
      </ComboboxList>
    </Combobox>
  );
}
