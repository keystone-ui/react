import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@keystoneui/react/avatar";
import { PlusIcon } from "lucide-react";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component: `
A versatile avatar component for displaying user profile images with fallbacks, badges, and group layouts.

\`\`\`tsx
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "@keystoneui/react/avatar";

// Basic avatar with image and fallback
<Avatar>
  <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>

// Avatar with status badge
<Avatar>
  <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
  <AvatarBadge className="bg-green-600 dark:bg-green-800" />
</Avatar>

// Avatar group with overflow count
<AvatarGroup>
  <Avatar>
    <AvatarImage src="..." alt="..." />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarImage src="..." alt="..." />
    <AvatarFallback>LR</AvatarFallback>
  </Avatar>
  <AvatarGroupCount>+3</AvatarGroupCount>
</AvatarGroup>
\`\`\`

## Features

- Automatic fallback when image fails to load
- Four size variants: \`xs\`, \`sm\`, \`default\`, and \`lg\`
- Status badges with customizable colors
- Group layout with overlapping avatars
- Overflow count indicator for groups
- Full accessibility support
`,
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg"],
      defaultValue: "default",
      description: "The size of the avatar",
    },
  },
  subcomponents: {
    AvatarImage,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
    AvatarBadge,
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof Avatar>;

// Basic avatar
export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage
        alt="@shadcn"
        className="grayscale"
        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
      />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

// Avatar with badge
export const Badge: Story = {
  name: "Badge",
  render: () => (
    <Avatar>
      <AvatarImage
        alt="@evilrabbit"
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
      />
      <AvatarFallback>ER</AvatarFallback>
      <AvatarBadge className="bg-green-600 dark:bg-green-800" />
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `AvatarBadge` component to add a badge to the avatar. The badge is positioned at the bottom right of the avatar. Use the `className` prop to add custom styles such as custom colors.",
      },
    },
  },
};

// Badge with icon
export const BadgeWithIcon: Story = {
  name: "Badge with Icon",
  render: () => (
    <Avatar className="grayscale">
      <AvatarImage
        alt="@pranathip"
        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
      />
      <AvatarFallback>PP</AvatarFallback>
      <AvatarBadge>
        <PlusIcon />
      </AvatarBadge>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: "You can also use an icon inside `<AvatarBadge>`.",
      },
    },
  },
};

// Avatar group
export const Group: Story = {
  name: "Group",
  render: () => (
    <AvatarGroup className="grayscale">
      <Avatar>
        <AvatarImage
          alt="@shadcn"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          alt="@maxleiter"
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>LR</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          alt="@evilrabbit"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>ER</AvatarFallback>
      </Avatar>
    </AvatarGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Use the `AvatarGroup` component to display a group of avatars.",
      },
    },
  },
};

// Avatar group with count
export const GroupWithCount: Story = {
  name: "Group with Count",
  render: () => (
    <AvatarGroup className="grayscale">
      <Avatar>
        <AvatarImage
          alt="@shadcn"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          alt="@maxleiter"
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>LR</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          alt="@evilrabbit"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>ER</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `<AvatarGroupCount>` to add a count to the group, showing the number of additional avatars.",
      },
    },
  },
};

// Avatar group with icon in count
export const GroupWithIcon: Story = {
  name: "Group with Icon",
  render: () => (
    <AvatarGroup className="grayscale">
      <Avatar>
        <AvatarImage
          alt="@shadcn"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          alt="@maxleiter"
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>LR</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          alt="@evilrabbit"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>ER</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>
        <PlusIcon />
      </AvatarGroupCount>
    </AvatarGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "You can also use an icon inside `<AvatarGroupCount>`.",
      },
    },
  },
};

// Size variants
export const Sizes: Story = {
  name: "Sizes",
  render: () => (
    <div className="flex flex-wrap items-center gap-2 grayscale">
      <Avatar size="xs">
        <AvatarImage
          alt="@shadcn"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar size="sm">
        <AvatarImage
          alt="@shadcn"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          alt="@shadcn"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage
          alt="@shadcn"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use the `size` prop to change the size of the avatar. Available sizes: `"xs"`, `"sm"`, `"default"`, and `"lg"`.',
      },
    },
  },
};

// Full demo with all features
export const Demo: Story = {
  name: "Demo",
  render: () => (
    <div className="flex flex-row flex-wrap items-center gap-6 md:gap-12">
      <Avatar>
        <AvatarImage
          alt="@shadcn"
          className="grayscale"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          alt="@evilrabbit"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>ER</AvatarFallback>
        <AvatarBadge className="bg-green-600 dark:bg-green-800" />
      </Avatar>
      <AvatarGroup className="grayscale">
        <Avatar>
          <AvatarImage
            alt="@shadcn"
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage
            alt="@maxleiter"
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
          />
          <AvatarFallback>LR</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage
            alt="@evilrabbit"
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
          />
          <AvatarFallback>ER</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A comprehensive demo showing basic avatar, avatar with badge, and avatar group with count.",
      },
    },
  },
};
