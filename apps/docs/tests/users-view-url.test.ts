// @vitest-environment jsdom

/**
 * The standalone users view (`users-01`) owns the whole page, so its URL is
 * the users query and nothing else: a pasted link restores search, filters,
 * sort and page, a change made in the table is written back, and no `view`
 * key from admin-01's multi-section shell leaks in.
 */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UsersView } from "@/demos/blocks/admin-01/users-view";

const SELECT_PREFIX = /^Select /;
const ROLE_ADMIN = /^Role:\s*Admin$/;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  window.history.replaceState(null, "", "/");
});

function open(url: string) {
  window.history.replaceState(null, "", url);
  render(createElement(UsersView));
  settle();
}

function settle() {
  act(() => {
    vi.advanceTimersByTime(400);
  });
}

/** The names in the table body, top to bottom. */
function names(): string[] {
  const body = screen.getByRole("table").querySelector("tbody");
  if (!body) {
    throw new Error("no table body");
  }
  return within(body)
    .getAllByRole("row")
    .map(
      (row) =>
        within(row)
          .queryByRole("checkbox")
          ?.getAttribute("aria-label")
          ?.replace(SELECT_PREFIX, "") ?? ""
    )
    .filter(Boolean);
}

function params() {
  return new URLSearchParams(window.location.search);
}

describe("UsersView URL state", () => {
  it("restores search and filters from the URL into the table", () => {
    open("/users?q=hana&role=Admin");

    expect(
      screen.getByRole("searchbox", { name: "Search users" })
    ).toHaveProperty("value", "hana");
    expect(names()).toEqual(["Hana Sato"]);
  });

  it("restores a role filter as its pill and the matching rows", () => {
    open("/users?role=Admin&sort=name.asc");

    const pill = document.querySelector('[data-filter-label="Role"]');
    expect(pill?.textContent).toMatch(ROLE_ADMIN);
    expect(names()).toEqual(["Ada Okonkwo", "Hana Sato"]);
  });

  it("writes a search typed in the table to the URL, with no view key", () => {
    open("/users");
    expect(window.location.search).toBe("");

    fireEvent.change(screen.getByRole("searchbox", { name: "Search users" }), {
      target: { value: "chen" },
    });
    settle();

    expect(params().get("q")).toBe("chen");
    expect(params().get("view")).toBeNull();
    expect(names()).toEqual(["Chen Wei"]);
  });

  it("drops a view key a link carries from the multi-section shell", () => {
    open("/users?view=payments&role=Admin");

    expect(params().get("view")).toBeNull();
    expect(params().get("role")).toBe("Admin");
    expect(names()).toEqual(["Ada Okonkwo", "Hana Sato"]);
  });
});
