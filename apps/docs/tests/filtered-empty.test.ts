// @vitest-environment jsdom

/**
 * The empty table body says why it is empty. Filtered, it names the filters
 * and offers to clear them. Unfiltered, there is nothing to clear, and the
 * caller may say what the table is waiting for in its own words; without
 * them it falls back to "No … yet".
 */

import { cleanup, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { FilteredEmpty } from "@/demos/blocks/admin-01/filtered-empty";

const CLEAR = { name: "Clear filters" } as const;

function show(props: { emptyTitle?: ReactNode; filtered: boolean }) {
  render(
    createElement(
      "table",
      null,
      createElement(
        "tbody",
        null,
        createElement(FilteredEmpty, {
          colSpan: 3,
          noun: "users",
          onClear: () => undefined,
          ...props,
        })
      )
    )
  );
}

describe("FilteredEmpty", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the caller's title for an unfiltered table, with nothing to clear", () => {
    show({ emptyTitle: "Invite your first teammate", filtered: false });
    expect(screen.getByText("Invite your first teammate")).toBeTruthy();
    expect(screen.queryByText("No users yet")).toBeNull();
    expect(screen.queryByRole("button", CLEAR)).toBeNull();
  });

  it("names the filters and offers to clear them when filtered", () => {
    show({ emptyTitle: "Invite your first teammate", filtered: true });
    expect(screen.getByText("No users match these filters")).toBeTruthy();
    expect(screen.getByRole("button", CLEAR)).toBeTruthy();
  });

  it("falls back to its own words without a title", () => {
    show({ filtered: false });
    expect(screen.getByText("No users yet")).toBeTruthy();
    expect(screen.queryByRole("button", CLEAR)).toBeNull();
  });
});
