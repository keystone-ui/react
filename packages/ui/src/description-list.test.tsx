import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "./description-list";

function renderList(props?: React.ComponentProps<typeof DescriptionList>) {
  render(
    <DescriptionList data-testid="list" {...props}>
      <DescriptionListItem data-testid="item">
        <DescriptionListTerm data-testid="term">Status</DescriptionListTerm>
        <DescriptionListDetails data-testid="details">
          Active
        </DescriptionListDetails>
      </DescriptionListItem>
    </DescriptionList>
  );
  return {
    details: screen.getByTestId("details"),
    item: screen.getByTestId("item"),
    list: screen.getByTestId("list"),
    term: screen.getByTestId("term"),
  };
}

// =============================================================================
// Defaults
// =============================================================================
// `orientation` and `columns` were added for record/detail views. They must be
// purely additive — every list that predates them renders exactly as before —
// so these pin the untouched shape rather than the new one.
describe("DescriptionList defaults", () => {
  it("lays pairs out in rows, one column", () => {
    const { list } = renderList();

    expect(list).toHaveClass("flex", "flex-col");
    expect(list).not.toHaveClass("grid");
  });

  it("keeps the row item and right-aligned details", () => {
    const { item, details } = renderList();

    expect(item).toHaveClass("items-center", "justify-between");
    expect(details).toHaveClass("ml-auto", "text-right");
  });

  it("reports its layout through a data attribute", () => {
    const { list } = renderList();

    expect(list).toHaveAttribute("data-orientation", "row");
  });
});

// =============================================================================
// orientation
// =============================================================================
describe("DescriptionList stacked orientation", () => {
  it("stacks the term above the details and drops the row chrome", () => {
    const { item } = renderList({ orientation: "stacked" });

    expect(item).toHaveClass(
      "group-data-[orientation=stacked]/description-list:flex-col",
      "group-data-[orientation=stacked]/description-list:items-start",
      "group-data-[orientation=stacked]/description-list:border-0"
    );
  });

  it("left-aligns the details", () => {
    const { details } = renderList({ orientation: "stacked" });

    expect(details).toHaveClass(
      "group-data-[orientation=stacked]/description-list:ml-0",
      "group-data-[orientation=stacked]/description-list:text-left"
    );
  });

  it("spaces the rows, which nothing else does once the chrome is gone", () => {
    // Without this, one pair's value sits flush against the next pair's label:
    // stacked items drop the padding and separators that space row items.
    const { list } = renderList({ columns: 2, orientation: "stacked" });

    expect(list).toHaveClass("gap-y-4");
  });

  it("leaves row orientation unspaced, since its items carry padding", () => {
    const { list } = renderList();

    expect(list).not.toHaveClass("gap-y-4");
  });

  /**
   * There is deliberately no `columns` prop. A multi-column record is four
   * classes on the element the caller already styles, and layout belongs in
   * `className` here. This pins that it actually composes: `grid` supersedes
   * the default `flex`, and the stacked row gap survives alongside `gap-x-*`.
   */
  it("lets the caller supply a grid without losing the row gap", () => {
    const { list } = renderList({
      className: "grid grid-cols-1 gap-x-8 sm:grid-cols-2",
      orientation: "stacked",
    });

    expect(list).toHaveClass("grid", "sm:grid-cols-2", "gap-x-8", "gap-y-4");
    expect(list).not.toHaveClass("flex");
  });

  it("reports the orientation so the parts can respond to it", () => {
    const { list } = renderList({ orientation: "stacked" });

    expect(list).toHaveAttribute("data-orientation", "stacked");
  });
});

// =============================================================================
// Semantics
// =============================================================================
describe("DescriptionList semantics", () => {
  it("renders a dl/dt/dd, which is what makes it a record view", () => {
    const { list, term, details } = renderList();

    expect(list.tagName).toBe("DL");
    expect(term.tagName).toBe("DT");
    expect(details.tagName).toBe("DD");
  });

  it("accepts arbitrary JSX as a value", () => {
    render(
      <DescriptionList>
        <DescriptionListItem>
          <DescriptionListTerm>Role</DescriptionListTerm>
          <DescriptionListDetails>
            <span data-testid="badge">Admin</span>
          </DescriptionListDetails>
        </DescriptionListItem>
      </DescriptionList>
    );

    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });
});
