import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Stepper, StepperContent, StepperStep, useStepper } from "./stepper";

// Helper component that exposes useStepper() values via test IDs
function StepperInfo() {
  const { value, totalSteps, direction, isFirst, isLast } = useStepper();
  return (
    <div data-testid="stepper-info">
      <span data-testid="value">{value}</span>
      <span data-testid="total-steps">{totalSteps}</span>
      <span data-testid="direction">{direction}</span>
      <span data-testid="is-first">{String(isFirst)}</span>
      <span data-testid="is-last">{String(isLast)}</span>
    </div>
  );
}

// Helper component with navigation buttons
function StepperNav() {
  const { goNext, goPrevious, goTo, isFirst, isLast } = useStepper();
  return (
    <div>
      <button data-testid="prev" onClick={goPrevious} disabled={isFirst}>
        Back
      </button>
      <button data-testid="next" onClick={goNext} disabled={isLast}>
        Next
      </button>
      <button data-testid="goto-2" onClick={() => goTo(2)}>
        Go to 2
      </button>
    </div>
  );
}

// Controlled wrapper for tests
function TestStepper({
  initialStep = 0,
  onValueChange,
}: {
  initialStep?: number;
  onValueChange?: (value: number) => void;
}) {
  const [step, setStep] = React.useState(initialStep);
  const handleChange = (v: number) => {
    setStep(v);
    onValueChange?.(v);
  };
  return (
    <Stepper value={step} onValueChange={handleChange}>
      <StepperInfo />
      <StepperContent>
        <StepperStep>
          <div data-testid="step-0">Step One</div>
        </StepperStep>
        <StepperStep>
          <div data-testid="step-1">Step Two</div>
        </StepperStep>
        <StepperStep>
          <div data-testid="step-2">Step Three</div>
        </StepperStep>
      </StepperContent>
      <StepperNav />
    </Stepper>
  );
}

import React from "react";

describe("Stepper", () => {
  test("renders the first step by default", () => {
    render(<TestStepper />);
    expect(screen.getByTestId("step-0")).toBeInTheDocument();
    expect(screen.queryByTestId("step-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("step-2")).not.toBeInTheDocument();
  });

  test("renders the correct initial step", () => {
    render(<TestStepper initialStep={1} />);
    expect(screen.queryByTestId("step-0")).not.toBeInTheDocument();
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    expect(screen.queryByTestId("step-2")).not.toBeInTheDocument();
  });

  test("reports correct totalSteps", () => {
    render(<TestStepper />);
    expect(screen.getByTestId("total-steps").textContent).toBe("3");
  });

  test("reports correct value", () => {
    render(<TestStepper initialStep={1} />);
    expect(screen.getByTestId("value").textContent).toBe("1");
  });

  test("isFirst is true at step 0", () => {
    render(<TestStepper />);
    expect(screen.getByTestId("is-first").textContent).toBe("true");
    expect(screen.getByTestId("is-last").textContent).toBe("false");
  });

  test("isLast is true at last step", () => {
    render(<TestStepper initialStep={2} />);
    expect(screen.getByTestId("is-first").textContent).toBe("false");
    expect(screen.getByTestId("is-last").textContent).toBe("true");
  });

  test("goNext navigates to the next step", async () => {
    render(<TestStepper />);
    await userEvent.click(screen.getByTestId("next"));

    expect(screen.getByTestId("value").textContent).toBe("1");
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
  });

  test("goPrevious navigates to the previous step", async () => {
    render(<TestStepper initialStep={2} />);
    await userEvent.click(screen.getByTestId("prev"));

    expect(screen.getByTestId("value").textContent).toBe("1");
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
  });

  test("goTo navigates to a specific step", async () => {
    render(<TestStepper />);
    await userEvent.click(screen.getByTestId("goto-2"));

    expect(screen.getByTestId("value").textContent).toBe("2");
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
  });

  test("does not go below step 0", async () => {
    render(<TestStepper />);
    const prevButton = screen.getByTestId("prev");
    expect(prevButton).toBeDisabled();

    await userEvent.click(prevButton);
    expect(screen.getByTestId("value").textContent).toBe("0");
  });

  test("does not go above last step", async () => {
    render(<TestStepper initialStep={2} />);
    const nextButton = screen.getByTestId("next");
    expect(nextButton).toBeDisabled();

    await userEvent.click(nextButton);
    expect(screen.getByTestId("value").textContent).toBe("2");
  });

  test("direction is +1 when going forward", async () => {
    render(<TestStepper />);
    await userEvent.click(screen.getByTestId("next"));

    expect(screen.getByTestId("direction").textContent).toBe("1");
  });

  test("direction is -1 when going backward", async () => {
    render(<TestStepper initialStep={2} />);
    await userEvent.click(screen.getByTestId("prev"));

    expect(screen.getByTestId("direction").textContent).toBe("-1");
  });

  test("direction changes when jumping forward via goTo", async () => {
    render(<TestStepper />);
    await userEvent.click(screen.getByTestId("goto-2"));

    expect(screen.getByTestId("direction").textContent).toBe("1");
  });

  test("calls onValueChange when navigating", async () => {
    const handleChange = vi.fn();
    render(<TestStepper onValueChange={handleChange} />);

    await userEvent.click(screen.getByTestId("next"));
    expect(handleChange).toHaveBeenCalledWith(1);

    await userEvent.click(screen.getByTestId("next"));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  test("has data-slot attributes on content and step", () => {
    render(<TestStepper />);
    const content = document.querySelector('[data-slot="stepper-content"]');
    const step = document.querySelector('[data-slot="stepper-step"]');
    expect(content).toBeInTheDocument();
    expect(step).toBeInTheDocument();
  });

  test("useStepper throws when used outside Stepper", () => {
    // Suppress console.error for the expected error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<StepperInfo />)).toThrow(
      "useStepper must be used within a <Stepper> component.",
    );
    spy.mockRestore();
  });
});
