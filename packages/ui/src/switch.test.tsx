import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
  test("renders correctly", () => {
    render(<Switch data-testid="switch" />);
    expect(screen.getByTestId("switch")).toBeInTheDocument();
  });

  test("has switch role", () => {
    render(<Switch />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBeInTheDocument();
  });

  test("is unchecked by default", () => {
    render(<Switch />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "false");
  });

  test("can be checked by default", () => {
    render(<Switch defaultChecked />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "true");
  });

  test("toggles on click", async () => {
    render(<Switch />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "false");

    await userEvent.click(switchEl);
    expect(switchEl).toHaveAttribute("aria-checked", "true");

    await userEvent.click(switchEl);
    expect(switchEl).toHaveAttribute("aria-checked", "false");
  });

  test("calls onCheckedChange handler", async () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);
    const switchEl = screen.getByRole("switch");

    await userEvent.click(switchEl);
    // Base UI calls with (checked, event) - just verify first argument
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toBe(true);
  });

  test("applies disabled state", () => {
    render(<Switch disabled />);
    const switchEl = screen.getByRole("switch");
    // Base UI uses aria-disabled instead of disabled attribute
    expect(switchEl).toHaveAttribute("aria-disabled", "true");
  });

  test("does not toggle when disabled", async () => {
    render(<Switch disabled />);
    const switchEl = screen.getByRole("switch");

    await userEvent.click(switchEl);
    expect(switchEl).toHaveAttribute("aria-checked", "false");
  });

  test("applies default size", () => {
    render(<Switch data-testid="switch" />);
    const switchEl = screen.getByTestId("switch");
    expect(switchEl).toHaveAttribute("data-size", "default");
  });

  test("applies sm size", () => {
    render(<Switch data-testid="switch" size="sm" />);
    const switchEl = screen.getByTestId("switch");
    expect(switchEl).toHaveAttribute("data-size", "sm");
  });

  test("applies custom className", () => {
    render(<Switch className="custom-class" data-testid="switch" />);
    const switchEl = screen.getByTestId("switch");
    expect(switchEl).toHaveClass("custom-class");
  });

  test("has data-slot attribute", () => {
    render(<Switch data-testid="switch" />);
    const switchEl = screen.getByTestId("switch");
    expect(switchEl).toHaveAttribute("data-slot", "switch");
  });

  test("supports aria-invalid for error state", () => {
    render(<Switch aria-invalid data-testid="switch" />);
    const switchEl = screen.getByTestId("switch");
    expect(switchEl).toHaveAttribute("aria-invalid", "true");
  });

  test("has an id attribute for label association", () => {
    render(<Switch data-testid="switch" />);
    const switchEl = screen.getByTestId("switch");
    // Base UI generates an ID automatically
    expect(switchEl).toHaveAttribute("id");
  });

  test("contains thumb element", () => {
    render(<Switch data-testid="switch" />);
    const thumb = screen
      .getByTestId("switch")
      .querySelector('[data-slot="switch-thumb"]');
    expect(thumb).toBeInTheDocument();
  });
});
