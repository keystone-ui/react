import { Button } from "@keystoneui/react/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  SelectionBar,
  SelectionBarBullet,
  SelectionBarButton,
  SelectionBarClose,
  SelectionBarGroup,
  SelectionBarLabel,
  SelectionBarLink,
  SelectionBarSeparator,
} from "@keystoneui/react/selection-bar";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  FileSpreadsheet as FileSpreadsheetIcon,
  Trash as TrashIcon,
} from "lucide-react";
import { useState } from "react";

const meta = {
  title: "Components/SelectionBar",
  component: SelectionBar,
  parameters: {
    docs: {
      description: {
        component: `
A floating action bar that appears when items are selected in a list or table. Composes a count label, optional "select all" link, and bulk-action buttons in a single dark pill anchored to the bottom of the viewport.

\`\`\`tsx
import {
  SelectionBar,
  SelectionBarClose,
  SelectionBarGroup,
  SelectionBarLabel,
  SelectionBarBullet,
  SelectionBarLink,
  SelectionBarButton,
  SelectionBarSeparator,
} from "@keystoneui/react/selection-bar";

<SelectionBar open={selectedCount > 0}>
  <SelectionBarClose onClick={clearSelection} />
  <SelectionBarGroup>
    <SelectionBarLabel>{selectedCount} selected</SelectionBarLabel>
    <SelectionBarBullet />
    <SelectionBarLink onClick={selectAll}>Select all</SelectionBarLink>
  </SelectionBarGroup>
  <SelectionBarButton>Assign</SelectionBarButton>
  <SelectionBarSeparator />
  <SelectionBarButton tone="destructive">Delete</SelectionBarButton>
</SelectionBar>
\`\`\`
`,
      },
    },
  },
  argTypes: {
    open: {
      control: "boolean",
      description:
        "Whether the bar is visible. Drives the enter/exit animation.",
    },
    position: {
      control: "select",
      options: ["fixed", "inline"],
      description:
        "`fixed` (default) anchors to the viewport bottom; `inline` renders in flow.",
    },
  },
} satisfies Meta<typeof SelectionBar>;

export default meta;
type Story = StoryObj<typeof SelectionBar>;

export const Default: Story = {
  args: {
    open: true,
    position: "inline",
  },
  render: (args) => (
    <div className="flex min-h-[200px] items-end justify-center pb-4">
      <SelectionBar {...args}>
        <SelectionBarClose />
        <SelectionBarGroup>
          <SelectionBarLabel>3 items selected</SelectionBarLabel>
        </SelectionBarGroup>
        <SelectionBarButton>Move</SelectionBarButton>
        <SelectionBarButton>Tag</SelectionBarButton>
        <SelectionBarSeparator />
        <SelectionBarButton tone="destructive">
          <TrashIcon />
          Delete
        </SelectionBarButton>
      </SelectionBar>
    </div>
  ),
};

export const WithBulkActions: Story = {
  args: { open: true, position: "inline" },
  render: () => {
    const TOTAL = 20;
    const [count, setCount] = useState(1);

    return (
      <div className="flex min-h-[260px] flex-col items-center justify-end gap-4 pb-4">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Selected:</span>
          <span className="font-medium tabular-nums">{count}</span>
          <Button onClick={() => setCount(0)} size="xs" variant="outline">
            Clear
          </Button>
          <Button onClick={() => setCount(1)} size="xs" variant="outline">
            Select 1
          </Button>
          <Button onClick={() => setCount(TOTAL)} size="xs" variant="outline">
            Select all
          </Button>
        </div>

        <SelectionBar open={count > 0} position="inline">
          <SelectionBarClose onClick={() => setCount(0)} />
          <SelectionBarGroup>
            <SelectionBarLabel>
              {count} {count === 1 ? "ticket" : "tickets"} selected
            </SelectionBarLabel>
            {count > 0 && count < TOTAL ? (
              <>
                <SelectionBarBullet />
                <SelectionBarLink onClick={() => setCount(TOTAL)}>
                  Select all {TOTAL}
                </SelectionBarLink>
              </>
            ) : null}
          </SelectionBarGroup>

          <DropdownMenu>
            <DropdownMenuTrigger render={<SelectionBarButton />}>
              Change status
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top">
              <DropdownMenuGroup>
                <DropdownMenuItem>Open</DropdownMenuItem>
                <DropdownMenuItem>Pending</DropdownMenuItem>
                <DropdownMenuItem>Resolved</DropdownMenuItem>
                <DropdownMenuItem>Closed</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <SelectionBarButton>Assign</SelectionBarButton>
          <SelectionBarButton>Priority</SelectionBarButton>
          <SelectionBarSeparator />
          <SelectionBarButton tone="success">
            <FileSpreadsheetIcon />
            Export CSV
          </SelectionBarButton>
          <SelectionBarButton tone="destructive">
            <TrashIcon />
            Delete
          </SelectionBarButton>
        </SelectionBar>
      </div>
    );
  },
};

export const Tones: Story = {
  args: { open: true, position: "inline" },
  render: () => (
    <div className="flex min-h-[220px] flex-col items-center justify-end gap-4 pb-4">
      <SelectionBar open position="inline">
        <SelectionBarClose />
        <SelectionBarGroup>
          <SelectionBarLabel>5 selected</SelectionBarLabel>
        </SelectionBarGroup>
        <SelectionBarButton>Approve</SelectionBarButton>
        <SelectionBarButton tone="success">
          <FileSpreadsheetIcon />
          Export
        </SelectionBarButton>
        <SelectionBarButton tone="destructive">
          <TrashIcon />
          Delete
        </SelectionBarButton>
      </SelectionBar>
    </div>
  ),
};
