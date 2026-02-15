import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@keystone/ui/slider";
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

const meta = {
  title: "Components/Slider",
  component: Slider,
  parameters: {
    docs: {
      description: {
        component: `
# Slider

A slider component built on Base UI's Slider primitive for accessible, draggable range inputs.

## Features

- Built on Base UI's Slider primitive for robust accessibility
- Pill-shaped thumb with drag feedback animation
- Composable sub-components: Control, Track, Indicator, Thumb, Value
- Supports range sliders with multiple thumbs
- Keyboard navigation (arrow keys, Page Up/Down, Home/End)
- \`data-dragging\` attribute for active drag styling

## Usage

\`\`\`tsx
import {
  Slider,
  SliderControl,
  SliderTrack,
  SliderIndicator,
  SliderThumb,
} from "@keystone/ui/slider";

<Slider defaultValue={50}>
  <SliderControl>
    <SliderTrack>
      <SliderIndicator />
      <SliderThumb />
    </SliderTrack>
  </SliderControl>
</Slider>
\`\`\`
`,
      },
    },
  },
  argTypes: {
    defaultValue: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "The default value of the slider",
    },
    disabled: {
      control: "boolean",
      description: "Whether the slider is disabled",
    },
  },
  subcomponents: {
    SliderControl,
    SliderTrack,
    SliderIndicator,
    SliderThumb,
    SliderValue,
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof Slider>;

// Basic
export const Basic: Story = {
  name: "Basic",
  render: () => (
    <div className="w-full max-w-sm">
      <Slider defaultValue={25}>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb aria-label="Volume" />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Basic slider with a pill-shaped thumb. Drag or use arrow keys to change the value.",
      },
    },
  },
};

// With Label and Value
export const WithLabelAndValue: Story = {
  name: "With Label and Value",
  render() {
    const id = React.useId();
    return (
      <div className="w-full max-w-sm">
        <Slider aria-labelledby={id} defaultValue={48}>
          <div className="flex justify-between">
            <span className="font-medium text-sm" id={id}>
              Volume
            </span>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
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
          "Use `SliderValue` to display the current value. Label the slider with `aria-labelledby` referencing a visible label.",
      },
    },
  },
};

// Controlled
export const Controlled: Story = {
  name: "Controlled",
  render() {
    const [value, setValue] = React.useState<number | number[]>(50);
    const id = React.useId();

    return (
      <div className="w-full max-w-sm space-y-2">
        <Slider aria-labelledby={id} onValueChange={setValue} value={value}>
          <div className="flex justify-between">
            <span className="font-medium text-sm" id={id}>
              Brightness
            </span>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
        </Slider>
        <p className="text-muted-foreground text-sm">
          Current value: <code>{String(value)}</code>
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Use `value` and `onValueChange` to control the slider state.",
      },
    },
  },
};

// Range
export const Range: Story = {
  name: "Range",
  render() {
    const id = React.useId();
    return (
      <div className="w-full max-w-sm">
        <Slider aria-labelledby={id} defaultValue={[25, 75]}>
          <div className="flex justify-between">
            <span className="font-medium text-sm" id={id}>
              Price range
            </span>
            <SliderValue>
              {(formattedValues) => formattedValues.join(" – ")}
            </SliderValue>
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb aria-label="Minimum price" index={0} />
              <SliderThumb aria-label="Maximum price" index={1} />
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
          "Pass an array to `defaultValue` and render a `SliderThumb` for each value to create a range slider.",
      },
    },
  },
};

// Disabled
export const Disabled: Story = {
  name: "Disabled",
  render: () => (
    <div className="w-full max-w-sm">
      <Slider defaultValue={40} disabled>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb aria-label="Disabled slider" />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Use the `disabled` prop to prevent interaction.",
      },
    },
  },
};

// Custom Step
export const CustomStep: Story = {
  name: "Custom Step",
  render() {
    const id = React.useId();
    return (
      <div className="w-full max-w-sm">
        <Slider aria-labelledby={id} defaultValue={50} step={10}>
          <div className="flex justify-between">
            <span className="font-medium text-sm" id={id}>
              Quality
            </span>
            <SliderValue>
              {(formattedValues) => `${formattedValues[0]}%`}
            </SliderValue>
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
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
          "Use the `step` prop to control the granularity. This example uses `step={10}` for discrete 10% increments.",
      },
    },
  },
};
