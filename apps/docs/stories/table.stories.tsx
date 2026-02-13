import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystone/ui/table";
import { Badge } from "@keystone/ui/badge";
import { Button } from "@keystone/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@keystone/ui/dropdown-menu";
import { Checkbox } from "@keystone/ui/checkbox";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@keystone/ui/empty";
import {
  MoreHorizontalIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  ShieldAlertIcon,
  RotateCcwIcon,
  EyeIcon,
  CopyIcon,
  InboxIcon,
  CheckIcon,
  MinusIcon,
} from "lucide-react";
import { useState } from "react";

const meta = {
  title: "Components/Table",
  component: Table,
  parameters: {
    docs: {
      description: {
        component: `
A semantic table component for displaying structured data in rows and columns.

\`\`\`tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystone/ui/table";

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
\`\`\`

## Features

- Compound component API with semantic sub-components
- Responsive horizontal scrolling via overflow container
- Hover and selected row states
- Footer section with muted background
- Caption support for accessibility
- Size variants: \`default\` and \`sm\` for compact/dense layouts
- Composable with Badge, DropdownMenu, and other components
`,
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
      description: "The size variant of the table",
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof Table>;

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 5).map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">
              {invoice.totalAmount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export const Footer: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 3).map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">
              {invoice.totalAmount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

// ---------------------------------------------------------------------------
// WithBadges
// ---------------------------------------------------------------------------

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "Paid":
      return "secondary" as const;
    case "Pending":
      return "outline" as const;
    case "Unpaid":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

export const WithBadges: Story = {
  render: () => (
    <Table>
      <TableCaption>Invoice statuses displayed with badges.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>
              <Badge variant={statusBadgeVariant(invoice.paymentStatus)}>
                {invoice.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">
              {invoice.totalAmount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

const products = [
  { name: "Wireless Mouse", price: "$29.99" },
  { name: "Mechanical Keyboard", price: "$129.99" },
  { name: "USB-C Hub", price: "$49.99" },
];

export const Actions: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.name}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.price}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontalIcon />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ---------------------------------------------------------------------------
// CryptoTransactions
// ---------------------------------------------------------------------------

type TransactionType = "Deposit" | "Withdrawal";
type TransactionStatus = "Completed" | "Pending" | "Failed";

interface Transaction {
  id: string;
  type: TransactionType;
  asset: string;
  amount: string;
  status: TransactionStatus;
  p95: number | null;
  active: boolean;
  date: string;
  wallet: string;
}

const transactions: Transaction[] = [
  {
    id: "TX-8A3F1D",
    type: "Deposit",
    asset: "BTC",
    amount: "0.4281 BTC",
    status: "Completed",
    p95: 140,
    active: true,
    date: "Feb 14, 2026 09:23",
    wallet: "bc1q...7kpw",
  },
  {
    id: "TX-2E9B4C",
    type: "Withdrawal",
    asset: "ETH",
    amount: "12.500 ETH",
    status: "Pending",
    p95: 203,
    active: true,
    date: "Feb 13, 2026 15:22",
    wallet: "0x71C...9eF2",
  },
  {
    id: "TX-6F1D8A",
    type: "Deposit",
    asset: "USDT",
    amount: "25,000.00 USDT",
    status: "Completed",
    p95: 1252,
    active: true,
    date: "Feb 14, 2026 01:12",
    wallet: "TJx4...Wq8R",
  },
  {
    id: "TX-3C7E2F",
    type: "Withdrawal",
    asset: "BTC",
    amount: "1.0000 BTC",
    status: "Failed",
    p95: 659,
    active: true,
    date: "Feb 13, 2026 01:22",
    wallet: "bc1q...m3xp",
  },
  {
    id: "TX-9D4A6B",
    type: "Deposit",
    asset: "ETH",
    amount: "50.000 ETH",
    status: "Completed",
    p95: 1301,
    active: true,
    date: "Feb 13, 2026 12:22",
    wallet: "0xA3F...1bC7",
  },
  {
    id: "TX-1B5F8E",
    type: "Withdrawal",
    asset: "USDT",
    amount: "8,750.00 USDT",
    status: "Pending",
    p95: 2420,
    active: true,
    date: "Feb 10, 2026 01:22",
    wallet: "TKz9...Lp2V",
  },
  {
    id: "TX-7E2C9D",
    type: "Deposit",
    asset: "BTC",
    amount: "0.1500 BTC",
    status: "Completed",
    p95: null,
    active: false,
    date: "Feb 04, 2026 01:22",
    wallet: "bc1q...f4dn",
  },
  {
    id: "TX-4A8D1F",
    type: "Withdrawal",
    asset: "ETH",
    amount: "3.250 ETH",
    status: "Failed",
    p95: 967,
    active: true,
    date: "Feb 12, 2026 21:22",
    wallet: "0xD8E...4aC2",
  },
];

const txTypeBadgeVariant = (type: TransactionType) => {
  return type === "Deposit" ? ("secondary" as const) : ("outline" as const);
};

const txStatusBadgeVariant = (status: TransactionStatus) => {
  switch (status) {
    case "Completed":
      return "secondary" as const;
    case "Pending":
      return "outline" as const;
    case "Failed":
      return "destructive" as const;
  }
};

function ActiveIndicator({ active }: { active: boolean }) {
  return active ? (
    <CheckIcon className="size-4" />
  ) : (
    <MinusIcon className="size-4 text-muted-foreground/50" />
  );
}

export const CryptoTransactions: Story = {
  render: () => (
    <Table>
      <TableCaption>Recent transactions — Exchange Admin Panel</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">TX ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>P95</TableHead>
          <TableHead>Active</TableHead>
          <TableHead>Wallet</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="font-medium font-mono text-xs">
              {tx.id}
            </TableCell>
            <TableCell>
              <Badge variant={txTypeBadgeVariant(tx.type)}>
                {tx.type === "Deposit" ? (
                  <ArrowDownLeftIcon className="size-3" />
                ) : (
                  <ArrowUpRightIcon className="size-3" />
                )}
                {tx.type}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">{tx.asset}</TableCell>
            <TableCell className="font-mono text-xs">{tx.amount}</TableCell>
            <TableCell>
              <Badge variant={txStatusBadgeVariant(tx.status)}>
                {tx.status}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs">
              {tx.p95 !== null ? (
                `${tx.p95} ms`
              ) : (
                <MinusIcon className="size-4 text-muted-foreground/50" />
              )}
            </TableCell>
            <TableCell>
              <ActiveIndicator active={tx.active} />
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {tx.wallet}
            </TableCell>
            <TableCell className="text-muted-foreground">{tx.date}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontalIcon />
                      <span className="sr-only">Transaction actions</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <EyeIcon />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CopyIcon />
                    Copy TX ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <RotateCcwIcon />
                    Refund
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive">
                    <ShieldAlertIcon />
                    Flag & Block
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={9}>
            {transactions.length} transactions
          </TableCell>
          <TableCell className="text-right">
            <span className="text-muted-foreground text-xs">Page 1 of 24</span>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

// ---------------------------------------------------------------------------
// Compact
// ---------------------------------------------------------------------------

export const Compact: Story = {
  render: () => (
    <Table size="sm">
      <TableCaption>Compact table with reduced padding and text size.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>
              <Badge size="sm" variant={statusBadgeVariant(invoice.paymentStatus)}>
                {invoice.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">
              {invoice.totalAmount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,250.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

export const EmptyState: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={4}>
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>No invoices found</EmptyTitle>
                <EmptyDescription>
                  There are no invoices matching your filters. Try adjusting your
                  search criteria.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// ---------------------------------------------------------------------------
// SelectedRows
// ---------------------------------------------------------------------------

function SelectedRowsExample() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["INV001", "INV004"])
  );

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === invoices.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(invoices.map((i) => i.invoice)));
    }
  };

  const allSelected = selected.size === invoices.length;

  return (
    <Table>
      <TableCaption>
        {selected.size} of {invoices.length} row(s) selected.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected}
              indeterminate={selected.size > 0 && !allSelected}
              onCheckedChange={toggleAll}
              aria-label="Select all"
            />
          </TableHead>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow
            key={invoice.invoice}
            data-state={selected.has(invoice.invoice) ? "selected" : undefined}
          >
            <TableCell>
              <Checkbox
                checked={selected.has(invoice.invoice)}
                onCheckedChange={() => toggleRow(invoice.invoice)}
                aria-label={`Select ${invoice.invoice}`}
              />
            </TableCell>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>
              <Badge variant={statusBadgeVariant(invoice.paymentStatus)}>
                {invoice.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">
              {invoice.totalAmount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const SelectedRows: Story = {
  render: () => <SelectedRowsExample />,
};

// ---------------------------------------------------------------------------
// StripedRows
// ---------------------------------------------------------------------------

export const StripedRows: Story = {
  render: () => (
    <Table>
      <TableCaption>Alternating row backgrounds via className.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice} className="even:bg-muted/30">
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">
              {invoice.totalAmount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ---------------------------------------------------------------------------
// HighlightedHeader
// ---------------------------------------------------------------------------

export const HighlightedHeader: Story = {
  render: () => (
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 5).map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">
              {invoice.totalAmount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};