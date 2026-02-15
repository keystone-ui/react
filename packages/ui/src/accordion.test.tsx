import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "./accordion";

// =============================================================================
// Accordion (root)
// =============================================================================
describe("Accordion", () => {
  it("renders with basic content", () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    expect(
      screen.getByRole("button", { name: "Trigger 1" })
    ).toBeInTheDocument();
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("expands/collapses when clicked", async () => {
    const user = userEvent.setup();

    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: "Trigger 1" });
    const item = trigger.closest("[data-closed]");

    expect(item).toHaveAttribute("data-closed");

    await user.click(trigger);
    expect(item).not.toHaveAttribute("data-closed");

    await user.click(trigger);
    expect(item).toHaveAttribute("data-closed");
  });

  it("supports multiple items open when openMultiple is true", async () => {
    const user = userEvent.setup();

    render(
      <Accordion multiple>
        <AccordionItem data-testid="item-1" value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
        <AccordionItem data-testid="item-2" value="item-2">
          <AccordionHeader>
            <AccordionTrigger>Trigger 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 2</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByRole("button", { name: "Trigger 1" });
    const trigger2 = screen.getByRole("button", { name: "Trigger 2" });

    await user.click(trigger1);
    await user.click(trigger2);

    const item1 = screen.getByTestId("item-1");
    const item2 = screen.getByTestId("item-2");

    expect(item1).toHaveAttribute("data-open");
    expect(item2).toHaveAttribute("data-open");
  });

  it("renders with custom chevron icon", () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger chevronIcon={<span>▼</span>}>
              Custom Chevron
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText("▼")).toBeInTheDocument();
  });

  it("applies variant styles correctly", () => {
    render(
      <Accordion variant="box">
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Box Variant</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const item = screen
      .getByRole("button", { name: "Box Variant" })
      .closest('[class*="rounded-lg"]');
    expect(item).toBeInTheDocument();
  });

  it("closes other items when openMultiple is false", async () => {
    const user = userEvent.setup();

    render(
      <Accordion openMultiple={false}>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionHeader>
            <AccordionTrigger>Trigger 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 2</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByRole("button", { name: "Trigger 1" });
    const trigger2 = screen.getByRole("button", { name: "Trigger 2" });
    const item1 = trigger1.closest("[data-closed]");
    const item2 = trigger2.closest("[data-closed]");

    await user.click(trigger1);
    expect(item1).not.toHaveAttribute("data-closed");

    await user.click(trigger2);
    expect(item2).not.toHaveAttribute("data-closed");
    expect(item1).toHaveAttribute("data-closed");
  });

  it("respects defaultValue prop", () => {
    render(
      <Accordion defaultValue={["item-2"]}>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionHeader>
            <AccordionTrigger>Trigger 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 2</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByRole("button", { name: "Trigger 1" });

    const item1 = trigger1.closest("[data-closed]");
    expect(item1).toHaveAttribute("data-closed");

    const panel2 = screen.getByText("Content 2");
    expect(panel2).toBeVisible();
  });

  it("calls onValueChange when item is toggled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Accordion onValueChange={onValueChange}>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: "Trigger 1" });

    await user.click(trigger);
    expect(onValueChange).toHaveBeenCalledWith(["item-1"], expect.anything());

    await user.click(trigger);
    expect(onValueChange).toHaveBeenCalledWith([], expect.anything());
  });

  it("respects disabled prop on accordion", () => {
    render(
      <Accordion disabled>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: "Trigger 1" });
    expect(trigger).toHaveAttribute("aria-disabled", "true");
  });

  it("respects disabled prop on accordion item", () => {
    render(
      <Accordion>
        <AccordionItem disabled value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 1</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionHeader>
            <AccordionTrigger>Trigger 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Content 2</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByRole("button", { name: "Trigger 1" });
    const trigger2 = screen.getByRole("button", { name: "Trigger 2" });

    expect(trigger1).toHaveAttribute("aria-disabled", "true");
    expect(trigger2).toHaveAttribute("aria-disabled", "false");
  });
});

// =============================================================================
// AccordionItem
// =============================================================================
describe("AccordionItem", () => {
  it("renders with correct value", () => {
    render(
      <Accordion defaultValue={["test-item"]}>
        <AccordionItem data-testid="accordion-item" value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const panel = screen.getByText("Test Content");
    expect(panel).toBeVisible();

    const item = screen.getByTestId("accordion-item");
    expect(item).not.toHaveAttribute("data-closed");
  });

  it("applies custom className", () => {
    render(
      <Accordion>
        <AccordionItem className="custom-class" value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const item = screen
      .getByRole("button", { name: "Test Trigger" })
      .closest(".custom-class");
    expect(item).toBeInTheDocument();
  });

  it("renders with disabled state", () => {
    render(
      <Accordion>
        <AccordionItem disabled value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: "Test Trigger" });
    expect(trigger).toHaveAttribute("aria-disabled", "true");
  });

  it("applies box variant styles correctly", () => {
    render(
      <Accordion variant="box">
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const item = screen
      .getByRole("button", { name: "Test Trigger" })
      .closest('[class*="rounded-lg"]');
    expect(item).toBeInTheDocument();
  });

  it("applies underline variant styles correctly", () => {
    render(
      <Accordion variant="underline">
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const item = screen
      .getByRole("button", { name: "Test Trigger" })
      .closest('[class*="border-b"]');
    expect(item).toBeInTheDocument();
  });
});

// =============================================================================
// AccordionHeader
// =============================================================================
describe("AccordionHeader", () => {
  it("renders with children content", () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    expect(
      screen.getByRole("button", { name: "Test Trigger" })
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader className="custom-header-class">
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const header = screen
      .getByRole("button", { name: "Test Trigger" })
      .closest(".custom-header-class");
    expect(header).toBeInTheDocument();
  });

  it("renders with correct structure", () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader data-testid="accordion-header">
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const header = screen.getByTestId("accordion-header");
    expect(header).toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: "Test Trigger" });
    expect(header).toContainElement(trigger);
  });

  it("contains the trigger element", () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader data-testid="accordion-header">
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const header = screen.getByTestId("accordion-header");
    const trigger = screen.getByRole("button", { name: "Test Trigger" });

    expect(header).toContainElement(trigger);
  });
});

// =============================================================================
// AccordionTrigger
// =============================================================================
describe("AccordionTrigger", () => {
  it("renders with children content", () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    expect(
      screen.getByRole("button", { name: "Test Trigger" })
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger className="custom-trigger-class">
              Test Trigger
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: "Test Trigger" });
    expect(trigger).toHaveClass("custom-trigger-class");
  });

  it("renders with custom chevron icon", () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger
              chevronIcon={<span data-testid="custom-icon">▼</span>}
            >
              Test Trigger
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("toggles accordion item when clicked", async () => {
    const user = userEvent.setup();

    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: "Test Trigger" });
    const item = trigger.closest("[data-closed]");

    expect(item).toHaveAttribute("data-closed");

    await user.click(trigger);
    expect(item).not.toHaveAttribute("data-closed");
  });

  it("renders with empty string as chevron icon", () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger chevronIcon={<></>}>
              Test Trigger
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: "Test Trigger" });
    const svgElements = trigger.querySelectorAll("svg");
    expect(svgElements.length).toBe(0);
  });
});

// =============================================================================
// AccordionPanel
// =============================================================================
describe("AccordionPanel", () => {
  it("renders with children content", () => {
    render(
      <Accordion defaultValue={["test-item"]}>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Panel Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText("Test Panel Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Accordion defaultValue={["test-item"]}>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel className="custom-panel-class">
            Test Panel Content
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const panel = screen
      .getByText("Test Panel Content")
      .closest(".custom-panel-class");
    expect(panel).toBeInTheDocument();
  });

  it("is hidden when accordion item is closed", () => {
    render(
      <Accordion>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Panel Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: "Test Trigger" });
    const item = trigger.closest("[data-closed]");
    expect(item).toBeInTheDocument();

    // Panel uses keepMounted — content stays in DOM but the panel has
    // the hidden attribute and data-closed when collapsed.
    const panel = screen
      .getByText("Test Panel Content")
      .closest("[data-closed]");
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute("hidden");
  });

  it("is visible when accordion item is open", () => {
    render(
      <Accordion defaultValue={["test-item"]}>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Panel Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const panel = screen.getByText("Test Panel Content");
    expect(panel).toBeVisible();
  });

  it("has the correct ARIA attributes", () => {
    render(
      <Accordion defaultValue={["test-item"]}>
        <AccordionItem value="test-item">
          <AccordionHeader>
            <AccordionTrigger>Test Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Test Panel Content</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );

    const panelContent = screen.getByText("Test Panel Content");
    const panel = panelContent.closest('[role="region"][aria-labelledby]');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute("aria-labelledby");
  });
});
