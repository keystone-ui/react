import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toggle } from "keystoneui/toggle";
import {
  BoldIcon,
  BookmarkIcon,
  ItalicIcon,
  StarIcon,
  UnderlineIcon,
} from "lucide-react";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component: `
A two-state button that can be either on or off.

\`\`\`tsx
import { Toggle } from "keystoneui/toggle";

// Default toggle
<Toggle aria-label="Toggle bold">
  <BoldIcon />
</Toggle>

// Outline variant
<Toggle variant="outline" aria-label="Toggle italic">
  <ItalicIcon />
  Italic
</Toggle>

// Small size
<Toggle size="sm" aria-label="Toggle bold">
  <BoldIcon />
  Bold
</Toggle>
\`\`\`

## Features

- Two variants: \`default\` and \`outline\`
- Three sizes: \`sm\`, \`default\`, \`lg\`
- Pressed/unpressed state via \`aria-pressed\`
- Keyboard accessible via Base UI Toggle primitive
- Icon support with automatic sizing
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
      description: "The visual style of the toggle",
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "The size of the toggle",
    },
    defaultPressed: {
      control: "boolean",
      description: "Initial pressed state (uncontrolled)",
    },
    disabled: {
      control: "boolean",
      description: "Whether the toggle is disabled",
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle bold">
        <BoldIcon />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <ItalicIcon />
        Italic
      </Toggle>
      <Toggle aria-label="Toggle underline" defaultPressed>
        <UnderlineIcon />
        Underline
      </Toggle>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boldToggle = canvas.getByRole("button", { name: /toggle bold/i });

    // Click to toggle pressed
    await userEvent.click(boldToggle);
    await expect(boldToggle).toHaveAttribute("aria-pressed", "true");

    // Click again to toggle unpressed
    await userEvent.click(boldToggle);
    await expect(boldToggle).toHaveAttribute("aria-pressed", "false");
  },
};

// ---------------------------------------------------------------------------
// Outline
// ---------------------------------------------------------------------------

export const Outline: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle italic" variant="outline">
        <ItalicIcon />
        Italic
      </Toggle>
      <Toggle aria-label="Toggle bold" variant="outline">
        <BoldIcon />
        Bold
      </Toggle>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// With Text
// ---------------------------------------------------------------------------

export const WithText: Story = {
  name: "With Text",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle italic">
        <ItalicIcon />
        Italic
      </Toggle>
      <Toggle aria-label="Toggle bold">
        <BoldIcon />
        Bold
      </Toggle>
      <Toggle aria-label="Toggle bookmark">
        <BookmarkIcon />
        Bookmark
      </Toggle>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle small" size="sm" variant="outline">
        <StarIcon />
        Small
      </Toggle>
      <Toggle aria-label="Toggle default" size="default" variant="outline">
        <StarIcon />
        Default
      </Toggle>
      <Toggle aria-label="Toggle large" size="lg" variant="outline">
        <StarIcon />
        Large
      </Toggle>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle disabled" disabled>
        <BoldIcon />
        Disabled
      </Toggle>
      <Toggle aria-label="Toggle disabled outline" disabled variant="outline">
        <ItalicIcon />
        Disabled
      </Toggle>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Pressed State
// ---------------------------------------------------------------------------

export const PressedState: Story = {
  name: "Pressed State",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle bookmark" defaultPressed>
        <BookmarkIcon className="group-data-pressed/toggle:fill-current" />
        Bookmark
      </Toggle>
      <Toggle aria-label="Toggle star" defaultPressed variant="outline">
        <StarIcon className="group-data-pressed/toggle:fill-current" />
        Starred
      </Toggle>
    </div>
  ),
};
