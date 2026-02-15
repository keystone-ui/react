import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";

// =============================================================================
// Empty
// =============================================================================
describe("Empty", () => {
  it("renders a div element", () => {
    render(<Empty data-testid="empty" />);
    expect(screen.getByTestId("empty")).toBeInTheDocument();
    expect(screen.getByTestId("empty").tagName).toBe("DIV");
  });

  it("has data-slot attribute", () => {
    render(<Empty data-testid="empty" />);
    expect(screen.getByTestId("empty")).toHaveAttribute("data-slot", "empty");
  });

  it("applies custom className", () => {
    render(<Empty className="custom-class" data-testid="empty" />);
    expect(screen.getByTestId("empty")).toHaveClass("custom-class");
  });

  it("renders children content", () => {
    render(<Empty>No data available</Empty>);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("has base styling classes", () => {
    render(<Empty data-testid="empty" />);
    const el = screen.getByTestId("empty");
    expect(el).toHaveClass("flex");
    expect(el).toHaveClass("flex-col");
    expect(el).toHaveClass("items-center");
    expect(el).toHaveClass("justify-center");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<Empty data-testid="empty" ref={ref} />);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards additional HTML attributes", () => {
    render(<Empty aria-label="Empty state" data-testid="empty" />);
    expect(screen.getByTestId("empty")).toHaveAttribute(
      "aria-label",
      "Empty state"
    );
  });
});

// =============================================================================
// EmptyHeader
// =============================================================================
describe("EmptyHeader", () => {
  it("renders a div element", () => {
    render(<EmptyHeader data-testid="header" />);
    expect(screen.getByTestId("header").tagName).toBe("DIV");
  });

  it("has data-slot attribute", () => {
    render(<EmptyHeader data-testid="header" />);
    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-slot",
      "empty-header"
    );
  });

  it("applies custom className", () => {
    render(<EmptyHeader className="custom-class" data-testid="header" />);
    expect(screen.getByTestId("header")).toHaveClass("custom-class");
  });

  it("renders children content", () => {
    render(
      <EmptyHeader>
        <EmptyTitle>Title</EmptyTitle>
      </EmptyHeader>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<EmptyHeader data-testid="header" ref={ref} />);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});

// =============================================================================
// EmptyMedia
// =============================================================================
describe("EmptyMedia", () => {
  it("renders a div element", () => {
    render(<EmptyMedia data-testid="media" />);
    expect(screen.getByTestId("media").tagName).toBe("DIV");
  });

  it("has data-slot attribute", () => {
    render(<EmptyMedia data-testid="media" />);
    expect(screen.getByTestId("media")).toHaveAttribute(
      "data-slot",
      "empty-icon"
    );
  });

  it("applies custom className", () => {
    render(<EmptyMedia className="custom-class" data-testid="media" />);
    expect(screen.getByTestId("media")).toHaveClass("custom-class");
  });

  it("applies default variant", () => {
    render(<EmptyMedia data-testid="media" />);
    expect(screen.getByTestId("media")).toHaveAttribute(
      "data-variant",
      "default"
    );
  });

  it("applies icon variant", () => {
    render(<EmptyMedia data-testid="media" variant="icon" />);
    const el = screen.getByTestId("media");
    expect(el).toHaveAttribute("data-variant", "icon");
    expect(el).toHaveClass("rounded-lg");
    expect(el).toHaveClass("bg-muted");
  });

  it("renders children content", () => {
    render(
      <EmptyMedia>
        <span>Icon</span>
      </EmptyMedia>
    );
    expect(screen.getByText("Icon")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<EmptyMedia data-testid="media" ref={ref} />);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});

// =============================================================================
// EmptyTitle
// =============================================================================
describe("EmptyTitle", () => {
  it("renders a div element", () => {
    render(<EmptyTitle>Title</EmptyTitle>);
    expect(screen.getByText("Title").tagName).toBe("DIV");
  });

  it("has data-slot attribute", () => {
    render(<EmptyTitle>Title</EmptyTitle>);
    expect(screen.getByText("Title")).toHaveAttribute(
      "data-slot",
      "empty-title"
    );
  });

  it("applies custom className", () => {
    render(<EmptyTitle className="custom-class">Title</EmptyTitle>);
    expect(screen.getByText("Title")).toHaveClass("custom-class");
  });

  it("renders text content", () => {
    render(<EmptyTitle>No results found</EmptyTitle>);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("has font-medium styling", () => {
    render(<EmptyTitle>Title</EmptyTitle>);
    expect(screen.getByText("Title")).toHaveClass("font-medium");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<EmptyTitle ref={ref}>Title</EmptyTitle>);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});

// =============================================================================
// EmptyDescription
// =============================================================================
describe("EmptyDescription", () => {
  it("renders a div element", () => {
    render(<EmptyDescription>Description text</EmptyDescription>);
    expect(screen.getByText("Description text").tagName).toBe("DIV");
  });

  it("has data-slot attribute", () => {
    render(<EmptyDescription>Description</EmptyDescription>);
    expect(screen.getByText("Description")).toHaveAttribute(
      "data-slot",
      "empty-description"
    );
  });

  it("applies custom className", () => {
    render(
      <EmptyDescription className="custom-class">Description</EmptyDescription>
    );
    expect(screen.getByText("Description")).toHaveClass("custom-class");
  });

  it("renders text content", () => {
    render(
      <EmptyDescription>Try adjusting your search filters.</EmptyDescription>
    );
    expect(
      screen.getByText("Try adjusting your search filters.")
    ).toBeInTheDocument();
  });

  it("has muted foreground text", () => {
    render(<EmptyDescription>Description</EmptyDescription>);
    expect(screen.getByText("Description")).toHaveClass(
      "text-muted-foreground"
    );
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<EmptyDescription ref={ref}>Description</EmptyDescription>);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});

// =============================================================================
// EmptyContent
// =============================================================================
describe("EmptyContent", () => {
  it("renders a div element", () => {
    render(<EmptyContent data-testid="content" />);
    expect(screen.getByTestId("content").tagName).toBe("DIV");
  });

  it("has data-slot attribute", () => {
    render(<EmptyContent data-testid="content" />);
    expect(screen.getByTestId("content")).toHaveAttribute(
      "data-slot",
      "empty-content"
    );
  });

  it("applies custom className", () => {
    render(<EmptyContent className="custom-class" data-testid="content" />);
    expect(screen.getByTestId("content")).toHaveClass("custom-class");
  });

  it("renders children content", () => {
    render(
      <EmptyContent>
        <button type="button">Add item</button>
      </EmptyContent>
    );
    expect(
      screen.getByRole("button", { name: "Add item" })
    ).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<EmptyContent data-testid="content" ref={ref} />);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});

// =============================================================================
// Full Empty composition
// =============================================================================
describe("Empty composition", () => {
  it("renders a complete empty state with all parts", () => {
    render(
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <span>📭</span>
          </EmptyMedia>
          <EmptyTitle>No messages</EmptyTitle>
          <EmptyDescription>
            Your inbox is empty. New messages will appear here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <button type="button">Refresh</button>
        </EmptyContent>
      </Empty>
    );

    expect(screen.getByText("📭")).toBeInTheDocument();
    expect(screen.getByText("No messages")).toBeInTheDocument();
    expect(
      screen.getByText("Your inbox is empty. New messages will appear here.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });
});
