import { render, screen } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
} from "./table";

// =============================================================================
// Table
// =============================================================================
describe("Table", () => {
  it("renders a table element", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("table")).toHaveAttribute("data-slot", "table");
  });

  it("applies custom className", () => {
    render(
      <Table className="custom-class">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("table")).toHaveClass("custom-class");
  });

  it("wraps table in a container div", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const container = screen.getByRole("table").parentElement;
    expect(container).toHaveAttribute("data-slot", "table-container");
  });

  // overflow-x: auto + default overflow-y: visible computes to overflow-y: auto
  // (CSS Overflow L3), which paints a phantom vertical scrollbar on macOS
  // "Always show scrollbars". Pin both axes so the promotion can't recur.
  it("pins both overflow axes on the container", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const container = screen.getByRole("table").parentElement;
    expect(container).toHaveClass("overflow-x-auto", "overflow-y-hidden");
  });

  it("sets data-size attribute", () => {
    render(
      <Table size="sm">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("table")).toHaveAttribute("data-size", "sm");
  });

  it("sets data-variant attribute", () => {
    render(
      <Table variant="card">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("table")).toHaveAttribute("data-variant", "card");
  });

  it("sets data-hoverable when hoverable is true", () => {
    render(
      <Table hoverable>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("table")).toHaveAttribute("data-hoverable", "true");
  });

  it("does not set data-hoverable when hoverable is false", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("table")).not.toHaveAttribute("data-hoverable");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(
      <Table ref={ref}>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTableElement);
  });
});

// =============================================================================
// TableHeader
// =============================================================================
describe("TableHeader", () => {
  it("renders a thead element", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByRole("rowgroup")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <Table>
        <TableHeader data-testid="thead">
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByTestId("thead")).toHaveAttribute(
      "data-slot",
      "table-header"
    );
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableHeader className="custom-class" data-testid="thead">
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByTestId("thead")).toHaveClass("custom-class");
  });
});

// =============================================================================
// TableBody
// =============================================================================
describe("TableBody", () => {
  it("renders a tbody element", () => {
    render(
      <Table>
        <TableBody data-testid="tbody">
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("tbody").tagName).toBe("TBODY");
  });

  it("has data-slot attribute", () => {
    render(
      <Table>
        <TableBody data-testid="tbody">
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("tbody")).toHaveAttribute(
      "data-slot",
      "table-body"
    );
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableBody className="custom-class" data-testid="tbody">
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("tbody")).toHaveClass("custom-class");
  });
});

// =============================================================================
// TableFooter
// =============================================================================
describe("TableFooter", () => {
  it("renders a tfoot element", () => {
    render(
      <Table>
        <TableFooter data-testid="tfoot">
          <TableRow>
            <TableCell>Footer</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    expect(screen.getByTestId("tfoot").tagName).toBe("TFOOT");
  });

  it("has data-slot attribute", () => {
    render(
      <Table>
        <TableFooter data-testid="tfoot">
          <TableRow>
            <TableCell>Footer</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    expect(screen.getByTestId("tfoot")).toHaveAttribute(
      "data-slot",
      "table-footer"
    );
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableFooter className="custom-class" data-testid="tfoot">
          <TableRow>
            <TableCell>Footer</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    expect(screen.getByTestId("tfoot")).toHaveClass("custom-class");
  });
});

// =============================================================================
// TableRow
// =============================================================================
describe("TableRow", () => {
  it("renders a tr element", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("row")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("row")).toHaveAttribute("data-slot", "table-row");
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableBody>
          <TableRow className="custom-class">
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("row")).toHaveClass("custom-class");
  });
});

// =============================================================================
// TableHead
// =============================================================================
describe("TableHead", () => {
  it("renders a th element", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByRole("columnheader")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByRole("columnheader")).toHaveAttribute(
      "data-slot",
      "table-head"
    );
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="custom-class">Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByRole("columnheader")).toHaveClass("custom-class");
  });

  it("renders text content", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
  });
});

// =============================================================================
// TableCell
// =============================================================================
describe("TableCell", () => {
  it("renders a td element", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("cell")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("cell")).toHaveAttribute("data-slot", "table-cell");
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="custom-class">Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("cell")).toHaveClass("custom-class");
  });

  it("renders text content", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});

// =============================================================================
// TableCaption
// =============================================================================
describe("TableCaption", () => {
  it("renders a caption element", () => {
    render(
      <Table>
        <TableCaption>A list of users</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText("A list of users")).toBeInTheDocument();
    expect(screen.getByText("A list of users").tagName).toBe("CAPTION");
  });

  it("has data-slot attribute", () => {
    render(
      <Table>
        <TableCaption>Caption</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText("Caption")).toHaveAttribute(
      "data-slot",
      "table-caption"
    );
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableCaption className="custom-class">Caption</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText("Caption")).toHaveClass("custom-class");
  });
});

// =============================================================================
// Full Table composition
// =============================================================================
describe("Table composition", () => {
  it("renders a complete table with all parts", () => {
    render(
      <Table>
        <TableCaption>User list</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total: 1</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText("User list")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Total: 1")).toBeInTheDocument();
  });
});

const NAME_LABEL_RE = /name/i;

// =============================================================================
// Sorting
// =============================================================================
describe("TableHead sorting", () => {
  // The three-way distinction is the whole point. `aria-sort="none"` on a
  // column that cannot be sorted tells a screen-reader user that it can be.
  it("emits no aria-sort when the prop is omitted", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByRole("columnheader")).not.toHaveAttribute("aria-sort");
  });

  it.each([
    [null, "none"],
    ["asc", "ascending"],
    ["desc", "descending"],
  ] as const)("sortDirection=%s gives aria-sort=%s", (direction, expected) => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortDirection={direction}>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByRole("columnheader")).toHaveAttribute(
      "aria-sort",
      expected
    );
  });
});

describe("TableSortButton", () => {
  const renderIn = (node: React.ReactNode) =>
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortDirection={null}>{node}</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );

  it("renders a real button by default", () => {
    renderIn(<TableSortButton>Name</TableSortButton>);
    const button = screen.getByRole("button", { name: NAME_LABEL_RE });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
  });

  // The dual-mode proof: the same component serves a URL-driven server table
  // and a client-state one.
  it("becomes an anchor via render, keeping data-slot", () => {
    renderIn(
      // biome-ignore lint/a11y/useValidAnchor: exercising polymorphism
      <TableSortButton render={<a href="?sort=name" />}>Name</TableSortButton>
    );
    const link = screen.getByRole("link", { name: NAME_LABEL_RE });
    expect(link).toHaveAttribute("href", "?sort=name");
    expect(link).toHaveAttribute("data-slot", "table-sort-button");
  });

  it("fires onClick", () => {
    const onClick = vi.fn();
    renderIn(<TableSortButton onClick={onClick}>Name</TableSortButton>);
    screen.getByRole("button", { name: NAME_LABEL_RE }).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each([
    [null, "lucide-arrow-up-down"],
    ["asc", "lucide-arrow-up"],
    ["desc", "lucide-arrow-down"],
  ] as const)("direction=%s renders %s", (direction, icon) => {
    const { container } = renderIn(
      <TableSortButton direction={direction}>Name</TableSortButton>
    );
    expect(container.querySelector("svg")).toHaveClass(icon);
  });

  // A permanently visible marker is what distinguishes the sortable columns
  // from the ones that are not, so hiding it is opt-in.
  it("keeps the inactive marker visible by default", () => {
    const { container } = renderIn(<TableSortButton>Name</TableSortButton>);
    expect(container.querySelector("svg")).toHaveClass("opacity-40");
  });

  it("hides the inactive marker when revealOnHover is set", () => {
    const { container } = renderIn(
      <TableSortButton revealOnHover>Name</TableSortButton>
    );
    expect(container.querySelector("svg")).toHaveClass("opacity-0");
  });
});

// =============================================================================
// Numeric columns
// =============================================================================
describe("numeric", () => {
  it("right-aligns a head with tabular figures", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead numeric>Deploys</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    const head = screen.getByRole("columnheader");
    expect(head).toHaveAttribute("data-numeric", "true");
    // `text-end`, not `text-right` — the column has to flip in RTL.
    expect(head).toHaveClass("data-numeric:text-end");
  });

  it("right-aligns a cell with tabular figures", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell numeric>42</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("cell")).toHaveAttribute("data-numeric", "true");
  });

  it("sets no data-numeric by default", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Platform</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("cell")).not.toHaveAttribute("data-numeric");
  });
});

// =============================================================================
// TableEmpty
// =============================================================================
describe("TableEmpty", () => {
  it("renders a spanning cell and suppresses the row hover", () => {
    render(
      <Table>
        <TableBody>
          <TableEmpty colSpan={4}>No results.</TableEmpty>
        </TableBody>
      </Table>
    );
    const cell = screen.getByRole("cell");
    expect(cell).toHaveAttribute("colspan", "4");
    expect(cell).toHaveAttribute("data-slot", "table-empty");
    expect(cell.closest("tr")).toHaveAttribute("data-slot", "table-empty-row");
    expect(cell.closest("tr")).toHaveClass("hover:bg-transparent");
  });

  it("renders composed children", () => {
    render(
      <Table>
        <TableBody>
          <TableEmpty colSpan={2}>
            <div>Nothing here yet</div>
          </TableEmpty>
        </TableBody>
      </Table>
    );
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });
});

// =============================================================================
// Scroll container
// =============================================================================
describe("table container", () => {
  it("forwards containerClassName", () => {
    const { container } = render(<Table containerClassName="max-h-96" />);
    expect(
      container.querySelector('[data-slot="table-container"]')
    ).toHaveClass("max-h-96");
  });

  // overflow-y is pinned to hidden by default (an implicit promotion to auto
  // renders a permanent vertical gutter on macOS), so a scrolling viewport --
  // and therefore a sticky header -- has to be reachable from outside.
  it("lets containerClassName override overflow-y", () => {
    const { container } = render(
      <Table containerClassName="overflow-y-auto" />
    );
    const scroller = container.querySelector('[data-slot="table-container"]');
    expect(scroller).toHaveClass("overflow-y-auto");
    expect(scroller).not.toHaveClass("overflow-y-hidden");
  });

  it("forwards containerProps", () => {
    const { container } = render(
      <Table containerProps={{ "aria-label": "Scrollable", id: "scroller" }} />
    );
    const scroller = container.querySelector('[data-slot="table-container"]');
    expect(scroller).toHaveAttribute("id", "scroller");
    expect(scroller).toHaveAttribute("aria-label", "Scrollable");
  });
});
