import { Card, CardContent, CardHeader } from "@keystone/ui/card";
import { Skeleton, SkeletonGroup } from "@keystone/ui/skeleton";
import type { Meta, StoryObj } from "@storybook/react-vite";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component: `
A placeholder loading component that mimics the shape of content before it loads.

\`\`\`tsx
import { Skeleton, SkeletonGroup } from "@keystone/ui/skeleton";

// Basic pulse skeleton
<Skeleton className="h-4 w-[200px]" />

// No animation
<Skeleton className="h-4 w-[200px]" animationType="none" />

// Synchronized shimmer via SkeletonGroup
<SkeletonGroup>
  <Skeleton className="h-4 w-[200px]" animationType="none" />
  <Skeleton className="h-4 w-[150px]" animationType="none" />
</SkeletonGroup>
\`\`\`

## Animation Types

- **pulse** (default) — Standard pulsing opacity animation.
- **none** — No animation. Useful as a static placeholder or inside a \`SkeletonGroup\`.

## SkeletonGroup

Wrap skeletons in a \`SkeletonGroup\` to apply a synchronized shimmer sweep across all children. Set \`animationType="none"\` on child skeletons so the shimmer is the only animation.
`,
      },
    },
  },
  argTypes: {
    animationType: {
      control: "select",
      options: ["pulse", "none"],
      description: "Animation style for the skeleton",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for sizing and shape",
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof Skeleton>;

// ── Core ────────────────────────────────────────────────────────────────

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "An avatar skeleton with two text lines — the default loading pattern for user profiles.",
      },
    },
  },
  render: () => (
    <div className="flex w-fit items-center gap-4">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="grid gap-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  ),
};

// ── Examples ─────────────────────────────────────────────────────────────

export const CardSkeleton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A card skeleton with header text lines and a content area placeholder.",
      },
    },
  },
  render: () => (
    <Card className="w-full max-w-xs">
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full" />
      </CardContent>
    </Card>
  ),
};

export const Text: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A text block skeleton with three lines. The last line is shorter to mimic a natural paragraph ending.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  ),
};

export const Form: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A form skeleton with label and input placeholders, plus a submit button.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-xs flex-col gap-7">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  ),
};

export const Table: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A table skeleton with five rows, each containing three columns of varying widths.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div className="flex gap-4" key={index}>
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  ),
};

export const NoAnimation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use `animationType="none"` to render static skeletons without the pulse animation.',
      },
    },
  },
  render: () => (
    <div className="flex w-fit items-center gap-4">
      <Skeleton
        animationType="none"
        className="size-10 shrink-0 rounded-full"
      />
      <div className="grid gap-2">
        <Skeleton animationType="none" className="h-4 w-[150px]" />
        <Skeleton animationType="none" className="h-4 w-[100px]" />
      </div>
    </div>
  ),
};

export const Shimmer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Wrap skeletons in a `SkeletonGroup` to apply a synchronized shimmer that sweeps across all children at once. Set `animationType="none"` on child skeletons.',
      },
    },
  },
  render: () => (
    <SkeletonGroup className="flex w-fit items-center gap-4">
      <Skeleton
        animationType="none"
        className="size-10 shrink-0 rounded-full"
      />
      <div className="grid gap-2">
        <Skeleton animationType="none" className="h-4 w-[150px]" />
        <Skeleton animationType="none" className="h-4 w-[100px]" />
      </div>
    </SkeletonGroup>
  ),
};

export const ShimmerCard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A card skeleton inside a `SkeletonGroup` for a synchronized shimmer effect across the card layout.",
      },
    },
  },
  render: () => (
    <SkeletonGroup className="w-full max-w-xs">
      <Card>
        <CardHeader>
          <Skeleton animationType="none" className="h-4 w-2/3" />
          <Skeleton animationType="none" className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton animationType="none" className="aspect-video w-full" />
        </CardContent>
      </Card>
    </SkeletonGroup>
  ),
};
