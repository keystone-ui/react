import { Button } from "@keystoneui/react/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@keystoneui/react/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";
import { Switch } from "@keystoneui/react/switch";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Apple as AppleIcon,
  Banana as BananaIcon,
  Cherry as CherryIcon,
  Grape as GrapeIcon,
} from "lucide-react";
import { useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, userEvent, waitFor, within } from "storybook/test";
import SelectMultipleSelectAll from "../../docs/demos/select/multiple-select-all";
import SelectResponsive from "../../docs/demos/select/responsive";

// Custom checkbox indicator for multiple selection
function CheckboxIndicator() {
  return (
    <span className="pointer-events-none flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background group-data-selected:border-primary group-data-selected:bg-primary group-data-selected:text-primary-foreground">
      <svg
        className="size-3 opacity-0 group-data-selected:opacity-100"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        viewBox="0 0 24 24"
      >
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component: `
A common form component for choosing a predefined value in a dropdown menu.

\`\`\`tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";

// Basic usage. Pass \`items\` so \`SelectValue\` renders the label, not the raw value, in the trigger.
<Select items={{ apple: "Apple", banana: "Banana", blueberry: "Blueberry" }}>
  <SelectTrigger className="w-48">
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruits</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="blueberry">Blueberry</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>

// Multiple selection
<Select multiple defaultValue={["apple", "banana"]}>
  <SelectTrigger className="w-48">
    <SelectValue placeholder="Select fruits" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
  </SelectContent>
</Select>
\`\`\`

## Features

- Single and multiple selection support
- Grouped items with labels
- Scroll buttons for long lists
- Keyboard navigation and typeahead
- Customizable positioning (item-aligned or popper)
- Size variants (default, sm)
- Disabled and invalid states
- Form integration with Field component
`,
      },
    },
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the select is disabled",
    },
    required: {
      control: "boolean",
      description: "Whether a value is required",
    },
  },
  subcomponents: {
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectGroup,
    SelectLabel,
    SelectValue,
    SelectSeparator,
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof Select>;

// Basic select with Field
export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel>Fruit</FieldLabel>
      <Select
        items={{
          apple: "Apple",
          banana: "Banana",
          blueberry: "Blueberry",
          grapes: "Grapes",
          pineapple: "Pineapple",
        }}
      >
        <SelectTrigger className="w-full max-w-48">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldDescription>Choose your favorite fruit.</FieldDescription>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");
    await expect(trigger).toBeVisible();

    await userEvent.click(trigger);

    // Wait until the popup is mounted *and* fully revealed (past enter
    // animation). Chromatic CI runners are slower than dev, so a fixed
    // setTimeout(500) was racing the animation and the popup item was
    // still at opacity:0 when toBeVisible() ran.
    const body = within(document.body);
    await waitFor(
      async () => {
        const apple = await body.findByText("Apple");
        await expect(apple).toBeVisible();
      },
      { timeout: 5000 }
    );

    // Keyboard selection: ArrowDown highlights, Enter commits and closes.
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await waitFor(
      async () => {
        await expect(body.queryByRole("listbox")).not.toBeInTheDocument();
        await expect(trigger).not.toHaveTextContent("Select a fruit");
        await expect(trigger).toHaveTextContent(
          /apple|banana|blueberry|grapes|pineapple/i
        );
      },
      { timeout: 5000 }
    );

    // Focus returns to the trigger, which reopens from the keyboard, and
    // Escape closes without changing the value.
    await expect(trigger).toHaveFocus();
    const chosen = trigger.textContent;
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(
      async () => {
        await expect(body.getByRole("listbox")).toBeVisible();
      },
      { timeout: 5000 }
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(
      async () => {
        await expect(body.queryByRole("listbox")).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    await expect(trigger).toHaveTextContent(chosen ?? "");
    await expect(trigger).toHaveFocus();
  },
};

// Grouped items
export const Groups: Story = {
  render: () => (
    <FieldGroup className="flex-row items-start">
      <Field>
        <FieldLabel>With Labels</FieldLabel>
        <Select
          items={{
            apple: "Apple",
            banana: "Banana",
            blueberry: "Blueberry",
            carrot: "Carrot",
            broccoli: "Broccoli",
            spinach: "Spinach",
          }}
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a food" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="broccoli">Broccoli</SelectItem>
              <SelectItem value="spinach">Spinach</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Without Labels</FieldLabel>
        <Select
          items={{
            apple: "Apple",
            banana: "Banana",
            blueberry: "Blueberry",
            carrot: "Carrot",
            broccoli: "Broccoli",
            spinach: "Spinach",
          }}
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a food" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="broccoli">Broccoli</SelectItem>
              <SelectItem value="spinach">Spinach</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `SelectGroup`, `SelectLabel`, and `SelectSeparator` to organize items into groups. Labels are optional - you can use groups with just a separator to visually divide items.",
      },
    },
  },
};

// Scrollable list
export const Scrollable: Story = {
  render: () => (
    <Select
      items={{
        est: "Eastern Standard Time",
        cst: "Central Standard Time",
        mst: "Mountain Standard Time",
        pst: "Pacific Standard Time",
        akst: "Alaska Standard Time",
        hst: "Hawaii Standard Time",
        gmt: "Greenwich Mean Time",
        cet: "Central European Time",
        eet: "Eastern European Time",
        west: "Western European Summer Time",
        cat: "Central Africa Time",
        eat: "East Africa Time",
        msk: "Moscow Time",
        ist: "India Standard Time",
        cst_china: "China Standard Time",
        jst: "Japan Standard Time",
        kst: "Korea Standard Time",
        ist_indonesia: "Indonesia Central Standard Time",
        awst: "Australian Western Standard Time",
        acst: "Australian Central Standard Time",
        aest: "Australian Eastern Standard Time",
        nzst: "New Zealand Standard Time",
        fjt: "Fiji Time",
        art: "Argentina Time",
        bot: "Bolivia Time",
        brt: "Brasilia Time",
        clt: "Chile Standard Time",
      }}
    >
      <SelectTrigger className="w-full max-w-64">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="est">Eastern Standard Time</SelectItem>
          <SelectItem value="cst">Central Standard Time</SelectItem>
          <SelectItem value="mst">Mountain Standard Time</SelectItem>
          <SelectItem value="pst">Pacific Standard Time</SelectItem>
          <SelectItem value="akst">Alaska Standard Time</SelectItem>
          <SelectItem value="hst">Hawaii Standard Time</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Europe & Africa</SelectLabel>
          <SelectItem value="gmt">Greenwich Mean Time</SelectItem>
          <SelectItem value="cet">Central European Time</SelectItem>
          <SelectItem value="eet">Eastern European Time</SelectItem>
          <SelectItem value="west">Western European Summer Time</SelectItem>
          <SelectItem value="cat">Central Africa Time</SelectItem>
          <SelectItem value="eat">East Africa Time</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Asia</SelectLabel>
          <SelectItem value="msk">Moscow Time</SelectItem>
          <SelectItem value="ist">India Standard Time</SelectItem>
          <SelectItem value="cst_china">China Standard Time</SelectItem>
          <SelectItem value="jst">Japan Standard Time</SelectItem>
          <SelectItem value="kst">Korea Standard Time</SelectItem>
          <SelectItem value="ist_indonesia">
            Indonesia Central Standard Time
          </SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Australia & Pacific</SelectLabel>
          <SelectItem value="awst">Australian Western Standard Time</SelectItem>
          <SelectItem value="acst">Australian Central Standard Time</SelectItem>
          <SelectItem value="aest">Australian Eastern Standard Time</SelectItem>
          <SelectItem value="nzst">New Zealand Standard Time</SelectItem>
          <SelectItem value="fjt">Fiji Time</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>South America</SelectLabel>
          <SelectItem value="art">Argentina Time</SelectItem>
          <SelectItem value="bot">Bolivia Time</SelectItem>
          <SelectItem value="brt">Brasilia Time</SelectItem>
          <SelectItem value="clt">Chile Standard Time</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Long lists automatically become scrollable with scroll up/down buttons.",
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  render: () => (
    <FieldGroup className="w-full max-w-48">
      <Field>
        <FieldLabel>Disabled Select</FieldLabel>
        <Select
          disabled
          items={{ apple: "Apple", banana: "Banana", blueberry: "Blueberry" }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Disabled Items</FieldLabel>
        <Select
          items={{
            apple: "Apple",
            banana: "Banana",
            blueberry: "Blueberry (out of stock)",
            grapes: "Grapes (out of stock)",
            pineapple: "Pineapple",
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem disabled value="blueberry">
                Blueberry (out of stock)
              </SelectItem>
              <SelectItem disabled value="grapes">
                Grapes (out of stock)
              </SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `disabled` prop on the `Select` component to disable the entire select, or on individual `SelectItem` components to disable specific options.",
      },
    },
  },
};

// Invalid state
export const Invalid: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel>Fruit</FieldLabel>
      <Select
        items={{ apple: "Apple", banana: "Banana", blueberry: "Blueberry" }}
      >
        <SelectTrigger aria-invalid className="w-full max-w-48">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldError>Please select a fruit.</FieldError>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Add the `data-invalid` attribute to the `Field` component and the `aria-invalid` attribute to the `SelectTrigger` to show an error state.",
      },
    },
  },
};

// Align item with trigger
export const AlignItemWithTrigger: Story = {
  name: "Align Item With Trigger",
  render: () => {
    const [alignItemWithTrigger, setAlignItemWithTrigger] = useState(true);

    return (
      <FieldGroup className="w-full max-w-xs">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="align-item">
              Align Item With Trigger
            </FieldLabel>
            <FieldDescription>
              Toggle to change the popup positioning mode.
            </FieldDescription>
          </FieldContent>
          <Switch
            checked={alignItemWithTrigger}
            id="align-item"
            onCheckedChange={setAlignItemWithTrigger}
          />
        </Field>
        <Field>
          <Select
            defaultValue="banana"
            items={{
              apple: "Apple",
              banana: "Banana",
              blueberry: "Blueberry",
              grapes: "Grapes",
              pineapple: "Pineapple",
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={alignItemWithTrigger}>
              <SelectGroup>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the `alignItemWithTrigger` prop on `SelectContent` to control alignment. When `true`, the popup positions so the selected item appears over the trigger. When `false` (default), the popup aligns to the trigger edge like a standard dropdown.",
      },
    },
  },
};

// Size variants
export const Sizes: Story = {
  render: () => (
    <FieldGroup className="flex-row items-end">
      <Field>
        <FieldLabel>Default</FieldLabel>
        <Select
          defaultValue="apple"
          items={{ apple: "Apple", banana: "Banana", blueberry: "Blueberry" }}
        >
          <SelectTrigger size="default">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Small</FieldLabel>
        <Select
          defaultValue="apple"
          items={{ apple: "Apple", banana: "Banana", blueberry: "Blueberry" }}
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use the `size` prop on `SelectTrigger` to change the trigger size. Available options are `"default"` (40px) and `"sm"` (32px).',
      },
    },
  },
};

export const CompactItems: Story = {
  name: "Compact Items",
  render: () => (
    <div className="flex items-start gap-8">
      <div className="flex flex-col items-center gap-2">
        <span className="text-muted-foreground text-xs">Default (36px)</span>
        <Select
          defaultValue="apple"
          items={{
            apple: "Apple",
            banana: "Banana",
            blueberry: "Blueberry",
            grape: "Grape",
            pineapple: "Pineapple",
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectItem value="grape">Grape</SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-muted-foreground text-xs">Compact (32px)</span>
        <Select
          defaultValue="apple"
          items={{
            apple: "Apple",
            banana: "Banana",
            blueberry: "Blueberry",
            grape: "Grape",
            pineapple: "Pineapple",
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent size="compact">
            <SelectGroup>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectItem value="grape">Grape</SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use `size="compact"` on `SelectContent` to reduce item height from 36px to 32px.',
      },
    },
  },
};

// Multiple selection
const languages = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  csharp: "C#",
  php: "PHP",
  cpp: "C++",
  rust: "Rust",
  go: "Go",
  swift: "Swift",
};

type Language = keyof typeof languages;

function renderMultipleValue(value: Language[]) {
  if (value.length === 0) {
    return "Select languages…";
  }

  const firstLanguage = languages[value[0]];
  const additionalLanguages =
    value.length > 1 ? ` (+${value.length - 1} more)` : "";
  return firstLanguage + additionalLanguages;
}

export const MultipleSelection: Story = {
  name: "Multiple Selection",
  render: () => (
    <FieldGroup className="flex-row items-start">
      <Field>
        <FieldLabel>With Checkmarks</FieldLabel>
        <Select defaultValue={["javascript", "typescript"]} multiple>
          <SelectTrigger className="w-full max-w-56">
            <SelectValue>{renderMultipleValue}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(Object.keys(languages) as Language[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {languages[key]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription>Default indicator style.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>With Checkboxes</FieldLabel>
        <Select defaultValue={["javascript", "typescript"]} multiple>
          <SelectTrigger className="w-full max-w-56">
            <SelectValue>{renderMultipleValue}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(Object.keys(languages) as Language[]).map((key) => (
                <SelectItem
                  className="group"
                  indicator={<CheckboxIndicator />}
                  key={key}
                  value={key}
                >
                  {languages[key]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription>Checkbox indicator style.</FieldDescription>
      </Field>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Add the `multiple` prop to the `Select` component to allow multiple selections. You can use the default checkmark indicator or create a custom item with checkboxes.",
      },
    },
  },
};

// Controlled
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);

    return (
      <FieldGroup className="w-full max-w-xs">
        <Field>
          <FieldLabel>Fruit</FieldLabel>
          <Select
            items={{
              apple: "Apple",
              banana: "Banana",
              blueberry: "Blueberry",
              grapes: "Grapes",
              pineapple: "Pineapple",
            }}
            onValueChange={setValue}
            value={value}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>Selected value: {value ?? "none"}</FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <Button onClick={() => setValue(null)} size="sm" variant="outline">
            Clear
          </Button>
          <Button
            onClick={() => setValue("banana")}
            size="sm"
            variant="outline"
          >
            Set Banana
          </Button>
        </Field>
      </FieldGroup>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the `value` and `onValueChange` props to control the select externally.",
      },
    },
  },
};

// With icons
export const WithIcons: Story = {
  name: "With Icons",
  render: () => (
    <Select
      items={{
        apple: (
          <>
            <AppleIcon className="size-4" />
            Apple
          </>
        ),
        banana: (
          <>
            <BananaIcon className="size-4" />
            Banana
          </>
        ),
        cherry: (
          <>
            <CherryIcon className="size-4" />
            Cherry
          </>
        ),
        grapes: (
          <>
            <GrapeIcon className="size-4" />
            Grapes
          </>
        ),
      }}
    >
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">
            <AppleIcon className="size-4" />
            Apple
          </SelectItem>
          <SelectItem value="banana">
            <BananaIcon className="size-4" />
            Banana
          </SelectItem>
          <SelectItem value="cherry">
            <CherryIcon className="size-4" />
            Cherry
          </SelectItem>
          <SelectItem value="grapes">
            <GrapeIcon className="size-4" />
            Grapes
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Add icons to `SelectItem` by including them as children alongside the text.",
      },
    },
  },
};

// Form example
export const FormExample: Story = {
  name: "Form",
  render: () => (
    <form
      className="w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        alert(
          `Country: ${formData.get("country")}\nState: ${formData.get("state")}`
        );
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Country</FieldLabel>
          <Select
            defaultValue="us"
            items={{
              us: "United States",
              ca: "Canada",
              uk: "United Kingdom",
              au: "Australia",
            }}
            name="country"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>State</FieldLabel>
          <Select
            items={{
              ca: "California",
              ny: "New York",
              tx: "Texas",
              fl: "Florida",
            }}
            name="state"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ca">California</SelectItem>
                <SelectItem value="ny">New York</SelectItem>
                <SelectItem value="tx">Texas</SelectItem>
                <SelectItem value="fl">Florida</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field orientation="horizontal">
          <Button type="reset" variant="outline">
            Reset
          </Button>
          <Button type="submit">Submit</Button>
        </Field>
      </FieldGroup>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `name` prop on `Select` to include the selected value in form submissions.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Worst case
// ---------------------------------------------------------------------------

/**
 * Realistic worst-case data, not lorem: an 80-character address with no
 * break opportunity, a four-digit page, counts of exactly 0 and 1. The play
 * test measures real layout in the browser, so a regression to overflowing
 * text fails here rather than in a user's account menu.
 */
const WORST_EMAIL =
  "bartholomew.fitzgerald-wisniewska@northwind-industries-holdings-emea.example.com";

/** `inner` lies inside `outer`, with half a pixel for subpixel rounding. */
function expectInside(inner: DOMRect, outer: { left: number; right: number }) {
  expect(inner.left).toBeGreaterThanOrEqual(outer.left - 0.5);
  expect(inner.right).toBeLessThanOrEqual(outer.right + 0.5);
}

/** The element's content fits its box: nothing spills past the border. */
function expectNoOverflow(el: Element) {
  expect(el.scrollWidth).toBeLessThanOrEqual(el.clientWidth);
}

const viewport = () => ({ left: 0, right: window.innerWidth });

export const WorstCase: Story = {
  name: "Worst case",
  render: () => (
    <div className="w-80" data-testid="frame">
      <Select
        defaultValue="email"
        items={{ email: WORST_EMAIL, jo: "Jo", members: "1 member" }}
      >
        <SelectTrigger aria-label="Recipient">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="email">{WORST_EMAIL}</SelectItem>
            <SelectItem value="jo">Jo</SelectItem>
            <SelectItem value="members">{1} member</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTestId("frame").getBoundingClientRect();
    const trigger = canvas.getByRole("combobox");
    await expect(trigger).toHaveTextContent(WORST_EMAIL);

    // The trigger stops at its container and the label ellipsizes inside it,
    // so the chevron stays on screen instead of being pushed past the edge.
    const triggerRect = trigger.getBoundingClientRect();
    expectInside(triggerRect, frame);
    expectNoOverflow(trigger);
    const chevron = trigger.lastElementChild as Element;
    expectInside(chevron.getBoundingClientRect(), triggerRect);

    await userEvent.click(trigger);
    const body = within(document.body);
    await waitFor(
      async () => {
        await expect(body.getByRole("option", { name: /^Jo$/ })).toBeVisible();
      },
      { timeout: 5000 }
    );

    const popup = document.querySelector(
      '[data-slot="select-content"]'
    ) as HTMLElement;
    expectInside(popup.getBoundingClientRect(), viewport());
    for (const option of body.getAllByRole("option")) {
      expectNoOverflow(option);
    }

    // The z-index lives on the positioned element, where it is not trapped
    // inside a stacking context of its own making.
    await expect(
      getComputedStyle(popup.parentElement as HTMLElement).zIndex
    ).toBe("60");

    await userEvent.keyboard("{Escape}");
  },
};

// ---------------------------------------------------------------------------
// Docs examples: responsive (Drawer on phones) and select-all
// ---------------------------------------------------------------------------

/** Runs under the test runner only: hidden from the sidebar and the docs. */
const TEST_ONLY: Story["tags"] = ["!dev", "!autodocs"];

/** Vitest's tester page; absent when Storybook itself runs the play. */
interface RealPage {
  viewport: (width: number, height: number) => Promise<void>;
}
const realPage = () => (globalThis as { __realPage?: RealPage }).__realPage;

/** Vitest browser mode's default tester size, restored after each play. */
const TESTER_VIEWPORT = { width: 414, height: 896 } as const;
const PHONE = { width: 390, height: 844 } as const;
const DESKTOP = { width: 1280, height: 800 } as const;

/** Whether the page's viewport scroller is locked (Base UI's scroll lock). */
function pageScrollLocked() {
  const html = document.documentElement;
  return [html, document.body].some((el) =>
    /hidden|clip/.test(getComputedStyle(el).overflowY)
  );
}

/** The box a visitor sees, compared between the two branches' triggers. */
function triggerLook(el: HTMLElement) {
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    width: Math.round(r.width),
    height: Math.round(r.height),
    left: Math.round(r.left),
    top: Math.round(r.top),
    border: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
    radius: s.borderTopLeftRadius,
    background: s.backgroundColor,
    padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
    font: `${s.fontSize} ${s.fontWeight} ${s.lineHeight}`,
    color: s.color,
    shadow: s.boxShadow,
  };
}

/** Whether Base UI has hidden the canvas from assistive tech or made it inert. */
const outsideHidden = (canvas: HTMLElement) =>
  canvas.closest("[aria-hidden='true'], [inert], [data-base-ui-inert]") !==
  null;

const phoneTrigger = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>('[data-slot="drawer-trigger"]');
const desktopTrigger = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>('[data-slot="select-trigger"]');

function settle<T>(check: () => T | Promise<T>): Promise<T> {
  return waitFor(check, { timeout: 5000 });
}

/**
 * The `select-responsive` docs example: a Select from 768px up, a Drawer with
 * a listbox below it, one value shared by both.
 */
export const Responsive: Story = {
  render: () => <SelectResponsive />,
  play: async ({ canvasElement }) => {
    const page = realPage();
    const body = within(document.body);
    try {
      if (page) {
        await page.viewport(PHONE.width, PHONE.height);
      } else if (window.innerWidth >= 768) {
        // Storybook's own canvas at desktop width: the phone branch is not
        // there to drive. The test runner sets the viewport itself.
        return;
      }
      // Phone branch: a button that opens a dialog, never a combobox.
      const trigger = await settle(() => {
        const el = phoneTrigger(canvasElement);
        expect(el).not.toBeNull();
        return el as HTMLButtonElement;
      });
      await expect(desktopTrigger(canvasElement)).toBeNull();
      await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
      await expect(trigger).toHaveAccessibleName("Timezone UTC");
      const phoneLook = triggerLook(trigger);
      const unlocked = pageScrollLocked();
      // The chevron turns like the Select's: read once its transition settles.
      const chevronRotate = () =>
        getComputedStyle(trigger.querySelector("svg") as SVGElement).rotate;
      await settle(() => expect(chevronRotate()).toBe("none"));

      // Keyboard: open, the chosen option is marked and focused.
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      const listbox = await settle(() =>
        expect(body.getByRole("listbox", { name: /^Timezone$/ })).toBeVisible()
      ).then(() => body.getByRole("listbox", { name: /^Timezone$/ }));
      const utc = within(listbox).getByRole("option", { name: /^UTC$/ });
      await expect(utc).toHaveAttribute("aria-selected", "true");
      await settle(() => expect(document.activeElement).toBe(utc));
      await settle(() => expect(chevronRotate()).toBe("180deg"));

      // Arrows move focus without choosing; Enter chooses, closes, refocuses.
      await userEvent.keyboard("{ArrowDown}");
      const cet = within(listbox).getByRole("option", {
        name: /^Central European Time$/,
      });
      await expect(document.activeElement).toBe(cet);
      await expect(utc).toHaveAttribute("aria-selected", "true");
      await userEvent.keyboard("{Enter}");
      await settle(() => expect(body.queryByRole("listbox")).toBeNull());
      await settle(() => expect(document.activeElement).toBe(trigger));
      await expect(trigger).toHaveAccessibleName(
        "Timezone Central European Time"
      );
      await settle(() => expect(chevronRotate()).toBe("none"));

      // Home/End reach the ends; Escape closes without a change.
      await userEvent.keyboard("{Enter}");
      await settle(() =>
        expect(
          body.getByRole("option", { name: /^Central European Time$/ })
        ).toHaveFocus()
      );
      await userEvent.keyboard("{End}");
      await expect(
        body.getByRole("option", { name: /^Japan Standard Time$/ })
      ).toHaveFocus();
      await userEvent.keyboard("{Home}");
      await expect(body.getByRole("option", { name: /^UTC$/ })).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await settle(() => expect(body.queryByRole("listbox")).toBeNull());
      await settle(() => expect(document.activeElement).toBe(trigger));
      await expect(trigger).toHaveAccessibleName(
        "Timezone Central European Time"
      );

      // Pointer: a tap chooses and closes.
      await userEvent.click(trigger);
      await userEvent.click(
        await settle(() => body.getByRole("option", { name: /^Eastern Time$/ }))
      );
      await settle(() => expect(body.queryByRole("listbox")).toBeNull());
      await expect(trigger).toHaveAccessibleName("Timezone Eastern Time");

      if (!page) {
        return;
      }

      // Crossing the breakpoint while the Drawer is open: it unmounts, the
      // value survives, nothing stays open or scroll-locked.
      await userEvent.click(trigger);
      await settle(() => expect(body.getByRole("listbox")).toBeVisible());
      // Positive controls: the open Drawer locks the page and hides the rest.
      await expect(unlocked).toBe(false);
      await settle(() => expect(pageScrollLocked()).toBe(true));
      await expect(outsideHidden(canvasElement)).toBe(true);
      await page.viewport(DESKTOP.width, DESKTOP.height);
      const combobox = await settle(() => {
        const el = desktopTrigger(canvasElement);
        expect(el).not.toBeNull();
        return el as HTMLButtonElement;
      });
      await settle(() => expect(body.queryByRole("dialog")).toBeNull());
      await expect(body.queryByRole("listbox")).toBeNull();
      await expect(combobox).toHaveTextContent("Eastern Time");
      await expect(combobox).toHaveAttribute("aria-expanded", "false");
      await settle(() => expect(pageScrollLocked()).toBe(unlocked));
      await settle(() => expect(outsideHidden(canvasElement)).toBe(false));
      await expect(combobox).toHaveAccessibleName("Timezone");

      // The two triggers look the same, so the server's phone markup does
      // not jump when a desktop visitor hydrates.
      await expect(triggerLook(combobox)).toEqual({
        ...phoneLook,
        left: triggerLook(combobox).left,
        top: triggerLook(combobox).top,
      });

      // And back: the open Select unmounts on the way down.
      await userEvent.click(combobox);
      await settle(() =>
        expect(body.getByRole("option", { name: /^UTC$/ })).toBeVisible()
      );
      await settle(() => expect(pageScrollLocked()).toBe(true));
      await expect(outsideHidden(canvasElement)).toBe(true);
      await page.viewport(PHONE.width, PHONE.height);
      const again = await settle(() => {
        const el = phoneTrigger(canvasElement);
        expect(el).not.toBeNull();
        return el as HTMLButtonElement;
      });
      await settle(() =>
        expect(
          document.querySelector('[data-slot="select-content"]')
        ).toBeNull()
      );
      await expect(body.queryByRole("dialog")).toBeNull();
      await expect(again).toHaveAccessibleName("Timezone Eastern Time");
      await settle(() => expect(pageScrollLocked()).toBe(unlocked));
      await settle(() => expect(outsideHidden(canvasElement)).toBe(false));
    } finally {
      await page?.viewport(TESTER_VIEWPORT.width, TESTER_VIEWPORT.height);
    }
  },
};

/**
 * First paint of `select-responsive` for a desktop visitor: the server has no
 * viewport, so its HTML is the phone branch. Hydrating it at 1280px must not
 * warn, and the trigger must not move or resize when it swaps to the Select.
 */
export const ResponsiveFirstPaint: Story = {
  tags: TEST_ONLY,
  render: () => <div data-testid="host" />,
  play: async ({ canvasElement }) => {
    const page = realPage();
    if (!page) {
      return;
    }
    const host = canvasElement.querySelector(
      '[data-testid="host"]'
    ) as HTMLElement;
    const errors: string[] = [];
    const error = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(String(args[0]));
      error(...args);
    };
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await page.viewport(DESKTOP.width, DESKTOP.height);
      host.innerHTML = renderToString(<SelectResponsive />);
      const server = phoneTrigger(host);
      await expect(server).not.toBeNull();
      await expect(desktopTrigger(host)).toBeNull();
      const serverLook = triggerLook(server as HTMLElement);
      const serverHeight = host.getBoundingClientRect().height;

      root = hydrateRoot(host, <SelectResponsive />, {
        onRecoverableError: (e) => errors.push(String(e)),
      });
      const client = await settle(() => {
        const el = desktopTrigger(host);
        expect(el).not.toBeNull();
        return el as HTMLElement;
      });
      await expect(triggerLook(client)).toEqual(serverLook);
      await expect(host.getBoundingClientRect().height).toBe(serverHeight);
      await expect(client).toHaveTextContent("UTC");
      await expect(errors).toEqual([]);
    } finally {
      root?.unmount();
      console.error = error;
      await page.viewport(TESTER_VIEWPORT.width, TESTER_VIEWPORT.height);
    }
  },
};

/** The select-all demo's language ids, disabled one included. */
const languageIds = [
  "javascript",
  "typescript",
  "python",
  "java",
  "rust",
  "go",
  "swift",
];

/** Everything the select-all demo's change handler hands on, per play. */
const selectAllChanges: string[][] = [];

/** The handler's calls so far: exactly `count`, the last one `ids`. */
async function expectChanges(
  changes: string[][],
  count: number,
  ids: string[]
) {
  await settle(() => expect(changes.length).toBe(count));
  await expect([...(changes.at(-1) ?? [])].sort()).toEqual(ids);
}

/**
 * The `select-multiple-select-all` docs example: "Select all" has three
 * states and toggles every enabled option, never a disabled one.
 */
export const MultipleSelectAll: Story = {
  render: () => (
    <form>
      <SelectMultipleSelectAll
        onValueChange={(value) => selectAllChanges.push(value)}
      />
    </form>
  ),
  play: async ({ canvasElement }) => {
    selectAllChanges.length = 0;
    const canvas = within(canvasElement);
    const body = within(document.body);
    const form = canvasElement.querySelector("form") as HTMLFormElement;
    const submitted = () => new FormData(form).getAll("languages").sort();
    // A stable name; the value is asserted apart from it.
    const trigger = canvas.getByRole("combobox", { name: /^Languages$/ });
    const enabled = [
      "JavaScript",
      "TypeScript",
      "Python",
      "Rust",
      "Go",
      "Swift",
    ];
    const enabledIds = [
      "go",
      "javascript",
      "python",
      "rust",
      "swift",
      "typescript",
    ];
    const row = () => body.getByRole("option", { name: /^Select all$/ });
    // The row exposes one state: selected only when every enabled language
    // is, with the count as its description. Never aria-checked.
    const rowState = () => ({
      selected: row().getAttribute("aria-selected"),
      checked: row().getAttribute("aria-checked"),
      mark: row()
        .querySelector("[data-select-all]")
        ?.getAttribute("data-select-all"),
    });
    const selected = () =>
      body
        .getAllByRole("option")
        .filter((o) => o.getAttribute("aria-selected") === "true")
        .map((o) => o.textContent?.trim());

    // Some: two of six enabled options start selected.
    await expect(trigger).toHaveTextContent("JavaScript (+1 more)");
    await expect(submitted()).toEqual(["javascript", "typescript"]);
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await settle(() => expect(row()).toBeVisible());
    await expect(rowState()).toEqual({
      selected: "false",
      checked: null,
      mark: "some",
    });
    await expect(row()).toHaveAccessibleDescription(
      "2 of 6 languages selected"
    );

    // The row's mark sits where the options' checkmarks do: same column,
    // centred on its own row.
    const center = (r: DOMRect) => r.top + r.height / 2;
    const rowBox = row().getBoundingClientRect();
    const markBox = (
      row().querySelector("[data-select-all]") as HTMLElement
    ).getBoundingClientRect();
    const checkBox = (
      body
        .getByRole("option", { name: /^JavaScript$/ })
        .querySelector("svg") as SVGElement
    ).getBoundingClientRect();
    await expect(Math.abs(center(markBox) - center(rowBox))).toBeLessThan(1);
    await expect(Math.abs(markBox.right - checkBox.right)).toBeLessThan(1);

    // Keyboard to the row, Enter: all enabled options, the disabled one stays.
    await settle(() =>
      expect(
        document.querySelector('[role="option"][data-highlighted]')
      ).not.toBeNull()
    );
    await userEvent.keyboard("{Home}");
    await settle(() => expect(row()).toHaveAttribute("data-highlighted"));
    await userEvent.keyboard("{Enter}");
    await settle(() => expect(rowState().mark).toBe("all"));
    await expect(rowState()).toEqual({
      selected: "true",
      checked: null,
      mark: "all",
    });
    await expect(row()).toHaveAccessibleDescription(
      "6 of 6 languages selected"
    );
    await expect(selected()).toEqual(["Select all", ...enabled]);
    await expect(
      body.getByRole("option", { name: /Java \(legacy\)/ })
    ).toHaveAttribute("aria-selected", "false");
    await expect(trigger).toHaveTextContent("All languages");
    await settle(() => expect(submitted()).toEqual(enabledIds));
    await expectChanges(selectAllChanges, 1, enabledIds);

    // All → none, with Space this time.
    await userEvent.keyboard(" ");
    await settle(() => expect(rowState().mark).toBe("none"));
    await expect(rowState()).toEqual({
      selected: "false",
      checked: null,
      mark: "none",
    });
    await expect(row()).toHaveAccessibleDescription(
      "0 of 6 languages selected"
    );
    await expect(selected()).toEqual([]);
    await expect(trigger).toHaveTextContent("Select languages…");
    await settle(() => expect(submitted()).toEqual([]));
    await expectChanges(selectAllChanges, 2, []);

    // One option by pointer → some again; the list stays open.
    await userEvent.click(body.getByRole("option", { name: /^Rust$/ }));
    await settle(() => expect(rowState().mark).toBe("some"));
    await expect(selected()).toEqual(["Rust"]);
    await expect(trigger).toHaveTextContent("Rust");

    // Selecting the rest one by one reaches "all" without the row.
    for (const name of enabled.filter((n) => n !== "Rust")) {
      // biome-ignore lint/performance/noAwaitInLoops: one click at a time
      await userEvent.click(body.getByRole("option", { name }));
    }
    await settle(() => expect(rowState().selected).toBe("true"));
    await expect(trigger).toHaveTextContent("All languages");
    await settle(() => expect(submitted()).toEqual(enabledIds));

    // Deselecting one language from "all" → some, and only language ids go
    // to the form.
    await userEvent.click(body.getByRole("option", { name: /^Go$/ }));
    await settle(() => expect(rowState().mark).toBe("some"));
    await expect(rowState().selected).toBe("false");
    await settle(() =>
      expect(submitted()).toEqual(enabledIds.filter((id) => id !== "go"))
    );
    // Rust, then five more, then Go: one call each.
    await expectChanges(
      selectAllChanges,
      9,
      enabledIds.filter((id) => id !== "go")
    );

    // Typeahead still reaches the row.
    await userEvent.keyboard("{End}");
    await settle(() =>
      expect(body.getByRole("option", { name: /^Swift$/ })).toHaveAttribute(
        "data-highlighted"
      )
    );
    await userEvent.keyboard("sel");
    await settle(() => expect(row()).toHaveAttribute("data-highlighted"));

    // The change handler only ever handed on language ids.
    await expect(selectAllChanges.length).toBeGreaterThan(0);
    await expect(
      selectAllChanges.flat().filter((v) => !languageIds.includes(v))
    ).toEqual([]);

    await userEvent.keyboard("{Escape}");
    await settle(() =>
      expect(body.queryByRole("option", { name: /^Select all$/ })).toBeNull()
    );
  },
};

/** Vitest's real input; absent when Storybook itself runs the play. */
interface RealInput {
  click: (element: Element) => Promise<void>;
  keyboard: (text: string) => Promise<void>;
}
interface RealCommands {
  pointerDown: () => Promise<void>;
  pointerMoveTo: (selector: string) => Promise<void>;
  pointerUp: () => Promise<void>;
}
const realInput = () =>
  (globalThis as { __realUserEvent?: RealInput }).__realUserEvent;
const realCommands = () =>
  (globalThis as { __realCommands?: RealCommands }).__realCommands;

const gestureChanges: string[][] = [];

const gestureRender = () => (
  <form>
    <SelectMultipleSelectAll
      onValueChange={(value) => gestureChanges.push(value)}
    />
  </form>
);

/** What the gesture plays share: real input, the form, the row. */
function gestureFixture(canvasElement: HTMLElement) {
  gestureChanges.length = 0;
  const body = within(document.body);
  const form = canvasElement.querySelector("form") as HTMLFormElement;
  const trigger = within(canvasElement).getByRole("combobox", {
    name: /^Languages$/,
  });
  return {
    body,
    trigger,
    submitted: () => new FormData(form).getAll("languages").sort(),
    row: () => body.getByRole("option", { name: /^Select all$/ }),
    open: () => expect(trigger).toHaveAttribute("aria-expanded", "true"),
    closed: () => expect(trigger).toHaveAttribute("aria-expanded", "false"),
    enabledIds: ["go", "javascript", "python", "rust", "swift", "typescript"],
  };
}

/** A click on the visible "Languages" label opens its own Select. */
export const MultipleSelectAllLabelClick: Story = {
  tags: TEST_ONLY,
  render: gestureRender,
  play: async ({ canvasElement }) => {
    const user = realInput();
    if (!user) {
      return;
    }
    const f = gestureFixture(canvasElement);
    try {
      await user.click(canvasElement.querySelector("label") as HTMLElement);
      await settle(f.open);
      await settle(() => expect(f.row()).toBeVisible());
    } finally {
      await user.keyboard("{Escape}");
    }
  },
};

/**
 * A pointer-free click on the row while Swift has focus moves focus to the
 * row, so the next Space acts on the row (clears all), not on Swift.
 */
export const MultipleSelectAllVirtualClick: Story = {
  tags: TEST_ONLY,
  render: gestureRender,
  play: async ({ canvasElement }) => {
    const user = realInput();
    if (!user) {
      return;
    }
    const f = gestureFixture(canvasElement);
    try {
      f.trigger.focus();
      await user.keyboard("{ArrowDown}");
      await settle(() => expect(f.row()).toBeVisible());
      await user.keyboard("{End}");
      const swift = f.body.getByRole("option", { name: /^Swift$/ });
      await settle(() => expect(swift).toHaveFocus());
      f.row().click();
      await expectChanges(gestureChanges, 1, f.enabledIds);
      await settle(() => expect(f.row()).toHaveFocus());
      await user.keyboard(" ");
      await expectChanges(gestureChanges, 2, []);
      await settle(() => expect(f.submitted()).toEqual([]));
    } finally {
      await user.keyboard("{Escape}");
    }
  },
};

/**
 * Two direct clicks on the row (all, then none), close, then a real drag
 * from the trigger released on the row: one change, to all.
 */
export const MultipleSelectAllDragAfterClicks: Story = {
  tags: TEST_ONLY,
  render: gestureRender,
  play: async ({ canvasElement }) => {
    const user = realInput();
    const commands = realCommands();
    if (!(user && commands)) {
      return;
    }
    const f = gestureFixture(canvasElement);
    let held = false;
    try {
      await user.click(f.trigger);
      await settle(() => expect(f.row()).toBeVisible());
      await user.click(f.row());
      await expectChanges(gestureChanges, 1, f.enabledIds);
      await user.click(f.row());
      await expectChanges(gestureChanges, 2, []);
      await user.keyboard("{Escape}");
      await settle(f.closed);

      await commands.pointerMoveTo('[data-slot="select-trigger"]');
      await commands.pointerDown();
      held = true;
      await settle(f.open);
      await settle(() => expect(f.row()).toBeVisible());
      // One step onto the row: a real pointermove with the button held, far
      // enough for the item to accept the release before the 400ms guard.
      await commands.pointerMoveTo('[role="option"]:has([data-select-all])');
      await commands.pointerUp();
      held = false;
      await expectChanges(gestureChanges, 3, f.enabledIds);
      await settle(() => expect(f.submitted()).toEqual(f.enabledIds));
    } finally {
      // Release only a button this play still holds: a second release over
      // the open list would activate the row again.
      if (held) {
        await commands.pointerUp();
      }
      await user.keyboard("{Escape}");
    }
    await expectChanges(gestureChanges, 3, f.enabledIds);
  },
};

/**
 * A real click on the responsive example's visible "Timezone" label opens
 * whichever control is shown. One id serves both triggers: only one branch
 * is mounted at a time.
 */
async function clickTimezoneLabel(
  canvasElement: HTMLElement,
  size: { width: number; height: number }
) {
  const page = realPage();
  const user = realInput();
  if (!(page && user)) {
    return;
  }
  const body = within(document.body);
  try {
    await page.viewport(size.width, size.height);
    const phone = size.width < 768;
    const trigger = await settle(() => {
      const el = phone
        ? phoneTrigger(canvasElement)
        : desktopTrigger(canvasElement);
      expect(el).not.toBeNull();
      return el as HTMLButtonElement;
    });
    await expect(
      document.querySelectorAll(`[id="${trigger.id}"]`)
    ).toHaveLength(1);
    await user.click(canvasElement.querySelector("label") as HTMLElement);
    if (phone) {
      await settle(() =>
        expect(body.getByRole("listbox", { name: /^Timezone$/ })).toBeVisible()
      );
    } else {
      await settle(() =>
        expect(trigger).toHaveAttribute("aria-expanded", "true")
      );
      await settle(() =>
        expect(body.getByRole("option", { name: /^UTC$/ })).toBeVisible()
      );
    }
    await user.keyboard("{Escape}");
    await settle(() => expect(body.queryByRole("option")).toBeNull());
  } finally {
    await page.viewport(TESTER_VIEWPORT.width, TESTER_VIEWPORT.height);
  }
}

/** The label opens the Drawer at a phone width. */
export const ResponsiveLabelClickPhone: Story = {
  tags: TEST_ONLY,
  render: () => <SelectResponsive />,
  play: ({ canvasElement }) => clickTimezoneLabel(canvasElement, PHONE),
};

/** The label opens the Select at a desktop width. */
export const ResponsiveLabelClickDesktop: Story = {
  tags: TEST_ONLY,
  render: () => <SelectResponsive />,
  play: ({ canvasElement }) => clickTimezoneLabel(canvasElement, DESKTOP),
};
