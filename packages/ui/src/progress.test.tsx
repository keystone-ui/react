import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "./progress";

// =============================================================================
// Progress (Root)
// =============================================================================
describe("Progress", () => {
  it("renders with role='progressbar'", () => {
    render(<Progress value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<Progress value={50} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "data-slot",
      "progress"
    );
  });

  it("sets aria-valuenow from value prop", () => {
    render(<Progress value={75} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "75"
    );
  });

  it("sets aria-valuemin and aria-valuemax", () => {
    render(<Progress value={50} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("forwards className", () => {
    render(<Progress className="custom-progress" value={50} />);
    expect(screen.getByRole("progressbar")).toHaveClass("custom-progress");
  });

  it("renders default track and indicator when no children provided", () => {
    const { container } = render(<Progress value={50} />);
    expect(
      container.querySelector('[data-slot="progress-track"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="progress-indicator"]')
    ).toBeInTheDocument();
  });

  it("renders custom children when provided", () => {
    render(
      <Progress value={50}>
        <ProgressLabel>Loading</ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
        <ProgressValue />
      </Progress>
    );
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("renders with value 0", () => {
    render(<Progress value={0} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
  });

  it("renders with value 100", () => {
    render(<Progress value={100} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
  });
});

// =============================================================================
// ProgressTrack
// =============================================================================
describe("ProgressTrack", () => {
  it("has data-slot attribute", () => {
    render(
      <Progress value={50}>
        <ProgressTrack data-testid="track">
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    );
    expect(screen.getByTestId("track")).toHaveAttribute(
      "data-slot",
      "progress-track"
    );
  });

  it("forwards className", () => {
    render(
      <Progress value={50}>
        <ProgressTrack className="custom-track" data-testid="track">
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    );
    expect(screen.getByTestId("track")).toHaveClass("custom-track");
  });
});

// =============================================================================
// ProgressIndicator
// =============================================================================
describe("ProgressIndicator", () => {
  it("has data-slot attribute", () => {
    render(
      <Progress value={50}>
        <ProgressTrack>
          <ProgressIndicator data-testid="indicator" />
        </ProgressTrack>
      </Progress>
    );
    expect(screen.getByTestId("indicator")).toHaveAttribute(
      "data-slot",
      "progress-indicator"
    );
  });

  it("forwards className", () => {
    render(
      <Progress value={50}>
        <ProgressTrack>
          <ProgressIndicator
            className="custom-indicator"
            data-testid="indicator"
          />
        </ProgressTrack>
      </Progress>
    );
    expect(screen.getByTestId("indicator")).toHaveClass("custom-indicator");
  });
});

// =============================================================================
// ProgressLabel
// =============================================================================
describe("ProgressLabel", () => {
  it("renders with children content", () => {
    render(
      <Progress value={50}>
        <ProgressLabel>Uploading…</ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    );
    expect(screen.getByText("Uploading…")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <Progress value={50}>
        <ProgressLabel data-testid="label">Label</ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    );
    expect(screen.getByTestId("label")).toHaveAttribute(
      "data-slot",
      "progress-label"
    );
  });

  it("forwards className", () => {
    render(
      <Progress value={50}>
        <ProgressLabel className="custom-label" data-testid="label">
          Label
        </ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    );
    expect(screen.getByTestId("label")).toHaveClass("custom-label");
  });
});

// =============================================================================
// ProgressValue
// =============================================================================
describe("ProgressValue", () => {
  it("has data-slot attribute", () => {
    render(
      <Progress value={50}>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
        <ProgressValue data-testid="value" />
      </Progress>
    );
    expect(screen.getByTestId("value")).toHaveAttribute(
      "data-slot",
      "progress-value"
    );
  });

  it("forwards className", () => {
    render(
      <Progress value={50}>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
        <ProgressValue className="custom-value" data-testid="value" />
      </Progress>
    );
    expect(screen.getByTestId("value")).toHaveClass("custom-value");
  });
});

// =============================================================================
// Color Variants
// =============================================================================
describe("Progress color variants", () => {
  it("applies default color variant", () => {
    render(<Progress value={50} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass("[--progress-indicator:var(--primary)]");
  });

  it("applies success color variant", () => {
    render(<Progress color="success" value={50} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass(
      "[--progress-indicator:oklch(0.627_0.194_149.214)]"
    );
  });

  it("applies warning color variant", () => {
    render(<Progress color="warning" value={50} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass(
      "[--progress-indicator:oklch(0.769_0.188_70.08)]"
    );
  });

  it("applies destructive color variant", () => {
    render(<Progress color="destructive" value={50} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass(
      "[--progress-indicator:var(--destructive)]"
    );
  });
});
