import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  TablePagination,
  TablePaginationButtons,
  TablePaginationInfo,
  TablePaginationPageSize,
  TablePaginationStatus,
} from "./table-pagination";

const FIRST_RE = /go to first page/i;
const PREV_RE = /go to previous page/i;
const NEXT_RE = /go to next page/i;
const LAST_RE = /go to last page/i;
const SELECTED_RE = /row\(s\) selected/;

describe("TablePagination", () => {
  it("renders the default composition", () => {
    render(
      <TablePagination
        pageCount={3}
        pageIndex={0}
        pageSize={10}
        selectedCount={2}
        totalCount={25}
      />
    );
    expect(screen.getByText("2 of 25 row(s) selected.")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: NEXT_RE })).toBeInTheDocument();
  });

  it("hides the selection line when selectedCount is omitted", () => {
    render(<TablePagination pageCount={3} pageIndex={0} />);
    expect(screen.queryByText(SELECTED_RE)).toBeNull();
  });

  it("hides the page-size control when pageSize is omitted", () => {
    render(<TablePagination pageCount={3} pageIndex={0} />);
    expect(screen.queryByText("Rows per page")).toBeNull();
  });

  it("lets children replace the composition", () => {
    render(
      <TablePagination pageCount={3} pageIndex={0}>
        <span>custom</span>
      </TablePagination>
    );
    expect(screen.getByText("custom")).toBeInTheDocument();
    expect(screen.queryByText("Page 1 of 3")).toBeNull();
  });

  it("sets data-slot and forwards className", () => {
    render(
      <TablePagination
        className="custom"
        data-testid="p"
        pageCount={1}
        pageIndex={0}
      />
    );
    const el = screen.getByTestId("p");
    expect(el).toHaveAttribute("data-slot", "table-pagination");
    expect(el).toHaveClass("custom");
  });
});

// The disabled arithmetic is the actual duplicated logic this component exists
// to centralise, so it gets the most coverage.
describe("TablePaginationButtons", () => {
  const setup = (pageIndex: number, pageCount = 3) => {
    const onPageIndexChange = vi.fn();
    render(
      <TablePaginationButtons
        onPageIndexChange={onPageIndexChange}
        pageCount={pageCount}
        pageIndex={pageIndex}
      />
    );
    return { onPageIndexChange };
  };

  it("disables backward navigation on the first page", () => {
    setup(0);
    expect(screen.getByRole("button", { name: FIRST_RE })).toBeDisabled();
    expect(screen.getByRole("button", { name: PREV_RE })).toBeDisabled();
    expect(screen.getByRole("button", { name: NEXT_RE })).toBeEnabled();
    expect(screen.getByRole("button", { name: LAST_RE })).toBeEnabled();
  });

  it("disables forward navigation on the last page", () => {
    setup(2);
    expect(screen.getByRole("button", { name: FIRST_RE })).toBeEnabled();
    expect(screen.getByRole("button", { name: PREV_RE })).toBeEnabled();
    expect(screen.getByRole("button", { name: NEXT_RE })).toBeDisabled();
    expect(screen.getByRole("button", { name: LAST_RE })).toBeDisabled();
  });

  it("enables everything in the middle", () => {
    setup(1);
    for (const re of [FIRST_RE, PREV_RE, NEXT_RE, LAST_RE]) {
      expect(screen.getByRole("button", { name: re })).toBeEnabled();
    }
  });

  // A single page is the case where an off-by-one shows up as an enabled
  // button that goes nowhere.
  it("disables everything for a single page", () => {
    setup(0, 1);
    for (const re of [FIRST_RE, PREV_RE, NEXT_RE, LAST_RE]) {
      expect(screen.getByRole("button", { name: re })).toBeDisabled();
    }
  });

  it.each([
    [FIRST_RE, 0],
    [PREV_RE, 0],
    [NEXT_RE, 2],
    [LAST_RE, 2],
  ] as const)("navigates to the right index", (re, expected) => {
    const { onPageIndexChange } = setup(1);
    screen.getByRole("button", { name: re }).click();
    expect(onPageIndexChange).toHaveBeenCalledWith(expected);
  });

  it("renders only two buttons when showEdgeButtons is false", () => {
    render(
      <TablePaginationButtons
        pageCount={3}
        pageIndex={1}
        showEdgeButtons={false}
      />
    );
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: FIRST_RE })).toBeNull();
  });

  it("gives every button an accessible name", () => {
    render(<TablePaginationButtons pageCount={3} pageIndex={1} />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAccessibleName();
    }
  });
});

describe("TablePaginationStatus", () => {
  it("renders a 1-based page number from a 0-based index", () => {
    render(<TablePaginationStatus pageCount={3} pageIndex={0} />);
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });

  // Paging swaps the table's contents with no other visible confirmation.
  it("announces politely", () => {
    render(
      <TablePaginationStatus data-testid="s" pageCount={3} pageIndex={0} />
    );
    expect(screen.getByTestId("s")).toHaveAttribute("aria-live", "polite");
  });

  it("clamps an empty result set to one page", () => {
    render(<TablePaginationStatus pageCount={0} pageIndex={0} />);
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
  });

  it("uses tabular-nums so the width does not shift while paging", () => {
    render(
      <TablePaginationStatus data-testid="s" pageCount={3} pageIndex={0} />
    );
    expect(screen.getByTestId("s")).toHaveClass("tabular-nums");
  });
});

describe("TablePaginationInfo", () => {
  it("renders the selected count", () => {
    render(<TablePaginationInfo selectedCount={3} totalCount={40} />);
    expect(screen.getByText("3 of 40 row(s) selected.")).toBeInTheDocument();
  });

  it("announces politely", () => {
    render(<TablePaginationInfo data-testid="i" selectedCount={0} />);
    expect(screen.getByTestId("i")).toHaveAttribute("aria-live", "polite");
  });

  it("renders nothing when selectedCount is omitted", () => {
    render(<TablePaginationInfo data-testid="i" />);
    expect(screen.getByTestId("i")).toBeEmptyDOMElement();
  });
});

describe("TablePaginationPageSize", () => {
  it("labels the select", () => {
    render(<TablePaginationPageSize value={10} />);
    const label = screen.getByText("Rows per page");
    expect(label).toHaveAttribute("for");
    expect(
      document.getElementById(label.getAttribute("for") as string)
    ).not.toBeNull();
  });

  it("accepts a custom label", () => {
    render(<TablePaginationPageSize label="Per page" value={10} />);
    expect(screen.getByText("Per page")).toBeInTheDocument();
  });

  it("sets data-slot", () => {
    render(<TablePaginationPageSize data-testid="ps" value={10} />);
    expect(screen.getByTestId("ps")).toHaveAttribute(
      "data-slot",
      "table-pagination-page-size"
    );
  });
});
