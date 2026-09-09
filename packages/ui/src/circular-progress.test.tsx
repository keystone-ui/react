import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressLabel,
  CircularProgressTrack,
  CircularProgressValue,
} from "./circular-progress";

describe("CircularProgress", () => {
  it("renders a progressbar with the given value", () => {
    render(<CircularProgress value={40} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "40");
  });

  it("sets data-slot", () => {
    render(<CircularProgress value={40} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "data-slot",
      "circular-progress"
    );
  });

  it("forwards className", () => {
    render(<CircularProgress className="custom" value={40} />);
    expect(screen.getByRole("progressbar")).toHaveClass("custom");
  });

  // The color variants set --progress-indicator, which Track and Indicator
  // both read. These assert the token indirection rather than a literal hue:
  // before this, success and warning inlined raw oklch and so ignored the
  // theme entirely in dark mode.
  describe("color variants", () => {
    const cases = [
      ["default", "var(--primary)"],
      ["success", "var(--success,oklch(0.627_0.194_149.214))"],
      ["warning", "var(--warning,oklch(0.769_0.188_70.08))"],
      ["destructive", "var(--destructive)"],
    ] as const;

    it.each(cases)("color=%s sets --progress-indicator", (color, token) => {
      render(<CircularProgress color={color} value={40} />);
      expect(screen.getByRole("progressbar")).toHaveClass(
        `[--progress-indicator:${token}]`
      );
    });

    it("defaults to the primary token", () => {
      render(<CircularProgress value={40} />);
      expect(screen.getByRole("progressbar")).toHaveClass(
        "[--progress-indicator:var(--primary)]"
      );
    });
  });

  describe("size variants", () => {
    const cases = [
      ["sm", "size-12"],
      ["default", "size-16"],
      ["lg", "size-24"],
    ] as const;

    it.each(cases)("size=%s applies %s", (size, expected) => {
      render(<CircularProgress size={size} value={40} />);
      expect(screen.getByRole("progressbar")).toHaveClass(expected);
    });

    it("defaults to the default size", () => {
      render(<CircularProgress value={40} />);
      expect(screen.getByRole("progressbar")).toHaveClass("size-16");
    });
  });

  describe("parts", () => {
    it("renders a default track and indicator when given no children", () => {
      render(<CircularProgress value={40} />);
      const progressbar = screen.getByRole("progressbar");
      expect(
        progressbar.querySelector('[data-slot="circular-progress-track"]')
      ).not.toBeNull();
      expect(
        progressbar.querySelector('[data-slot="circular-progress-indicator"]')
      ).not.toBeNull();
    });

    it("renders explicit parts and a value read from context", () => {
      render(
        <CircularProgress value={75}>
          <CircularProgressTrack />
          <CircularProgressIndicator />
          <CircularProgressValue />
          <CircularProgressLabel>Upload</CircularProgressLabel>
        </CircularProgress>
      );
      expect(screen.getByText("75%")).toBeInTheDocument();
      expect(screen.getByText("Upload")).toBeInTheDocument();
    });
  });

  it("supports the indeterminate state", () => {
    render(<CircularProgress value={null} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).not.toHaveAttribute("aria-valuenow");
  });
});
