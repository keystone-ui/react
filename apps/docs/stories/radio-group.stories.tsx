import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@keystone/ui/field";
import { Label } from "@keystone/ui/label";
import { RadioGroup, RadioGroupItem } from "@keystone/ui/radio-group";

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
import { RadioGroup, RadioGroupItem } from "@keystone/ui/radio-group";
import { Label } from "@keystone/ui/label";

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
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof RadioGroup>;

// Basic Example
export const Basic: Story = {
  name: "Basic",
  render: () => (
    <RadioGroup defaultValue="comfortable" className="w-fit">
      <div className="flex items-center gap-3">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
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
    <RadioGroup defaultValue="comfortable" className="flex gap-6">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="default" id="h-r1" />
        <Label htmlFor="h-r1">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="comfortable" id="h-r2" />
        <Label htmlFor="h-r2">Comfortable</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="compact" id="h-r3" />
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
    <RadioGroup defaultValue="comfortable" className="w-fit">
      <Field orientation="horizontal">
        <RadioGroupItem value="default" id="desc-r1" />
        <FieldContent>
          <FieldLabel htmlFor="desc-r1">Default</FieldLabel>
          <FieldDescription>
            Standard spacing for most use cases.
          </FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="comfortable" id="desc-r2" />
        <FieldContent>
          <FieldLabel htmlFor="desc-r2">Comfortable</FieldLabel>
          <FieldDescription>More space between elements.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="compact" id="desc-r3" />
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
    <RadioGroup defaultValue="plus" className="max-w-sm">
      <FieldLabel htmlFor="plus-plan">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Plus</FieldTitle>
            <FieldDescription>
              For individuals and small teams.
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem value="plus" id="plus-plan" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="pro-plan">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Pro</FieldTitle>
            <FieldDescription>For growing businesses.</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="pro" id="pro-plan" />
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
          <RadioGroupItem value="enterprise" id="enterprise-plan" />
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
          <RadioGroupItem value="monthly" id="plan-monthly" />
          <FieldLabel htmlFor="plan-monthly" className="font-normal">
            Monthly ($9.99/month)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="yearly" id="plan-yearly" />
          <FieldLabel htmlFor="plan-yearly" className="font-normal">
            Yearly ($99.99/year)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="lifetime" id="plan-lifetime" />
          <FieldLabel htmlFor="plan-lifetime" className="font-normal">
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
    <RadioGroup defaultValue="option2" className="w-fit">
      <Field orientation="horizontal" data-disabled>
        <RadioGroupItem value="option1" id="disabled-1" disabled />
        <FieldLabel htmlFor="disabled-1" className="font-normal">
          Disabled
        </FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="option2" id="disabled-2" />
        <FieldLabel htmlFor="disabled-2" className="font-normal">
          Option 2
        </FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="option3" id="disabled-3" />
        <FieldLabel htmlFor="disabled-3" className="font-normal">
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
        <Field orientation="horizontal" data-invalid="true">
          <RadioGroupItem value="email" id="invalid-email" aria-invalid="true" />
          <FieldLabel htmlFor="invalid-email" className="font-normal">
            Email only
          </FieldLabel>
        </Field>
        <Field orientation="horizontal" data-invalid="true">
          <RadioGroupItem value="sms" id="invalid-sms" aria-invalid="true" />
          <FieldLabel htmlFor="invalid-sms" className="font-normal">
            SMS only
          </FieldLabel>
        </Field>
        <Field orientation="horizontal" data-invalid="true">
          <RadioGroupItem value="both" id="invalid-both" aria-invalid="true" />
          <FieldLabel htmlFor="invalid-both" className="font-normal">
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
