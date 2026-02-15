import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

// =============================================================================
// Pagination
// =============================================================================
describe("Pagination", () => {
  it("renders a nav element", () => {
    render(<Pagination />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<Pagination />);
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-slot",
      "pagination"
    );
  });

  it("has aria-label for accessibility", () => {
    render(<Pagination />);
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-label",
      "pagination"
    );
  });

  it("applies custom className", () => {
    render(<Pagination className="custom-class" />);
    expect(screen.getByRole("navigation")).toHaveClass("custom-class");
  });
});

// =============================================================================
// PaginationContent
// =============================================================================
describe("PaginationContent", () => {
  it("renders a ul element", () => {
    render(
      <Pagination>
        <PaginationContent data-testid="content" />
      </Pagination>
    );
    expect(screen.getByTestId("content").tagName).toBe("UL");
  });

  it("has data-slot attribute", () => {
    render(
      <Pagination>
        <PaginationContent data-testid="content" />
      </Pagination>
    );
    expect(screen.getByTestId("content")).toHaveAttribute(
      "data-slot",
      "pagination-content"
    );
  });

  it("applies custom className", () => {
    render(
      <Pagination>
        <PaginationContent className="custom-class" data-testid="content" />
      </Pagination>
    );
    expect(screen.getByTestId("content")).toHaveClass("custom-class");
  });
});

// =============================================================================
// PaginationItem
// =============================================================================
describe("PaginationItem", () => {
  it("renders a li element", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem data-testid="item" />
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByTestId("item").tagName).toBe("LI");
  });

  it("has data-slot attribute", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem data-testid="item" />
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByTestId("item")).toHaveAttribute(
      "data-slot",
      "pagination-item"
    );
  });
});

// =============================================================================
// PaginationLink
// =============================================================================
describe("PaginationLink", () => {
  it("renders with children content", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("has data-slot attribute on the anchor", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen.getByText("1").closest("[data-slot='pagination-link']");
    expect(link).toBeInTheDocument();
  });

  it("sets aria-current when isActive is true", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink isActive>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen.getByText("1").closest("[data-slot='pagination-link']");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("does not set aria-current when isActive is false", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen.getByText("1").closest("[data-slot='pagination-link']");
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("applies custom className", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink className="custom-class">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });
});

// =============================================================================
// PaginationPrevious
// =============================================================================
describe("PaginationPrevious", () => {
  it("renders with default text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText("Previous")).toBeInTheDocument();
  });

  it("renders with custom text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious text="Back" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("has aria-label for accessibility", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen
      .getByText("Previous")
      .closest("[aria-label='Go to previous page']");
    expect(link).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious className="custom-class" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const button = screen.getByRole("button", { name: "Go to previous page" });
    expect(button).toHaveClass("custom-class");
  });
});

// =============================================================================
// PaginationNext
// =============================================================================
describe("PaginationNext", () => {
  it("renders with default text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("renders with custom text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext text="Forward" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText("Forward")).toBeInTheDocument();
  });

  it("has aria-label for accessibility", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen
      .getByText("Next")
      .closest("[aria-label='Go to next page']");
    expect(link).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext className="custom-class" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const button = screen.getByRole("button", { name: "Go to next page" });
    expect(button).toHaveClass("custom-class");
  });
});

// =============================================================================
// PaginationFirst
// =============================================================================
describe("PaginationFirst", () => {
  it("renders a button", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationFirst />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(
      screen.getByRole("button", { name: "Go to first page" })
    ).toBeInTheDocument();
  });

  it("has aria-label for accessibility", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationFirst />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const button = screen.getByRole("button", { name: "Go to first page" });
    expect(button).toBeInTheDocument();
  });
});

// =============================================================================
// PaginationLast
// =============================================================================
describe("PaginationLast", () => {
  it("renders a button", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLast />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(
      screen.getByRole("button", { name: "Go to last page" })
    ).toBeInTheDocument();
  });

  it("has aria-label for accessibility", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLast />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const button = screen.getByRole("button", { name: "Go to last page" });
    expect(button).toBeInTheDocument();
  });
});

// =============================================================================
// PaginationEllipsis
// =============================================================================
describe("PaginationEllipsis", () => {
  it("renders with data-slot attribute", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationEllipsis data-testid="ellipsis" />
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByTestId("ellipsis")).toHaveAttribute(
      "data-slot",
      "pagination-ellipsis"
    );
  });

  it("has aria-hidden attribute", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationEllipsis data-testid="ellipsis" />
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByTestId("ellipsis")).toHaveAttribute("aria-hidden");
  });

  it("has screen reader text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationEllipsis />
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText("More pages")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationEllipsis className="custom-class" data-testid="ellipsis" />
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByTestId("ellipsis")).toHaveClass("custom-class");
  });
});

// =============================================================================
// Full Pagination composition
// =============================================================================
describe("Pagination composition", () => {
  it("renders a complete pagination with all parts", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("More pages")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });
});
