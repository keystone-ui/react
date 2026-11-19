import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Reel } from "./reel";

// Prop wiring and data attributes only. Layout, scrolling, focus and the
// arrows' visibility need a real browser: apps/storybook/stories/reel.stories.tsx.

function renderReel(props: Partial<React.ComponentProps<typeof Reel>> = {}) {
  return render(
    <Reel {...props}>
      <ul aria-label="Row">
        <li>
          <a href="#one">One</a>
        </li>
      </ul>
    </Reel>
  );
}

const root = () => document.querySelector('[data-slot="reel"]') as HTMLElement;
const arrows = () =>
  [...document.querySelectorAll('[data-slot="reel-arrow"]')] as HTMLElement[];

describe("Reel", () => {
  it("renders the root, a viewport holding the row, and two arrows", () => {
    renderReel();
    const viewport = root().querySelector('[data-slot="reel-viewport"]');
    expect(viewport).toContainElement(screen.getByRole("list"));
    expect(arrows().map((arrow) => arrow.dataset.side)).toEqual([
      "start",
      "end",
    ]);
  });

  it('defaults arrows to "pointer" and reflects the prop on the root', () => {
    renderReel();
    expect(root()).toHaveAttribute("data-arrows", "pointer");
    renderReel({ arrows: "none" });
    expect(
      document.querySelectorAll('[data-slot="reel"][data-arrows="none"]')
    ).toHaveLength(1);
  });

  it("keeps the arrows out of the Tab order and the accessibility tree", () => {
    renderReel({ arrows: "always" });
    expect(arrows()).toHaveLength(2);
    for (const arrow of arrows()) {
      // The picture of a button, inert, inside a plain hidden hit area.
      expect(arrow.tagName).toBe("BUTTON");
      expect(arrow).toHaveAttribute("tabindex", "-1");
      expect(arrow).toHaveAttribute("inert");
      const hitArea = arrow.parentElement as HTMLElement;
      expect(hitArea.tagName).toBe("SPAN");
      expect(hitArea).toHaveAttribute("aria-hidden", "true");
      expect(hitArea).not.toHaveAttribute("tabindex");
      expect(hitArea.dataset.side).toBe(arrow.dataset.side);
    }
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it('defaults arrowVariant to "default" and reflects it on the root', () => {
    renderReel();
    expect(root()).toHaveAttribute("data-arrow-variant", "default");
    expect(arrows()[0].tagName).toBe("BUTTON");
  });

  it("draws a plain arrow as a bare chevron in a span, never a Tab stop", () => {
    renderReel({ arrowVariant: "plain", arrows: "always" });
    expect(root()).toHaveAttribute("data-arrow-variant", "plain");
    expect(arrows().map((arrow) => arrow.dataset.side)).toEqual([
      "start",
      "end",
    ]);
    for (const arrow of arrows()) {
      expect(arrow.tagName).toBe("SPAN");
      expect(arrow).not.toHaveAttribute("tabindex");
      expect(arrow.querySelector("svg")).not.toBeNull();
      const hitArea = arrow.parentElement as HTMLElement;
      expect(hitArea.tagName).toBe("SPAN");
      expect(hitArea).toHaveAttribute("aria-hidden", "true");
      expect(hitArea).not.toHaveAttribute("tabindex");
      expect(hitArea.dataset.side).toBe(arrow.dataset.side);
    }
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("merges className onto the root", () => {
    renderReel({ className: "max-w-sm" });
    expect(root()).toHaveClass("relative", "max-w-sm");
  });
});
