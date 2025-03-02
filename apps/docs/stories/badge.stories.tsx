import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@acme/ui/badge";
import { CheckIcon, XIcon, AlertCircleIcon, InfoIcon } from "lucide-react";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: `
A versatile badge component with support for different color variants and sizes.

\`\`\`tsx
import { Badge } from "@acme/ui";

// Default badge
<Badge>New</Badge>

// Badge color variants
<Badge variant="red">Red</Badge>
<Badge variant="blue">Blue</Badge>
<Badge variant="green">Green</Badge>
<Badge variant="purple">Purple</Badge>
<Badge variant="zinc">Zinc</Badge>

// Badge sizes
<Badge size="xs">Extra Small</Badge>
<Badge size="sm">Small</Badge>
<Badge>Default</Badge>

// Status badge with custom indicator
<Badge>
  <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
  Online
</Badge>
\`\`\`

## Features

- Multiple color variants: red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate, gray, zinc, neutral, stone
- Three sizes: xs, sm, default
- Support for custom content including status indicators
- Rounded design for modern UI
- Dark mode support with optimized colors
- Consistent sizing with 1px border (visible by default)
- Built-in gap spacing between elements
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default", "red", "orange", "amber", "yellow", "lime", "green", "emerald", 
        "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", 
        "fuchsia", "pink", "rose", "slate", "gray", "zinc", "neutral", "stone"
      ],
      defaultValue: "default",
      description: "The color variant of the badge",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default"],
      defaultValue: "default",
      description: "The size of the badge",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the badge",
    },
    children: {
      control: "text",
      description: "The content of the badge",
      defaultValue: "Badge",
    },
  },
} as Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof Badge>;

// Base badge variants
export const Default: Story = {
  args: {
    children: "Badge",
  },
};

// Badge sizes
export const ExtraSmall: Story = {
  args: {
    children: "Extra Small",
    size: "xs",
  },
};

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export const DefaultSize: Story = {
  args: {
    children: "Default",
    size: "default",
  },
};

// Color variants
export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <Badge>Default</Badge>
        <Badge variant="red">Red</Badge>
        <Badge variant="orange">Orange</Badge>
        <Badge variant="amber">Amber</Badge>
        <Badge variant="yellow">Yellow</Badge>
        <Badge variant="lime">Lime</Badge>
        <Badge variant="green">Green</Badge>
        <Badge variant="emerald">Emerald</Badge>
        <Badge variant="teal">Teal</Badge>
        <Badge variant="cyan">Cyan</Badge>
        <Badge variant="sky">Sky</Badge>
        <Badge variant="blue">Blue</Badge>
        <Badge variant="indigo">Indigo</Badge>
        <Badge variant="violet">Violet</Badge>
        <Badge variant="purple">Purple</Badge>
        <Badge variant="fuchsia">Fuchsia</Badge>
        <Badge variant="pink">Pink</Badge>
        <Badge variant="rose">Rose</Badge>
        <Badge variant="slate">Slate</Badge>
        <Badge variant="gray">Gray</Badge>
        <Badge variant="zinc">Zinc</Badge>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="stone">Stone</Badge>
      </div>
    </div>
  ),
};

// Icon badges
export const IconBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">With Status Dots</h3>
      <div className="flex flex-wrap gap-2">
        <Badge>
          <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
          Active
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-yellow-500" aria-hidden="true"></span>
          Pending
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
          Failed
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-blue-500" aria-hidden="true"></span>
          Processing
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-gray-400" aria-hidden="true"></span>
          Inactive
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-purple-500" aria-hidden="true"></span>
          Custom
        </Badge>
      </div>
      
      <h3 className="text-sm font-medium mt-4 mb-2">With Status Indicators</h3>
      <div className="flex flex-wrap gap-2">
        <Badge>
          <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
          Online
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-yellow-500" aria-hidden="true"></span>
          Away
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
          Offline
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-blue-500" aria-hidden="true"></span>
          Busy
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-purple-500" aria-hidden="true"></span>
          Do Not Disturb
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-gray-500" aria-hidden="true"></span>
          Invisible
        </Badge>
      </div>
      
      <h3 className="text-sm font-medium mt-4 mb-2">With Icons</h3>
      <div className="flex flex-wrap gap-2">
        <Badge>
          <CheckIcon className="text-emerald-500" aria-hidden="true" />
          Completed
        </Badge>
        <Badge>
          <XIcon className="text-red-500" aria-hidden="true" />
          Rejected
        </Badge>
        <Badge>
          <AlertCircleIcon className="text-amber-500" aria-hidden="true" />
          Warning
        </Badge>
        <Badge>
          <InfoIcon className="text-blue-500" aria-hidden="true" />
          Information
        </Badge>
      </div>
      
      <h3 className="text-sm font-medium mt-4 mb-2">Custom Colored Badges with Icons</h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="green">
          <CheckIcon aria-hidden="true" />
          Approved
        </Badge>
        <Badge variant="red">
          <XIcon aria-hidden="true" />
          Declined
        </Badge>
        <Badge variant="amber">
          <AlertCircleIcon aria-hidden="true" />
          Caution
        </Badge>
        <Badge variant="blue">
          <InfoIcon aria-hidden="true" />
          Notice
        </Badge>
        <Badge variant="purple">
          <CheckIcon aria-hidden="true" />
          Verified
        </Badge>
        <Badge variant="indigo">
          <InfoIcon aria-hidden="true" />
          Details
        </Badge>
      </div>
    </div>
  ),
}; 