import type { Meta, StoryObj } from "@storybook/react-vite";
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
import { Button } from "../components/ui/button";
import { ButtonGroup } from "../components/ui/button-group";
import type { ButtonProps } from "../components/ui/button";
import { useState } from "react";
import { cn } from "../lib/utils";

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

// New ButtonGroup component example
export const ButtonGroups: Story = {
  render: () => (
    <div className="space-y-8">
      {/* Horizontal ButtonGroup */}
      <div>
        <h3 className="text-sm font-medium mb-2">Horizontal ButtonGroup (attached)</h3>
        <ButtonGroup>
          <Button variant="default">Save</Button>
          <Button variant="default">Duplicate</Button>
          <Button variant="default">Delete</Button>
        </ButtonGroup>
      </div>
      
      {/* Horizontal ButtonGroup with secondary variant */}
      <div>
        <h3 className="text-sm font-medium mb-2">Secondary Variants</h3>
        <ButtonGroup>
          <Button variant="secondary">Previous</Button>
          <Button variant="secondary">Current</Button>
          <Button variant="secondary">Next</Button>
        </ButtonGroup>
      </div>
      
      {/* Horizontal ButtonGroup with outline variant */}
      <div>
        <h3 className="text-sm font-medium mb-2">Outline Variant</h3>
        <ButtonGroup>
          <Button variant="outline">Day</Button>
          <Button variant="outline">Week</Button>
          <Button variant="outline">Month</Button>
          <Button variant="outline">Year</Button>
        </ButtonGroup>
      </div>
      
      {/* Icon-only button groups */}
      <div>
        <h3 className="text-sm font-medium mb-2">Icon-only Button Groups</h3>
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-2">
            <ButtonGroup>
              <Button 
                variant="outline" 
                size="sm" 
                className="aspect-square"
                aria-label="Bold"
              >
                <Bold aria-hidden="true" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="aspect-square"
                aria-label="Italic"
              >
                <Italic aria-hidden="true" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="aspect-square"
                aria-label="Underline"
              >
                <Underline aria-hidden="true" />
              </Button>
            </ButtonGroup>
          </div>
          
          {/* Alignment */}
          <div className="flex items-center gap-2">
            <ButtonGroup>
              <Button 
                variant="default"
                size="sm" 
                className="aspect-square"
                aria-label="Align Left"
              >
                <AlignLeft aria-hidden="true" />
              </Button>
              <Button 
                variant="default"
                size="sm" 
                className="aspect-square"
                aria-label="Align Center"
              >
                <AlignCenter aria-hidden="true" />
              </Button>
              <Button 
                variant="default"
                size="sm" 
                className="aspect-square"
                aria-label="Align Right"
              >
                <AlignRight aria-hidden="true" />
              </Button>
              <Button 
                variant="default"
                size="sm" 
                className="aspect-square"
                aria-label="Align Justify"
              >
                <AlignJustify aria-hidden="true" />
              </Button>
            </ButtonGroup>
          </div>
          
          {/* Flip */}
          <div className="flex items-center gap-2">
            <ButtonGroup>
              <Button
                variant="outline"
                size="sm"
                className="aspect-square"
                aria-label="Flip Horizontal"
              >
                <FlipHorizontalIcon aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="aspect-square"
                aria-label="Flip Vertical"
              >
                <FlipVerticalIcon aria-hidden="true" />
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
      
      {/* Vertical ButtonGroup */}
      <div>
        <h3 className="text-sm font-medium mb-2">Vertical ButtonGroup</h3>
        <ButtonGroup orientation="vertical">
          <Button variant="default">Top</Button>
          <Button variant="default">Middle</Button>
          <Button variant="default">Bottom</Button>
        </ButtonGroup>
      </div>
      
      {/* Non-attached ButtonGroup */}
      <div>
        <h3 className="text-sm font-medium mb-2">Non-attached ButtonGroup</h3>
        <ButtonGroup attached={false}>
          <Button variant="default">Save</Button>
          <Button variant="secondary">Duplicate</Button>
          <Button variant="destructive">Delete</Button>
        </ButtonGroup>
      </div>
      
      {/* Split button example */}
      <div>
        <h3 className="text-sm font-medium mb-2">Split Button Examples</h3>
        <div className="flex flex-col gap-4">
          {/* Using ButtonGroup */}
          <div className="flex items-center gap-2">
            <ButtonGroup className="divide-x divide-primary-foreground/30">
              <Button size="sm">
                Merge pull request
              </Button>
              <Button 
                size="sm"
                className="aspect-square"
                aria-label="Options"
              >
                <ChevronDown aria-hidden="true" />
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "The `ButtonGroup` component provides an easy way to create attached button groups with proper styling for borders and border radius.",
      },
    },
  },
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

// Rounded buttons example
export const RoundedButtons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button className="rounded-full" size="sm">
        Default
      </Button>
      
      <Button className="rounded-full" variant="secondary" size="sm">
        Secondary
      </Button>
      
      <Button className="rounded-full" variant="destructive" size="sm">
        Destructive
      </Button>
      
      <Button className="rounded-full" variant="outline" size="sm">
        Outline
      </Button>
      
      <Button className="rounded-full" variant="ghost" size="sm">
        Ghost
      </Button>
      
      <Button className="rounded-full" variant="link" size="sm">
        Link
      </Button>
      
      <Button className="rounded-full aspect-square" size="sm" aria-label="Icon">
        <Plus size={16} aria-hidden="true" />
      </Button>
    </div>
  ),
};