import { Field, FieldError, FieldLabel } from "@keystoneui/react/field";
import { Textarea } from "@keystoneui/react/textarea";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component: `
A multi-line text input for longer form content. Auto-sizes to fit content via \`field-sizing-content\`. Resizing is disabled by default.

\`\`\`tsx
import { Textarea } from "@keystoneui/react/textarea";
import { Field, FieldLabel } from "@keystoneui/react/field";

<Textarea placeholder="Enter your message" />

<Field>
  <FieldLabel htmlFor="bio">Bio</FieldLabel>
  <Textarea id="bio" placeholder="Tell us about yourself" />
</Field>

<Textarea disabled placeholder="Disabled" />

<Textarea aria-invalid placeholder="Invalid" />
\`\`\`
`,
      },
    },
  },
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    disabled: {
      control: "boolean",
      description: "Whether the textarea is disabled",
    },
    rows: {
      control: "number",
      description: "Initial number of visible rows",
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    await expect(textarea).toBeInTheDocument();
    await userEvent.type(textarea, "Hello");
    await expect(textarea).toHaveValue("Hello");
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Enter your message...",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("Enter your message...");
    await expect(textarea).toBeInTheDocument();
    await expect(textarea).toHaveAttribute("data-slot", "textarea");
  },
};

export const WithLabel: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="textarea-label">Bio</FieldLabel>
      <Textarea id="textarea-label" placeholder="Tell us about yourself" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: /bio/i });
    await expect(textarea).toBeInTheDocument();
    await userEvent.type(textarea, "Developer");
    await expect(textarea).toHaveValue("Developer");
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled textarea",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("Disabled textarea");
    await expect(textarea).toBeDisabled();
  },
};

export const WithError: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel htmlFor="textarea-error">Email</FieldLabel>
      <Textarea
        aria-invalid
        id="textarea-error"
        placeholder="Enter your email"
      />
      <FieldError>This field contains validation errors.</FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: /email/i });
    await expect(textarea).toHaveAttribute("aria-invalid", "true");
    await expect(
      canvas.getByText("This field contains validation errors.")
    ).toBeInTheDocument();
  },
};
