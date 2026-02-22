import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@keystoneui/react/progress";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@keystoneui/react/slider";
import * as React from "react";

const meta = {
  title: "Components/Progress",
  component: Progress,
  parameters: {
    docs: {
      description: {
        component: `
# Progress

A progress bar component built on Base UI's Progress primitive for accessible, animated task completion indicators.

## Features

- Built on Base UI's Progress primitive for robust accessibility
- **Smooth animated indicator** with CSS transitions on width changes
- Color variants: default, success, warning, destructive
- Indeterminate state with animated sliding bar
- Composable sub-components: Track, Indicator, Label, Value
- \`data-complete\`, \`data-progressing\`, \`data-indeterminate\` state attributes

## Usage

\`\`\`tsx
import { Progress } from "@keystoneui/react/progress";

<Progress value={50} />
\`\`\`

## Composed Layout

\`\`\`tsx
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@keystoneui/react/progress";

<Progress value={50}>
  <div className="flex justify-between">
    <ProgressLabel>Uploading...</ProgressLabel>
    <ProgressValue />
  </div>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>
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
  },
  subcomponents: {
    ProgressTrack,
    ProgressIndicator,
    ProgressLabel,
    ProgressValue,
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof Progress>;

// Basic
export const Basic: Story = {
  name: "Basic",
  args: {
    value: 40,
  },
  render: (args) => (
    <div className="w-full max-w-sm">
      <Progress {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Basic progress bar with a single `value` prop. The indicator width animates smoothly on value changes.",
      },
    },
  },
};

// Animated
export const Animated: Story = {
  name: "Animated",
  render() {
    const [value, setValue] = React.useState(10);

    React.useEffect(() => {
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
      <div className="w-full max-w-sm space-y-2">
        <Progress value={value}>
          <div className="flex justify-between">
            <ProgressLabel>Exporting data...</ProgressLabel>
            <ProgressValue />
          </div>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Watch the indicator bar animate smoothly between values. Powered by a CSS `transition` on `width`.",
      },
    },
  },
};

// With Label and Value
export const WithLabelAndValue: Story = {
  name: "With Label and Value",
  args: {
    value: 65,
  },
  render: (args) => (
    <div className="w-full max-w-sm space-y-2">
      <Progress {...args}>
        <div className="flex justify-between">
          <ProgressLabel>Uploading files...</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `ProgressLabel` and `ProgressValue` for contextual information above the bar.",
      },
    },
  },
};

// Custom Value Format
export const CustomValueFormat: Story = {
  name: "Custom Value Format",
  args: {
    value: 42,
  },
  render: (args) => (
    <div className="w-full max-w-sm space-y-2">
      <Progress {...args}>
        <div className="flex justify-between">
          <ProgressLabel>Processing items</ProgressLabel>
          <ProgressValue>
            {(_formattedValue, rawValue) => `${rawValue} of 100 items`}
          </ProgressValue>
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`ProgressValue` accepts a render function for custom formatting: `(formattedValue, rawValue) => string`.",
      },
    },
  },
};

// Colors
export const Colors: Story = {
  name: "Colors",
  render: () => (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <span className="font-medium text-sm">Default</span>
        <Progress color="default" value={60} />
      </div>
      <div className="space-y-2">
        <span className="font-medium text-sm">Success</span>
        <Progress color="success" value={80} />
      </div>
      <div className="space-y-2">
        <span className="font-medium text-sm">Warning</span>
        <Progress color="warning" value={45} />
      </div>
      <div className="space-y-2">
        <span className="font-medium text-sm">Destructive</span>
        <Progress color="destructive" value={25} />
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

// Indeterminate
export const Indeterminate: Story = {
  name: "Indeterminate",
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <Progress value={null}>
        <ProgressLabel>Loading...</ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Pass `value={null}` for an indeterminate state with an animated sliding bar. Useful when progress cannot be determined.",
      },
    },
  },
};

// Controlled
export const Controlled: Story = {
  name: "Controlled",
  render() {
    const [value, setValue] = React.useState<number | number[]>(50);
    const numericValue = Array.isArray(value) ? value[0] : value;

    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Progress value={numericValue}>
          <div className="flex justify-between">
            <ProgressLabel>Progress</ProgressLabel>
            <ProgressValue />
          </div>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
        <Slider onValueChange={setValue} value={value}>
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
          "A progress bar controlled by the Slider component. Drag the thumb to see the indicator animate smoothly between values.",
      },
    },
  },
};

// Complete
export const Complete: Story = {
  name: "Complete",
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <Progress color="success" value={100}>
        <div className="flex justify-between">
          <ProgressLabel>Upload complete</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
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
