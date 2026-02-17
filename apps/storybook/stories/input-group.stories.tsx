import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from "keystoneui/avatar";
import { Badge } from "keystoneui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "keystoneui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "keystoneui/dropdown-menu";
import { Field, FieldLabel } from "keystoneui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "keystoneui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "keystoneui/popover";
import { Switch } from "keystoneui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "keystoneui/tooltip";
import {
  ArrowUpIcon,
  AtSignIcon,
  BookOpenIcon,
  Check as CheckIcon,
  CirclePlusIcon,
  Copy as CopyIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  GlobeIcon,
  LayoutGridIcon,
  Loader2 as LoaderIcon,
  Mail as MailIcon,
  PaperclipIcon,
  PlusIcon,
  Search as SearchIcon,
  SendHorizonal as SendIcon,
  X as XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/InputGroup",
  component: InputGroup,
  parameters: {
    docs: {
      description: {
        component: `
# InputGroup

A flexible input component that supports various adornments like icons, text, and buttons.

## New API (shadcn-style)

The InputGroup now uses an \`align\` prop instead of \`position\` + \`variant\`:

- \`align="inline-start"\` - Left side of input (horizontal)
- \`align="inline-end"\` - Right side of input (horizontal)
- \`align="block-start"\` - Above input (vertical)
- \`align="block-end"\` - Below input (vertical)

## Components

- \`InputGroup\` - Container with border and focus states
- \`InputGroupAddon\` - Adornment container with alignment
- \`InputGroupInput\` - Specialized input (border/shadow removed)
- \`InputGroupButton\` - Button with size variants (xs, sm, icon-xs, icon-sm)
- \`InputGroupText\` - Text wrapper for icons/text

## Basic Usage

\`\`\`tsx
import { InputGroup, InputGroupAddon, InputGroupInput } from "keystoneui/input-group";
import { Search } from "lucide-react";

<InputGroup>
  <InputGroupAddon>
    <Search />
  </InputGroupAddon>
  <InputGroupInput placeholder="Search..." />
</InputGroup>
\`\`\`
`,
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
      description: "The size of the input group",
    },
  },
  subcomponents: {
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof InputGroup>;

// Basic Icon Addon
export const BasicIconAddon: Story = {
  name: "Basic Icon Addon",
  render: () => (
    <div className="max-w-sm">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon className="size-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Search...");
    await expect(input).toBeInTheDocument();

    await userEvent.type(input, "hello world");
    await expect(input).toHaveValue("hello world");
  },
};

// Text Prefix
export const TextPrefix: Story = {
  name: "Text Prefix",
  render: () => (
    <div className="max-w-sm">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>
    </div>
  ),
};

// Text Suffix
export const TextSuffix: Story = {
  name: "Text Suffix",
  render: () => (
    <div className="max-w-sm">
      <InputGroup>
        <InputGroupInput placeholder="username" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>@gmail.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

// Currency Input
export const CurrencyInput: Story = {
  name: "Currency Input",
  render: () => (
    <div className="max-w-sm">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="0.00" type="number" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

// With Button
export const WithButton: Story = {
  name: "With Button",
  render: () => (
    <div className="max-w-sm">
      <InputGroup>
        <InputGroupInput placeholder="Enter code" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs">
            <CopyIcon className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

// Password Toggle
export const PasswordToggle: Story = {
  name: "Password Toggle",
  render: () => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="max-w-sm">
        <InputGroup>
          <InputGroupInput
            placeholder="Password"
            type={showPassword ? "text" : "password"}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              size="icon-xs"
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    );
  },
};

// Search with Results Count
export const SearchWithResultsCount: Story = {
  name: "Search with Results Count",
  render: () => (
    <div className="max-w-sm">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon className="size-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <InputGroupText className="text-xs">12 results</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

// Search with Keyboard Shortcut
export const SearchWithKeyboardShortcut: Story = {
  name: "Search with Keyboard Shortcut",
  render: () => (
    <div className="max-w-sm">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon className="size-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search..." type="search" />
        <InputGroupAddon align="inline-end">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-sm border bg-muted px-1.5 font-medium font-mono text-[10px]">
            <span className="text-xs">⌘</span>K
          </kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

// Clear Button
export const ClearButton: Story = {
  name: "Clear Button",
  render: () => {
    const [value, setValue] = useState("Click to clear");
    return (
      <div className="max-w-sm">
        <InputGroup>
          <InputGroupInput
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type something..."
            value={value}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Clear input"
              disabled={!value}
              onClick={() => setValue("")}
              size="icon-xs"
            >
              <XIcon className="size-4" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    );
  },
};

// Email Input
export const EmailInput: Story = {
  name: "Email Input",
  render: () => (
    <div className="max-w-sm">
      <InputGroup>
        <InputGroupAddon>
          <MailIcon className="size-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="you@example.com" type="email" />
      </InputGroup>
    </div>
  ),
};

// Button Sizes
export const ButtonSizes: Story = {
  name: "Button Sizes",
  render: () => (
    <div className="max-w-sm space-y-4">
      <div>
        <p className="mb-2 text-muted-foreground text-sm">Size: xs (default)</p>
        <InputGroup>
          <InputGroupInput placeholder="Enter value" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="xs">Copy</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div>
        <p className="mb-2 text-muted-foreground text-sm">Size: sm</p>
        <InputGroup>
          <InputGroupInput placeholder="Enter value" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="sm">Copy</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div>
        <p className="mb-2 text-muted-foreground text-sm">Size: icon-xs</p>
        <InputGroup>
          <InputGroupInput placeholder="Enter value" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs">
              <CopyIcon className="size-4" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div>
        <p className="mb-2 text-muted-foreground text-sm">Size: icon-sm</p>
        <InputGroup>
          <InputGroupInput placeholder="Enter value" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-sm">
              <CopyIcon className="size-4" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  ),
};

// Block Layout (Vertical)
export const BlockLayout: Story = {
  name: "Block Layout (Vertical)",
  render: () => (
    <div className="max-w-sm space-y-4">
      <div>
        <p className="mb-2 text-muted-foreground text-sm">
          Label above (block-start)
        </p>
        <InputGroup>
          <InputGroupAddon align="block-start">
            <InputGroupText>Email address</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="you@example.com" />
        </InputGroup>
      </div>
      <div>
        <p className="mb-2 text-muted-foreground text-sm">
          Helper below (block-end)
        </p>
        <InputGroup>
          <InputGroupInput placeholder="Username" />
          <InputGroupAddon align="block-end">
            <InputGroupText className="text-muted-foreground text-xs">
              Must be 3-20 characters
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  ),
};

// Loading Spinner
export const LoadingSpinner: Story = {
  name: "Loading Spinner",
  render: () => (
    <div className="max-w-sm space-y-4">
      <InputGroup>
        <InputGroupInput placeholder="Searching..." />
        <InputGroupAddon align="inline-end">
          <LoaderIcon className="size-4 animate-spin" />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <LoaderIcon className="size-4 animate-spin" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Processing..." />
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Saving changes..." />
        <InputGroupAddon align="inline-end">
          <InputGroupText className="text-muted-foreground text-xs">
            Saving...
          </InputGroupText>
          <LoaderIcon className="size-4 animate-spin" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Show a loading spinner inside the input to indicate processing or searching.",
      },
    },
  },
};

// Copy to Clipboard
export const CopyToClipboard: Story = {
  name: "Copy to Clipboard",
  render: () => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText("https://example.com/api/key");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    return (
      <div className="max-w-sm">
        <InputGroup>
          <InputGroupInput readOnly value="https://example.com/api/key" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Copy to clipboard"
              onClick={handleCopy}
              size="icon-xs"
            >
              {isCopied ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "A copy button that shows visual feedback when content is copied to clipboard.",
      },
    },
  },
};

// With Select Dropdown
export const WithSelectDropdown: Story = {
  name: "With Select Dropdown",
  render: () => (
    <div className="max-w-sm">
      <InputGroup>
        <InputGroupAddon>
          <select className="h-full border-0 bg-transparent text-muted-foreground text-sm focus:outline-none focus:ring-0">
            <option>https://</option>
            <option>http://</option>
            <option>ftp://</option>
          </select>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Combine a native select dropdown with the input for protocol or prefix selection.",
      },
    },
  },
};

// Textarea
export const WithTextarea: Story = {
  name: "Textarea",
  render: () => (
    <div className="max-w-sm">
      <InputGroup>
        <InputGroupTextarea placeholder="Write a message..." rows={3} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Send" size="icon-xs">
            <SendIcon className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `InputGroupTextarea` instead of `InputGroupInput` for multiline text. The container automatically expands to fit.",
      },
    },
  },
};

// Prompt Form
const PROMPT_MENTIONABLE = [
  { type: "page", title: "Meeting Notes", image: "📝" },
  { type: "page", title: "Project Dashboard", image: "📊" },
  { type: "page", title: "Ideas & Brainstorming", image: "💡" },
  { type: "page", title: "Calendar & Events", image: "📅" },
  { type: "page", title: "Documentation", image: "📚" },
  {
    type: "user",
    title: "shadcn",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face",
    workspace: "Workspace",
  },
  {
    type: "user",
    title: "maxleiter",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    workspace: "Workspace",
  },
  {
    type: "user",
    title: "evilrabbit",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    workspace: "Workspace",
  },
] as const;

const PROMPT_MODELS = [
  { name: "Auto" },
  { name: "Agent Mode", badge: "Beta" },
  { name: "Plan Mode" },
] as const;

function PromptMentionIcon({
  item,
}: {
  item: (typeof PROMPT_MENTIONABLE)[number];
}) {
  return item.type === "page" ? (
    <span className="flex size-4 items-center justify-center">
      {item.image}
    </span>
  ) : (
    <Avatar className="size-4">
      <AvatarImage src={item.image} />
      <AvatarFallback>{item.title[0]}</AvatarFallback>
    </Avatar>
  );
}

export const PromptForm: Story = {
  name: "Prompt Form",
  render() {
    const [mentions, setMentions] = useState<string[]>([]);
    const [mentionPopoverOpen, setMentionPopoverOpen] = useState(false);
    const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(PROMPT_MODELS[0]);
    const [scopeMenuOpen, setScopeMenuOpen] = useState(false);

    const grouped = useMemo(() => {
      return PROMPT_MENTIONABLE.reduce(
        (acc, item) => {
          if (!mentions.includes(item.title)) {
            if (!acc[item.type]) {
              acc[item.type] = [];
            }
            acc[item.type].push(item);
          }
          return acc;
        },
        {} as Record<string, (typeof PROMPT_MENTIONABLE)[number][]>
      );
    }, [mentions]);

    const hasMentions = mentions.length > 0;

    return (
      <form className="w-full max-w-lg">
        <Field>
          <FieldLabel className="sr-only" htmlFor="prompt-story">
            Prompt
          </FieldLabel>
          <InputGroup className="rounded-xl">
            <InputGroupTextarea
              className="py-2!"
              id="prompt-story"
              placeholder="Ask, search, or make anything..."
            />
            <InputGroupAddon align="block-start" className="px-2.5 pt-3">
              <Popover
                onOpenChange={setMentionPopoverOpen}
                open={mentionPopoverOpen}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger
                      render={
                        <InputGroupButton
                          className="transition-transform"
                          size={hasMentions ? "icon-sm" : "sm"}
                          variant="outline"
                        />
                      }
                    >
                      <AtSignIcon /> {!hasMentions && "Add context"}
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    Mention a person, page, or date
                  </TooltipContent>
                </Tooltip>
                <PopoverContent align="start" className="p-0">
                  <Command>
                    <CommandInput placeholder="Search pages..." />
                    <CommandList>
                      <CommandEmpty>No pages found</CommandEmpty>
                      {Object.entries(grouped).map(([type, items]) => (
                        <CommandGroup
                          heading={type === "page" ? "Pages" : "Users"}
                          key={type}
                        >
                          {items.map((item) => (
                            <CommandItem
                              className="rounded-lg"
                              key={item.title}
                              onSelect={(v) => {
                                setMentions((prev) => [...prev, v]);
                                setMentionPopoverOpen(false);
                              }}
                              value={item.title}
                            >
                              <PromptMentionIcon item={item} />
                              {item.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="no-scrollbar -m-1.5 flex gap-1 overflow-y-auto p-1.5">
                {mentions.map((mention) => {
                  const item = PROMPT_MENTIONABLE.find(
                    (i) => i.title === mention
                  );
                  if (!item) {
                    return null;
                  }
                  return (
                    <InputGroupButton
                      className="rounded-full pl-2!"
                      key={mention}
                      onClick={() =>
                        setMentions((prev) => prev.filter((m) => m !== mention))
                      }
                      size="sm"
                      variant="secondary"
                    >
                      <PromptMentionIcon item={item} />
                      {item.title}
                      <XIcon />
                    </InputGroupButton>
                  );
                })}
              </div>
            </InputGroupAddon>
            <InputGroupAddon
              align="block-end"
              className="gap-1 px-2.5 pt-1.5 pb-2"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <InputGroupButton
                    aria-label="Attach file"
                    className="rounded-full"
                    size="icon-sm"
                  >
                    <PaperclipIcon />
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>
              <DropdownMenu
                onOpenChange={setModelPopoverOpen}
                open={modelPopoverOpen}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger
                      render={
                        <InputGroupButton className="rounded-full" size="sm" />
                      }
                    >
                      {selectedModel.name}
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Select AI model</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="start" className="w-48" side="top">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-muted-foreground text-xs">
                      Select Agent Mode
                    </DropdownMenuLabel>
                    {PROMPT_MODELS.map((model) => (
                      <DropdownMenuCheckboxItem
                        checked={model.name === selectedModel.name}
                        key={model.name}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedModel(model);
                          }
                        }}
                      >
                        {model.name}
                        {"badge" in model && model.badge && (
                          <Badge
                            className="ml-auto h-5 rounded-sm px-1 text-xs"
                            variant="secondary"
                          >
                            {model.badge}
                          </Badge>
                        )}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu
                onOpenChange={setScopeMenuOpen}
                open={scopeMenuOpen}
              >
                <DropdownMenuTrigger
                  render={
                    <InputGroupButton className="rounded-full" size="sm" />
                  }
                >
                  <GlobeIcon /> All Sources
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72" side="top">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="justify-between"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="flex items-center gap-1.5">
                        <GlobeIcon className="size-4" /> Web Search
                      </span>
                      <Switch defaultChecked />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="justify-between"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="flex items-center gap-1.5">
                        <LayoutGridIcon className="size-4" /> Apps and
                        Integrations
                      </span>
                      <Switch defaultChecked />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CirclePlusIcon /> All Sources I can access
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Avatar className="size-4">
                          <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        shadcn
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-72 p-0">
                        <Command>
                          <CommandInput placeholder="Find or use knowledge in..." />
                          <CommandList>
                            <CommandEmpty>No knowledge found</CommandEmpty>
                            <CommandGroup>
                              {PROMPT_MENTIONABLE.filter(
                                (item) => item.type === "user"
                              ).map((user) => (
                                <CommandItem
                                  key={user.title}
                                  value={user.title}
                                >
                                  <Avatar className="size-4">
                                    <AvatarImage src={user.image} />
                                    <AvatarFallback>
                                      {user.title[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  {user.title}{" "}
                                  <span className="text-muted-foreground">
                                    - {user.workspace}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem>
                      <BookOpenIcon /> Help Center
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <PlusIcon /> Connect Apps
                    </DropdownMenuItem>
                    <DropdownMenuLabel className="text-muted-foreground text-xs">
                      We&apos;ll only search in the sources selected here.
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <InputGroupButton
                aria-label="Send"
                className="ml-auto rounded-full"
                size="icon-sm"
                variant="default"
              >
                <ArrowUpIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "A rich AI prompt form combining InputGroup with Command, Popover, DropdownMenu, Avatar, Badge, Switch, and Tooltip for a Notion-style chat interface.",
      },
    },
  },
};
