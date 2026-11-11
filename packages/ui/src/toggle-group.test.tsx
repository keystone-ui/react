import { DirectionProvider } from "@base-ui/react/direction-provider";
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

    expect(screen.getByRole("button")).toHaveClass("h-(--ks-control-sm,2rem)");
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
  // Arrow-key roving focus follows `orientation`. Base UI only knows the
  // orientation if the prop reaches the primitive; `data-orientation` alone
  // changed the layout but left the arrows horizontal.
  describe("keyboard navigation", () => {
    function renderGroup(
      orientation?: "horizontal" | "vertical",
      wrap: (node: React.ReactNode) => React.ReactNode = (n) => n
    ) {
      render(
        wrap(
          <ToggleGroup orientation={orientation}>
            <ToggleGroupItem value="one">One</ToggleGroupItem>
            <ToggleGroupItem value="two">Two</ToggleGroupItem>
            <ToggleGroupItem value="three">Three</ToggleGroupItem>
          </ToggleGroup>
        )
      );
      return {
        one: screen.getByRole("button", { name: "One" }),
        two: screen.getByRole("button", { name: "Two" }),
      };
    }

    it("moves focus with ArrowDown and ArrowUp in a vertical group", async () => {
      const user = userEvent.setup();
      const { one, two } = renderGroup("vertical");

      one.focus();
      await user.keyboard("{ArrowDown}");
      expect(two).toHaveFocus();

      await user.keyboard("{ArrowUp}");
      expect(one).toHaveFocus();
    });

    it("ignores ArrowRight in a vertical group", async () => {
      const user = userEvent.setup();
      const { one } = renderGroup("vertical");

      one.focus();
      await user.keyboard("{ArrowRight}");
      expect(one).toHaveFocus();
    });

    it("moves focus with ArrowRight, not ArrowDown, in a horizontal group", async () => {
      const user = userEvent.setup();
      const { one, two } = renderGroup();

      one.focus();
      await user.keyboard("{ArrowDown}");
      expect(one).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(two).toHaveFocus();
    });

    it("mirrors horizontal arrows under dir=rtl", async () => {
      const user = userEvent.setup();
      const { one, two } = renderGroup("horizontal", (node) => (
        <DirectionProvider direction="rtl">
          <div dir="rtl">{node}</div>
        </DirectionProvider>
      ));

      one.focus();
      await user.keyboard("{ArrowLeft}");
      expect(two).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(one).toHaveFocus();
    });
  });
});
