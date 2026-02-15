import { Tag, TagRemove } from "@keystone/ui/tag";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BellIcon,
  BoldIcon,
  BookmarkIcon,
  HeartIcon,
  ItalicIcon,
  StarIcon,
} from "lucide-react";

const meta = {
  title: "Components/Tag",
  component: Tag,
  parameters: {
    docs: {
      description: {
        component: `
A badge-shaped tag button with pressed/unpressed state.

\`\`\`tsx
import { Tag, TagRemove } from "@keystone/ui/tag";

// Basic tag
<Tag value="bold">Bold</Tag>

// With default pressed state
<Tag defaultPressed value="bookmark">Bookmark</Tag>

// With icon
<Tag value="star">
  <StarIcon />
  Star
</Tag>

// With remove button
<Tag value="react">
  React
  <TagRemove onClick={() => handleRemove()} />
</Tag>
\`\`\`

## Features

- Badge-shaped pill styling (rounded-full, 24px height)
- Pressed/unpressed state via \`aria-pressed\`
- Keyboard accessible via Base UI Toggle primitive
- Optional remove button via \`TagRemove\` sub-component
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
      description: "Whether the tag is disabled",
    },
  },
  subcomponents: { TagRemove },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag value="bold">Bold</Tag>
      <Tag value="italic">Italic</Tag>
      <Tag defaultPressed value="underline">
        Underline
      </Tag>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag value="unpressed">Unpressed</Tag>
      <Tag defaultPressed value="pressed">
        Pressed
      </Tag>
      <Tag disabled value="disabled">
        Disabled
      </Tag>
      <Tag defaultPressed disabled value="pressed-disabled">
        Pressed & Disabled
      </Tag>
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
      <Tag value="star">
        <StarIcon />
        Star
      </Tag>
      <Tag value="bookmark">
        <BookmarkIcon />
        Bookmark
      </Tag>
      <Tag defaultPressed value="heart">
        <HeartIcon />
        Favorite
      </Tag>
      <Tag value="bell">
        <BellIcon />
        Notify
      </Tag>
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
        <Tag value="bold">
          <BoldIcon />
          Bold
          <TagRemove onClick={() => alert("Remove Bold")} />
        </Tag>
        <Tag value="italic">
          <ItalicIcon />
          Italic
          <TagRemove onClick={() => alert("Remove Italic")} />
        </Tag>
        <Tag defaultPressed value="star">
          <StarIcon />
          Star
          <TagRemove onClick={() => alert("Remove Star")} />
        </Tag>
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
      <Tag disabled value="disabled">
        Disabled
      </Tag>
      <Tag defaultPressed disabled value="pressed-disabled">
        Pressed & Disabled
      </Tag>
    </div>
  ),
};
