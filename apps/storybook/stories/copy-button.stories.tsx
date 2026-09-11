import { CopyButton } from "@keystoneui/react/copy-button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/CopyButton",
  component: CopyButton,
  parameters: {
    docs: {
      description: {
        component:
          "Copies a value to the clipboard and confirms it. Pairs with a value rather than wrapping it, so it composes beside a monospace ID, inside an InputGroup, or in a table cell.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: "usr_3f9a2c81" },
  render: (args) => (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">usr_3f9a2c81</span>
      <CopyButton {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  args: { value: "sizes" },
  render: () => (
    <div className="flex items-center gap-4">
      <CopyButton size="icon-xs" value="extra small" />
      <CopyButton size="icon-sm" value="small" />
      <CopyButton size="icon" value="default" />
      <CopyButton size="icon-lg" value="large" />
    </div>
  ),
};

export const Variants: Story = {
  args: { value: "variants" },
  render: () => (
    <div className="flex items-center gap-4">
      <CopyButton value="ghost" variant="ghost" />
      <CopyButton value="outline" variant="outline" />
      <CopyButton value="secondary" variant="secondary" />
    </div>
  ),
};

/**
 * The confirmation has to reach assistive technology, not just the pixels —
 * the icon swap alone says nothing to a screen reader.
 *
 * The clipboard is stubbed for the duration: headless Chrome refuses
 * `writeText` when the document is not focused, and the component correctly
 * declines to show a tick when the write fails. Stubbing keeps this story
 * about the component rather than about browser clipboard permissions.
 */
export const ConfirmsThroughItsAccessibleName: Story = {
  args: { value: "usr_3f9a2c81" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    });

    try {
      const button = canvas.getByRole("button");
      await expect(button).toHaveAccessibleName("Copy");

      await userEvent.click(button);
      await expect(button).toHaveAccessibleName("Copied");
    } finally {
      if (original) {
        Object.defineProperty(navigator, "clipboard", original);
      }
    }
  },
};
