import { Button } from "@keystone/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@keystone/ui/card";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@keystone/ui/tabs";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppWindowIcon,
  BarChartIcon,
  CodeIcon,
  FileTextIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  MailIcon,
  MessageSquareIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component: `
A set of layered sections of content (known as tab panels) that are displayed one at a time.

\`\`\`tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@keystone/ui/tabs";

// Basic usage
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="analytics">Analytics content</TabsContent>
</Tabs>

// Line variant
<Tabs defaultValue="overview">
  <TabsList variant="line">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>
</Tabs>

// Vertical orientation
<Tabs defaultValue="overview" orientation="vertical">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
</Tabs>

// Pill shape
<Tabs defaultValue="overview">
  <TabsList shape="pill">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>
</Tabs>

// Scrollable (with arrow buttons and gradient fades)
<Tabs defaultValue="tab1">
  <TabsList scrollable>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    {/* ...many tabs */}
  </TabsList>
</Tabs>
\`\`\`

## Features

- **Animated sliding indicator** powered by Base UI's \`Tabs.Indicator\` and CSS transitions
- Default and line style variants
- Rounded and pill shapes
- Horizontal and vertical orientations
- Scrollable mode with arrow buttons and CSS scroll-driven gradient fades
- Disabled tab support
- Icon support in triggers
- Controlled and uncontrolled usage
- Keyboard navigation with arrow keys
- Accessible via WAI-ARIA Tabs pattern
`,
      },
    },
  },
  argTypes: {
    defaultValue: {
      control: "text",
      description: "The default selected tab value (uncontrolled)",
    },
  },
  subcomponents: { TabsList, TabsTrigger, TabsIndicator, TabsContent },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof Tabs>;

// Basic tabs with Card content panels
export const Default: Story = {
  render: () => (
    <Tabs className="w-[400px]" defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              View your key metrics and recent project activity. Track progress
              across all your active projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 12 active projects and 3 pending tasks.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Track performance and user engagement metrics. Monitor trends and
              identify growth opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Page views are up 25% compared to last month.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              Generate and download your detailed reports. Export data in
              multiple formats for analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 5 reports ready and available to export.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and options. Customize your
              experience to fit your needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Configure notifications, security, and themes.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

// Line variant
export const Line: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="pt-2 text-muted-foreground text-sm">
          Overview content goes here.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="pt-2 text-muted-foreground text-sm">
          Analytics content goes here.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="pt-2 text-muted-foreground text-sm">
          Reports content goes here.
        </p>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use the `variant="line"` prop on `TabsList` for a line-style indicator instead of the default background style.',
      },
    },
  },
};

// Vertical orientation
export const Vertical: Story = {
  render: () => (
    <Tabs className="w-[400px]" defaultValue="overview" orientation="vertical">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              View your key metrics and recent project activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 12 active projects and 3 pending tasks.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Track performance and user engagement metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Page views are up 25% compared to last month.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              Generate and download your detailed reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 5 reports ready and available to export.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and options.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Configure notifications, security, and themes.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use `orientation="vertical"` on the `Tabs` root for a vertical tab layout. Tabs are displayed in a column with content to the right.',
      },
    },
  },
};

// Disabled tabs
export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="home">
      <TabsList>
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger disabled value="settings">
          Disabled
        </TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="home">
        <p className="pt-2 text-muted-foreground text-sm">
          Home content goes here.
        </p>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="pt-2 text-muted-foreground text-sm">
          Notifications content goes here.
        </p>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `disabled` prop on `TabsTrigger` to prevent interaction with a tab. Disabled tabs are visually muted and cannot be activated.",
      },
    },
  },
};

// Controlled tabs
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | number>("overview");

    return (
      <div className="space-y-4">
        <Tabs onValueChange={setValue} value={value}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="pt-2 text-muted-foreground text-sm">
              Overview content goes here.
            </p>
          </TabsContent>
          <TabsContent value="analytics">
            <p className="pt-2 text-muted-foreground text-sm">
              Analytics content goes here.
            </p>
          </TabsContent>
          <TabsContent value="reports">
            <p className="pt-2 text-muted-foreground text-sm">
              Reports content goes here.
            </p>
          </TabsContent>
        </Tabs>
        <div className="flex gap-2">
          <Button
            onClick={() => setValue("overview")}
            size="sm"
            variant="outline"
          >
            Go to Overview
          </Button>
          <Button
            onClick={() => setValue("analytics")}
            size="sm"
            variant="outline"
          >
            Go to Analytics
          </Button>
          <Button
            onClick={() => setValue("reports")}
            size="sm"
            variant="outline"
          >
            Go to Reports
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the `value` and `onValueChange` props to control the active tab externally. This is useful when you need to sync the active tab with external state or navigation.",
      },
    },
  },
};

// Tabs with icons
export const WithIcons: Story = {
  name: "With Icons",
  render: () => (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">
          <AppWindowIcon />
          Preview
        </TabsTrigger>
        <TabsTrigger value="code">
          <CodeIcon />
          Code
        </TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <p className="pt-2 text-muted-foreground text-sm">
          Preview content goes here.
        </p>
      </TabsContent>
      <TabsContent value="code">
        <p className="pt-2 text-muted-foreground text-sm">
          Code content goes here.
        </p>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Add icons to `TabsTrigger` by including them as children alongside the text. Icons are automatically sized to 16px.",
      },
    },
  },
};

// Line variant + vertical
export const LineVertical: Story = {
  name: "Line Vertical",
  render: () => (
    <Tabs className="w-[400px]" defaultValue="general" orientation="vertical">
      <TabsList variant="line">
        <TabsTrigger value="general">
          <SettingsIcon />
          General
        </TabsTrigger>
        <TabsTrigger value="analytics">
          <BarChartIcon />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="reports">
          <FileTextIcon />
          Reports
        </TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure your general application preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Manage your profile, language, and display settings.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              View your usage analytics and statistics.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Track your activity and performance over time.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              Generate and export detailed reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Download reports in CSV, PDF, or Excel format.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Combine `variant="line"` on `TabsList` with `orientation="vertical"` on `Tabs` for a vertical line-style tab layout. The active indicator appears on the right side of the selected tab.',
      },
    },
  },
};

// Scrollable tabs with many items in a constrained container
export const Scrollable: Story = {
  render: () => (
    <div
      className="rounded-lg border border-border border-dashed p-3"
      style={{ maxWidth: 480 }}
    >
      <p className="mb-3 text-muted-foreground text-xs">
        Constrained to 480px &mdash; use the arrow buttons to navigate
      </p>
      <Tabs defaultValue="dashboard">
        <TabsList scrollable>
          <TabsTrigger value="dashboard">
            <LayoutDashboardIcon />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChartIcon />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users">
            <UsersIcon />
            Users
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquareIcon />
            Messages
          </TabsTrigger>
          <TabsTrigger value="email">
            <MailIcon />
            Email
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldIcon />
            Security
          </TabsTrigger>
          <TabsTrigger value="domains">
            <GlobeIcon />
            Domains
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon />
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>
                Your project overview and key metrics at a glance.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              12 active projects, 3 pending tasks.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Track performance and engagement metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Page views are up 25% this month.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage team members and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              8 active team members, 2 pending invitations.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                View and manage your conversations.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              5 unread messages from 3 contacts.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
              <CardDescription>
                Configure email notifications and templates.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              3 email templates configured.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage security settings and access controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Two-factor authentication is enabled.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <CardTitle>Domains</CardTitle>
              <CardDescription>
                Manage your custom domains and DNS settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              2 domains connected, 1 pending verification.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure your workspace preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Manage notifications, themes, and integrations.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `scrollable` prop on `TabsList` when you have many tabs that may overflow the container. This enables horizontal scrolling with CSS scroll-driven gradient fades (Chrome 115+, gracefully degrades) and arrow buttons for navigation. On mobile, users can also swipe to scroll.",
      },
    },
  },
};

// Pill shape
export const Pill: Story = {
  render: () => (
    <Tabs defaultValue="all-bonuses">
      <TabsList shape="pill">
        <TabsTrigger value="all-bonuses">All Bonuses</TabsTrigger>
        <TabsTrigger value="bonus-history">Bonus History</TabsTrigger>
      </TabsList>
      <TabsContent value="all-bonuses">
        <p className="pt-2 text-muted-foreground text-sm">
          View all available bonuses.
        </p>
      </TabsContent>
      <TabsContent value="bonus-history">
        <p className="pt-2 text-muted-foreground text-sm">
          View your bonus history.
        </p>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use `shape="pill"` on `TabsList` for fully rounded pill-shaped tabs. Can be combined with any variant.',
      },
    },
  },
};

// Animated indicator comparison across all variants
export const AnimatedIndicator: Story = {
  name: "Animated Indicator",
  render: () => (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Default
        </p>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Pill
        </p>
        <Tabs defaultValue="overview">
          <TabsList shape="pill">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Line
        </p>
        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Line + Vertical
        </p>
        <Tabs defaultValue="overview" orientation="vertical">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The sliding indicator animates smoothly between tabs using CSS transitions on Base UI's `Tabs.Indicator`. Click between tabs to see the indicator slide. The animation adapts to each variant: a background pill for default, a fully rounded pill for pill shape, and a 2px bar for line. Respects `prefers-reduced-motion`.",
      },
    },
  },
};
