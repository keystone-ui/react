import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

function renderPopover({ defaultOpen = false } = {}) {
  return render(
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger>Open Popover</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Popover Title</PopoverTitle>
          <PopoverDescription>Popover Description</PopoverDescription>
        </PopoverHeader>
        <p>Popover body</p>
        <PopoverClose>Close</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

// =============================================================================
// Popover
// =============================================================================
describe("Popover", () => {
  it("renders the trigger", () => {
    renderPopover();
    expect(screen.getByText("Open Popover")).toBeInTheDocument();
  });

  it("has data-slot on trigger", () => {
    renderPopover();
    expect(screen.getByText("Open Popover")).toHaveAttribute(
      "data-slot",
      "popover-trigger"
    );
  });

  it("does not show content when closed", () => {
    renderPopover();
    expect(screen.queryByText("Popover Title")).not.toBeInTheDocument();
  });

  it("opens when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByText("Open Popover"));

    await waitFor(() => {
      expect(screen.getByText("Popover Title")).toBeInTheDocument();
    });
  });

  it("shows all content parts when open", async () => {
    renderPopover({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Popover Title")).toBeInTheDocument();
      expect(screen.getByText("Popover Description")).toBeInTheDocument();
      expect(screen.getByText("Popover body")).toBeInTheDocument();
    });
  });

  it("has data-slot attributes on content parts", async () => {
    renderPopover({ defaultOpen: true });

    await waitFor(() => {
      expect(
        screen.getByText("Popover Title").closest("[data-slot='popover-title']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByText("Popover Description")
          .closest("[data-slot='popover-description']")
      ).toBeInTheDocument();
    });
  });

  it("closes when PopoverClose is clicked", async () => {
    const user = userEvent.setup();
    renderPopover({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Popover Title")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Close"));

    await waitFor(() => {
      expect(screen.queryByText("Popover Title")).not.toBeInTheDocument();
    });
  });
});
