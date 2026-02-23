import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

// =============================================================================
// Card
// =============================================================================
describe("Card", () => {
  it("renders with children content", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "card");
  });

  it("forwards className", () => {
    render(
      <Card className="custom-class" data-testid="card">
        Content
      </Card>
    );
    expect(screen.getByTestId("card")).toHaveClass("custom-class");
  });

  it("defaults to size 'md'", () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId("card")).toHaveAttribute("data-size", "md");
  });

  it("applies size 'sm' via data-size attribute", () => {
    render(
      <Card data-testid="card" size="sm">
        Content
      </Card>
    );
    expect(screen.getByTestId("card")).toHaveAttribute("data-size", "sm");
  });

  it("applies size 'xs' via data-size attribute", () => {
    render(
      <Card data-testid="card" size="xs">
        Content
      </Card>
    );
    expect(screen.getByTestId("card")).toHaveAttribute("data-size", "xs");
  });

  it("forwards additional props", () => {
    render(
      <Card aria-label="Test card" data-testid="card">
        Content
      </Card>
    );
    expect(screen.getByTestId("card")).toHaveAttribute(
      "aria-label",
      "Test card"
    );
  });
});

// =============================================================================
// CardHeader
// =============================================================================
describe("CardHeader", () => {
  it("renders with children content", () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText("Header content")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<CardHeader data-testid="card-header">Header</CardHeader>);
    expect(screen.getByTestId("card-header")).toHaveAttribute(
      "data-slot",
      "card-header"
    );
  });

  it("forwards className", () => {
    render(
      <CardHeader className="custom-header" data-testid="card-header">
        Header
      </CardHeader>
    );
    expect(screen.getByTestId("card-header")).toHaveClass("custom-header");
  });
});

// =============================================================================
// CardTitle
// =============================================================================
describe("CardTitle", () => {
  it("renders with children content", () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<CardTitle data-testid="card-title">Title</CardTitle>);
    expect(screen.getByTestId("card-title")).toHaveAttribute(
      "data-slot",
      "card-title"
    );
  });

  it("forwards className", () => {
    render(
      <CardTitle className="custom-title" data-testid="card-title">
        Title
      </CardTitle>
    );
    expect(screen.getByTestId("card-title")).toHaveClass("custom-title");
  });
});

// =============================================================================
// CardDescription
// =============================================================================
describe("CardDescription", () => {
  it("renders with children content", () => {
    render(<CardDescription>A description</CardDescription>);
    expect(screen.getByText("A description")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <CardDescription data-testid="card-description">Desc</CardDescription>
    );
    expect(screen.getByTestId("card-description")).toHaveAttribute(
      "data-slot",
      "card-description"
    );
  });

  it("forwards className", () => {
    render(
      <CardDescription className="custom-desc" data-testid="card-description">
        Desc
      </CardDescription>
    );
    expect(screen.getByTestId("card-description")).toHaveClass("custom-desc");
  });
});

// =============================================================================
// CardAction
// =============================================================================
describe("CardAction", () => {
  it("renders with children content", () => {
    render(<CardAction>Action</CardAction>);
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<CardAction data-testid="card-action">Action</CardAction>);
    expect(screen.getByTestId("card-action")).toHaveAttribute(
      "data-slot",
      "card-action"
    );
  });

  it("forwards className", () => {
    render(
      <CardAction className="custom-action" data-testid="card-action">
        Action
      </CardAction>
    );
    expect(screen.getByTestId("card-action")).toHaveClass("custom-action");
  });
});

// =============================================================================
// CardContent
// =============================================================================
describe("CardContent", () => {
  it("renders with children content", () => {
    render(<CardContent>Main content</CardContent>);
    expect(screen.getByText("Main content")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<CardContent data-testid="card-content">Content</CardContent>);
    expect(screen.getByTestId("card-content")).toHaveAttribute(
      "data-slot",
      "card-content"
    );
  });

  it("forwards className", () => {
    render(
      <CardContent className="custom-content" data-testid="card-content">
        Content
      </CardContent>
    );
    expect(screen.getByTestId("card-content")).toHaveClass("custom-content");
  });
});

// =============================================================================
// CardFooter
// =============================================================================
describe("CardFooter", () => {
  it("renders with children content", () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
    expect(screen.getByTestId("card-footer")).toHaveAttribute(
      "data-slot",
      "card-footer"
    );
  });

  it("forwards className", () => {
    render(
      <CardFooter className="custom-footer" data-testid="card-footer">
        Footer
      </CardFooter>
    );
    expect(screen.getByTestId("card-footer")).toHaveClass("custom-footer");
  });
});

// =============================================================================
// Composition
// =============================================================================
describe("Card composition", () => {
  it("renders a full card with all sub-components", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
