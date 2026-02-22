import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";
import { Button } from "@keystoneui/react/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@keystoneui/react/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { Kbd } from "@keystoneui/react/kbd";
import {
  ArrowUpRightIcon,
  BellIcon,
  CloudIcon,
  FolderCodeIcon,
  PlusIcon,
  RefreshCcwIcon,
  SearchIcon,
} from "lucide-react";

const meta = {
  title: "Components/Empty",
  component: Empty,
  parameters: {
    docs: {
      description: {
        component: `
A layout component for displaying empty states with icons, titles, descriptions, and actions.

\`\`\`tsx
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@keystoneui/react/empty";
import { Button } from "@keystoneui/react/button";
import { FolderCodeIcon } from "lucide-react";

<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <FolderCodeIcon />
    </EmptyMedia>
    <EmptyTitle>No Projects Yet</EmptyTitle>
    <EmptyDescription>
      You haven't created any projects yet.
    </EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>Create Project</Button>
  </EmptyContent>
</Empty>
\`\`\`

## Features

- Composable sub-components for flexible layouts
- EmptyMedia supports \`default\` and \`icon\` variants
- Works with avatars, avatar groups, icons, and custom media
- Combine with any action components (buttons, inputs, links)
- Easily styled with className overrides (borders, backgrounds)
`,
      },
    },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the empty state",
    },
  },
  subcomponents: {
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
  },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof Empty>;

// ── Core ────────────────────────────────────────────────────────────────

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A default empty state with an icon, title, description, action buttons, and a link.",
      },
    },
  },
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderCodeIcon />
        </EmptyMedia>
        <EmptyTitle>No Projects Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any projects yet. Get started by creating
          your first project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button>Create Project</Button>
        <Button variant="outline">Import Project</Button>
      </EmptyContent>
      <Button
        className="text-muted-foreground"
        nativeButton={false}
        render={
          <a href="#">
            Learn More <ArrowUpRightIcon />
          </a>
        }
        size="sm"
        variant="link"
      />
    </Empty>
  ),
};

// ── Patterns ────────────────────────────────────────────────────────────

export const Outline: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use the `border` utility class to create an outline empty state.",
      },
    },
  },
  render: () => (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CloudIcon />
        </EmptyMedia>
        <EmptyTitle>Cloud Storage Empty</EmptyTitle>
        <EmptyDescription>
          Upload files to your cloud storage to access them anywhere.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="outline">
          Upload Files
        </Button>
      </EmptyContent>
    </Empty>
  ),
};

export const Background: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use the `bg-*` and `bg-gradient-*` utilities to add a background to the empty state.",
      },
    },
  },
  render: () => (
    <Empty className="h-full bg-muted/30">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BellIcon />
        </EmptyMedia>
        <EmptyTitle>No Notifications</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          You&apos;re all caught up. New notifications will appear here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">
          <RefreshCcwIcon data-icon="inline-start" />
          Refresh
        </Button>
      </EmptyContent>
    </Empty>
  ),
};

export const WithAvatar: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use the `EmptyMedia` component to display an avatar in the empty state.",
      },
    },
  },
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          <Avatar className="size-12">
            <AvatarImage
              className="grayscale"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
            />
            <AvatarFallback>LR</AvatarFallback>
          </Avatar>
        </EmptyMedia>
        <EmptyTitle>User Offline</EmptyTitle>
        <EmptyDescription>
          This user is currently offline. You can leave a message to notify them
          or try again later.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Leave Message</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const AvatarGroup: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use the `EmptyMedia` component to display an avatar group in the empty state.",
      },
    },
  },
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <div className="flex -space-x-2 *:data-[slot=avatar]:size-12 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">
            <Avatar>
              <AvatarImage
                alt="Alex"
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
              />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                alt="Sarah"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
              />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                alt="Jordan"
                src="https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=80&h=80&fit=crop&crop=face"
              />
              <AvatarFallback>JO</AvatarFallback>
            </Avatar>
          </div>
        </EmptyMedia>
        <EmptyTitle>No Team Members</EmptyTitle>
        <EmptyDescription>
          Invite your team to collaborate on this project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">
          <PlusIcon />
          Invite Members
        </Button>
      </EmptyContent>
    </Empty>
  ),
};

export const WithInputGroup: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "You can add an `InputGroup` component to the `EmptyContent` component.",
      },
    },
  },
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>404 - Not Found</EmptyTitle>
        <EmptyDescription>
          The page you&apos;re looking for doesn&apos;t exist. Try searching for
          what you need below.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <InputGroup className="sm:w-3/4">
          <InputGroupInput placeholder="Try searching for pages..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd>/</Kbd>
          </InputGroupAddon>
        </InputGroup>
        <EmptyDescription>
          Need help? <a href="#">Contact support</a>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  ),
};
