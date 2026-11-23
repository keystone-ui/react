import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Field } from "@base-ui/react/field";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Mail as MailIcon, Trash2 as Trash2Icon } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from "./combobox";
import { FieldLabel, Field as KeystoneField } from "./field";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

// An empty aria-label, which counts as none.
const emptyLabel = "";
const CLEAR_SELECTION_ANYWHERE = /Clear selection/;

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

// =============================================================================
// Accessible names of the icon-only controls
// =============================================================================
const items = (
  <ComboboxContent>
    <ComboboxList>
      {(item: string) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
);

describe("Combobox accessible names", () => {
  describe("the built-in trigger of ComboboxInput", () => {
    test("is named by default when nothing labels the combobox", () => {
      render(
        <Combobox items={frameworks}>
          <ComboboxInput placeholder="Select a framework" />
          {items}
        </Combobox>
      );
      expect(
        screen.getByRole("button", { name: "Options" })
      ).toBeInTheDocument();
    });

    test("keeps the Field label as its name", () => {
      render(
        <Field.Root>
          <Field.Label>Framework</Field.Label>
          <Combobox items={frameworks}>
            <ComboboxInput placeholder="Select a framework" />
            {items}
          </Combobox>
        </Field.Root>
      );
      expect(screen.getByRole("button", { name: "Framework" })).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Options" })
      ).not.toBeInTheDocument();
    });

    // Keystone's FieldLabel is a plain <label htmlFor>: it names the input,
    // and Base UI passes nothing on to the chevron, so the default applies.
    test("under Keystone's FieldLabel the input takes the label and the chevron the default", () => {
      render(
        <KeystoneField>
          <FieldLabel htmlFor="framework">Framework</FieldLabel>
          <Combobox items={frameworks}>
            <ComboboxInput id="framework" />
            {items}
          </Combobox>
        </KeystoneField>
      );
      expect(screen.getByRole("combobox", { name: "Framework" })).toBeVisible();
      expect(
        screen.getByRole("button", { name: "Options" })
      ).toBeInTheDocument();
    });

    test("keeps the combobox's own label as its name", () => {
      render(
        <Combobox items={frameworks}>
          <ComboboxPrimitive.Label>Framework</ComboboxPrimitive.Label>
          <ComboboxInput placeholder="Select a framework" />
          {items}
        </Combobox>
      );
      expect(screen.getByRole("button", { name: "Framework" })).toBeVisible();
    });

    test("a standalone ComboboxTrigger keeps its own text and aria-label", () => {
      render(
        <Combobox items={frameworks}>
          <ComboboxInput showTrigger={false} />
          <ComboboxTrigger>Pick one</ComboboxTrigger>
          <ComboboxTrigger aria-label="Choose a framework" />
          {items}
        </Combobox>
      );
      expect(screen.getByRole("button", { name: "Pick one" })).toBeVisible();
      expect(
        screen.getByRole("button", { name: "Choose a framework" })
      ).toBeVisible();
    });
  });

  describe("the built-in chevron keeps a true name when open", () => {
    test("opened from the keyboard with Enter or Space it is still Options, expanded", async () => {
      const user = userEvent.setup();
      render(
        <Combobox items={frameworks}>
          <ComboboxInput placeholder="Select a framework" />
          {items}
        </Combobox>
      );
      await user.tab();
      await user.tab();
      const chevron = screen.getByRole("button", { name: "Options" });
      expect(chevron).toHaveFocus();
      // jsdom's role query skips the chevron once Base UI marks its addon
      // aria-hidden behind the open list, so the element is checked directly
      // here, as ControlNames in combobox.stories.tsx does in Chromium.
      await user.keyboard("{Enter}");
      await waitFor(() =>
        expect(chevron).toHaveAttribute("aria-expanded", "true")
      );
      expect(chevron).toHaveFocus();
      expect(chevron).toHaveAccessibleName("Options");
      await user.keyboard("{Escape}");
      await waitFor(() =>
        expect(chevron).toHaveAttribute("aria-expanded", "false")
      );
      await user.keyboard(" ");
      await waitFor(() =>
        expect(chevron).toHaveAttribute("aria-expanded", "true")
      );
      expect(chevron).toHaveAccessibleName("Options");
    });

    test("in an always-open inline list it is Options, expanded", () => {
      render(
        <Combobox inline items={frameworks} open>
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </Combobox>
      );
      const chevron = document.querySelector(
        '[data-slot="combobox-trigger-button"]'
      ) as HTMLElement;
      expect(chevron).toHaveAttribute("aria-expanded", "true");
      expect(chevron).toHaveAccessibleName("Options");
    });
  });

  describe("the clear button", () => {
    // The fallback is visually hidden text inside the button, so every name
    // the browser ranks above content replaces it without the library looking.
    const clearIn = (clear: ReactNode) => (
      <Combobox defaultValue="Alba" items={["Alba"]}>
        {clear}
      </Combobox>
    );

    test("<ComboboxInput showClear> is named and clears by that name", async () => {
      const handleChange = vi.fn();
      render(
        <Combobox
          defaultValue="Next.js"
          items={frameworks}
          onValueChange={handleChange}
        >
          <ComboboxInput placeholder="Select a framework" showClear />
          {items}
        </Combobox>
      );
      const button = screen.getByRole("button", { name: "Clear selection" });
      expect(button).not.toHaveAttribute("title");
      await userEvent.click(button);
      expect(handleChange).toHaveBeenCalledWith(null, expect.anything());
    });

    test("by default it is named by hidden text, with no title of the library's", () => {
      render(clearIn(<ComboboxClear />));
      const button = screen.getByRole("button", { name: "Clear selection" });
      expect(button).not.toHaveAttribute("title");
      expect(button).toHaveTextContent("Clear selection");
      expect(button.querySelector(".sr-only")).toHaveTextContent(
        "Clear selection"
      );
    });

    test("visible text rendered by the consumer names it", () => {
      render(
        clearIn(
          <ComboboxClear render={<button type="button">Reset cities</button>} />
        )
      );
      const button = screen.getByRole("button", { name: "Reset cities" });
      expect(button).toBeVisible();
      expect(button).not.toHaveTextContent("Clear selection");
      expect(button).not.toHaveAttribute("title");
    });

    test("an associated native label names it", () => {
      render(
        clearIn(
          <>
            <label htmlFor="clear-city">Effacer la ville</label>
            <ComboboxClear id="clear-city" />
          </>
        )
      );
      const button = screen.getByRole("button", { name: "Effacer la ville" });
      expect(button).not.toHaveAttribute("title");
    });

    test("a consumer's title names it, and the fallback text is left out", () => {
      render(clearIn(<ComboboxClear title="Vider" />));
      const button = screen.getByRole("button", { name: "Vider" });
      expect(button).toHaveAttribute("title", "Vider");
      expect(button).not.toHaveTextContent("Clear selection");
    });

    test("a blank title does not count as a title", () => {
      render(
        <>
          {clearIn(<ComboboxClear title="   " />)}
          {clearIn(
            <ComboboxClear render={<button title="  " type="button" />} />
          )}
        </>
      );
      const [onClear, onRender] = screen.getAllByRole("button", {
        name: "Clear selection",
      });
      expect(onClear).toHaveAttribute("title", "   ");
      expect(onRender).toHaveAttribute("title", "  ");
    });

    test("title={undefined}, on ComboboxClear or on its render element, keeps the default", () => {
      render(
        <>
          {clearIn(<ComboboxClear title={undefined} />)}
          {clearIn(
            <ComboboxClear
              render={<button title={undefined} type="button" />}
            />
          )}
          {clearIn(
            <ComboboxClear
              render={<button title={undefined} type="button" />}
              title="Effacer"
            />
          )}
        </>
      );
      const buttons = screen.getAllByRole("button", {
        name: "Clear selection",
      });
      expect(buttons).toHaveLength(3);
      for (const button of buttons) {
        expect(button).not.toHaveAttribute("title");
      }
    });

    test("a render element's title names it", () => {
      render(
        clearIn(
          <ComboboxClear render={<button title="Effacer" type="button" />} />
        )
      );
      const button = screen.getByRole("button", { name: "Effacer" });
      expect(button).toHaveAttribute("title", "Effacer");
      expect(button).not.toHaveTextContent("Clear selection");
    });

    test("aria-label={undefined} or an empty aria-label keeps the default", () => {
      render(
        <>
          {clearIn(<ComboboxClear aria-label={undefined} />)}
          {clearIn(<ComboboxClear aria-label={emptyLabel} />)}
        </>
      );
      const buttons = screen.getAllByRole("button", {
        name: "Clear selection",
      });
      expect(buttons).toHaveLength(2);
      for (const button of buttons) {
        expect(button).not.toHaveAttribute("title");
      }
    });

    test("aria-labelledby names it", () => {
      render(
        clearIn(
          <>
            <span id="clear-name">Forget the city</span>
            <ComboboxClear aria-labelledby="clear-name" />
          </>
        )
      );
      const button = screen.getByRole("button", { name: "Forget the city" });
      expect(button).not.toHaveAttribute("title");
    });

    test("an aria-label on ComboboxClear, its render element or what a render function returns wins, with no title", () => {
      render(
        <>
          {clearIn(<ComboboxClear aria-label="Reset framework" />)}
          {clearIn(
            <ComboboxClear
              render={<button aria-label="Reset town" type="button" />}
            />
          )}
          {clearIn(
            <ComboboxClear
              render={(p) => (
                <button {...p} aria-label="Reset city" type="button" />
              )}
            />
          )}
        </>
      );
      for (const name of ["Reset framework", "Reset town", "Reset city"]) {
        const button = screen.getByRole("button", { name });
        expect(button).not.toHaveAttribute("title");
        expect(button).not.toHaveAccessibleDescription("Clear selection");
      }
      expect(
        screen.queryByRole("button", { name: "Clear selection" })
      ).not.toBeInTheDocument();
    });

    test("a render function that forwards its props keeps the default", () => {
      render(
        clearIn(
          <ComboboxClear render={(p) => <button {...p} type="button" />} />
        )
      );
      expect(
        screen.getByRole("button", { name: "Clear selection" })
      ).not.toHaveAttribute("title");
    });

    test("a title on ComboboxClear beside its aria-label is kept", () => {
      render(
        clearIn(<ComboboxClear aria-label="Effacer" title="Effacer la ville" />)
      );
      expect(screen.getByRole("button", { name: "Effacer" })).toHaveAttribute(
        "title",
        "Effacer la ville"
      );
    });

    test("children given to ComboboxClear itself are not rendered", () => {
      render(clearIn(<ComboboxClear>Effacer</ComboboxClear>));
      const button = screen.getByRole("button", { name: "Clear selection" });
      expect(button).not.toHaveTextContent("Effacer");
      expect(button).not.toHaveAttribute("title");
    });

    test("a render element's title prop wins over Clear's own, even when undefined or blank", () => {
      render(
        <>
          {clearIn(
            <ComboboxClear
              render={<button title="Vider" type="button" />}
              title="Effacer"
            />
          )}
          {clearIn(
            <ComboboxClear
              render={<button title={undefined} type="button" />}
              title="Effacer"
            />
          )}
          {clearIn(
            <ComboboxClear
              render={<button title="  " type="button" />}
              title="Effacer"
            />
          )}
          {clearIn(
            <ComboboxClear
              render={<button title="Vider la ville" type="button" />}
              title="  "
            />
          )}
        </>
      );
      const [winning, undefinedTitle, blankTitle, overBlank] =
        screen.getAllByRole("button");
      expect(winning).toHaveAccessibleName("Vider");
      expect(winning).toHaveAttribute("title", "Vider");
      expect(winning).not.toHaveTextContent("Clear selection");
      expect(undefinedTitle).toHaveAccessibleName("Clear selection");
      expect(undefinedTitle).not.toHaveAttribute("title");
      expect(blankTitle).toHaveAccessibleName("Clear selection");
      expect(blankTitle).toHaveAttribute("title", "  ");
      expect(overBlank).toHaveAccessibleName("Vider la ville");
      expect(overBlank).toHaveAttribute("title", "Vider la ville");
      expect(overBlank).not.toHaveTextContent("Clear selection");
    });

    // One tooltip per case: only one tooltip is open at a time, so the
    // trigger's open marker is checked before its name.
    test.each([
      {
        placement: "an open Tooltip trigger as the render element",
        clear: <ComboboxClear render={<TooltipTrigger />} />,
        name: "Clear selection",
      },
      {
        placement:
          "an open Tooltip trigger with an aria-label as the render element",
        clear: (
          <ComboboxClear render={<TooltipTrigger aria-label="Effacer" />} />
        ),
        name: "Effacer",
      },
      {
        placement: "ComboboxClear as an open Tooltip trigger's render",
        clear: <TooltipTrigger render={<ComboboxClear />} />,
        name: "Clear selection",
      },
      {
        placement:
          "ComboboxClear with an aria-label as an open Tooltip trigger's render",
        clear: <TooltipTrigger render={<ComboboxClear aria-label="Vider" />} />,
        name: "Vider",
      },
    ])("$placement is named $name, with no title", ({ clear, name }) => {
      render(
        clearIn(
          <Tooltip defaultOpen>
            {clear}
            <TooltipContent>Tip</TooltipContent>
          </Tooltip>
        )
      );
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-popup-open");
      expect(button).toHaveAccessibleName(name);
      expect(button).not.toHaveAttribute("title");
      expect(button).not.toHaveAccessibleDescription(CLEAR_SELECTION_ANYWHERE);
    });

    // Clear's title reaches the final button only when every nested render
    // forwards it; a nested title prop, even undefined, overrides it.
    test.each([
      {
        row: "title-only, forwarded",
        aria: undefined,
        inner: <button type="button" />,
        name: "Effacer la ville",
        title: "Effacer la ville",
      },
      {
        row: "label and title, forwarded",
        aria: "Effacer",
        inner: <button type="button" />,
        name: "Effacer",
        title: "Effacer la ville",
      },
      {
        row: "label with an inner undefined title",
        aria: "Effacer",
        inner: <button title={undefined} type="button" />,
        name: "Effacer",
        title: null,
      },
    ])("nested title contract: $row", ({ aria, inner, name, title }) => {
      render(
        clearIn(
          <Tooltip>
            <ComboboxClear
              aria-label={aria}
              render={<TooltipTrigger render={inner} />}
              title="Effacer la ville"
            />
            <TooltipContent>Vider</TooltipContent>
          </Tooltip>
        )
      );
      const button = screen.getByRole("button", { name });
      expect(button.getAttribute("title")).toBe(title);
    });

    // What the docs tell a consumer who replaces the button's content.
    test("the documented replacements: an icon named by aria-label or aria-labelledby, visible text as the rendered children, a forwarded title", () => {
      render(
        <>
          {clearIn(
            <ComboboxClear
              render={
                <button aria-label="Empty town" type="button">
                  <Trash2Icon />
                </button>
              }
            />
          )}
          {clearIn(
            <>
              <span id="empty-city-name">Empty city</span>
              <ComboboxClear
                render={(p) => (
                  <button
                    {...p}
                    aria-labelledby="empty-city-name"
                    type="button"
                  >
                    <Trash2Icon />
                  </button>
                )}
              />
            </>
          )}
          {clearIn(
            <ComboboxClear
              render={(p) => (
                <button {...p} type="button">
                  Clear country
                </button>
              )}
            />
          )}
          {clearIn(
            <ComboboxClear
              render={(p) => <button {...p} type="button" />}
              title="Effacer le pays"
            />
          )}
        </>
      );
      for (const name of ["Empty town", "Empty city", "Clear country"]) {
        expect(screen.getByRole("button", { name })).not.toHaveAttribute(
          "title"
        );
      }
      expect(
        screen.getByRole("button", { name: "Effacer le pays" })
      ).toHaveAttribute("title", "Effacer le pays");
      expect(
        screen.queryByRole("button", { name: CLEAR_SELECTION_ANYWHERE })
      ).not.toBeInTheDocument();
    });
  });

  describe("a chip's remove button", () => {
    const Chips = ({
      chip,
      values = ["Next.js", "Remix"],
    }: {
      chip: (value: string) => ReactNode;
      values?: string[];
    }) => {
      const anchor = useComboboxAnchor();
      return (
        <Combobox defaultValue={values} items={values} multiple>
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(selected: string[]) => (
                <>
                  {selected.map((value) => chip(value))}
                  <ComboboxChipsInput aria-label="Frameworks" />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );
    };
    const one = (chip: ReactNode) => (
      <Chips chip={(value) => (value === "Next.js" ? chip : null)} />
    );
    const refsOf = (button: Element) =>
      (button.getAttribute("aria-labelledby") ?? "").split(" ");
    // The first reference is this button's own hidden word, the rest are
    // the chip root or the consumer's own label for the chip, in order.
    const expectRefs = (button: Element, rest: string[]) => {
      const [word, ...others] = refsOf(button);
      const carrier = document.getElementById(word ?? "");
      expect(carrier?.parentElement).toBe(button);
      expect(carrier).toHaveAttribute("role", "img");
      expect(carrier).toHaveAttribute("aria-label", "Remove");
      expect(carrier).toHaveAttribute("hidden");
      expect(carrier?.textContent).toBe("");
      expect(others).toEqual(rest);
    };
    const chipOf = (button: Element) =>
      button.closest('[data-slot="combobox-chip"]') as HTMLElement;

    test("is named after the chip's text and removes that chip", async () => {
      render(
        <Chips
          chip={(value) => (
            <ComboboxChip data-testid={`chip-${value}`} key={value}>
              {value}
            </ComboboxChip>
          )}
        />
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Remove Next.js" })
      );
      expect(screen.queryByTestId("chip-Next.js")).not.toBeInTheDocument();
      expect(screen.getByTestId("chip-Remix")).toBeInTheDocument();
    });

    test("the chip's children render directly in the chip and its text is unchanged", () => {
      render(
        <Chips
          chip={(value) => (
            <ComboboxChip data-testid={`chip-${value}`} key={value}>
              {value}
            </ComboboxChip>
          )}
          values={["Alba"]}
        />
      );
      const chip = screen.getByTestId("chip-Alba");
      expect(chip.textContent).toBe("Alba");
      expect(chip.firstElementChild).toHaveTextContent("Alba");
      expect(chip.firstElementChild).toHaveClass("truncate");
      expect(
        screen.getByRole("button", { name: "Remove Alba" })
      ).toBeInTheDocument();
    });

    test("each button references its own word, then its own chip, in that order", () => {
      render(
        <Chips
          chip={(value) => (
            <ComboboxChip key={value}>
              <strong>{value}</strong>
            </ComboboxChip>
          )}
          values={["Dover", "Dover port"]}
        />
      );
      const first = screen.getByRole("button", { name: "Remove Dover" });
      const second = screen.getByRole("button", { name: "Remove Dover port" });
      expectRefs(first, [chipOf(first).id]);
      expectRefs(second, [chipOf(second).id]);
      expect(chipOf(first).id).not.toBe(chipOf(second).id);
      expect(refsOf(first)[0]).not.toBe(refsOf(second)[0]);
    });

    test("rich chips are named from their rendered text", () => {
      render(
        <Chips
          chip={(value) =>
            value === "Next.js" ? (
              <ComboboxChip key={value}>
                <strong>Remix</strong>
              </ComboboxChip>
            ) : (
              <ComboboxChip key={value}>
                <MailIcon aria-hidden="true" />
                Elm
              </ComboboxChip>
            )
          }
        />
      );
      expect(
        screen.getByRole("button", { name: "Remove Remix" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Remove Elm" })
      ).toBeInTheDocument();
    });

    test("bare text after an icon inside a Fragment is part of the name", () => {
      render(
        one(
          <ComboboxChip key="Next.js">
            <>
              <MailIcon aria-hidden="true" />
              Elm
            </>
          </ComboboxChip>
        )
      );
      const button = screen.getByRole("button", { name: "Remove Elm" });
      expectRefs(button, [chipOf(button).id]);
    });

    test("a named icon is part of the name", () => {
      render(
        one(
          <ComboboxChip key="Next.js">
            <MailIcon aria-label="Priority" role="img" />
          </ComboboxChip>
        )
      );
      expect(
        screen.getByRole("button", { name: "Remove Priority" })
      ).toBeInTheDocument();
    });

    test("a chip with no accessible text is Remove alone", () => {
      render(
        <Chips
          chip={(value) =>
            value === "Next.js" ? (
              <ComboboxChip key={value}>
                <MailIcon aria-hidden="true" />
              </ComboboxChip>
            ) : (
              <ComboboxChip key={value} />
            )
          }
        />
      );
      expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(2);
    });

    // Each render reads the children once: a repeatable iterable follows its
    // content across renders.
    test("a reusable collection follows its content", () => {
      // One object for the whole test, yielding the city of the moment.
      const current = { city: "Paris" };
      const parts = Object.freeze({
        *[Symbol.iterator]() {
          yield current.city;
        },
      });
      const City = ({ city }: { city: string }) => {
        current.city = city;
        return one(
          <ComboboxChip data-testid="chip" key="Next.js">
            {parts as unknown as ReactNode}
          </ComboboxChip>
        );
      };
      const { rerender } = render(<City city="Paris" />);
      expect(screen.getByTestId("chip")).toHaveTextContent("Paris");
      expect(
        screen.getByRole("button", { name: "Remove Paris" })
      ).toBeInTheDocument();
      rerender(<City city="Lyon" />);
      expect(screen.getByTestId("chip")).toHaveTextContent("Lyon");
      expect(
        screen.getByRole("button", { name: "Remove Lyon" })
      ).toBeInTheDocument();
    });

    // A one-shot iterator is read on the render that receives it. Rendering
    // the chip again with the same, now exhausted, iterator is not supported:
    // use an array or a repeatable iterable, including under Strict Mode.
    test("a one-shot iterator renders on the first render", () => {
      render(
        <Chips
          chip={(value) => (
            <ComboboxChip data-testid={`chip-${value}`} key={value}>
              {[value, " Delta"].values()}
            </ComboboxChip>
          )}
        />
      );
      expect(screen.getByTestId("chip-Next.js")).toHaveTextContent(
        "Next.js Delta"
      );
      expect(
        screen.getByRole("button", { name: "Remove Next.js Delta" })
      ).toBeInTheDocument();
    });

    test("the name follows a child that changes its own text", () => {
      render(
        one(
          <ComboboxChip key="Next.js">
            <RenamingCity />
          </ComboboxChip>
        )
      );
      expect(
        screen.getByRole("button", { name: "Remove Paris" })
      ).toBeInTheDocument();
      act(() => {
        window.dispatchEvent(new Event("rename-city"));
      });
      expect(
        screen.getByRole("button", { name: "Remove Lyon" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Remove Paris" })
      ).not.toBeInTheDocument();
    });

    test("the server markup names each button, and a hydration effect renames it", async () => {
      const row = (
        <Chips
          chip={(value) => (
            <ComboboxChip key={value}>
              {value === "Next.js" ? <CityAfterHydration /> : value}
            </ComboboxChip>
          )}
        />
      );
      const host = document.createElement("div");
      host.innerHTML = renderToString(row);
      document.body.append(host);
      try {
        const buttons = () => [
          ...host.querySelectorAll('[data-slot="combobox-chip-remove"]'),
        ];
        expect(buttons()).toHaveLength(2);
        for (const button of buttons()) {
          expectRefs(button, [chipOf(button).id]);
        }
        const ids = buttons().map((button) => refsOf(button).join(" "));
        expect(buttons()[0]).toHaveAccessibleName("Remove Paris");
        expect(buttons()[1]).toHaveAccessibleName("Remove Remix");

        const errors: unknown[] = [];
        let root: Root | undefined;
        await act(async () => {
          root = hydrateRoot(host, row, {
            onRecoverableError: (error) => errors.push(error),
          });
          await Promise.resolve();
        });
        await waitFor(() =>
          expect(buttons()[0]).toHaveAccessibleName("Remove Lyon")
        );
        expect(buttons()[1]).toHaveAccessibleName("Remove Remix");
        expect(buttons().map((button) => refsOf(button).join(" "))).toEqual(
          ids
        );
        for (const button of buttons()) {
          expectRefs(button, [chipOf(button).id]);
        }
        expect(errors).toEqual([]);
        act(() => root?.unmount());
      } finally {
        host.remove();
      }
    });

    test("a non-blank removeLabel is a plain aria-label, with no reference and no word", async () => {
      render(
        <Chips
          chip={(value) => (
            <ComboboxChip
              data-testid={`chip-${value}`}
              key={value}
              removeLabel={`Drop ${value}`}
            >
              {value}
            </ComboboxChip>
          )}
        />
      );
      const button = screen.getByRole("button", { name: "Drop Remix" });
      expect(button).toHaveAttribute("aria-label", "Drop Remix");
      expect(button).not.toHaveAttribute("aria-labelledby");
      expect(button.querySelector('[role="img"]')).toBeNull();
      expect(
        screen.queryByRole("button", { name: "Remove Remix" })
      ).not.toBeInTheDocument();
      await userEvent.click(button);
      expect(screen.queryByTestId("chip-Remix")).not.toBeInTheDocument();
    });

    test("an empty or blank removeLabel keeps the default", () => {
      render(
        <Chips
          chip={(value) => (
            <ComboboxChip
              key={value}
              removeLabel={value === "Remix" ? "" : "  "}
            >
              <em>{value}</em>
            </ComboboxChip>
          )}
        />
      );
      for (const name of ["Remove Next.js", "Remove Remix"]) {
        const button = screen.getByRole("button", { name });
        expect(button).not.toHaveAttribute("aria-label");
        expectRefs(button, [chipOf(button).id]);
      }
    });

    test("showRemove={false} leaves no button and no id of the library's", () => {
      render(
        <Chips
          chip={(value) => (
            <ComboboxChip
              data-testid={`chip-${value}`}
              id={value === "Remix" ? "my-remix" : undefined}
              key={value}
              showRemove={false}
            >
              {value}
            </ComboboxChip>
          )}
        />
      );
      const chip = screen.getByTestId("chip-Next.js");
      expect(chip.textContent).toBe("Next.js");
      expect(chip.querySelector("button")).toBeNull();
      expect(chip).not.toHaveAttribute("id");
      expect(screen.getByTestId("chip-Remix")).toHaveAttribute(
        "id",
        "my-remix"
      );
    });

    test("a consumer's id on the chip is kept and referenced", () => {
      render(
        <Chips
          chip={(value) => (
            <ComboboxChip id={`my-${value}`} key={value}>
              <strong>{value}</strong>
            </ComboboxChip>
          )}
        />
      );
      const button = screen.getByRole("button", { name: "Remove Next.js" });
      expect(chipOf(button)).toHaveAttribute("id", "my-Next.js");
      expectRefs(button, ["my-Next.js"]);
    });

    test("a render element's id, or its id={undefined}, still gives the root an id the button references", () => {
      render(
        <Chips
          chip={(value) => {
            const render = {
              Alpha: <div id="render-chip" />,
              Beta: <div id={undefined} />,
              Gamma: <div id={undefined} />,
            }[value];
            return (
              <ComboboxChip
                data-testid={`chip-${value}`}
                id={value === "Gamma" ? "prop-id" : undefined}
                key={value}
                render={render}
              >
                {value}
              </ComboboxChip>
            );
          }}
          values={["Alpha", "Beta", "Gamma"]}
        />
      );
      const alpha = screen.getByRole("button", { name: "Remove Alpha" });
      expect(chipOf(alpha)).toHaveAttribute("id", "render-chip");
      expectRefs(alpha, ["render-chip"]);
      for (const value of ["Beta", "Gamma"]) {
        const button = screen.getByRole("button", { name: `Remove ${value}` });
        const chip = screen.getByTestId(`chip-${value}`);
        expect(chip).toBe(chipOf(button));
        expect(chip.id).not.toBe("");
        expect(chip.id).not.toBe("prop-id");
        expectRefs(button, [chip.id]);
      }
    });

    test("a render function that forwards its props keeps the name", () => {
      render(
        one(
          <ComboboxChip key="Next.js" render={(p) => <div {...p} />}>
            Paris
          </ComboboxChip>
        )
      );
      const button = screen.getByRole("button", { name: "Remove Paris" });
      expectRefs(button, [chipOf(button).id]);
    });

    test("an aria-label on the chip names the button after it", () => {
      render(
        one(
          <ComboboxChip aria-label="Paris, France" key="Next.js" role="group">
            Paris
          </ComboboxChip>
        )
      );
      const button = screen.getByRole("button", {
        name: "Remove Paris, France",
      });
      expectRefs(button, [chipOf(button).id]);
    });

    test("aria-labelledby on the chip or its render element is referenced directly, in order", () => {
      render(
        <>
          <span id="city-part">Paris</span>
          <span id="country-part">France</span>
          <span id="elsewhere">Elsewhere</span>
          <Chips
            chip={(value) =>
              value === "Next.js" ? (
                <ComboboxChip
                  aria-labelledby="city-part country-part"
                  key={value}
                >
                  Ignored
                </ComboboxChip>
              ) : (
                <ComboboxChip
                  key={value}
                  render={<div aria-labelledby="elsewhere" role="group" />}
                >
                  Ignored too
                </ComboboxChip>
              )
            }
          />
        </>
      );
      const ordered = screen.getByRole("button", {
        name: "Remove Paris France",
      });
      expectRefs(ordered, ["city-part", "country-part"]);
      const fromRender = screen.getByRole("button", {
        name: "Remove Elsewhere",
      });
      expectRefs(fromRender, ["elsewhere"]);
    });

    test("a blank aria-labelledby, or a render element's aria-labelledby={undefined}, falls back to the chip", () => {
      render(
        <>
          <span id="elsewhere-2">Elsewhere</span>
          <Chips
            chip={(value) =>
              value === "Next.js" ? (
                <ComboboxChip aria-labelledby="   " key={value}>
                  Paris
                </ComboboxChip>
              ) : (
                <ComboboxChip
                  aria-labelledby="elsewhere-2"
                  key={value}
                  render={<div aria-labelledby={undefined} role="group" />}
                >
                  Lyon
                </ComboboxChip>
              )
            }
          />
        </>
      );
      for (const name of ["Remove Paris", "Remove Lyon"]) {
        const button = screen.getByRole("button", { name });
        expectRefs(button, [chipOf(button).id]);
      }
    });
  });
});

// A label whose text changes on an event, after mount.
function RenamingCity() {
  const [city, setCity] = useState("Paris");
  useEffect(() => {
    const rename = () => setCity("Lyon");
    window.addEventListener("rename-city", rename);
    return () => window.removeEventListener("rename-city", rename);
  }, []);
  return <strong>{city}</strong>;
}

// A label that says "Paris" in server markup and "Lyon" once hydrated.
function CityAfterHydration() {
  const [city, setCity] = useState("Paris");
  useEffect(() => setCity("Lyon"), []);
  return <strong>{city}</strong>;
}
