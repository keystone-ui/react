import { Checkbox } from "@keystoneui/react/checkbox";
import { Field, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";
import { Label } from "@keystoneui/react/label";
import { RadioGroup, RadioGroupItem } from "@keystoneui/react/radio-group";
import { Switch } from "@keystoneui/react/switch";
import { Textarea } from "@keystoneui/react/textarea";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/Label",
  component: Label,
  parameters: {
    docs: {
      description: {
        component: `
A simple label component for form elements.

\`\`\`tsx
import { Label } from "@keystoneui/react/label";

// Basic label
<Label htmlFor="email">Email</Label>

// With custom styling
<Label htmlFor="name" className="text-blue-500">Name</Label>

// Required label
<Label htmlFor="password">
  Password <span className="text-red-500">*</span>
</Label>
\`\`\`

## Features

- Accessible form labels
- Consistent styling with the rest of the UI
- Proper disabled state styling when used with form controls
- Customizable with additional classes
`,
      },
    },
  },
  argTypes: {
    children: {
      control: "text",
      description: "The content of the label",
      defaultValue: "Label",
    },
    htmlFor: {
      control: "text",
      description: "The ID of the form element this label is associated with",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the label",
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof Label>;

// Basic label
export const Default: Story = {
  args: {
    children: "Email address",
    htmlFor: "email",
  },
};

// Required label
export const Required: Story = {
  args: {
    children: (
      <>
        Password <span className="text-red-500">*</span>
      </>
    ),
    htmlFor: "password",
  },
};

// Label with description
export const WithDescription: Story = {
  args: {
    children: (
      <div className="space-y-1">
        <div>Username</div>
        <p className="font-normal text-muted-foreground text-xs">
          This will be displayed on your profile
        </p>
      </div>
    ),
    htmlFor: "username",
  },
};

// Label examples
export const Examples: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Basic Labels</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first-name">First name</Label>
            <Input id="first-name" placeholder="Enter your first name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last name</Label>
            <Input id="last-name" placeholder="Enter your last name" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Required Fields</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email-required">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email-required"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-required">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password-required"
              placeholder="Enter your password"
              required
              type="password"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">With Descriptions</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="bio">
              <div className="space-y-1">
                <div>Bio</div>
                <p className="font-normal text-muted-foreground text-xs">
                  Write a short introduction about yourself
                </p>
              </div>
            </Label>
            <Textarea
              className="h-24"
              id="bio"
              placeholder="I'm a software developer..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Disabled State</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="disabled-input">Disabled field</Label>
            <Input
              disabled
              id="disabled-input"
              placeholder="This field is disabled"
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

/** Opacity the user sees: the element's own times every ancestor's. */
const effectiveOpacity = (el: Element | null) => {
  let opacity = 1;
  for (let node = el; node; node = node.parentElement) {
    opacity *= Number(getComputedStyle(node).opacity);
  }
  return opacity;
};

/**
 * Flat layouts of Base UI controls and labels under one parent. A disabled
 * Checkbox, RadioGroupItem or Switch dims itself (0.5, not-allowed) inside and
 * outside a `Field`, and never dims the label of an enabled control further
 * along: Base UI renders `span.peer`, hidden `<input>`(s), then the label, so
 * a sibling rule on Label cannot tell its own control from a neighbour's.
 */
export const DisabledPeerScope: Story = {
  name: "Disabled peer scope",
  render: () => (
    <div className="flex w-72 flex-col gap-6">
      <div className="grid grid-cols-[auto_1fr] items-center gap-3">
        <Checkbox data-testid="cb-locked" disabled id="cb-locked" />
        <Label htmlFor="cb-locked">Locked checkbox</Label>
        <Checkbox data-testid="cb-open" id="cb-open" />
        <Label data-testid="cb-open-label" htmlFor="cb-open">
          Available checkbox
        </Label>
      </div>
      <RadioGroup className="grid grid-cols-[auto_1fr] items-center gap-3">
        <RadioGroupItem
          data-testid="radio-locked"
          disabled
          id="radio-locked"
          value="locked"
        />
        <Label htmlFor="radio-locked">Locked radio</Label>
        <RadioGroupItem data-testid="radio-open" id="radio-open" value="open" />
        <Label data-testid="radio-open-label" htmlFor="radio-open">
          Available radio
        </Label>
      </RadioGroup>
      <div className="grid grid-cols-[auto_1fr] items-center gap-3">
        <Switch data-testid="switch-locked" disabled id="switch-locked" />
        <Label htmlFor="switch-locked">Locked switch</Label>
        <Checkbox data-testid="after-switch" id="after-switch" />
        <Label data-testid="after-switch-label" htmlFor="after-switch">
          Available after a switch
        </Label>
      </div>
      <Field orientation="horizontal">
        <Checkbox data-testid="cb-field" disabled id="cb-field" />
        <FieldLabel htmlFor="cb-field">Checkbox in a Field</FieldLabel>
      </Field>
      <RadioGroup>
        <Field orientation="horizontal">
          <RadioGroupItem
            data-testid="radio-field"
            disabled
            id="radio-field"
            value="field"
          />
          <FieldLabel htmlFor="radio-field">Radio in a Field</FieldLabel>
        </Field>
      </RadioGroup>
      <Field orientation="horizontal">
        <Switch data-testid="switch-field" disabled id="switch-field" />
        <FieldLabel htmlFor="switch-field">Switch in a Field</FieldLabel>
      </Field>
      <Field data-disabled orientation="horizontal">
        <Switch
          data-testid="switch-disabled-field"
          disabled
          id="switch-disabled-field"
        />
        <FieldLabel htmlFor="switch-disabled-field">
          Switch in a disabled Field
        </FieldLabel>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const measure = (id: string) => {
      const el = canvas.getByTestId(id);
      return {
        id,
        opacity: effectiveOpacity(el),
        notAllowed: getComputedStyle(el).cursor === "not-allowed",
      };
    };

    const disabledControls = [
      "cb-locked",
      "radio-locked",
      "switch-locked",
      "cb-field",
      "radio-field",
      "switch-field",
      "switch-disabled-field",
    ];
    await expect(disabledControls.map(measure)).toEqual(
      disabledControls.map((id) => ({ id, opacity: 0.5, notAllowed: true }))
    );

    const enabledLabels = [
      "cb-open-label",
      "radio-open-label",
      "after-switch-label",
    ];
    await expect(enabledLabels.map(measure)).toEqual(
      enabledLabels.map((id) => ({ id, opacity: 1, notAllowed: false }))
    );

    // The enabled labels still activate their own control.
    const clickToggles = async (labelId: string, controlId: string) => {
      const control = canvas.getByTestId(controlId);
      await expect(control).not.toHaveAttribute("data-checked");
      await userEvent.click(canvas.getByTestId(labelId));
      await expect(control).toHaveAttribute("data-checked");
    };
    await clickToggles("cb-open-label", "cb-open");
    await clickToggles("radio-open-label", "radio-open");
    await clickToggles("after-switch-label", "after-switch");
  },
};
