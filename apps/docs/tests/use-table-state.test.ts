// @vitest-environment jsdom

/**
 * `useTableState` holds what a table's controls set — filters, sort, page,
 * page size, selection, hidden columns — and nothing about the rows. Every
 * change that can shrink the result goes back to the first page, a query read
 * from the URL applies only the parts it carries, and a selection made a page
 * at a time keeps the ids from other pages.
 */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTableState } from "@/demos/blocks/admin-01/use-data-table";

interface Filters {
  role: string;
  search: string;
}

type Key = "role" | "search";

const EMPTY: Filters = { role: "", search: "" };

function useUsersState() {
  return useTableState<Filters, Key, "name" | "email">({
    clearFor: (key) => ({ [key]: "" }),
    defaultKeys: ["search"],
    defaultPageSize: 10,
    defaultSort: { direction: "asc", key: "name" },
    emptyFilters: EMPTY,
  });
}

const sorted = (set: ReadonlySet<string>) => [...set].sort();

describe("useTableState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("goes back to the first page when a filter is patched", () => {
    const { result } = renderHook(useUsersState);
    act(() => result.current.setPageIndex(3));
    expect(result.current.pageIndex).toBe(3);

    act(() => result.current.patchFilters({ search: "ada" }));
    expect(result.current.pageIndex).toBe(0);
    expect(result.current.filters).toEqual({ role: "", search: "ada" });
    expect(result.current.query.filters).toEqual({ role: "", search: "ada" });
  });

  it("goes back to the first page when the sort changes", () => {
    const { result } = renderHook(useUsersState);
    act(() => result.current.setPageIndex(2));

    act(() => result.current.setSort({ direction: "desc", key: "email" }));
    expect(result.current.pageIndex).toBe(0);
    expect(result.current.sort).toEqual({ direction: "desc", key: "email" });
  });

  it("goes back to the first page when the page size changes", () => {
    const { result } = renderHook(useUsersState);
    act(() => result.current.setPageIndex(2));

    act(() => result.current.setPageSize(50));
    expect(result.current.pageIndex).toBe(0);
    expect(result.current.pageSize).toBe(50);
  });

  it("applies only the parts of a restored query it is given", () => {
    const { result } = renderHook(useUsersState);
    act(() => result.current.patchFilters({ role: "admin" }));

    act(() =>
      result.current.restore({
        pageIndex: 4,
        sort: { direction: "desc", key: "email" },
      })
    );
    expect(result.current.query).toEqual({
      filters: { role: "admin", search: "" },
      pageIndex: 4,
      pageSize: 10,
      sort: { direction: "desc", key: "email" },
    });
  });

  it("adds and removes exactly the ids it is given and keeps the rest", () => {
    const { result } = renderHook(useUsersState);
    act(() => result.current.toggleRow("other-page"));

    act(() => result.current.setRowsSelected(["a", "b"], true));
    expect(sorted(result.current.selected)).toEqual(["a", "b", "other-page"]);

    act(() => result.current.setRowsSelected(["a", "c"], false));
    expect(sorted(result.current.selected)).toEqual(["b", "other-page"]);
  });
});
