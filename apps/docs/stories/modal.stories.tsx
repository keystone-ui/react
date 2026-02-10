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
import {
  Stepper,
  StepperContent,
  StepperStep,
  useStepper,
} from "@keystone/ui/stepper";
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
      <ModalContent scrollBehavior="inside">
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
          'Keep actions visible while the content scrolls. Uses `scrollBehavior="inside"` so the modal stays fixed while the content area scrolls internally. The scrollable area uses negative horizontal margin to extend edge-to-edge within the modal padding.',
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
      <ModalContent scrollBehavior="inside">
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
          'Uses `scrollBehavior="inside"` so long content scrolls within the modal while the header and close button stay in view.',
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

// =============================================================================
// Multi-Step
// =============================================================================
function MultiStepStepIndicator() {
  const { value, totalSteps } = useStepper();
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === value
              ? "bg-primary w-6"
              : i < value
                ? "bg-primary/40 w-1.5"
                : "bg-muted w-1.5"
          }`}
        />
      ))}
    </div>
  );
}

function MultiStepNav() {
  const { goNext, goPrevious, isFirst, isLast } = useStepper();
  return (
    <ModalFooter>
      <Button onClick={isLast ? undefined : goNext}>
        {isLast ? "Get Started" : "Continue"}
      </Button>
      <Button variant="outline" onClick={goPrevious} disabled={isFirst}>
        Back
      </Button>
    </ModalFooter>
  );
}

function MultiStepDemo() {
  const [step, setStep] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setStep(0);
      }}
    >
      <ModalTrigger render={<Button />}>Start Onboarding</ModalTrigger>
      <ModalContent showCloseButton={false} className="sm:max-w-md">
        <Stepper value={step} onValueChange={setStep}>
          <ModalHeader className="items-center">
            <MultiStepStepIndicator />
          </ModalHeader>
          <StepperContent>
            <StepperStep>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold">Welcome aboard!</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Let&apos;s get your workspace set up in just a few steps.
                </p>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="ms-name">Full name</Label>
                  <Input id="ms-name" placeholder="John Doe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ms-email">Email</Label>
                  <Input
                    id="ms-email"
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </StepperStep>
            <StepperStep>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold">Create your workspace</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Choose a name and URL for your team workspace.
                </p>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="ms-workspace">Workspace name</Label>
                  <Input id="ms-workspace" placeholder="Acme Inc." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ms-url">Workspace URL</Label>
                  <Input id="ms-url" placeholder="acme" />
                </div>
              </div>
            </StepperStep>
            <StepperStep>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold">Invite your team</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Add team members to collaborate together.
                </p>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="ms-invite-1">Team member email</Label>
                  <Input
                    id="ms-invite-1"
                    type="email"
                    placeholder="teammate@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ms-invite-2">Another email (optional)</Label>
                  <Input
                    id="ms-invite-2"
                    type="email"
                    placeholder="another@example.com"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="ms-skip" />
                  <Label htmlFor="ms-skip" className="text-sm font-normal">
                    Skip for now, I&apos;ll invite later
                  </Label>
                </div>
              </div>
            </StepperStep>
          </StepperContent>
          <MultiStepNav />
        </Stepper>
      </ModalContent>
    </Modal>
  );
}

export const MultiStep: Story = {
  name: "Multi-Step",
  render: () => <MultiStepDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "An onboarding wizard using the `Stepper` component inside a Modal. The Modal API is completely unchanged — the Stepper is composed as a child of `ModalContent`. Step indicator dots, animated transitions, and Back/Continue navigation are all powered by `useStepper()`.",
      },
    },
  },
};

// =============================================================================
// Long Content (scrollBehavior="outside")
// =============================================================================
export const LongContent: Story = {
  name: "Long Content",
  render: () => (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Terms &amp; Conditions
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Terms of Service</ModalTitle>
          <ModalDescription>
            Last updated: January 1, 2026. Please read these terms carefully
            before using our services.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h3 className="mb-2 font-semibold">1. Acceptance of Terms</h3>
            <p className="text-muted-foreground">
              By accessing and using this platform, you acknowledge that you have
              read, understood, and agree to be bound by these Terms of Service
              and all applicable laws and regulations. If you do not agree with
              any of these terms, you are prohibited from using or accessing this
              site. The materials contained in this platform are protected by
              applicable copyright and trademark law.
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">2. Use License</h3>
            <p className="text-muted-foreground">
              Permission is granted to temporarily download one copy of the
              materials on this platform for personal, non-commercial transitory
              viewing only. This is the grant of a license, not a transfer of
              title, and under this license you may not: modify or copy the
              materials; use the materials for any commercial purpose, or for any
              public display (commercial or non-commercial); attempt to
              decompile or reverse engineer any software contained on the
              platform; remove any copyright or other proprietary notations from
              the materials; or transfer the materials to another person or
              &ldquo;mirror&rdquo; the materials on any other server.
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">3. Account Responsibilities</h3>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your
              account and password, including but not limited to the restriction
              of access to your computer and/or account. You agree to accept
              responsibility for any and all activities or actions that occur
              under your account and/or password, whether your password is with
              our service or a third-party service. You must notify us
              immediately upon becoming aware of any breach of security or
              unauthorized use of your account.
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">4. Privacy Policy</h3>
            <p className="text-muted-foreground">
              Your privacy is important to us. Our Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you
              use our platform. Please read our Privacy Policy carefully. By
              using the platform, you consent to the data practices described in
              our Privacy Policy. We reserve the right to make changes to this
              Privacy Policy at any time and for any reason.
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">5. Intellectual Property</h3>
            <p className="text-muted-foreground">
              The platform and its original content, features, and functionality
              are and will remain the exclusive property of the company and its
              licensors. The platform is protected by copyright, trademark, and
              other laws of both domestic and foreign countries. Our trademarks
              and trade dress may not be used in connection with any product or
              service without the prior written consent of the company.
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">6. User Content</h3>
            <p className="text-muted-foreground">
              Our platform may allow you to post, link, store, share and
              otherwise make available certain information, text, graphics,
              videos, or other material. You are responsible for the content that
              you post to the platform, including its legality, reliability, and
              appropriateness. By posting content to the platform, you grant us
              the right to use, modify, publicly perform, publicly display,
              reproduce, and distribute such content on and through the platform.
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">7. Termination</h3>
            <p className="text-muted-foreground">
              We may terminate or suspend your account immediately, without prior
              notice or liability, for any reason whatsoever, including without
              limitation if you breach the Terms. Upon termination, your right to
              use the platform will immediately cease. If you wish to terminate
              your account, you may simply discontinue using the platform. All
              provisions of the Terms which by their nature should survive
              termination shall survive termination, including, without
              limitation, ownership provisions, warranty disclaimers, indemnity
              and limitations of liability.
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">8. Limitation of Liability</h3>
            <p className="text-muted-foreground">
              In no event shall the company, nor its directors, employees,
              partners, agents, suppliers, or affiliates, be liable for any
              indirect, incidental, special, consequential or punitive damages,
              including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses, resulting from your access
              to or use of or inability to access or use the platform; any
              conduct or content of any third party on the platform; any content
              obtained from the platform; and unauthorized access, use or
              alteration of your transmissions or content.
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">9. Governing Law</h3>
            <p className="text-muted-foreground">
              These Terms shall be governed and construed in accordance with the
              laws of the jurisdiction in which the company is established,
              without regard to its conflict of law provisions. Our failure to
              enforce any right or provision of these Terms will not be
              considered a waiver of those rights. If any provision of these
              Terms is held to be invalid or unenforceable by a court, the
              remaining provisions of these Terms will remain in effect.
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">10. Changes to Terms</h3>
            <p className="text-muted-foreground">
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material we will try to
              provide at least 30 days&apos; notice prior to any new terms
              taking effect. What constitutes a material change will be
              determined at our sole discretion. By continuing to access or use
              our platform after those revisions become effective, you agree to
              be bound by the revised terms.
            </p>
          </section>
        </div>

        <ModalFooter>
          <ModalClose render={<Button />}>I Accept</ModalClose>
          <ModalClose render={<Button variant="outline" />}>
            Decline
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Long content is handled out of the box — the modal grows with its content and the viewport scrolls. This is the default `scrollBehavior` (`\"outside\"`). Ideal for long-form content like terms of service or privacy policies.",
      },
    },
  },
};
