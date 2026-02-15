import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Kbd, KbdGroup } from "./kbd";

// =============================================================================
// Kbd
// =============================================================================
describe("Kbd", () => {
  it("renders a kbd element", () => {
    render(<Kbd>⌘</Kbd>);
    const el = screen.getByText("⌘");
    expect(el).toBeInTheDocument();
    expect(el.tagName).toBe("KBD");
  });

  it("has data-slot attribute", () => {
    render(<Kbd>K</Kbd>);
    expect(screen.getByText("K")).toHaveAttribute("data-slot", "kbd");
  });

  it("renders keyboard shortcut text", () => {
    render(<Kbd>Ctrl+C</Kbd>);
    expect(screen.getByText("Ctrl+C")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Kbd className="custom-class">K</Kbd>);
    expect(screen.getByText("K")).toHaveClass("custom-class");
  });

  it("has base styling classes", () => {
    render(<Kbd>K</Kbd>);
    const el = screen.getByText("K");
    expect(el).toHaveClass("inline-flex");
    expect(el).toHaveClass("h-5");
    expect(el).toHaveClass("rounded-sm");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<Kbd ref={ref}>K</Kbd>);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
  });

  it("forwards additional HTML attributes", () => {
    render(
      <Kbd aria-label="keyboard shortcut" data-testid="kbd">
        K
      </Kbd>
    );
    expect(screen.getByTestId("kbd")).toHaveAttribute(
      "aria-label",
      "keyboard shortcut"
    );
  });
});

// =============================================================================
// KbdGroup
// =============================================================================
describe("KbdGroup", () => {
  it("renders a div element", () => {
    render(<KbdGroup data-testid="kbd-group" />);
    const el = screen.getByTestId("kbd-group");
    expect(el).toBeInTheDocument();
    expect(el.tagName).toBe("DIV");
  });

  it("has data-slot attribute", () => {
    render(<KbdGroup data-testid="kbd-group" />);
    expect(screen.getByTestId("kbd-group")).toHaveAttribute(
      "data-slot",
      "kbd-group"
    );
  });

  it("applies custom className", () => {
    render(<KbdGroup className="custom-class" data-testid="kbd-group" />);
    expect(screen.getByTestId("kbd-group")).toHaveClass("custom-class");
  });

  it("renders children content", () => {
    render(
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    );
    expect(screen.getByText("⌘")).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();
  });

  it("has inline-flex layout", () => {
    render(<KbdGroup data-testid="kbd-group" />);
    expect(screen.getByTestId("kbd-group")).toHaveClass("inline-flex");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<KbdGroup data-testid="kbd-group" ref={ref} />);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});
