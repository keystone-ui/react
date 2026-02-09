import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@keystone/ui/native-select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@keystone/ui/field";

const meta = {
  title: "Components/NativeSelect",
  component: NativeSelect,
  parameters: {
    docs: {
      description: {
        component: `
A lightweight select component that uses the browser's native \`<select>\` element for maximum performance and mobile-optimized dropdowns.

\`\`\`tsx
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@keystone/ui/native-select";

// Basic usage
<NativeSelect>
  <NativeSelectOption value="">Select status</NativeSelectOption>
  <NativeSelectOption value="todo">Todo</NativeSelectOption>
  <NativeSelectOption value="in-progress">In Progress</NativeSelectOption>
  <NativeSelectOption value="done">Done</NativeSelectOption>
</NativeSelect>

// With option groups
<NativeSelect>
  <NativeSelectOption value="">Select department</NativeSelectOption>
  <NativeSelectOptGroup label="Engineering">
    <NativeSelectOption value="frontend">Frontend</NativeSelectOption>
    <NativeSelectOption value="backend">Backend</NativeSelectOption>
  </NativeSelectOptGroup>
</NativeSelect>
\`\`\`

## Native Select vs Select

Use \`NativeSelect\` for native browser behavior, better performance, or mobile-optimized dropdowns.
Use [\`Select\`](?path=/docs/components-select--docs) for custom styling, animations, or complex interactions.

## Features

- Native browser \`<select>\` element
- Mobile-optimized dropdown on touch devices
- Option groups with \`NativeSelectOptGroup\`
- Size variants (default, sm)
- Disabled and invalid states
- Form integration with Field component
`,
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
      description: "Size variant of the select",
    },
    disabled: {
      control: "boolean",
      description: "Whether the select is disabled",
    },
  },
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof NativeSelect>;

// Basic native select
export const Default: Story = {
  render: () => (
    <NativeSelect>
      <NativeSelectOption value="">Select status</NativeSelectOption>
      <NativeSelectOption value="todo">Todo</NativeSelectOption>
      <NativeSelectOption value="in-progress">In Progress</NativeSelectOption>
      <NativeSelectOption value="done">Done</NativeSelectOption>
      <NativeSelectOption value="cancelled">Cancelled</NativeSelectOption>
    </NativeSelect>
  ),
};

// With Field
export const FieldExample: Story = {
  name: "Field",
  render: () => (
    <Field>
      <FieldLabel htmlFor="native-select-field">Status</FieldLabel>
      <NativeSelect id="native-select-field">
        <NativeSelectOption value="">Select status</NativeSelectOption>
        <NativeSelectOption value="todo">Todo</NativeSelectOption>
        <NativeSelectOption value="in-progress">In Progress</NativeSelectOption>
        <NativeSelectOption value="done">Done</NativeSelectOption>
        <NativeSelectOption value="cancelled">Cancelled</NativeSelectOption>
      </NativeSelect>
      <FieldDescription>Choose the current status of the task.</FieldDescription>
    </Field>
  ),
};

// Groups
export const Groups: Story = {
  render: () => (
    <NativeSelect>
      <NativeSelectOption value="">Select department</NativeSelectOption>
      <NativeSelectOptGroup label="Engineering">
        <NativeSelectOption value="frontend">Frontend</NativeSelectOption>
        <NativeSelectOption value="backend">Backend</NativeSelectOption>
        <NativeSelectOption value="devops">DevOps</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Sales">
        <NativeSelectOption value="sales-rep">Sales Rep</NativeSelectOption>
        <NativeSelectOption value="account-manager">
          Account Manager
        </NativeSelectOption>
        <NativeSelectOption value="sales-director">
          Sales Director
        </NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Operations">
        <NativeSelectOption value="support">
          Customer Support
        </NativeSelectOption>
        <NativeSelectOption value="product-manager">
          Product Manager
        </NativeSelectOption>
        <NativeSelectOption value="ops-manager">
          Operations Manager
        </NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `NativeSelectOptGroup` to organize options into categories.",
      },
    },
  },
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <FieldGroup className="flex-row items-end">
      <Field>
        <FieldLabel>Default</FieldLabel>
        <NativeSelect size="default">
          <NativeSelectOption value="">Select fruit</NativeSelectOption>
          <NativeSelectOption value="apple">Apple</NativeSelectOption>
          <NativeSelectOption value="banana">Banana</NativeSelectOption>
          <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel>Small</FieldLabel>
        <NativeSelect size="sm">
          <NativeSelectOption value="">Select fruit</NativeSelectOption>
          <NativeSelectOption value="apple">Apple</NativeSelectOption>
          <NativeSelectOption value="banana">Banana</NativeSelectOption>
          <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
        </NativeSelect>
      </Field>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use the `size` prop to change the size. Available options are `"default"` and `"sm"`.',
      },
    },
  },
};

// Disabled
export const Disabled: Story = {
  render: () => (
    <NativeSelect disabled>
      <NativeSelectOption value="">Disabled</NativeSelectOption>
      <NativeSelectOption value="apple">Apple</NativeSelectOption>
      <NativeSelectOption value="banana">Banana</NativeSelectOption>
      <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
    </NativeSelect>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Add the `disabled` prop to the `NativeSelect` component to disable the select.",
      },
    },
  },
};

// Invalid
export const Invalid: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel>Fruit</FieldLabel>
      <NativeSelect aria-invalid="true">
        <NativeSelectOption value="">Error state</NativeSelectOption>
        <NativeSelectOption value="apple">Apple</NativeSelectOption>
        <NativeSelectOption value="banana">Banana</NativeSelectOption>
        <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
      </NativeSelect>
      <FieldError>Please select a fruit.</FieldError>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `aria-invalid` to show validation errors. Add the `data-invalid` attribute to the `Field` component for styling.",
      },
    },
  },
};

// Form example
export const FormExample: Story = {
  name: "Form",
  render: () => (
    <form
      className="w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        alert(
          `Status: ${formData.get("status")}\nPriority: ${formData.get("priority")}`
        );
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="form-status">Status</FieldLabel>
          <NativeSelect id="form-status" name="status">
            <NativeSelectOption value="">Select status</NativeSelectOption>
            <NativeSelectOption value="todo">Todo</NativeSelectOption>
            <NativeSelectOption value="in-progress">
              In Progress
            </NativeSelectOption>
            <NativeSelectOption value="done">Done</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="form-priority">Priority</FieldLabel>
          <NativeSelect id="form-priority" name="priority">
            <NativeSelectOption value="">Select priority</NativeSelectOption>
            <NativeSelectOption value="low">Low</NativeSelectOption>
            <NativeSelectOption value="medium">Medium</NativeSelectOption>
            <NativeSelectOption value="high">High</NativeSelectOption>
            <NativeSelectOption value="urgent">Urgent</NativeSelectOption>
          </NativeSelect>
        </Field>
      </FieldGroup>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `name` prop on `NativeSelect` to include the selected value in form submissions.",
      },
    },
  },
};
