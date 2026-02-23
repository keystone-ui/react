import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";
import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  ListChecksIcon,
  ListIcon,
  ListOrderedIcon,
  UnderlineIcon,
} from "lucide-react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    docs: {
      description: {
        component: `
A group of toggle buttons with shared selection state.

\`\`\`tsx
import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";

// Multiple selection
<ToggleGroup multiple variant="outline">
  <ToggleGroupItem value="bold" aria-label="Toggle bold">
    <BoldIcon />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Toggle italic">
    <ItalicIcon />
  </ToggleGroupItem>
  <ToggleGroupItem value="underline" aria-label="Toggle underline">
    <UnderlineIcon />
  </ToggleGroupItem>
</ToggleGroup>

// Single selection
<ToggleGroup defaultValue={["left"]}>
  <ToggleGroupItem value="left" aria-label="Align left">
    <AlignLeftIcon />
  </ToggleGroupItem>
  <ToggleGroupItem value="center" aria-label="Align center">
    <AlignCenterIcon />
  </ToggleGroupItem>
  <ToggleGroupItem value="right" aria-label="Align right">
    <AlignRightIcon />
  </ToggleGroupItem>
</ToggleGroup>
\`\`\`

## Features

- Two variants: \`default\` and \`outline\`
- Three sizes: \`sm\`, \`default\`, \`lg\`
- Single or multiple selection modes
- \`spacing\` prop: \`0\` (default) joins items with connected borders, \`>0\` adds a gap
- \`orientation\` prop: \`horizontal\` (default) or \`vertical\`
- Controlled and uncontrolled value management
- Keyboard navigation via Base UI ToggleGroup primitive
- Group-level variant, size, spacing, and orientation props cascade to items via context

## ButtonGroup vs ToggleGroup

Use the **ButtonGroup** component when you want to group buttons that perform an action.
Use the **ToggleGroup** component when you want to group buttons that toggle a state.
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
      description: "The visual style applied to all items",
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "The size applied to all items",
    },
    disabled: {
      control: "boolean",
      description: "Whether the entire group is disabled",
    },
  },
  subcomponents: { ToggleGroupItem },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <ToggleGroup defaultValue={["bold"]} multiple>
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const italicButton = canvas.getByRole("button", {
      name: /toggle italic/i,
    });

    // Click the italic button to toggle it on
    await userEvent.click(italicButton);
    await expect(italicButton).toHaveAttribute("aria-pressed", "true");
  },
};

// ---------------------------------------------------------------------------
// Outline
// ---------------------------------------------------------------------------

export const Outline: Story = {
  render: () => (
    <ToggleGroup multiple variant="outline">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

// ---------------------------------------------------------------------------
// Single Selection
// ---------------------------------------------------------------------------

export const SingleSelection: Story = {
  name: "Single Selection",
  render: () => {
    const [value, setValue] = useState<string[]>(["center"]);

    return (
      <div className="flex flex-col gap-3">
        <ToggleGroup onValueChange={setValue} value={value} variant="outline">
          <ToggleGroupItem aria-label="Align left" value="left">
            <AlignLeftIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align center" value="center">
            <AlignCenterIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align right" value="right">
            <AlignRightIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align justify" value="justify">
            <AlignJustifyIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">
          Alignment: {value.length > 0 ? value[0] : "none"}
        </p>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// With Text
// ---------------------------------------------------------------------------

export const WithText: Story = {
  name: "With Text",
  render: () => (
    <ToggleGroup multiple variant="outline">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <BoldIcon />
        Bold
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <ItalicIcon />
        Italic
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <UnderlineIcon />
        Underline
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Small</p>
        <ToggleGroup multiple size="sm" variant="outline">
          <ToggleGroupItem aria-label="Toggle list" value="list">
            <ListIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle ordered list" value="ordered">
            <ListOrderedIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle checklist" value="checks">
            <ListChecksIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Default</p>
        <ToggleGroup multiple size="default" variant="outline">
          <ToggleGroupItem aria-label="Toggle list" value="list">
            <ListIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle ordered list" value="ordered">
            <ListOrderedIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle checklist" value="checks">
            <ListChecksIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Large</p>
        <ToggleGroup multiple size="lg" variant="outline">
          <ToggleGroupItem aria-label="Toggle list" value="list">
            <ListIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle ordered list" value="ordered">
            <ListOrderedIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle checklist" value="checks">
            <ListChecksIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

export const Spacing: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Joined (spacing=0, default)</p>
        <ToggleGroup defaultValue={["all"]} variant="outline">
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="missed">Missed</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Spaced (spacing=2)</p>
        <ToggleGroup defaultValue={["all"]} spacing={2} variant="outline">
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="missed">Missed</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const missedButtons = canvas.getAllByRole("button", { name: /missed/i });

    await userEvent.click(missedButtons[0]);
    await expect(missedButtons[0]).toHaveAttribute("aria-pressed", "true");
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the `spacing` prop to control the gap between items. When `0` (default), items join with connected borders. Values greater than `0` add a gap using the spacing scale.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Text Labels
// ---------------------------------------------------------------------------

export const TextLabels: Story = {
  name: "Text Labels",
  render: () => (
    <div className="flex flex-col gap-6">
      <ToggleGroup defaultValue={["all"]} variant="outline">
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="missed">Missed</ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup defaultValue={["day"]} size="sm" variant="outline">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
        <ToggleGroupItem value="year">Year</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const weekButton = canvas.getByRole("button", { name: /week/i });

    await userEvent.click(weekButton);
    await expect(weekButton).toHaveAttribute("aria-pressed", "true");

    const dayButton = canvas.getByRole("button", { name: /^day$/i });
    await expect(dayButton).toHaveAttribute("aria-pressed", "false");
  },
  parameters: {
    docs: {
      description: {
        story:
          "Toggle groups work well with text labels for filter-style and segmented controls.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Joined</p>
        <ToggleGroup
          defaultValue={["bold", "italic"]}
          multiple
          orientation="vertical"
        >
          <ToggleGroupItem aria-label="Toggle bold" value="bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle italic" value="italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle underline" value="underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Spaced</p>
        <ToggleGroup
          defaultValue={["bold"]}
          multiple
          orientation="vertical"
          spacing={1}
        >
          <ToggleGroupItem aria-label="Toggle bold" value="bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle italic" value="italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle underline" value="underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const underlineButtons = canvas.getAllByRole("button", {
      name: /toggle underline/i,
    });

    await userEvent.click(underlineButtons[0]);
    await expect(underlineButtons[0]).toHaveAttribute("aria-pressed", "true");
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `orientation="vertical"` for vertical toggle groups. Combine with `spacing` to control whether items are joined or separated.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Disabled Group</p>
        <ToggleGroup defaultValue={["bold"]} disabled variant="outline">
          <ToggleGroupItem aria-label="Toggle bold" value="bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle italic" value="italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle underline" value="underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">
          Entire group is disabled
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Individual Disabled Items</p>
        <ToggleGroup defaultValue={["bold"]} multiple variant="outline">
          <ToggleGroupItem aria-label="Toggle bold" value="bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle italic" disabled value="italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle underline" value="underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">Italic is disabled</p>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Custom
// ---------------------------------------------------------------------------

function FontWeightSelector() {
  const [fontWeight, setFontWeight] = useState<string[]>(["normal"]);
  const current = fontWeight[0] || "normal";

  return (
    <Field>
      <FieldLabel>Font Weight</FieldLabel>
      <ToggleGroup
        onValueChange={setFontWeight}
        size="lg"
        spacing={2}
        value={fontWeight}
        variant="outline"
      >
        <ToggleGroupItem
          aria-label="Light"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="light"
        >
          <span className="font-light text-2xl leading-none">Aa</span>
          <span className="text-muted-foreground text-xs">Light</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Normal"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="normal"
        >
          <span className="font-normal text-2xl leading-none">Aa</span>
          <span className="text-muted-foreground text-xs">Normal</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Medium"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="medium"
        >
          <span className="font-medium text-2xl leading-none">Aa</span>
          <span className="text-muted-foreground text-xs">Medium</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Bold"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="bold"
        >
          <span className="font-bold text-2xl leading-none">Aa</span>
          <span className="text-muted-foreground text-xs">Bold</span>
        </ToggleGroupItem>
      </ToggleGroup>
      <FieldDescription>
        Use{" "}
        <code className="rounded-md bg-muted px-1 py-0.5 font-mono">
          font-{current}
        </code>{" "}
        to set the font weight.
      </FieldDescription>
    </Field>
  );
}

export const Custom: Story = {
  render: () => <FontWeightSelector />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boldButton = canvas.getByRole("button", { name: /bold/i });

    await userEvent.click(boldButton);
    await expect(boldButton).toHaveAttribute("aria-pressed", "true");
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom-styled toggle items with `spacing`, `className` overrides, and integration with the Field component for form context.",
      },
    },
  },
};
