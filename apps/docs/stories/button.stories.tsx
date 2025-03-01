import type { Meta, StoryObj } from "@storybook/react";
import { 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  Loader2, 
  LoaderCircleIcon,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  ChevronDown
} from "lucide-react";
import { Button } from "@acme/ui/button";
import type { ButtonProps } from "@acme/ui/button";
import { useState } from "react";
import { cn } from "@acme/ui";

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
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// Link button
<Button href="/dashboard">Go to Dashboard</Button>

// Button groups
<div className="inline-flex gap-2">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</div>

// Attached button group
<div className="inline-flex -space-x-px rounded-md shadow-xs">
  <Button className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md">Button 1</Button>
  <Button className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md">Button 2</Button>
</div>
\`\`\`

## Features

- Multiple variants: default, secondary, destructive, ghost, outline
- Four sizes: xs, sm, md, lg, icon
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
      options: ["xs", "sm", "md", "lg", "icon"],
      defaultValue: "md",
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
    size: "md",
  } as any,
};

export const Large: Story = {
  args: {
    children: "Large Button",
    size: "lg",
  } as any,
};

// Icon button example
export const IconButton: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button size="icon" aria-label="Next">
        <ArrowRight size={16} />
      </Button>
      
      <Button size="icon" variant="secondary" aria-label="Mail">
        <Mail size={16} />
      </Button>
      
      <Button size="icon" variant="outline" aria-label="Bold">
        <Bold size={16} />
      </Button>
      
      <Button size="icon" variant="ghost" aria-label="Italic">
        <Italic size={16} />
      </Button>
      
      <Button 
        size="icon" 
        variant="outline" 
        className="rounded-full" 
        aria-label="Add"
      >
        <svg 
          width="15" 
          height="15" 
          viewBox="0 0 15 15" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path 
            d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" 
            fill="currentColor" 
            fillRule="evenodd" 
            clipRule="evenodd"
          />
        </svg>
      </Button>
    </div>
  ),
};

// With icons
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        Next <ArrowRight />
      </Button>
      
      <Button variant="secondary">
        <Mail /> Email
      </Button>
      
      <Button variant="outline">
        <ArrowLeft /> Previous
      </Button>
      
      <Button variant="ghost">
        Settings <ChevronDown />
      </Button>
    </div>
  ),
};

// Button states
export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  } as any,
};

export const FullWidth: Story = {
  args: {
    children: "Full Width Button",
    className: "w-full",
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

// Interactive loading state example
export const Loading: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleClick = () => {
      setIsLoading(true);
      // Simulate an async operation
      setTimeout(() => {
        setIsLoading(false);
      }, 1500); // Reset after 1.5 seconds
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          {/* Text only button */}
          <Button
            onClick={handleClick}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Text only
          </Button>
          
          {/* Button with icon on the left */}
          <Button
            variant="secondary"
            onClick={handleClick}
            isLoading={isLoading}
            disabled={isLoading}
          >
            <Mail /> 
            Icon left
          </Button>
          
          {/* Button with icon on the right */}
          <Button
            variant="outline"
            onClick={handleClick}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Icon right
            <ArrowRight />
          </Button>
        </div>
      </div>
    );
  },
};

// Button group example
export const ButtonGroup: Story = {
  render: () => (
    <div className="space-y-8">
      {/* Standard button group with gap */}
      <div>
        <h3 className="text-sm font-medium mb-2">Standard Button Group (with gap-2)</h3>
        <div className="inline-flex gap-2">
          <Button variant="default">Save</Button>
          <Button variant="secondary">Duplicate</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>
      
      {/* Attached button group */}
      <div>
        <h3 className="text-sm font-medium mb-2">Attached Button Group</h3>
        <div className="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
          <Button 
            variant="outline"
            className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
          >
            Save
          </Button>
          <Button 
            variant="outline"
            className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
          >
            Duplicate
          </Button>
          <Button 
            variant="outline"
            className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
          >
            Cancel
          </Button>
          <Button 
            variant="outline"
            className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
          >
            Delete
          </Button>
        </div>
      </div>
      
      {/* Border Button Group */}
      <div>
        <h3 className="text-sm font-medium mb-2">Border Button Group</h3>
        <div className="inline-flex divide-x divide-primary-foreground/30 rounded-md shadow-xs rtl:space-x-reverse">
          <Button 
            className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
            size="sm"
          >
            Merge pull request
          </Button>
          <Button 
            className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
            size="icon"
            aria-label="Options"
          >
            <ChevronDown size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>
      
      {/* Icon button group */}
      <div>
        <h3 className="text-sm font-medium mb-2">Icon Button Group</h3>
        <div className="flex flex-col items-start gap-4">
          {/* Text formatting */}
          <div className="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
            <Button 
              variant="outline" 
              size="icon" 
              aria-label="Bold"
              className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
            >
              <Bold size={16} aria-hidden="true" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              aria-label="Italic"
              className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
            >
              <Italic size={16} aria-hidden="true" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              aria-label="Underline"
              className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
            >
              <Underline size={16} aria-hidden="true" />
            </Button>
          </div>
          
          {/* Alignment */}
          <div className="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
            <Button 
              size="icon" 
              aria-label="Align Left"
              className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
            >
              <AlignLeft size={16} aria-hidden="true" />
            </Button>
            <Button 
              size="icon" 
              aria-label="Align Center"
              className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
            >
              <AlignCenter size={16} aria-hidden="true" />
            </Button>
            <Button 
              size="icon" 
              aria-label="Align Right"
              className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
            >
              <AlignRight size={16} aria-hidden="true" />
            </Button>
            <Button 
              size="icon" 
              aria-label="Align Justify"
              className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
            >
              <AlignJustify size={16} aria-hidden="true" />
            </Button>
          </div>
          
          {/* Flip */}
          <div className="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
            <Button
              className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Flip Horizontal"
            >
              <FlipHorizontalIcon size={16} aria-hidden="true" />
            </Button>
            <Button
              className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Flip Vertical"
            >
              <FlipVerticalIcon size={16} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Custom loading button example with Lucide icon
export const CustomLoading: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const toggleLoading = () => {
      setIsLoading(!isLoading);
    };
    
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleLoading}
          >
            {isLoading ? "Stop Loading" : "Start Loading"}
          </Button>
          <p className="text-sm text-muted-foreground">
            ← Click to toggle loading state on all buttons
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Custom loading indicator */}
          <Button disabled={isLoading} className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Manual loader
          </Button>
          
          {/* Icon on left with loading */}
          <Button 
            variant="secondary" 
            isLoading={isLoading}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            With left icon
          </Button>
          
          {/* Icon on right with loading */}
          <Button 
            variant="outline"
            isLoading={isLoading} 
            className="flex items-center gap-2"
          >
            With right icon
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          {/* Multiple icons with loading */}
          <Button 
            variant="destructive"
            isLoading={isLoading}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Multiple icons
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  },
};