import { Button, type ButtonProps } from "@keystone/ui/button";
import { ButtonGroup } from "@keystone/ui/button-group";
import { cn } from "@keystone/ui/utils";
import {
  RiFacebookFill,
  RiGithubFill,
  RiGoogleFill,
  RiTwitterXFill,
} from "@remixicon/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArrowLeft,
  ArrowRight,
  Bold,
  ChevronDown,
  Italic,
  Loader2,
  Mail,
  Plus,
  StarIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

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
import { Button } from "@keystone/ui/button";

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
    onClick: fn(),
  } as any,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /button/i });

    // Simulate click
    await userEvent.click(button);

    // Assert onClick was called
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
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
      <Button aria-label="Next" className="aspect-square">
        <ArrowRight size={16} />
      </Button>

      <Button aria-label="Mail" className="aspect-square" variant="secondary">
        <Mail size={16} />
      </Button>

      <Button aria-label="Bold" className="aspect-square" variant="outline">
        <Bold size={16} />
      </Button>

      <Button aria-label="Italic" className="aspect-square" variant="ghost">
        <Italic size={16} />
      </Button>

      <Button
        aria-label="Add"
        className="aspect-square rounded-full"
        variant="outline"
      >
        <Plus aria-hidden="true" size={16} />
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
    onClick: fn(),
  } as any,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /disabled button/i });

    // Simulate click on disabled button
    await userEvent.click(button);

    // Assert button is disabled and onClick was not called
    await expect(button).toBeDisabled();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
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
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleClick}
          >
            Text only
          </Button>

          {/* Button with icon on the left */}
          <Button
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleClick}
            variant="secondary"
          >
            <Mail />
            Icon left
          </Button>

          {/* Button with icon on the right */}
          <Button
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleClick}
            variant="outline"
          >
            Icon right
            <ArrowRight />
          </Button>
        </div>
      </div>
    );
  },
};

// ButtonGroup example
export const ButtonGroups: Story = {
  name: "Button Group",
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
      <Button variant="outline">Year</Button>
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "To create a button group, use the `ButtonGroup` component. See the [ButtonGroup documentation](?path=/docs/components-buttongroup--docs) for more examples.",
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
        <h3 className="mb-2 font-medium text-sm">Vertical with Text</h3>
        <div className="flex max-w-xs flex-col gap-2">
          <Button size="sm" variant="outline">
            <RiGoogleFill
              aria-hidden="true"
              className="me-1 text-[#DB4437] dark:text-white/60"
              size={16}
            />
            Login with Google
          </Button>
          <Button size="sm" variant="outline">
            <RiTwitterXFill
              aria-hidden="true"
              className="me-1 text-[#14171a] dark:text-white/60"
              size={16}
            />
            Login with X
          </Button>
          <Button size="sm" variant="outline">
            <RiFacebookFill
              aria-hidden="true"
              className="me-1 text-[#1877f2] dark:text-white/60"
              size={16}
            />
            Login with Facebook
          </Button>
          <Button size="sm" variant="outline">
            <RiGithubFill
              aria-hidden="true"
              className="me-1 text-[#333333] dark:text-white/60"
              size={16}
            />
            Login with GitHub
          </Button>
        </div>
      </div>

      {/* Horizontal social buttons with icons only */}
      <div>
        <h3 className="mb-2 font-medium text-sm">Horizontal Icons Only</h3>
        <div className="flex gap-2">
          <Button
            aria-label="Login with Google"
            className="aspect-square"
            size="sm"
            variant="outline"
          >
            <RiGoogleFill
              aria-hidden="true"
              className="text-[#DB4437] dark:text-white/60"
              size={16}
            />
          </Button>
          <Button
            aria-label="Login with X"
            className="aspect-square"
            size="sm"
            variant="outline"
          >
            <RiTwitterXFill
              aria-hidden="true"
              className="text-[#14171a] dark:text-white/60"
              size={16}
            />
          </Button>
          <Button
            aria-label="Login with Facebook"
            className="aspect-square"
            size="sm"
            variant="outline"
          >
            <RiFacebookFill
              aria-hidden="true"
              className="text-[#1877f2] dark:text-white/60"
              size={16}
            />
          </Button>
          <Button
            aria-label="Login with GitHub"
            className="aspect-square"
            size="sm"
            variant="outline"
          >
            <RiGithubFill
              aria-hidden="true"
              className="text-[#333333] dark:text-white/60"
              size={16}
            />
          </Button>
        </div>
      </div>

      {/* Social interaction buttons */}
      <div>
        <h3 className="mb-2 font-medium text-sm">Social Interaction Buttons</h3>
        <div className="flex flex-wrap gap-4">
          {/* Like button with counter */}
          <Button className="py-0 pe-0" variant="outline">
            <ThumbsUpIcon
              aria-hidden="true"
              className="me-1 opacity-60"
              size={16}
            />
            Like
            <span className="relative ms-1 inline-flex h-full items-center justify-center rounded-full px-3 font-medium text-muted-foreground text-xs before:absolute before:inset-0 before:left-0 before:w-px before:bg-input">
              86
            </span>
          </Button>

          {/* Star button with counter */}
          <Button>
            <StarIcon
              aria-hidden="true"
              className="-ms-1 opacity-60"
              size={16}
            />
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
          <Button onClick={toggleLoading} size="sm" variant="outline">
            {isLoading ? "Stop Loading" : "Start Loading"}
          </Button>
          <p className="text-muted-foreground text-sm">
            ← Click to toggle loading state on all buttons
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Custom loading indicator */}
          <Button className="flex items-center gap-2" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Manual loader
          </Button>

          {/* Icon on left with loading */}
          <Button
            className="flex items-center gap-2"
            isLoading={isLoading}
            variant="secondary"
          >
            <Mail className="h-4 w-4" />
            With left icon
          </Button>

          {/* Icon on right with loading */}
          <Button
            className="flex items-center gap-2"
            isLoading={isLoading}
            variant="outline"
          >
            With right icon
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {/* Multiple icons with loading */}
          <Button
            className="flex items-center gap-2"
            isLoading={isLoading}
            variant="destructive"
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

      <Button className="rounded-full" size="sm" variant="secondary">
        Secondary
      </Button>

      <Button className="rounded-full" size="sm" variant="destructive">
        Destructive
      </Button>

      <Button className="rounded-full" size="sm" variant="outline">
        Outline
      </Button>

      <Button className="rounded-full" size="sm" variant="ghost">
        Ghost
      </Button>

      <Button className="rounded-full" size="sm" variant="link">
        Link
      </Button>

      <Button
        aria-label="Icon"
        className="aspect-square rounded-full"
        size="sm"
      >
        <Plus aria-hidden="true" size={16} />
      </Button>
    </div>
  ),
};
