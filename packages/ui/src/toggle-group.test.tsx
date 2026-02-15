import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

// =============================================================================
// ToggleGroup
// =============================================================================
describe("ToggleGroup", () => {
  it("renders with items", () => {
    render(
      <ToggleGroup>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
        <ToggleGroupItem value="c">C</ToggleGroupItem>
      </ToggleGroup>
    );

    expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "B" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "C" })).toBeInTheDocument();
  });

  it("has data-slot attributes", () => {
    render(
      <ToggleGroup>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );

    expect(screen.getByRole("group")).toHaveAttribute(
      "data-slot",
      "toggle-group"
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-slot",
      "toggle-group-item"
    );
  });

  it("selects an item on click", async () => {
    const user = userEvent.setup();

    render(
      <ToggleGroup>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );

    const itemA = screen.getByRole("button", { name: "A" });
    await user.click(itemA);

    expect(itemA).toHaveAttribute("aria-pressed", "true");
  });

  it("deselects an item when clicked again", async () => {
    const user = userEvent.setup();

    render(
      <ToggleGroup>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );

    const itemA = screen.getByRole("button", { name: "A" });
    await user.click(itemA);
    expect(itemA).toHaveAttribute("aria-pressed", "true");

    await user.click(itemA);
    expect(itemA).toHaveAttribute("aria-pressed", "false");
  });

  it("supports defaultValue", () => {
    render(
      <ToggleGroup defaultValue={["b"]}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );

    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByRole("button", { name: "B" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("calls onValueChange when selection changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <ToggleGroup onValueChange={onValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );

    await user.click(screen.getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(
      <ToggleGroup className="custom-class">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );

    expect(screen.getByRole("group")).toHaveClass("custom-class");
  });

  it("propagates variant to items via context", () => {
    render(
      <ToggleGroup variant="outline">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );

    expect(screen.getByRole("button")).toHaveClass("border");
  });

  it("propagates size to items via context", () => {
    render(
      <ToggleGroup size="sm">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );

    expect(screen.getByRole("button")).toHaveClass("h-8");
  });

  it("allows item-level variant override", () => {
    render(
      <ToggleGroup variant="default">
        <ToggleGroupItem value="a" variant="outline">
          A
        </ToggleGroupItem>
      </ToggleGroup>
    );

    expect(screen.getByRole("button")).toHaveClass("border");
  });
});
