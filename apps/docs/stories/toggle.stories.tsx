import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toggle, ToggleRemove } from "@keystone/ui/toggle";
import {
  BoldIcon,
  ItalicIcon,
  StarIcon,
  BookmarkIcon,
  HeartIcon,
  BellIcon,
} from "lucide-react";

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component: `
A badge-shaped toggle button with pressed/unpressed state.

\`\`\`tsx
import { Toggle, ToggleRemove } from "@keystone/ui/toggle";

// Basic toggle
<Toggle value="bold">Bold</Toggle>

// With default pressed state
<Toggle defaultPressed value="bookmark">Bookmark</Toggle>

// With icon
<Toggle value="star">
  <StarIcon />
  Star
</Toggle>

// With remove button
<Toggle value="react">
  React
  <ToggleRemove onClick={() => handleRemove()} />
</Toggle>
\`\`\`

## Features

- Badge-shaped pill styling (rounded-full, 24px height)
- Pressed/unpressed state via \`aria-pressed\`
- Keyboard accessible via Base UI Toggle primitive
- Optional remove button via \`ToggleRemove\` sub-component
- Icon support with automatic sizing
`,
      },
    },
  },
  argTypes: {
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
    <div className="flex flex-wrap items-center gap-3">
      <Toggle value="bold">Bold</Toggle>
      <Toggle value="italic">Italic</Toggle>
      <Toggle defaultPressed value="underline">Underline</Toggle>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle value="unpressed">Unpressed</Toggle>
      <Toggle defaultPressed value="pressed">Pressed</Toggle>
      <Toggle disabled value="disabled">Disabled</Toggle>
      <Toggle disabled defaultPressed value="pressed-disabled">Pressed & Disabled</Toggle>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// With Icon
// ---------------------------------------------------------------------------

export const WithIcon: Story = {
  name: "With Icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle value="star">
        <StarIcon />
        Star
      </Toggle>
      <Toggle value="bookmark">
        <BookmarkIcon />
        Bookmark
      </Toggle>
      <Toggle defaultPressed value="heart">
        <HeartIcon />
        Favorite
      </Toggle>
      <Toggle value="bell">
        <BellIcon />
        Notify
      </Toggle>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// With Remove
// ---------------------------------------------------------------------------

export const WithRemove: Story = {
  name: "With Remove",
  render: () => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Toggle value="bold">
          <BoldIcon />
          Bold
          <ToggleRemove onClick={() => alert("Remove Bold")} />
        </Toggle>
        <Toggle value="italic">
          <ItalicIcon />
          Italic
          <ToggleRemove onClick={() => alert("Remove Italic")} />
        </Toggle>
        <Toggle defaultPressed value="star">
          <StarIcon />
          Star
          <ToggleRemove onClick={() => alert("Remove Star")} />
        </Toggle>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle disabled value="disabled">Disabled</Toggle>
      <Toggle disabled defaultPressed value="pressed-disabled">Pressed & Disabled</Toggle>
    </div>
  ),
};
