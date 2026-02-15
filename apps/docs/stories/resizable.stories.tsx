import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@keystone/ui/resizable";
import type { Meta, StoryObj } from "@storybook/react-vite";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Components/Resizable",
  component: ResizablePanelGroup,
  parameters: {
    docs: {
      description: {
        component: `
A set of resizable panel components built on top of \`react-resizable-panels\`.

\`\`\`tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@keystone/ui/resizable";

<ResizablePanelGroup orientation="horizontal">
  <ResizablePanel defaultSize="50%">One</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize="50%">Two</ResizablePanel>
</ResizablePanelGroup>
\`\`\`

## Features

- Horizontal and vertical orientation
- Nested panel groups
- Optional visible drag handle
- Min/max size constraints
- Collapsible panels
- Keyboard accessible

## API Reference

See the [react-resizable-panels documentation](https://github.com/bvaughn/react-resizable-panels).
        `,
      },
    },
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <ResizablePanelGroup
      className="max-w-sm rounded-lg border"
      orientation="horizontal"
    >
      <ResizablePanel defaultSize="50%">
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="50%">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize="25%">
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Two</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="75%">
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Three</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

// ---------------------------------------------------------------------------
// Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  name: "Vertical",
  render: () => (
    <ResizablePanelGroup
      className="min-h-[200px] max-w-sm rounded-lg border"
      orientation="vertical"
    >
      <ResizablePanel defaultSize="25%">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Header</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="75%">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

// ---------------------------------------------------------------------------
// Handle
// ---------------------------------------------------------------------------

export const Handle: Story = {
  name: "Handle",
  render: () => (
    <ResizablePanelGroup
      className="min-h-[200px] max-w-md rounded-lg border md:min-w-[450px]"
      orientation="horizontal"
    >
      <ResizablePanel defaultSize="25%">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="75%">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
