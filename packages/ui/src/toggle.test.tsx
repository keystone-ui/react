import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Toggle } from "./toggle";

// =============================================================================
// Toggle
// =============================================================================
describe("Toggle", () => {
  it("renders with children content", () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "toggle");
  });

  it("toggles pressed state on click", async () => {
    const user = userEvent.setup();

    render(<Toggle aria-label="Bold">B</Toggle>);
    const toggle = screen.getByRole("button");

    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("can be controlled via pressed and onPressedChange", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();

    render(
      <Toggle
        aria-label="Bold"
        onPressedChange={onPressedChange}
        pressed={false}
      >
        B
      </Toggle>
    );

    const toggle = screen.getByRole("button");
    await user.click(toggle);

    expect(onPressedChange).toHaveBeenCalledOnce();
  });

  it("respects defaultPressed prop", () => {
    render(
      <Toggle aria-label="Bold" defaultPressed>
        B
      </Toggle>
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("respects disabled prop", () => {
    render(
      <Toggle aria-label="Bold" disabled>
        B
      </Toggle>
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();

    render(
      <Toggle aria-label="Bold" disabled>
        B
      </Toggle>
    );

    const toggle = screen.getByRole("button");
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("applies custom className", () => {
    render(
      <Toggle aria-label="Bold" className="custom-class">
        B
      </Toggle>
    );

    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });
});

// =============================================================================
// Toggle variants
// =============================================================================
describe("Toggle variants", () => {
  it("applies default variant", () => {
    render(
      <Toggle aria-label="Bold" variant="default">
        B
      </Toggle>
    );

    expect(screen.getByRole("button")).toHaveClass("bg-transparent");
  });

  it("applies outline variant", () => {
    render(
      <Toggle aria-label="Bold" variant="outline">
        B
      </Toggle>
    );

    expect(screen.getByRole("button")).toHaveClass("border");
  });
});

// =============================================================================
// Toggle sizes
// =============================================================================
describe("Toggle sizes", () => {
  it("applies default size", () => {
    render(
      <Toggle aria-label="Bold" size="default">
        B
      </Toggle>
    );

    expect(screen.getByRole("button")).toHaveClass("h-9");
  });

  it("applies sm size", () => {
    render(
      <Toggle aria-label="Bold" size="sm">
        B
      </Toggle>
    );

    expect(screen.getByRole("button")).toHaveClass("h-8");
  });

  it("applies lg size", () => {
    render(
      <Toggle aria-label="Bold" size="lg">
        B
      </Toggle>
    );

    expect(screen.getByRole("button")).toHaveClass("h-10");
  });
});
