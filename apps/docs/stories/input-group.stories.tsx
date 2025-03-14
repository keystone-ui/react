import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { 
  Input, 
  InputGroup, 
  InputAdornment,
  Button
} from "@acme/ui";
import {
  Mail as MailIcon,
  Search as SearchIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  X as XIcon,
  Command as CommandIcon,
} from "lucide-react";

const meta = {
  title: "Components/InputGroup",
  component: InputGroup,
  parameters: {
    docs: {
      description: {
        component: `
# InputGroup

A flexible input component that supports various adornments like icons, text, buttons, and selects.

## Basic Usage

\`\`\`tsx
import { InputGroup, InputAdornment, Input } from "@acme/ui";

// Left icon adornment (with inline variant)
<InputGroup>
  <InputAdornment position="start" variant="inline">
    <MailIcon className="size-4" />
  </InputAdornment>
  <Input placeholder="Email" />
</InputGroup>

// Right icon adornment (with inline variant)
<InputGroup>
  <Input placeholder="Type message" />
  <InputAdornment position="end" variant="inline">
    <SendIcon className="size-4" />
  </InputAdornment>
</InputGroup>
\`\`\`

## Text Adornments

\`\`\`tsx
// Left text adornment (with inline variant)
<InputGroup>
  <InputAdornment position="start" variant="inline">https://</InputAdornment>
  <Input placeholder="google.com" />
</InputGroup>

// Right text adornment (with inline variant)
<InputGroup>
  <Input placeholder="google" />
  <InputAdornment position="end" variant="inline">.com</InputAdornment>
</InputGroup>

// Left and right text adornments (with inline variant)
<InputGroup>
  <InputAdornment position="start" variant="inline">€</InputAdornment>
  <Input placeholder="0.00" />
  <InputAdornment position="end" variant="inline">EUR</InputAdornment>
</InputGroup>
\`\`\`

## Box Variant (Default)

\`\`\`tsx
// Box variant is the default and adds a divider between the adornment and input
<InputGroup>
  <InputAdornment position="start">https://</InputAdornment>
  <Input placeholder="example.com" />
</InputGroup>
\`\`\`

## Button Adornments

\`\`\`tsx
// Input with end icon button
<InputGroup>
  <Input placeholder="Search..." />
  <InputAdornment position="end" variant="inline">
    <SearchIcon />
  </InputAdornment>
</InputGroup>
\`\`\`

## Nested Adornments

\`\`\`tsx
// Input with nested icon and text adornment
<InputGroup>
  <InputAdornment position="start" data-type="icon">
    <div className="flex items-center gap-1">
      <MailIcon className="size-4" />
      <span>Email:</span>
    </div>
  </InputAdornment>
  <Input placeholder="john.doe@example.com" />
</InputGroup>
\`\`\`

## Features

- Support for left and right adornments
- Box variant (default) with dividers between elements
- Inline variant for seamless appearance
- Icon integration
- Text adornments
- Button adornments
- Select adornments
- Support for nested adornments (combining icons and text)
- Consistent styling with the rest of the UI
- Clean focus styles for better accessibility
`,
      },
    },
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof InputGroup>;

// Basic examples
export const WithBasicAdornments: Story = {
  render: () => (
    <div className="space-y-4 max-w-[320px]">
      <div>
        <h3 className="text-sm font-medium mb-2">Left Icon Adornment</h3>
        <InputGroup>
          <InputAdornment position="start" variant="inline">
            <MailIcon className="size-4" />
          </InputAdornment>
          <Input placeholder="Email" />
        </InputGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Right Icon Adornment</h3>
        <InputGroup>
          <Input placeholder="Type message" />
          <InputAdornment position="end" variant="inline">
            <SendIcon className="size-4" />
          </InputAdornment>
        </InputGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Left Text Adornment</h3>
        <InputGroup>
          <InputAdornment position="start" variant="inline">https://</InputAdornment>
          <Input placeholder="google.com" />
        </InputGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Right Text Adornment</h3>
        <InputGroup>
          <Input placeholder="google" />
          <InputAdornment position="end" variant="inline">.com</InputAdornment>
        </InputGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Left and Right Text Adornments</h3>
        <InputGroup>
          <InputAdornment position="start" variant="inline">€</InputAdornment>
          <Input placeholder="0.00" />
          <InputAdornment position="end" variant="inline">EUR</InputAdornment>
        </InputGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Box Variant (Default)</h3>
        <InputGroup>
          <InputAdornment position="start">https://</InputAdornment>
          <Input placeholder="example.com" />
        </InputGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Input with End Icon Button</h3>
        <InputGroup>
          <Input placeholder="Search..." />
          <InputAdornment position="end" variant="inline">
            <button className="flex h-full items-center px-3 text-muted-foreground hover:text-foreground">
              <SearchIcon className="h-4 w-4" />
            </button>
          </InputAdornment>
        </InputGroup>
      </div>
    </div>
  ),
};

export const WithRightButtonIconAdornment: Story = {
  render: () => (
    <InputGroup>
      <Input placeholder="Email" />
      <InputAdornment position="end" variant="inline">
        <button className="flex h-full items-center px-3 text-muted-foreground hover:text-foreground">
          <SendIcon className="h-4 w-4" />
        </button>
      </InputAdornment>
    </InputGroup>
  ),
};

export const WithRightButtonAdornment: Story = {
  render: () => (
    <InputGroup>
      <Input placeholder="Enter your email" />
      <InputAdornment position="end" variant="inline">
        <Button>Subscribe</Button>
      </InputAdornment>
    </InputGroup>
  ),
};

export const WithSeparateButton: Story = {
  render: () => (
    <div className="flex gap-2">
      <Input placeholder="Email" />
      <Button>Send</Button>
    </div>
  ),
};

export const PasswordWithToggleButton: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <InputGroup>
        <Input 
          type={showPassword ? "text" : "password"} 
          placeholder="Password" 
        />
        <InputAdornment position="end">
          <button 
            className="flex h-full items-center px-3 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        </InputAdornment>
      </InputGroup>
    );
  },
};

export const WithClearButtonAdornment: Story = {
  render: () => {
    const [value, setValue] = useState("Click to clear");
    return (
      <InputGroup>
        <Input 
          value={value} 
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type something..." 
        />
        <InputAdornment position="end">
          <button 
            className="flex h-full items-center px-3 text-muted-foreground hover:text-foreground"
            onClick={() => setValue("")}
            type="button"
            aria-label="Clear input"
            disabled={!value}
          >
            <XIcon className="h-4 w-4" />
          </button>
        </InputAdornment>
      </InputGroup>
    );
  },
};

export const SearchWithKeyboardShortcutAdornment: Story = {
  render: () => (
    <InputGroup>
      <InputAdornment position="start">
        <SearchIcon className="h-4 w-4" />
      </InputAdornment>
      <Input type="search" placeholder="Search..." />
      <InputAdornment position="end" className="text-xs">
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </InputAdornment>
    </InputGroup>
  ),
};

export const SearchWithIconAndButtonAdornments: Story = {
  render: () => (
    <InputGroup>
      <InputAdornment position="start">
        <SearchIcon className="h-4 w-4" />
      </InputAdornment>
      <Input type="search" placeholder="Search..." />
      <InputAdornment position="end">
        <Button size="sm">Search</Button>
      </InputAdornment>
    </InputGroup>
  ),
};

export const SearchWithLoaderAdornment: Story = {
  render: () => (
    <InputGroup>
      <InputAdornment position="start">
        <SearchIcon className="h-4 w-4" />
      </InputAdornment>
      <Input type="search" placeholder="Search..." />
      <InputAdornment position="end">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground"></div>
      </InputAdornment>
    </InputGroup>
  ),
};

export const WithCurrencySelectAdornment: Story = {
  render: () => (
    <InputGroup>
      <InputAdornment position="start">$</InputAdornment>
      <Input type="number" placeholder="0.00" />
      <InputAdornment position="end">
        <select className="h-10 border-0 bg-transparent text-sm focus:ring-0 focus:outline-none text-muted-foreground">
          <option>USD</option>
          <option>EUR</option>
          <option>GBP</option>
          <option>CAD</option>
        </select>
      </InputAdornment>
    </InputGroup>
  ),
};

export const WithLeftAndRightIconAdornments: Story = {
  render: () => (
    <InputGroup>
      <InputAdornment position="start">
        <MailIcon className="h-4 w-4" />
      </InputAdornment>
      <Input placeholder="Email" />
      <InputAdornment position="end">
        <XIcon className="h-4 w-4" />
      </InputAdornment>
    </InputGroup>
  ),
};

export const WithRightButtonAndIconAdornment: Story = {
  render: () => (
    <InputGroup>
      <Input placeholder="Search..." />
      <InputAdornment position="end">
        <Button>
          <SearchIcon className="h-4 w-4" />
        </Button>
      </InputAdornment>
    </InputGroup>
  ),
};

export const WithRightButtonAndTextAdornment: Story = {
  render: () => (
    <InputGroup>
      <Input placeholder="Enter your email" />
      <InputAdornment position="end">
        <Button>
          Subscribe
          <SendIcon className="ml-2 h-4 w-4" />
        </Button>
      </InputAdornment>
    </InputGroup>
  ),
};

export const WithRightButtonLoadingAdornment: Story = {
  render: () => (
    <InputGroup>
      <Input placeholder="Enter your email" />
      <InputAdornment position="end">
        <Button disabled>
          <span className="mr-2">Subscribing</span>
          <span className="animate-spin">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        </Button>
      </InputAdornment>
    </InputGroup>
  ),
};

export const SearchWithIconAdornments: Story = {
  render: () => (
    <InputGroup>
      <InputAdornment position="start">
        <SearchIcon className="h-4 w-4" />
      </InputAdornment>
      <Input type="search" placeholder="Search..." />
      <InputAdornment position="end" className="text-xs">
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </InputAdornment>
    </InputGroup>
  ),
};

// All examples in a grid
export const AllExamples: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false);
    const [clearValue, setClearValue] = useState("Click to clear");
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Row 1 */}
        <div>
          <h3 className="text-sm font-medium mb-2">Left Icon Adornment</h3>
          <InputGroup>
            <InputAdornment position="start">
              <MailIcon className="h-4 w-4" />
            </InputAdornment>
            <Input placeholder="Email" />
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Right Icon Adornment</h3>
          <InputGroup>
            <Input placeholder="Email" />
            <InputAdornment position="end">
              <MailIcon className="h-4 w-4" />
            </InputAdornment>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Left Text Adornment</h3>
          <InputGroup>
            <InputAdornment position="start">https://</InputAdornment>
            <Input placeholder="google.com" />
          </InputGroup>
        </div>
        
        {/* Row 2 */}
        <div>
          <h3 className="text-sm font-medium mb-2">Right Text Adornment</h3>
          <InputGroup>
            <Input placeholder="google" />
            <InputAdornment position="end">.com</InputAdornment>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Left & Right Text Adornments</h3>
          <InputGroup>
            <InputAdornment position="start">€</InputAdornment>
            <Input placeholder="0.00" />
            <InputAdornment position="end">EUR</InputAdornment>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Left Select Adornment</h3>
          <InputGroup>
            <InputAdornment position="start">
              <select className="h-10 border-0 bg-transparent text-sm focus:ring-0 focus:outline-none text-muted-foreground">
                <option>https://</option>
                <option>http://</option>
              </select>
            </InputAdornment>
            <Input placeholder="example.com" />
          </InputGroup>
        </div>
        
        {/* Row 3 */}
        <div>
          <h3 className="text-sm font-medium mb-2">Right Select Adornment</h3>
          <InputGroup>
            <Input placeholder="example" />
            <InputAdornment position="end">
              <select className="h-10 border-0 bg-transparent text-sm focus:ring-0 focus:outline-none text-muted-foreground">
                <option>.com</option>
                <option>.org</option>
                <option>.net</option>
              </select>
            </InputAdornment>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Right Button Adornment (Icon)</h3>
          <InputGroup>
            <Input placeholder="Email" />
            <InputAdornment position="end">
              <button className="flex h-full items-center px-3 text-muted-foreground hover:text-foreground">
                <SendIcon className="h-4 w-4" />
              </button>
            </InputAdornment>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Right Button Adornment (Text)</h3>
          <InputGroup>
            <Input placeholder="Enter your email" />
            <InputAdornment position="end">
              <Button>Subscribe</Button>
            </InputAdornment>
          </InputGroup>
        </div>
        
        {/* Row 4 */}
        <div>
          <h3 className="text-sm font-medium mb-2">Input with separate button</h3>
          <div className="flex gap-2">
            <Input placeholder="Email" />
            <Button>Send</Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Password with toggle button</h3>
          <InputGroup>
            <Input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
            />
            <InputAdornment position="end">
              <button 
                className="flex h-full items-center px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </InputAdornment>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Input with clear button</h3>
          <InputGroup>
            <Input 
              value={clearValue} 
              onChange={(e) => setClearValue(e.target.value)}
              placeholder="Type something..." 
            />
            <InputAdornment position="end">
              <button 
                className="flex h-full items-center px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setClearValue("")}
                type="button"
                aria-label="Clear input"
                disabled={!clearValue}
              >
                <XIcon className="h-4 w-4" />
              </button>
            </InputAdornment>
          </InputGroup>
        </div>
        
        {/* Row 5 */}
        <div>
          <h3 className="text-sm font-medium mb-2">Search with left icon & keyboard shortcut</h3>
          <InputGroup>
            <InputAdornment position="start">
              <SearchIcon className="h-4 w-4" />
            </InputAdornment>
            <Input type="search" placeholder="Search..." />
            <InputAdornment position="end" className="text-xs">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </InputAdornment>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Search with left icon & button</h3>
          <InputGroup>
            <InputAdornment position="start">
              <SearchIcon className="h-4 w-4" />
            </InputAdornment>
            <Input type="search" placeholder="Search..." />
            <InputAdornment position="end">
              <Button size="sm">Search</Button>
            </InputAdornment>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Search with left icon & loading indicator</h3>
          <InputGroup>
            <InputAdornment position="start">
              <SearchIcon className="h-4 w-4" />
            </InputAdornment>
            <Input type="search" placeholder="Search..." />
            <InputAdornment position="end">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground"></div>
            </InputAdornment>
          </InputGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Currency with multiple adornments</h3>
          <InputGroup>
            <InputAdornment position="start">$</InputAdornment>
            <Input type="number" placeholder="0.00" />
            <InputAdornment position="end">
              <select className="h-10 border-0 bg-transparent text-sm focus:ring-0 focus:outline-none text-muted-foreground">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>CAD</option>
              </select>
            </InputAdornment>
          </InputGroup>
        </div>
      </div>
    );
  },
};
