import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const BasicSelect = ({
  onValueChange,
  ...props
}: {
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}) => (
  <Select onValueChange={onValueChange} {...props}>
    <SelectTrigger data-testid="trigger">
      <SelectValue placeholder="Select a fruit" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem disabled value="cherry">
          Cherry
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);

describe("Select", () => {
  describe("SelectTrigger", () => {
    test("renders correctly", () => {
      render(<BasicSelect />);
      expect(screen.getByTestId("trigger")).toBeInTheDocument();
    });

    test("has combobox role", () => {
      render(<BasicSelect />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
    });

    test("has data-slot attribute", () => {
      render(<BasicSelect />);
      expect(screen.getByTestId("trigger")).toHaveAttribute(
        "data-slot",
        "select-trigger"
      );
    });

    test("applies default size", () => {
      render(<BasicSelect />);
      expect(screen.getByTestId("trigger")).toHaveAttribute(
        "data-size",
        "default"
      );
    });

    test("applies sm size", () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" size="sm">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-size", "sm");
    });

    test("applies custom className", () => {
      render(
        <Select>
          <SelectTrigger className="custom-class" data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId("trigger")).toHaveClass("custom-class");
    });

    test("shows placeholder when no value selected", () => {
      render(<BasicSelect />);
      expect(screen.getByText("Select a fruit")).toBeInTheDocument();
    });

    test("is disabled when Select is disabled", () => {
      render(<BasicSelect disabled />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("data-disabled", "");
    });
  });

  describe("Selection", () => {
    test("opens popup on click", async () => {
      render(<BasicSelect />);
      const trigger = screen.getByRole("combobox");

      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });

    test("shows items when opened", async () => {
      render(<BasicSelect />);
      const trigger = screen.getByRole("combobox");

      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Banana")).toBeInTheDocument();
        expect(screen.getByText("Cherry")).toBeInTheDocument();
      });
    });

    test("selects item on click", async () => {
      const handleChange = vi.fn();
      render(<BasicSelect onValueChange={handleChange} />);
      const trigger = screen.getByRole("combobox");

      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("Apple"));

      expect(handleChange).toHaveBeenCalledWith("apple", expect.anything());
    });

    test("displays selected value in trigger", async () => {
      render(<BasicSelect defaultValue="banana" />);
      // Without items prop, displays raw value. With items prop, displays label.
      expect(screen.getByText("banana")).toBeInTheDocument();
    });

    test("does not select disabled item", async () => {
      const handleChange = vi.fn();
      render(<BasicSelect onValueChange={handleChange} />);
      const trigger = screen.getByRole("combobox");

      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Cherry")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("Cherry"));

      // Disabled item should not trigger change
      expect(handleChange).not.toHaveBeenCalled();
    });

    test("closes popup after selection", async () => {
      render(<BasicSelect />);
      const trigger = screen.getByRole("combobox");

      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("Apple"));

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });
  });

  describe("Keyboard Navigation", () => {
    test("opens popup with Enter key", async () => {
      render(<BasicSelect />);
      const trigger = screen.getByRole("combobox");

      trigger.focus();
      await userEvent.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });

    test("opens popup with Space key", async () => {
      render(<BasicSelect />);
      const trigger = screen.getByRole("combobox");

      trigger.focus();
      await userEvent.keyboard(" ");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });

    test("closes popup with Escape key", async () => {
      render(<BasicSelect />);
      const trigger = screen.getByRole("combobox");

      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await userEvent.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });
  });

  describe("Groups and Labels", () => {
    test("renders group label", async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      await userEvent.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getByText("Fruits")).toBeInTheDocument();
      });
    });

    test("renders separator", async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectSeparator data-testid="separator" />
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>
      );

      await userEvent.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getByTestId("separator")).toBeInTheDocument();
      });
    });
  });

  describe("Multiple Selection", () => {
    test("allows multiple selections", async () => {
      const handleChange = vi.fn();
      render(
        <Select multiple onValueChange={handleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select fruits" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>
      );

      await userEvent.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("Apple"));

      // Multiple select keeps popup open
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("Banana"));

      // Should have called with array containing both values
      expect(handleChange).toHaveBeenLastCalledWith(
        expect.arrayContaining(["apple", "banana"]),
        expect.anything()
      );
    });
  });

  describe("Form Integration", () => {
    test("supports name attribute for form submission", () => {
      render(
        <Select defaultValue="apple" name="fruit">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>
      );

      // Base UI renders a hidden input for form submission
      const hiddenInput = document.querySelector('input[name="fruit"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveValue("apple");
    });
  });
});
