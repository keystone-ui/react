import { Separator } from "@keystoneui/react/separator";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/Separator",
  component: Separator,
  parameters: {
    docs: {
      description: {
        component: `
A visual divider for separating content. Supports horizontal and vertical orientations.

\`\`\`tsx
import { Separator } from "@keystoneui/react/separator";

<Separator />
<Separator orientation="vertical" />
<Separator decorative={false} />
\`\`\`

## Features

- **Horizontal** (default) — full-width line for stacking content
- **Vertical** — full-height line for side-by-side layouts
- **decorative** — when \`true\` (default), uses \`role="none"\` so screen readers skip it; when \`false\`, uses \`role="separator"\` for semantic structure
`,
      },
    },
  },
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout direction of the separator",
    },
    decorative: {
      control: "boolean",
      description:
        "When true, screen readers skip it. When false, exposes role='separator'.",
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Separator />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole("none");
    await expect(separator).toBeVisible();
    await expect(separator).toHaveAttribute("data-slot", "separator");
    await expect(separator).toHaveAttribute("data-orientation", "horizontal");
  },
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center gap-4">
      <span className="text-sm">Section A</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Section B</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Section C</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separators = canvas.getAllByRole("none");
    await expect(separators.length).toBeGreaterThanOrEqual(2);
    await expect(separators[0]).toHaveAttribute("data-orientation", "vertical");
  },
};

export const WithContent: Story = {
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div>
        <h3 className="font-medium text-sm">Introduction</h3>
        <p className="text-muted-foreground text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>
      <Separator />
      <div>
        <h3 className="font-medium text-sm">Details</h3>
        <p className="text-muted-foreground text-sm">
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
      <Separator />
      <div>
        <h3 className="font-medium text-sm">Conclusion</h3>
        <p className="text-muted-foreground text-sm">
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separators = canvas.getAllByRole("none");
    await expect(separators.length).toBe(2);
    await expect(canvas.getByText("Introduction")).toBeVisible();
    await expect(canvas.getByText("Details")).toBeVisible();
    await expect(canvas.getByText("Conclusion")).toBeVisible();
  },
};

export const DecorativeVsSemantic: Story = {
  name: "Decorative vs Semantic",
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="space-y-2">
        <span className="font-medium text-sm">decorative (default)</span>
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            role="none" — not announced by screen readers
          </p>
          <Separator decorative />
        </div>
      </div>
      <div className="space-y-2">
        <span className="font-medium text-sm">decorative={false}</span>
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            role="separator" — announced for semantic structure
          </p>
          <Separator decorative={false} />
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const decorative = canvas.getByRole("none");
    const semantic = canvas.getByRole("separator");
    await expect(decorative).toBeVisible();
    await expect(semantic).toBeVisible();
  },
};
