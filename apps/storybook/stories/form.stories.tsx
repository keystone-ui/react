import { Button } from "@keystoneui/react/button";
import { Description, ErrorMessage, Form, Label } from "@keystoneui/react/form";
import { Input } from "@keystoneui/react/input";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/Form",
  component: Form,
  parameters: {
    docs: {
      description: {
        component: `
A styled form layout container with Label, Description, and ErrorMessage helpers for building accessible forms.

\`\`\`tsx
import { Form, Label, Description, ErrorMessage } from "@keystoneui/react/form";
import { Input } from "@keystoneui/react/input";
import { Button } from "@keystoneui/react/button";

<form onSubmit={(e) => e.preventDefault()}>
  <Form>
    <Label htmlFor="email">Email</Label>
    <Input id="email" />
    <Description>Enter your email address.</Description>
    <Button type="submit">Submit</Button>
  </Form>
</form>
\`\`\`

## Components

- \`Form\` - Grid layout container for form fields
- \`Label\` - Accessible label for form controls
- \`Description\` - Helper text (muted)
- \`ErrorMessage\` - Validation error text (destructive)
`,
      },
    },
  },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof Form>;

export const Default: Story = {
  render: () => (
    <form onSubmit={(e) => e.preventDefault()}>
      <Form>
        <Label htmlFor="form-default-email">Email</Label>
        <Input id="form-default-email" placeholder="name@example.com" />
        <Description>We&apos;ll never share your email.</Description>
        <Button type="submit">Submit</Button>
      </Form>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("name@example.com");
    await expect(input).toBeInTheDocument();
    await userEvent.type(input, "test@example.com");
    await expect(input).toHaveValue("test@example.com");
  },
};

export const WithValidation: Story = {
  render: () => (
    <form onSubmit={(e) => e.preventDefault()}>
      <Form>
        <Label htmlFor="form-validation-email">Email</Label>
        <Input
          aria-invalid
          id="form-validation-email"
          placeholder="invalid-email"
          type="email"
        />
        <ErrorMessage>Enter a valid email address.</ErrorMessage>
        <Button type="submit">Submit</Button>
      </Form>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Enter a valid email address.")
    ).toBeInTheDocument();
    const input = canvas.getByPlaceholderText("invalid-email");
    await expect(input).toHaveAttribute("aria-invalid", "true");
  },
};
