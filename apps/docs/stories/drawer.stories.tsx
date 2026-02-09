import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@keystone/ui/drawer";
import {
  Stepper,
  StepperContent,
  StepperStep,
  useStepper,
} from "@keystone/ui/stepper";
import { Button } from "@keystone/ui/button";
import { Checkbox } from "@keystone/ui/checkbox";
import { Label } from "@keystone/ui/label";
import { RadioGroup, RadioGroupItem } from "@keystone/ui/radio-group";
import {
  Filter as FilterIcon,
  Minus,
  Plus,
} from "lucide-react";

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: {
    docs: {
      description: {
        component: `
A drawer component built on top of [Vaul](https://github.com/emilkowalski/vaul). Drawers slide in from any edge of the screen and are ideal for mobile-friendly interactions, forms, and supplementary content.

\`\`\`tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@keystone/ui/drawer";

<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline">Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Title</DrawerTitle>
      <DrawerDescription>Description text.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose asChild>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
\`\`\`

## Features

- Slides in from bottom, top, left, or right
- Drag-to-dismiss gesture support (bottom drawer)
- Accessible overlay with backdrop
- Composable header, footer, title, and description
- Mobile-friendly interaction patterns

## API Reference

See the [Vaul documentation](https://vaul.emilkowal.ski/) for the full API reference.
`,
      },
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof Drawer>;

// =============================================================================
// Default
// =============================================================================
export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  ),
};

// =============================================================================
// Scrollable Content
// =============================================================================
export const ScrollableContent: Story = {
  render: () => (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">Scrollable Content</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Terms of Service</DrawerTitle>
          <DrawerDescription>
            Please review the following terms carefully.
          </DrawerDescription>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <p key={index} className="mb-4 leading-normal">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
              culpa qui officia deserunt mollit anim id est laborum.
            </p>
          ))}
        </div>
        <DrawerFooter>
          <Button>Accept</Button>
          <DrawerClose asChild>
            <Button variant="outline">Decline</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A right-side drawer with scrollable content. The header and footer remain fixed while the body scrolls.",
      },
    },
  },
};

// =============================================================================
// Sides
// =============================================================================
const DRAWER_SIDES = ["top", "right", "bottom", "left"] as const;

export const Sides: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {DRAWER_SIDES.map((side) => (
        <Drawer
          key={side}
          direction={
            side === "bottom" ? undefined : (side as "top" | "right" | "left")
          }
        >
          <DrawerTrigger asChild>
            <Button variant="outline" className="capitalize">
              {side}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[50vh] data-[vaul-drawer-direction=top]:max-h-[50vh]">
            <DrawerHeader>
              <DrawerTitle>Drawer from {side}</DrawerTitle>
              <DrawerDescription>
                This drawer slides in from the {side} of the screen.
              </DrawerDescription>
            </DrawerHeader>
            <div className="no-scrollbar overflow-y-auto px-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <p key={index} className="mb-4 leading-normal">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              ))}
            </div>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `direction` prop to control which side the drawer slides in from. Available options are `top`, `right`, `bottom` (default), and `left`.",
      },
    },
  },
};

// =============================================================================
// Nested (Goal Counter)
// =============================================================================
function GoalDrawerDemo() {
  const [goal, setGoal] = React.useState(350);

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)));
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Move Goal</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>
              Set your daily activity goal.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => onClick(-10)}
                disabled={goal <= 200}
              >
                <Minus />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="text-7xl font-bold tracking-tighter">
                  {goal}
                </div>
                <div className="text-muted-foreground text-[0.70rem] uppercase">
                  Calories/day
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => onClick(10)}
                disabled={goal >= 400}
              >
                <Plus />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export const Nested: Story = {
  render: () => <GoalDrawerDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "A bottom drawer with interactive content. Demonstrates using stateful components inside the drawer body.",
      },
    },
  },
};

// =============================================================================
// Multi-Step (Filter)
// =============================================================================
const DATE_RANGES = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "All time", value: "all" },
];

const CURRENCIES = [
  { label: "Bitcoin", symbol: "BTC" },
  { label: "Ethereum", symbol: "ETH" },
  { label: "Solana", symbol: "SOL" },
  { label: "Tether", symbol: "USDT" },
  { label: "USD Coin", symbol: "USDC" },
  { label: "Ripple", symbol: "XRP" },
];

const TRANSACTION_TYPES = [
  { label: "All Transactions", value: "all" },
  { label: "Deposits", value: "deposits" },
  { label: "Withdrawals", value: "withdrawals" },
  { label: "Swaps", value: "swaps" },
];

function FilterStepIndicator() {
  const { value, totalSteps } = useStepper();
  const labels = ["Date", "Currency", "Type"];
  return (
    <div className="flex items-center gap-1 text-xs">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <React.Fragment key={i}>
          <span
            className={`rounded-full px-2 py-0.5 font-medium transition-colors ${
              i === value
                ? "bg-primary text-primary-foreground"
                : i < value
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground bg-muted"
            }`}
          >
            {labels[i]}
          </span>
          {i < totalSteps - 1 && (
            <span className="text-muted-foreground text-[10px]">&rsaquo;</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function FilterNav({ onApply }: { onApply: () => void }) {
  const { goNext, goPrevious, isFirst, isLast } = useStepper();
  return (
    <DrawerFooter className="flex-row">
      <Button
        variant="outline"
        onClick={goPrevious}
        disabled={isFirst}
        className="flex-1"
      >
        Back
      </Button>
      {isLast ? (
        <Button onClick={onApply} className="flex-1">
          Apply Filters
        </Button>
      ) : (
        <Button onClick={goNext} className="flex-1">
          Next
        </Button>
      )}
    </DrawerFooter>
  );
}

function FilterDrawerDemo() {
  const [step, setStep] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  // Filter state
  const [dateRange, setDateRange] = React.useState("7d");
  const [currencies, setCurrencies] = React.useState<string[]>([
    "BTC",
    "ETH",
  ]);
  const [txType, setTxType] = React.useState("all");
  const [applied, setApplied] = React.useState(false);

  const toggleCurrency = (symbol: string) => {
    setCurrencies((prev) =>
      prev.includes(symbol)
        ? prev.filter((c) => c !== symbol)
        : [...prev, symbol],
    );
  };

  const handleApply = () => {
    setApplied(true);
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Drawer
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setStep(0);
        }}
      >
        <DrawerTrigger asChild>
          <Button variant="outline">
            <FilterIcon className="size-4" />
            Filters
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <Stepper value={step} onValueChange={setStep}>
              <DrawerHeader>
                <div className="flex items-center justify-between">
                  <DrawerTitle>Filters</DrawerTitle>
                  <FilterStepIndicator />
                </div>
                <DrawerDescription>
                  Narrow down your transaction history.
                </DrawerDescription>
              </DrawerHeader>

              <StepperContent className="px-4">
                {/* Step 1: Date Range */}
                <StepperStep>
                  <div className="grid gap-3">
                    <Label className="text-sm font-medium">Date Range</Label>
                    <RadioGroup
                      value={dateRange}
                      onValueChange={(value) => value && setDateRange(value)}
                    >
                      {DATE_RANGES.map((range) => (
                        <label
                          key={range.value}
                          className="border-input hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                        >
                          <RadioGroupItem value={range.value} />
                          <span className="text-sm">{range.label}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </StepperStep>

                {/* Step 2: Currency */}
                <StepperStep>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Currency</Label>
                      <span className="text-muted-foreground text-xs">
                        {currencies.length} selected
                      </span>
                    </div>
                    <div className="grid gap-2">
                      {CURRENCIES.map((currency) => (
                        <label
                          key={currency.symbol}
                          className="border-input hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                        >
                          <Checkbox
                            checked={currencies.includes(currency.symbol)}
                            onCheckedChange={() =>
                              toggleCurrency(currency.symbol)
                            }
                          />
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground w-10 font-mono text-xs">
                              {currency.symbol}
                            </span>
                            <span>{currency.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </StepperStep>

                {/* Step 3: Transaction Type */}
                <StepperStep>
                  <div className="grid gap-3">
                    <Label className="text-sm font-medium">
                      Transaction Type
                    </Label>
                    <RadioGroup
                      value={txType}
                      onValueChange={(value) => value && setTxType(value)}
                    >
                      {TRANSACTION_TYPES.map((type) => (
                        <label
                          key={type.value}
                          className="border-input hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                        >
                          <RadioGroupItem value={type.value} />
                          <span className="text-sm">{type.label}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </StepperStep>
              </StepperContent>

              <FilterNav onApply={handleApply} />
            </Stepper>
          </div>
        </DrawerContent>
      </Drawer>
      {applied && (
        <p className="text-muted-foreground text-sm">
          Applied: {dateRange} &middot; {currencies.join(", ")} &middot;{" "}
          {txType}
        </p>
      )}
    </div>
  );
}

export const MultiStep: Story = {
  name: "Multi-Step",
  render: () => <FilterDrawerDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "A transaction filter wizard using the `Stepper` component inside a bottom Drawer. Three steps — Date Range, Currency, and Transaction Type — animate between each other while the Drawer API remains completely unchanged. Navigation and step indicators are built with `useStepper()`.",
      },
    },
  },
};
