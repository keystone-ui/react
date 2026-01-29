import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { 
  InputGroup, 
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  InputGroupText,
  Button,
  Kbd,
  KbdGroup,
} from "@acme/ui";
import {
  Mail as MailIcon,
  Search as SearchIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Send as SendIcon,
  X as XIcon,
  Copy as CopyIcon,
  DollarSign as DollarSignIcon,
} from "lucide-react";

const meta = {
  title: "Components/Input/Group",
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
import { InputGroup, InputGroupAddon, InputGroupInput } from "@acme/ui";
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

// All Examples Grid
export const AllExamples: Story = {
  name: "All Examples",
  render: () => {
    const [showPassword, setShowPassword] = useState(false);
    const [clearValue, setClearValue] = useState("Click to clear");
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Icon Prefix</h3>
          <InputGroup>
            <InputGroupAddon>
              <MailIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Email" />
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Icon Suffix</h3>
          <InputGroup>
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon align="inline-end">
              <SearchIcon className="size-4" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Text Prefix</h3>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="example.com" />
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Text Suffix</h3>
          <InputGroup>
            <InputGroupInput placeholder="username" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>@gmail.com</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Both Sides</h3>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="0.00" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>USD</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">With Button</h3>
          <InputGroup>
            <InputGroupInput placeholder="API Key" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton>
                <CopyIcon className="size-4" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Password Toggle</h3>
          <InputGroup>
            <InputGroupInput 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Clear Input</h3>
          <InputGroup>
            <InputGroupInput 
              value={clearValue} 
              onChange={(e) => setClearValue(e.target.value)}
              placeholder="Type..." 
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={() => setClearValue("")} disabled={!clearValue}>
                <XIcon className="size-4" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Search with Shortcut</h3>
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    );
  },
};
