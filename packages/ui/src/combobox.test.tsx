import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "./combobox";

const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
] as const;

const BasicCombobox = ({
  onValueChange,
  ...props
}: {
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}) => (
  <Combobox items={frameworks} onValueChange={onValueChange} {...props}>
    <ComboboxInput data-testid="input" placeholder="Select a framework" />
    <ComboboxContent>
      <ComboboxEmpty>No items found.</ComboboxEmpty>
      <ComboboxList>
        {(item) => (
          <ComboboxItem key={item} value={item}>
            {item}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
);

const ComboboxWithDisabledItem = ({
  onValueChange,
}: {
  onValueChange?: (value: string) => void;
}) => (
  <Combobox items={frameworks} onValueChange={onValueChange}>
    <ComboboxInput data-testid="input" placeholder="Select a framework" />
    <ComboboxContent>
      <ComboboxEmpty>No items found.</ComboboxEmpty>
      <ComboboxList>
        {(item) => (
          <ComboboxItem disabled={item === "Remix"} key={item} value={item}>
            {item}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
);

describe("Combobox", () => {
  describe("ComboboxInput", () => {
    test("renders correctly", () => {
      render(<BasicCombobox />);
      expect(screen.getByTestId("input")).toBeInTheDocument();
    });

    test("has combobox role", () => {
      render(<BasicCombobox />);
      const input = screen.getByRole("combobox");
      expect(input).toBeInTheDocument();
    });

    test("shows placeholder when no value selected", () => {
      render(<BasicCombobox />);
      expect(
        screen.getByPlaceholderText("Select a framework")
      ).toBeInTheDocument();
    });

    test("applies custom className to input group wrapper", () => {
      render(
        <Combobox items={frameworks}>
          <ComboboxInput className="custom-class" />
          <ComboboxContent>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );
      // className is applied to the InputGroup wrapper (data-slot="input-group")
      const inputGroup = document.querySelector('[data-slot="input-group"]');
      expect(inputGroup).toHaveClass("custom-class");
    });

    test("is disabled when disabled prop is true", () => {
      render(
        <Combobox items={frameworks}>
          <ComboboxInput data-testid="input" disabled />
          <ComboboxContent>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );
      const input = screen.getByRole("combobox");
      expect(input).toBeDisabled();
    });
  });

  describe("Filtering", () => {
    test("filters items based on input value", async () => {
      render(<BasicCombobox />);
      const input = screen.getByRole("combobox");

      await userEvent.click(input);
      await userEvent.type(input, "Next");

      await waitFor(() => {
        expect(screen.getByText("Next.js")).toBeInTheDocument();
        expect(screen.queryByText("SvelteKit")).not.toBeInTheDocument();
      });
    });

    test("shows empty state when no items match", async () => {
      render(<BasicCombobox />);
      const input = screen.getByRole("combobox");

      await userEvent.click(input);
      await userEvent.type(input, "xyz");

      await waitFor(() => {
        expect(screen.getByText("No items found.")).toBeInTheDocument();
      });
    });

    test("clears filter when input is cleared", async () => {
      render(<BasicCombobox />);
      const input = screen.getByRole("combobox");

      await userEvent.click(input);
      await userEvent.type(input, "Next");

      await waitFor(() => {
        expect(screen.queryByText("SvelteKit")).not.toBeInTheDocument();
      });

      await userEvent.clear(input);

      await waitFor(() => {
        expect(screen.getByText("Next.js")).toBeInTheDocument();
        expect(screen.getByText("SvelteKit")).toBeInTheDocument();
      });
    });
  });

  describe("Selection", () => {
    test("opens popup on input click", async () => {
      render(<BasicCombobox />);
      const input = screen.getByRole("combobox");

      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });

    test("shows items when opened", async () => {
      render(<BasicCombobox />);
      const input = screen.getByRole("combobox");

      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText("Next.js")).toBeInTheDocument();
        expect(screen.getByText("SvelteKit")).toBeInTheDocument();
        expect(screen.getByText("Nuxt.js")).toBeInTheDocument();
      });
    });

    test("selects item on click", async () => {
      const handleChange = vi.fn();
      render(<BasicCombobox onValueChange={handleChange} />);
      const input = screen.getByRole("combobox");

      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText("Next.js")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("Next.js"));

      expect(handleChange).toHaveBeenCalledWith("Next.js", expect.anything());
    });

    test("displays selected value in input", async () => {
      render(<BasicCombobox defaultValue="SvelteKit" />);
      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("SvelteKit");
    });

    test("does not select disabled item", async () => {
      const handleChange = vi.fn();
      render(<ComboboxWithDisabledItem onValueChange={handleChange} />);
      const input = screen.getByRole("combobox");

      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText("Remix")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("Remix"));

      expect(handleChange).not.toHaveBeenCalled();
    });

    test("closes popup after selection", async () => {
      render(<BasicCombobox />);
      const input = screen.getByRole("combobox");

      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("Next.js"));

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });
  });

  describe("Keyboard Navigation", () => {
    test("opens popup with ArrowDown key", async () => {
      render(<BasicCombobox />);
      const input = screen.getByRole("combobox");

      input.focus();
      await userEvent.keyboard("{ArrowDown}");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });

    test("closes popup with Escape key", async () => {
      render(<BasicCombobox />);
      const input = screen.getByRole("combobox");

      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await userEvent.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    test("selects item with Enter key", async () => {
      const handleChange = vi.fn();
      render(<BasicCombobox onValueChange={handleChange} />);
      const input = screen.getByRole("combobox");

      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await userEvent.keyboard("{ArrowDown}");
      await userEvent.keyboard("{Enter}");

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe("Groups and Labels", () => {
    const groupedItems = [
      { value: "Fruits", items: ["Apple", "Banana"] },
      { value: "Vegetables", items: ["Carrot", "Broccoli"] },
    ];

    test("renders group label", async () => {
      render(
        <Combobox items={groupedItems}>
          <ComboboxInput />
          <ComboboxContent>
            <ComboboxList>
              {(group) => (
                <ComboboxGroup items={group.items} key={group.value}>
                  <ComboboxLabel>{group.value}</ComboboxLabel>
                  {group.items.map((item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );

      await userEvent.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getByText("Fruits")).toBeInTheDocument();
        expect(screen.getByText("Vegetables")).toBeInTheDocument();
      });
    });

    test("renders separator", async () => {
      render(
        <Combobox items={frameworks}>
          <ComboboxInput />
          <ComboboxContent>
            <ComboboxList>
              {(item, index) => (
                <>
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                  {index === 1 && <ComboboxSeparator data-testid="separator" />}
                </>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );

      await userEvent.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getByTestId("separator")).toBeInTheDocument();
      });
    });
  });

  describe("Multiple Selection", () => {
    const MultipleCombobox = ({
      onValueChange,
    }: {
      onValueChange?: (value: string[]) => void;
    }) => (
      <Combobox items={frameworks} multiple onValueChange={onValueChange}>
        <ComboboxInput placeholder="Select frameworks" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );

    test("allows multiple selections", async () => {
      const handleChange = vi.fn();
      render(<MultipleCombobox onValueChange={handleChange} />);
      const input = screen.getByRole("combobox");

      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText("Next.js")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("Next.js"));

      // Multiple select keeps popup open
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("SvelteKit"));

      expect(handleChange).toHaveBeenLastCalledWith(
        expect.arrayContaining(["Next.js", "SvelteKit"]),
        expect.anything()
      );
    });

    test("keeps popup open after selection in multiple mode", async () => {
      render(<MultipleCombobox />);
      const input = screen.getByRole("combobox");

      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("Next.js"));

      // Popup should still be open
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });
  });

  describe("Clear Button", () => {
    test("clears selection when clicked", async () => {
      const handleChange = vi.fn();
      render(
        <Combobox
          defaultValue="Next.js"
          items={frameworks}
          onValueChange={handleChange}
        >
          <ComboboxInput placeholder="Select a framework" showClear />
          <ComboboxContent>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );

      // Select the clear button by its data-slot attribute
      const clearButton = document.querySelector(
        '[data-slot="combobox-clear"]'
      ) as HTMLButtonElement;
      expect(clearButton).toBeInTheDocument();
      await userEvent.click(clearButton);

      expect(handleChange).toHaveBeenCalledWith(null, expect.anything());
    });
  });

  describe("Chips", () => {
    const ChipsCombobox = () => {
      const anchor = useComboboxAnchor();
      return (
        <Combobox defaultValue={["Next.js"]} items={frameworks} multiple>
          <ComboboxChips data-testid="chips" ref={anchor}>
            <ComboboxValue>
              {(values: string[]) => (
                <>
                  {values.map((value) => (
                    <ComboboxChip data-testid={`chip-${value}`} key={value}>
                      {value}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput placeholder="Search..." />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );
    };

    test("renders chips for selected values", () => {
      render(<ChipsCombobox />);
      expect(screen.getByTestId("chip-Next.js")).toBeInTheDocument();
    });

    test("renders chips container with data-slot", () => {
      render(<ChipsCombobox />);
      expect(screen.getByTestId("chips")).toHaveAttribute(
        "data-slot",
        "combobox-chips"
      );
    });
  });

  describe("Form Integration", () => {
    test("supports name attribute for form submission", () => {
      render(
        <Combobox defaultValue="Next.js" items={frameworks} name="framework">
          <ComboboxInput />
          <ComboboxContent>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );

      const hiddenInput = document.querySelector('input[name="framework"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveValue("Next.js");
    });
  });
});
