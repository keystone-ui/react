import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardContent } from "keystoneui/card";
import { Checkbox } from "keystoneui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "keystoneui/field";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";

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
import { Checkbox } from "keystoneui/checkbox";
import { Field, FieldLabel } from "keystoneui/field";

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
  argTypes: {
    checked: {
      control: "boolean",
      description: "Whether the checkbox is checked (controlled)",
    },
    defaultChecked: {
      control: "boolean",
      description: "Initial checked state (uncontrolled)",
    },
    disabled: {
      control: "boolean",
      description: "Whether the checkbox is disabled",
    },
    required: {
      control: "boolean",
      description: "Whether the checkbox is required",
    },
    name: {
      control: "text",
      description: "The name attribute for form submission",
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    // Click to check
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute("aria-checked", "true");

    // Click to uncheck
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute("aria-checked", "false");
  },
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
          defaultChecked
          id="terms-checkbox-desc"
          name="terms-checkbox-desc"
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
      <Field data-disabled orientation="horizontal">
        <Checkbox
          disabled
          id="toggle-checkbox-disabled"
          name="toggle-checkbox-disabled"
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
      <FieldLegend variant="label">
        Show these items on the desktop:
      </FieldLegend>
      <FieldDescription>
        Select the items you want to show on the desktop.
      </FieldDescription>
      <FieldGroup className="gap-3">
        <Field orientation="horizontal">
          <Checkbox
            defaultChecked
            id="finder-pref-9k2-hard-disks-ljj-checkbox"
            name="finder-pref-9k2-hard-disks-ljj-checkbox"
          />
          <FieldLabel
            className="font-normal"
            htmlFor="finder-pref-9k2-hard-disks-ljj-checkbox"
          >
            Hard disks
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            defaultChecked
            id="finder-pref-9k2-external-disks-1yg-checkbox"
            name="finder-pref-9k2-external-disks-1yg-checkbox"
          />
          <FieldLabel
            className="font-normal"
            htmlFor="finder-pref-9k2-external-disks-1yg-checkbox"
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
            className="font-normal"
            htmlFor="finder-pref-9k2-cds-dvds-fzt-checkbox"
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
            className="font-normal"
            htmlFor="finder-pref-9k2-connected-servers-6l2-checkbox"
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
      <Field data-invalid="true" orientation="horizontal">
        <Checkbox
          aria-invalid="true"
          id="terms-checkbox-invalid"
          name="terms-checkbox-invalid"
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
          'To show invalid styles, set `aria-invalid="true"` on the `<Checkbox>` for the red border and `data-invalid="true"` on the `<Field>` wrapper to turn the label text red. Both attributes work together to provide clear visual feedback for validation errors.',
      },
    },
  },
};

// Checked State (Controlled) Example
export const CheckedState: Story = {
  name: "Checked State",
  render() {
    const [checked, setChecked] = React.useState(false);

    return (
      <FieldGroup className="mx-auto w-64">
        <Field orientation="horizontal">
          <Checkbox
            checked={checked}
            id="controlled-checkbox"
            name="controlled-checkbox"
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

// Pill Checkbox Group Example
const pillOptions = [
  { label: "Social Media", value: "social-media" },
  { label: "Search Engine", value: "search-engine" },
  { label: "Referral", value: "referral" },
  { label: "Other", value: "other" },
];

export const PillCheckboxGroup: Story = {
  name: "Pill Checkbox Group",
  render: () => (
    <Card className="py-4 shadow-none">
      <CardContent className="px-4">
        <form>
          <FieldGroup>
            <FieldSet className="gap-4">
              <FieldLegend>How did you hear about us?</FieldLegend>
              <FieldDescription className="line-clamp-1">
                Select the option that best describes how you heard about us.
              </FieldDescription>
              <FieldGroup className="flex flex-row flex-wrap gap-2 rounded-full">
                {pillOptions.map((option) => (
                  <FieldLabel
                    className="w-fit!"
                    htmlFor={`pill-${option.value}`}
                    key={option.value}
                  >
                    <Field
                      className="gap-1.5 overflow-hidden px-3! py-1.5! transition-all duration-100 ease-linear group-has-data-checked/field-label:px-2!"
                      orientation="horizontal"
                    >
                      <Checkbox
                        className="-ml-6 -translate-x-1 rounded-full transition-all duration-100 ease-linear data-checked:ml-0 data-checked:translate-x-0"
                        defaultChecked={option.value === "social-media"}
                        id={`pill-${option.value}`}
                        value={option.value}
                      />
                      <FieldTitle>{option.label}</FieldTitle>
                    </Field>
                  </FieldLabel>
                ))}
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Pill-style checkboxes with animated check indicator. The checkbox slides in from the left using CSS transitions on `margin-left` and `translate-x` when checked.",
      },
    },
  },
};
