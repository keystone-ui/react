import { DateInput } from "@keystoneui/react/date-input";
import { Field, FieldLabel } from "@keystoneui/react/field";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, spyOn, userEvent, within } from "storybook/test";

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
    const input =
      canvasElement.querySelector<HTMLInputElement>('input[type="date"]');
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveValue("");

    // The native picker is browser chrome, not DOM, so the observable fact
    // is `showPicker()` being invoked on this input.
    const showPicker = spyOn(
      input as HTMLInputElement,
      "showPicker"
    ).mockImplementation(() => {});
    await userEvent.click(button);
    await expect(showPicker).toHaveBeenCalledTimes(1);
  },
};

// A callback ref is what form libraries hand you (`{...register("date")}`
// in react-hook-form). The component used to adopt the forwarded ref
// *instead of* its own, so with a callback there was no `.current` and the
// picker button silently did nothing.
function CallbackRefDemo() {
  const [attached, setAttached] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <DateInput
        ref={(el) => {
          setAttached(el ? el.tagName.toLowerCase() : null);
        }}
      />
      <p className="text-muted-foreground text-sm" data-testid="ref-target">
        {attached ? `Ref received: <${attached}>` : "Ref not attached"}
      </p>
    </div>
  );
}

export const CallbackRef: Story = {
  name: "Callback Ref",
  render: () => <CallbackRefDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Forwarding a callback ref (as form libraries do) still lets the calendar button open the picker: the forwarded ref is merged with the internal one rather than replacing it.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ref-target")).toHaveTextContent(
      "Ref received: <input>"
    );

    const input =
      canvasElement.querySelector<HTMLInputElement>('input[type="date"]');
    const showPicker = spyOn(
      input as HTMLInputElement,
      "showPicker"
    ).mockImplementation(() => {});
    await userEvent.click(
      canvas.getByRole("button", { name: /open date picker/i })
    );
    await expect(showPicker).toHaveBeenCalledTimes(1);
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
