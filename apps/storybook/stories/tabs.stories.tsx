import { Button } from "@keystoneui/react/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import { Reel } from "@keystoneui/react/reel";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
  TabsTriggerLabel,
} from "@keystoneui/react/tabs";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppWindow as AppWindowIcon,
  ChartNoAxesColumnIncreasing as BarChartIcon,
  Code as CodeIcon,
  FileText as FileTextIcon,
  Globe as GlobeIcon,
  House as HomeIcon,
  Inbox as InboxIcon,
  LayoutDashboard as LayoutDashboardIcon,
  Mail as MailIcon,
  MessageSquare as MessageSquareIcon,
  Mic as MicIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Users as UsersIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

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
} from "@keystoneui/react/tabs";

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

// Scrollable (edge fades and bare chevrons, built on Reel)
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
- Scrollable mode with edge fades and bare chevrons, built on Reel
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
  subcomponents: {
    TabsList,
    TabsTrigger,
    TabsTriggerLabel,
    TabsIndicator,
    TabsContent,
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");

    // Click the second tab ("Analytics")
    await userEvent.click(tabs[1]);

    // Expect the Analytics tab panel content to be visible
    await expect(
      canvas.getByText("Page views are up 25% compared to last month.")
    ).toBeVisible();
  },
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
        Constrained to 480px &mdash; use the chevrons to navigate
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
          "Use the `scrollable` prop on `TabsList` when you have many tabs that may overflow the container. This puts the list in a Reel: it scrolls sideways with edge fades (CSS scroll-driven animations, Chrome 115+, gracefully degrades) and bare chevrons built on Reel. Reel brings the active tab into view when the list gains room or the selection changes, if the Reel's last measured content width and the tab's width are positive. On mobile, users can also swipe to scroll.",
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

// Morphing tabs — Notion-style icon-only inactive, label revealed on active
export const Morphing: Story = {
  render: () => (
    <Tabs defaultValue="meetings">
      <TabsList morphing shape="pill">
        <TabsTrigger value="home">
          <HomeIcon />
          <TabsTriggerLabel>Home</TabsTriggerLabel>
        </TabsTrigger>
        <TabsTrigger value="chat">
          <MessageSquareIcon />
          <TabsTriggerLabel>Chat</TabsTriggerLabel>
        </TabsTrigger>
        <TabsTrigger value="meetings">
          <MicIcon />
          <TabsTriggerLabel>Meetings</TabsTriggerLabel>
        </TabsTrigger>
        <TabsTrigger value="inbox">
          <InboxIcon />
          <TabsTriggerLabel>Inbox</TabsTriggerLabel>
        </TabsTrigger>
        <TabsTrigger value="search">
          <SearchIcon />
          <TabsTriggerLabel>Search</TabsTriggerLabel>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home">
        <p className="pt-2 text-muted-foreground text-sm">
          Home content goes here.
        </p>
      </TabsContent>
      <TabsContent value="chat">
        <p className="pt-2 text-muted-foreground text-sm">
          Chat content goes here.
        </p>
      </TabsContent>
      <TabsContent value="meetings">
        <p className="pt-2 text-muted-foreground text-sm">
          Meetings content goes here.
        </p>
      </TabsContent>
      <TabsContent value="inbox">
        <p className="pt-2 text-muted-foreground text-sm">
          Inbox content goes here.
        </p>
      </TabsContent>
      <TabsContent value="search">
        <p className="pt-2 text-muted-foreground text-sm">
          Search content goes here.
        </p>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Set `morphing` on `TabsList` and wrap each label in `<TabsTriggerLabel>` to collapse inactive triggers to icon-only. The active trigger expands to reveal its label, and the sliding indicator follows the resize automatically. Pair with `shape="pill"` for the Notion-style look. Every trigger should include an icon so the collapsed state still reads.',
      },
    },
  },
};

// Morphing tabs combined with the line variant
export const MorphingLine: Story = {
  name: "Morphing Line",
  render: () => (
    <Tabs defaultValue="meetings">
      <TabsList morphing variant="line">
        <TabsTrigger value="home">
          <HomeIcon />
          <TabsTriggerLabel>Home</TabsTriggerLabel>
        </TabsTrigger>
        <TabsTrigger value="chat">
          <MessageSquareIcon />
          <TabsTriggerLabel>Chat</TabsTriggerLabel>
        </TabsTrigger>
        <TabsTrigger value="meetings">
          <MicIcon />
          <TabsTriggerLabel>Meetings</TabsTriggerLabel>
        </TabsTrigger>
        <TabsTrigger value="inbox">
          <InboxIcon />
          <TabsTriggerLabel>Inbox</TabsTriggerLabel>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home">
        <p className="pt-2 text-muted-foreground text-sm">
          Home content goes here.
        </p>
      </TabsContent>
      <TabsContent value="chat">
        <p className="pt-2 text-muted-foreground text-sm">
          Chat content goes here.
        </p>
      </TabsContent>
      <TabsContent value="meetings">
        <p className="pt-2 text-muted-foreground text-sm">
          Meetings content goes here.
        </p>
      </TabsContent>
      <TabsContent value="inbox">
        <p className="pt-2 text-muted-foreground text-sm">
          Inbox content goes here.
        </p>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Combines `morphing` with `variant="line"`. The underline indicator slides and resizes to match the active trigger\'s expanded width.',
      },
    },
  },
};

// =============================================================================
// Scrollable mode on Reel: behaviour tests (hidden from the sidebar and the
// docs page, still run by Vitest in a real browser)
// =============================================================================

const TEST_ONLY: Story["tags"] = ["!dev", "!autodocs"];

const SCROLL_TABS = [
  { icon: LayoutDashboardIcon, label: "Dashboard", value: "dashboard" },
  { icon: BarChartIcon, label: "Analytics", value: "analytics" },
  { icon: UsersIcon, label: "Users", value: "users" },
  { icon: MessageSquareIcon, label: "Messages", value: "messages" },
  { icon: MailIcon, label: "Email", value: "email" },
  { icon: ShieldIcon, label: "Security", value: "security" },
  { icon: GlobeIcon, label: "Domains", value: "domains" },
  { icon: SettingsIcon, label: "Settings", value: "settings" },
];

/** A role query option, kept out of story-name scans. */
const named = (accessibleName: string) => ({ name: accessibleName });

/** The custom browser commands registered in vitest.config.ts. */
interface RealCommands {
  emulateReducedMotion: (reduce: boolean) => Promise<void>;
  pointerDown: () => Promise<void>;
  pointerMoveAway: () => Promise<void>;
  pointerMoveTo: (selector: string) => Promise<void>;
  pointerUp: () => Promise<void>;
}
type RealUser = typeof import("vitest/browser").userEvent;

/** Vitest's real (Playwright) input. Absent when Storybook runs the play. */
function real() {
  const g = globalThis as {
    __realCommands?: RealCommands;
    __realUserEvent?: RealUser;
  };
  return { commands: g.__realCommands, user: g.__realUserEvent };
}

/** Real input is required: a play that cannot drive it fails, not skips. */
function requireReal() {
  const { commands, user } = real();
  if (!(commands && user)) {
    throw new Error("real browser input is required (run under Vitest)");
  }
  return { commands, user };
}

const nextFrame = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0))
  );
const pause = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
const settle = (check: () => unknown) =>
  waitFor(async () => check(), { timeout: 3000 });

/** Records every scroll request made on a Reel viewport, until restored. */
function recordScrollRequests() {
  const proto = Element.prototype as unknown as Record<
    "scroll" | "scrollBy" | "scrollTo",
    (...args: unknown[]) => void
  >;
  const original = {
    scroll: proto.scroll,
    scrollBy: proto.scrollBy,
    scrollTo: proto.scrollTo,
  };
  const requests: {
    at: {
      from: number;
      item: DOMRect | undefined;
      range: number;
      viewport: DOMRect;
    };
    behavior: string;
    left: number | undefined;
    viewport: Element;
  }[] = [];
  for (const method of ["scroll", "scrollBy", "scrollTo"] as const) {
    proto[method] = function (this: Element, ...args: unknown[]) {
      if (
        this instanceof HTMLElement &&
        this.dataset.slot === "reel-viewport"
      ) {
        const options =
          typeof args[0] === "object" && args[0] !== null
            ? (args[0] as ScrollToOptions)
            : undefined;
        requests.push({
          at: {
            from: this.scrollLeft,
            item: this.querySelector(
              '[aria-selected="true"]'
            )?.getBoundingClientRect(),
            range: this.scrollWidth - this.clientWidth,
            viewport: this.getBoundingClientRect(),
          },
          behavior: options?.behavior ?? "auto",
          left: options?.left,
          viewport: this,
        });
      }
      return original[method].apply(this, args);
    };
  }
  return {
    of: (viewport: Element) =>
      requests.filter((r) => r.viewport === viewport).map((r) => r.behavior),
    /** The requests made on `viewport`, with what was measured as each was made. */
    calls: (viewport: Element) =>
      requests.filter((r) => r.viewport === viewport),
    restore() {
      Object.assign(proto, original);
    },
  };
}

function scrollParts(root: HTMLElement, testId: string) {
  const host = within(root).getByTestId(testId);
  const q = (selector: string) => host.querySelector(selector) as HTMLElement;
  return {
    host,
    reel: q('[data-slot="reel"]'),
    viewport: q('[data-slot="reel-viewport"]'),
    list: q('[data-slot="tabs-list"]'),
    area: (side: "start" | "end") =>
      q(`[data-slot="reel"] > span[data-side="${side}"]`),
    picture: (side: "start" | "end") =>
      q(`[data-slot="reel-arrow"][data-side="${side}"]`),
    tab: (name: string) =>
      within(host).getByRole("tab", { name }) as HTMLElement,
  };
}

/** The gaps between a tab and the viewport's edges, left to right. */
function tabGaps(viewport: HTMLElement, tab: HTMLElement) {
  const v = viewport.getBoundingClientRect();
  const a = tab.getBoundingClientRect();
  return { fromStart: a.left - v.left, fromEnd: v.right - a.right };
}

/** Clear of both edges by `by`, or against an edge the range cannot pass. */
function clearOrAtEnd(viewport: HTMLElement, tab: HTMLElement, by = 52) {
  const { fromStart, fromEnd } = tabGaps(viewport, tab);
  const max = viewport.scrollWidth - viewport.clientWidth;
  const atStart = viewport.scrollLeft <= 0.5;
  const atEnd = viewport.scrollLeft >= max - 0.5;
  return (fromStart >= by - 0.5 || atStart) && (fromEnd >= by - 0.5 || atEnd);
}

/** A colour as the browser computes it, through a probe element. */
function tokenColor(className: string) {
  const probe = document.createElement("span");
  probe.className = className;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function ScrollTabs({
  activateOnFocus,
  defaultValue = "dashboard",
  lastLabel,
  morphing,
  onValueChange,
  panels = false,
  testId,
  value,
  variant,
  width = 480,
}: {
  activateOnFocus?: boolean;
  defaultValue?: string;
  /** A label for the last tab, longer than the others. */
  lastLabel?: string;
  morphing?: boolean;
  onValueChange?: (value: string) => void;
  panels?: boolean;
  testId: string;
  value?: string;
  variant?: "default" | "line";
  width?: number;
}) {
  return (
    <div data-testid={testId} style={{ width }}>
      <Tabs
        defaultValue={value === undefined ? defaultValue : undefined}
        onValueChange={(next) => onValueChange?.(next as string)}
        value={value}
      >
        <TabsList
          activateOnFocus={activateOnFocus}
          morphing={morphing}
          scrollable
          variant={variant}
        >
          {SCROLL_TABS.map(({ icon: Icon, label: name, value: v }) => {
            const label = v === "settings" && lastLabel ? lastLabel : name;
            return (
              <TabsTrigger key={v} value={v}>
                <Icon />
                {morphing ? (
                  <TabsTriggerLabel>{label}</TabsTriggerLabel>
                ) : (
                  label
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {panels
          ? SCROLL_TABS.map(({ value: v }) => (
              <TabsContent key={v} value={v}>
                {`Panel ${v}`}
              </TabsContent>
            ))
          : null}
      </Tabs>
    </div>
  );
}

/** A page scrolled down, with a focused button outside the tabs. */
function OutsidePage({ children }: { children: ReactNode }) {
  return (
    <div className="pt-[40vh] pb-[150vh]">
      <button data-testid="outside" type="button">
        Outside the tabs
      </button>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function holdOutside(canvasElement: HTMLElement) {
  window.scrollTo(0, 120);
  const outside = within(canvasElement).getByTestId("outside");
  outside.focus({ preventScroll: true });
  return { outside, pageY: window.scrollY };
}

async function expectOutsideHeld(held: {
  outside: HTMLElement;
  pageY: number;
}) {
  await expect(held.pageY).toBeGreaterThan(0);
  await expect(document.activeElement).toBe(held.outside);
  await expect(window.scrollY).toBe(held.pageY);
}

// T-BOX. The list keeps its box: the Reel is the list's 40px, the list sits
// flush at its top-left, and the first trigger is where it is in a list that
// does not scroll.
export const ScrollableKeepsItsBox: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-6">
      <ScrollTabs testId="scroll" />
      <div data-testid="still" style={{ width: 1400 }}>
        <Tabs defaultValue="dashboard">
          <TabsList>
            {SCROLL_TABS.map(({ icon: Icon, label, value }) => (
              <TabsTrigger key={value} value={value}>
                <Icon />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    ).toBe(16);
    const s = scrollParts(canvasElement, "scroll");
    await expect(s.viewport.scrollLeft).toBe(0);
    const root = s.reel.getBoundingClientRect();
    const list = s.list.getBoundingClientRect();
    await expect(root.height).toBe(40);
    await expect({
      top: list.top,
      left: list.left,
      height: list.height,
    }).toEqual({ top: root.top, left: root.left, height: root.height });
    // scrollWidth is rounded to a whole pixel.
    await expect(Math.abs(list.width - s.viewport.scrollWidth)).toBeLessThan(1);
    const still = within(canvasElement).getByTestId("still");
    const stillList = still.querySelector(
      '[data-slot="tabs-list"]'
    ) as HTMLElement;
    const relative = (tab: HTMLElement, to: HTMLElement) => {
      const a = tab.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      return [a.left - b.left, a.top - b.top, a.width, a.height];
    };
    await expect(relative(s.tab("Dashboard"), s.list)).toEqual(
      relative(within(still).getByRole("tab", named("Dashboard")), stillList)
    );
  },
};

// T-ARROW-VS-TODAY. The plain arrow keeps the earlier chevron: 16px, muted, its
// centre 10px from the Reel's edge and vertically centred, with no fill,
// border, shadow or scale; the press lands on a 24 × 40px area.
export const ScrollableChevronGeometry: Story = {
  tags: TEST_ONLY,
  render: () => <ScrollTabs testId="scroll" />,
  play: async ({ canvasElement }) => {
    const s = scrollParts(canvasElement, "scroll");
    s.viewport.scrollLeft = 100;
    await settle(() =>
      expect(getComputedStyle(s.area("start")).visibility).toBe("visible")
    );
    const root = s.reel.getBoundingClientRect();
    const muted = tokenColor("text-muted-foreground");
    for (const side of ["start", "end"] as const) {
      const svg = s.picture(side).querySelector("svg") as SVGElement;
      const glyph = svg.getBoundingClientRect();
      // biome-ignore lint/performance/noAwaitInLoops: two sides, in order
      await expect([glyph.width, glyph.height]).toEqual([16, 16]);
      await expect(getComputedStyle(svg).color).toBe(muted);
      const centre = glyph.left + glyph.width / 2;
      const fromEdge =
        side === "start" ? centre - root.left : root.right - centre;
      await expect(Math.abs(fromEdge - 10)).toBeLessThanOrEqual(0.5);
      await expect(
        Math.abs(glyph.top + glyph.height / 2 - (root.top + root.height / 2))
      ).toBeLessThanOrEqual(0.5);
      const picture = getComputedStyle(s.picture(side));
      await expect(s.picture(side).tagName).toBe("SPAN");
      await expect([
        picture.borderTopWidth,
        picture.borderRightWidth,
        picture.borderBottomWidth,
        picture.borderLeftWidth,
        picture.backgroundColor,
        picture.boxShadow,
        picture.scale,
      ]).toEqual([
        "0px",
        "0px",
        "0px",
        "0px",
        "rgba(0, 0, 0, 0)",
        "none",
        "none",
      ]);
      const area = s.area(side).getBoundingClientRect();
      await expect([area.width, area.height]).toEqual([24, 40]);
    }
  },
};

// T-HOVER. Hovering or pressing an arrow turns the chevron to the foreground
// colour; at rest it is muted.
export const ScrollableChevronHover: Story = {
  tags: TEST_ONLY,
  render: () => <ScrollTabs testId="scroll" />,
  play: async ({ canvasElement }) => {
    const { commands } = requireReal();
    await commands.emulateReducedMotion(true);
    try {
      const s = scrollParts(canvasElement, "scroll");
      const svg = s.picture("end").querySelector("svg") as SVGElement;
      const muted = tokenColor("text-muted-foreground");
      const foreground = tokenColor("text-foreground");
      await expect(muted).not.toBe(foreground);
      await expect(getComputedStyle(svg).color).toBe(muted);
      await commands.pointerMoveTo(
        '[data-testid="scroll"] [data-slot="reel"] > span[data-side="end"]'
      );
      await settle(() => expect(getComputedStyle(svg).color).toBe(foreground));
      await commands.pointerDown();
      await expect(getComputedStyle(svg).color).toBe(foreground);
      await commands.pointerUp();
      await commands.pointerMoveAway();
      await settle(() => expect(getComputedStyle(svg).color).toBe(muted));
      // Pressed without hover, as a touch press is: press, then slide off
      // while still held. The chevron stays in the foreground colour while
      // held, and turns muted once released. (The first press paged to the
      // end, where the end arrow hides: back to the start first.)
      s.viewport.scrollLeft = 0;
      await settle(() =>
        expect(getComputedStyle(s.area("end")).visibility).toBe("visible")
      );
      await commands.pointerMoveTo(
        '[data-testid="scroll"] [data-slot="reel"] > span[data-side="end"]'
      );
      await commands.pointerDown();
      await commands.pointerMoveAway();
      await expect(s.area("end").matches(":hover")).toBe(false);
      await expect(getComputedStyle(svg).color).toBe(foreground);
      await commands.pointerUp();
      await settle(() => expect(getComputedStyle(svg).color).toBe(muted));
    } finally {
      await commands.emulateReducedMotion(false);
    }
  },
};

function MountLater({ defaultValue }: { defaultValue: string }) {
  const [mounted, setMounted] = useState(false);
  return (
    <OutsidePage>
      <button
        data-testid="mount"
        onClick={() => setMounted(true)}
        type="button"
      >
        Mount
      </button>
      {mounted ? (
        <ScrollTabs defaultValue={defaultValue} testId="scroll" width={320} />
      ) : null}
    </OutsidePage>
  );
}

/** Mount from the play with the recorder already installed. */
async function mountRecorded(canvasElement: HTMLElement, testId = "scroll") {
  // Outside focus and page position first, then the recorder, then the
  // mount: anything the mount does to either shows up afterwards.
  const held = holdOutside(canvasElement);
  const recorder = recordScrollRequests();
  try {
    within(canvasElement).getByTestId("mount").click();
    await settle(() =>
      expect(within(canvasElement).queryByTestId(testId)).not.toBeNull()
    );
    await pause(300);
    const s = scrollParts(canvasElement, testId);
    return { held, recorder, requests: recorder.of(s.viewport), s };
  } finally {
    recorder.restore();
  }
}

// T-MOUNT-MID. A middle tab off-screen at mount is brought into view with one
// instant request, 52px clear of both edges.
export const ScrollableMountMiddle: Story = {
  tags: TEST_ONLY,
  render: () => <MountLater defaultValue="email" />,
  play: async ({ canvasElement }) => {
    const { held, requests, s } = await mountRecorded(canvasElement);
    await expect(requests).toEqual(["instant"]);
    const { fromStart, fromEnd } = tabGaps(s.viewport, s.tab("Email"));
    await expect(fromStart).toBeGreaterThanOrEqual(52 - 0.5);
    await expect(fromEnd).toBeGreaterThanOrEqual(52 - 0.5);
    await expectOutsideHeld(held);
  },
};

// T-MOUNT-LAST. The last tab at mount: one instant request, clear or at the
// end of the range.
export const ScrollableMountLast: Story = {
  tags: TEST_ONLY,
  render: () => <MountLater defaultValue="settings" />,
  play: async ({ canvasElement }) => {
    const { held, requests, s } = await mountRecorded(canvasElement);
    await expect(requests).toEqual(["instant"]);
    await expect(clearOrAtEnd(s.viewport, s.tab("Settings"))).toBe(true);
    await expectOutsideHeld(held);
  },
};

function SwitchFixture() {
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState("dashboard");
  const [hidden, setHidden] = useState(false);
  return (
    <OutsidePage>
      <button
        data-testid="mount"
        onClick={() => setMounted(true)}
        type="button"
      >
        Mount
      </button>
      <button
        data-testid="to-settings"
        onClick={() => setValue("settings")}
        type="button"
      >
        Settings
      </button>
      <button data-testid="hide" onClick={() => setHidden(true)} type="button">
        Hide
      </button>
      <button data-testid="show" onClick={() => setHidden(false)} type="button">
        Show
      </button>
      <div style={{ display: hidden ? "none" : undefined }}>
        {mounted ? (
          <ScrollTabs
            onValueChange={setValue}
            testId="scroll"
            value={value}
            width={320}
          />
        ) : null}
      </div>
    </OutsidePage>
  );
}

/** Click a fixture button without moving focus from the outside button. */
function pressButton(canvasElement: HTMLElement, testId: string) {
  within(canvasElement).getByTestId(testId).click();
}

/**
 * Mounted with the first tab clear, recorded from before the mount: no
 * request at mount, then one request for a switch to a distant tab, glided
 * or (under reduced motion) jumped. Outside focus and the page stay put.
 */
async function switchFromCode(canvasElement: HTMLElement, reduce: boolean) {
  const { commands } = requireReal();
  await commands.emulateReducedMotion(reduce);
  const held = holdOutside(canvasElement);
  const recorder = recordScrollRequests();
  try {
    pressButton(canvasElement, "mount");
    await settle(() =>
      expect(within(canvasElement).queryByTestId("scroll")).not.toBeNull()
    );
    await pause(300);
    const s = scrollParts(canvasElement, "scroll");
    await expect(recorder.of(s.viewport)).toEqual([]);
    await expect(s.viewport.scrollLeft).toBe(0);
    pressButton(canvasElement, "to-settings");
    await settle(() =>
      expect(clearOrAtEnd(s.viewport, s.tab("Settings"))).toBe(true)
    );
    await pause(100);
    await expect(recorder.of(s.viewport)).toEqual([
      reduce ? "instant" : "smooth",
    ]);
    await expectOutsideHeld(held);
  } finally {
    recorder.restore();
    await commands.emulateReducedMotion(false);
  }
}

// T-SWITCH. A controlled switch to a distant tab glides there in one request.
export const ScrollableSwitchFromCode: Story = {
  tags: TEST_ONLY,
  render: () => <SwitchFixture />,
  play: ({ canvasElement }) => switchFromCode(canvasElement, false),
};

// T-SWITCH under reduced motion: the same request jumps.
export const ScrollableSwitchFromCodeReducedMotion: Story = {
  tags: TEST_ONLY,
  render: () => <SwitchFixture />,
  play: ({ canvasElement }) => switchFromCode(canvasElement, true),
};

// T-HIDDEN. A change made while the list is not displayed makes no request
// while hidden, and is revealed with one instant request once it is shown.
export const ScrollableChangedWhileHidden: Story = {
  tags: TEST_ONLY,
  render: () => <SwitchFixture />,
  play: async ({ canvasElement }) => {
    const held = holdOutside(canvasElement);
    const recorder = recordScrollRequests();
    try {
      pressButton(canvasElement, "mount");
      await settle(() =>
        expect(within(canvasElement).queryByTestId("scroll")).not.toBeNull()
      );
      await pause(300);
      const s = scrollParts(canvasElement, "scroll");
      await expect(recorder.of(s.viewport)).toEqual([]);
      pressButton(canvasElement, "hide");
      await settle(() => expect(s.viewport.getClientRects()).toHaveLength(0));
      pressButton(canvasElement, "to-settings");
      await pause(300);
      await expect(recorder.of(s.viewport)).toEqual([]);
      pressButton(canvasElement, "show");
      await settle(() =>
        expect(clearOrAtEnd(s.viewport, s.tab("Settings"))).toBe(true)
      );
      await pause(100);
      await expect(recorder.of(s.viewport)).toEqual(["instant"]);
      await expectOutsideHeld(held);
    } finally {
      recorder.restore();
    }
  },
};

const KEY_PATH: [key: string, tab: string][] = [
  ["{ArrowRight}", "Analytics"],
  ["{ArrowRight}", "Users"],
  ["{ArrowRight}", "Messages"],
  ["{ArrowRight}", "Email"],
  ["{End}", "Settings"],
  ["{Home}", "Dashboard"],
];

/** The tab marked active by every hook at once, and the panel on show. */
function activeState(s: ReturnType<typeof scrollParts>) {
  const tabs = [...s.list.querySelectorAll<HTMLElement>('[role="tab"]')];
  const marked = (pick: (tab: HTMLElement) => boolean) =>
    tabs.filter(pick).map((tab) => tab.textContent);
  const panel = [
    ...s.host.querySelectorAll<HTMLElement>('[data-slot="tabs-content"]'),
  ].find((p) => !p.hidden);
  return {
    aria: marked((tab) => tab.getAttribute("aria-selected") === "true"),
    panel: panel?.textContent,
  };
}

/**
 * Puts the list on screen at a nonzero page offset and focuses the button
 * before it without scrolling; returns that page offset.
 */
function enterAtY(
  canvasElement: HTMLElement,
  testId: string,
  s: ReturnType<typeof scrollParts>
) {
  window.scrollTo(0, s.host.getBoundingClientRect().top + window.scrollY - 200);
  within(canvasElement)
    .getByTestId(`before-${testId}`)
    .focus({ preventScroll: true });
  return window.scrollY;
}

/**
 * Tab into a list, then walk it with the arrow keys, End and Home. Each key
 * focuses exactly the expected tab, clear of the edges, with one roving Tab
 * stop and never an arrow; the active tab follows focus only when
 * `activateOnFocus` is on.
 */
async function walkKeys(canvasElement: HTMLElement, testId: string) {
  const { user } = requireReal();
  const s = scrollParts(canvasElement, testId);
  const automatic = testId === "auto";
  const failures: string[] = [];
  const pageY = enterAtY(canvasElement, testId, s);
  await user.keyboard("{Tab}");
  await expect(document.activeElement).toBe(s.tab("Dashboard"));
  for (const [key, name] of KEY_PATH) {
    // biome-ignore lint/performance/noAwaitInLoops: one key at a time
    await user.keyboard(key);
    await nextFrame();
    const focused = document.activeElement as HTMLElement;
    if (focused !== s.tab(name)) {
      failures.push(`${key}: focus on ${focused.textContent}, not ${name}`);
      continue;
    }
    if (!clearOrAtEnd(s.viewport, focused)) {
      const g = tabGaps(s.viewport, focused);
      failures.push(`${key}: ${name} ${g.fromStart}/${g.fromEnd}`);
    }
    const stops = [...s.list.querySelectorAll('[role="tab"]')].filter(
      (tab) => (tab as HTMLElement).tabIndex === 0
    );
    if (stops.length !== 1) {
      failures.push(`${key}: ${stops.length} tab stops`);
    }
    const active = automatic ? name : "Dashboard";
    const state = activeState(s);
    const expected = {
      aria: [active],
      panel: `Panel ${active.toLowerCase()}`,
    };
    if (JSON.stringify(state) !== JSON.stringify(expected)) {
      failures.push(`${key}: active ${JSON.stringify(state)}`);
    }
    if (window.scrollY !== pageY) {
      failures.push(`${key}: page moved ${pageY} → ${window.scrollY}`);
    }
  }
  return { failures, s };
}

/** With manual activation, `key` on the focused tab marks it, scroll-free. */
async function activateWith(
  canvasElement: HTMLElement,
  testId: string,
  key: string
) {
  const { user } = requireReal();
  const s = scrollParts(canvasElement, testId);
  const pageY = enterAtY(canvasElement, testId, s);
  await expect(pageY).toBeGreaterThan(0);
  await user.keyboard("{Tab}");
  await expect(document.activeElement).toBe(s.tab("Dashboard"));
  // Focus Messages (off the start), then activate it.
  await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
  await nextFrame();
  await expect(document.activeElement).toBe(s.tab("Messages"));
  await expect(window.scrollY).toBe(pageY);
  const recorder = recordScrollRequests();
  try {
    await user.keyboard(key);
    await pause(200);
    await expect(activeState(s)).toEqual({
      aria: ["Messages"],
      panel: "Panel messages",
    });
    await expect(recorder.of(s.viewport)).toEqual([]);
    await expect(window.scrollY).toBe(pageY);
  } finally {
    recorder.restore();
  }
}

// T-KEYS. The keyboard reaches every tab, in order, clear of the edges.
export const ScrollableKeyboard: Story = {
  tags: TEST_ONLY,
  render: () => (
    // Room to scroll the page, so a page move would show.
    <div className="flex flex-col gap-4 pt-[40vh] pb-[150vh]">
      {(["enter", "space", "auto"] as const).map((id) => (
        <div key={id}>
          <button data-testid={`before-${id}`} type="button">
            Before
          </button>
          <ScrollTabs
            activateOnFocus={id === "auto"}
            panels
            testId={id}
            width={320}
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const id of ["enter", "space", "auto"]) {
      // biome-ignore lint/performance/noAwaitInLoops: one list at a time
      const { failures } = await walkKeys(canvasElement, id);
      await expect(failures, id).toEqual([]);
    }
    await activateWith(canvasElement, "enter", "{Enter}");
    await activateWith(canvasElement, "space", " ");
  },
};

// T-ARROW-INERT. Tab never lands on an arrow, the arrows are not in the
// accessibility tree, and a press on one leaves focus where it was.
export const ScrollableArrowsInert: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2">
      <button data-testid="before" type="button">
        Before
      </button>
      <ScrollTabs testId="scroll" />
      <button data-testid="after" type="button">
        After
      </button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const { commands, user } = requireReal();
    const s = scrollParts(canvasElement, "scroll");
    for (const side of ["start", "end"] as const) {
      // biome-ignore lint/performance/noAwaitInLoops: two sides, in order
      await expect(s.area(side)).toHaveAttribute("aria-hidden", "true");
      await expect(s.area(side)).not.toHaveAttribute("role");
      await expect(s.picture(side)).not.toHaveAttribute("role");
      await expect(s.area(side).tabIndex).toBe(-1);
    }
    within(canvasElement).getByTestId("before").focus();
    const visited: string[] = [];
    for (let i = 0; i < 2; i++) {
      // biome-ignore lint/performance/noAwaitInLoops: one key at a time
      await user.keyboard("{Tab}");
      const el = document.activeElement as HTMLElement;
      visited.push(el.dataset.testid ?? el.getAttribute("role") ?? el.tagName);
    }
    // Into the list at its one roving stop, then straight out of it.
    await expect(visited).toEqual(["tab", "after"]);
    // A press on the end arrow keeps focus on the focused tab.
    s.tab("Dashboard").focus();
    await commands.pointerMoveTo(
      '[data-testid="scroll"] [data-slot="reel"] > span[data-side="end"]'
    );
    await commands.pointerDown();
    await commands.pointerUp();
    await commands.pointerMoveAway();
    await expect(document.activeElement).toBe(s.tab("Dashboard"));
    await settle(() => expect(s.viewport.scrollLeft).toBeGreaterThan(0));
  },
};

// T-ESC. The escape hatch: a plain TabsList in the consumer's own Reel, as
// written in the docs (`w-max`) and without it. Base UI marks the active tab
// with aria-selected, so the Reel reveals it.
function OwnReelFixture() {
  const [mounted, setMounted] = useState(false);
  return (
    <OutsidePage>
      <button
        data-testid="mount"
        onClick={() => setMounted(true)}
        type="button"
      >
        Mount
      </button>
      {mounted
        ? (["scroll", "scroll-fit"] as const).map((id) => (
            <div data-testid={id} key={id} style={{ width: 320 }}>
              <Tabs defaultValue="settings">
                <Reel arrows="pointer">
                  <TabsList className={id === "scroll" ? "w-max" : undefined}>
                    {SCROLL_TABS.map(({ icon: Icon, label, value }) => (
                      <TabsTrigger key={value} value={value}>
                        <Icon />
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Reel>
              </Tabs>
            </div>
          ))
        : null}
    </OutsidePage>
  );
}

export const TabsInOwnReelReveals: Story = {
  tags: TEST_ONLY,
  render: () => <OwnReelFixture />,
  play: async ({ canvasElement }) => {
    const { held, recorder } = await mountRecorded(canvasElement);
    for (const id of ["scroll", "scroll-fit"]) {
      const s = scrollParts(canvasElement, id);
      const max = s.viewport.scrollWidth - s.viewport.clientWidth;
      // biome-ignore lint/performance/noAwaitInLoops: two rows, in order
      await expect(max, id).toBeGreaterThan(0);
      await expect(recorder.of(s.viewport), id).toEqual(["instant"]);
      await expect(clearOrAtEnd(s.viewport, s.tab("Settings"), 48), id).toBe(
        true
      );
      await expect(s.viewport.scrollLeft, id).toBeGreaterThan(0);
    }
    await expectOutsideHeld(held);
  },
};

/** The indicator matches its trigger, in either variant. */
function indicatorMatches(
  s: ReturnType<typeof scrollParts>,
  name: string,
  line: boolean
) {
  const indicator = s.list
    .querySelector('[data-slot="tabs-indicator"]')
    ?.getBoundingClientRect();
  const tab = s.tab(name).getBoundingClientRect();
  const list = s.list.getBoundingClientRect();
  if (!indicator) {
    return "no indicator";
  }
  const near = (a: number, b: number) => Math.abs(a - b) <= 0.5;
  const ok = line
    ? near(indicator.left, tab.left) &&
      near(indicator.right, tab.right) &&
      near(indicator.height, 2) &&
      near(indicator.bottom, list.bottom)
    : near(indicator.left, tab.left) &&
      near(indicator.right, tab.right) &&
      near(indicator.top, tab.top) &&
      near(indicator.bottom, tab.bottom);
  return ok
    ? "matches"
    : `indicator ${indicator.left},${indicator.right},${indicator.top},${indicator.bottom} tab ${tab.left},${tab.right},${tab.top},${tab.bottom}`;
}

// T-INDICATOR. The indicator follows the selected trigger in a scrolled list,
// and still matches it after a manual scroll at a fixed selection.
export const ScrollableIndicator: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-4">
      <ScrollTabs testId="default" />
      <ScrollTabs testId="line" variant="line" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const id of ["default", "line"]) {
      const s = scrollParts(canvasElement, id);
      s.viewport.scrollLeft = 100;
      // biome-ignore lint/performance/noAwaitInLoops: one list at a time
      await pause(100);
      s.tab("Email").click();
      await settle(() =>
        expect(indicatorMatches(s, "Email", id === "line")).toBe("matches")
      );
      await pause(500);
      await expect(indicatorMatches(s, "Email", id === "line")).toBe("matches");
      s.viewport.scrollLeft += 60;
      await nextFrame();
      await expect(indicatorMatches(s, "Email", id === "line")).toBe("matches");
    }
  },
};

interface Box {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

/**
 * Both rows' pills, and the scrolled row's two triggers, in their own
 * tablist's coordinates, in one frame.
 */
interface PillFrame {
  from: Box;
  scroll: number;
  scrolled: Box | null;
  still: Box | null;
  t: number;
  to: Box;
}

function boxOf(el: Element, list: HTMLElement): Box {
  const r = el.getBoundingClientRect();
  const l = list.getBoundingClientRect();
  return {
    left: r.left - l.left,
    right: r.right - l.left,
    top: r.top - l.top,
    bottom: r.bottom - l.top,
  };
}

function boxIn(list: HTMLElement): Box | null {
  const pill = list.querySelector('[data-slot="tabs-morphing-pill"]');
  return pill ? boxOf(pill, list) : null;
}

/**
 * Both rows, read in the same animation-frame callback every frame for
 * `ms`. Both switch from one state change, so frame for frame their pills
 * are at the same point of the same transition.
 */
function recordPills(
  scrolled: ReturnType<typeof scrollParts>,
  still: ReturnType<typeof scrollParts>,
  names: [from: string, to: string],
  ms: number,
  onFrame?: (frame: PillFrame) => void
) {
  const frames: PillFrame[] = [];
  const start = performance.now();
  return new Promise<PillFrame[]>((resolve) => {
    const tick = () => {
      const frame = {
        t: performance.now() - start,
        scroll: scrolled.viewport.scrollLeft,
        scrolled: boxIn(scrolled.list),
        still: boxIn(still.list),
        from: boxOf(scrolled.tab(names[0]), scrolled.list),
        to: boxOf(scrolled.tab(names[1]), scrolled.list),
      };
      frames.push(frame);
      onFrame?.(frame);
      if (frame.t < ms) {
        requestAnimationFrame(tick);
      } else {
        resolve(frames);
      }
    };
    requestAnimationFrame(tick);
  });
}

/** A trigger's box in its tablist's coordinates. */
function triggerBox(s: ReturnType<typeof scrollParts>, name: string): Box {
  return boxOf(s.tab(name), s.list);
}

/**
 * Every frame: the scrolled row's pill exists, matches the row that does
 * not scroll within 1px on every edge, lies within the span of the two
 * triggers, and keeps its shape (the filled pill inside the triggers' 1px
 * border; the line 2px high, 1px above their bottom). It passes through at
 * least three distinct in-between positions, and ends on `end`.
 */
/** What is wrong with one frame's pill, if anything. */
function frameFailures(f: PillFrame, line: boolean): string[] {
  if (!(f.scrolled && f.still)) {
    return ["a pill is missing"];
  }
  const pill = f.scrolled;
  const out: string[] = [];
  for (const edge of ["left", "right", "top", "bottom"] as const) {
    if (Math.abs(pill[edge] - f.still[edge]) > 1) {
      out.push(
        `${edge} ${pill[edge].toFixed(1)} vs ${f.still[edge].toFixed(1)}`
      );
    }
  }
  const lo = Math.min(f.from.left, f.to.left);
  const hi = Math.max(f.from.right, f.to.right);
  if (pill.left < lo + 0.5 || pill.right > hi - 0.5) {
    out.push(`outside ${lo.toFixed(1)}..${hi.toFixed(1)}`);
  }
  if (Math.abs(pill.bottom - (f.to.bottom - 1)) > 0.5) {
    out.push(`bottom ${pill.bottom.toFixed(1)}`);
  }
  const height = pill.bottom - pill.top;
  if (line && Math.abs(height - 2) > 0.5) {
    out.push(`height ${height.toFixed(1)}`);
  }
  if (!line && Math.abs(pill.top - (f.to.top + 1)) > 0.5) {
    out.push(`top ${pill.top.toFixed(1)}`);
  }
  return out;
}

/**
 * Every frame: the scrolled row's pill exists, matches the row that does
 * not scroll within 1px on every edge, lies within the span of the two
 * triggers, and keeps its shape (the filled pill inside the triggers' 1px
 * border; the line 2px high, 1px above their bottom). It passes through at
 * least three distinct in-between positions, and ends on `end`.
 */
function pillFailures(
  frames: PillFrame[],
  line: boolean,
  end: "from" | "to",
  label: string
) {
  const failures: string[] = [];
  const between = new Set<number>();
  for (const f of frames) {
    for (const what of frameFailures(f, line)) {
      failures.push(`${label} ${f.t.toFixed(0)}ms: ${what}`);
    }
    const a = Math.min(f.from.left, f.to.left) + 2;
    const b = Math.max(f.from.left, f.to.left) - 2;
    if (f.scrolled && f.scrolled.left > a && f.scrolled.left < b) {
      between.add(Math.round(f.scrolled.left));
    }
  }
  if (between.size < 3) {
    failures.push(`${label}: only ${between.size} positions in between`);
  }
  const last = frames.at(-1) as PillFrame;
  const target = last[end];
  if (
    !last.scrolled ||
    Math.abs(last.scrolled.left - target.left - 1) > 0.5 ||
    Math.abs(last.scrolled.right - target.right + 1) > 0.5
  ) {
    failures.push(
      `${label}: ends at ${JSON.stringify(last.scrolled)}, trigger ${JSON.stringify(target)}`
    );
  }
  return failures;
}

const LONG_LABEL = "Settings and preferences for everything";

function PillFixture({ line }: { line: boolean }) {
  const [value, setValue] = useState("users");
  return (
    <div className="flex flex-col gap-4">
      <button
        data-testid="go-settings"
        onClick={() => setValue("settings")}
        type="button"
      >
        Settings
      </button>
      <button
        data-testid="go-users"
        onClick={() => setValue("users")}
        type="button"
      >
        Users
      </button>
      {(
        [
          ["scroll", 260],
          ["still", 1400],
        ] as const
      ).map(([id, width]) => (
        <ScrollTabs
          key={id}
          lastLabel={LONG_LABEL}
          morphing
          onValueChange={setValue}
          testId={id}
          value={value}
          variant={line ? "line" : "default"}
          width={width}
        />
      ))}
    </div>
  );
}

/**
 * What went wrong in a reversed switch: every frame's pill checks, the
 * pill's return (late only), where it ends, and the row coming back towards
 * Users through a sample strictly between the reversal's offset and `back`.
 */
function reversalFailures(
  all: PillFrame[],
  reversed: { t: number; scroll: number; pill: number },
  when: "late" | "early",
  line: boolean,
  back: number
) {
  const out: string[] = [];
  // Every frame of the run, before and after the reversal.
  for (const f of all) {
    for (const what of frameFailures(f, line)) {
      out.push(`${when} ${f.t.toFixed(0)}ms: ${what}`);
    }
  }
  const after = all.filter((f) => f.t > reversed.t);
  if (when === "late") {
    const between = new Set<number>();
    for (const f of after) {
      if (
        f.scrolled &&
        f.scrolled.left > f.from.left + 2 &&
        f.scrolled.left < f.to.left - 2
      ) {
        between.add(Math.round(f.scrolled.left));
      }
    }
    if (between.size < 3) {
      out.push(`late: only ${between.size} positions on the way back`);
    }
  }
  const last = all.at(-1) as PillFrame;
  if (
    !last.scrolled ||
    Math.abs(last.scrolled.left - last.from.left - 1) > 0.5
  ) {
    out.push(`${when}: ends at ${JSON.stringify(last.scrolled)}`);
  }
  // The row comes back towards Users, through a sample strictly between
  // the offset at the reversal and where it ends.
  if (back > reversed.scroll - 2) {
    out.push(`${when}: ends at ${back}, not 2px back from ${reversed.scroll}`);
  } else if (
    !after.some(
      (f, i) =>
        f.scroll < reversed.scroll &&
        f.scroll > back &&
        (i === 0 || f.scroll < after[i - 1].scroll)
    )
  ) {
    out.push(`${when}: no sample on the way back`);
  }
  return out;
}

async function pillPlay(canvasElement: HTMLElement, line: boolean) {
  const { commands } = requireReal();
  await commands.emulateReducedMotion(false);
  const s = scrollParts(canvasElement, "scroll");
  const still = scrollParts(canvasElement, "still");
  const goSettings = within(canvasElement).getByTestId("go-settings");
  const goUsers = within(canvasElement).getByTestId("go-users");
  await pause(500);
  // Start from a nonzero offset.
  s.viewport.scrollLeft = 30;
  await pause(200);
  await expect(s.viewport.scrollLeft).toBe(30);

  // Forward: the scrolled row glides while its pill moves.
  goSettings.click();
  const forward = await recordPills(s, still, ["Users", LONG_LABEL], 900);
  const destination = s.viewport.scrollLeft;
  await expect(destination).toBeGreaterThan(30);
  const failures = pillFailures(forward, line, "to", "forward");
  if (!forward.some((f) => f.scroll > 31 && f.scroll < destination - 1)) {
    failures.push("forward: the row did not glide");
  }

  /** One reversed switch; what went wrong, if anything. */
  const reversal = async (when: "late" | "early") => {
    goUsers.click();
    await pause(900);
    s.viewport.scrollLeft = 30;
    await pause(200);
    const usersLeft = triggerBox(s, "Users").left;
    let at: { t: number; scroll: number; pill: number } | null = null;
    goSettings.click();
    const all = await recordPills(
      s,
      still,
      ["Users", LONG_LABEL],
      1100,
      (f) => {
        const row = (f.scroll - 30) / (destination - 30);
        const pill = f.scrolled
          ? (f.scrolled.left - usersLeft) / (f.to.left - usersLeft)
          : 0;
        const ready =
          when === "late"
            ? row > 0.5 && pill > 0.3
            : row > 0.3 && f.scroll < destination - 1 && pill > 0 && pill < 1;
        if (at === null && ready) {
          at = { t: f.t, scroll: f.scroll, pill };
          goUsers.click();
        }
      }
    );
    const reversed = at as { t: number; scroll: number; pill: number } | null;
    if (reversed === null) {
      return [`${when}: never reversed; forward ${trace}`];
    }
    s.host.dataset[`${when}Reversal`] = JSON.stringify(reversed);
    return reversalFailures(all, reversed, when, line, s.viewport.scrollLeft);
  };
  const trace = forward
    .slice(0, 20)
    .map(
      (f) =>
        `${f.t.toFixed(0)}:${((f.scroll - 30) / (destination - 30)).toFixed(2)}`
    )
    .join(" ");
  // Reversed twice from a fresh start: late, once both the row and the pill
  // have moved far enough for the pill's return to show; and early, while
  // the row is still gliding and the pill short of its tab.
  for (const when of ["late", "early"] as const) {
    // biome-ignore lint/performance/noAwaitInLoops: one pass at a time
    failures.push(...(await reversal(when)));
  }
  await expect(failures.slice(0, 8)).toEqual([]);
}

// T-PILL. The morphing pill glides from the old tab to the new one while Reel
// glides the row to reveal it: frame for frame it matches the same switch in
// a row that does not scroll, through in-between frames, also when reversed
// mid-glide.
export const ScrollableMorphingPillGlide: Story = {
  tags: TEST_ONLY,
  render: () => <PillFixture line={false} />,
  play: ({ canvasElement }) => pillPlay(canvasElement, false),
};

export const ScrollableMorphingLinePillGlide: Story = {
  tags: TEST_ONLY,
  render: () => <PillFixture line />,
  play: ({ canvasElement }) => pillPlay(canvasElement, true),
};

// T-MORPH-LIMIT. Reel reveals the trigger at the width it has when it becomes
// active, by the distance that clears it at that width (within the range),
// and issues no further request while the long label grows.
export const ScrollableMorphingLabelLimit: Story = {
  tags: TEST_ONLY,
  render: () => <PillFixture line={false} />,
  play: async ({ canvasElement }) => {
    const { commands } = requireReal();
    await commands.emulateReducedMotion(false);
    const s = scrollParts(canvasElement, "scroll");
    await pause(500);
    const recorder = recordScrollRequests();
    try {
      within(canvasElement).getByTestId("go-settings").click();
      await nextFrame();
      const calls = recorder.calls(s.viewport);
      await expect(calls.map((c) => c.behavior)).toEqual(["smooth"]);
      // Measured as the request was made: the active trigger, the viewport,
      // the offset, the range and the requested distance.
      const [{ at, left }] = calls;
      const item = at.item as DOMRect;
      await expect(item).toBeTruthy();
      const projected = Math.min(at.range, Math.max(0, at.from + (left ?? 0)));
      const moved = projected - at.from;
      const fromStart = item.left - at.viewport.left - moved;
      const fromEnd = at.viewport.right - item.right + moved;
      await expect(fromStart >= 52 - 0.5 || projected <= 0.5).toBe(true);
      await expect(fromEnd >= 52 - 0.5 || projected >= at.range - 0.5).toBe(
        true
      );
      // The label grows over the next 400ms; no further request follows.
      await pause(900);
      const after = s.tab(LONG_LABEL).getBoundingClientRect();
      await expect(after.width).toBeGreaterThan(item.width + 20);
      await expect(recorder.of(s.viewport)).toEqual(["smooth"]);
      const v = s.viewport.getBoundingClientRect();
      // Where the grown label ends: recorded, not constrained.
      s.host.dataset.labelEnd = JSON.stringify({
        trigger: [item.width, after.width],
        fromStart: after.left - v.left,
        fromEnd: v.right - after.right,
      });
    } finally {
      recorder.restore();
    }
  },
};

function ScrollableRow({
  line,
  morphing,
}: {
  line?: boolean;
  morphing?: boolean;
}) {
  return (
    // Narrow enough that a morphing row, mostly icons, still scrolls.
    <div style={{ maxWidth: morphing ? 260 : 480 }}>
      <Tabs defaultValue="dashboard">
        <TabsList
          morphing={morphing}
          scrollable
          variant={line ? "line" : "default"}
        >
          {SCROLL_TABS.map(({ icon: Icon, label, value }) => (
            <TabsTrigger key={value} value={value}>
              <Icon />
              {morphing ? <TabsTriggerLabel>{label}</TabsTriggerLabel> : label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

export const ScrollableLine: Story = {
  render: () => <ScrollableRow line />,
};

export const ScrollableMorphing: Story = {
  render: () => <ScrollableRow morphing />,
};

export const ScrollableMorphingLine: Story = {
  render: () => <ScrollableRow line morphing />,
};

export const TabsInOwnReel: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Tabs defaultValue="dashboard">
        <Reel arrows="pointer">
          <TabsList className="w-max">
            {SCROLL_TABS.map(({ icon: Icon, label, value }) => (
              <TabsTrigger key={value} value={value}>
                <Icon />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Reel>
      </Tabs>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "To choose when the arrows show or how they look, leave `scrollable` off and wrap the `TabsList` in your own Reel. Reel finds the active tab by its `aria-selected`.",
      },
    },
  },
};
