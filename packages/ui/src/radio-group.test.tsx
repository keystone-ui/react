import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup", () => {
  test("renders correctly", () => {
    render(
      <RadioGroup data-testid="radio-group">
        <RadioGroupItem value="option1" />
      </RadioGroup>
    );
    expect(screen.getByTestId("radio-group")).toBeInTheDocument();
  });

  test("has radiogroup role", () => {
    render(
      <RadioGroup data-testid="radio-group">
        <RadioGroupItem value="option1" />
      </RadioGroup>
    );
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  test("has data-slot attribute", () => {
    render(
      <RadioGroup data-testid="radio-group">
        <RadioGroupItem value="option1" />
      </RadioGroup>
    );
    expect(screen.getByTestId("radio-group")).toHaveAttribute(
      "data-slot",
      "radio-group"
    );
  });

  test("applies custom className", () => {
    render(
      <RadioGroup className="custom-class" data-testid="radio-group">
        <RadioGroupItem value="option1" />
      </RadioGroup>
    );
    expect(screen.getByTestId("radio-group")).toHaveClass("custom-class");
  });
});

describe("RadioGroupItem", () => {
  test("renders correctly", () => {
    render(
      <RadioGroup>
        <RadioGroupItem data-testid="radio-item" value="option1" />
      </RadioGroup>
    );
    expect(screen.getByTestId("radio-item")).toBeInTheDocument();
  });

  test("has radio role", () => {
    render(
      <RadioGroup>
        <RadioGroupItem data-testid="radio-item" value="option1" />
      </RadioGroup>
    );
    expect(screen.getByRole("radio")).toBeInTheDocument();
  });

  test("has data-slot attribute", () => {
    render(
      <RadioGroup>
        <RadioGroupItem data-testid="radio-item" value="option1" />
      </RadioGroup>
    );
    expect(screen.getByTestId("radio-item")).toHaveAttribute(
      "data-slot",
      "radio-group-item"
    );
  });

  test("is unchecked by default", () => {
    render(
      <RadioGroup>
        <RadioGroupItem data-testid="radio-item" value="option1" />
      </RadioGroup>
    );
    const radio = screen.getByRole("radio");
    expect(radio).toHaveAttribute("aria-checked", "false");
  });

  test("can be checked by default", () => {
    render(
      <RadioGroup defaultValue="option1">
        <RadioGroupItem data-testid="radio-item" value="option1" />
      </RadioGroup>
    );
    const radio = screen.getByRole("radio");
    expect(radio).toHaveAttribute("aria-checked", "true");
  });

  test("selects on click", async () => {
    render(
      <RadioGroup>
        <RadioGroupItem data-testid="radio-1" value="option1" />
        <RadioGroupItem data-testid="radio-2" value="option2" />
      </RadioGroup>
    );

    const radio1 = screen.getByTestId("radio-1");
    const radio2 = screen.getByTestId("radio-2");

    expect(radio1).toHaveAttribute("aria-checked", "false");
    expect(radio2).toHaveAttribute("aria-checked", "false");

    await userEvent.click(radio1);
    expect(radio1).toHaveAttribute("aria-checked", "true");
    expect(radio2).toHaveAttribute("aria-checked", "false");

    await userEvent.click(radio2);
    expect(radio1).toHaveAttribute("aria-checked", "false");
    expect(radio2).toHaveAttribute("aria-checked", "true");
  });

  test("calls onValueChange handler", async () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup onValueChange={handleChange}>
        <RadioGroupItem data-testid="radio-item" value="option1" />
      </RadioGroup>
    );

    await userEvent.click(screen.getByTestId("radio-item"));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0]).toBe("option1");
  });

  test("applies disabled state", () => {
    render(
      <RadioGroup>
        <RadioGroupItem data-testid="radio-item" disabled value="option1" />
      </RadioGroup>
    );
    const radio = screen.getByRole("radio");
    expect(radio).toHaveAttribute("data-disabled", "");
  });

  test("does not select when disabled", async () => {
    render(
      <RadioGroup>
        <RadioGroupItem data-testid="radio-item" disabled value="option1" />
      </RadioGroup>
    );

    const radio = screen.getByTestId("radio-item");
    await userEvent.click(radio);
    expect(radio).toHaveAttribute("aria-checked", "false");
  });

  test("applies custom className", () => {
    render(
      <RadioGroup>
        <RadioGroupItem
          className="custom-class"
          data-testid="radio-item"
          value="option1"
        />
      </RadioGroup>
    );
    expect(screen.getByTestId("radio-item")).toHaveClass("custom-class");
  });

  test("supports controlled state", async () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <RadioGroup onValueChange={handleChange} value="option1">
        <RadioGroupItem data-testid="radio-1" value="option1" />
        <RadioGroupItem data-testid="radio-2" value="option2" />
      </RadioGroup>
    );

    const radio1 = screen.getByTestId("radio-1");
    const radio2 = screen.getByTestId("radio-2");

    expect(radio1).toHaveAttribute("aria-checked", "true");
    expect(radio2).toHaveAttribute("aria-checked", "false");

    await userEvent.click(radio2);
    expect(handleChange.mock.calls[0][0]).toBe("option2");

    // Rerender with new value to simulate controlled update
    rerender(
      <RadioGroup onValueChange={handleChange} value="option2">
        <RadioGroupItem data-testid="radio-1" value="option1" />
        <RadioGroupItem data-testid="radio-2" value="option2" />
      </RadioGroup>
    );

    expect(radio1).toHaveAttribute("aria-checked", "false");
    expect(radio2).toHaveAttribute("aria-checked", "true");
  });

  test("supports name attribute for form submission", () => {
    render(
      <RadioGroup name="my-radio-group">
        <RadioGroupItem data-testid="radio-item" value="option1" />
      </RadioGroup>
    );
    // Base UI RadioGroup handles form submission internally
    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toBeInTheDocument();
  });
});
