import { Badge } from "@keystoneui/react/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@keystoneui/react/description-list";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleCheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";

const meta = {
  title: "Components/DescriptionList",
  component: DescriptionList,
  parameters: {
    docs: {
      description: {
        component: `
A semantic description list component for displaying key-value metadata pairs.

\`\`\`tsx
import {
  DescriptionList,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListDetails,
} from "@keystoneui/react/description-list";

<DescriptionList>
  <DescriptionListItem>
    <DescriptionListTerm>Provider</DescriptionListTerm>
    <DescriptionListDetails>Netent</DescriptionListDetails>
  </DescriptionListItem>
</DescriptionList>
\`\`\`

## Features

- Compound component API with semantic \`<dl>\`, \`<dt>\`, \`<dd>\` HTML
- Visual variants: \`default\` (bordered rows) and \`card\` (spaced rows with rounded corners)
- Size variants: \`default\` and \`sm\` for compact layouts
- Values accept any React node (text, Badge, icons, etc.)
- Composable with Card and other components
`,
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
      description: "The size variant of the description list",
    },
    variant: {
      control: "select",
      options: ["default", "card"],
      description: "The visual variant of the description list",
    },
  },
  subcomponents: {
    DescriptionListItem,
    DescriptionListTerm,
    DescriptionListDetails,
  },
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof DescriptionList>;

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const gameDetails = [
  { label: "Provider", value: "Netent" },
  { label: "Game", value: "Fruit Ninja" },
  { label: "Current Players", value: "24" },
];

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <DescriptionList>
      {gameDetails.map((item) => (
        <DescriptionListItem key={item.label}>
          <DescriptionListTerm>{item.label}</DescriptionListTerm>
          <DescriptionListDetails>{item.value}</DescriptionListDetails>
        </DescriptionListItem>
      ))}
      <DescriptionListItem>
        <DescriptionListTerm>Genre</DescriptionListTerm>
        <DescriptionListDetails>
          <Badge variant="default">Action</Badge>
        </DescriptionListDetails>
      </DescriptionListItem>
    </DescriptionList>
  ),
};

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export const CardVariant: Story = {
  name: "Card",
  render: () => (
    <DescriptionList variant="card">
      {gameDetails.map((item) => (
        <DescriptionListItem key={item.label}>
          <DescriptionListTerm>{item.label}</DescriptionListTerm>
          <DescriptionListDetails>{item.value}</DescriptionListDetails>
        </DescriptionListItem>
      ))}
      <DescriptionListItem>
        <DescriptionListTerm>Genre</DescriptionListTerm>
        <DescriptionListDetails>
          <Badge variant="default">Action</Badge>
        </DescriptionListDetails>
      </DescriptionListItem>
    </DescriptionList>
  ),
};

// ---------------------------------------------------------------------------
// Compact
// ---------------------------------------------------------------------------

export const Compact: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <div>
        <p className="mb-3 font-medium text-muted-foreground text-sm">
          Default variant, small size
        </p>
        <DescriptionList size="sm">
          {gameDetails.map((item) => (
            <DescriptionListItem key={item.label}>
              <DescriptionListTerm>{item.label}</DescriptionListTerm>
              <DescriptionListDetails>{item.value}</DescriptionListDetails>
            </DescriptionListItem>
          ))}
          <DescriptionListItem>
            <DescriptionListTerm>Genre</DescriptionListTerm>
            <DescriptionListDetails>
              <Badge size="sm" variant="default">
                Action
              </Badge>
            </DescriptionListDetails>
          </DescriptionListItem>
        </DescriptionList>
      </div>
      <div>
        <p className="mb-3 font-medium text-muted-foreground text-sm">
          Card variant, small size
        </p>
        <DescriptionList size="sm" variant="card">
          {gameDetails.map((item) => (
            <DescriptionListItem key={item.label}>
              <DescriptionListTerm>{item.label}</DescriptionListTerm>
              <DescriptionListDetails>{item.value}</DescriptionListDetails>
            </DescriptionListItem>
          ))}
          <DescriptionListItem>
            <DescriptionListTerm>Genre</DescriptionListTerm>
            <DescriptionListDetails>
              <Badge size="sm" variant="default">
                Action
              </Badge>
            </DescriptionListDetails>
          </DescriptionListItem>
        </DescriptionList>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// InCard
// ---------------------------------------------------------------------------

export const InCard: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Game Description</CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionList variant="card">
            {gameDetails.map((item) => (
              <DescriptionListItem key={item.label}>
                <DescriptionListTerm>{item.label}</DescriptionListTerm>
                <DescriptionListDetails>{item.value}</DescriptionListDetails>
              </DescriptionListItem>
            ))}
            <DescriptionListItem>
              <DescriptionListTerm>Genre</DescriptionListTerm>
              <DescriptionListDetails>
                <Badge variant="default">Action</Badge>
              </DescriptionListDetails>
            </DescriptionListItem>
          </DescriptionList>
        </CardContent>
      </Card>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Game Description</CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionList>
            {gameDetails.map((item) => (
              <DescriptionListItem key={item.label}>
                <DescriptionListTerm>{item.label}</DescriptionListTerm>
                <DescriptionListDetails>{item.value}</DescriptionListDetails>
              </DescriptionListItem>
            ))}
            <DescriptionListItem>
              <DescriptionListTerm>Genre</DescriptionListTerm>
              <DescriptionListDetails>
                <Badge variant="default">Action</Badge>
              </DescriptionListDetails>
            </DescriptionListItem>
          </DescriptionList>
        </CardContent>
      </Card>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// CustomValues
// ---------------------------------------------------------------------------

export const CustomValues: Story = {
  render: () => (
    <DescriptionList variant="card">
      <DescriptionListItem>
        <DescriptionListTerm>Status</DescriptionListTerm>
        <DescriptionListDetails>
          <Badge variant="secondary">
            <CircleCheckIcon className="size-3" />
            Active
          </Badge>
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Contract</DescriptionListTerm>
        <DescriptionListDetails className="flex items-center gap-1.5 font-mono text-xs">
          0x71C...9eF2
          <CopyIcon className="size-3 text-muted-foreground" />
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Network</DescriptionListTerm>
        <DescriptionListDetails>Ethereum Mainnet</DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Documentation</DescriptionListTerm>
        <DescriptionListDetails className="flex items-center gap-1.5">
          <a className="text-primary underline underline-offset-4" href="#">
            View docs
          </a>
          <ExternalLinkIcon className="size-3 text-muted-foreground" />
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Tags</DescriptionListTerm>
        <DescriptionListDetails className="flex items-center gap-1.5">
          <Badge size="sm" variant="secondary">
            DeFi
          </Badge>
          <Badge size="sm" variant="outline">
            Staking
          </Badge>
        </DescriptionListDetails>
      </DescriptionListItem>
    </DescriptionList>
  ),
};

// ---------------------------------------------------------------------------
// OrderSummary
// ---------------------------------------------------------------------------

const orderItems = [
  { label: "Subtotal", value: "$1,250.00" },
  { label: "Shipping", value: "$12.50" },
  { label: "Tax", value: "$125.00" },
];

export const OrderSummary: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <DescriptionList>
          {orderItems.map((item) => (
            <DescriptionListItem key={item.label}>
              <DescriptionListTerm>{item.label}</DescriptionListTerm>
              <DescriptionListDetails>{item.value}</DescriptionListDetails>
            </DescriptionListItem>
          ))}
          <DescriptionListItem className="font-medium">
            <DescriptionListTerm className="text-foreground">
              Total
            </DescriptionListTerm>
            <DescriptionListDetails>$1,387.50</DescriptionListDetails>
          </DescriptionListItem>
        </DescriptionList>
      </CardContent>
    </Card>
  ),
};
