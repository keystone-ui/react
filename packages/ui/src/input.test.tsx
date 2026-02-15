import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, test } from "vitest";
import { Input } from "./input";
import { InputGroup, InputGroupAddon } from "./input-group";

describe("Input", () => {
  test("renders correctly", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  test("applies custom className", () => {
    render(<Input className="custom-class" placeholder="Custom Input" />);
    const input = screen.getByPlaceholderText("Custom Input");
    expect(input).toHaveClass("custom-class");
  });

  test("handles user input", async () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    await userEvent.type(input, "Hello, world!");
    expect(input).toHaveValue("Hello, world!");
  });

  test("applies disabled state", () => {
    render(<Input disabled placeholder="Disabled Input" />);
    const input = screen.getByPlaceholderText("Disabled Input");
    expect(input).toBeDisabled();
  });

  test("applies correct type attribute", () => {
    render(<Input placeholder="Password" type="password" />);
    const input = screen.getByPlaceholderText("Password");
    expect(input).toHaveAttribute("type", "password");
  });

  test("applies focus ring styles", () => {
    render(<Input placeholder="Focus Ring Test" />);
    const input = screen.getByPlaceholderText("Focus Ring Test");
    expect(input).toHaveClass("focus:ring-1");
    expect(input).toHaveClass("focus:ring-inset");
    expect(input).toHaveClass("focus:ring-ring");
  });

  test("applies search-specific styles for search type", () => {
    render(<Input placeholder="Search" type="search" />);
    const input = screen.getByPlaceholderText("Search");
    expect(input).toHaveClass(
      "[&::-webkit-search-cancel-button]:appearance-none"
    );
  });

  test("applies file-specific styles for file type", () => {
    render(<Input data-testid="file-input" type="file" />);
    const input = screen.getByTestId("file-input");
    expect(input).toHaveClass("file:border-r");
    expect(input).toHaveClass("file:not-italic");
  });

  it("renders correctly", () => {
    render(<Input data-testid="input" placeholder="Test input" />);
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("passes props correctly", () => {
    render(<Input data-testid="input" placeholder="Email" type="email" />);
    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("placeholder", "Email");
  });

  it("works with InputGroupAddon", () => {
    render(
      <InputGroup>
        <InputGroupAddon align="inline-start" data-testid="start-addon">
          $
        </InputGroupAddon>
        <Input data-testid="input" placeholder="0.00" />
        <InputGroupAddon align="inline-end" data-testid="end-addon">
          USD
        </InputGroupAddon>
      </InputGroup>
    );

    expect(screen.getByTestId("start-addon")).toBeInTheDocument();
    expect(screen.getByTestId("input")).toBeInTheDocument();
    expect(screen.getByTestId("end-addon")).toBeInTheDocument();
  });
});
