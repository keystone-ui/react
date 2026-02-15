import { Button } from "@keystone/ui/button";
import { Checkbox } from "@keystone/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@keystone/ui/field";
import { Input } from "@keystone/ui/input";
import { Switch } from "@keystone/ui/switch";
import { Textarea } from "@keystone/ui/textarea";
import type { Meta, StoryObj } from "@storybook/react-vite";

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
import { Field, FieldLabel, FieldDescription } from "@keystone/ui/field";
import { Input } from "@keystone/ui/input";

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

// Input Example (Anatomy)
export const InputStory: Story = {
  name: "Input",
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
          <Input
            autoComplete="off"
            id="profile-name"
            placeholder="Evil Rabbit"
          />
          <FieldDescription>
            This appears on invoices and emails.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-username">Username</FieldLabel>
          <Input aria-invalid autoComplete="off" id="profile-username" />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel htmlFor="newsletter">
            Subscribe to the newsletter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

// Switch with Description
export const SwitchWithDescription: Story = {
  name: "Switch with Description",
  render: () => (
    <Field className="max-w-sm" orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor="switch-focus-mode">
          Share across devices
        </FieldLabel>
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
    <Field className="w-fit" data-disabled orientation="horizontal">
      <Switch disabled id="switch-disabled-unchecked" />
      <FieldLabel htmlFor="switch-disabled-unchecked">Disabled</FieldLabel>
    </Field>
  ),
};

// Switch Invalid
export const SwitchInvalid: Story = {
  name: "Switch Invalid",
  render: () => (
    <Field className="max-w-sm" data-invalid orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor="switch-terms">
          Accept terms and conditions
        </FieldLabel>
        <FieldDescription>
          You must accept the terms and conditions to continue.
        </FieldDescription>
      </FieldContent>
      <Switch aria-invalid id="switch-terms" />
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
        <Input
          aria-invalid
          defaultValue="invalid-email"
          id="email"
          type="email"
        />
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
        <Input aria-invalid defaultValue="abc" id="password" type="password" />
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
        story:
          "Use the `errors` prop to display multiple validation errors as a list. Duplicate messages are automatically deduplicated.",
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
          Email<span className="ml-1 text-destructive">*</span>
        </FieldLabel>
        <Input id="required-email" required type="email" />
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
            <Checkbox defaultChecked disabled id="push" />
            <FieldLabel className="font-normal" htmlFor="push">
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
            <FieldLabel className="font-normal" htmlFor="push-tasks">
              Push notifications
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="email-tasks" />
            <FieldLabel className="font-normal" htmlFor="email-tasks">
              Email notifications
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  ),
};

// FieldSet Example (Address Information)
export const FieldSetExample: Story = {
  name: "FieldSet",
  render: () => (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Address Information</FieldLegend>
      <FieldDescription>
        We need your address to deliver your order.
      </FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="street">Street Address</FieldLabel>
          <Input id="street" placeholder="123 Main St" type="text" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" placeholder="New York" type="text" />
          </Field>
          <Field>
            <FieldLabel htmlFor="zip">Postal Code</FieldLabel>
            <Input id="zip" placeholder="90502" type="text" />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  ),
};

// Checkbox Example
export const CheckboxExample: Story = {
  name: "Checkbox",
  render: () => (
    <FieldGroup className="w-full max-w-xs">
      <FieldSet>
        <FieldLegend variant="label">
          Show these items on the desktop
        </FieldLegend>
        <FieldDescription>
          Select the items you want to show on the desktop.
        </FieldDescription>
        <FieldGroup className="gap-3">
          <Field orientation="horizontal">
            <Checkbox defaultChecked id="finder-pref-hard-disks" />
            <FieldLabel
              className="font-normal"
              htmlFor="finder-pref-hard-disks"
            >
              Hard disks
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="finder-pref-external-disks" />
            <FieldLabel
              className="font-normal"
              htmlFor="finder-pref-external-disks"
            >
              External disks
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="finder-pref-cds-dvds" />
            <FieldLabel className="font-normal" htmlFor="finder-pref-cds-dvds">
              CDs, DVDs, and iPods
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="finder-pref-connected-servers" />
            <FieldLabel
              className="font-normal"
              htmlFor="finder-pref-connected-servers"
            >
              Connected servers
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
      <Field orientation="horizontal">
        <Checkbox defaultChecked id="finder-pref-sync-folders" />
        <FieldContent>
          <FieldLabel htmlFor="finder-pref-sync-folders">
            Sync Desktop & Documents folders
          </FieldLabel>
          <FieldDescription>
            Your Desktop & Documents folders are being synced with iCloud Drive.
            You can access them from other devices.
          </FieldDescription>
        </FieldContent>
      </Field>
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
                <Checkbox defaultChecked id="same-as-shipping" />
                <FieldLabel className="font-normal" htmlFor="same-as-shipping">
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
                  className="resize-none"
                  id="comments"
                  placeholder="Add any additional comments"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  ),
};
