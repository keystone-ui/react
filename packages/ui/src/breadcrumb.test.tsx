import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

// =============================================================================
// Breadcrumb
// =============================================================================
describe("Breadcrumb", () => {
  it("renders a nav element", () => {
    render(<Breadcrumb data-testid="breadcrumb">Content</Breadcrumb>);
    expect(screen.getByTestId("breadcrumb").tagName).toBe("NAV");
  });

  it("has data-slot attribute", () => {
    render(<Breadcrumb data-testid="breadcrumb">Content</Breadcrumb>);
    expect(screen.getByTestId("breadcrumb")).toHaveAttribute(
      "data-slot",
      "breadcrumb"
    );
  });

  it("has aria-label 'breadcrumb'", () => {
    render(<Breadcrumb>Content</Breadcrumb>);
    expect(
      screen.getByRole("navigation", { name: "breadcrumb" })
    ).toBeInTheDocument();
  });

  it("forwards additional props", () => {
    render(
      <Breadcrumb data-testid="breadcrumb" id="my-breadcrumb">
        Content
      </Breadcrumb>
    );
    expect(screen.getByTestId("breadcrumb")).toHaveAttribute(
      "id",
      "my-breadcrumb"
    );
  });
});

// =============================================================================
// BreadcrumbList
// =============================================================================
describe("BreadcrumbList", () => {
  it("renders an ol element", () => {
    render(<BreadcrumbList data-testid="list">Items</BreadcrumbList>);
    expect(screen.getByTestId("list").tagName).toBe("OL");
  });

  it("has data-slot attribute", () => {
    render(<BreadcrumbList data-testid="list">Items</BreadcrumbList>);
    expect(screen.getByTestId("list")).toHaveAttribute(
      "data-slot",
      "breadcrumb-list"
    );
  });

  it("forwards className", () => {
    render(
      <BreadcrumbList className="custom-list" data-testid="list">
        Items
      </BreadcrumbList>
    );
    expect(screen.getByTestId("list")).toHaveClass("custom-list");
  });
});

// =============================================================================
// BreadcrumbItem
// =============================================================================
describe("BreadcrumbItem", () => {
  it("renders an li element", () => {
    render(<BreadcrumbItem data-testid="item">Item</BreadcrumbItem>);
    expect(screen.getByTestId("item").tagName).toBe("LI");
  });

  it("has data-slot attribute", () => {
    render(<BreadcrumbItem data-testid="item">Item</BreadcrumbItem>);
    expect(screen.getByTestId("item")).toHaveAttribute(
      "data-slot",
      "breadcrumb-item"
    );
  });

  it("forwards className", () => {
    render(
      <BreadcrumbItem className="custom-item" data-testid="item">
        Item
      </BreadcrumbItem>
    );
    expect(screen.getByTestId("item")).toHaveClass("custom-item");
  });
});

// =============================================================================
// BreadcrumbLink
// =============================================================================
describe("BreadcrumbLink", () => {
  it("renders an anchor element by default", () => {
    render(<BreadcrumbLink href="/home">Home</BreadcrumbLink>);
    const link = screen.getByText("Home");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/home");
  });

  it("has data-slot attribute", () => {
    render(<BreadcrumbLink href="/home">Home</BreadcrumbLink>);
    expect(screen.getByText("Home")).toHaveAttribute(
      "data-slot",
      "breadcrumb-link"
    );
  });

  it("forwards className", () => {
    render(
      <BreadcrumbLink className="custom-link" href="/home">
        Home
      </BreadcrumbLink>
    );
    expect(screen.getByText("Home")).toHaveClass("custom-link");
  });
});

// =============================================================================
// BreadcrumbPage
// =============================================================================
describe("BreadcrumbPage", () => {
  it("renders a span element", () => {
    render(<BreadcrumbPage>Current Page</BreadcrumbPage>);
    const page = screen.getByText("Current Page");
    expect(page.tagName).toBe("SPAN");
  });

  it("has data-slot attribute", () => {
    render(<BreadcrumbPage>Current Page</BreadcrumbPage>);
    expect(screen.getByText("Current Page")).toHaveAttribute(
      "data-slot",
      "breadcrumb-page"
    );
  });

  it("has aria-current='page'", () => {
    render(<BreadcrumbPage>Current Page</BreadcrumbPage>);
    expect(screen.getByText("Current Page")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("has role='link'", () => {
    render(<BreadcrumbPage>Current Page</BreadcrumbPage>);
    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("forwards className", () => {
    render(
      <BreadcrumbPage className="custom-page">Current Page</BreadcrumbPage>
    );
    expect(screen.getByText("Current Page")).toHaveClass("custom-page");
  });
});

// =============================================================================
// BreadcrumbSeparator
// =============================================================================
describe("BreadcrumbSeparator", () => {
  it("renders an li element", () => {
    render(<BreadcrumbSeparator data-testid="separator" />);
    expect(screen.getByTestId("separator").tagName).toBe("LI");
  });

  it("has data-slot attribute", () => {
    render(<BreadcrumbSeparator data-testid="separator" />);
    expect(screen.getByTestId("separator")).toHaveAttribute(
      "data-slot",
      "breadcrumb-separator"
    );
  });

  it("has aria-hidden='true'", () => {
    render(<BreadcrumbSeparator data-testid="separator" />);
    expect(screen.getByTestId("separator")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("has role='presentation'", () => {
    render(<BreadcrumbSeparator data-testid="separator" />);
    expect(screen.getByTestId("separator")).toHaveAttribute(
      "role",
      "presentation"
    );
  });

  it("renders default chevron icon when no children", () => {
    render(<BreadcrumbSeparator data-testid="separator" />);
    const svg = screen.getByTestId("separator").querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders custom children instead of default icon", () => {
    render(
      <BreadcrumbSeparator data-testid="separator">/</BreadcrumbSeparator>
    );
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("forwards className", () => {
    render(
      <BreadcrumbSeparator
        className="custom-separator"
        data-testid="separator"
      />
    );
    expect(screen.getByTestId("separator")).toHaveClass("custom-separator");
  });
});

// =============================================================================
// BreadcrumbEllipsis
// =============================================================================
describe("BreadcrumbEllipsis", () => {
  it("renders with 'More' screen-reader text", () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" />);
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" />);
    expect(screen.getByTestId("ellipsis")).toHaveAttribute(
      "data-slot",
      "breadcrumb-ellipsis"
    );
  });

  it("has aria-hidden='true'", () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" />);
    expect(screen.getByTestId("ellipsis")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("has role='presentation'", () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" />);
    expect(screen.getByTestId("ellipsis")).toHaveAttribute(
      "role",
      "presentation"
    );
  });

  it("forwards className", () => {
    render(
      <BreadcrumbEllipsis className="custom-ellipsis" data-testid="ellipsis" />
    );
    expect(screen.getByTestId("ellipsis")).toHaveClass("custom-ellipsis");
  });
});

// =============================================================================
// Composition
// =============================================================================
describe("Breadcrumb composition", () => {
  it("renders a full breadcrumb navigation", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current Product</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(
      screen.getByRole("navigation", { name: "breadcrumb" })
    ).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Current Product")).toBeInTheDocument();
  });
});
