import { Button } from "@keystone/ui/button";
import { Kbd } from "@keystone/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@keystone/ui/tooltip";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  HomeIcon,
  InboxIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";

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
} from "@keystone/ui/tooltip";

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
