import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressLabel,
  CircularProgressTrack,
  CircularProgressValue,
} from "@keystoneui/react/circular-progress";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@keystoneui/react/slider";
import { FlameIcon, TrendingUpIcon, ZapIcon } from "lucide-react";
import { useEffect, useState } from "react";

const meta = {
  title: "Components/CircularProgress",
  component: CircularProgress,
  parameters: {
    docs: {
      description: {
        component: `
# Circular Progress

A circular (ring/donut) progress indicator built on Base UI's Progress primitive for accessible, animated progress display.

## Features

- Built on Base UI's Progress primitive for robust accessibility
- SVG-based circular ring with animated stroke transitions
- Color variants: default, success, warning, destructive
- Size variants: sm, default, lg
- Composable center content: percentage, label, avatar, icon
- Indeterminate state with spinning animation
- Rounded stroke end caps

## Usage

\`\`\`tsx
import { CircularProgress } from "@keystoneui/react/circular-progress";

<CircularProgress value={40} />
\`\`\`

## Composed Layout

\`\`\`tsx
import {
  CircularProgress,
  CircularProgressTrack,
  CircularProgressIndicator,
  CircularProgressValue,
  CircularProgressLabel,
} from "@keystoneui/react/circular-progress";

<CircularProgress value={65}>
  <CircularProgressTrack />
  <CircularProgressIndicator />
  <div className="flex flex-col items-center">
    <CircularProgressValue />
    <CircularProgressLabel>Score</CircularProgressLabel>
  </div>
</CircularProgress>
\`\`\`
`,
      },
    },
  },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description:
        "The current progress value (0-100). Set to null for indeterminate.",
    },
    color: {
      control: "radio",
      options: ["default", "success", "warning", "destructive"],
      description: "Color variant of the progress indicator",
    },
    size: {
      control: "radio",
      options: ["sm", "default", "lg"],
      description: "Size variant",
    },
  },
  subcomponents: {
    CircularProgressTrack,
    CircularProgressIndicator,
    CircularProgressValue,
    CircularProgressLabel,
  },
} satisfies Meta<typeof CircularProgress>;

export default meta;
type Story = StoryObj<typeof CircularProgress>;

// ── Basic ──────────────────────────────────────────────────────────────

export const Basic: Story = {
  name: "Basic",
  args: {
    value: 40,
    color: "success",
  },
  render: (args) => <CircularProgress {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "Basic circular progress with a percentage label in the center. The indicator stroke animates smoothly on value changes.",
      },
    },
  },
};

// ── Sizes ──────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: "Sizes",
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <CircularProgress color="success" size="sm" value={65} />
        <span className="text-muted-foreground text-xs">sm</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CircularProgress color="success" size="default" value={65} />
        <span className="text-muted-foreground text-xs">default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CircularProgress color="success" size="lg" value={65} />
        <span className="text-muted-foreground text-xs">lg</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Three size variants: `sm` (48px), `default` (64px), and `lg` (96px). Text in the center scales proportionally. For tighter sizes (e.g. avatar wrapping), use a custom `className`.",
      },
    },
  },
};

// ── Colors ─────────────────────────────────────────────────────────────

export const Colors: Story = {
  name: "Colors",
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <CircularProgress color="default" value={60} />
        <span className="text-muted-foreground text-xs">Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CircularProgress color="success" value={80} />
        <span className="text-muted-foreground text-xs">Success</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CircularProgress color="warning" value={45} />
        <span className="text-muted-foreground text-xs">Warning</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CircularProgress color="destructive" value={25} />
        <span className="text-muted-foreground text-xs">Destructive</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `color` prop to indicate different statuses: `default`, `success`, `warning`, or `destructive`.",
      },
    },
  },
};

// ── With Label ─────────────────────────────────────────────────────────

export const WithLabel: Story = {
  name: "With Label",
  render: () => (
    <div className="flex items-center gap-8">
      <CircularProgress color="success" size="lg" value={72}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <div className="flex flex-col items-center">
          <CircularProgressValue />
          <CircularProgressLabel>Score</CircularProgressLabel>
        </div>
      </CircularProgress>
      <CircularProgress color="warning" size="lg" value={45}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <div className="flex flex-col items-center">
          <CircularProgressValue />
          <CircularProgressLabel>Risk</CircularProgressLabel>
        </div>
      </CircularProgress>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Compose `CircularProgressValue` and `CircularProgressLabel` in the center for contextual information.",
      },
    },
  },
};

// ── Custom Center Content ──────────────────────────────────────────────

export const CustomCenterContent: Story = {
  name: "Custom Center Content",
  render: () => (
    <div className="flex items-center gap-8">
      <CircularProgress color="success" size="lg" value={85}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <div className="relative flex flex-col items-center">
          <TrendingUpIcon className="size-6 text-foreground" />
          <span className="text-muted-foreground text-xs">Growth</span>
        </div>
      </CircularProgress>
      <CircularProgress color="destructive" size="lg" value={92}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <div className="relative flex flex-col items-center">
          <FlameIcon className="size-6 text-foreground" />
          <span className="text-muted-foreground text-xs">CPU</span>
        </div>
      </CircularProgress>
      <CircularProgress color="warning" size="lg" value={60}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <div className="relative flex flex-col items-center">
          <ZapIcon className="size-6 text-foreground" />
          <span className="text-muted-foreground text-xs">Energy</span>
        </div>
      </CircularProgress>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Place any content in the center -- icons, custom text, or any React element. Content is positioned relative to the center of the ring.",
      },
    },
  },
};

// ── With Avatar ────────────────────────────────────────────────────────

export const WithAvatar: Story = {
  name: "With Avatar",
  render: () => (
    <div className="flex items-center gap-8">
      {/* Tight ring: 32px avatar inside 44px progress */}
      <CircularProgress className="size-11" color="success" value={75}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <Avatar className="relative">
          <AvatarImage
            alt="@shadcn"
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span className="absolute right-0 bottom-0 z-10 inline-flex size-4 items-center justify-center rounded-full bg-green-600 font-bold text-[9px] text-white ring-2 ring-background">
          13
        </span>
      </CircularProgress>

      {/* Tight ring: 40px avatar inside 52px progress */}
      <CircularProgress className="size-13" color="default" value={40}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <Avatar className="relative" size="lg">
          <AvatarImage
            alt="@vercel"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
          />
          <AvatarFallback>VC</AvatarFallback>
        </Avatar>
        <span className="absolute right-0 bottom-0 z-10 inline-flex size-5 items-center justify-center rounded-full bg-green-600 font-bold text-[10px] text-white ring-2 ring-background">
          7
        </span>
      </CircularProgress>

      {/* Standard: 40px avatar inside default 64px progress */}
      <CircularProgress color="warning" value={60}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <Avatar className="relative" size="lg">
          <AvatarImage
            alt="@github"
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face"
          />
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
      </CircularProgress>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Wrap an `Avatar` inside the circular progress to show user progress, levels, or completion status. Use a custom `className` on `CircularProgress` for a tight ring fit — e.g. `size-11` (44px) around a default 32px avatar, or `size-13` (52px) around an `lg` 40px avatar. Add an absolutely positioned badge for level indicators.",
      },
    },
  },
};

// ── Animated ───────────────────────────────────────────────────────────

export const Animated: Story = {
  name: "Animated",
  render() {
    const [value, setValue] = useState(10);

    useEffect(() => {
      const interval = setInterval(() => {
        setValue((current) =>
          current >= 100
            ? 10
            : Math.min(100, Math.round(current + Math.random() * 20))
        );
      }, 1000);
      return () => clearInterval(interval);
    }, []);

    return (
      <CircularProgress color="success" size="lg" value={value}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
        <div className="flex flex-col items-center">
          <CircularProgressValue />
          <CircularProgressLabel>Uploading</CircularProgressLabel>
        </div>
      </CircularProgress>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Watch the indicator arc animate smoothly between values. Powered by a CSS transition on `stroke-dashoffset`.",
      },
    },
  },
};

// ── Indeterminate ──────────────────────────────────────────────────────

export const Indeterminate: Story = {
  name: "Indeterminate",
  render: () => (
    <div className="flex items-center gap-8">
      <CircularProgress size="sm" value={null}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
      </CircularProgress>
      <CircularProgress value={null}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
      </CircularProgress>
      <CircularProgress size="lg" value={null}>
        <CircularProgressTrack />
        <CircularProgressIndicator />
      </CircularProgress>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Pass `value={null}` for an indeterminate state with a spinning arc. Useful when progress cannot be determined.",
      },
    },
  },
};

// ── Controlled ─────────────────────────────────────────────────────────

export const Controlled: Story = {
  name: "Controlled",
  render() {
    const [value, setValue] = useState<number | number[]>(50);
    const numericValue = Array.isArray(value) ? value[0] : value;

    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <CircularProgress color="success" size="lg" value={numericValue}>
          <CircularProgressTrack />
          <CircularProgressIndicator />
          <CircularProgressValue />
        </CircularProgress>
        <Slider className="w-full" onValueChange={setValue} value={value}>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb aria-label="Progress value" />
            </SliderTrack>
          </SliderControl>
        </Slider>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "A circular progress controlled by the Slider component. Drag the thumb to see the indicator animate smoothly between values.",
      },
    },
  },
};

// ── Complete ───────────────────────────────────────────────────────────

export const Complete: Story = {
  name: "Complete",
  render: () => (
    <CircularProgress color="success" size="lg" value={100}>
      <CircularProgressTrack />
      <CircularProgressIndicator />
      <div className="flex flex-col items-center">
        <CircularProgressValue />
        <CircularProgressLabel>Done</CircularProgressLabel>
      </div>
    </CircularProgress>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "When `value` reaches 100, the `data-complete` attribute is set on all sub-components.",
      },
    },
  },
};
