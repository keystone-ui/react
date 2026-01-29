import type { Meta, StoryObj } from "@storybook/react-vite";
import { 
  Input, 
  InputGroup, 
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  InputGroupText,
} from "@acme/ui/input";
import { Form, Label, Description, ErrorMessage } from "@acme/ui/form";
import { Button } from "@acme/ui/button";
import { 
  SearchIcon, 
  EyeIcon, 
  EyeOffIcon, 
  AtSignIcon, 
  KeyIcon, 
  UserIcon, 
  CalendarIcon,
  SendIcon,
  MailIcon
} from "lucide-react";
import { useState } from "react";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component: `
A versatile input component with support for different types, states, and adornments.

\`\`\`tsx
import { Input, InputGroup, InputGroupAddon, InputGroupInput } from "@acme/ui";

// Default input
<Input placeholder="Enter your name" />

// Email input
<Input type="email" placeholder="Enter your email" />

// Password input
<Input type="password" placeholder="Enter your password" />

// Input with left icon adornment
<InputGroup>
  <InputGroupAddon>
    <MailIcon className="size-4" />
  </InputGroupAddon>
  <InputGroupInput placeholder="Email" />
</InputGroup>

// Input with right icon adornment
<InputGroup>
  <InputGroupInput placeholder="Email" />
  <InputGroupAddon align="inline-end">
    <MailIcon className="size-4" />
  </InputGroupAddon>
</InputGroup>

// Disabled input
<Input disabled placeholder="Disabled input" />

// Input with error
<Input aria-invalid="true" placeholder="Invalid input" />

// Search input
<Input type="search" placeholder="Search..." />

// File input
<Input type="file" />
\`\`\`

## Features

- Support for all HTML input types
- Consistent styling with the rest of the UI
- Clean 2px inset ring focus style for better accessibility
- Support for left and right adornments (icons, text, buttons, selects)
- Special styling for search and file inputs
- Proper disabled and error states
- Customizable with additional classes
`,
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url", "date", "time", "file"],
      defaultValue: "text",
      description: "The type of the input",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text for the input",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the input",
    },
  },
} as Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof Input>;

// Basic input
export const Default: Story = {
  args: {
    placeholder: "Enter text",
  },
};

// Email input
export const Email: Story = {
  args: {
    type: "email",
    placeholder: "Enter your email",
  },
};

// Password input
export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter your password",
  },
};

// Disabled input
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
    value: "This input is disabled",
  },
};

// Input with AtSign icon prefix
export const WithLeftIconAdornment: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <AtSignIcon className="h-4 w-4" />
      </InputGroupAddon>
      <InputGroupInput type="email" placeholder="john.doe@example.com" />
    </InputGroup>
  ),
};

// Input with error
export const WithError: Story = {
  render: () => {
    return (
      <Form>
        <Label htmlFor="with-error">Email Address</Label>
        <Input 
          id="with-error" 
          aria-invalid="true" 
          placeholder="Invalid input" 
        />
        <ErrorMessage>
          Please enter a valid email address
        </ErrorMessage>
      </Form>
    );
  }
};

// Search input
export const Search: Story = {
  args: {
    type: "search",
    placeholder: "Search...",
  },
};

// File input
export const File: Story = {
  args: {
    type: "file",
  },
};

// Left Adornment examples
export const LeftAdornment: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Left Adornment Examples</h3>
      
      {/* Icon as left adornment */}
      <div className="space-y-1">
        <Label htmlFor="email-icon-left">Email with icon adornment</Label>
        <InputGroup>
          <InputGroupAddon>
            <MailIcon className="size-4" />
          </InputGroupAddon>
          <InputGroupInput id="email-icon-left" placeholder="Email" />
        </InputGroup>
      </div>
      
      {/* Text as left adornment */}
      <div className="space-y-1">
        <Label htmlFor="website-text-left">Website with text adornment</Label>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput id="website-text-left" placeholder="google.com" />
        </InputGroup>
      </div>
      
      {/* Select as left adornment */}
      <div className="space-y-1">
        <Label htmlFor="protocol-select-left">Website with protocol selector</Label>
        <InputGroup>
          <InputGroupAddon>
            <select className="h-full border-0 bg-transparent text-sm focus:ring-0 focus:outline-none text-muted-foreground">
              <option>https://</option>
              <option>http://</option>
              <option>ftp://</option>
            </select>
          </InputGroupAddon>
          <InputGroupInput id="protocol-select-left" placeholder="example.com" />
        </InputGroup>
      </div>
    </div>
  ),
};

// Right Adornment examples
export const RightAdornment: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Right Adornment Examples</h3>
        
        {/* Icon as right adornment */}
        <div className="space-y-1">
          <Label htmlFor="email-icon-right">Email with icon adornment</Label>
          <InputGroup>
            <InputGroupInput id="email-icon-right" placeholder="Email" />
            <InputGroupAddon align="inline-end">
              <MailIcon className="size-4" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        
        {/* Text as right adornment */}
        <div className="space-y-1">
          <Label htmlFor="domain-text-right">Domain with text adornment</Label>
          <InputGroup>
            <InputGroupInput id="domain-text-right" placeholder="google" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>.com</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
        
        {/* Password toggle as right adornment */}
        <div className="space-y-1">
          <Label htmlFor="password-toggle">Password with toggle</Label>
          <InputGroup>
            <InputGroupInput 
              id="password-toggle" 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter your password" 
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
        
        {/* Button as right adornment */}
        <div className="space-y-1">
          <Label htmlFor="email-button-right">Email with button adornment</Label>
          <InputGroup>
            <InputGroupInput id="email-button-right" placeholder="Enter your email" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="sm">Subscribe</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    );
  },
};

// Input examples
export const Examples: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Form className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </Form>
            <Form className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </Form>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Focus Style</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Form className="space-y-2">
              <Label htmlFor="focus-demo">Click or tab to this input</Label>
              <Input 
                id="focus-demo" 
                placeholder="Focus me to see the 2px inset ring" 
                autoFocus
              />
              <Description>
                This input has a 2px inset ring focus style for better accessibility and removes the default browser outline
              </Description>
            </Form>
            <Form className="space-y-2">
              <Label htmlFor="focus-error">Focus with error state</Label>
              <Input 
                id="focus-error" 
                placeholder="Focus me to see error state ring" 
                aria-invalid="true"
              />
              <ErrorMessage>
                Error state maintains the same focus style with error colors
              </ErrorMessage>
            </Form>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Input with Icons</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email-icon">Email</Label>
              <div className="relative">
                <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input id="email-icon" className="pl-9" placeholder="Enter your email" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-icon">Password</Label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  id="password-icon" 
                  type={showPassword ? "text" : "password"} 
                  className="pl-9 pr-9" 
                  placeholder="Enter your password" 
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Input States</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Form className="space-y-2">
              <Label htmlFor="default-state">Default</Label>
              <Input id="default-state" placeholder="Default input" />
            </Form>
            <Form className="space-y-2">
              <Label htmlFor="disabled-state">Disabled</Label>
              <Input id="disabled-state" disabled placeholder="Disabled input" />
            </Form>
            <Form className="space-y-2">
              <Label htmlFor="error-state">Error</Label>
              <Input id="error-state" aria-invalid="true" placeholder="Invalid input" />
              <ErrorMessage>This field is required</ErrorMessage>
            </Form>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Input Types</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search-input">Search</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input id="search-input" type="search" className="pl-9" placeholder="Search..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-input">Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input id="date-input" type="date" className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="number-input">Number</Label>
              <Input id="number-input" type="number" placeholder="Enter a number" min={0} max={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-input">File</Label>
              <Input id="file-input" type="file" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Input Groups</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="url-input">Website URL</Label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>https://</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput id="url-input" placeholder="example.com" />
              </InputGroup>
              <Description>
                Input with a text prefix adornment
              </Description>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="domain-input">Domain</Label>
              <InputGroup>
                <InputGroupInput id="domain-input" placeholder="example" />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>.com</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <Description>
                Input with a text suffix adornment
              </Description>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="email-with-icon">Email</Label>
              <InputGroup>
                <InputGroupAddon>
                  <AtSignIcon className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput id="email-with-icon" type="email" placeholder="john.doe@example.com" />
              </InputGroup>
              <Description>
                Input with an icon prefix adornment
              </Description>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="email-input">Newsletter</Label>
              <InputGroup>
                <InputGroupInput id="email-input" placeholder="Enter your email" />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="sm">Subscribe</InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <Description>
                Input with a button suffix adornment
              </Description>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="search-input-group">Search</Label>
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput id="search-input-group" type="search" placeholder="Search..." />
                <InputGroupAddon align="inline-end">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </InputGroupAddon>
              </InputGroup>
              <Description>
                Search input with icon and keyboard shortcut
              </Description>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="currency-input">Amount</Label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput id="currency-input" type="number" placeholder="0.00" />
                <InputGroupAddon align="inline-end">
                  <select className="h-full border-0 bg-transparent text-sm focus:ring-0 focus:outline-none text-muted-foreground">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </InputGroupAddon>
              </InputGroup>
              <Description>
                Input with currency symbol and selector
              </Description>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="password-input">Password</Label>
              <InputGroup>
                <InputGroupInput 
                  id="password-input" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton 
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <Description>
                Password input with toggle button
              </Description>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Form Example</h3>
          <form className="space-y-4 border rounded-lg p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name-form">First name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input id="first-name-form" className="pl-9" placeholder="John" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name-form">Last name</Label>
                <Input id="last-name-form" placeholder="Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-form">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input id="email-form" type="email" className="pl-9" placeholder="john.doe@example.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-form">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="password-form" 
                    type="password" 
                    className="pl-9" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  },
};

// Floating Label Input
export const FloatingLabel: Story = {
  render: () => {
    return (
      <div className="space-y-4 max-w-md">
        <div className="relative">
          <Input 
            id="floating-label" 
            className="pt-6 pb-2 px-4" 
            placeholder=" " 
          />
          <Label 
            htmlFor="floating-label" 
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/70 transition-all peer-focus:text-xs peer-focus:top-3 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-3"
          >
            Floating Label
          </Label>
          <Description className="mt-1">
            Label floats when input is focused or has content
          </Description>
        </div>
      </div>
    );
  }
};

// Input with Label
export const WithLabel: Story = {
  render: () => {
    return (
      <Form>
        <Label htmlFor="with-label">Your Name</Label>
        <Input 
          id="with-label" 
          placeholder="John Doe" 
        />
        <Description>
          Standard input with label positioned above
        </Description>
      </Form>
    );
  }
};

// Subscribe Form
export const SubscribeForm: Story = {
  render: () => {
    const [email, setEmail] = useState("");
    
    return (
      <div className="space-y-6 max-w-md">
        <div>
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex-grow">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="pl-9" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit">
              Subscribe
            </Button>
          </form>
          <Description className="mt-1">
            Subscribe to our newsletter to receive updates
          </Description>
        </div>
      </div>
    );
  }
};
