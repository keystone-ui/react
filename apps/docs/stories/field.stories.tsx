import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  Input,
  Switch,
  Textarea,
} from "@acme/ui";

const meta = {
  title: "Components/Field",
  component: Field,
  parameters: {
    docs: {
      description: {
        component: `
# Field

Combine labels, controls, and help text to compose accessible form fields and grouped inputs.

## Components

- \`FieldSet\` - Wraps related form controls in a \`<fieldset>\`
- \`FieldLegend\` - Legend for FieldSet with variant support
- \`FieldGroup\` - Container for multiple Field components
- \`Field\` - Individual field wrapper with orientation variants
- \`FieldLabel\` - Label component for form controls
- \`FieldContent\` - Content wrapper for control + description
- \`FieldDescription\` - Helper/description text (auto-styles red when Field is invalid)
- \`FieldError\` - Error message display
- \`FieldSeparator\` - Visual separator between fields

## Responsive Layout

- **Vertical fields:** Default orientation stacks label, control, and helper text—ideal for mobile-first layouts.
- **Horizontal fields:** Set \`orientation="horizontal"\` on Field to align the label and control side-by-side. Pair with \`FieldContent\` to keep descriptions aligned.
- **Responsive fields:** Set \`orientation="responsive"\` for automatic column layouts inside container-aware parents. Apply \`@container/field-group\` classes on \`FieldGroup\` to switch orientations at specific breakpoints.

## Validation and Errors

- Add \`data-invalid\` to Field to switch the entire block into an error state.
- Add \`aria-invalid\` on the input itself for assistive technologies.
- \`FieldDescription\` automatically turns red when the parent Field has \`data-invalid\`.
- Render \`FieldError\` immediately after the control or inside \`FieldContent\` to keep error messages aligned with the field.

## Accessibility

- \`FieldSet\` and \`FieldLegend\` keep related controls grouped for keyboard and assistive tech users.
- \`Field\` outputs \`role="group"\` so nested controls inherit labeling from \`FieldLabel\` and \`FieldLegend\` when combined.
- Apply \`FieldSeparator\` sparingly to ensure screen readers encounter clear section boundaries.

## Basic Usage

\`\`\`tsx
import { Field, FieldLabel, FieldDescription } from "@acme/ui";
import { Input } from "@acme/ui";

<Field>
  <FieldLabel htmlFor="username">Username</FieldLabel>
  <Input id="username" placeholder="Max Leiter" />
  <FieldDescription>Choose a unique username for your account.</FieldDescription>
</Field>
\`\`\`
`,
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof Field>;

// Anatomy Example
export const Anatomy: Story = {
  name: "Anatomy",
  render: () => (
    <div className="w-full max-w-xs">
      <Field>
        <FieldLabel htmlFor="anatomy-input">Label</FieldLabel>
        <Input id="anatomy-input" placeholder="Input, Select, Switch, etc." />
        <FieldDescription>Optional helper text.</FieldDescription>
        <FieldError>Validation message.</FieldError>
      </Field>
    </div>
  ),
};

// Profile Example with Switch
export const Profile: Story = {
  name: "Profile",
  render: () => (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
          <Input id="profile-name" autoComplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-username">Username</FieldLabel>
          <Input id="profile-username" autoComplete="off" aria-invalid />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel htmlFor="newsletter">Subscribe to the newsletter</FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

// Switch with Description
export const SwitchWithDescription: Story = {
  name: "Switch with Description",
  render: () => (
    <Field orientation="horizontal" className="max-w-sm">
      <FieldContent>
        <FieldLabel htmlFor="switch-focus-mode">Share across devices</FieldLabel>
        <FieldDescription>
          Focus is shared across devices, and turns off when you leave the app.
        </FieldDescription>
      </FieldContent>
      <Switch id="switch-focus-mode" />
    </Field>
  ),
};

// Switch Disabled
export const SwitchDisabled: Story = {
  name: "Switch Disabled",
  render: () => (
    <Field orientation="horizontal" data-disabled className="w-fit">
      <Switch id="switch-disabled-unchecked" disabled />
      <FieldLabel htmlFor="switch-disabled-unchecked">Disabled</FieldLabel>
    </Field>
  ),
};

// Switch Invalid
export const SwitchInvalid: Story = {
  name: "Switch Invalid",
  render: () => (
    <Field orientation="horizontal" className="max-w-sm" data-invalid>
      <FieldContent>
        <FieldLabel htmlFor="switch-terms">Accept terms and conditions</FieldLabel>
        <FieldDescription>
          You must accept the terms and conditions to continue.
        </FieldDescription>
      </FieldContent>
      <Switch id="switch-terms" aria-invalid />
    </Field>
  ),
};

// Switch Sizes
export const SwitchSizes: Story = {
  name: "Switch Sizes",
  render: () => (
    <FieldGroup className="w-full max-w-40">
      <Field orientation="horizontal">
        <Switch id="switch-size-sm" size="sm" />
        <FieldLabel htmlFor="switch-size-sm">Small</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Switch id="switch-size-default" size="default" />
        <FieldLabel htmlFor="switch-size-default">Default</FieldLabel>
      </Field>
    </FieldGroup>
  ),
};

// Input Example
export const InputExample: Story = {
  name: "Input",
  render: () => (
    <FieldSet className="w-full max-w-xs">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input id="username" type="text" placeholder="Max Leiter" />
          <FieldDescription>
            Choose a unique username for your account.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
          <Input id="password" type="password" placeholder="••••••••" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

// Textarea Example
export const TextareaExample: Story = {
  name: "Textarea",
  render: () => (
    <FieldSet className="w-full max-w-xs">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="feedback">Feedback</FieldLabel>
          <Textarea
            id="feedback"
            placeholder="Your feedback helps us improve..."
            rows={4}
          />
          <FieldDescription>
            Share your thoughts about our service.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

// Grid Layout
export const Grid: Story = {
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
};

// Responsive Layout
export const ResponsiveLayout: Story = {
  name: "Responsive Layout",
  render: () => (
    <div className="w-full max-w-lg">
      <form>
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>Fill in your profile information.</FieldDescription>
          <FieldGroup>
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <FieldDescription>
                  Provide your full name for identification
                </FieldDescription>
              </FieldContent>
              <Input id="name" placeholder="Evil Rabbit" required />
            </Field>
            <Field orientation="responsive">
              <Button type="submit">Submit</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  ),
};

// Horizontal Layout
export const HorizontalLayout: Story = {
  name: "Horizontal Layout",
  render: () => (
    <div className="w-full max-w-md">
      <Field orientation="horizontal">
        <FieldLabel htmlFor="horizontal-name">Name</FieldLabel>
        <Input id="horizontal-name" placeholder="Evil Rabbit" />
      </Field>
    </div>
  ),
};

// Validation Error
export const ValidationError: Story = {
  name: "Validation Error",
  render: () => (
    <div className="w-full max-w-xs">
      <Field data-invalid>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" type="email" aria-invalid defaultValue="invalid-email" />
        <FieldError>Enter a valid email address.</FieldError>
      </Field>
    </div>
  ),
};

// Multiple Validation Errors
export const MultipleErrors: Story = {
  name: "Multiple Errors",
  render: () => (
    <div className="w-full max-w-xs">
      <Field data-invalid>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input id="password" type="password" aria-invalid defaultValue="abc" />
        <FieldError
          errors={[
            { message: "Must be at least 8 characters" },
            { message: "Must contain a number" },
            { message: "Must contain a special character" },
          ]}
        />
      </Field>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Use the `errors` prop to display multiple validation errors as a list. Duplicate messages are automatically deduplicated.",
      },
    },
  },
};

// Required Field
export const Required: Story = {
  name: "Required",
  render: () => (
    <div className="w-full max-w-xs">
      <Field>
        <FieldLabel htmlFor="required-email">
          Email<span className="text-destructive ml-0.5">*</span>
        </FieldLabel>
        <Input id="required-email" type="email" required />
        <FieldDescription>We&apos;ll never share your email.</FieldDescription>
      </Field>
    </div>
  ),
};

// FieldGroup with Checkboxes
export const FieldGroupWithCheckboxes: Story = {
  name: "FieldGroup with Checkboxes",
  render: () => (
    <FieldGroup className="w-full max-w-xs">
      <FieldSet>
        <FieldLabel>Responses</FieldLabel>
        <FieldDescription>
          Get notified when ChatGPT responds to requests that take time, like
          research or image generation.
        </FieldDescription>
        <FieldGroup data-slot="checkbox-group">
          <Field orientation="horizontal">
            <Checkbox id="push" defaultChecked disabled />
            <FieldLabel htmlFor="push" className="font-normal">
              Push notifications
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
      <FieldSet>
        <FieldLabel>Tasks</FieldLabel>
        <FieldDescription>
          Get notified when tasks you&apos;ve created have updates.{" "}
          <a href="#">Manage tasks</a>
        </FieldDescription>
        <FieldGroup data-slot="checkbox-group">
          <Field orientation="horizontal">
            <Checkbox id="push-tasks" />
            <FieldLabel htmlFor="push-tasks" className="font-normal">
              Push notifications
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="email-tasks" />
            <FieldLabel htmlFor="email-tasks" className="font-normal">
              Email notifications
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  ),
};

// Payment Method Form
export const PaymentMethod: Story = {
  name: "Payment Method",
  render: () => (
    <div className="w-full max-w-md">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldDescription>
              All transactions are secure and encrypted
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="card-name">Name on Card</FieldLabel>
                <Input id="card-name" placeholder="Evil Rabbit" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="card-number">Card Number</FieldLabel>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <FieldDescription>
                  Enter your 16-digit card number
                </FieldDescription>
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="exp-month">Month</FieldLabel>
                  <Input id="exp-month" placeholder="MM" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="exp-year">Year</FieldLabel>
                  <Input id="exp-year" placeholder="YYYY" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cvv">CVV</FieldLabel>
                  <Input id="cvv" placeholder="123" required />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Billing Address</FieldLegend>
            <FieldDescription>
              The billing address associated with your payment method
            </FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox id="same-as-shipping" defaultChecked />
                <FieldLabel htmlFor="same-as-shipping" className="font-normal">
                  Same as shipping address
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="comments">Comments</FieldLabel>
                <Textarea
                  id="comments"
                  placeholder="Add any additional comments"
                  className="resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  ),
};

// All Examples Grid
export const AllExamples: Story = {
  name: "All Examples",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-sm font-medium mb-4">Basic Input</h3>
        <Field>
          <FieldLabel htmlFor="demo-username">Username</FieldLabel>
          <Input id="demo-username" placeholder="Max Leiter" />
          <FieldDescription>Choose a unique username.</FieldDescription>
        </Field>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">With Textarea</h3>
        <Field>
          <FieldLabel htmlFor="demo-feedback">Feedback</FieldLabel>
          <Textarea id="demo-feedback" placeholder="Your thoughts..." rows={3} />
          <FieldDescription>Share your feedback.</FieldDescription>
        </Field>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Horizontal Checkbox</h3>
        <Field orientation="horizontal">
          <Checkbox id="demo-terms" />
          <FieldLabel htmlFor="demo-terms" className="font-normal">
            I agree to the terms and conditions
          </FieldLabel>
        </Field>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Error State</h3>
        <Field data-invalid>
          <FieldLabel htmlFor="demo-email">Email</FieldLabel>
          <Input id="demo-email" type="email" aria-invalid defaultValue="bad" />
          <FieldError>Enter a valid email address.</FieldError>
        </Field>
      </div>

      <div className="md:col-span-2">
        <h3 className="text-sm font-medium mb-4">Grid Layout</h3>
        <FieldGroup className="grid grid-cols-2 max-w-sm">
          <Field>
            <FieldLabel htmlFor="demo-first">First Name</FieldLabel>
            <Input id="demo-first" placeholder="Jordan" />
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-last">Last Name</FieldLabel>
            <Input id="demo-last" placeholder="Lee" />
          </Field>
        </FieldGroup>
      </div>
    </div>
  ),
};
