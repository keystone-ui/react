import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";
import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import { Input } from "@keystoneui/react/input";
import { Label } from "@keystoneui/react/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BadgeCheck as BadgeCheckIcon } from "lucide-react";
import { expect } from "storybook/test";

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
} from "@keystoneui/react/card";

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

// Extra small size variant
<Card size="xs">
  <CardHeader>
    <CardTitle>Extra Compact Card</CardTitle>
  </CardHeader>
</Card>
\`\`\`

## Features

- Flexible composition with header, content, and footer sections
- Support for header actions via CardAction
- Size variants: \`md\` (default, 24px), \`sm\` (16px), and \`xs\` (12px)
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
      options: ["md", "sm", "xs"],
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
          This card uses the small size variant with 16px padding.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. You can put any content inside the card.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="sm" variant="outline">
          Action
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const ExtraSmall: Story = {
  name: "Extra Small",
  render: () => (
    <Card className="mx-auto w-full max-w-sm" size="xs">
      <CardHeader>
        <CardTitle>Extra Small Card</CardTitle>
        <CardDescription>
          This card uses the extra small size variant with 12px padding.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. You can put any content inside the card.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="xs" variant="outline">
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
          <AvatarImage
            alt="shadcn"
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
          />
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

export const Variants: Story = {
  // The variants must differ in FILL and share interior geometry -- a border
  // instead of a ring would inset the content box and shift every child by 1px
  // when swapping variants.
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll('[data-slot="card"]');
    const [filled, outline] = [...cards] as HTMLElement[];

    const filledStyle = getComputedStyle(filled);
    const outlineStyle = getComputedStyle(outline);

    await expect(filledStyle.backgroundColor).not.toBe(
      outlineStyle.backgroundColor
    );
    await expect(filledStyle.paddingLeft).toBe(outlineStyle.paddingLeft);
    await expect(filledStyle.borderLeftWidth).toBe(
      outlineStyle.borderLeftWidth
    );
    // Both draw their edge as a ring (a box-shadow), not a border.
    await expect(filledStyle.boxShadow).not.toBe("none");
    await expect(outlineStyle.boxShadow).not.toBe("none");
  },
  parameters: {
    docs: {
      description: {
        story:
          "The two surface tiers. `filled` (the default) paints `bg-card`; `outline` has no fill so the page shows through, which is the tier for chart and table panels where a filled card on a filled page reads as two stacked surfaces. Both use a ring rather than a border so the variants share identical interior geometry.",
      },
    },
  },
  render: () => (
    <div className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-2 [&>*]:min-w-0">
      <Card>
        <CardHeader>
          <CardTitle>Filled</CardTitle>
          <CardDescription>
            Rings <code>border-muted</code> — the fill already separates it from
            the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">The default surface.</p>
        </CardContent>
      </Card>
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Outline</CardTitle>
          <CardDescription>
            Rings <code>border</code> at full strength — with no fill the edge
            is the only thing defining the card.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">For panels.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const TableFlush: Story = {
  name: "Table Flush",
  // Asserts the COMPUTED padding, not the class name. A class-name assertion
  // passes while the rule it names is being out-specified by another, which is
  // exactly how the `data-[size=…]:[--card-spacing:…]` spelling of this API
  // shipped broken: tailwind-merge left the size-scoped declaration in place
  // and it beat the consumer's override on specificity. Only the resolved value
  // can tell you that. The jsdom suite in packages/ui cannot do this -- it
  // loads no CSS -- which is why this assertion lives here.
  play: async ({ canvasElement }) => {
    const cards = [
      ...canvasElement.querySelectorAll('[data-slot="card"]'),
    ] as HTMLElement[];
    const [padded, flush] = cards;

    // The padded card: title, separators and cell text share the card's
    // horizontal padding, so the heading lines up with the rows.
    const title = padded.querySelector(
      '[data-slot="card-title"]'
    ) as HTMLElement;
    const paddedRow = padded.querySelector("tbody tr") as HTMLElement;
    const cardLeft = padded.getBoundingClientRect().left;
    await expect(
      Math.round(title.getBoundingClientRect().left - cardLeft)
    ).toBe(Math.round(paddedRow.getBoundingClientRect().left - cardLeft));

    // The flush card: zeroed spacing, so rows run to the card's edge.
    const flushStyle = getComputedStyle(flush);
    await expect(flushStyle.paddingTop).toBe("0px");
    await expect(flushStyle.paddingBottom).toBe("0px");
    await expect(flushStyle.rowGap).toBe("0px");
    // The rounded corner has to clip the table's square one.
    await expect(flushStyle.overflow).toBe("hidden");
    await expect(
      Number.parseFloat(flushStyle.borderTopLeftRadius)
    ).toBeGreaterThan(0);
  },
  parameters: {
    docs: {
      description: {
        story:
          "Put a table in `CardContent` and it shares the card's horizontal padding with the title, so the heading, the row separators and the cell text line up. That is the normal recipe. Zeroing `--card-spacing` is for the narrower case of a card that is *only* a table — no title — where the header row sits against the edge and `overflow-hidden` clips the table's square corners. Do not zero it under a padded `CardHeader`: the heading ends up indented three times further than the columns.",
      },
    },
  },
  render: () => (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Delivery by squad</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Squad</TableHead>
                <TableHead numeric>Deploys</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Platform</TableCell>
                <TableCell numeric>42</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Payments</TableCell>
                <TableCell numeric>31</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="[--card-spacing:0px]" variant="outline">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Squad</TableHead>
              <TableHead numeric>Deploys</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Growth</TableCell>
              <TableCell numeric>18</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  ),
};
