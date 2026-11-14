import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

describe("CollapsibleContent className", () => {
  it("calls a function className with the panel state and merges its classes", async () => {
    const user = userEvent.setup();
    const fn = vi.fn((s: { open: boolean }) =>
      // overflow-visible must override the panel's own overflow-hidden
      s.open ? "fn-open overflow-visible" : "fn-closed overflow-visible"
    );
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent className={fn}>Body</CollapsibleContent>
      </Collapsible>
    );

    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ open: false }));
    const panel = document.querySelector(
      '[data-slot="collapsible-content"]'
    ) as HTMLElement;
    expect(panel).toHaveClass("fn-closed", "overflow-visible");
    expect(panel).not.toHaveClass("overflow-hidden");
    expect(panel.className).toContain("h-[var(--collapsible-panel-height)]");

    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
    expect(panel).toHaveClass("fn-open");
    expect(panel).not.toHaveClass("fn-closed");
  });

  it("still merges a string className over the panel's own classes", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent className="str-panel overflow-visible">
          Body
        </CollapsibleContent>
      </Collapsible>
    );
    const panel = document.querySelector(
      '[data-slot="collapsible-content"]'
    ) as HTMLElement;
    expect(panel).toHaveClass("str-panel", "overflow-visible");
    expect(panel).not.toHaveClass("overflow-hidden");
  });
});
