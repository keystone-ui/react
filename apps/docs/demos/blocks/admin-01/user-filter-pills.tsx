"use client";

import {
  CREATED_PRESETS,
  createdOf,
  createdPatch,
  type FilterKey,
  filterDef,
  OPTIONS,
  STATUS_OPERATORS,
  STATUSES,
  type StatusOperator,
  statusLabel,
  type UserFilters,
} from "./admin-filters";
import { TODAY } from "./date-filter";
import { DatePill } from "./date-pill";
import { OptionPill } from "./filter-pills";
import { SetPill } from "./set-pill";

/**
 * One user filter as a pill: a `SetPill` for Status, a `DatePill` for
 * Created, an `OptionPill` for the rest — the same parts the payments row
 * uses, so the two tables' Status pills are one control.
 *
 * See `PaymentFilterPill` for why every change also pins the pill.
 */
export function UserFilterPill({
  autoOpen = false,
  filters,
  onChange,
  onPin,
  onRemove,
  pillKey,
}: {
  autoOpen?: boolean;
  filters: UserFilters;
  onChange: (patch: Partial<UserFilters>) => void;
  onPin: (key: FilterKey) => void;
  onRemove: (key: FilterKey, trigger: HTMLElement | null) => void;
  pillKey: FilterKey;
}) {
  const def = filterDef(pillKey);
  const change = (patch: Partial<UserFilters>) => {
    onChange(patch);
    onPin(pillKey);
  };
  const shared = {
    autoOpen,
    empty: def.empty,
    label: def.label,
    onRemove: (trigger: HTMLElement | null) => onRemove(pillKey, trigger),
    value: def.value(filters),
  };

  if (pillKey === "status") {
    const op = filters.statusOp;
    return (
      <SetPill
        {...shared}
        itemLabel={statusLabel}
        items={STATUSES}
        noun="statuses"
        onSelectedChange={(next) => change({ statuses: next })}
        operator={{
          label:
            STATUS_OPERATORS.find((item) => item.value === op)?.label ?? "",
          onValueChange: (next) => change({ statusOp: next as StatusOperator }),
          options: STATUS_OPERATORS.map((item) => ({
            label: item.label.charAt(0).toUpperCase() + item.label.slice(1),
            value: item.value,
          })),
          value: op,
        }}
        selected={filters.statuses}
      />
    );
  }

  if (pillKey === "created") {
    return (
      <DatePill
        {...shared}
        filter={createdOf(filters)}
        onChange={(next) => change(createdPatch(next))}
        presets={CREATED_PRESETS}
        qualifier={def.operator?.(filters) ?? null}
        today={TODAY}
      />
    );
  }

  return (
    <OptionPill
      {...shared}
      onSelect={(next) => change({ [pillKey]: next })}
      options={OPTIONS[pillKey]}
      selected={filters[pillKey]}
    />
  );
}
