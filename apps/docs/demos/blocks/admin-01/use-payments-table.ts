"use client";

import { payments } from "./mock-payments";
import {
  DEFAULT_KEYS,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  EMPTY_FILTERS,
  type FilterKey,
  filterDef,
  matchesPaymentFilters,
  type PaymentFilters,
  type PaymentSortKey,
  sortPayments,
} from "./payment-filters";
import { useDataTable } from "./use-data-table";

/** The payment columns a person can hide. The id and actions always stay. */
export type PaymentColumnId =
  | "amount"
  | "createdAt"
  | "currency"
  | "finishedAt"
  | "playerEmail"
  | "status"
  | "type";

export function usePaymentsTable() {
  return useDataTable<
    (typeof payments)[number],
    PaymentFilters,
    FilterKey,
    PaymentSortKey,
    PaymentColumnId
  >({
    clearFor: (key) => filterDef(key).clear,
    defaultKeys: DEFAULT_KEYS,
    defaultPageSize: DEFAULT_PAGE_SIZE,
    defaultSort: DEFAULT_SORT,
    emptyFilters: EMPTY_FILTERS,
    matches: matchesPaymentFilters,
    rows: payments,
    sortRows: sortPayments,
  });
}

export type PaymentsTableState = ReturnType<typeof usePaymentsTable>;
