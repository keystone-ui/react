import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { deltaTone, StatDelta, StatValue } from "./stat";

// The highest-value test in the file. This truth table is the one piece of
// real logic: colour must come from what the metric *means*, not from the sign
// of the delta, so a `down-is-good` metric that fell is POSITIVE.
describe("deltaTone", () => {
  it.each([
    [0.1, "up-is-good", "positive"],
    [-0.1, "up-is-good", "negative"],
    [0.1, "down-is-good", "negative"],
    [-0.1, "down-is-good", "positive"],
    [0.1, "neutral", "neutral"],
    [-0.1, "neutral", "neutral"],
  ] as const)("(%s, %s) is %s", (value, direction, expected) => {
    expect(deltaTone(value, direction)).toBe(expected);
  });

  // "Unchanged" is not an improvement.
  it.each(["up-is-good", "down-is-good", "neutral"] as const)(
    "zero is neutral for %s",
    (direction) => {
      expect(deltaTone(0, direction)).toBe("neutral");
    }
  );

  // A metric with no comparison period must not claim a direction.
  it("treats null and undefined as neutral", () => {
    expect(deltaTone(null, "up-is-good")).toBe("neutral");
    expect(deltaTone(undefined, "up-is-good")).toBe("neutral");
  });

  it("defaults to up-is-good", () => {
    expect(deltaTone(1)).toBe("positive");
    expect(deltaTone(-1)).toBe("negative");
  });
});

describe("StatValue", () => {
  it("renders children", () => {
    render(<StatValue>4.2</StatValue>);
    expect(screen.getByText("4.2")).toBeInTheDocument();
  });

  it("sets data-slot", () => {
    render(<StatValue data-testid="v">4.2</StatValue>);
    expect(screen.getByTestId("v")).toHaveAttribute("data-slot", "stat-value");
  });

  // Not cosmetic: proportional digits make a live-updating figure change width
  // on every tick, so the row jitters.
  it("uses tabular-nums", () => {
    render(<StatValue data-testid="v">4.2</StatValue>);
    expect(screen.getByTestId("v")).toHaveClass("tabular-nums");
  });

  it("forwards className", () => {
    render(
      <StatValue className="custom" data-testid="v">
        4.2
      </StatValue>
    );
    expect(screen.getByTestId("v")).toHaveClass("custom");
  });
});

describe("StatDelta", () => {
  it("renders the display text it is given", () => {
    render(<StatDelta value={0.12}>+12%</StatDelta>);
    expect(screen.getByText("+12%")).toBeInTheDocument();
  });

  it.each([
    [0.1, "up-is-good", "positive", "text-success"],
    [-0.1, "up-is-good", "negative", "text-destructive"],
    [0.1, "down-is-good", "negative", "text-destructive"],
    [-0.1, "down-is-good", "positive", "text-success"],
    [0, "up-is-good", "neutral", "text-muted-foreground"],
  ] as const)(
    "value=%s direction=%s renders tone %s",
    (value, direction, tone, className) => {
      render(
        <StatDelta data-testid="d" direction={direction} value={value}>
          x
        </StatDelta>
      );
      const el = screen.getByTestId("d");
      expect(el).toHaveAttribute("data-tone", tone);
      expect(el).toHaveClass(className);
    }
  );

  // The arrow follows the sign while the colour follows the tone, so a green
  // down-arrow is correct for a down-is-good metric that improved.
  it("points the arrow by sign, not by tone", () => {
    const { container } = render(
      <StatDelta data-testid="d" direction="down-is-good" value={-0.1}>
        -10%
      </StatDelta>
    );
    // Fell, and falling is good here: green, but with a DOWN arrow.
    expect(screen.getByTestId("d")).toHaveClass("text-success");
    expect(container.querySelector("svg")).toHaveClass("lucide-arrow-down");
  });

  it("renders no arrow for a null or zero delta", () => {
    const { container: nullDelta } = render(
      <StatDelta value={null}>—</StatDelta>
    );
    expect(nullDelta.querySelector("svg")).toBeNull();

    const { container: zeroDelta } = render(
      <StatDelta value={0}>0%</StatDelta>
    );
    expect(zeroDelta.querySelector("svg")).toBeNull();
  });

  it("renders no arrow when showIcon is false", () => {
    const { container } = render(
      <StatDelta showIcon={false} value={0.1}>
        +10%
      </StatDelta>
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("lets an explicit tone override the derived one", () => {
    render(
      <StatDelta data-testid="d" tone="warning" value={0.1}>
        +10%
      </StatDelta>
    );
    const el = screen.getByTestId("d");
    expect(el).toHaveAttribute("data-tone", "warning");
    expect(el).toHaveClass("text-warning");
  });

  // Colour alone fails WCAG 1.4.1, so the direction is also in the a11y tree.
  it("adds a visually hidden qualifier for a toned delta", () => {
    render(<StatDelta value={0.1}>+10%</StatDelta>);
    expect(screen.getByText("improving")).toHaveClass("sr-only");
  });

  it("adds no qualifier for a neutral delta", () => {
    render(<StatDelta value={0}>0%</StatDelta>);
    expect(screen.queryByText("improving")).toBeNull();
    expect(screen.queryByText("declining")).toBeNull();
  });

  it("omits the qualifier when the caller supplies aria-label", () => {
    render(
      <StatDelta aria-label="up 10 percent" value={0.1}>
        +10%
      </StatDelta>
    );
    expect(screen.queryByText("improving")).toBeNull();
  });

  it("sets data-slot and forwards className", () => {
    render(
      <StatDelta className="custom" data-testid="d" value={0.1}>
        +10%
      </StatDelta>
    );
    const el = screen.getByTestId("d");
    expect(el).toHaveAttribute("data-slot", "stat-delta");
    expect(el).toHaveClass("custom");
  });

  it("uses tabular-nums", () => {
    render(
      <StatDelta data-testid="d" value={0.1}>
        +10%
      </StatDelta>
    );
    expect(screen.getByTestId("d")).toHaveClass("tabular-nums");
  });
});
