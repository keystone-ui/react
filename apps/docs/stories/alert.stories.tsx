import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@keystone/ui/alert";
import { Button } from "@keystone/ui/button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  LockIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "lucide-react";

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    docs: {
      description: {
        component: `
A status message banner for displaying alerts, notifications, and status messages with semantic color variants.

Uses \`role="alert"\` for screen reader announcements — this is a system feedback component, not a content display component. For generic list rows or content blocks, use the **Item** component instead.

\`\`\`tsx
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@keystone/ui/alert";
import { CheckCircle2Icon } from "lucide-react";

// Basic alert
<Alert variant="success">
  <CheckCircle2Icon />
  <AlertTitle>Payment successful</AlertTitle>
  <AlertDescription>
    Your payment of $29.99 has been processed.
  </AlertDescription>
</Alert>

// With an action
<Alert variant="warning">
  <AlertTriangleIcon />
  <AlertTitle>KYC Required</AlertTitle>
  <AlertDescription>
    Level 2 verification needed to deposit
  </AlertDescription>
  <AlertAction>
    <Button variant="ghost" size="xs" className="hover:bg-current/10">Verify</Button>
  </AlertAction>
</Alert>

// Custom colors via className
<Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
  <AlertTriangleIcon />
  <AlertTitle>Custom styled alert</AlertTitle>
  <AlertDescription>Override colors with className.</AlertDescription>
</Alert>
\`\`\`

## Alert vs Item

| | Alert | Item |
|---|---|---|
| **Semantics** | \`role="alert"\` | Generic div |
| **Structure** | Grid (icon + text) | Flex (media + content + actions) |
| **Sub-components** | 3 | 10 |
| **Icon/media** | Raw \`<svg>\` child | ItemMedia with icon/image variants |
| **Actions** | AlertAction (top-right) | ItemActions slot |
| **Grouping** | None | ItemGroup + ItemSeparator |
| **Polymorphic** | No | Yes (\`render\` prop) |
| **Purpose** | Status feedback | Content display |

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
      description: "The semantic variant of the alert",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the alert",
    },
  },
} as Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof Alert>;

// ── Core ────────────────────────────────────────────────────────────────

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "A basic default alert with an icon, title, and description.",
      },
    },
  },
  render: () => (
    <Alert className="max-w-md">
      <CheckCircle2Icon />
      <AlertTitle>Profile Information</AlertTitle>
      <AlertDescription>
        Make sure your personal details are up to date.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  parameters: {
    docs: {
      description: {
        story: "A success alert for positive feedback.",
      },
    },
  },
  render: () => (
    <Alert className="max-w-md" variant="success">
      <CheckCircle2Icon />
      <AlertTitle>Account updated successfully</AlertTitle>
      <AlertDescription>
        Your profile information has been saved. Changes will be reflected
        immediately.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  parameters: {
    docs: {
      description: {
        story: "A warning alert for cautionary messages.",
      },
    },
  },
  render: () => (
    <Alert className="max-w-md" variant="warning">
      <AlertTriangleIcon />
      <AlertTitle>KYC Required</AlertTitle>
      <AlertDescription>
        Level 2 verification needed to deposit
      </AlertDescription>
    </Alert>
  ),
};

export const Error: Story = {
  parameters: {
    docs: {
      description: {
        story: "An error alert for failure or destructive messages.",
      },
    },
  },
  render: () => (
    <Alert className="max-w-md" variant="error">
      <XCircleIcon />
      <AlertTitle>Payment Failed</AlertTitle>
      <AlertDescription>
        Your transaction could not be processed. Please try again
      </AlertDescription>
    </Alert>
  ),
};

export const Info: Story = {
  parameters: {
    docs: {
      description: {
        story: "An info alert for general informational messages.",
      },
    },
  },
  render: () => (
    <Alert className="max-w-md" variant="info">
      <InfoIcon />
      <AlertTitle>New Feature is Available</AlertTitle>
      <AlertDescription>
        Check out our latest trading tools and analytics
      </AlertDescription>
    </Alert>
  ),
};

// ── Patterns ────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story: "All five alert variants displayed together.",
      },
    },
  },
  render: () => (
    <div className="grid w-full max-w-lg gap-4">
      <Alert>
        <CheckCircle2Icon />
        <AlertTitle>Profile Information</AlertTitle>
        <AlertDescription>
          Make sure your personal details are up to date.
        </AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTriangleIcon />
        <AlertTitle>KYC Required</AlertTitle>
        <AlertDescription>
          Level 2 verification needed to deposit
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <CheckCircle2Icon />
        <AlertTitle>256-bit SSI Encrypted</AlertTitle>
        <AlertDescription>Your payment information is secure</AlertDescription>
      </Alert>
      <Alert variant="info">
        <InfoIcon />
        <AlertTitle>New Feature is Available</AlertTitle>
        <AlertDescription>
          Check out our latest trading tools and analytics
        </AlertDescription>
      </Alert>
      <Alert variant="error">
        <XCircleIcon />
        <AlertTitle>Payment Failed</AlertTitle>
        <AlertDescription>
          Your transaction could not be processed. Please try again
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Alerts with an action slot positioned in the top-right corner. Actions can be buttons, links, or icons.",
      },
    },
  },
  render: () => (
    <div className="grid w-full max-w-lg gap-4">
      <Alert>
        <CheckCircle2Icon />
        <AlertTitle>Profile Information</AlertTitle>
        <AlertDescription>
          Make sure your personal details are up to date.
        </AlertDescription>
        <AlertAction>
          <Button className="hover:bg-current/10" size="xs" variant="ghost">
            Edit
          </Button>
        </AlertAction>
      </Alert>
      <Alert variant="warning">
        <AlertTriangleIcon />
        <AlertTitle>KYC Required</AlertTitle>
        <AlertDescription>
          Level 2 verification needed to deposit
        </AlertDescription>
        <AlertAction>
          <Button className="hover:bg-current/10" size="xs" variant="ghost">
            Verify
          </Button>
        </AlertAction>
      </Alert>
      <Alert variant="success">
        <CheckCircle2Icon />
        <AlertTitle>256-bit SSI Encrypted</AlertTitle>
        <AlertDescription>Your payment information is secure</AlertDescription>
        <AlertAction>
          <Button
            className="hover:bg-current/10"
            size="icon-xs"
            variant="ghost"
          >
            <LockIcon />
          </Button>
        </AlertAction>
      </Alert>
      <Alert variant="info">
        <InfoIcon />
        <AlertTitle>New Feature is Available</AlertTitle>
        <AlertDescription>
          Check out our latest trading tools and analytics
        </AlertDescription>
        <AlertAction>
          <Button className="hover:bg-current/10" size="xs" variant="ghost">
            Learn more
          </Button>
        </AlertAction>
      </Alert>
      <Alert variant="error">
        <XCircleIcon />
        <AlertTitle>Payment Failed</AlertTitle>
        <AlertDescription>
          Your transaction could not be processed. Please try again
        </AlertDescription>
        <AlertAction>
          <Button className="hover:bg-current/10" size="xs" variant="ghost">
            Retry
          </Button>
        </AlertAction>
      </Alert>
    </div>
  ),
};

export const WithoutIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Alerts without a leading icon use a single-column layout automatically.",
      },
    },
  },
  render: () => (
    <div className="grid w-full max-w-lg gap-4">
      <Alert>
        <AlertTitle>Default alert without icon</AlertTitle>
        <AlertDescription>
          The grid layout adapts to a single column when no SVG icon is present.
        </AlertDescription>
      </Alert>
      <Alert variant="info">
        <AlertTitle>Did you know?</AlertTitle>
        <AlertDescription>
          You can also use alerts without icons for simpler messages.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const CustomColors: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "You can customize the alert colors by passing custom Tailwind classes via className. The `cn()` utility with `tailwind-merge` ensures your overrides take precedence.",
      },
    },
  },
  render: () => (
    <div className="grid w-full max-w-lg gap-4">
      <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
        <AlertTriangleIcon />
        <AlertTitle>Your subscription will expire in 3 days.</AlertTitle>
        <AlertDescription>
          Renew now to avoid service interruption or upgrade to a paid plan to
          continue using the service.
        </AlertDescription>
      </Alert>
      <Alert className="border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-50">
        <ShieldCheckIcon />
        <AlertTitle>Two-factor authentication enabled</AlertTitle>
        <AlertDescription>
          Your account is now protected with an additional layer of security.
        </AlertDescription>
      </Alert>
      <Alert className="border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-50">
        <InfoIcon />
        <AlertTitle>Custom teal alert</AlertTitle>
        <AlertDescription>
          Any Tailwind color can be used to create custom alert styles.
        </AlertDescription>
      </Alert>
    </div>
  ),
};
