// @vitest-environment jsdom

/**
 * `useDataTable` answers from `config.rows`. Rows that arrive after mount —
 * fetched, then handed in — must be answered from, not ignored: the hook used
 * to memoise its answer on the query alone, so a table whose rows loaded late
 * stayed empty until someone touched a filter.
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDataTable } from "@/demos/blocks/admin-01/use-data-table";

interface Row {
  id: string;
  name: string;
}

const ROWS: readonly Row[] = [
  { id: "a", name: "Ada" },
  { id: "b", name: "Ben" },
  { id: "c", name: "Cy" },
];

function useTable(rows: readonly Row[]) {
  return useDataTable<Row, Record<string, never>, never, "name">({
    clearFor: () => ({}),
    defaultKeys: [],
    defaultPageSize: 10,
    defaultSort: { direction: "asc", key: "name" },
    emptyFilters: {},
    latency: 50,
    matches: () => true,
    rows,
    sortRows: (list) => [...list],
  });
}

describe("useDataTable", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("answers from rows that arrive after mount", () => {
    const { rerender, result } = renderHook(({ rows }) => useTable(rows), {
      initialProps: { rows: [] as readonly Row[] },
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.result.total).toBe(0);

    rerender({ rows: ROWS });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.result.total).toBe(3);
  });

  it("settles when the rows array is rebuilt every render over the same rows", () => {
    // `rows: data.filter(…)` inline is a new array on every render. Keying on
    // the array itself crashed with "Too many re-renders"; the rows inside
    // are what identify the answer.
    const { result } = renderHook(() => useTable(ROWS.filter(() => true)));
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.result.total).toBe(3);
  });

  it("does not reload when the same rows are passed again", () => {
    const { rerender, result } = renderHook(({ rows }) => useTable(rows), {
      initialProps: { rows: ROWS },
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.loading).toBe(false);

    rerender({ rows: ROWS });
    expect(result.current.loading).toBe(false);
    expect(result.current.result.total).toBe(3);
  });
});
