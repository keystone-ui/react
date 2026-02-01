import type { Meta, StoryObj } from "@storybook/react-vite";
import { 
  Input,
  DateInput,
  InputGroup, 
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@acme/ui/input";
import { Description } from "@acme/ui/form";
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@acme/ui/field";
import { Button, ButtonGroup } from "@acme/ui/button";
import { MailIcon, InfoIcon } from "lucide-react";
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

// Input with Field components
export const FieldExample: Story = {
  name: "Field",
  render: () => (
    <Field>
      <FieldLabel htmlFor="input-field-username">Username</FieldLabel>
      <Input
        id="input-field-username"
        type="text"
        placeholder="Enter your username"
      />
      <FieldDescription>
        Choose a unique username for your account.
      </FieldDescription>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: "Use `Field`, `FieldLabel`, and `FieldDescription` to create an input with a label and description.",
      },
    },
  },
};

// Input with Field Group
export const FieldGroupExample: Story = {
  name: "Field Group",
  render: () => (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="fieldgroup-name">Name</FieldLabel>
        <Input id="fieldgroup-name" placeholder="Jordan Lee" />
      </Field>
      <Field>
        <FieldLabel htmlFor="fieldgroup-email">Email</FieldLabel>
        <Input
          id="fieldgroup-email"
          type="email"
          placeholder="name@example.com"
        />
        <FieldDescription>
          We&apos;ll send updates to this address.
        </FieldDescription>
      </Field>
      <Field orientation="horizontal">
        <Button type="reset" variant="outline">
          Reset
        </Button>
        <Button type="submit">Submit</Button>
      </Field>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Use `FieldGroup` to show multiple `Field` blocks and to build forms.",
      },
    },
  },
};

// Disabled input with Field
export const DisabledField: Story = {
  name: "Disabled",
  render: () => (
    <Field data-disabled>
      <FieldLabel htmlFor="input-demo-disabled">Email</FieldLabel>
      <Input
        id="input-demo-disabled"
        type="email"
        placeholder="Email"
        disabled
      />
      <FieldDescription>This field is currently disabled.</FieldDescription>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: "Use the `disabled` prop to disable the input. To style the disabled state, add the `data-disabled` attribute to the `Field` component.",
      },
    },
  },
};

// Input with error
export const WithErrorField: Story = {
  name: "With Error",
  render: () => (
    <Field data-invalid>
      <FieldLabel htmlFor="input-invalid">Email</FieldLabel>
      <Input id="input-invalid" placeholder="Email" aria-invalid />
      <FieldError>
        This field contains validation errors.
      </FieldError>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: "Use the `aria-invalid` prop to mark the input as invalid. Add `data-invalid` to the `Field` component to style the invalid state. Use `FieldError` for explicit error messages, or `FieldDescription` which auto-styles red when the parent Field is invalid.",
      },
    },
  },
};

// Inline input with Field
export const InlineField: Story = {
  name: "Inline",
  render: () => (
    <Field orientation="horizontal">
      <Input type="search" placeholder="Search..." />
      <Button>Search</Button>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: "Use `Field` with `orientation=\"horizontal\"` to create an inline input. Pair with `Button` to create a search input with a button.",
      },
    },
  },
};

// Grid input with FieldGroup
export const GridField: Story = {
  name: "Grid",
  render: () => (
    <FieldGroup className="grid max-w-sm grid-cols-2">
      <Field>
        <FieldLabel htmlFor="first-name">First Name</FieldLabel>
        <Input id="first-name" placeholder="Jordan" />
      </Field>
      <Field>
        <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
        <Input id="last-name" placeholder="Lee" />
      </Field>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Use `FieldGroup` with grid classes to create a grid layout for inputs.",
      },
    },
  },
};

// Input Group with Field
export const InputGroupField: Story = {
  name: "Input Group",
  render: () => (
    <Field>
      <FieldLabel htmlFor="input-group-url">Website URL</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput id="input-group-url" placeholder="example.com" />
        <InputGroupAddon align="inline-end">
          <InfoIcon className="size-4" />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: "To add icons, text, or buttons inside an input, use the `InputGroup` component. See the [InputGroup documentation](?path=/docs/components-inputgroup--docs) for more examples.",
      },
    },
  },
};

// Button Group with Field
export const ButtonGroupField: Story = {
  name: "Button Group",
  render: () => (
    <Field>
      <FieldLabel htmlFor="button-group-search">Search</FieldLabel>
      <ButtonGroup>
        <Input id="button-group-search" placeholder="Type to search..." />
        <Button variant="outline">Search</Button>
      </ButtonGroup>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: "To add buttons to an input, use the `ButtonGroup` component. See the [ButtonGroup documentation](?path=/docs/components-buttongroup--docs) for more examples.",
      },
    },
  },
};

// Full Form Example
export const FormExample: Story = {
  name: "Form",
  render: () => (
    <form className="w-full max-w-sm">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="form-name">Name</FieldLabel>
          <Input
            id="form-name"
            type="text"
            placeholder="Evil Rabbit"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="form-email">Email</FieldLabel>
          <Input id="form-email" type="email" placeholder="john@example.com" required />
          <FieldDescription>
            We&apos;ll never share your email with anyone.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="form-password">Password</FieldLabel>
          <Input id="form-password" type="password" placeholder="••••••••" required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="form-phone">Phone</FieldLabel>
            <Input id="form-phone" type="tel" placeholder="+1 (555) 123-4567" />
          </Field>
          <Field>
            <FieldLabel htmlFor="form-date">Date of Birth</FieldLabel>
            <DateInput id="form-date" />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="form-country">Country</FieldLabel>
          <select
            id="form-country"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue="us"
          >
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="ca">Canada</option>
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="form-address">Address</FieldLabel>
          <Input id="form-address" type="text" placeholder="123 Main St" />
        </Field>
        <Field orientation="horizontal">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </Field>
      </FieldGroup>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: "A full form example with multiple inputs, a select, and buttons.",
      },
    },
  },
};

// File input
export const File: Story = {
  args: {
    type: "file",
  },
};

// Subscribe Form
export const SubscribeForm: Story = {
  render: () => {
    const [email, setEmail] = useState("");
    
    return (
      <div className="space-y-6 max-w-md">
        <div>
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            <div className="relative grow">
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
