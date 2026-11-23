import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";
import { Toggle } from "@keystoneui/react/toggle";
import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TextAlignCenter as AlignCenterIcon,
  TextAlignJustify as AlignJustifyIcon,
  TextAlignStart as AlignLeftIcon,
  TextAlignEnd as AlignRightIcon,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  ListChecks as ListChecksIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Underline as UnderlineIcon,
} from "lucide-react";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    docs: {
      description: {
        component: `
A group of toggle buttons with shared selection state.

\`\`\`tsx
import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";

// Multiple selection
<ToggleGroup multiple variant="outline">
  <ToggleGroupItem value="bold" aria-label="Toggle bold">
    <BoldIcon />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Toggle italic">
    <ItalicIcon />
  </ToggleGroupItem>
  <ToggleGroupItem value="underline" aria-label="Toggle underline">
    <UnderlineIcon />
  </ToggleGroupItem>
</ToggleGroup>

// Single selection
<ToggleGroup defaultValue={["left"]}>
  <ToggleGroupItem value="left" aria-label="Align left">
    <AlignLeftIcon />
  </ToggleGroupItem>
  <ToggleGroupItem value="center" aria-label="Align center">
    <AlignCenterIcon />
  </ToggleGroupItem>
  <ToggleGroupItem value="right" aria-label="Align right">
    <AlignRightIcon />
  </ToggleGroupItem>
</ToggleGroup>
\`\`\`

## Features

- Three variants: \`default\`, \`outline\`, and \`secondary\` (filled when unpressed)
- Three sizes: \`sm\`, \`default\`, \`lg\`
- Single or multiple selection modes
- \`spacing\` prop: \`0\` (default) joins items with connected borders, \`>0\` adds a gap
- \`orientation\` prop: \`horizontal\` (default) or \`vertical\`
- Controlled and uncontrolled value management
- Keyboard navigation via Base UI ToggleGroup primitive
- Group-level variant, size, spacing, and orientation props cascade to items via context

## ButtonGroup vs ToggleGroup

Use the **ButtonGroup** component when you want to group buttons that perform an action.
Use the **ToggleGroup** component when you want to group buttons that toggle a state.
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary"],
      description: "The visual style applied to all items",
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "The size applied to all items",
    },
    disabled: {
      control: "boolean",
      description: "Whether the entire group is disabled",
    },
  },
  subcomponents: { ToggleGroupItem },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <ToggleGroup defaultValue={["bold"]} multiple>
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const italicButton = canvas.getByRole("button", {
      name: /toggle italic/i,
    });

    // Click the italic button to toggle it on
    await userEvent.click(italicButton);
    await expect(italicButton).toHaveAttribute("aria-pressed", "true");
  },
};

// ---------------------------------------------------------------------------
// Outline
// ---------------------------------------------------------------------------

export const Outline: Story = {
  render: () => (
    <ToggleGroup multiple variant="outline">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

// ---------------------------------------------------------------------------
// Secondary
// ---------------------------------------------------------------------------

export const Secondary: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Joined (spacing=0)</p>
        <ToggleGroup defaultValue={["medium"]} variant="secondary">
          <ToggleGroupItem className="px-6" value="low">
            Low
          </ToggleGroupItem>
          <ToggleGroupItem className="px-6" value="medium">
            Medium
          </ToggleGroupItem>
          <ToggleGroupItem className="px-6" value="high">
            High
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Spaced (spacing=2)</p>
        <ToggleGroup defaultValue={["medium"]} spacing={2} variant="secondary">
          <ToggleGroupItem className="px-6" value="low">
            Low
          </ToggleGroupItem>
          <ToggleGroupItem className="px-6" value="medium">
            Medium
          </ToggleGroupItem>
          <ToggleGroupItem className="px-6" value="high">
            High
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Single Selection
// ---------------------------------------------------------------------------

export const SingleSelection: Story = {
  name: "Single Selection",
  render: () => {
    const [value, setValue] = useState<string[]>(["center"]);

    return (
      <div className="flex flex-col gap-3">
        <ToggleGroup onValueChange={setValue} value={value} variant="outline">
          <ToggleGroupItem aria-label="Align left" value="left">
            <AlignLeftIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align center" value="center">
            <AlignCenterIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align right" value="right">
            <AlignRightIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align justify" value="justify">
            <AlignJustifyIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">
          Alignment: {value.length > 0 ? value[0] : "none"}
        </p>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// With Text
// ---------------------------------------------------------------------------

export const WithText: Story = {
  name: "With Text",
  render: () => (
    <ToggleGroup multiple variant="outline">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <BoldIcon />
        Bold
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <ItalicIcon />
        Italic
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <UnderlineIcon />
        Underline
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Small</p>
        <ToggleGroup multiple size="sm" variant="outline">
          <ToggleGroupItem aria-label="Toggle list" value="list">
            <ListIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle ordered list" value="ordered">
            <ListOrderedIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle checklist" value="checks">
            <ListChecksIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Default</p>
        <ToggleGroup multiple size="default" variant="outline">
          <ToggleGroupItem aria-label="Toggle list" value="list">
            <ListIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle ordered list" value="ordered">
            <ListOrderedIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle checklist" value="checks">
            <ListChecksIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Large</p>
        <ToggleGroup multiple size="lg" variant="outline">
          <ToggleGroupItem aria-label="Toggle list" value="list">
            <ListIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle ordered list" value="ordered">
            <ListOrderedIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle checklist" value="checks">
            <ListChecksIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

export const Spacing: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Joined (spacing=0, default)</p>
        <ToggleGroup defaultValue={["all"]} variant="outline">
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="missed">Missed</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Spaced (spacing=2)</p>
        <ToggleGroup defaultValue={["all"]} spacing={2} variant="outline">
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="missed">Missed</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const missedButtons = canvas.getAllByRole("button", { name: /missed/i });

    await userEvent.click(missedButtons[0]);
    await expect(missedButtons[0]).toHaveAttribute("aria-pressed", "true");
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the `spacing` prop to control the gap between items. When `0` (default), items join with connected borders. Values greater than `0` add a gap using the spacing scale.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Text Labels
// ---------------------------------------------------------------------------

export const TextLabels: Story = {
  name: "Text Labels",
  render: () => (
    <div className="flex flex-col gap-6">
      <ToggleGroup defaultValue={["all"]} variant="outline">
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="missed">Missed</ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup defaultValue={["day"]} size="sm" variant="outline">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
        <ToggleGroupItem value="year">Year</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const weekButton = canvas.getByRole("button", { name: /week/i });

    await userEvent.click(weekButton);
    await expect(weekButton).toHaveAttribute("aria-pressed", "true");

    const dayButton = canvas.getByRole("button", { name: /^day$/i });
    await expect(dayButton).toHaveAttribute("aria-pressed", "false");
  },
  parameters: {
    docs: {
      description: {
        story:
          "Toggle groups work well with text labels for filter-style and segmented controls.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Joined</p>
        <ToggleGroup
          defaultValue={["bold", "italic"]}
          multiple
          orientation="vertical"
        >
          <ToggleGroupItem aria-label="Toggle bold" value="bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle italic" value="italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle underline" value="underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Spaced</p>
        <ToggleGroup
          defaultValue={["bold"]}
          multiple
          orientation="vertical"
          spacing={1}
        >
          <ToggleGroupItem aria-label="Toggle bold" value="bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle italic" value="italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle underline" value="underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const underlineButtons = canvas.getAllByRole("button", {
      name: /toggle underline/i,
    });

    await userEvent.click(underlineButtons[0]);
    await expect(underlineButtons[0]).toHaveAttribute("aria-pressed", "true");
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `orientation="vertical"` for vertical toggle groups. Combine with `spacing` to control whether items are joined or separated.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Disabled Group</p>
        <ToggleGroup defaultValue={["bold"]} disabled variant="outline">
          <ToggleGroupItem aria-label="Toggle bold" value="bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle italic" value="italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle underline" value="underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">
          Entire group is disabled
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Individual Disabled Items</p>
        <ToggleGroup defaultValue={["bold"]} multiple variant="outline">
          <ToggleGroupItem aria-label="Toggle bold" value="bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle italic" disabled value="italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle underline" value="underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">Italic is disabled</p>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Custom
// ---------------------------------------------------------------------------

function FontWeightSelector() {
  const [fontWeight, setFontWeight] = useState<string[]>(["normal"]);
  const current = fontWeight[0] || "normal";

  return (
    <Field>
      <FieldLabel>Font Weight</FieldLabel>
      <ToggleGroup
        onValueChange={setFontWeight}
        spacing={2}
        value={fontWeight}
        variant="outline"
      >
        <ToggleGroupItem
          aria-label="Light"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="light"
        >
          <span className="font-light text-2xl leading-none">Aa</span>
          <span className="text-muted-foreground text-xs">Light</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Normal"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="normal"
        >
          <span className="font-normal text-2xl leading-none">Aa</span>
          <span className="text-muted-foreground text-xs">Normal</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Medium"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="medium"
        >
          <span className="font-medium text-2xl leading-none">Aa</span>
          <span className="text-muted-foreground text-xs">Medium</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Bold"
          className="flex size-16 flex-col items-center justify-center rounded-xl"
          value="bold"
        >
          <span className="font-bold text-2xl leading-none">Aa</span>
          <span className="text-muted-foreground text-xs">Bold</span>
        </ToggleGroupItem>
      </ToggleGroup>
      <FieldDescription>
        Use{" "}
        <code className="rounded-md bg-muted px-1 py-0.5 font-mono">
          font-{current}
        </code>{" "}
        to set the font weight.
      </FieldDescription>
    </Field>
  );
}

export const Custom: Story = {
  render: () => <FontWeightSelector />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boldButton = canvas.getByRole("button", { name: /bold/i });

    await userEvent.click(boldButton);
    await expect(boldButton).toHaveAttribute("aria-pressed", "true");
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom-styled toggle items with `spacing`, `className` overrides, and integration with the Field component for form context.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Press feedback: real pointer held down
// ---------------------------------------------------------------------------

/** The custom browser commands registered in vitest.config.ts. */
interface RealCommands {
  pointerDown: () => Promise<void>;
  pointerMoveAway: () => Promise<void>;
  pointerMoveTo: (selector: string) => Promise<void>;
  pointerUp: () => Promise<void>;
}

/** Vitest's real (Playwright) mouse; absent when Storybook runs the play. */
const realCommands = () =>
  (globalThis as { __realCommands?: RealCommands }).__realCommands;

type PressVariant = "default" | "outline" | "secondary";

interface PressCase {
  /** Test ids of the held item and, in a group, its neighbour. */
  item: string;
  /** Joined items must hold still; spaced items and a lone Toggle shrink. */
  joined: boolean;
  label: string;
  neighbour?: string;
  /** Test id of an item that is already on, held to check it keeps its fill. */
  on?: string;
  orientation: "horizontal" | "vertical";
}

const PRESS_CASES: PressCase[] = [
  ...(["default", "outline", "secondary"] as PressVariant[]).map((v) => ({
    joined: true,
    item: `joined-${v}-0`,
    label: `joined ${v}`,
    neighbour: `joined-${v}-1`,
    on: `joined-${v}-1`,
    orientation: "horizontal" as const,
  })),
  {
    joined: true,
    item: "joined-outline-dark-0",
    label: "joined outline (dark)",
    neighbour: "joined-outline-dark-1",
    on: "joined-outline-dark-1",
    orientation: "horizontal",
  },
  {
    joined: true,
    item: "joined-vertical-0",
    label: "joined outline vertical",
    neighbour: "joined-vertical-1",
    on: "joined-vertical-1",
    orientation: "vertical",
  },
  {
    joined: false,
    item: "spaced-0",
    label: "spaced outline (spacing 2)",
    neighbour: "spaced-1",
    orientation: "horizontal",
  },
  {
    joined: false,
    item: "standalone",
    label: "standalone Toggle outline",
    orientation: "horizontal",
  },
];

function CountItem({
  className,
  count,
  label,
  testId,
  value,
}: {
  className?: string;
  count: number;
  label: string;
  testId: string;
  value: string;
}) {
  return (
    <ToggleGroupItem className={className} data-testid={testId} value={value}>
      {label}
      <span>{count}</span>
    </ToggleGroupItem>
  );
}

function PressGroup({
  id,
  itemClassName,
  orientation = "horizontal",
  spacing,
  variant,
}: {
  id: string;
  /** A consumer's className on the first (off) item. */
  itemClassName?: string;
  orientation?: "horizontal" | "vertical";
  spacing?: number;
  variant: PressVariant;
}) {
  return (
    <ToggleGroup
      defaultValue={["all"]}
      orientation={orientation}
      size="sm"
      spacing={spacing}
      variant={variant}
    >
      <CountItem
        className={itemClassName}
        count={4}
        label="Open"
        testId={`${id}-0`}
        value="open"
      />
      <CountItem count={31} label="All" testId={`${id}-1`} value="all" />
    </ToggleGroup>
  );
}

/** A consumer's press fill: a token colour no variant's hover uses. */
const CONSUMER_PRESS = "active:bg-primary";

const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => r()));

const scaleOf = (el: Element) => {
  const value = getComputedStyle(el).scale;
  return value === "none" ? 1 : Number.parseFloat(value);
};

/** Waits until the element's scale and background stop changing. */
async function settled(el: Element) {
  let last = "";
  let stable = 0;
  for (let i = 0; i < 120 && stable < 4; i++) {
    // biome-ignore lint/performance/noAwaitInLoops: one frame at a time
    await nextFrame();
    const style = getComputedStyle(el);
    const now = `${style.scale}|${style.backgroundColor}|${style.color}`;
    stable = now === last ? stable + 1 : 0;
    last = now;
  }
}

const byTestId = (root: HTMLElement, id: string) => {
  const el = root.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!el) {
    throw new Error(`no element ${id}`);
  }
  return el;
};

/** The gap between two items' facing edges along the group's axis. */
const facingGap = (
  a: DOMRect,
  b: DOMRect,
  orientation: "horizontal" | "vertical"
) => (orientation === "vertical" ? b.top - a.bottom : b.left - a.right);

interface Held {
  active: boolean;
  background: string;
  color: string;
  gap?: number;
  /** Whether the pointer was over the item while it was measured. */
  hovered: boolean;
  rect: DOMRect;
  scale: number;
}

/** Waits (a frame at a time, up to about a second) until `test` holds. */
async function until(test: () => boolean) {
  for (let i = 0; i < 60 && !test(); i++) {
    // biome-ignore lint/performance/noAwaitInLoops: one frame at a time
    await nextFrame();
  }
  return test();
}

/**
 * Holds a real mouse down on the element, measures, then lets go off it.
 * With `pointer: "off"` the pointer slides off the item while the button is
 * still down, so the item stays `:active` but is not `:hover`: a press
 * without hover, as a touch press gives the CSS. Each hold moves the pointer
 * itself and waits for the hover state it needs, so it never depends on where
 * an earlier play left the pointer.
 */
async function hold(
  commands: RealCommands,
  root: HTMLElement,
  id: string,
  neighbour: string | undefined,
  orientation: "horizontal" | "vertical",
  pointer: "over" | "off" = "over"
): Promise<Held> {
  const el = byTestId(root, id);
  await commands.pointerMoveTo(`[data-testid="${id}"]`);
  await until(() => el.matches(":hover"));
  await commands.pointerDown();
  try {
    if (pointer === "off") {
      await commands.pointerMoveAway();
      await until(() => !el.matches(":hover"));
    }
    await settled(el);
    const rect = el.getBoundingClientRect();
    return {
      active: el.matches(":active"),
      background: getComputedStyle(el).backgroundColor,
      color: getComputedStyle(el).color,
      hovered: el.matches(":hover"),
      gap: neighbour
        ? facingGap(
            rect,
            byTestId(root, neighbour).getBoundingClientRect(),
            orientation
          )
        : undefined,
      rect,
      scale: scaleOf(el),
    };
  } finally {
    // Leave before letting go, so the press never becomes a click.
    await commands.pointerMoveAway();
    await commands.pointerUp();
    await settled(el);
  }
}

async function hoverStyle(
  commands: RealCommands,
  root: HTMLElement,
  id: string
) {
  const el = byTestId(root, id);
  await commands.pointerMoveTo(`[data-testid="${id}"]`);
  try {
    await until(() => el.matches(":hover"));
    await settled(el);
    const style = getComputedStyle(el);
    return {
      background: style.backgroundColor,
      color: style.color,
      hovered: el.matches(":hover"),
    };
  } finally {
    await commands.pointerMoveAway();
    await settled(el);
  }
}

/**
 * A consumer's plain `active:` fill in `className` replaces the joined press
 * fill on an off item, with and without hover: every variant in light, and
 * default and secondary in dark (dark outline is skipped below; the press
 * matrix stories cover it and the other consumer classes).
 */
async function checkConsumerFills(commands: RealCommands, root: HTMLElement) {
  for (const theme of ["", "-dark"]) {
    const swatch = byTestId(root, `consumer-swatch${theme}`);
    const expected = getComputedStyle(swatch).backgroundColor;
    for (const v of ["default", "outline", "secondary"] as PressVariant[]) {
      // Not dark outline: there Toggle's own `dark:bg-input-bg` (emitted
      // after `active:` at equal specificity) and `dark:hover:bg-input/50`
      // (one class more specific) already beat a plain `active:` fill
      // before joined items had a press fill of their own.
      if (v === "outline" && theme === "-dark") {
        continue;
      }
      const id = `consumer-${v}${theme}-0`;
      for (const noHover of [false, true]) {
        // biome-ignore lint/performance/noAwaitInLoops: one real pointer at a time
        const held = await hold(
          commands,
          root,
          id,
          undefined,
          "horizontal",
          noHover ? "off" : "over"
        );
        const label = `consumer ${v}${theme}${noHover ? " (no hover)" : ""}`;
        console.log(
          `[press] ${label}: ${JSON.stringify({
            expected,
            held: held.background,
            scale: held.scale,
          })}`
        );
        await expect(held.active, `${label}: :active`).toBe(true);
        await expect(held.hovered, `${label}: :hover`).toBe(!noHover);
        await expect(held.background, `${label}: consumer fill`).toBe(expected);
      }
    }
  }
}

function PressFeedbackScene() {
  return (
    <div className="flex flex-col items-start gap-6">
      <PressGroup id="joined-default" variant="default" />
      <PressGroup id="joined-outline" variant="outline" />
      <PressGroup id="joined-secondary" variant="secondary" />
      <div className="dark rounded-md bg-background p-3">
        <PressGroup id="joined-outline-dark" variant="outline" />
      </div>
      {/* A consumer's own press fill on a joined item, and a swatch of it. */}
      <div className="flex flex-col items-start gap-2">
        <span
          aria-hidden="true"
          className="block size-2 bg-primary"
          data-testid="consumer-swatch"
        />
        {(["default", "outline", "secondary"] as PressVariant[]).map((v) => (
          <PressGroup
            id={`consumer-${v}`}
            itemClassName={CONSUMER_PRESS}
            key={v}
            variant={v}
          />
        ))}
      </div>
      <div className="dark flex flex-col items-start gap-2 rounded-md bg-background p-3">
        <span
          aria-hidden="true"
          className="block size-2 bg-primary"
          data-testid="consumer-swatch-dark"
        />
        {(["default", "outline", "secondary"] as PressVariant[]).map((v) => (
          <PressGroup
            id={`consumer-${v}-dark`}
            itemClassName={CONSUMER_PRESS}
            key={v}
            variant={v}
          />
        ))}
      </div>
      <PressGroup
        id="joined-vertical"
        orientation="vertical"
        variant="outline"
      />
      <PressGroup id="spaced" spacing={2} variant="outline" />
      <Toggle data-testid="standalone" size="sm" variant="outline">
        Standalone
      </Toggle>
    </div>
  );
}

/**
 * For an export the press-story split added: its scene is already
 * snapshotted by the export it was split from.
 */
const NO_SNAPSHOT = { chromatic: { disableSnapshot: true } };

/**
 * Holds a real pointer down on an item without letting go. In a joined group
 * (`spacing` 0) the held item must not shrink, so no gap opens beside its
 * neighbour; the press shows as the variant's hover fill instead, also
 * without hover (the pointer slid off the held item). A spaced group and a
 * standalone Toggle keep the press scale.
 *
 * One export per case (spaced and standalone share one), so that each play
 * has the per-test time limit to itself.
 */
const pressFeedbackStory = (cases: PressCase[], snapshot = true): Story => ({
  render: () => <PressFeedbackScene />,
  play: async ({ canvasElement }) => {
    const commands = realCommands();
    if (!commands) {
      return;
    }

    for (const c of cases) {
      const el = byTestId(canvasElement, c.item);
      const rest = el.getBoundingClientRect();
      const restGap = c.neighbour
        ? facingGap(
            rest,
            byTestId(canvasElement, c.neighbour).getBoundingClientRect(),
            c.orientation
          )
        : undefined;

      // biome-ignore lint/performance/noAwaitInLoops: one real pointer, one case at a time
      const held = await hold(
        commands,
        canvasElement,
        c.item,
        c.neighbour,
        c.orientation
      );
      // A press that missed the element would make every number below void.
      await expect(held.active, `${c.label}: :active`).toBe(true);

      console.log(
        `[press] ${c.label}: ${JSON.stringify({
          restWidth: rest.width,
          restHeight: rest.height,
          heldWidth: held.rect.width,
          heldHeight: held.rect.height,
          heldScale: held.scale,
          restGap,
          heldGap: held.gap,
        })}`
      );

      if (!c.joined) {
        await expect(held.scale, `${c.label}: press scale`).toBeLessThan(1);
        continue;
      }

      await expect(held.scale, `${c.label}: held scale`).toBe(1);
      const moved = (["left", "top", "width", "height"] as const).filter(
        (side) => Math.abs(held.rect[side] - rest[side]) >= 0.5
      );
      await expect(moved, `${c.label}: held rect sides that moved`).toEqual([]);
      // Tighter than half a pixel: a 32px-tall item at 0.97 opens a 0.48px
      // gap in a vertical group, which half a pixel would let through.
      await expect(
        Math.abs((held.gap ?? 0) - (restGap ?? 0)),
        `${c.label}: gap to neighbour`
      ).toBeLessThan(0.1);

      // The pressed fill without hover (the pointer slid off the held item,
      // as a touch press gives the CSS): the variant's hover fill for an item
      // that is off; an item that is on keeps its on fill.
      const hover = await hoverStyle(commands, canvasElement, c.item);
      await expect(hover.hovered, `${c.label}: :hover for the hover fill`).toBe(
        true
      );
      const hoverFill = hover.background;
      const onEl = byTestId(canvasElement, c.on as string);
      const onFill = getComputedStyle(onEl).backgroundColor;
      const onColor = getComputedStyle(onEl).color;
      const pressedOff = await hold(
        commands,
        canvasElement,
        c.item,
        undefined,
        c.orientation,
        "off"
      );
      const pressedOn = await hold(
        commands,
        canvasElement,
        c.on as string,
        undefined,
        c.orientation,
        "off"
      );
      console.log(
        `[press] ${c.label} fill (no hover): ${JSON.stringify({
          hoverFill,
          pressedOff: pressedOff.background,
          onFill,
          pressedOn: pressedOn.background,
        })}`
      );
      await expect(pressedOff.active, `${c.label}: :active (no hover)`).toBe(
        true
      );
      await expect(pressedOn.active, `${c.label}: :active on item`).toBe(true);
      await expect(pressedOff.hovered, `${c.label}: off item not :hover`).toBe(
        false
      );
      await expect(pressedOn.hovered, `${c.label}: on item not :hover`).toBe(
        false
      );
      await expect(
        pressedOff.background,
        `${c.label}: pressed fill of an off item`
      ).toBe(hoverFill);
      await expect(
        pressedOn.background,
        `${c.label}: pressed fill of an on item`
      ).toBe(onFill);
      await expect(
        pressedOff.color,
        `${c.label}: pressed text of an off item`
      ).toBe(hover.color);
      await expect(
        pressedOn.color,
        `${c.label}: pressed text of an on item`
      ).toBe(onColor);
    }
  },
  parameters: {
    ...(snapshot ? {} : NO_SNAPSHOT),
    docs: {
      description: {
        story:
          "Holding the pointer on a joined item leaves it in place and shows the hover fill; spaced items and a standalone Toggle keep the press scale.",
      },
    },
  },
});

export const PressFeedback: Story = {
  ...pressFeedbackStory(PRESS_CASES.slice(0, 1)),
  name: "Press Feedback",
};
export const PressFeedbackJoinedOutline: Story = {
  ...pressFeedbackStory(PRESS_CASES.slice(1, 2), false),
  name: "Press Feedback Joined Outline",
};
export const PressFeedbackJoinedSecondary: Story = {
  ...pressFeedbackStory(PRESS_CASES.slice(2, 3), false),
  name: "Press Feedback Joined Secondary",
};
export const PressFeedbackJoinedOutlineDark: Story = {
  ...pressFeedbackStory(PRESS_CASES.slice(3, 4), false),
  name: "Press Feedback Joined Outline Dark",
};
export const PressFeedbackJoinedVertical: Story = {
  ...pressFeedbackStory(PRESS_CASES.slice(4, 5), false),
  name: "Press Feedback Joined Vertical",
};
export const PressFeedbackSpacedStandalone: Story = {
  ...pressFeedbackStory(PRESS_CASES.slice(5), false),
  name: "Press Feedback Spaced Standalone",
};

/**
 * A consumer's own press fill on a joined item, held with and without hover.
 * Its own story so that neither play runs near the per-test time limit: a
 * play that times out keeps running and moves the pointer under the next one.
 */
export const PressFeedbackConsumer: Story = {
  name: "Press Feedback Consumer",
  render: () => <PressFeedbackScene />,
  play: async ({ canvasElement }) => {
    const commands = realCommands();
    if (!commands) {
      return;
    }
    await checkConsumerFills(commands, canvasElement);
  },
};

// ---------------------------------------------------------------------------
// Press matrix: the library's press fill against a consumer's own classes
// ---------------------------------------------------------------------------

/**
 * A consumer's classes on both items of a joined group. Token colours no
 * variant uses for its hover or on fill.
 */
const MATRIX_CONSUMERS = {
  none: "",
  active: "active:bg-primary",
  darkActive: "dark:active:bg-destructive",
  hover: "hover:bg-success",
  darkHover: "dark:hover:bg-warning",
} as const;
type MatrixConsumer = keyof typeof MATRIX_CONSUMERS;

/** Swatches that resolve a token to its computed colour in each theme. */
const MATRIX_SWATCHES = {
  accent: "bg-accent",
  destructive: "bg-destructive",
  foreground: "bg-foreground",
  "input-bg": "bg-input-bg",
  "input/50": "bg-input/50",
  muted: "bg-muted",
  primary: "bg-primary",
  secondary: "bg-secondary",
  "secondary-hover": "bg-secondary-hover",
  success: "bg-success",
  warning: "bg-warning",
  transparent: "bg-transparent",
} as const;
type MatrixToken = keyof typeof MATRIX_SWATCHES;

type MatrixTheme = "light" | "dark";

function MatrixPanel({
  theme,
  variant,
}: {
  theme: MatrixTheme;
  variant: PressVariant;
}) {
  return (
    <div
      className={
        theme === "dark"
          ? "dark flex flex-col items-start gap-2 rounded-md bg-background p-3"
          : "flex flex-col items-start gap-2 p-3"
      }
      style={{ "--accent": "var(--border)" } as CSSProperties}
    >
      <div aria-hidden="true" className="flex gap-1">
        {Object.entries(MATRIX_SWATCHES).map(([token, className]) => (
          <span
            className={`block size-2 ${className}`}
            data-testid={`swatch-${theme}-${token}`}
            key={token}
          />
        ))}
      </div>
      {(Object.keys(MATRIX_CONSUMERS) as MatrixConsumer[]).map((consumer) => (
        <ToggleGroup
          defaultValue={["on"]}
          key={consumer}
          size="sm"
          variant={variant}
        >
          <ToggleGroupItem
            className={MATRIX_CONSUMERS[consumer]}
            data-testid={`m-${theme}-${consumer}-off`}
            value="off"
          >
            Off
          </ToggleGroupItem>
          <ToggleGroupItem
            className={MATRIX_CONSUMERS[consumer]}
            data-testid={`m-${theme}-${consumer}-on`}
            value="on"
          >
            On
          </ToggleGroupItem>
        </ToggleGroup>
      ))}
    </div>
  );
}

/** Every token whose computed colour equals `color` in `theme`, or the raw colour. */
function tokenOf(root: HTMLElement, theme: MatrixTheme, color: string) {
  const names = (Object.keys(MATRIX_SWATCHES) as MatrixToken[]).filter(
    (token) =>
      getComputedStyle(byTestId(root, `swatch-${theme}-${token}`))
        .backgroundColor === color
  );
  return names.length > 0 ? names.join("|") : color;
}

type MatrixState = "off" | "on";

/** The fill a joined item's variant shows on hover, in `theme`. */
const hoverToken = (v: PressVariant, theme: MatrixTheme): MatrixToken => {
  if (v === "secondary") {
    return "secondary-hover";
  }
  if (v === "outline") {
    return theme === "dark" ? "input/50" : "accent";
  }
  return "muted";
};

/** The fill an item that is on shows at rest, in `theme`. */
const onToken = (v: PressVariant, theme: MatrixTheme): MatrixToken => {
  if (v === "secondary") {
    return "foreground";
  }
  // Toggle's own `dark:bg-input-bg` outranks `aria-pressed:bg-accent`.
  if (v === "outline" && theme === "dark") {
    return "input-bg";
  }
  return "accent";
};

/**
 * What a held item must show. Every cell equals the commit before joined
 * items had a press fill, except where that contract allows a change: an
 * off item held with no consumer press class that applies in this theme
 * shows its variant's hover fill (with or without hover capability), and a
 * consumer's own `hover:` fill gives way to that press fill while held.
 * "No consumer press class" means none that applies in this theme: a
 * `dark:active:` class counts only in dark.
 * Known and not asserted: in dark outline, a consumer's own `dark:bg-*` rest
 * fill on an item that is on gives way to the press fill when held without
 * hover.
 */
function expectedToken(
  v: PressVariant,
  theme: MatrixTheme,
  state: MatrixState,
  consumer: MatrixConsumer,
  noHover: boolean
): MatrixToken {
  const consumerWinsDark = consumer === "darkActive" && theme === "dark";
  // A consumer's `dark:hover:` fill, under a hovering pointer in dark mode.
  if (consumer === "darkHover" && theme === "dark" && !noHover) {
    // Accepted difference: in dark outline it gives way to the press fill
    // while held, on an item that is on too (before, it showed the
    // consumer's fill). Elsewhere the plain `active:` press fill is
    // outranked by `dark:hover:`, so the consumer's fill still shows.
    return v === "outline" ? "input/50" : "warning";
  }
  if (state === "on") {
    // A consumer's `dark:active:` fill won on an on item, in every variant.
    if (consumerWinsDark) {
      return "destructive";
    }
    // Dark outline: Toggle's own `dark:hover:bg-input/50` shows on an on
    // item held with a mouse, and nothing changes without hover.
    if (v === "outline" && theme === "dark") {
      return noHover ? "input-bg" : "input/50";
    }
    // `aria-pressed:` outranks a plain `active:` fill (consumer or library).
    return onToken(v, theme);
  }
  if (consumerWinsDark) {
    return "destructive";
  }
  // A consumer's `active:` fill wins, except in dark outline, where Toggle's
  // own `dark:` rules outrank it (as they did before): there the press fill
  // shows instead.
  if (consumer === "active" && !(v === "outline" && theme === "dark")) {
    return "primary";
  }
  return hoverToken(v, theme);
}

async function measureMatrix(
  commands: RealCommands,
  root: HTMLElement,
  variant: PressVariant,
  theme: MatrixTheme,
  noHovers: boolean[]
) {
  const cells: string[] = [];
  for (const consumer of Object.keys(MATRIX_CONSUMERS) as MatrixConsumer[]) {
    for (const state of ["off", "on"] as const) {
      for (const noHover of noHovers) {
        const id = `m-${theme}-${consumer}-${state}`;
        const rest = getComputedStyle(byTestId(root, id)).backgroundColor;
        // biome-ignore lint/performance/noAwaitInLoops: one real pointer at a time
        const held = await hold(
          commands,
          root,
          id,
          undefined,
          "horizontal",
          noHover ? "off" : "over"
        );
        const label = `${variant} ${theme} ${state} ${consumer} ${noHover ? "no-hover" : "hover"}`;
        cells.push(
          `${label}: rest=${tokenOf(root, theme, rest)} held=${tokenOf(root, theme, held.background)}`
        );
        await expect(held.active, `${label}: :active`).toBe(true);
        await expect(held.hovered, `${label}: :hover`).toBe(!noHover);
        const token = expectedToken(variant, theme, state, consumer, noHover);
        await expect(held.background, `${label}: held fill (${token})`).toBe(
          getComputedStyle(byTestId(root, `swatch-${theme}-${token}`))
            .backgroundColor
        );
        // Compare unchanged on items with their own fill before the press.
        // The panel gives accent a distinct value so default's hover and on
        // fills cannot pass this check merely because the theme aliases them.
        if (state === "on" && token === onToken(variant, theme)) {
          await expect(held.background, `${label}: on fill kept`).toBe(rest);
        }
      }
    }
  }
  console.log(`[matrix]\n${cells.join("\n")}`);
}

/**
 * One press matrix half: held with hover, or (`noHover`) slid off while held.
 * Each half is its own export so each has the per-test time limit to itself.
 */
const matrixStory = (
  variant: PressVariant,
  theme: MatrixTheme,
  noHover = false
): Story => ({
  render: () => <MatrixPanel theme={theme} variant={variant} />,
  play: async ({ canvasElement }) => {
    const commands = realCommands();
    if (!commands) {
      return;
    }
    await measureMatrix(commands, canvasElement, variant, theme, [noHover]);
  },
  ...(noHover ? { parameters: NO_SNAPSHOT } : {}),
});

export const PressMatrixDefaultLight: Story = {
  ...matrixStory("default", "light"),
  name: "Press Matrix Default Light",
};
export const PressMatrixDefaultLightNoHover: Story = {
  ...matrixStory("default", "light", true),
  name: "Press Matrix Default Light No Hover",
};
export const PressMatrixDefaultDark: Story = {
  ...matrixStory("default", "dark"),
  name: "Press Matrix Default Dark",
};
export const PressMatrixDefaultDarkNoHover: Story = {
  ...matrixStory("default", "dark", true),
  name: "Press Matrix Default Dark No Hover",
};
export const PressMatrixOutlineLight: Story = {
  ...matrixStory("outline", "light"),
  name: "Press Matrix Outline Light",
};
export const PressMatrixOutlineLightNoHover: Story = {
  ...matrixStory("outline", "light", true),
  name: "Press Matrix Outline Light No Hover",
};
export const PressMatrixOutlineDark: Story = {
  ...matrixStory("outline", "dark"),
  name: "Press Matrix Outline Dark",
};
export const PressMatrixOutlineDarkNoHover: Story = {
  ...matrixStory("outline", "dark", true),
  name: "Press Matrix Outline Dark No Hover",
};
export const PressMatrixSecondaryLight: Story = {
  ...matrixStory("secondary", "light"),
  name: "Press Matrix Secondary Light",
};
export const PressMatrixSecondaryLightNoHover: Story = {
  ...matrixStory("secondary", "light", true),
  name: "Press Matrix Secondary Light No Hover",
};
export const PressMatrixSecondaryDark: Story = {
  ...matrixStory("secondary", "dark"),
  name: "Press Matrix Secondary Dark",
};
export const PressMatrixSecondaryDarkNoHover: Story = {
  ...matrixStory("secondary", "dark", true),
  name: "Press Matrix Secondary Dark No Hover",
};
