"use client";

import {
  DEFAULT_KEYS,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  EMPTY_FILTERS,
  type FilterKey,
  filterDef,
  matchesUserFilters,
  sortUsers,
  type UserFilters,
  type UserSortKey,
} from "./admin-filters";
import { type User, users } from "./mock-admin";
import { useDataTable } from "./use-data-table";

/** The user columns a person can hide. Name, selection and actions stay. */
export type UserColumnId = "id" | "lastActive" | "role" | "seats" | "status";

export function useUsersTable() {
  return useDataTable<User, UserFilters, FilterKey, UserSortKey, UserColumnId>({
    clearFor: (key) => filterDef(key).clear,
    defaultKeys: DEFAULT_KEYS,
    defaultPageSize: DEFAULT_PAGE_SIZE,
    defaultSort: DEFAULT_SORT,
    emptyFilters: EMPTY_FILTERS,
    matches: matchesUserFilters,
    rows: users,
    sortRows: sortUsers,
  });
}

export type UsersTableState = ReturnType<typeof useUsersTable>;
