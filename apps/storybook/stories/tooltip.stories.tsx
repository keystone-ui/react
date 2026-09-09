import { Button } from "@keystoneui/react/button";
import { Kbd } from "@keystoneui/react/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@keystoneui/react/tooltip";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  House as HomeIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { expect, userEvent, within } from "storybook/test";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component: `
A tooltip component for displaying informational text when hovering or focusing an element.

\`\`\`tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@keystoneui/react/tooltip";

<Tooltip>
  <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
  <TooltipContent>
    <p>Add to library</p>
  </TooltipContent>
</Tooltip>
\`\`\`

## Features

- Configurable positioning (side and alignment)
- Animation support with enter/exit transitions
- Accessible — announces content to screen readers
- Portal rendering for proper z-index handling
- Arrow indicator pointing to the trigger
- Works with disabled elements via span wrapper
- Keyboard shortcut display with \`Kbd\` component

## Group Delay (Warm-up / Cool-down)

Wrap multiple tooltips in a \`TooltipProvider\` with a \`delay\` to get the warm-up / cool-down pattern: the first tooltip waits for the delay, but subsequent hovers in the same group appear instantly. After the user stops interacting, the delay resets.

This is ideal for icon-only sidebars or toolbars where you want to avoid accidental triggers on fly-by hovers, but still let users scan items quickly once engaged.

\`\`\`tsx
<TooltipProvider delay={700} closeDelay={150}>
  <Tooltip>
    <TooltipTrigger render={<Button variant="ghost" size="icon-sm"><HomeIcon /></Button>} />
    <TooltipContent side="right">Home</TooltipContent>
  </Tooltip>
  <Tooltip>
    <TooltipTrigger render={<Button variant="ghost" size="icon-sm"><SettingsIcon /></Button>} />
    <TooltipContent side="right">Settings</TooltipContent>
  </Tooltip>
</TooltipProvider>
\`\`\`

## API Reference

See the [Base UI Tooltip documentation](https://base-ui.com/react/components/tooltip).
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="flex min-h-32 items-center justify-center">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  subcomponents: { TooltipTrigger, TooltipContent },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /hover me/i });

    await userEvent.hover(trigger);
    await new Promise((r) => setTimeout(r, 1000));

    await expect(
      document.querySelector("[data-slot='tooltip-content']")
    ).toBeInTheDocument();
  },
};

// ---------------------------------------------------------------------------
// Sides
// ---------------------------------------------------------------------------

export const Sides: Story = {
  name: "Sides",
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["left", "top", "bottom", "right"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger
            render={
              <Button className="w-fit capitalize" variant="outline">
                {side}
              </Button>
            }
          />
          <TooltipContent side={side}>
            <p>Add to library</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// With Keyboard Shortcut
// ---------------------------------------------------------------------------

export const WithKeyboardShortcut: Story = {
  name: "With Keyboard Shortcut",
  render: () => (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button size="icon-sm" variant="outline">
            <SaveIcon />
          </Button>
        }
      />
      <TooltipContent className="pr-1.5">
        <div className="flex items-center gap-2">
          Save Changes <Kbd>S</Kbd>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
};

// ---------------------------------------------------------------------------
// Disabled Button
// ---------------------------------------------------------------------------

export const DisabledButton: Story = {
  name: "Disabled Button",
  render: () => (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-block w-fit">
            <Button disabled variant="outline">
              Disabled
            </Button>
          </span>
        }
      />
      <TooltipContent>
        <p>This feature is currently unavailable</p>
      </TooltipContent>
    </Tooltip>
  ),
};

// ---------------------------------------------------------------------------
// Group Delay (Sidebar)
// ---------------------------------------------------------------------------

const sidebarItems = [
  { icon: HomeIcon, label: "Home" },
  { icon: SearchIcon, label: "Search" },
  { icon: InboxIcon, label: "Inbox" },
  { icon: SettingsIcon, label: "Settings" },
];

export const GroupDelay: Story = {
  name: "Group Delay (Sidebar)",
  decorators: [
    (Story) => (
      <div className="flex min-h-64 items-start justify-center pt-4">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <TooltipProvider closeDelay={150} delay={700}>
      <nav className="flex flex-col gap-1 rounded-lg border p-1.5">
        {sidebarItems.map(({ icon: Icon, label }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <Button size="icon-sm" variant="ghost">
                  <Icon />
                </Button>
              }
            />
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  ),
};

function DefinitionTip({ content, label }: { content: string; label: string }) {
  const descriptionId = useId();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip onOpenChange={setOpen} open={open}>
        <TooltipTrigger
          closeOnClick={false}
          render={
            <button
              aria-describedby={descriptionId}
              aria-label={`${label} definition`}
              className="inline-flex cursor-help items-center rounded-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 [&_svg:not([class*='size-'])]:size-3 [&_svg]:pointer-events-none [&_svg]:shrink-0"
              onClick={() => setOpen((previous) => !previous)}
              type="button"
            />
          }
        >
          <InfoIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent aria-hidden="true" className="max-w-64">
          {content}
        </TooltipContent>
      </Tooltip>
      <span className="sr-only" id={descriptionId}>
        {content}
      </span>
    </>
  );
}

export const InfoTip: Story = {
  name: "Info Tip",
  parameters: {
    docs: {
      description: {
        story: `
Tooltip is a **visual enhancement only**. Base UI wires no \`aria-describedby\`
and no \`role\` — the only \`aria-*\` attribute anywhere in its tooltip is
\`aria-hidden\` on the arrow — and its trigger is \`mouseOnly\`. A plain Tooltip
therefore reaches neither assistive technology nor touch.

Never put information in a Tooltip that is not available elsewhere. When the
tooltip *is* the only place the text appears, use this pattern:

1. Render the text in an always-present \`sr-only\` span and point
   \`aria-describedby\` at it. That span, not the popup, is what gets read —
   pointing at the popup would dangle, since it is unmounted while closed.
2. Mark the popup \`aria-hidden\`, or the same string sits in the accessibility
   tree twice while open.
3. Control \`open\` and toggle on click so touch works, with
   \`closeOnClick={false}\` so Base UI's own click-to-close does not fight it.
        `,
      },
    },
  },
  render: () => (
    <dl className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <dt className="inline-flex items-center gap-1 text-muted-foreground text-sm">
          Pickup p50
          <DefinitionTip
            content="Ready-and-requested until someone other than the author reviews. The most common place teams lose days."
            label="Pickup p50"
          />
        </dt>
        <dd className="font-medium text-sm tabular-nums">3h 12m</dd>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <dt className="inline-flex items-center gap-1 text-muted-foreground text-sm">
          Coding p50
          <DefinitionTip
            content="First commit until the PR is ready and a review has been requested. Includes draft time — the author was still working."
            label="Coding p50"
          />
        </dt>
        <dd className="font-medium text-sm tabular-nums">1d 4h</dd>
      </div>
    </dl>
  ),
};
