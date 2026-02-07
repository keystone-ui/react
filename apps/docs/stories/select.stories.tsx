import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@keystone/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@keystone/ui/field";
import { Switch } from "@keystone/ui/switch";
import { Button } from "@keystone/ui/button";
import { AppleIcon, BananaIcon, GrapeIcon, CherryIcon } from "lucide-react";

// Custom checkbox indicator for multiple selection
function CheckboxIndicator() {
  return (
    <span className="border-input bg-background group-data-selected:bg-primary group-data-selected:border-primary group-data-selected:text-primary-foreground pointer-events-none flex size-4 shrink-0 items-center justify-center rounded-[4px] border">
      <svg
        className="size-3 opacity-0 group-data-selected:opacity-100"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
} from "@keystone/ui/select";

// Basic usage
<Select>
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
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof Select>;

// Basic select with Field
export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel>Fruit</FieldLabel>
      <Select>
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
};

// Grouped items
export const Groups: Story = {
  render: () => (
    <FieldGroup className="flex-row items-start">
      <Field>
        <FieldLabel>With Labels</FieldLabel>
        <Select>
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
        <Select>
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
    <Select>
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
        <Select disabled>
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
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry" disabled>
                Blueberry (out of stock)
              </SelectItem>
              <SelectItem value="grapes" disabled>
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
      <Select>
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
            <FieldLabel htmlFor="align-item">Align Item With Trigger</FieldLabel>
            <FieldDescription>
              Toggle to change the popup positioning mode.
            </FieldDescription>
          </FieldContent>
          <Switch
            id="align-item"
            checked={alignItemWithTrigger}
            onCheckedChange={setAlignItemWithTrigger}
          />
        </Field>
        <Field>
          <Select defaultValue="banana">
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
        <Select defaultValue="apple">
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
        <Select defaultValue="apple">
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
          'Use the `size` prop on `SelectTrigger` to change the size. Available options are `"default"` and `"sm"`.',
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
  render: () => {
    return (
      <FieldGroup className="flex-row items-start">
        <Field>
          <FieldLabel>With Checkmarks</FieldLabel>
          <Select multiple defaultValue={["javascript", "typescript"]}>
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
          <Select multiple defaultValue={["javascript", "typescript"]}>
            <SelectTrigger className="w-full max-w-56">
              <SelectValue>{renderMultipleValue}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(Object.keys(languages) as Language[]).map((key) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="group"
                    indicator={<CheckboxIndicator />}
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
    );
  },
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
          <Select value={value} onValueChange={setValue}>
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
          <FieldDescription>
            Selected value: {value ?? "none"}
          </FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setValue(null)}
          >
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setValue("banana")}
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
    <Select>
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
          <Select name="country" defaultValue="us">
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
          <Select name="state">
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

