import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { 
  InputGroup, 
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  InputGroupText,
} from "@keystone/ui/input-group";
import {
  Mail as MailIcon,
  Search as SearchIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  X as XIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  Loader2 as LoaderIcon,
} from "lucide-react";

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
import { InputGroup, InputGroupAddon, InputGroupInput } from "@keystone/ui/input-group";
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
          <InputGroupButton>
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
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton 
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
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
        <InputGroupInput type="search" placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-sm border bg-muted px-1.5 font-mono text-[10px] font-medium">
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
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type something..." 
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton 
              onClick={() => setValue("")}
              aria-label="Clear input"
              disabled={!value}
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
        <InputGroupInput type="email" placeholder="you@example.com" />
      </InputGroup>
    </div>
  ),
};

// Button Sizes
export const ButtonSizes: Story = {
  name: "Button Sizes",
  render: () => (
    <div className="space-y-4 max-w-sm">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Size: xs (default)</p>
        <InputGroup>
          <InputGroupInput placeholder="Enter value" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="xs">Copy</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Size: sm</p>
        <InputGroup>
          <InputGroupInput placeholder="Enter value" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="sm">Copy</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Size: icon-xs</p>
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
        <p className="text-sm text-muted-foreground mb-2">Size: icon-sm</p>
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
    <div className="space-y-4 max-w-sm">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Label above (block-start)</p>
        <InputGroup>
          <InputGroupAddon align="block-start">
            <InputGroupText>Email address</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="you@example.com" />
        </InputGroup>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Helper below (block-end)</p>
        <InputGroup>
          <InputGroupInput placeholder="Username" />
          <InputGroupAddon align="block-end">
            <InputGroupText className="text-xs text-muted-foreground">
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
    <div className="space-y-4 max-w-sm">
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
          <InputGroupText className="text-muted-foreground text-xs">Saving...</InputGroupText>
          <LoaderIcon className="size-4 animate-spin" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Show a loading spinner inside the input to indicate processing or searching.",
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
          <InputGroupInput value="https://example.com/api/key" readOnly />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Copy to clipboard"
              onClick={handleCopy}
            >
              {isCopied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A copy button that shows visual feedback when content is copied to clipboard.",
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
          <select className="h-full border-0 bg-transparent text-sm focus:ring-0 focus:outline-none text-muted-foreground">
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
        story: "Combine a native select dropdown with the input for protocol or prefix selection.",
      },
    },
  },
};
