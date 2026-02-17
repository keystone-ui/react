import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "keystoneui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "keystoneui/command";
import {
  BellIcon,
  CalculatorIcon,
  CalendarIcon,
  ClipboardPasteIcon,
  CodeIcon,
  CopyIcon,
  CreditCardIcon,
  FileTextIcon,
  FolderIcon,
  FolderPlusIcon,
  HelpCircleIcon,
  HomeIcon,
  ImageIcon,
  InboxIcon,
  LayoutGridIcon,
  ListIcon,
  PlusIcon,
  ScissorsIcon,
  SettingsIcon,
  SmileIcon,
  TrashIcon,
  UserIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import * as React from "react";

const meta = {
  title: "Components/Command",
  component: Command,
  parameters: {
    docs: {
      description: {
        component: `
A command menu component built on top of [cmdk](https://github.com/dip/cmdk). Provides a fast, composable, and accessible command palette with automatic filtering and sorting.

\`\`\`tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "keystoneui/command";

<CommandDialog open={open} onOpenChange={setOpen}>
  <Command>
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Suggestions">
        <CommandItem>Calendar</CommandItem>
        <CommandItem>Search Emoji</CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
</CommandDialog>
\`\`\`

## Features

- Automatic filtering and sorting of items
- Composable group and separator support
- Keyboard shortcut labels
- Modal dialog variant with overlay
- Search input with icon
- Empty state handling
- Accessible with proper ARIA attributes

## API Reference

See the [cmdk documentation](https://github.com/dip/cmdk) for the full API reference.
`,
      },
    },
  },
  subcomponents: {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
  },
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof Command>;

// =============================================================================
// Basic
// =============================================================================
export const Basic: Story = {
  name: "Basic",
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col gap-4">
        <Button
          className="w-fit"
          onClick={() => setOpen(true)}
          variant="outline"
        >
          Open Menu
        </Button>
        <CommandDialog onOpenChange={setOpen} open={open}>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>Calendar</CommandItem>
                <CommandItem>Search Emoji</CommandItem>
                <CommandItem>Calculator</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    );
  },
};

// =============================================================================
// With Shortcuts
// =============================================================================
export const WithShortcuts: Story = {
  name: "With Shortcuts",
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col gap-4">
        <Button
          className="w-fit"
          onClick={() => setOpen(true)}
          variant="outline"
        >
          Open Menu
        </Button>
        <CommandDialog onOpenChange={setOpen} open={open}>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Settings">
                <CommandItem>
                  <UserIcon />
                  <span>Profile</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <CreditCardIcon />
                  <span>Billing</span>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <SettingsIcon />
                  <span>Settings</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    );
  },
};

// =============================================================================
// With Groups
// =============================================================================
export const WithGroups: Story = {
  name: "With Groups",
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col gap-4">
        <Button
          className="w-fit"
          onClick={() => setOpen(true)}
          variant="outline"
        >
          Open Menu
        </Button>
        <CommandDialog onOpenChange={setOpen} open={open}>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>
                  <CalendarIcon />
                  <span>Calendar</span>
                </CommandItem>
                <CommandItem>
                  <SmileIcon />
                  <span>Search Emoji</span>
                </CommandItem>
                <CommandItem>
                  <CalculatorIcon />
                  <span>Calculator</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem>
                  <UserIcon />
                  <span>Profile</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <CreditCardIcon />
                  <span>Billing</span>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <SettingsIcon />
                  <span>Settings</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    );
  },
};

// =============================================================================
// Scrollable
// =============================================================================
export const Scrollable: Story = {
  name: "Scrollable",
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col gap-4">
        <Button
          className="w-fit"
          onClick={() => setOpen(true)}
          variant="outline"
        >
          Open Menu
        </Button>
        <CommandDialog onOpenChange={setOpen} open={open}>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Navigation">
                <CommandItem>
                  <HomeIcon />
                  <span>Home</span>
                  <CommandShortcut>⌘H</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <InboxIcon />
                  <span>Inbox</span>
                  <CommandShortcut>⌘I</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <FileTextIcon />
                  <span>Documents</span>
                  <CommandShortcut>⌘D</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <FolderIcon />
                  <span>Folders</span>
                  <CommandShortcut>⌘F</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem>
                  <PlusIcon />
                  <span>New File</span>
                  <CommandShortcut>⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <FolderPlusIcon />
                  <span>New Folder</span>
                  <CommandShortcut>⇧⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <CopyIcon />
                  <span>Copy</span>
                  <CommandShortcut>⌘C</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <ScissorsIcon />
                  <span>Cut</span>
                  <CommandShortcut>⌘X</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <ClipboardPasteIcon />
                  <span>Paste</span>
                  <CommandShortcut>⌘V</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <TrashIcon />
                  <span>Delete</span>
                  <CommandShortcut>⌫</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="View">
                <CommandItem>
                  <LayoutGridIcon />
                  <span>Grid View</span>
                </CommandItem>
                <CommandItem>
                  <ListIcon />
                  <span>List View</span>
                </CommandItem>
                <CommandItem>
                  <ZoomInIcon />
                  <span>Zoom In</span>
                  <CommandShortcut>⌘+</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <ZoomOutIcon />
                  <span>Zoom Out</span>
                  <CommandShortcut>⌘-</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Account">
                <CommandItem>
                  <UserIcon />
                  <span>Profile</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <CreditCardIcon />
                  <span>Billing</span>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <SettingsIcon />
                  <span>Settings</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <BellIcon />
                  <span>Notifications</span>
                </CommandItem>
                <CommandItem>
                  <HelpCircleIcon />
                  <span>Help & Support</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Tools">
                <CommandItem>
                  <CalculatorIcon />
                  <span>Calculator</span>
                </CommandItem>
                <CommandItem>
                  <CalendarIcon />
                  <span>Calendar</span>
                </CommandItem>
                <CommandItem>
                  <ImageIcon />
                  <span>Image Editor</span>
                </CommandItem>
                <CommandItem>
                  <CodeIcon />
                  <span>Code Editor</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    );
  },
};

// =============================================================================
// Keyboard Trigger
// =============================================================================
export const KeyboardTrigger: Story = {
  name: "Keyboard Trigger",
  render: () => {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen((prev) => !prev);
        }
      };

      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }, []);

    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Press{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>{" "}
          to open the command menu
        </p>
        <Button
          className="w-fit"
          onClick={() => setOpen(true)}
          variant="outline"
        >
          Or Click Here
        </Button>
        <CommandDialog onOpenChange={setOpen} open={open}>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>
                  <CalendarIcon />
                  <span>Calendar</span>
                </CommandItem>
                <CommandItem>
                  <SmileIcon />
                  <span>Search Emoji</span>
                </CommandItem>
                <CommandItem>
                  <CalculatorIcon />
                  <span>Calculator</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem>
                  <UserIcon />
                  <span>Profile</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <CreditCardIcon />
                  <span>Billing</span>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <SettingsIcon />
                  <span>Settings</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    );
  },
};

// =============================================================================
// Disabled Items
// =============================================================================
export const DisabledItems: Story = {
  name: "Disabled Items",
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col gap-4">
        <Button
          className="w-fit"
          onClick={() => setOpen(true)}
          variant="outline"
        >
          Open Menu
        </Button>
        <CommandDialog onOpenChange={setOpen} open={open}>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Actions">
                <CommandItem>
                  <CalendarIcon />
                  <span>Calendar</span>
                </CommandItem>
                <CommandItem disabled>
                  <SmileIcon />
                  <span>Search Emoji (Coming Soon)</span>
                </CommandItem>
                <CommandItem>
                  <CalculatorIcon />
                  <span>Calculator</span>
                </CommandItem>
                <CommandItem disabled>
                  <SettingsIcon />
                  <span>Advanced Settings (Locked)</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    );
  },
};
