"use client";

import { Button } from "@keystoneui/react/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import { Ellipsis as EllipsisIcon, Trash2 as TrashIcon } from "lucide-react";
import {
  DATE_OPERATORS,
  type DateFilter,
  type DateOperator,
  type DatePreset,
  dateOperatorLabel,
  setDateOperator,
} from "./date-filter";
import { DateFilterStep } from "./date-filter-step";
import { FilterTrigger } from "./filter-trigger";
import { PillShell, PillValue } from "./pill-shell";
import { OperatorMenu } from "./set-pill";

/**
 * A date filter as a pill — `Created is before: 2026-07-01`, `Created: Past
 * 7 days` — opening Notion's arrangement: the dimension and its operator menu
 * in the header, "Delete filter" behind `⋯`, and under them the same presets,
 * relative pickers and calendar the phone's step shows.
 */
export function DatePill({
  autoOpen = false,
  empty,
  filter,
  label,
  onChange,
  onRemove,
  presets,
  qualifier,
  today,
  value,
}: {
  autoOpen?: boolean;
  empty: string;
  filter: DateFilter;
  label: string;
  onChange: (filter: DateFilter) => void;
  onRemove: (trigger: HTMLElement | null) => void;
  presets: readonly DatePreset[];
  /** The operator the trigger names, when it is not one that goes unsaid. */
  qualifier: string | null;
  today: Date;
  /** The value as the pill reads it, or `null` when unset. */
  value: string | null;
}) {
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
          <PopoverContent align="start" className="w-72 p-1">
            <div className="flex items-center gap-1 py-1 ps-2 pe-1">
              <span className="text-muted-foreground text-sm">{label}</span>
              <OperatorMenu
                label={dateOperatorLabel(filter.op)}
                onValueChange={(next) =>
                  onChange(setDateOperator(filter, next as DateOperator, today))
                }
                options={DATE_OPERATORS}
                value={filter.op}
              />
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
            <div className="px-1 pb-1">
              <DateFilterStep
                filter={filter}
                onChange={onChange}
                presets={presets}
                surface="popover"
                today={today}
              />
            </div>
          </PopoverContent>
        </Popover>
      )}
    </PillShell>
  );
}
