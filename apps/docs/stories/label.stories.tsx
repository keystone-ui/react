import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "@acme/ui/label";

const meta = {
  title: "Components/Label",
  component: Label,
  parameters: {
    docs: {
      description: {
        component: `
A simple label component for form elements.

\`\`\`tsx
import { Label } from "@acme/ui";

// Basic label
<Label htmlFor="email">Email</Label>

// With custom styling
<Label htmlFor="name" className="text-blue-500">Name</Label>

// Required label
<Label htmlFor="password">
  Password <span className="text-red-500">*</span>
</Label>
\`\`\`

## Features

- Accessible form labels
- Consistent styling with the rest of the UI
- Proper disabled state styling when used with form controls
- Customizable with additional classes
`,
      },
    },
  },
  argTypes: {
    children: {
      control: "text",
      description: "The content of the label",
      defaultValue: "Label",
    },
    htmlFor: {
      control: "text",
      description: "The ID of the form element this label is associated with",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the label",
    },
  },
} as Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof Label>;

// Basic label
export const Default: Story = {
  args: {
    children: "Email address",
    htmlFor: "email",
  },
};

// Required label
export const Required: Story = {
  args: {
    children: (
      <>
        Password <span className="text-red-500">*</span>
      </>
    ),
    htmlFor: "password",
  },
};

// Label with description
export const WithDescription: Story = {
  args: {
    children: (
      <div className="space-y-1">
        <div>Username</div>
        <p className="text-xs text-muted-foreground font-normal">
          This will be displayed on your profile
        </p>
      </div>
    ),
    htmlFor: "username",
  },
};

// Label examples
export const Examples: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Labels</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first-name">First name</Label>
            <input
              id="first-name"
              className="border rounded-md px-3 py-2 w-full"
              placeholder="Enter your first name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last name</Label>
            <input
              id="last-name"
              className="border rounded-md px-3 py-2 w-full"
              placeholder="Enter your last name"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Required Fields</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email-required">
              Email <span className="text-red-500">*</span>
            </Label>
            <input
              id="email-required"
              className="border rounded-md px-3 py-2 w-full"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-required">
              Password <span className="text-red-500">*</span>
            </Label>
            <input
              id="password-required"
              type="password"
              className="border rounded-md px-3 py-2 w-full"
              placeholder="Enter your password"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">With Descriptions</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="bio">
              <div className="space-y-1">
                <div>Bio</div>
                <p className="text-xs text-muted-foreground font-normal">
                  Write a short introduction about yourself
                </p>
              </div>
            </Label>
            <textarea
              id="bio"
              className="border rounded-md px-3 py-2 w-full h-24"
              placeholder="I'm a software developer..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Disabled State</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 group" data-disabled="true">
            <Label htmlFor="disabled-input">Disabled field</Label>
            <input
              id="disabled-input"
              className="border rounded-md px-3 py-2 w-full opacity-50 cursor-not-allowed"
              placeholder="This field is disabled"
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  ),
}; 