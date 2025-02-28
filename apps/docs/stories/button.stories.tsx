import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Mail, Loader2 } from "lucide-react";
import { Button } from "@acme/ui/button";
import type { ButtonProps } from "@acme/ui/button";

// Use a cast to silence TypeScript for the meta configuration
const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: `
A versatile button component with support for different variants, sizes, and states.

\`\`\`tsx
import { Button } from "@acme/ui";

// Default button
<Button>Click me</Button>

// Button variants
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button>Medium</Button>
<Button size="lg">Large</Button>

// Link button
<Button href="/dashboard">Go to Dashboard</Button>
\`\`\`

## Features

- Multiple variants: default, secondary, destructive, ghost, outline
- Four sizes: xs, sm, default, lg
- Loading state with spinner
- Disabled state
- Anchor links with correct semantics
- Full width option
- Icon support
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "ghost", "outline"],
      defaultValue: "default",
      description: "The visual style of the button",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg"],
      defaultValue: "default",
      description: "The size of the button",
    },
    disabled: {
      control: "boolean",
      defaultValue: false,
      description: "Whether the button is disabled",
    },
    isLoading: {
      control: "boolean",
      defaultValue: false,
      description: "Whether the button shows a loading spinner",
    },
    fullWidth: {
      control: "boolean",
      defaultValue: false,
      description: "Whether the button should take up the full width of its container",
    },
    href: {
      control: "text",
      description: "When provided, the button renders as an anchor element",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the button",
    },
    children: {
      control: "text",
      description: "The content of the button",
      defaultValue: "Button",
    },
  },
} as Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

// Base button variants
export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  } as any,
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  } as any,
};

export const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive",
  } as any,
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  } as any,
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  } as any,
};

// Button sizes
export const Small: Story = {
  args: {
    children: "Small Button",
    size: "sm",
  } as any,
};

export const Medium: Story = {
  args: {
    children: "Medium Button",
    size: "default",
  } as any,
};

export const Large: Story = {
  args: {
    children: "Large Button",
    size: "lg",
  } as any,
};

// Button states
export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  } as any,
};

export const Loading: Story = {
  args: {
    children: "Loading Button",
    isLoading: true,
  } as any,
};

export const FullWidth: Story = {
  args: {
    children: "Full Width Button",
    fullWidth: true,
  } as any,
};

// Link button
export const Link: Story = {
  args: {
    children: "Link Button",
    href: "https://example.com",
    target: "_blank",
  } as any,
};

// With icons
export const WithIcon: Story = {
  render: (args) => (
    <Button className="group" {...args}>
      Next
      <ArrowRight
        className="-me-1 transition-transform group-hover:translate-x-0.5"
        size={16}
        aria-hidden="true"
      />
    </Button>
  ),
};

export const WithIconLeft: Story = {
  render: (args) => (
    <Button {...args}>
      <Mail /> Email
    </Button>
  ),
};

// Button group example
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default" {...{} as any}>Save</Button>
      <Button variant="secondary" {...{} as any}>Duplicate</Button>
      <Button variant="ghost" {...{} as any}>Cancel</Button>
      <Button variant="destructive" {...{} as any}>Delete</Button>
    </div>
  ),
};

// Custom loading button example with Lucide icon
export const CustomLoading: Story = {
  render: () => (
    <Button disabled className="flex items-center gap-2">
      <Loader2 className="animate-spin" />
      Please wait
    </Button>
  ),
};

// Debug story to inspect class generation
export const DebugClasses: Story = {
  render: () => {
    // Import both for comparison
    const { Button, buttonVariants } = require("@acme/ui/button");
    
    // Get the classes using buttonVariants directly
    const directClasses = buttonVariants({ 
      variant: "secondary", 
      size: "default"
    });
    
    // Create a button using the React component
    const reactButtonElement = (
      <Button variant="secondary" {...{} as any}>React Secondary Button</Button>
    );
    
    return (
      <div className="space-y-4 p-4 border rounded">
        <div>
          <p className="font-bold">1. Direct Classes:</p>
          <code className="block p-2 bg-gray-100 dark:bg-gray-800 rounded whitespace-normal break-all">{directClasses || "No classes generated"}</code>
        </div>
        
        <div>
          <p className="font-bold">2. React Component Button:</p>
          {reactButtonElement}
        </div>
        
        <div>
          <p className="font-bold">3. Raw HTML Button with direct classes:</p>
          <button type="button" className={directClasses}>Raw HTML Button</button>
        </div>
        
        <div>
          <p className="font-bold">4. Regular Tailwind Classes Test:</p>
          <button type="button" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 px-4 rounded">
            Plain Tailwind Button
          </button>
        </div>
      </div>
    );
  },
}; 