import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CommandDialog } from "./command";

describe("CommandDialog", () => {
  // base.css keys the palette's no-motion rule on this attribute, so it has
  // to land on the element that carries data-slot="modal-content".
  it("marks its modal content with data-command", () => {
    render(
      <CommandDialog open>
        <p>Palette body</p>
      </CommandDialog>
    );

    const content = document.querySelector('[data-slot="modal-content"]');
    expect(content).not.toBeNull();
    expect(content).toHaveAttribute("data-command");
  });

  it("leaves the overlay unmarked, so it keeps its fade", () => {
    render(
      <CommandDialog open>
        <p>Palette body</p>
      </CommandDialog>
    );

    const overlay = document.querySelector('[data-slot="modal-overlay"]');
    expect(overlay).not.toBeNull();
    expect(overlay).not.toHaveAttribute("data-command");
  });
});
