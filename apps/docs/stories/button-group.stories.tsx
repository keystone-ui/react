import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@keystone/ui/button";
import { ButtonGroup } from "@keystone/ui/button-group";
import { Input } from "@keystone/ui/input";
import { Textarea } from "@keystone/ui/textarea";
import { Field, FieldLabel, FieldDescription } from "@keystone/ui/field";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@keystone/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@keystone/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@keystone/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@keystone/ui/input-group";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikethroughIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Bot as BotIcon,
  Archive as ArchiveIcon,
  Flag as FlagIcon,
  Search as SearchIcon,
  AlertTriangle as AlertTriangleIcon,
  Check as CheckIcon,
  Copy as CopyIcon,
  Share as ShareIcon,
  Trash as TrashIcon,
  UserRoundX as UserRoundXIcon,
  VolumeOff as VolumeOffIcon,
  AudioLines as AudioLinesIcon,
  Minus as MinusIcon,
  Plus as PlusIcon,
  Star as StarIcon,
  GitFork as GitForkIcon,
  GitMerge as GitMergeIcon,
  GitPullRequestArrow as GitPullRequestArrowIcon,
  GitBranch as GitBranchIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Ellipsis as EllipsisIcon,
  Globe as GlobeIcon,
  List as ListIcon,
  LayoutGrid as LayoutGridIcon,
  ThumbsUp as ThumbsUpIcon,
  Pin as PinIcon,
} from "lucide-react";

const meta = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    docs: {
      description: {
        component: `
# ButtonGroup

A component for grouping buttons and inputs together with shared borders.

Use \`ButtonGroup\` when you want multiple elements to appear as a single unit with connected borders.

## Components

- \`ButtonGroup\` - Container that removes borders between children and adds a subtle auto-separator between adjacent buttons

## Basic Usage

\`\`\`tsx
import { Button } from "@keystone/ui/button";
import { ButtonGroup } from "@keystone/ui/button-group";

<ButtonGroup>
  <Button variant="outline">Left</Button>
  <Button variant="outline">Center</Button>
  <Button variant="outline">Right</Button>
</ButtonGroup>
\`\`\`

## With Input

\`\`\`tsx
import { Button } from "@keystone/ui/button";
import { ButtonGroup } from "@keystone/ui/button-group";
import { Input } from "@keystone/ui/input";
import { Search } from "lucide-react";

<ButtonGroup>
  <Input placeholder="Search..." />
  <Button variant="outline">
    <Search />
  </Button>
</ButtonGroup>
\`\`\`

## Accessibility

- \`ButtonGroup\` renders with \`role="group"\` to convey the grouping to assistive technologies.
- Use \`aria-label\` or \`aria-labelledby\` to provide an accessible name for the group.
- Tab navigates between focusable children (buttons, inputs) in DOM order.

\`\`\`tsx
<ButtonGroup aria-label="Text formatting">
  <Button variant="outline" size="icon" aria-label="Bold"><BoldIcon /></Button>
  <Button variant="outline" size="icon" aria-label="Italic"><ItalicIcon /></Button>
</ButtonGroup>
\`\`\`
`,
      },
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

// ── Core ──────────────────────────────────────────────────────────

// Basic
export const Basic: Story = {
  name: "Basic",
  render: () => (
    <ButtonGroup>
      <Button variant="outline">
        <ListIcon /> List
      </Button>
      <Button variant="outline">
        <LayoutGridIcon /> Grid
      </Button>
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A view switcher using icon + text buttons. A subtle separator is automatically rendered between adjacent buttons.",
      },
    },
  },
};

// Non-Outline Variants
export const NonOutlineVariants: Story = {
  name: "Non-Outline Variants",
  render: () => (
    <div className="flex flex-col items-start gap-8">
      <ButtonGroup>
        <Button variant="secondary">
          <ImageIcon /> Photos
        </Button>
        <Button variant="secondary">
          <VideoIcon /> Videos
        </Button>
        <Button variant="secondary" size="icon" aria-label="More">
          <EllipsisIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button>
          <GlobeIcon /> Search
        </Button>
        <Button>
          <PlusIcon /> Add
        </Button>
        <Button>
          <TrashIcon /> Delete
        </Button>
      </ButtonGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The auto separator works across all variants. No extra markup needed.",
      },
    },
  },
};

// Vertical Orientation
export const Vertical: Story = {
  name: "Vertical",
  render: () => (
    <div className="flex items-start gap-8">
      <ButtonGroup orientation="vertical">
        <Button variant="outline">Top</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Bottom</Button>
      </ButtonGroup>
      <ButtonGroup
        orientation="vertical"
        aria-label="Quantity controls"
        className="h-fit"
      >
        <Button variant="outline" size="icon">
          <PlusIcon />
        </Button>
        <Button variant="outline" size="icon">
          <MinusIcon />
        </Button>
      </ButtonGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Set the `orientation` prop to `\"vertical\"` to stack buttons vertically. Works with both text and icon buttons.",
      },
    },
  },
};

// Sizes
export const Sizes: Story = {
  name: "Sizes",
  render: () => (
    <div className="flex flex-col items-start gap-8">
      <ButtonGroup>
        <Button variant="outline" size="sm">
          <CopyIcon /> Copy
        </Button>
        <Button variant="outline" size="sm">
          <ShareIcon /> Share
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="More">
          <EllipsisIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">
          <CopyIcon /> Copy
        </Button>
        <Button variant="outline">
          <ShareIcon /> Share
        </Button>
        <Button variant="outline" size="icon" aria-label="More">
          <EllipsisIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="lg">
          <CopyIcon /> Copy
        </Button>
        <Button variant="outline" size="lg">
          <ShareIcon /> Share
        </Button>
        <Button variant="outline" size="icon-lg" aria-label="More">
          <EllipsisIcon />
        </Button>
      </ButtonGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Control the size of buttons using the `size` prop on individual buttons. Use matching icon sizes (`icon-sm`, `icon`, `icon-lg`) for icon-only buttons.",
      },
    },
  },
};

// ── Patterns ──────────────────────────────────────────────────────

// Toolbar
export const Toolbar: Story = {
  name: "Toolbar",
  render: () => (
    <ButtonGroup aria-label="Text formatting">
      <Button variant="outline" size="icon" aria-label="Bold">
        <BoldIcon className="size-4" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Italic">
        <ItalicIcon className="size-4" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Underline">
        <UnderlineIcon className="size-4" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Strikethrough">
        <StrikethroughIcon className="size-4" />
      </Button>
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Group icon-only buttons to create a compact toolbar. Add `aria-label` to each button for accessibility.",
      },
    },
  },
};

// Pagination
export const Pagination: Story = {
  name: "Pagination",
  render: () => (
    <div className="flex flex-col items-start gap-8">
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Previous page">
          <ChevronLeftIcon className="size-4" />
        </Button>
        <Button variant="outline">1</Button>
        <Button variant="outline">2</Button>
        <Button variant="outline">3</Button>
        <Button variant="outline" size="icon" aria-label="Next page">
          <ChevronRightIcon className="size-4" />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">
          <ChevronLeftIcon /> Previous
        </Button>
        <Button variant="outline">
          Next <ChevronRightIcon />
        </Button>
      </ButtonGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Mix icon buttons with text buttons for a compact pagination control. Also works as a simple prev/next navigator.",
      },
    },
  },
};

// Active State
function ActiveStateExample() {
  const [active, setActive] = useState("day");
  const options = ["Day", "Week", "Month", "Year"];
  return (
    <ButtonGroup aria-label="Date range">
      {options.map((option) => (
        <Button
          key={option}
          variant={active === option.toLowerCase() ? "default" : "outline"}
          onClick={() => setActive(option.toLowerCase())}
        >
          {option}
        </Button>
      ))}
    </ButtonGroup>
  );
}

export const ActiveState: Story = {
  name: "Active State",
  render: () => <ActiveStateExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Indicate the active selection by toggling between `variant=\"default\"` and `variant=\"outline\"`. For a true segmented control with built-in state, consider using the Tabs component instead.",
      },
    },
  },
};

// Split Button
export const SplitButton: Story = {
  name: "Split Button",
  render: () => (
    <div className="flex flex-col items-start gap-8">
      {/* GitHub-style merge pull request */}
      <ButtonGroup>
        <Button>
          <GitMergeIcon /> Merge pull request
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon" aria-label="Merge options">
                <ChevronDownIcon className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <GitMergeIcon className="size-4" />
                <span>
                  <span className="font-medium">Create a merge commit</span>
                  <span className="text-muted-foreground block text-xs">
                    All commits will be added to the base branch.
                  </span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GitPullRequestArrowIcon className="size-4" />
                <span>
                  <span className="font-medium">Squash and merge</span>
                  <span className="text-muted-foreground block text-xs">
                    Commits will be combined into one commit.
                  </span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GitBranchIcon className="size-4" />
                <span>
                  <span className="font-medium">Rebase and merge</span>
                  <span className="text-muted-foreground block text-xs">
                    Commits will be rebased onto the base branch.
                  </span>
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>

      {/* Secondary split button */}
      <ButtonGroup>
        <Button variant="secondary">
          <PinIcon /> Pin issue
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon" variant="secondary" aria-label="More options">
                <ChevronDownIcon className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <PinIcon className="size-4" />
                Pin issue
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ThumbsUpIcon className="size-4" />
                Add reaction
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <TrashIcon className="size-4" />
                Delete issue
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Pair a primary action with a dropdown trigger. The auto separator visually divides the two actions while keeping them grouped. Shown here with a GitHub-style merge pull request flow and a secondary action variant.",
      },
    },
  },
};

// ── Composition ───────────────────────────────────────────────────

// With Input
export const WithInput: Story = {
  name: "With Input",
  render: () => (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button variant="outline" aria-label="Search">
        <SearchIcon className="size-4" />
      </Button>
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Combine an `Input` with a `Button` to create a search bar or inline form control.",
      },
    },
  },
};

// Nested
export const Nested: Story = {
  name: "Nested",
  render: () => (
    <div className="flex flex-col items-start gap-8">
      <ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="icon" aria-label="Go back">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline">
            <ArchiveIcon className="size-4" />
            Archive
          </Button>
          <Button variant="outline">
            <FlagIcon className="size-4" />
            Report
          </Button>
        </ButtonGroup>
      </ButtonGroup>
      <ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="icon">
            <PlusIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <InputGroup>
            <InputGroupInput placeholder="Send a message..." />
            <InputGroupAddon align="inline-end">
              <AudioLinesIcon className="size-4" />
            </InputGroupAddon>
          </InputGroup>
        </ButtonGroup>
      </ButtonGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Nest `<ButtonGroup>` components to create button groups with spacing between them. Each nested group maintains connected borders within, while the parent adds a gap between groups.",
      },
    },
  },
};

// With Dropdown Menu
export const WithDropdownMenu: Story = {
  name: "With Dropdown Menu",
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      {/* GitHub-style repo actions */}
      <ButtonGroup>
        <Button variant="outline">
          <StarIcon /> Star
        </Button>
        <Button variant="outline">1.2k</Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button variant="outline">
          <GitForkIcon /> Fork
        </Button>
        <Button variant="outline">342</Button>
      </ButtonGroup>

      {/* Follow with dropdown */}
      <ButtonGroup>
        <Button variant="outline">
          <CheckIcon /> Following
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon">
                <ChevronDownIcon className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <VolumeOffIcon className="size-4" />
                Mute Conversation
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlertTriangleIcon className="size-4" />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserRoundXIcon className="size-4" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Pair a button with a `DropdownMenu` trigger for a split-action pattern. Shown here with GitHub-style repo actions (Star with count, Fork with count) and a Follow button with options.",
      },
    },
  },
};

// With Select
const CURRENCIES = [
  { label: "US Dollar", value: "$" },
  { label: "Euro", value: "€" },
  { label: "British Pound", value: "£" },
];

function SelectExample() {
  const [currency, setCurrency] = useState("$");
  return (
    <ButtonGroup>
      <ButtonGroup>
        <Select
          items={CURRENCIES}
          value={currency}
          onValueChange={(value) => value && setCurrency(value)}
        >
          <SelectTrigger className="font-mono">{currency}</SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              {CURRENCIES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.value}{" "}
                  <span className="text-muted-foreground">{item.label}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input placeholder="10.00" pattern="[0-9]*" />
      </ButtonGroup>
      <ButtonGroup>
        <Button aria-label="Send" size="icon" variant="outline">
          <ArrowRightIcon className="size-4" />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}

export const WithSelect: Story = {
  name: "With Select",
  render: () => <SelectExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Combine a `Select` with an `Input` and action button for inline composite controls like a currency input.",
      },
    },
  },
};

// With Popover
export const WithPopover: Story = {
  name: "With Popover",
  render: () => (
    <ButtonGroup>
      <Button variant="outline">
        <BotIcon className="size-4" />
        Copilot
      </Button>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="icon" aria-label="Open Popover">
              <ChevronDownIcon className="size-4" />
            </Button>
          }
        />
        <PopoverContent align="end" className="rounded-xl text-sm">
          <PopoverHeader>
            <PopoverTitle>Start a new task with Copilot</PopoverTitle>
            <PopoverDescription>
              Describe your task in natural language.
            </PopoverDescription>
          </PopoverHeader>
          <Field>
            <FieldLabel htmlFor="task" className="sr-only">
              Task Description
            </FieldLabel>
            <Textarea
              id="task"
              placeholder="I need to..."
              className="resize-none"
            />
            <FieldDescription>
              Copilot will open a pull request for review.
            </FieldDescription>
          </Field>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Pair a button with a `Popover` trigger for inline forms or contextual content.",
      },
    },
  },
};

// With InputGroup
function InputGroupExample() {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  return (
    <ButtonGroup className="[--radius:9999rem]">
      <ButtonGroup>
        <Button variant="outline" size="icon">
          <PlusIcon className="size-4" />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <InputGroup>
          <InputGroupInput
            placeholder={
              voiceEnabled ? "Record and send audio..." : "Send a message..."
            }
            disabled={voiceEnabled}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              size="icon-xs"
              data-active={voiceEnabled}
              className="data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 dark:data-[active=true]:bg-orange-800 dark:data-[active=true]:text-orange-100"
              aria-pressed={voiceEnabled}
              aria-label="Voice Mode"
            >
              <AudioLinesIcon className="size-4" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </ButtonGroup>
    </ButtonGroup>
  );
}

export const WithInputGroup: Story = {
  name: "With InputGroup",
  render: () => <InputGroupExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Combine `ButtonGroup` with `InputGroup` for rich composite controls. This example uses `[--radius:9999rem]` for a pill shape and an `InputGroupButton` for an inline toggle.",
      },
    },
  },
};

// All Examples Grid
export const AllExamples: Story = {
  name: "All Examples",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-sm font-medium mb-2">Basic</h3>
        <ButtonGroup>
          <Button variant="outline">
            <ListIcon /> List
          </Button>
          <Button variant="outline">
            <LayoutGridIcon /> Grid
          </Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Non-Outline Variants</h3>
        <ButtonGroup>
          <Button variant="secondary">
            <ImageIcon /> Photos
          </Button>
          <Button variant="secondary">
            <VideoIcon /> Videos
          </Button>
          <Button variant="secondary" size="icon" aria-label="More">
            <EllipsisIcon />
          </Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Toolbar</h3>
        <ButtonGroup aria-label="Text formatting">
          <Button variant="outline" size="icon" aria-label="Bold">
            <BoldIcon className="size-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Italic">
            <ItalicIcon className="size-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Underline">
            <UnderlineIcon className="size-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Strikethrough">
            <StrikethroughIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Pagination</h3>
        <ButtonGroup>
          <Button variant="outline" size="icon" aria-label="Previous page">
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button variant="outline">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline" size="icon" aria-label="Next page">
            <ChevronRightIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Active State</h3>
        <ActiveStateExample />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Split Button</h3>
        <ButtonGroup>
          <Button>
            <GitMergeIcon /> Merge pull request
          </Button>
          <Button size="icon" aria-label="Merge options">
            <ChevronDownIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Vertical</h3>
        <div className="flex items-start gap-4">
          <ButtonGroup orientation="vertical">
            <Button variant="outline">Top</Button>
            <Button variant="outline">Middle</Button>
            <Button variant="outline">Bottom</Button>
          </ButtonGroup>
          <ButtonGroup
            orientation="vertical"
            aria-label="Quantity controls"
            className="h-fit"
          >
            <Button variant="outline" size="icon">
              <PlusIcon />
            </Button>
            <Button variant="outline" size="icon">
              <MinusIcon />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Sizes</h3>
        <div className="flex flex-col items-start gap-4">
          <ButtonGroup>
            <Button variant="outline" size="sm">
              <CopyIcon /> Copy
            </Button>
            <Button variant="outline" size="sm">
              <ShareIcon /> Share
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="More">
              <EllipsisIcon />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline">
              <CopyIcon /> Copy
            </Button>
            <Button variant="outline">
              <ShareIcon /> Share
            </Button>
            <Button variant="outline" size="icon" aria-label="More">
              <EllipsisIcon />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline" size="lg">
              <CopyIcon /> Copy
            </Button>
            <Button variant="outline" size="lg">
              <ShareIcon /> Share
            </Button>
            <Button variant="outline" size="icon-lg" aria-label="More">
              <EllipsisIcon />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">With Input</h3>
        <ButtonGroup>
          <Input placeholder="Search..." />
          <Button variant="outline" aria-label="Search">
            <SearchIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Nested</h3>
        <ButtonGroup>
          <ButtonGroup>
            <Button variant="outline" size="icon" aria-label="Go back">
              <ArrowLeftIcon className="size-4" />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline">
              <ArchiveIcon className="size-4" />
              Archive
            </Button>
            <Button variant="outline">
              <FlagIcon className="size-4" />
              Report
            </Button>
          </ButtonGroup>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">With Dropdown Menu</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonGroup>
            <Button variant="outline">
              <StarIcon /> Star
            </Button>
            <Button variant="outline">1.2k</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline">
              <GitForkIcon /> Fork
            </Button>
            <Button variant="outline">342</Button>
          </ButtonGroup>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">With Select</h3>
        <SelectExample />
      </div>
    </div>
  ),
};
