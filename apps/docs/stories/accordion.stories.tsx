import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Settings } from "lucide-react";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@acme/ui/accordion";


// import { Button } from "@acme/ui/button";

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
} from "@purposeinplay/core-v2";

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

- \`Accordion.Root\` - The root container
- \`Accordion.Item\` - A single accordion item
- \`Accordion.Header\` - The header containing the trigger
- \`Accordion.Trigger\` - The button that toggles the panel
- \`Accordion.Panel\` - The expandable content panel
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
    openMultiple: {
      control: "boolean",
      description: "Whether multiple items can be opened at once",
      defaultValue: false,
    },
    value: {
      description: "The controlled value of the accordion (array of item values)",
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
    loop: {
      control: "boolean",
      description: "Whether keyboard navigation should loop",
      defaultValue: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

// Example content for our stories
const items = [
  {
    trigger: "What is your refund policy?",
    content: "If you're unhappy with your purchase for any reason, email us within 90 days and we'll refund you in full, no questions asked.",
  },
  {
    trigger: "Do you offer technical support?",
    content: "Yes, we offer email and phone support 9am-5pm EST, Monday through Friday.",
  },
  {
    trigger: "Can I change my subscription plan later?",
    content: "Yes, you can upgrade or downgrade your plan at any time through your account settings.",
  },
];

export const BoxVariant: Story = {
  args: {
    openMultiple: false,
    variant: "box",
  },
  render: (args) => (
    <Accordion {...args}>
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionHeader>
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const TableVariant: Story = {
  args: {
    openMultiple: false,
    variant: "table",
  },
  render: BoxVariant.render,
  parameters: {
    docs: {
      description: {
        story: "The table variant shows items merged together with rounded corners on first and last items.",
      },
    },
  },
};

export const UnderlineVariant: Story = {
  args: {
    openMultiple: false,
    variant: "underline",
  },
  render: BoxVariant.render,
  parameters: {
    docs: {
      description: {
        story: "The underline variant shows a bottom border on each item.",
      },
    },
  },
};

export const GhostVariant: Story = {
  args: {
    openMultiple: false,
    variant: "ghost",
  },
  render: BoxVariant.render,
  parameters: {
    docs: {
      description: {
        story: "The ghost variant has no borders, only hover states.",
      },
    },
  },
};

export const Multiple: Story = {
  args: {
    openMultiple: true,
    variant: "box",
  },
  render: BoxVariant.render,
  parameters: {
    docs: {
      description: {
        story: "Multiple items can be opened at once by setting `openMultiple` to true.",
      },
    },
  },
};

export const WithIcon: Story = {
  args: {
    openMultiple: false,
    variant: "box",
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionHeader>
          <AccordionTrigger>
            <span className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Account Settings
            </span>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          Manage your account settings and preferences.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "Icons can be added to the trigger content.",
      },
    },
  },
};

export const CustomIcon: Story = {
  args: {
    openMultiple: false,
    variant: "box",
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionHeader>
          <AccordionTrigger icon={<Plus className="mr-2 size-3 shrink-0 transition-all ease-out group-data-[panel-open]:scale-110 group-data-[panel-open]:rotate-45" />}>
            With Custom Icon
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          This accordion uses a custom icon instead of the default chevron.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "The default chevron icon can be replaced using the `icon` prop on AccordionTrigger.",
      },
    },
  },
};
