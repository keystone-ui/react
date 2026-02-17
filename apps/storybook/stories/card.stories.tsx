import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from "keystoneui/avatar";
import { Badge } from "keystoneui/badge";
import { Button } from "keystoneui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "keystoneui/card";
import { Input } from "keystoneui/input";
import { Label } from "keystoneui/label";
import { BadgeCheckIcon } from "lucide-react";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component: `
A versatile card component for displaying content in a contained, visually distinct container.

\`\`\`tsx
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "keystoneui/card";

// Basic card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Card with action in header
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
    <CardAction>
      <Button variant="link">Action</Button>
    </CardAction>
  </CardHeader>
</Card>

// Small size variant
<Card size="sm">
  <CardHeader>
    <CardTitle>Compact Card</CardTitle>
  </CardHeader>
</Card>
\`\`\`

## Features

- Flexible composition with header, content, and footer sections
- Support for header actions via CardAction
- Size variants: \`default\` and \`sm\` for compact layouts
- Automatic border radius handling for images
- Muted footer background with top border
- Responsive padding based on size variant
`,
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
      description: "The size variant of the card",
    },
  },
  subcomponents: {
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          This is a basic card with a title and description.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. You can put any content inside the card.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const LoginForm: Story = {
  render: () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="m@example.com"
                required
                type="email"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  href="#"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" required type="password" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full" type="submit">
          Login
        </Button>
        <Button className="w-full" variant="outline">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = {
  render: () => (
    <Card className="mx-auto w-full max-w-sm" size="sm">
      <CardHeader>
        <CardTitle>Small Card</CardTitle>
        <CardDescription>
          This card uses the small size variant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          The card component supports a size prop that can be set to
          &quot;sm&quot; for a more compact appearance.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="sm" variant="outline">
          Action
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Card className="!pt-0 mx-auto w-full max-w-sm overflow-hidden">
      <img
        alt="Event cover"
        className="aspect-video w-full object-cover"
        src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop"
      />
      <CardHeader>
        <CardAction>
          <Badge variant="default">Featured</Badge>
        </CardAction>
        <CardTitle>Design systems meetup</CardTitle>
        <CardDescription>
          A practical talk on component APIs, accessibility, and shipping
          faster.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full">View Event</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage your notification settings.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Settings
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>
          Configure how you receive notifications. You can enable or disable
          different types of alerts.
        </p>
      </CardContent>
    </Card>
  ),
};

// Social Card (Twitter-style)
export const SocialCard: Story = {
  name: "Social Card",
  render: () => (
    <Card className="w-full max-w-xs">
      <CardHeader className="flex-row items-center gap-3">
        <Avatar size="lg">
          <AvatarImage alt="shadcn" src="https://github.com/shadcn.png" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1 font-semibold text-sm leading-tight">
            shadcn
            <BadgeCheckIcon className="size-4 fill-blue-500 text-white" />
          </div>
          <p className="text-muted-foreground text-xs">@shadcn</p>
        </div>
        <Button size="sm">Follow</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">
          Building open source tools for the web. Creator of shadcn/ui and
          taxonomy.
        </p>
        <div className="flex gap-4 text-sm">
          <span>
            <span className="font-semibold">4</span>{" "}
            <span className="text-muted-foreground">Following</span>
          </span>
          <span>
            <span className="font-semibold">97.1K</span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </span>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A Twitter/X-style social profile card combining Card with Avatar, verified badge, bio text, and follower counts.",
      },
    },
  },
};
