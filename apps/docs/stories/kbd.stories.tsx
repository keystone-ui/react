import { Kbd, KbdGroup } from "@keystone/ui/kbd";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Kbd",
  component: Kbd,
  parameters: {
    docs: {
      description: {
        component: `
# Kbd

A component for displaying keyboard keys and shortcuts.

## Usage

\`\`\`tsx
import { Kbd, KbdGroup } from "@keystone/ui/kbd";

<Kbd>⌘</Kbd>

<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

// Single Key
export const SingleKey: Story = {
  name: "Single Key",
  render: () => <Kbd>K</Kbd>,
};

// Modifier Keys
export const ModifierKeys: Story = {
  name: "Modifier Keys",
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>⌥</Kbd>
      <Kbd>⌃</Kbd>
    </KbdGroup>
  ),
};

// Common Shortcuts
export const CommonShortcuts: Story = {
  name: "Common Shortcuts",
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="w-24 text-muted-foreground text-sm">Copy</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>C</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-muted-foreground text-sm">Paste</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>V</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-muted-foreground text-sm">Save</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>S</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-muted-foreground text-sm">Undo</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>Z</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-muted-foreground text-sm">Search</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
    </div>
  ),
};

// Windows Style
export const WindowsStyle: Story = {
  name: "Windows Style",
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="w-24 text-muted-foreground text-sm">Copy</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span className="text-muted-foreground">+</span>
          <Kbd>C</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-muted-foreground text-sm">Paste</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span className="text-muted-foreground">+</span>
          <Kbd>V</Kbd>
        </KbdGroup>
      </div>
    </div>
  ),
};

// Special Keys
export const SpecialKeys: Story = {
  name: "Special Keys",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Kbd>Enter</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Space</Kbd>
      <Kbd>Backspace</Kbd>
      <Kbd>Delete</Kbd>
      <Kbd>↑</Kbd>
      <Kbd>↓</Kbd>
      <Kbd>←</Kbd>
      <Kbd>→</Kbd>
    </div>
  ),
};

// Function Keys
export const FunctionKeys: Story = {
  name: "Function Keys",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Kbd>F1</Kbd>
      <Kbd>F2</Kbd>
      <Kbd>F3</Kbd>
      <Kbd>F4</Kbd>
      <Kbd>F5</Kbd>
      <Kbd>F6</Kbd>
      <Kbd>F7</Kbd>
      <Kbd>F8</Kbd>
      <Kbd>F9</Kbd>
      <Kbd>F10</Kbd>
      <Kbd>F11</Kbd>
      <Kbd>F12</Kbd>
    </div>
  ),
};

// Complex Shortcut
export const ComplexShortcut: Story = {
  name: "Complex Shortcut",
  render: () => (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">Toggle terminal:</span>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>`</Kbd>
      </KbdGroup>
    </div>
  ),
};
