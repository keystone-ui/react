import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "keystoneui/button";
import { ButtonGroup, ButtonGroupText } from "keystoneui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "keystoneui/dropdown-menu";
import { Field, FieldDescription, FieldLabel } from "keystoneui/field";
import { Input } from "keystoneui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "keystoneui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "keystoneui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "keystoneui/select";
import { Textarea } from "keystoneui/textarea";
import {
  AlertTriangle as AlertTriangleIcon,
  Archive as ArchiveIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  AudioLines as AudioLinesIcon,
  Bold as BoldIcon,
  Bot as BotIcon,
  CalendarPlus as CalendarPlusIcon,
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Clock as ClockIcon,
  Copy as CopyIcon,
  Ellipsis as EllipsisIcon,
  Flag as FlagIcon,
  GitBranch as GitBranchIcon,
  GitFork as GitForkIcon,
  GitMerge as GitMergeIcon,
  GitPullRequestArrow as GitPullRequestArrowIcon,
  Globe as GlobeIcon,
  Image as ImageIcon,
  Italic as ItalicIcon,
  LayoutGrid as LayoutGridIcon,
  ListFilter as ListFilterIcon,
  List as ListIcon,
  MailCheck as MailCheckIcon,
  Minus as MinusIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Pin as PinIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  Star as StarIcon,
  Strikethrough as StrikethroughIcon,
  Tag as TagIcon,
  ThumbsUp as ThumbsUpIcon,
  Trash2 as Trash2Icon,
  Trash as TrashIcon,
  Underline as UnderlineIcon,
  UserRoundX as UserRoundXIcon,
  Video as VideoIcon,
  VolumeOff as VolumeOffIcon,
} from "lucide-react";
import { useState } from "react";

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
import { Button } from "keystoneui/button";
import { ButtonGroup } from "keystoneui/button-group";

<ButtonGroup>
  <Button variant="outline">Left</Button>
  <Button variant="outline">Center</Button>
  <Button variant="outline">Right</Button>
</ButtonGroup>
\`\`\`

## With Input

\`\`\`tsx
import { Button } from "keystoneui/button";
import { ButtonGroup } from "keystoneui/button-group";
import { Input } from "keystoneui/input";
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
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "The layout direction of the button group",
    },
  },
  subcomponents: { ButtonGroupText },
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
        <Button aria-label="More" size="icon" variant="secondary">
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
        aria-label="Quantity controls"
        className="h-fit"
        orientation="vertical"
      >
        <Button size="icon" variant="outline">
          <PlusIcon />
        </Button>
        <Button size="icon" variant="outline">
          <MinusIcon />
        </Button>
      </ButtonGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Set the `orientation` prop to `"vertical"` to stack buttons vertically. Works with both text and icon buttons.',
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
        <Button size="sm" variant="outline">
          <CopyIcon /> Copy
        </Button>
        <Button size="sm" variant="outline">
          <ShareIcon /> Share
        </Button>
        <Button aria-label="More" size="icon-sm" variant="outline">
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
        <Button aria-label="More" size="icon" variant="outline">
          <EllipsisIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button size="lg" variant="outline">
          <CopyIcon /> Copy
        </Button>
        <Button size="lg" variant="outline">
          <ShareIcon /> Share
        </Button>
        <Button aria-label="More" size="icon-lg" variant="outline">
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
      <Button aria-label="Bold" size="icon" variant="outline">
        <BoldIcon className="size-4" />
      </Button>
      <Button aria-label="Italic" size="icon" variant="outline">
        <ItalicIcon className="size-4" />
      </Button>
      <Button aria-label="Underline" size="icon" variant="outline">
        <UnderlineIcon className="size-4" />
      </Button>
      <Button aria-label="Strikethrough" size="icon" variant="outline">
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
        <Button aria-label="Previous page" size="icon" variant="outline">
          <ChevronLeftIcon className="size-4" />
        </Button>
        <Button variant="outline">1</Button>
        <Button variant="outline">2</Button>
        <Button variant="outline">3</Button>
        <Button aria-label="Next page" size="icon" variant="outline">
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
          onClick={() => setActive(option.toLowerCase())}
          variant={active === option.toLowerCase() ? "default" : "outline"}
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
          'Indicate the active selection by toggling between `variant="default"` and `variant="outline"`. For a true segmented control with built-in state, consider using the Tabs component instead.',
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
              <Button aria-label="Merge options" size="icon">
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
                  <span className="block text-muted-foreground text-xs">
                    All commits will be added to the base branch.
                  </span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GitPullRequestArrowIcon className="size-4" />
                <span>
                  <span className="font-medium">Squash and merge</span>
                  <span className="block text-muted-foreground text-xs">
                    Commits will be combined into one commit.
                  </span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GitBranchIcon className="size-4" />
                <span>
                  <span className="font-medium">Rebase and merge</span>
                  <span className="block text-muted-foreground text-xs">
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
              <Button aria-label="More options" size="icon" variant="secondary">
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
      <Button aria-label="Search" variant="outline">
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
          <Button aria-label="Go back" size="icon" variant="outline">
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
          <Button size="icon" variant="outline">
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
              <Button size="icon" variant="outline">
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
          onValueChange={(value) => value && setCurrency(value)}
          value={currency}
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
        <Input pattern="[0-9]*" placeholder="10.00" />
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
            <Button aria-label="Open Popover" size="icon" variant="outline">
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
            <FieldLabel className="sr-only" htmlFor="task">
              Task Description
            </FieldLabel>
            <Textarea
              className="resize-none"
              id="task"
              placeholder="I need to..."
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
        <Button size="icon" variant="outline">
          <PlusIcon className="size-4" />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <InputGroup>
          <InputGroupInput
            disabled={voiceEnabled}
            placeholder={
              voiceEnabled ? "Record and send audio..." : "Send a message..."
            }
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Voice Mode"
              aria-pressed={voiceEnabled}
              className="data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 dark:data-[active=true]:bg-orange-800 dark:data-[active=true]:text-orange-100"
              data-active={voiceEnabled}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              size="icon-xs"
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
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <h3 className="mb-2 font-medium text-sm">Basic</h3>
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
        <h3 className="mb-2 font-medium text-sm">Non-Outline Variants</h3>
        <ButtonGroup>
          <Button variant="secondary">
            <ImageIcon /> Photos
          </Button>
          <Button variant="secondary">
            <VideoIcon /> Videos
          </Button>
          <Button aria-label="More" size="icon" variant="secondary">
            <EllipsisIcon />
          </Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-sm">Toolbar</h3>
        <ButtonGroup aria-label="Text formatting">
          <Button aria-label="Bold" size="icon" variant="outline">
            <BoldIcon className="size-4" />
          </Button>
          <Button aria-label="Italic" size="icon" variant="outline">
            <ItalicIcon className="size-4" />
          </Button>
          <Button aria-label="Underline" size="icon" variant="outline">
            <UnderlineIcon className="size-4" />
          </Button>
          <Button aria-label="Strikethrough" size="icon" variant="outline">
            <StrikethroughIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-sm">Pagination</h3>
        <ButtonGroup>
          <Button aria-label="Previous page" size="icon" variant="outline">
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button variant="outline">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button aria-label="Next page" size="icon" variant="outline">
            <ChevronRightIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-sm">Active State</h3>
        <ActiveStateExample />
      </div>

      <div>
        <h3 className="mb-2 font-medium text-sm">Split Button</h3>
        <ButtonGroup>
          <Button>
            <GitMergeIcon /> Merge pull request
          </Button>
          <Button aria-label="Merge options" size="icon">
            <ChevronDownIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-sm">Vertical</h3>
        <div className="flex items-start gap-4">
          <ButtonGroup orientation="vertical">
            <Button variant="outline">Top</Button>
            <Button variant="outline">Middle</Button>
            <Button variant="outline">Bottom</Button>
          </ButtonGroup>
          <ButtonGroup
            aria-label="Quantity controls"
            className="h-fit"
            orientation="vertical"
          >
            <Button size="icon" variant="outline">
              <PlusIcon />
            </Button>
            <Button size="icon" variant="outline">
              <MinusIcon />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-sm">Sizes</h3>
        <div className="flex flex-col items-start gap-4">
          <ButtonGroup>
            <Button size="sm" variant="outline">
              <CopyIcon /> Copy
            </Button>
            <Button size="sm" variant="outline">
              <ShareIcon /> Share
            </Button>
            <Button aria-label="More" size="icon-sm" variant="outline">
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
            <Button aria-label="More" size="icon" variant="outline">
              <EllipsisIcon />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button size="lg" variant="outline">
              <CopyIcon /> Copy
            </Button>
            <Button size="lg" variant="outline">
              <ShareIcon /> Share
            </Button>
            <Button aria-label="More" size="icon-lg" variant="outline">
              <EllipsisIcon />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-sm">With Input</h3>
        <ButtonGroup>
          <Input placeholder="Search..." />
          <Button aria-label="Search" variant="outline">
            <SearchIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-sm">Nested</h3>
        <ButtonGroup>
          <ButtonGroup>
            <Button aria-label="Go back" size="icon" variant="outline">
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
        <h3 className="mb-2 font-medium text-sm">With Dropdown Menu</h3>
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
        <h3 className="mb-2 font-medium text-sm">With Select</h3>
        <SelectExample />
      </div>
    </div>
  ),
};

// Email Toolbar
export const EmailToolbar: Story = {
  name: "Email Toolbar",
  render() {
    const [label, setLabel] = useState("personal");

    return (
      <ButtonGroup>
        <ButtonGroup className="hidden sm:flex">
          <Button aria-label="Go Back" size="icon-sm" variant="outline">
            <ArrowLeftIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button size="sm" variant="outline">
            Archive
          </Button>
          <Button size="sm" variant="outline">
            Report
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button size="sm" variant="outline">
            Snooze
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  aria-label="More Options"
                  size="icon-sm"
                  variant="outline"
                />
              }
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <MailCheckIcon />
                  Mark as Read
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArchiveIcon />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <ClockIcon />
                  Snooze
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CalendarPlusIcon />
                  Add to Calendar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ListFilterIcon />
                  Add to List
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <TagIcon />
                    Label As...
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      onValueChange={setLabel}
                      value={label}
                    >
                      <DropdownMenuRadioItem value="personal">
                        Personal
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="work">
                        Work
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="other">
                        Other
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive">
                  <Trash2Icon />
                  Trash
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </ButtonGroup>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "An email action toolbar using nested ButtonGroups with a split dropdown containing sub-menus and radio group selection for labels.",
      },
    },
  },
};
