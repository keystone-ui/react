import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@keystone/ui/modal";
import { Button } from "@keystone/ui/button";
import { Input } from "@keystone/ui/input";
import { Label } from "@keystone/ui/label";
import { Checkbox } from "@keystone/ui/checkbox";

const meta = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    docs: {
      description: {
        component: `
A modal dialog component built on top of [Base UI Dialog](https://base-ui.com/react/components/dialog). Modals open on top of the entire page with an overlay backdrop, trapping focus and blocking interaction with the rest of the page.

\`\`\`tsx
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@keystone/ui/modal";

<Modal>
  <ModalTrigger render={<Button variant="outline" />}>
    Open Modal
  </ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Title</ModalTitle>
      <ModalDescription>Description text.</ModalDescription>
    </ModalHeader>
    <ModalFooter>
      <Button>Submit</Button>
      <ModalClose render={<Button variant="outline" />}>
        Cancel
      </ModalClose>
    </ModalFooter>
  </ModalContent>
</Modal>
\`\`\`

## Features

- Overlay backdrop with fade animation
- Centered popup with zoom + fade animation
- Focus trapping and scroll locking (modal behavior)
- Composable header, footer, title, and description
- Size variants: \`sm\`, \`default\`, \`lg\`, \`xl\`, \`full\`
- Optional close button in top-right corner
- Accessible with proper ARIA attributes
- Nested dialog support

## API Reference

See the [Base UI Dialog documentation](https://base-ui.com/react/components/dialog) for the full API reference.
`,
      },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof Modal>;

// =============================================================================
// Default
// =============================================================================
export const Default: Story = {
  render: () => (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Open Modal
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Are you absolutely sure?</ModalTitle>
          <ModalDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button>Confirm</Button>
          <ModalClose render={<Button variant="outline" />}>
            Cancel
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

// =============================================================================
// Sizes
// =============================================================================
const MODAL_SIZES = ["sm", "default", "lg", "xl", "full"] as const;

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {MODAL_SIZES.map((size) => (
        <Modal key={size}>
          <ModalTrigger render={<Button variant="outline" />}>
            {size}
          </ModalTrigger>
          <ModalContent size={size}>
            <ModalHeader>
              <ModalTitle>Size: {size}</ModalTitle>
              <ModalDescription>
                This modal uses the <code>{size}</code> size variant.
              </ModalDescription>
            </ModalHeader>
            <div className="text-muted-foreground text-sm">
              The content area adjusts to the max-width defined by the size
              variant. On mobile, all sizes collapse to{" "}
              <code>calc(100% - 2rem)</code>.
            </div>
            <ModalFooter>
              <ModalClose render={<Button variant="outline" />}>
                Close
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `size` prop on `ModalContent` to control the max-width. Available sizes are `sm` (384px), `default` (512px), `lg` (672px), `xl` (896px), and `full` (viewport minus 2rem).",
      },
    },
  },
};

// =============================================================================
// Custom Close Button
// =============================================================================
export const CustomCloseButton: Story = {
  render: () => (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Share
      </ModalTrigger>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle>Share link</ModalTitle>
          <ModalDescription>
            Anyone who has this link will be able to view this.
          </ModalDescription>
        </ModalHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue="https://keystoneui.com/docs/installation"
              readOnly
            />
          </div>
        </div>
        <ModalFooter className="sm:justify-start">
          <ModalClose render={<Button />}>
            Close
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Replace the default close control with your own button using `ModalClose` with the `render` prop to compose it with a `Button`.",
      },
    },
  },
};

// =============================================================================
// No Close Button
// =============================================================================
export const NoCloseButton: Story = {
  render: () => (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        No Close Button
      </ModalTrigger>
      <ModalContent showCloseButton={false}>
        <ModalHeader>
          <ModalTitle>No Close Button</ModalTitle>
          <ModalDescription>
            This modal doesn&apos;t have a close button in the top-right corner.
            Click the overlay or press Escape to dismiss.
          </ModalDescription>
        </ModalHeader>
      </ModalContent>
    </Modal>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `showCloseButton={false}` on `ModalContent` to hide the default X close button.",
      },
    },
  },
};

// =============================================================================
// Footer with Close Button
// =============================================================================
export const FooterWithCloseButton: Story = {
  render: () => (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Footer Close
      </ModalTrigger>
      <ModalContent showCloseButton={false}>
        <ModalHeader>
          <ModalTitle>Terms of Service</ModalTitle>
          <ModalDescription>
            Please review and accept the terms of service to continue.
          </ModalDescription>
        </ModalHeader>
        <div className="text-muted-foreground text-sm">
          By using our service, you agree to our terms and conditions. We
          reserve the right to modify these terms at any time.
        </div>
        <ModalFooter showCloseButton>
          <Button>Accept</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `showCloseButton` on `ModalFooter` to add a built-in outline close button. This pairs well with `showCloseButton={false}` on `ModalContent` to move the close affordance to the footer.",
      },
    },
  },
};

// =============================================================================
// Sticky Footer
// =============================================================================
export const StickyFooter: Story = {
  render: () => (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Sticky Footer
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Sticky Footer</ModalTitle>
          <ModalDescription>
            This modal has a sticky footer that stays visible while the content
            scrolls.
          </ModalDescription>
        </ModalHeader>
        <div className="no-scrollbar -mx-6 max-h-[50vh] overflow-y-auto px-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <p key={index} className="mb-4 leading-normal">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
              culpa qui officia deserunt mollit anim id est laborum.
            </p>
          ))}
        </div>
        <ModalFooter>
          <ModalClose render={<Button variant="outline" />}>
            Close
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Keep actions visible while the content scrolls. The scrollable area uses negative horizontal margin to extend edge-to-edge within the modal padding.",
      },
    },
  },
};

// =============================================================================
// Scrollable Content
// =============================================================================
export const ScrollableContent: Story = {
  render: () => (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Scrollable Content
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Scrollable Content</ModalTitle>
          <ModalDescription>
            This is a modal with scrollable content.
          </ModalDescription>
        </ModalHeader>
        <div className="no-scrollbar -mx-6 max-h-[50vh] overflow-y-auto px-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <p key={index} className="mb-4 leading-normal">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
              culpa qui officia deserunt mollit anim id est laborum.
            </p>
          ))}
        </div>
      </ModalContent>
    </Modal>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Long content can scroll while the header and close button stay in view.",
      },
    },
  },
};

// =============================================================================
// Sign Up Form
// =============================================================================
function SignUpFormDemo() {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setOpen(false);
    }, 1500);
  };

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger render={<Button />}>
        Create Account
      </ModalTrigger>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle>Create an account</ModalTitle>
          <ModalDescription>
            Enter your details below to create your account and get started.
          </ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input id="first-name" placeholder="John" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input id="last-name" placeholder="Doe" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="terms" required />
            <Label htmlFor="terms" className="text-sm font-normal">
              I agree to the{" "}
              <a href="#" className="text-primary underline underline-offset-4">
                terms and conditions
              </a>
            </Label>
          </div>
          <ModalFooter className="px-0 pt-2">
            <Button type="submit" isLoading={isLoading} fullWidth>
              Create account
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export const SignUpForm: Story = {
  render: () => <SignUpFormDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "A full sign-up form demonstrating form integration inside a modal. Uses controlled state to close the modal on submission, with a loading state on the submit button.",
      },
    },
  },
};

// =============================================================================
// Controlled
// =============================================================================
function ControlledDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-4">
      <Modal open={open} onOpenChange={setOpen}>
        <ModalTrigger render={<Button variant="outline" />}>
          Controlled Modal
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Controlled Modal</ModalTitle>
            <ModalDescription>
              This modal&apos;s state is controlled externally. The open state
              is: <strong>{open ? "open" : "closed"}</strong>.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button onClick={() => setOpen(false)}>Done</Button>
            <ModalClose render={<Button variant="outline" />}>
              Cancel
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <p className="text-muted-foreground text-sm">
        State: <code>{open ? "open" : "closed"}</code>
      </p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Use the `open` and `onOpenChange` props to control the modal state externally. This allows you to open the modal imperatively or react to state changes.",
      },
    },
  },
};

// =============================================================================
// Nested
// =============================================================================
export const Nested: Story = {
  render: () => (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Open Parent
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Parent Modal</ModalTitle>
          <ModalDescription>
            This is the parent modal. You can open a nested modal from here.
          </ModalDescription>
        </ModalHeader>
        <Modal>
          <ModalTrigger render={<Button variant="secondary" />}>
            Open Nested Modal
          </ModalTrigger>
          <ModalContent size="sm">
            <ModalHeader>
              <ModalTitle>Nested Modal</ModalTitle>
              <ModalDescription>
                This is a nested modal. Closing this will return focus to the
                parent modal.
              </ModalDescription>
            </ModalHeader>
            <ModalFooter>
              <ModalClose render={<Button />}>
                Got it
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <ModalFooter>
          <ModalClose render={<Button variant="outline" />}>
            Close
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Modals can be nested within one another. Closing the nested modal returns focus to the parent modal. The overlay of the nested modal is not re-rendered.",
      },
    },
  },
};

// =============================================================================
// Confirmation Dialog
// =============================================================================
function ConfirmationDemo() {
  const [open, setOpen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  return (
    <div className="flex items-center gap-4">
      <Modal open={open} onOpenChange={setOpen}>
        <ModalTrigger render={<Button variant="destructive" />}>
          Delete Account
        </ModalTrigger>
        <ModalContent size="sm" showCloseButton={false}>
          <ModalHeader>
            <ModalTitle>Delete account?</ModalTitle>
            <ModalDescription>
              This action is permanent and cannot be undone. All your data will
              be deleted.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmed(true);
                setOpen(false);
              }}
            >
              Delete
            </Button>
            <ModalClose render={<Button variant="outline" />}>
              Cancel
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {confirmed && (
        <p className="text-destructive text-sm">Account deleted.</p>
      )}
    </div>
  );
}

export const Confirmation: Story = {
  render: () => <ConfirmationDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "A confirmation dialog pattern using a smaller modal with no close button. Useful for destructive actions that require explicit user confirmation.",
      },
    },
  },
};
