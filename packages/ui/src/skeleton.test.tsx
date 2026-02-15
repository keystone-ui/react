import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton, SkeletonGroup } from "./skeleton";

// =============================================================================
// Skeleton
// =============================================================================
describe("Skeleton", () => {
  it("renders a div element", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("skeleton").tagName).toBe("DIV");
  });

  it("has data-slot attribute", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveAttribute(
      "data-slot",
      "skeleton"
    );
  });

  it("applies custom className", () => {
    render(<Skeleton className="custom-class" data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("custom-class");
  });

  it("has pulse animation by default", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("animate-pulse");
  });

  it("removes animation when animationType is none", () => {
    render(<Skeleton animationType="none" data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).not.toHaveClass("animate-pulse");
  });

  it("has base styling classes", () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId("skeleton");
    expect(el).toHaveClass("rounded-md");
    expect(el).toHaveClass("bg-accent");
  });

  it("renders children content", () => {
    render(<Skeleton>Loading content</Skeleton>);
    expect(screen.getByText("Loading content")).toBeInTheDocument();
  });

  it("forwards additional HTML attributes", () => {
    render(<Skeleton aria-label="Loading" data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveAttribute(
      "aria-label",
      "Loading"
    );
  });
});

// =============================================================================
// SkeletonGroup
// =============================================================================
describe("SkeletonGroup", () => {
  it("renders a div element", () => {
    render(<SkeletonGroup data-testid="skeleton-group" />);
    expect(screen.getByTestId("skeleton-group")).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-group").tagName).toBe("DIV");
  });

  it("has data-slot attribute", () => {
    render(<SkeletonGroup data-testid="skeleton-group" />);
    expect(screen.getByTestId("skeleton-group")).toHaveAttribute(
      "data-slot",
      "skeleton-group"
    );
  });

  it("applies custom className", () => {
    render(
      <SkeletonGroup className="custom-class" data-testid="skeleton-group" />
    );
    expect(screen.getByTestId("skeleton-group")).toHaveClass("custom-class");
  });

  it("renders children content", () => {
    render(
      <SkeletonGroup>
        <Skeleton data-testid="child" />
      </SkeletonGroup>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("has overflow hidden styling", () => {
    render(<SkeletonGroup data-testid="skeleton-group" />);
    expect(screen.getByTestId("skeleton-group")).toHaveClass("overflow-hidden");
  });
});
