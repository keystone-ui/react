import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "@keystone/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@keystone/ui/field";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component: `
# Checkbox

A checkbox component built on Base UI's Checkbox primitive for accessible, customizable toggle inputs.

## Features

- Built on Base UI's Checkbox primitive for robust accessibility
- Supports controlled and uncontrolled modes
- Works seamlessly with Field components for form layouts
- Includes focus, hover, disabled, and invalid states

## Usage

Pair the checkbox with \`Field\` and \`FieldLabel\` for proper layout and labeling.

\`\`\`tsx
import { Checkbox } from "@keystone/ui/checkbox";
import { Field, FieldLabel } from "@keystone/ui/field";

<Field orientation="horizontal">
  <Checkbox id="terms" name="terms" />
  <FieldLabel htmlFor="terms">Accept terms and conditions</FieldLabel>
</Field>
\`\`\`

## Controlled State

Use \`checked\` and \`onCheckedChange\` to control the checkbox state:

\`\`\`tsx
const [checked, setChecked] = React.useState(false)

<Checkbox checked={checked} onCheckedChange={setChecked} />
\`\`\`
`,
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof Checkbox>;

// Basic Example
export const Basic: Story = {
  name: "Basic",
  render: () => (
    <FieldGroup className="mx-auto w-56">
      <Field orientation="horizontal">
        <Checkbox id="terms-checkbox-basic" name="terms-checkbox-basic" />
        <FieldLabel htmlFor="terms-checkbox-basic">
          Accept terms and conditions
        </FieldLabel>
      </Field>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Pair the checkbox with `Field` and `FieldLabel` for proper layout and labeling.",
      },
    },
  },
};

// Description Example
export const Description: Story = {
  name: "Description",
  render: () => (
    <FieldGroup className="mx-auto w-72">
      <Field orientation="horizontal">
        <Checkbox
          id="terms-checkbox-desc"
          name="terms-checkbox-desc"
          defaultChecked
        />
        <FieldContent>
          <FieldLabel htmlFor="terms-checkbox-desc">
            Accept terms and conditions
          </FieldLabel>
          <FieldDescription>
            By clicking this checkbox, you agree to the terms and conditions.
          </FieldDescription>
        </FieldContent>
      </Field>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `FieldContent` and `FieldDescription` for helper text alongside the checkbox.",
      },
    },
  },
};

// Disabled Example
export const Disabled: Story = {
  name: "Disabled",
  render: () => (
    <FieldGroup className="mx-auto w-56">
      <Field orientation="horizontal" data-disabled>
        <Checkbox
          id="toggle-checkbox-disabled"
          name="toggle-checkbox-disabled"
          disabled
        />
        <FieldLabel htmlFor="toggle-checkbox-disabled">
          Enable notifications
        </FieldLabel>
      </Field>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `disabled` prop to prevent interaction and add the `data-disabled` attribute to the `<Field>` component for disabled styles.",
      },
    },
  },
};

// Group Example
export const Group: Story = {
  name: "Group",
  render: () => (
    <FieldSet>
      <FieldLegend variant="label">Show these items on the desktop:</FieldLegend>
      <FieldDescription>
        Select the items you want to show on the desktop.
      </FieldDescription>
      <FieldGroup className="gap-3">
        <Field orientation="horizontal">
          <Checkbox
            id="finder-pref-9k2-hard-disks-ljj-checkbox"
            name="finder-pref-9k2-hard-disks-ljj-checkbox"
            defaultChecked
          />
          <FieldLabel
            htmlFor="finder-pref-9k2-hard-disks-ljj-checkbox"
            className="font-normal"
          >
            Hard disks
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="finder-pref-9k2-external-disks-1yg-checkbox"
            name="finder-pref-9k2-external-disks-1yg-checkbox"
            defaultChecked
          />
          <FieldLabel
            htmlFor="finder-pref-9k2-external-disks-1yg-checkbox"
            className="font-normal"
          >
            External disks
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="finder-pref-9k2-cds-dvds-fzt-checkbox"
            name="finder-pref-9k2-cds-dvds-fzt-checkbox"
          />
          <FieldLabel
            htmlFor="finder-pref-9k2-cds-dvds-fzt-checkbox"
            className="font-normal"
          >
            CDs, DVDs, and iPods
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="finder-pref-9k2-connected-servers-6l2-checkbox"
            name="finder-pref-9k2-connected-servers-6l2-checkbox"
          />
          <FieldLabel
            htmlFor="finder-pref-9k2-connected-servers-6l2-checkbox"
            className="font-normal"
          >
            Connected servers
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
  parameters: {
    docs: {
      description: {
        story: "Use multiple fields to create a checkbox list.",
      },
    },
  },
};

// Invalid Example
export const Invalid: Story = {
  name: "Invalid",
  render: () => (
    <FieldGroup className="mx-auto w-56">
      <Field orientation="horizontal" data-invalid="true">
        <Checkbox
          id="terms-checkbox-invalid"
          name="terms-checkbox-invalid"
          aria-invalid="true"
        />
        <FieldLabel htmlFor="terms-checkbox-invalid">
          Accept terms and conditions
        </FieldLabel>
      </Field>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "To show invalid styles, set `aria-invalid=\"true\"` on the `<Checkbox>` for the red border and `data-invalid=\"true\"` on the `<Field>` wrapper to turn the label text red. Both attributes work together to provide clear visual feedback for validation errors.",
      },
    },
  },
};

// Checked State (Controlled) Example
export const CheckedState: Story = {
  name: "Checked State",
  render: function CheckedStateExample() {
    const [checked, setChecked] = React.useState(false);

    return (
      <FieldGroup className="mx-auto w-64">
        <Field orientation="horizontal">
          <Checkbox
            id="controlled-checkbox"
            name="controlled-checkbox"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <FieldLabel htmlFor="controlled-checkbox">
            {checked ? "Checked" : "Unchecked"}
          </FieldLabel>
        </Field>
        <p className="text-muted-foreground text-sm">
          Current state: <code>{String(checked)}</code>
        </p>
      </FieldGroup>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use `defaultChecked` for uncontrolled checkboxes, or `checked` and `onCheckedChange` to control the state.",
      },
    },
  },
};
