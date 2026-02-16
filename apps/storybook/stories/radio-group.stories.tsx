import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "keystoneui/field";
import { Label } from "keystoneui/label";
import { RadioGroup, RadioGroupItem } from "keystoneui/radio-group";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component: `
# RadioGroup

A radio group component built on Base UI's RadioGroup and Radio primitives for accessible, single-selection inputs.

## Features

- Built on Base UI's RadioGroup primitive for robust accessibility
- Supports controlled and uncontrolled modes
- Works seamlessly with Field components for form layouts
- Includes focus, hover, disabled, and invalid states

## Usage

Use \`RadioGroup\` with \`RadioGroupItem\` and labels for proper accessibility.

\`\`\`tsx
import { RadioGroup, RadioGroupItem } from "keystoneui/radio-group";
import { Label } from "keystoneui/label";

<RadioGroup defaultValue="option1">
  <div className="flex items-center gap-3">
    <RadioGroupItem value="option1" id="r1" />
    <Label htmlFor="r1">Option 1</Label>
  </div>
  <div className="flex items-center gap-3">
    <RadioGroupItem value="option2" id="r2" />
    <Label htmlFor="r2">Option 2</Label>
  </div>
</RadioGroup>
\`\`\`

## Controlled State

Use \`value\` and \`onValueChange\` to control the selection:

\`\`\`tsx
const [value, setValue] = React.useState("option1")

<RadioGroup value={value} onValueChange={setValue}>
  {/* items */}
</RadioGroup>
\`\`\`

## API Reference

See the [Base UI Radio Group documentation](https://base-ui.com/react/components/radio-group#api-reference).
`,
      },
    },
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the entire radio group is disabled",
    },
  },
  subcomponents: { RadioGroupItem },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof RadioGroup>;

// Basic Example
export const Basic: Story = {
  name: "Basic",
  render: () => (
    <RadioGroup className="w-fit" defaultValue="comfortable">
      <div className="flex items-center gap-3">
        <RadioGroupItem id="r1" value="default" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem id="r2" value="comfortable" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem id="r3" value="compact" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");

    // Click the first radio button ("Default")
    await userEvent.click(radios[0]);
    await expect(radios[0]).toBeChecked();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Basic radio group with Label components for accessible labeling.",
      },
    },
  },
};

// Horizontal Example
export const Horizontal: Story = {
  name: "Horizontal",
  render: () => (
    <RadioGroup className="flex gap-6" defaultValue="comfortable">
      <div className="flex items-center gap-2">
        <RadioGroupItem id="h-r1" value="default" />
        <Label htmlFor="h-r1">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="h-r2" value="comfortable" />
        <Label htmlFor="h-r2">Comfortable</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="h-r3" value="compact" />
        <Label htmlFor="h-r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `flex` on the `RadioGroup` instead of the default `grid` layout to arrange items horizontally.",
      },
    },
  },
};

// Description Example
export const Description: Story = {
  name: "Description",
  render: () => (
    <RadioGroup className="w-fit" defaultValue="comfortable">
      <Field orientation="horizontal">
        <RadioGroupItem id="desc-r1" value="default" />
        <FieldContent>
          <FieldLabel htmlFor="desc-r1">Default</FieldLabel>
          <FieldDescription>
            Standard spacing for most use cases.
          </FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem id="desc-r2" value="comfortable" />
        <FieldContent>
          <FieldLabel htmlFor="desc-r2">Comfortable</FieldLabel>
          <FieldDescription>More space between elements.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem id="desc-r3" value="compact" />
        <FieldContent>
          <FieldLabel htmlFor="desc-r3">Compact</FieldLabel>
          <FieldDescription>
            Minimal spacing for dense layouts.
          </FieldDescription>
        </FieldContent>
      </Field>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `FieldContent` and `FieldDescription` for helper text alongside each option.",
      },
    },
  },
};

// Choice Card Example
export const ChoiceCard: Story = {
  name: "Choice Card",
  render: () => (
    <RadioGroup className="max-w-sm" defaultValue="plus">
      <FieldLabel htmlFor="plus-plan">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Plus</FieldTitle>
            <FieldDescription>
              For individuals and small teams.
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem id="plus-plan" value="plus" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="pro-plan">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Pro</FieldTitle>
            <FieldDescription>For growing businesses.</FieldDescription>
          </FieldContent>
          <RadioGroupItem id="pro-plan" value="pro" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="enterprise-plan">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Enterprise</FieldTitle>
            <FieldDescription>
              For large teams and enterprises.
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem id="enterprise-plan" value="enterprise" />
        </Field>
      </FieldLabel>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `FieldLabel` to wrap the entire `Field` for a clickable card-style selection.",
      },
    },
  },
};

// Fieldset Example
export const Fieldset: Story = {
  name: "Fieldset",
  render: () => (
    <FieldSet className="w-full max-w-xs">
      <FieldLegend variant="label">Subscription Plan</FieldLegend>
      <FieldDescription>
        Yearly and lifetime plans offer significant savings.
      </FieldDescription>
      <RadioGroup defaultValue="monthly">
        <Field orientation="horizontal">
          <RadioGroupItem id="plan-monthly" value="monthly" />
          <FieldLabel className="font-normal" htmlFor="plan-monthly">
            Monthly ($9.99/month)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="plan-yearly" value="yearly" />
          <FieldLabel className="font-normal" htmlFor="plan-yearly">
            Yearly ($99.99/year)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="plan-lifetime" value="lifetime" />
          <FieldLabel className="font-normal" htmlFor="plan-lifetime">
            Lifetime ($299.99)
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `FieldSet` and `FieldLegend` to group radio items with a label and description.",
      },
    },
  },
};

// Disabled Example
export const Disabled: Story = {
  name: "Disabled",
  render: () => (
    <RadioGroup className="w-fit" defaultValue="option2">
      <Field data-disabled orientation="horizontal">
        <RadioGroupItem disabled id="disabled-1" value="option1" />
        <FieldLabel className="font-normal" htmlFor="disabled-1">
          Disabled
        </FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem id="disabled-2" value="option2" />
        <FieldLabel className="font-normal" htmlFor="disabled-2">
          Option 2
        </FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem id="disabled-3" value="option3" />
        <FieldLabel className="font-normal" htmlFor="disabled-3">
          Option 3
        </FieldLabel>
      </Field>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `disabled` prop on individual `RadioGroupItem` components to disable specific options. Add `data-disabled` to the `Field` for consistent disabled styling.",
      },
    },
  },
};

// Invalid Example
export const Invalid: Story = {
  name: "Invalid",
  render: () => (
    <FieldSet className="w-full max-w-xs">
      <FieldLegend variant="label">Notification Preferences</FieldLegend>
      <FieldDescription>
        Choose how you want to receive notifications.
      </FieldDescription>
      <RadioGroup defaultValue="email">
        <Field data-invalid="true" orientation="horizontal">
          <RadioGroupItem
            aria-invalid="true"
            id="invalid-email"
            value="email"
          />
          <FieldLabel className="font-normal" htmlFor="invalid-email">
            Email only
          </FieldLabel>
        </Field>
        <Field data-invalid="true" orientation="horizontal">
          <RadioGroupItem aria-invalid="true" id="invalid-sms" value="sms" />
          <FieldLabel className="font-normal" htmlFor="invalid-sms">
            SMS only
          </FieldLabel>
        </Field>
        <Field data-invalid="true" orientation="horizontal">
          <RadioGroupItem aria-invalid="true" id="invalid-both" value="both" />
          <FieldLabel className="font-normal" htmlFor="invalid-both">
            Both Email & SMS
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'To show invalid styles, set `aria-invalid="true"` on each `RadioGroupItem` for the red border and `data-invalid="true"` on the `Field` wrapper to turn the label text red.',
      },
    },
  },
};
