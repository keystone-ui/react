import { Badge } from "@keystone/ui/badge";
import { Button } from "@keystone/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@keystone/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@keystone/ui/input-group";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@keystone/ui/item";
import { Spinner } from "@keystone/ui/spinner";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowUpIcon } from "lucide-react";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component: `
A simple animated spinner component for indicating loading states.

\`\`\`tsx
import { Spinner } from "@keystone/ui/spinner";

<Spinner />
\`\`\`

## Features

- Uses \`Loader2Icon\` from lucide-react with \`animate-spin\`
- Accessible with \`role="status"\` and \`aria-label="Loading"\`
- Customizable size via \`size-*\` utility classes
- Works inside buttons, badges, input groups, and empty states
- Use \`data-icon="inline-start"\` or \`data-icon="inline-end"\` when placing inside buttons or badges
`,
      },
    },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes (e.g. `size-6` to change size)",
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof Spinner>;

// ── Core ────────────────────────────────────────────────────────────────

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A spinner inside an Item component, showing a processing state.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
      <Item variant="muted">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">Processing payment...</ItemTitle>
        </ItemContent>
        <ItemContent className="flex-none justify-end">
          <span className="text-sm tabular-nums">$100.00</span>
        </ItemContent>
      </Item>
    </div>
  ),
};

// ── Examples ─────────────────────────────────────────────────────────────

export const Size: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use the `size-*` utility class to change the size of the spinner.",
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner className="size-3" />
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
    </div>
  ),
};

export const WithButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Add a spinner to a button to indicate a loading state. Use `data-icon="inline-start"` to position the spinner before the label.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <Button disabled size="sm">
        <Spinner data-icon="inline-start" />
        Loading...
      </Button>
      <Button disabled size="sm" variant="outline">
        <Spinner data-icon="inline-start" />
        Please wait
      </Button>
      <Button disabled size="sm" variant="secondary">
        <Spinner data-icon="inline-start" />
        Processing
      </Button>
    </div>
  ),
};

export const WithBadge: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Add a spinner to a badge to indicate a loading state. Use `data-icon="inline-start"` to position the spinner before the label.',
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Badge>
        <Spinner data-icon="inline-start" />
        Syncing
      </Badge>
      <Badge variant="blue">
        <Spinner data-icon="inline-start" />
        Uploading
      </Badge>
      <Badge variant="amber">
        <Spinner data-icon="inline-start" />
        Processing
      </Badge>
    </div>
  ),
};

export const WithInputGroup: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Place a spinner inside an `InputGroupAddon` to show loading state on inputs and textareas.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-4">
      <InputGroup>
        <InputGroupInput disabled placeholder="Send a message..." />
        <InputGroupAddon align="inline-end">
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea disabled placeholder="Send a message..." />
        <InputGroupAddon align="block-end">
          <Spinner /> Validating...
          <InputGroupButton className="ml-auto" variant="default">
            <ArrowUpIcon />
            <span className="sr-only">Send</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const WithEmpty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use a spinner inside an `Empty` state to indicate a processing or loading state.",
      },
    },
  },
  render: () => (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Processing your request</EmptyTitle>
        <EmptyDescription>
          Please wait while we process your request. Do not refresh the page.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="outline">
          Cancel
        </Button>
      </EmptyContent>
    </Empty>
  ),
};
