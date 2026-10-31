"use client";

import { DateRangePill, OptionPill } from "@/components/filter-pills";
import { OperatorFilterChip } from "@/components/operator-filter-chip";
import {
  type FilterKey,
  filterDef,
  type PaymentFilters,
  PROVIDER_OPTIONS,
  providerLabel,
  STATUS_OPTIONS,
  statusLabel,
  TYPE_OPTIONS,
  typeLabel,
} from "@/components/payment-filters";

interface PillProps {
  /** See `OptionPill`'s `autoOpen`. */
  autoOpen?: boolean;
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  /**
   * Pins the pill to the row. Clearing calls it so that a pill which was only
   * showing because it held a value — one set from the mobile drawer, say —
   * does not vanish under the cursor the moment it is emptied.
   */
  onPin: (key: FilterKey) => void;
  /**
   * Clears the filter and, for a pill added by hand, takes it off the row.
   * Handed the pill's trigger so the toolbar can move focus to its neighbour
   * before the element holding focus disappears.
   */
  onRemove: (key: FilterKey, trigger: HTMLElement | null) => void;
  pillKey: FilterKey;
}

/** The radio pills' options, keyed by the filter field each one sets. */
const OPTIONS = {
  provider: PROVIDER_OPTIONS.map((value) => ({
    label: providerLabel(value),
    value,
  })),
  status: STATUS_OPTIONS.map((value) => ({ label: statusLabel(value), value })),
  type: TYPE_OPTIONS.map((value) => ({ label: typeLabel(value), value })),
} as const;

/**
 * One payment filter as a pill, in one of three kinds.
 *
 * Action, Status and Provider are `OptionPill`s — one dimension, one value.
 * Created is a `DateRangePill`. Currency, Amount and Player carry a comparison
 * as well — `Currency is not: BTC` — so they are operator chips, which keep
 * their chevron and put "Delete filter" behind the `⋯` in their popover
 * header, Notion's arrangement; see `operator-filter-chip.tsx`.
 */
export function PaymentFilterPill({
  autoOpen = false,
  filters,
  onChange,
  onPin,
  onRemove,
  pillKey,
}: PillProps) {
  const def = filterDef(pillKey);
  // Every change made through a pill also pins it. Without this a pill that
  // is only on the row because it holds a value — one set from the mobile
  // drawer — disappears the moment you empty it, taking the control out from
  // under the cursor. Emptying a filter is the one moment you are most likely
  // to want to set it to something else.
  const change = (patch: Partial<PaymentFilters>) => {
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

  if (
    pillKey === "currencies" ||
    pillKey === "amount" ||
    pillKey === "player"
  ) {
    return (
      <OperatorFilterChip
        autoOpen={autoOpen}
        filters={filters}
        onChange={change}
        onRemove={onRemove}
        pillKey={pillKey}
      />
    );
  }

  if (pillKey === "created") {
    return (
      <DateRangePill
        {...shared}
        after={filters.createdAfter}
        before={filters.createdBefore}
        id="created"
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
