"use client";

import { useEffect, useMemo, useState } from "react";
import type { SortState } from "./sort";

/**
 * Everything a filterable, sortable, paged, selectable table holds, for both of
 * this block's tables.
 *
 * One hook rather than two copies of the same dozen `useState`s, so the users
 * and payments tables cannot drift apart in how they reset a page or keep a
 * selection. What differs — the rows, the filter vocabulary, how a row matches
 * and sorts — comes in through `config`.
 */
export interface DataTableConfig<Row, F, K extends string, S extends string> {
  /** A filter's reset patch, for removing its pill. */
  clearFor: (key: K) => Partial<F>;
  /** The pills on a fresh row; `Clear all` puts these back. */
  defaultKeys: readonly K[];
  defaultPageSize: number;
  defaultSort: SortState<S>;
  emptyFilters: F;
  /**
   * How long the stand-in request takes. The rows are local, so without one
   * the loading state would never be seen — a real table swaps
   * `useSimulatedFetch` for its data layer and keeps the rest.
   */
  latency?: number;
  matches: (row: Row, filters: F) => boolean;
  rows: readonly Row[];
  sortRows: (rows: readonly Row[], sort: SortState<S>) => Row[];
}

/** The part of the state a URL can carry, and a request would send. */
export interface DataTableQuery<F, S extends string> {
  filters: F;
  pageIndex: number;
  pageSize: number;
  sort: SortState<S>;
}

export interface DataTableResult<Row> {
  /** Every row the filters and sort produce — what Export writes. */
  all: Row[];
  /** The current page of `all`. */
  page: Row[];
  pageCount: number;
  total: number;
}

export function useDataTable<
  Row extends { id: string },
  F,
  K extends string,
  S extends string,
  C extends string = string,
>(config: DataTableConfig<Row, F, K, S>) {
  const [filters, setFilters] = useState<F>(config.emptyFilters);
  const [sort, setSortState] = useState(config.defaultSort);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSizeState] = useState(config.defaultPageSize);
  // Which pills are on the row: the starting set, plus any added by hand,
  // minus any removed. A filter holding a value shows its pill regardless, so
  // this only decides which empty ones are on show.
  const [added, setAdded] = useState<K[]>(() => [...config.defaultKeys]);
  // Kept across pages and filters: selecting rows on page one, then page two,
  // then exporting is the whole point of a selection that outlives a page.
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [hiddenColumns, setHiddenColumns] = useState<ReadonlySet<C>>(new Set());

  const query: DataTableQuery<F, S> = { filters, pageIndex, pageSize, sort };
  const { loading, result } = useSimulatedFetch(
    query,
    () => run(config, query),
    config.latency ?? 300,
    EMPTY_RESULT as DataTableResult<Row>
  );

  // A page that no longer exists — `?page=9` on a link, or the last row of the
  // last page deleted elsewhere — snaps to the last page that does.
  useEffect(() => {
    if (!loading && pageIndex > result.pageCount - 1) {
      setPageIndex(result.pageCount - 1);
    }
  }, [loading, pageIndex, result.pageCount]);

  // Every change that can shrink the result goes back to the first page:
  // page 2 of the unfiltered list usually does not exist once a filter is on,
  // and "Page 2 of 1" with no rows looks broken.
  const patchFilters = (patch: Partial<F>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPageIndex(0);
  };

  return {
    added,
    addFilter: (key: K) =>
      setAdded((current) =>
        current.includes(key) ? current : [...current, key]
      ),
    clearFilters: () => {
      setFilters(config.emptyFilters);
      setAdded([...config.defaultKeys]);
      setPageIndex(0);
    },
    clearSelection: () => setSelected(new Set()),
    filters,
    hiddenColumns,
    loading,
    pageIndex,
    pageSize,
    patchFilters,
    query,
    removeFilter: (key: K) => {
      patchFilters(config.clearFor(key));
      setAdded((current) => current.filter((item) => item !== key));
    },
    /** Applies a query read from somewhere else — the URL, on load. */
    restore: (next: Partial<DataTableQuery<F, S>>) => {
      if (next.filters) {
        setFilters(next.filters);
      }
      if (next.sort) {
        setSortState(next.sort);
      }
      if (next.pageSize) {
        setPageSizeState(next.pageSize);
      }
      if (next.pageIndex !== undefined) {
        setPageIndex(next.pageIndex);
      }
    },
    result,
    selected,
    setPageIndex,
    setPageSize: (size: number) => {
      setPageSizeState(size);
      // Page 3 of a 5-per-page list does not exist at 50 per page.
      setPageIndex(0);
    },
    setSort: (next: SortState<S>) => {
      setSortState(next);
      setPageIndex(0);
    },
    sort,
    toggleColumn: (id: C) =>
      setHiddenColumns((current) => toggled(current, id)),
    /** Selects or clears every row on the current page. */
    togglePage: (checked: boolean) =>
      setSelected((current) => {
        const next = new Set(current);
        for (const row of result.page) {
          if (checked) {
            next.add(row.id);
          } else {
            next.delete(row.id);
          }
        }
        return next;
      }),
    toggleRow: (id: string) => setSelected((current) => toggled(current, id)),
  };
}

function toggled<T>(set: ReadonlySet<T>, item: T): ReadonlySet<T> {
  const next = new Set(set);
  if (next.has(item)) {
    next.delete(item);
  } else {
    next.add(item);
  }
  return next;
}

/** What a server would do with the query: filter, sort, count, slice. */
function run<Row, F, K extends string, S extends string>(
  config: DataTableConfig<Row, F, K, S>,
  query: DataTableQuery<F, S>
): DataTableResult<Row> {
  const all = config.sortRows(
    config.rows.filter((row) => config.matches(row, query.filters)),
    query.sort
  );
  const start = query.pageIndex * query.pageSize;
  return {
    all,
    page: all.slice(start, start + query.pageSize),
    pageCount: Math.max(1, Math.ceil(all.length / query.pageSize)),
    total: all.length,
  };
}

const EMPTY_RESULT: DataTableResult<never> = {
  all: [],
  page: [],
  pageCount: 1,
  total: 0,
};

/**
 * Answers a query after `latency`, the way a request would.
 *
 * Each change restarts the wait, so typing in search settles once rather than
 * once per keystroke — the debounce a real search field needs, for free.
 * While waiting, the last answer stays in hand: the pagination and summary keep
 * describing the rows that were there rather than collapsing to zero, and the
 * table body shows skeleton rows in their place.
 *
 * It starts out loading, on the server too, so the first paint is the
 * skeleton rather than a flash of the unfiltered table before a URL's filters
 * apply.
 */
function useSimulatedFetch<Q, R>(
  query: Q,
  answer: () => R,
  latency: number,
  initial: R
): { loading: boolean; result: R } {
  const key = JSON.stringify(query);
  const [settled, setSettled] = useState<{ key: string; result: R } | null>(
    null
  );
  // `answer` is a fresh closure each render; the key is what identifies it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on `key`
  const pending = useMemo(answer, [key]);

  useEffect(() => {
    const timer = setTimeout(
      () => setSettled({ key, result: pending }),
      latency
    );
    return () => clearTimeout(timer);
  }, [key, latency, pending]);

  return {
    loading: settled?.key !== key,
    result: settled?.result ?? initial,
  };
}
