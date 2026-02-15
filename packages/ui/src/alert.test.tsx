import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "./alert";

// =============================================================================
// Alert
// =============================================================================
describe("Alert", () => {
  it("renders with children content", () => {
    render(<Alert>Alert content</Alert>);
    expect(screen.getByText("Alert content")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<Alert>Content</Alert>);
    expect(screen.getByRole("alert")).toHaveAttribute("data-slot", "alert");
  });

  it("has role='alert'", () => {
    render(<Alert>Content</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("forwards className", () => {
    render(<Alert className="custom-alert">Content</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("custom-alert");
  });

  it("renders with default variant", () => {
    render(<Alert>Default alert</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass("border-border-muted");
  });

  it("renders with success variant", () => {
    render(<Alert variant="success">Success alert</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("bg-green-500/15");
  });

  it("renders with warning variant", () => {
    render(<Alert variant="warning">Warning alert</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("bg-yellow-500/15");
  });

  it("renders with error variant", () => {
    render(<Alert variant="error">Error alert</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("bg-red-500/15");
  });

  it("renders with info variant", () => {
    render(<Alert variant="info">Info alert</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("bg-blue-500/15");
  });

  it("forwards additional props", () => {
    render(<Alert aria-describedby="desc">Content</Alert>);
    expect(screen.getByRole("alert")).toHaveAttribute(
      "aria-describedby",
      "desc"
    );
  });
});

// =============================================================================
// AlertTitle
// =============================================================================
describe("AlertTitle", () => {
  it("renders with children content", () => {
    render(<AlertTitle>Alert Title</AlertTitle>);
    expect(screen.getByText("Alert Title")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<AlertTitle data-testid="alert-title">Title</AlertTitle>);
    expect(screen.getByTestId("alert-title")).toHaveAttribute(
      "data-slot",
      "alert-title"
    );
  });

  it("forwards className", () => {
    render(
      <AlertTitle className="custom-title" data-testid="alert-title">
        Title
      </AlertTitle>
    );
    expect(screen.getByTestId("alert-title")).toHaveClass("custom-title");
  });
});

// =============================================================================
// AlertDescription
// =============================================================================
describe("AlertDescription", () => {
  it("renders with children content", () => {
    render(<AlertDescription>Alert description text</AlertDescription>);
    expect(screen.getByText("Alert description text")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <AlertDescription data-testid="alert-desc">Description</AlertDescription>
    );
    expect(screen.getByTestId("alert-desc")).toHaveAttribute(
      "data-slot",
      "alert-description"
    );
  });

  it("forwards className", () => {
    render(
      <AlertDescription className="custom-desc" data-testid="alert-desc">
        Description
      </AlertDescription>
    );
    expect(screen.getByTestId("alert-desc")).toHaveClass("custom-desc");
  });
});

// =============================================================================
// AlertAction
// =============================================================================
describe("AlertAction", () => {
  it("renders with children content", () => {
    render(<AlertAction>Close</AlertAction>);
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<AlertAction data-testid="alert-action">Close</AlertAction>);
    expect(screen.getByTestId("alert-action")).toHaveAttribute(
      "data-slot",
      "alert-action"
    );
  });

  it("forwards className", () => {
    render(
      <AlertAction className="custom-action" data-testid="alert-action">
        Close
      </AlertAction>
    );
    expect(screen.getByTestId("alert-action")).toHaveClass("custom-action");
  });
});

// =============================================================================
// Composition
// =============================================================================
describe("Alert composition", () => {
  it("renders a full alert with all sub-components", () => {
    render(
      <Alert variant="info">
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>This is an informational alert.</AlertDescription>
        <AlertAction>
          <button type="button">Dismiss</button>
        </AlertAction>
      </Alert>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Heads up!")).toBeInTheDocument();
    expect(
      screen.getByText("This is an informational alert.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });
});
