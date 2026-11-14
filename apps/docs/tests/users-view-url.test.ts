// @vitest-environment jsdom

/**
 * The standalone users view (`users-01`) owns the whole page, so its URL is
 * the users query and nothing else: a pasted link restores search, filters,
 * sort and page, and no `view` key from admin-01's multi-section shell leaks
 * in.
 */

import { act, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UsersView } from "@/demos/blocks/admin-01/users-view";

afterEach(() => {
  vi.useRealTimers();
  window.history.replaceState(null, "", "/");
});

describe("UsersView URL state", () => {
  it("restores the users query from the URL and writes no view key", () => {
    vi.useFakeTimers();
    window.history.replaceState(null, "", "/users?role=Admin&sort=seats.desc");

    render(createElement(UsersView));
    act(() => {
      vi.advanceTimersByTime(400);
    });

    const params = new URLSearchParams(window.location.search);
    expect(params.get("view")).toBeNull();
    expect(params.get("role")).toBe("Admin");
    expect(params.get("sort")).toBe("seats.desc");
  });

  it("leaves the query string empty for the default view", () => {
    vi.useFakeTimers();
    window.history.replaceState(null, "", "/users");

    render(createElement(UsersView));
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(window.location.search).toBe("");
  });
});
