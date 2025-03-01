import type { Meta, StoryObj } from "@storybook/react";
import { 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  Loader2, 
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  ChevronDown,
  ThumbsUpIcon,
  StarIcon,
  Plus,
} from "lucide-react";
import { 
  RiFacebookFill,
  RiGithubFill,
  RiGoogleFill,
  RiTwitterXFill
} from "@remixicon/react";
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
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button>Default</Button>
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
- Five sizes: xs, sm, default, lg, icon
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
      options: ["xs", "sm", "default", "lg", "icon"],
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

// Link variant with back icon
export const Link: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="link">
        <ArrowLeft /> Go back
      </Button>
    </div>
  ),
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
    children: "Default Button",
    size: "default",
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
      <Button className="aspect-square" aria-label="Next">
        <ArrowRight size={16} />
      </Button>
      
      <Button className="aspect-square" variant="secondary" aria-label="Mail">
        <Mail size={16} />
      </Button>
      
      <Button className="aspect-square" variant="outline" aria-label="Bold">
        <Bold size={16} />
      </Button>
      
      <Button className="aspect-square" variant="ghost" aria-label="Italic">
        <Italic size={16} />
      </Button>
      
      <Button 
        className="aspect-square rounded-full" 
        variant="outline" 
        aria-label="Add"
      >
        <Plus size={16} aria-hidden="true" />
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
export const AsLink: Story = {
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
            size="sm"
            className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
          >
            Merge pull request
          </Button>
          <Button 
            className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10 aspect-square"
            size="sm"
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
              size="sm" 
              className="aspect-square rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
              aria-label="Bold"
            >
              <Bold size={16} aria-hidden="true" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="aspect-square rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
              aria-label="Italic"
            >
              <Italic size={16} aria-hidden="true" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="aspect-square rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
              aria-label="Underline"
            >
              <Underline size={16} aria-hidden="true" />
            </Button>
          </div>
          
          {/* Alignment */}
          <div className="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
            <Button 
              size="sm" 
              className="aspect-square rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
              aria-label="Align Left"
            >
              <AlignLeft size={16} aria-hidden="true" />
            </Button>
            <Button 
              size="sm" 
              className="aspect-square rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
              aria-label="Align Center"
            >
              <AlignCenter size={16} aria-hidden="true" />
            </Button>
            <Button 
              size="sm" 
              className="aspect-square rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
              aria-label="Align Right"
            >
              <AlignRight size={16} aria-hidden="true" />
            </Button>
            <Button 
              size="sm" 
              className="aspect-square rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
              aria-label="Align Justify"
            >
              <AlignJustify size={16} aria-hidden="true" />
            </Button>
          </div>
          
          {/* Flip */}
          <div className="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
            <Button
              className="aspect-square rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
              variant="outline"
              size="sm"
              aria-label="Flip Horizontal"
            >
              <FlipHorizontalIcon size={16} aria-hidden="true" />
            </Button>
            <Button
              className="aspect-square rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
              variant="outline"
              size="sm"
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

// Social buttons example
export const SocialButtons: Story = {
  render: () => (
    <div className="space-y-8">
      {/* Vertical social buttons with text */}
      <div>
        <h3 className="text-sm font-medium mb-2">Vertical with Text</h3>
        <div className="flex flex-col gap-2 max-w-xs">
          <Button variant="outline" size="sm">
            <RiGoogleFill 
              className="me-1 text-[#DB4437] dark:text-white/60" 
              size={16} 
              aria-hidden="true" 
            />
            Login with Google
          </Button>
          <Button variant="outline" size="sm">
            <RiTwitterXFill 
              className="me-1 text-[#14171a] dark:text-white/60" 
              size={16} 
              aria-hidden="true" 
            />
            Login with X
          </Button>
          <Button variant="outline" size="sm">
            <RiFacebookFill 
              className="me-1 text-[#1877f2] dark:text-white/60" 
              size={16} 
              aria-hidden="true" 
            />
            Login with Facebook
          </Button>
          <Button variant="outline" size="sm">
            <RiGithubFill 
              className="me-1 text-[#333333] dark:text-white/60" 
              size={16} 
              aria-hidden="true" 
            />
            Login with GitHub
          </Button>
        </div>
      </div>
      
      {/* Horizontal social buttons with icons only */}
      <div>
        <h3 className="text-sm font-medium mb-2">Horizontal Icons Only</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="aspect-square" aria-label="Login with Google">
            <RiGoogleFill 
              className="text-[#DB4437] dark:text-white/60" 
              size={16} 
              aria-hidden="true" 
            />
          </Button>
          <Button variant="outline" size="sm" className="aspect-square" aria-label="Login with X">
            <RiTwitterXFill 
              className="text-[#14171a] dark:text-white/60" 
              size={16} 
              aria-hidden="true" 
            />
          </Button>
          <Button variant="outline" size="sm" className="aspect-square" aria-label="Login with Facebook">
            <RiFacebookFill 
              className="text-[#1877f2] dark:text-white/60" 
              size={16} 
              aria-hidden="true" 
            />
          </Button>
          <Button variant="outline" size="sm" className="aspect-square" aria-label="Login with GitHub">
            <RiGithubFill 
              className="text-[#333333] dark:text-white/60" 
              size={16} 
              aria-hidden="true" 
            />
          </Button>
        </div>
      </div>

      {/* Social interaction buttons */}
      <div>
        <h3 className="text-sm font-medium mb-2">Social Interaction Buttons</h3>
        <div className="flex flex-wrap gap-4">
          {/* Like button with counter */}
          <Button className="py-0 pe-0" variant="outline">
            <ThumbsUpIcon className="opacity-60 me-1" size={16} aria-hidden="true" />
            Like
            <span className="text-muted-foreground before:bg-input relative ms-1 inline-flex h-full items-center justify-center rounded-full px-3 text-xs font-medium before:absolute before:inset-0 before:left-0 before:w-px">
              86
            </span>
          </Button>

          {/* Star button with counter */}
          <Button>
            <StarIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
            <span className="flex items-baseline gap-2">
              Star
              <span className="text-primary-foreground/60 text-xs">729</span>
            </span>
          </Button>
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