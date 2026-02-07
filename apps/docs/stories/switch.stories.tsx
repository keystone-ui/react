import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@keystone/ui/field";
import { Switch } from "@keystone/ui/switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component: `
# Switch

A switch component built on Base UI's Switch primitive for accessible, customizable toggle inputs.

## Features

- Built on Base UI's Switch primitive for robust accessibility
- Supports controlled and uncontrolled modes
- Two size variants: \`default\` and \`sm\`
- Works seamlessly with Field components for form layouts
- Includes focus, hover, disabled, and invalid states

## Usage

Pair the switch with \`Field\` and \`FieldLabel\` for proper layout and labeling.

\`\`\`tsx
import { Switch } from "@keystone/ui/switch";
import { Field, FieldLabel } from "@keystone/ui/field";

<Field orientation="horizontal">
  <Switch id="airplane-mode" />
  <FieldLabel htmlFor="airplane-mode">Airplane Mode</FieldLabel>
</Field>
\`\`\`

## Controlled State

Use \`checked\` and \`onCheckedChange\` to control the switch state:

\`\`\`tsx
const [checked, setChecked] = React.useState(false)

<Switch checked={checked} onCheckedChange={setChecked} />
\`\`\`
`,
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof Switch>;

// Basic Example
export const Basic: Story = {
  name: "Basic",
  render: () => (
    <Field orientation="horizontal" className="w-fit">
      <Switch id="airplane-mode" />
      <FieldLabel htmlFor="airplane-mode">Airplane Mode</FieldLabel>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Pair the switch with `Field` and `FieldLabel` for proper layout and labeling.",
      },
    },
  },
};

// Description Example
export const Description: Story = {
  name: "Description",
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
  parameters: {
    docs: {
      description: {
        story:
          "Use `FieldContent` and `FieldDescription` for helper text alongside the switch.",
      },
    },
  },
};

// Choice Card Example
export const ChoiceCard: Story = {
  name: "Choice Card",
  render: () => (
    <FieldGroup className="w-full max-w-sm">
      <FieldLabel htmlFor="switch-share">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Share across devices</FieldTitle>
            <FieldDescription>
              Focus is shared across devices, and turns off when you leave the
              app.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-share" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="switch-notifications">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Enable notifications</FieldTitle>
            <FieldDescription>
              Receive notifications when focus mode is enabled or disabled.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-notifications" defaultChecked />
        </Field>
      </FieldLabel>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `FieldTitle` instead of `FieldLabel` inside a clickable `FieldLabel` wrapper to create choice card patterns.",
      },
    },
  },
};

// Disabled Example
export const Disabled: Story = {
  name: "Disabled",
  render: () => (
    <Field orientation="horizontal" data-disabled className="w-fit">
      <Switch id="switch-disabled-unchecked" disabled />
      <FieldLabel htmlFor="switch-disabled-unchecked">Disabled</FieldLabel>
    </Field>
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

// Invalid Example
export const Invalid: Story = {
  name: "Invalid",
  render: () => (
    <Field orientation="horizontal" className="max-w-sm" data-invalid>
      <FieldContent>
        <FieldLabel htmlFor="switch-terms">
          Accept terms and conditions
        </FieldLabel>
        <FieldDescription>
          You must accept the terms and conditions to continue.
        </FieldDescription>
      </FieldContent>
      <Switch id="switch-terms" aria-invalid />
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'To show invalid styles, set `aria-invalid` on the `<Switch>` for the red border and `data-invalid` on the `<Field>` wrapper to turn the label text red. Both attributes work together to provide clear visual feedback for validation errors.',
      },
    },
  },
};

// Sizes Example
export const Sizes: Story = {
  name: "Sizes",
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
  parameters: {
    docs: {
      description: {
        story:
          "The switch supports two sizes: `sm` for compact layouts and `default` for standard use.",
      },
    },
  },
};
