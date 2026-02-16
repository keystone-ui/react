import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleGroup, ToggleGroupItem } from "keystoneui/toggle-group";
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
import { ToggleGroup, ToggleGroupItem } from "keystoneui/toggle-group";

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
- Controlled and uncontrolled value management
- Keyboard navigation via Base UI ToggleGroup primitive
- Group-level variant and size props cascade to items via context
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
