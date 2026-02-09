import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@keystone/ui/popover";
import { Button } from "@keystone/ui/button";
import { Field, FieldGroup, FieldLabel } from "@keystone/ui/field";
import { Input } from "@keystone/ui/input";
import { XIcon } from "lucide-react";

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    docs: {
      description: {
        component: `
A popup component for displaying content when users click or focus on an element.

\`\`\`tsx
import {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@keystone/ui/popover";

<Popover>
  <PopoverTrigger render={<Button variant="outline">Open Popover</Button>} />
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>Dimensions</PopoverTitle>
      <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
    </PopoverHeader>
  </PopoverContent>
</Popover>
\`\`\`

## Features

- Controlled and uncontrolled modes
- Configurable positioning (side and alignment)
- Animation support with enter/exit transitions
- Accessible focus management
- Portal rendering for proper z-index handling
- Header, title, description, close, and arrow components
- Open on hover with configurable delay

## API Reference

See the [Base UI Popover documentation](https://base-ui.com/react/components/popover) for the full API reference, including detached triggers, multiple triggers, controlled mode, and more.
`,
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof Popover>;

// =============================================================================
// Default
// =============================================================================
export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline">Open Popover</Button>}
      />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>
            Set the dimensions for the layer.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};

// =============================================================================
// Basic
// =============================================================================
export const Basic: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" className="w-fit">
            Open Popover
          </Button>
        }
      />
      <PopoverContent align="start">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>
            Set the dimensions for the layer.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "A simple popover with a header, title, and description.",
      },
    },
  },
};

// =============================================================================
// Alignments
// =============================================================================
export const Alignments: Story = {
  render: () => (
    <div className="flex gap-6">
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              Start
            </Button>
          }
        />
        <PopoverContent align="start" className="w-40">
          Aligned to start
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              Center
            </Button>
          }
        />
        <PopoverContent align="center" className="w-40">
          Aligned to center
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              End
            </Button>
          }
        />
        <PopoverContent align="end" className="w-40">
          Aligned to end
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the align prop on PopoverContent to control the horizontal alignment.",
      },
    },
  },
};

// =============================================================================
// With Form
// =============================================================================
export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline">Open Popover</Button>}
      />
      <PopoverContent className="w-64" align="start">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>
            Set the dimensions for the layer.
          </PopoverDescription>
        </PopoverHeader>
        <FieldGroup className="gap-4">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="width" className="w-1/2">
              Width
            </FieldLabel>
            <Input id="width" defaultValue="100%" />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="height" className="w-1/2">
              Height
            </FieldLabel>
            <Input id="height" defaultValue="25px" />
          </Field>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "A popover with form fields inside.",
      },
    },
  },
};

// =============================================================================
// With Close Button
// =============================================================================
export const WithClose: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline">Open Popover</Button>}
      />
      <PopoverContent align="start">
        <div className="flex items-start justify-between gap-4">
          <PopoverHeader>
            <PopoverTitle>Notification Settings</PopoverTitle>
            <PopoverDescription>
              Manage how you receive notifications.
            </PopoverDescription>
          </PopoverHeader>
          <PopoverClose
            render={
              <Button variant="ghost" size="icon-xs">
                <XIcon />
              </Button>
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use PopoverClose to render an accessible close button inside the popover.",
      },
    },
  },
};

// =============================================================================
// With Arrow
// =============================================================================
export const WithArrow: Story = {
  render: () => (
    <div className="flex gap-6">
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              Start
            </Button>
          }
        />
        <PopoverContent align="start" className="w-48">
          <PopoverArrow />
          Aligned to start
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              Center
            </Button>
          }
        />
        <PopoverContent align="center" className="w-48">
          <PopoverArrow />
          Aligned to center
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              End
            </Button>
          }
        />
        <PopoverContent align="end" className="w-48">
          <PopoverArrow />
          Aligned to end
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "PopoverArrow with start, center, and end alignment.",
      },
    },
  },
};

// =============================================================================
// Open on Hover
// =============================================================================
export const OpenOnHover: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={200}
        closeDelay={0}
        render={<Button variant="outline">Hover Me</Button>}
      />
      <PopoverContent sideOffset={8}>
        <PopoverArrow />
        <PopoverHeader>
          <PopoverTitle>Hover Popover</PopoverTitle>
          <PopoverDescription>
            This popover opens on hover after a 200ms delay.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `openOnHover` on PopoverTrigger to open the popover on hover. Use `delay` and `closeDelay` to control timing.",
      },
    },
  },
};
