import { Button } from "@keystone/ui/button";
import { Checkbox } from "@keystone/ui/checkbox";
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
import { Input } from "@keystone/ui/input";
import { RadioGroup, RadioGroupItem } from "@keystone/ui/radio-group";
import {
  Stepper,
  StepperContent,
  StepperStep,
  useStepper,
} from "@keystone/ui/stepper";
import { Switch } from "@keystone/ui/switch";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Filter as FilterIcon,
  LayoutGrid,
  Minus,
  Plus,
  Search,
} from "lucide-react";
import * as React from "react";

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: {
    docs: {
      description: {
        component: `
A drawer component built on top of [Base UI Drawer](https://base-ui.com/react/components/drawer). Drawers slide in from any edge of the screen and are ideal for mobile-friendly interactions, forms, and supplementary content.

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
  <DrawerTrigger render={<Button variant="outline" />}>
    Open Drawer
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Title</DrawerTitle>
      <DrawerDescription>Description text.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose render={<Button variant="outline" />}>
        Cancel
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
\`\`\`

## Features

- Slides in from bottom, top, left, or right
- Swipe-to-dismiss gesture support
- Accessible overlay with backdrop
- Composable header, footer, title, and description
- Mobile-friendly interaction patterns
- Snap point support for bottom sheets

## API Reference

See the [Base UI Drawer documentation](https://base-ui.com/react/components/drawer) for the full API reference.
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
      <DrawerTrigger render={<Button variant="outline" />}>
        Open Drawer
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
            <DrawerClose render={<Button variant="outline" />}>
              Cancel
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
    <Drawer swipeDirection="right">
      <DrawerTrigger render={<Button variant="outline" />}>
        Scrollable Content
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
            <p className="mb-4 leading-normal" key={index}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          ))}
        </div>
        <DrawerFooter>
          <Button>Accept</Button>
          <DrawerClose render={<Button variant="outline" />}>
            Decline
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
const DRAWER_SIDES = [
  { swipeDirection: "up", label: "Top" },
  { swipeDirection: "right", label: "Right" },
  { swipeDirection: "down", label: "Bottom" },
  { swipeDirection: "left", label: "Left" },
] as const;

export const Sides: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {DRAWER_SIDES.map((side) => (
        <Drawer key={side.swipeDirection} swipeDirection={side.swipeDirection}>
          <DrawerTrigger render={<Button variant="outline" />}>
            {side.label}
          </DrawerTrigger>
          <DrawerContent className="data-[swipe-direction=down]:max-h-[50vh] data-[swipe-direction=up]:max-h-[50vh]">
            <DrawerHeader>
              <DrawerTitle>Drawer from {side.label.toLowerCase()}</DrawerTitle>
              <DrawerDescription>
                This drawer slides in from the {side.label.toLowerCase()} of the
                screen.
              </DrawerDescription>
            </DrawerHeader>
            <div className="no-scrollbar overflow-y-auto px-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <p className="mb-4 leading-normal" key={index}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              ))}
            </div>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose render={<Button variant="outline" />}>
                Cancel
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
          "Use the `swipeDirection` prop to control which side the drawer slides in from. Available options are `up` (top), `right`, `down` (bottom, default), and `left`.",
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
      <DrawerTrigger render={<Button variant="outline" />}>
        Move Goal
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button
                className="h-8 w-8 shrink-0 rounded-full"
                disabled={goal <= 200}
                onClick={() => onClick(-10)}
                size="icon"
                variant="outline"
              >
                <Minus />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="font-bold text-7xl tracking-tighter">
                  {goal}
                </div>
                <div className="text-[0.70rem] text-muted-foreground uppercase">
                  Calories/day
                </div>
              </div>
              <Button
                className="h-8 w-8 shrink-0 rounded-full"
                disabled={goal >= 400}
                onClick={() => onClick(10)}
                size="icon"
                variant="outline"
              >
                <Plus />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose render={<Button variant="outline" />}>
              Cancel
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
// Drill-Down Filter
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

const FILTER_CATEGORIES = [
  { label: "Date", step: 1 },
  { label: "Currency", step: 2 },
  { label: "Transaction Type", step: 3 },
];

function FilterMenu() {
  const { goTo } = useStepper();
  return (
    <div className="divide-y divide-border-muted">
      {FILTER_CATEGORIES.map((cat) => (
        <button
          className="flex h-12 w-full cursor-pointer items-center justify-between px-4 active:text-muted-foreground"
          key={cat.step}
          onClick={() => goTo(cat.step)}
        >
          <span className="font-medium text-sm">{cat.label}</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}

function FilterSubHeader({ title }: { title: string }) {
  const { goTo } = useStepper();
  return (
    <DrawerHeader>
      <div className="flex items-center gap-2">
        <Button
          className="-ml-1"
          onClick={() => goTo(0)}
          size="icon-xs"
          variant="ghost"
        >
          <ArrowLeft className="size-4" />
          <span className="sr-only">Back</span>
        </Button>
        <DrawerTitle>{title}</DrawerTitle>
      </div>
    </DrawerHeader>
  );
}

function FilterDrawerDemo() {
  const [step, setStep] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  // Filter state
  const [dateRange, setDateRange] = React.useState("7d");
  const [currencies, setCurrencies] = React.useState<string[]>(["BTC", "ETH"]);
  const [txType, setTxType] = React.useState("all");
  const [applied, setApplied] = React.useState(false);

  const toggleCurrency = (symbol: string) => {
    setCurrencies((prev) =>
      prev.includes(symbol)
        ? prev.filter((c) => c !== symbol)
        : [...prev, symbol]
    );
  };

  const handleApply = () => {
    setApplied(true);
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Drawer
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setStep(0);
          }
        }}
        open={open}
      >
        <DrawerTrigger render={<Button variant="outline" />}>
          <FilterIcon className="size-4" />
          Filters
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <Stepper onValueChange={setStep} value={step}>
              <StepperContent>
                {/* Step 0: Filter Menu */}
                <StepperStep>
                  <DrawerHeader>
                    <DrawerTitle className="text-center">Filter</DrawerTitle>
                  </DrawerHeader>
                  <FilterMenu />
                  <DrawerFooter>
                    <Button className="w-full" onClick={handleApply}>
                      Filter
                    </Button>
                  </DrawerFooter>
                </StepperStep>

                {/* Step 1: Date Range */}
                <StepperStep>
                  <FilterSubHeader title="Date" />
                  <div className="pb-4">
                    <RadioGroup
                      className="gap-0 divide-y divide-border-muted"
                      onValueChange={(value) => value && setDateRange(value)}
                      value={dateRange}
                    >
                      {DATE_RANGES.map((range) => (
                        <label
                          className="flex h-12 cursor-pointer items-center gap-3 px-4"
                          key={range.value}
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
                  <FilterSubHeader title="Currency" />
                  <div className="pb-4">
                    <div className="mb-2 flex items-center justify-between px-4">
                      <span className="text-muted-foreground text-xs">
                        {currencies.length} selected
                      </span>
                    </div>
                    <div className="divide-y divide-border-muted">
                      {CURRENCIES.map((currency) => (
                        <label
                          className="flex h-12 cursor-pointer items-center gap-3 px-4"
                          key={currency.symbol}
                        >
                          <Checkbox
                            checked={currencies.includes(currency.symbol)}
                            onCheckedChange={() =>
                              toggleCurrency(currency.symbol)
                            }
                          />
                          <div className="flex items-center gap-2 text-sm">
                            <span className="w-10 font-mono text-muted-foreground text-xs">
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
                  <FilterSubHeader title="Transaction Type" />
                  <div className="pb-4">
                    <RadioGroup
                      className="gap-0 divide-y divide-border-muted"
                      onValueChange={(value) => value && setTxType(value)}
                      value={txType}
                    >
                      {TRANSACTION_TYPES.map((type) => (
                        <label
                          className="flex h-12 cursor-pointer items-center gap-3 px-4"
                          key={type.value}
                        >
                          <RadioGroupItem value={type.value} />
                          <span className="text-sm">{type.label}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </StepperStep>
              </StepperContent>
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

export const DrillDownFilter: Story = {
  name: "Drill-Down Filter",
  render: () => <FilterDrawerDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "A drill-down filter drawer using the `Stepper` component for non-linear navigation. The main menu lists filter categories (Date, Currency, Transaction Type) — tap one to drill into its options, then use the back arrow to return. Uses `goTo()` from `useStepper()` for hub-and-spoke navigation instead of sequential steps.",
      },
    },
  },
};

// =============================================================================
// Sort By
// =============================================================================
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Price: Low to High", value: "price-asc" },
];

function SortByDrawerDemo() {
  const [selected, setSelected] = React.useState("newest");

  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        <ArrowUpDown className="size-4" />
        Sort By
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-center">Sort By</DrawerTitle>
          </DrawerHeader>
          <div className="divide-y divide-border-muted">
            {SORT_OPTIONS.map((option) => {
              const isSelected = selected === option.value;
              return (
                <button
                  className={`flex h-12 w-full cursor-pointer items-center justify-between px-4 active:text-muted-foreground ${
                    isSelected
                      ? "font-medium text-primary"
                      : "text-muted-foreground"
                  }`}
                  key={option.value}
                  onClick={() => setSelected(option.value)}
                >
                  <span className="text-sm">{option.label}</span>
                  {isSelected && <Check className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>
          <div className="p-4" />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export const SortBy: Story = {
  name: "Sort By",
  render: () => <SortByDrawerDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "A simple single-level sort drawer. Tapping an option selects it immediately with a checkmark indicator. No stepper or sub-navigation needed — ideal for quick single-select lists.",
      },
    },
  },
};

// =============================================================================
// Complex Filter (Drill-Down with Icons)
// =============================================================================
const GAME_PROVIDERS = [
  "1spin4win",
  "Apparat Gaming",
  "BGaming",
  "Betsoft Gaming",
  "Booming Games",
  "Clawbuster",
  "Evolution",
  "Evoplay Entertainment",
  "Hacksaw Gaming",
  "NetEnt",
  "Nolimit City",
  "Pragmatic Play",
  "Push Gaming",
  "Red Tiger",
  "Relax Gaming",
];

const COMPLEX_SORT_OPTIONS = [
  { label: "A-Z", value: "az" },
  { label: "Novelty", value: "novelty" },
  { label: "Popularity", value: "popularity" },
];

function ComplexFilterSubHeader({ title }: { title: string }) {
  const { goTo } = useStepper();
  return (
    <DrawerHeader>
      <div className="flex items-center gap-2">
        <Button
          className="-ml-1"
          onClick={() => goTo(0)}
          size="icon-xs"
          variant="ghost"
        >
          <ArrowLeft className="size-4" />
          <span className="sr-only">Back</span>
        </Button>
        <DrawerTitle>{title}</DrawerTitle>
      </div>
    </DrawerHeader>
  );
}

function ComplexFilterMenu({
  sortValue,
  showBlocked,
  onToggleBlocked,
}: {
  sortValue: string;
  showBlocked: boolean;
  onToggleBlocked: () => void;
}) {
  const { goTo } = useStepper();
  const sortLabel =
    COMPLEX_SORT_OPTIONS.find((o) => o.value === sortValue)?.label ?? sortValue;

  return (
    <div className="divide-y divide-border-muted">
      <button
        className="flex h-12 w-full cursor-pointer items-center gap-3 px-4 active:text-muted-foreground"
        onClick={() => goTo(1)}
      >
        <LayoutGrid className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left font-medium text-sm">Providers</span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>
      <button
        className="flex h-12 w-full cursor-pointer items-center gap-3 px-4 active:text-muted-foreground"
        onClick={() => goTo(2)}
      >
        <ArrowUpDown className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left font-medium text-sm">Sort By</span>
        <span className="mr-1 text-muted-foreground text-xs">{sortLabel}</span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>
      <div className="flex h-12 items-center gap-3 px-4">
        {showBlocked ? (
          <Eye className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <EyeOff className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1 font-medium text-sm">Show Blocked</span>
        <Switch checked={showBlocked} onCheckedChange={onToggleBlocked} />
      </div>
    </div>
  );
}

function ComplexFilterDrawerDemo() {
  const [step, setStep] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  // State
  const [selectedProviders, setSelectedProviders] = React.useState<string[]>([
    "BGaming",
    "Evolution",
    "Pragmatic Play",
  ]);
  const [sortValue, setSortValue] = React.useState("novelty");
  const [showBlocked, setShowBlocked] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [applied, setApplied] = React.useState(false);

  const toggleProvider = (name: string) => {
    setSelectedProviders((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const filteredProviders = GAME_PROVIDERS.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = () => {
    setApplied(true);
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Drawer
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setStep(0);
            setSearch("");
          }
        }}
        open={open}
      >
        <DrawerTrigger render={<Button variant="outline" />}>
          <FilterIcon className="size-4" />
          Filters
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <Stepper onValueChange={setStep} value={step}>
              <StepperContent>
                {/* Step 0: Menu */}
                <StepperStep>
                  <DrawerHeader>
                    <DrawerTitle className="text-center">Filters</DrawerTitle>
                  </DrawerHeader>
                  <ComplexFilterMenu
                    onToggleBlocked={() => setShowBlocked((prev) => !prev)}
                    showBlocked={showBlocked}
                    sortValue={sortValue}
                  />
                  <DrawerFooter>
                    <Button className="w-full" onClick={handleApply}>
                      Apply
                    </Button>
                  </DrawerFooter>
                </StepperStep>

                {/* Step 1: Providers */}
                <StepperStep>
                  <ComplexFilterSubHeader title="Providers" />
                  <div className="px-4 pb-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        value={search}
                      />
                    </div>
                  </div>
                  <div className="no-scrollbar max-h-[50vh] overflow-y-auto">
                    <div className="divide-y divide-border-muted">
                      {filteredProviders.map((provider) => (
                        <label
                          className="flex h-12 cursor-pointer items-center gap-3 px-4"
                          key={provider}
                        >
                          <Checkbox
                            checked={selectedProviders.includes(provider)}
                            onCheckedChange={() => toggleProvider(provider)}
                          />
                          <span className="text-sm">{provider}</span>
                        </label>
                      ))}
                      {filteredProviders.length === 0 && (
                        <div className="flex h-12 items-center px-4 text-muted-foreground text-sm">
                          No providers found.
                        </div>
                      )}
                    </div>
                  </div>
                  <DrawerFooter>
                    <Button className="w-full" onClick={handleApply}>
                      Apply
                    </Button>
                  </DrawerFooter>
                </StepperStep>

                {/* Step 2: Sort By */}
                <StepperStep>
                  <ComplexFilterSubHeader title="Sort By" />
                  <div className="divide-y divide-border-muted">
                    {COMPLEX_SORT_OPTIONS.map((option) => {
                      const isSelected = sortValue === option.value;
                      return (
                        <button
                          className={`flex h-12 w-full cursor-pointer items-center justify-between px-4 active:text-muted-foreground ${
                            isSelected
                              ? "font-medium text-primary"
                              : "text-muted-foreground"
                          }`}
                          key={option.value}
                          onClick={() => setSortValue(option.value)}
                        >
                          <span className="text-sm">{option.label}</span>
                          {isSelected && (
                            <Check className="size-4 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <DrawerFooter>
                    <Button className="w-full" onClick={handleApply}>
                      Apply
                    </Button>
                  </DrawerFooter>
                </StepperStep>
              </StepperContent>
            </Stepper>
          </div>
        </DrawerContent>
      </Drawer>
      {applied && (
        <p className="text-muted-foreground text-sm">
          Applied: {selectedProviders.length} providers &middot; {sortValue}{" "}
          &middot; {showBlocked ? "showing blocked" : "hiding blocked"}
        </p>
      )}
    </div>
  );
}

export const ComplexFilter: Story = {
  name: "Complex Filter",
  render: () => <ComplexFilterDrawerDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "A realistic filter drawer combining multiple patterns: menu items with left icons, a searchable scrollable checkbox list (Providers), a checkmark-based single-select (Sort By), and an inline toggle (Show Blocked). Demonstrates icons, search filtering, overflow scrolling, and mixed control types within a single drill-down drawer.",
      },
    },
  },
};

// =============================================================================
// Providers (Scrollable with Search)
// =============================================================================
const ALL_PROVIDERS = [
  "1spin4win",
  "Apparat Gaming",
  "BGaming",
  "Betsoft Gaming",
  "Booming Games",
  "Clawbuster",
  "Evolution",
  "Evoplay Entertainment",
  "Hacksaw Gaming",
  "NetEnt",
  "Nolimit City",
  "Pragmatic Play",
  "Push Gaming",
  "Red Tiger",
  "Relax Gaming",
  "Spribe",
  "Thunderkick",
  "Wazdan",
  "Yggdrasil",
];

function ProvidersDrawerDemo() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([
    "BGaming",
    "Evolution",
  ]);
  const [search, setSearch] = React.useState("");
  const [applied, setApplied] = React.useState(false);

  const toggleProvider = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const filtered = ALL_PROVIDERS.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = () => {
    setApplied(true);
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Drawer
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setSearch("");
          }
        }}
        open={open}
      >
        <DrawerTrigger render={<Button variant="outline" />}>
          <LayoutGrid className="size-4" />
          Providers
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle className="text-center">Providers</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  value={search}
                />
              </div>
            </div>
            <div className="no-scrollbar max-h-[50vh] overflow-y-auto">
              <div className="divide-y divide-border-muted">
                {filtered.map((provider) => (
                  <label
                    className="flex h-12 cursor-pointer items-center gap-3 px-4"
                    key={provider}
                  >
                    <Checkbox
                      checked={selected.includes(provider)}
                      onCheckedChange={() => toggleProvider(provider)}
                    />
                    <span className="text-sm">{provider}</span>
                  </label>
                ))}
                {filtered.length === 0 && (
                  <div className="flex h-12 items-center px-4 text-muted-foreground text-sm">
                    No providers found.
                  </div>
                )}
              </div>
            </div>
            <DrawerFooter>
              <Button className="w-full" onClick={handleApply}>
                Apply
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
      {applied && (
        <p className="text-muted-foreground text-sm">
          Selected: {selected.join(", ") || "None"}
        </p>
      )}
    </div>
  );
}

export const Providers: Story = {
  name: "Providers",
  render: () => <ProvidersDrawerDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "A single-level scrollable drawer with a search input and a long list of checkboxes. Demonstrates overflow handling, real-time search filtering, and multi-select within a drawer.",
      },
    },
  },
};
