import { DateInput } from "@keystoneui/react/date-input";
import { Field, FieldLabel } from "@keystoneui/react/field";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/Date Input",
  component: DateInput,
  parameters: {
    docs: {
      description: {
        component: `
A date input built on \`InputGroup\` with a native \`type="date"\` control and a calendar button that opens the browser's date picker.

\`\`\`tsx
import { DateInput } from "@keystoneui/react/date-input";

<DateInput />

<DateInput defaultValue="2025-02-22" />

<DateInput disabled />
\`\`\`

## Features

- Native browser date picker via \`showPicker()\`
- Calendar icon button with \`data-slot="input-group-button"\`
- Integrates with \`Field\` and \`FieldLabel\` for form layouts
- Supports all standard input attributes (disabled, min, max, etc.)
`,
      },
    },
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
  },
} satisfies Meta<typeof DateInput>;

export default meta;
type Story = StoryObj<typeof DateInput>;

export const Default: Story = {
  render: () => <DateInput />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /open date picker/i });
    await expect(button).toBeInTheDocument();
    const input = canvasElement.querySelector('input[type="date"]');
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveValue("");
  },
};

export const WithLabel: Story = {
  name: "With Label",
  render: () => (
    <Field>
      <FieldLabel htmlFor="date-input-label">Date</FieldLabel>
      <DateInput id="date-input-label" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Date");
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveAttribute("type", "date");
  },
};

export const WithDefaultValue: Story = {
  name: "With Default Value",
  render: () => <DateInput defaultValue="2025-02-22" />,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input[type="date"]');
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveValue("2025-02-22");
  },
};

export const Disabled: Story = {
  render: () => <DateInput disabled />,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input[type="date"]');
    await expect(input).toBeInTheDocument();
    await expect(input).toBeDisabled();
  },
};
