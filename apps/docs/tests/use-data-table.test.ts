// @vitest-environment jsdom

/**
 * `useDataTable` answers from `config.rows`. Rows that arrive after mount —
 * fetched, then handed in — must be answered from, not ignored: the hook used
 * to memoise its answer on the query alone, so a table whose rows loaded late
 * stayed empty until someone touched a filter.
 *
 * Rows are a new answer when they differ row by row (each row the same object,
 * or shallowly equal to it). A render React throws away must leave nothing
 * behind: the rows it saw are not the rows the table settled on.
 */

import { act, cleanup, render, renderHook } from "@testing-library/react";
import {
  createElement,
  StrictMode,
  Suspense,
  startTransition,
  useLayoutEffect,
  useState,
} from "react";
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

function useTable(rows: readonly Row[], pageSize = 10) {
  return useDataTable<Row, Record<string, never>, never, "name">({
    clearFor: () => ({}),
    defaultKeys: [],
    defaultPageSize: pageSize,
    defaultSort: { direction: "asc", key: "name" },
    emptyFilters: {},
    latency: 50,
    matches: () => true,
    rows,
    sortRows: (list) => [...list],
  });
}

const ids = (rows: readonly Row[]) => rows.map((row) => row.id);

const modes = [
  { name: "plain", wrapper: undefined },
  { name: "StrictMode", wrapper: StrictMode },
] as const;

describe("useDataTable", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  for (const { name, wrapper } of modes) {
    describe(name, () => {
      it("answers from rows that arrive after mount", () => {
        const { rerender, result } = renderHook(({ rows }) => useTable(rows), {
          initialProps: { rows: [] as readonly Row[] },
          wrapper,
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
        // `rows: data.filter(…)` inline is a new array on every render. Keying
        // on the array itself crashed with "Too many re-renders"; the rows
        // inside are what identify the answer.
        const { result } = renderHook(() => useTable(ROWS.filter(() => true)), {
          wrapper,
        });
        act(() => {
          vi.advanceTimersByTime(60);
        });
        expect(result.current.loading).toBe(false);
        expect(result.current.result.total).toBe(3);
      });
    });
  }

  it("settles when rows are mapped inline to fresh objects with the same fields", () => {
    // `rows: data.map(toUser)` inline: new objects every render, equal field
    // by field. Not a new answer.
    const { result } = renderHook(() =>
      useTable(ROWS.map((row) => ({ ...row })))
    );
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.result.total).toBe(3);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.loading).toBe(false);
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

  it("treats one row replaced at the same length as a new answer", () => {
    const { rerender, result } = renderHook(({ rows }) => useTable(rows), {
      initialProps: { rows: ROWS },
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });

    rerender({ rows: [ROWS[0], ROWS[1], { id: "c", name: "Cyra" }] });
    expect(result.current.loading).toBe(true);
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.result.page.map((row) => row.name)).toEqual([
      "Ada",
      "Ben",
      "Cyra",
    ]);
  });

  it("treats the same rows in a new order as a new answer", () => {
    const { rerender, result } = renderHook(({ rows }) => useTable(rows), {
      initialProps: { rows: ROWS },
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });

    rerender({ rows: [...ROWS].reverse() });
    expect(result.current.loading).toBe(true);
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(ids(result.current.result.page)).toEqual(["c", "b", "a"]);
  });

  it("answers an empty list when populated rows are replaced by none", () => {
    const { rerender, result } = renderHook(({ rows }) => useTable(rows), {
      initialProps: { rows: ROWS },
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.result.total).toBe(3);

    rerender({ rows: [] });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.result.total).toBe(0);
    expect(result.current.result.page).toEqual([]);
  });

  it("snaps to the last page that exists when the rows shrink", () => {
    const { rerender, result } = renderHook(({ rows }) => useTable(rows, 1), {
      initialProps: { rows: ROWS },
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    act(() => {
      result.current.setPageIndex(2);
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(ids(result.current.result.page)).toEqual(["c"]);

    rerender({ rows: ROWS.slice(0, 2) });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.pageIndex).toBe(1);
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.loading).toBe(false);
    expect(ids(result.current.result.page)).toEqual(["b"]);
  });

  it("keeps the settled rows when a transition to other rows is thrown away", () => {
    const OTHER: readonly Row[] = [{ id: "z", name: "Zed" }];
    const never = new Promise<never>(() => undefined);
    const rendered: string[] = [];
    const committed: { loading: boolean; result: unknown; rows: string }[] = [];
    let toOther: () => void = () => undefined;
    let tick: () => void = () => undefined;

    // Throws its promise rather than calling `use`, so the render unwinds
    // at once and the next update starts from a fresh tree.
    function Suspend(): null {
      throw never;
    }

    function Harness() {
      const [rows, setRows] = useState(ROWS);
      const [, setTick] = useState(0);
      toOther = () => startTransition(() => setRows(OTHER));
      tick = () => setTick((n) => n + 1);
      const table = useTable(rows);
      const label = ids(rows).join("");
      rendered.push(label);
      useLayoutEffect(() => {
        committed.push({
          loading: table.loading,
          result: table.result,
          rows: label,
        });
      });
      return createElement(
        Suspense,
        { fallback: null },
        rows === OTHER ? createElement(Suspend) : null
      );
    }

    render(createElement(StrictMode, null, createElement(Harness)));
    act(() => {
      vi.advanceTimersByTime(60);
    });
    const settled = committed.at(-1);
    expect(settled).toMatchObject({ loading: false, rows: "abc" });

    // A transition renders the other rows, then a child suspends: React
    // throws that render away and keeps showing the settled rows.
    act(() => {
      toOther();
    });
    expect(rendered).toContain("z");
    expect(committed.every((entry) => entry.rows === "abc")).toBe(true);

    // An unrelated urgent update renders the same rows again. Nothing changed,
    // so nothing reloads.
    act(() => {
      tick();
    });
    expect(rendered.lastIndexOf("abc")).toBeGreaterThan(rendered.indexOf("z"));
    const after = committed.at(-1);
    expect(after?.rows).toBe("abc");
    expect(after?.loading).toBe(false);

    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(committed.at(-1)?.loading).toBe(false);
    expect(committed.at(-1)?.result).toBe(settled?.result);
  });
});
