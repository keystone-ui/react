"use client";

import {
  type FilterKey,
  filterDef,
  OPTIONS,
  type UserFilters,
} from "@/components/admin-filters";
import { DateRangePill, OptionPill } from "@/components/filter-pills";

/**
 * One user filter as a pill: a `DateRangePill` for Created, an `OptionPill`
 * for the rest. The same parts the payments row uses — this table simply has
 * no filter that needs an operator.
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

  if (pillKey === "created") {
    return (
      <DateRangePill
        {...shared}
        after={filters.createdAfter}
        before={filters.createdBefore}
        id="users-created"
        onAfterChange={(next) => change({ createdAfter: next })}
        onBeforeChange={(next) => change({ createdBefore: next })}
        onClear={() => change(def.clear)}
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
