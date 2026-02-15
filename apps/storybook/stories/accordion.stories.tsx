import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@keystone/ui/accordion";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, Settings } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component: `
A vertically stacked set of interactive headings that each reveal a section of content.

\`\`\`tsx
import { 
  Accordion, 
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionPanel 
} from "@keystone/ui/accordion";

<Accordion>
  <AccordionItem value="item-1">
    <AccordionHeader>
      <AccordionTrigger>Title</AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel>Content</AccordionPanel>
  </AccordionItem>
</Accordion>
\`\`\`

## Features

- Four visual styles: box (default), underline, ghost, and table
- Support for single or multiple expanded items
- Keyboard navigation
- Custom icons
- Animated height transitions
- Accessible by default

## Components

- \`Accordion\` - The root container
- \`AccordionItem\` - A single accordion item
- \`AccordionHeader\` - The header containing the trigger
- \`AccordionTrigger\` - The button that toggles the panel
- \`AccordionPanel\` - The expandable content panel
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["box", "underline", "ghost", "table"],
      description: "The visual style variant of the accordion",
      defaultValue: "box",
    },
    multiple: {
      control: "boolean",
      description: "Whether multiple items can be opened at once",
      defaultValue: false,
    },
    value: {
      description:
        "The controlled value of the accordion (array of item values)",
    },
    defaultValue: {
      description: "The default value of the accordion (array of item values)",
    },
    onValueChange: {
      description: "Callback when the value changes",
    },
    disabled: {
      control: "boolean",
      description: "Whether the accordion is disabled",
      defaultValue: false,
    },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "The orientation of the accordion",
      defaultValue: "vertical",
    },
  },
  subcomponents: {
    AccordionItem,
    AccordionHeader,
    AccordionTrigger,
    AccordionPanel,
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

// Example content for our stories
const items = [
  {
    id: "1",
    title: "What makes our UI different?",
    content:
      "Our UI focuses on developer experience and performance. Built with TypeScript, it offers excellent type safety, follows accessibility standards, and provides comprehensive documentation with regular updates.",
  },
  {
    id: "2",
    title: "How can I customize the components?",
    content:
      "Use our CSS variables for global styling, or className and style props for component-specific changes. We support CSS modules, Tailwind, and dark mode out of the box.",
  },
  {
    id: "3",
    title: "Is it optimized for performance?",
    content:
      "Yes, with tree-shaking, code splitting, and minimal runtime overhead. Most components are under 5KB gzipped.",
  },
];

export const BoxVariant: Story = {
  args: {
    multiple: false,
    variant: "box",
  },
  render: (args) => (
    <Accordion {...args}>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionHeader>
            <AccordionTrigger>{item.title}</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole("button");
    const firstTrigger = triggers[0];

    // Panel should be collapsed initially
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");

    // Click to expand
    await userEvent.click(firstTrigger);
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "true");
  },
};

export const TableVariant: Story = {
  args: {
    multiple: false,
    variant: "table",
  },
  render: (args) => (
    <Accordion {...args}>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionHeader>
            <AccordionTrigger>{item.title}</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const UnderlineVariant: Story = {
  args: {
    multiple: false,
    variant: "underline",
  },
  render: (args) => (
    <Accordion {...args}>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionHeader>
            <AccordionTrigger>{item.title}</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const GhostVariant: Story = {
  args: {
    multiple: false,
    variant: "ghost",
  },
  render: (args) => (
    <Accordion {...args}>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionHeader>
            <AccordionTrigger>{item.title}</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const Multiple: Story = {
  args: {
    multiple: true,
    variant: "box",
  },
  render: (args) => (
    <Accordion {...args}>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionHeader>
            <AccordionTrigger>{item.title}</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const WithCustomChevron: Story = {
  args: {
    multiple: false,
    variant: "box",
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionHeader>
          <AccordionTrigger
            chevronIcon={
              <Plus
                aria-hidden="true"
                className="size-3 shrink-0 transition-all ease-out group-data-[panel-open]:rotate-45 group-data-[panel-open]:scale-110"
              />
            }
          >
            Custom Chevron Icon
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          This accordion uses a plus icon instead of the default chevron.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `chevronIcon` prop to replace the default chevron icon on the right side.",
      },
    },
  },
};

export const WithCustomLayout: Story = {
  args: {
    multiple: false,
    variant: "box",
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionHeader>
          <AccordionTrigger>
            <div className="flex items-start gap-4">
              <Settings
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 opacity-75"
              />
              <div className="flex flex-col items-start gap-0">
                <span className="font-semibold">Account Settings</span>
                <span className="font-normal text-sm">
                  Manage your preferences
                </span>
              </div>
            </div>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel className="ps-10.5">
          This example shows how to create a custom layout with icons and
          additional content.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Example of a more complex custom layout with icons and multiple text elements.",
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <Accordion disabled variant="box">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionHeader>
            <AccordionTrigger>{item.title}</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "All items are disabled and cannot be expanded.",
      },
    },
  },
};
