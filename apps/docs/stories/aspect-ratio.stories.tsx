import { AspectRatio } from "@keystone/ui/aspect-ratio";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/AspectRatio",
  component: AspectRatio,
  parameters: {
    docs: {
      description: {
        component: `
A component that displays content within a desired ratio.

\`\`\`tsx
import { AspectRatio } from "@keystone/ui/aspect-ratio";

<AspectRatio ratio={16 / 9}>
  <img src="..." alt="..." className="rounded-lg object-cover" />
</AspectRatio>
\`\`\`

## Features

- Uses a CSS custom property (\`--ratio\`) with Tailwind's \`aspect-(--ratio)\` utility
- Accepts any \`ratio\` as a number (e.g. \`16 / 9\`, \`1 / 1\`, \`9 / 16\`)
- Children are positioned relative to the container for easy \`object-cover\` image layouts
`,
      },
    },
  },
  argTypes: {
    ratio: {
      control: "number",
      description: "The desired aspect ratio (width / height)",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof AspectRatio>;

// ── Core ────────────────────────────────────────────────────────────────

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A 16:9 landscape aspect ratio, commonly used for video embeds and hero images.",
      },
    },
  },
  render: () => (
    <div className="w-full max-w-md">
      <AspectRatio className="rounded-lg bg-muted" ratio={16 / 9}>
        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
          16 : 9
        </div>
      </AspectRatio>
    </div>
  ),
};

// ── Examples ─────────────────────────────────────────────────────────────

export const Square: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A square aspect ratio using `ratio={1 / 1}`. Useful for avatars, thumbnails, and profile images.",
      },
    },
  },
  render: () => (
    <div className="w-full max-w-48">
      <AspectRatio className="rounded-lg bg-muted" ratio={1 / 1}>
        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
          1 : 1
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A portrait aspect ratio using `ratio={9 / 16}`. Useful for mobile-style content and vertical images.",
      },
    },
  },
  render: () => (
    <div className="w-full max-w-40">
      <AspectRatio className="rounded-lg bg-muted" ratio={9 / 16}>
        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
          9 : 16
        </div>
      </AspectRatio>
    </div>
  ),
};
