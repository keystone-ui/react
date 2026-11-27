import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

// =============================================================================
// Button
// =============================================================================
describe("Button", () => {
  it("renders with children content", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Click me
      </Button>
    );

    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies disabled attribute", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  // A loading button can't be pressed but stays in the tab order, so a
  // keyboard or screen reader user who pressed it keeps their place.
  it("is unavailable but still focusable while loading", () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toHaveAttribute("disabled");
    button.focus();
    expect(button).toHaveFocus();
  });

  it("ignores clicks and Enter while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        Save
      </Button>
    );
    const button = screen.getByRole("button");
    await user.click(button);
    button.focus();
    await user.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps focus when a focused button starts loading", () => {
    const { rerender } = render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    button.focus();
    rerender(<Button isLoading>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  });

  it("stays natively disabled when also disabled", () => {
    render(
      <Button disabled isLoading>
        Save
      </Button>
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("can opt out of staying focusable while loading", () => {
    render(
      <Button focusableWhenDisabled={false} isLoading>
        Save
      </Button>
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows loading indicator when isLoading", () => {
    render(<Button isLoading>Save</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-loading", "true");
  });

  // The name is only computed for real in a browser, where the hidden label's
  // CSS applies: `button.stories.tsx` (LoadingNames) proves it there. jsdom
  // loads no stylesheet, so here only the attributes are pinned.
  // No aria-busy: JAWS can hide the contents of a busy element, taking the
  // button's name with it.
  it("keeps its label's name while loading and is never marked busy", () => {
    render(<Button isLoading>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).not.toHaveAttribute("aria-busy");
  });

  it("a loading icon-only button keeps its explicit aria-label", () => {
    render(
      <Button aria-label="Add item" isLoading size="icon">
        <svg aria-hidden="true" />
      </Button>
    );
    const button = screen.getByRole("button", { name: "Add item" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toHaveAttribute("aria-busy");
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Test</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("passes href attribute when provided", () => {
    render(<Button href="https://example.com">Link</Button>);
    const button = screen.getByRole("button", { name: "Link" });
    expect(button).toHaveAttribute("href", "https://example.com");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Test</Button>);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
  });
});

// =============================================================================
// Button variants
// =============================================================================
describe("Button variants", () => {
  it("applies default variant classes", () => {
    render(<Button variant="default">Default</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary");
  });

  it("applies secondary variant classes", () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary");
  });

  it("applies destructive variant classes", () => {
    render(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");
  });

  it("applies ghost variant classes", () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-transparent");
  });

  it("applies outline variant classes", () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveClass("border");
  });

  it("applies link variant classes", () => {
    render(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button")).toHaveClass("underline-offset-4");
  });
});

// =============================================================================
// Button sizes
// =============================================================================
describe("Button sizes", () => {
  it("applies default size", () => {
    render(<Button size="default">Default</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      "h-(--ks-control-md,2.5rem)"
    );
  });

  it("applies xs size", () => {
    render(<Button size="xs">XS</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      "h-(--ks-control-xs,1.5rem)"
    );
  });

  it("applies sm size", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-(--ks-control-sm,2rem)");
  });

  it("applies lg size", () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-(--ks-control-lg,3rem)");
  });

  it("applies icon size", () => {
    render(<Button size="icon">Icon</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      "size-(--ks-control-md,2.5rem)"
    );
  });
});
