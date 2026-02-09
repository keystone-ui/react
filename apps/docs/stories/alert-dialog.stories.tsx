import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@keystone/ui/alert-dialog";
import { Button } from "@keystone/ui/button";
import {
  CircleFadingPlusIcon,
  BluetoothIcon,
  Trash2Icon,
} from "lucide-react";

const meta = {
  title: "Components/AlertDialog",
  component: AlertDialog,
  parameters: {
    docs: {
      description: {
        component: `
An alert dialog component built on top of [Base UI AlertDialog](https://base-ui.com/react/components/alert-dialog). Unlike a regular dialog, an alert dialog requires an explicit user action (Action or Cancel) to dismiss — it cannot be closed by clicking the overlay or pressing Escape.

\`\`\`tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@keystone/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger render={<Button variant="outline" />}>
    Show Dialog
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
\`\`\`

## Dialog vs AlertDialog

This is an **accessibility distinction**, not a visual one. They come from two different Base UI primitives with different ARIA semantics.

| | Dialog (Modal) | AlertDialog |
|---|---|---|
| **ARIA role** | \`dialog\` | \`alertdialog\` |
| **Close on overlay click** | Yes | No |
| **Close on Escape** | Yes | No (by default) |
| **Has close X button** | Yes | No |
| **Requires explicit action** | No | Yes — user must pick Action or Cancel |
| **Use case** | Forms, settings, content | Confirmations, destructive warnings |

**Use Dialog (Modal) when** the user is doing something optional or exploratory: editing a profile, viewing settings, previewing an image.

**Use AlertDialog when** the user must acknowledge or decide: "Delete this item?", "Unsaved changes will be lost.", or any action where accidental dismissal could cause data loss.

## Features

- Same overlay and animation as the Modal component
- Cannot be dismissed by clicking the overlay or pressing Escape
- Composable header, footer, title, description, and media slot
- Size variants: \`default\` and \`sm\`
- Tinted footer with border to visually separate the decision zone
- Accessible with proper ARIA \`alertdialog\` role

## API Reference

### size

Use the \`size\` prop on \`AlertDialogContent\` to control the size of the alert dialog.

| Prop | Type | Default |
|---|---|---|
| \`size\` | \`"default" \\| "sm"\` | \`"default"\` |

For more information about the other components and their props, see the [Base UI AlertDialog documentation](https://base-ui.com/react/components/alert-dialog).
`,
      },
    },
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof AlertDialog>;

// =============================================================================
// Basic
// =============================================================================
export const Basic: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        Show Dialog
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A basic alert dialog with a title, description, and cancel and continue buttons.",
      },
    },
  },
};

// =============================================================================
// Small
// =============================================================================
export const Small: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        Show Dialog
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
          <AlertDialogDescription>
            Do you want to allow the USB accessory to connect to this device?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
          <AlertDialogAction>Allow</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use the `size="sm"` prop to make the alert dialog smaller. The small variant keeps a compact `max-w-xs` width and switches the footer to a two-column grid layout.',
      },
    },
  },
};

// =============================================================================
// With Media
// =============================================================================
export const WithMedia: Story = {
  name: "With Media",
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        Share Project
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CircleFadingPlusIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Share this project?</AlertDialogTitle>
          <AlertDialogDescription>
            Anyone with the link will be able to view and edit this project.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Share</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `AlertDialogMedia` component to add a media element such as an icon or image to the alert dialog. On larger screens with the default size, the layout shifts to a two-column grid with the icon spanning both rows.",
      },
    },
  },
};

// =============================================================================
// Small with Media
// =============================================================================
export const SmallWithMedia: Story = {
  name: "Small with Media",
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        Show Dialog
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <BluetoothIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
          <AlertDialogDescription>
            Do you want to allow the USB accessory to connect to this device?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
          <AlertDialogAction>Allow</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Combine `size="sm"` with `AlertDialogMedia` to create a compact alert dialog with an icon. The small size keeps the centered layout at all screen widths.',
      },
    },
  },
};

// =============================================================================
// Destructive
// =============================================================================
export const Destructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Delete Chat
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete chat?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this chat conversation. View{" "}
            <a href="#">Settings</a> to delete any memories saved during this
            chat.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use the `variant="destructive"` prop on `AlertDialogAction` and custom destructive colors on `AlertDialogMedia` to create a destructive confirmation dialog.',
      },
    },
  },
};
