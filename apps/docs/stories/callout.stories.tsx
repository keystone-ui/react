import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Callout,
  CalloutTitle,
  CalloutDescription,
  CalloutAction,
} from "@keystone/ui/callout";
import { Button } from "@keystone/ui/button";
import {
  CheckCircle2Icon,
  AlertTriangleIcon,
  XCircleIcon,
  InfoIcon,
  LockIcon,
  ShieldCheckIcon,
} from "lucide-react";

const meta = {
  title: "Components/Callout",
  component: Callout,
  parameters: {
    docs: {
      description: {
        component: `
A contextual feedback component for displaying alerts, notifications, and status messages with semantic color variants.

\`\`\`tsx
import { Callout, CalloutTitle, CalloutDescription, CalloutAction } from "@keystone/ui/callout";
import { CheckCircle2Icon } from "lucide-react";

// Basic callout
<Callout variant="success">
  <CheckCircle2Icon />
  <CalloutTitle>Payment successful</CalloutTitle>
  <CalloutDescription>
    Your payment of $29.99 has been processed.
  </CalloutDescription>
</Callout>

// With an action
<Callout variant="warning">
  <AlertTriangleIcon />
  <CalloutTitle>KYC Required</CalloutTitle>
  <CalloutDescription>
    Level 2 verification needed to deposit
  </CalloutDescription>
  <CalloutAction>
    <Button variant="ghost" size="xs" className="hover:bg-current/10">Verify</Button>
  </CalloutAction>
</Callout>

// Custom colors via className
<Callout className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
  <AlertTriangleIcon />
  <CalloutTitle>Custom styled callout</CalloutTitle>
  <CalloutDescription>Override colors with className.</CalloutDescription>
</Callout>
\`\`\`

## Features

- Five semantic variants: default, success, warning, error, info
- Optional leading icon via direct SVG child
- Optional action slot positioned in the top-right
- Responsive grid layout that adapts to icon presence
- Custom color support via className override (tailwind-merge)
- Dark mode optimized colors
- Accessible with \`role="alert"\`
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "error", "info"],
      defaultValue: "default",
      description: "The semantic variant of the callout",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the callout",
    },
  },
} as Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof Callout>;

// ── Core ────────────────────────────────────────────────────────────────

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "A basic default callout with an icon, title, and description.",
      },
    },
  },
  render: () => (
    <Callout className="max-w-md">
      <CheckCircle2Icon />
      <CalloutTitle>Profile Information</CalloutTitle>
      <CalloutDescription>
        Make sure your personal details are up to date.
      </CalloutDescription>
    </Callout>
  ),
};

export const Success: Story = {
  parameters: {
    docs: {
      description: {
        story: "A success callout for positive feedback.",
      },
    },
  },
  render: () => (
    <Callout variant="success" className="max-w-md">
      <CheckCircle2Icon />
      <CalloutTitle>Account updated successfully</CalloutTitle>
      <CalloutDescription>
        Your profile information has been saved. Changes will be reflected
        immediately.
      </CalloutDescription>
    </Callout>
  ),
};

export const Warning: Story = {
  parameters: {
    docs: {
      description: {
        story: "A warning callout for cautionary messages.",
      },
    },
  },
  render: () => (
    <Callout variant="warning" className="max-w-md">
      <AlertTriangleIcon />
      <CalloutTitle>KYC Required</CalloutTitle>
      <CalloutDescription>
        Level 2 verification needed to deposit
      </CalloutDescription>
    </Callout>
  ),
};

export const Error: Story = {
  parameters: {
    docs: {
      description: {
        story: "An error callout for failure or destructive messages.",
      },
    },
  },
  render: () => (
    <Callout variant="error" className="max-w-md">
      <XCircleIcon />
      <CalloutTitle>Payment Failed</CalloutTitle>
      <CalloutDescription>
        Your transaction could not be processed. Please try again
      </CalloutDescription>
    </Callout>
  ),
};

export const Info: Story = {
  parameters: {
    docs: {
      description: {
        story: "An info callout for general informational messages.",
      },
    },
  },
  render: () => (
    <Callout variant="info" className="max-w-md">
      <InfoIcon />
      <CalloutTitle>New Feature is Available</CalloutTitle>
      <CalloutDescription>
        Check out our latest trading tools and analytics
      </CalloutDescription>
    </Callout>
  ),
};

// ── Patterns ────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story: "All five callout variants displayed together.",
      },
    },
  },
  render: () => (
    <div className="grid w-full max-w-lg gap-4">
      <Callout>
        <CheckCircle2Icon />
        <CalloutTitle>Profile Information</CalloutTitle>
        <CalloutDescription>
          Make sure your personal details are up to date.
        </CalloutDescription>
      </Callout>
      <Callout variant="warning">
        <AlertTriangleIcon />
        <CalloutTitle>KYC Required</CalloutTitle>
        <CalloutDescription>
          Level 2 verification needed to deposit
        </CalloutDescription>
      </Callout>
      <Callout variant="success">
        <CheckCircle2Icon />
        <CalloutTitle>256-bit SSI Encrypted</CalloutTitle>
        <CalloutDescription>
          Your payment information is secure
        </CalloutDescription>
      </Callout>
      <Callout variant="info">
        <InfoIcon />
        <CalloutTitle>New Feature is Available</CalloutTitle>
        <CalloutDescription>
          Check out our latest trading tools and analytics
        </CalloutDescription>
      </Callout>
      <Callout variant="error">
        <XCircleIcon />
        <CalloutTitle>Payment Failed</CalloutTitle>
        <CalloutDescription>
          Your transaction could not be processed. Please try again
        </CalloutDescription>
      </Callout>
    </div>
  ),
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Callouts with an action slot positioned in the top-right corner. Actions can be buttons, links, or icons.",
      },
    },
  },
  render: () => (
    <div className="grid w-full max-w-lg gap-4">
      <Callout>
        <CheckCircle2Icon />
        <CalloutTitle>Profile Information</CalloutTitle>
        <CalloutDescription>
          Make sure your personal details are up to date.
        </CalloutDescription>
        <CalloutAction>
          <Button variant="ghost" size="xs" className="hover:bg-current/10">Edit</Button>
        </CalloutAction>
      </Callout>
      <Callout variant="warning">
        <AlertTriangleIcon />
        <CalloutTitle>KYC Required</CalloutTitle>
        <CalloutDescription>
          Level 2 verification needed to deposit
        </CalloutDescription>
        <CalloutAction>
          <Button variant="ghost" size="xs" className="hover:bg-current/10">Verify</Button>
        </CalloutAction>
      </Callout>
      <Callout variant="success">
        <CheckCircle2Icon />
        <CalloutTitle>256-bit SSI Encrypted</CalloutTitle>
        <CalloutDescription>
          Your payment information is secure
        </CalloutDescription>
        <CalloutAction>
          <Button variant="ghost" size="icon-xs" className="hover:bg-current/10">
            <LockIcon />
          </Button>
        </CalloutAction>
      </Callout>
      <Callout variant="info">
        <InfoIcon />
        <CalloutTitle>New Feature is Available</CalloutTitle>
        <CalloutDescription>
          Check out our latest trading tools and analytics
        </CalloutDescription>
        <CalloutAction>
          <Button variant="ghost" size="xs" className="hover:bg-current/10">Learn more</Button>
        </CalloutAction>
      </Callout>
      <Callout variant="error">
        <XCircleIcon />
        <CalloutTitle>Payment Failed</CalloutTitle>
        <CalloutDescription>
          Your transaction could not be processed. Please try again
        </CalloutDescription>
        <CalloutAction>
          <Button variant="ghost" size="xs" className="hover:bg-current/10">Retry</Button>
        </CalloutAction>
      </Callout>
    </div>
  ),
};

export const WithoutIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Callouts without a leading icon use a single-column layout automatically.",
      },
    },
  },
  render: () => (
    <div className="grid w-full max-w-lg gap-4">
      <Callout>
        <CalloutTitle>Default callout without icon</CalloutTitle>
        <CalloutDescription>
          The grid layout adapts to a single column when no SVG icon is present.
        </CalloutDescription>
      </Callout>
      <Callout variant="info">
        <CalloutTitle>Did you know?</CalloutTitle>
        <CalloutDescription>
          You can also use callouts without icons for simpler messages.
        </CalloutDescription>
      </Callout>
    </div>
  ),
};

export const CustomColors: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "You can customize the callout colors by passing custom Tailwind classes via className. The `cn()` utility with `tailwind-merge` ensures your overrides take precedence.",
      },
    },
  },
  render: () => (
    <div className="grid w-full max-w-lg gap-4">
      <Callout className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
        <AlertTriangleIcon />
        <CalloutTitle>Your subscription will expire in 3 days.</CalloutTitle>
        <CalloutDescription>
          Renew now to avoid service interruption or upgrade to a paid plan to
          continue using the service.
        </CalloutDescription>
      </Callout>
      <Callout className="border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-50">
        <ShieldCheckIcon />
        <CalloutTitle>Two-factor authentication enabled</CalloutTitle>
        <CalloutDescription>
          Your account is now protected with an additional layer of security.
        </CalloutDescription>
      </Callout>
      <Callout className="border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-50">
        <InfoIcon />
        <CalloutTitle>Custom teal callout</CalloutTitle>
        <CalloutDescription>
          Any Tailwind color can be used to create custom callout styles.
        </CalloutDescription>
      </Callout>
    </div>
  ),
};
