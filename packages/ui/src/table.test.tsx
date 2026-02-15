import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
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
