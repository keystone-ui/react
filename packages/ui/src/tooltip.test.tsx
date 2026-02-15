import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

function renderTooltip() {
  return render(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// =============================================================================
// Tooltip
// =============================================================================
describe("Tooltip", () => {
  it("renders the trigger", () => {
    renderTooltip();
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("does not show content by default", () => {
    renderTooltip();
    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("shows content on hover", async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.hover(screen.getByText("Hover me"));

    await waitFor(() => {
      expect(screen.getByText("Tooltip text")).toBeInTheDocument();
    });
  });

  it("hides content on unhover", async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.hover(screen.getByText("Hover me"));
    await waitFor(() => {
      expect(screen.getByText("Tooltip text")).toBeInTheDocument();
    });

    await user.unhover(screen.getByText("Hover me"));
    await waitFor(() => {
      expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
    });
  });

  it("has data-slot attributes on trigger", () => {
    renderTooltip();
    expect(screen.getByText("Hover me")).toHaveAttribute(
      "data-slot",
      "tooltip-trigger"
    );
  });

  it("shows content when open prop is true", async () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Visible tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Visible tooltip")).toBeInTheDocument();
    });
  });
});
