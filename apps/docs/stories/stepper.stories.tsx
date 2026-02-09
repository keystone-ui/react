import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
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
  title: "Components/Stepper",
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component: `
# Stepper

An animated multi-step content switcher. Steps transition with direction-aware slide and fade animations, and the container height animates smoothly as content changes.

\`\`\`tsx
import {
  Stepper,
  StepperContent,
  StepperStep,
  useStepper,
} from "@keystone/ui/stepper";

function MyWizard() {
  const [step, setStep] = useState(0);
  return (
    <Stepper value={step} onValueChange={setStep}>
      <StepperContent>
        <StepperStep>Step 1 content</StepperStep>
        <StepperStep>Step 2 content</StepperStep>
        <StepperStep>Step 3 content</StepperStep>
      </StepperContent>
      <StepperNav />
    </Stepper>
  );
}

function StepperNav() {
  const { goNext, goPrevious, isFirst, isLast } = useStepper();
  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={goPrevious} disabled={isFirst}>Back</Button>
      <Button onClick={goNext} disabled={isLast}>Continue</Button>
    </div>
  );
}
\`\`\`

## Features

- Direction-aware slide and fade transitions
- Smooth animated height as content changes
- Respects \`prefers-reduced-motion\` via \`useReducedMotion()\`
- Composable: works standalone, inside a Modal, Drawer, or any container
- \`useStepper()\` hook for full navigation control

## API

### Stepper

| Prop | Type | Description |
|------|------|-------------|
| \`value\` | \`number\` | Current step index (0-based) |
| \`onValueChange\` | \`(value: number) => void\` | Callback when step changes |
| \`children\` | \`ReactNode\` | Must contain \`StepperContent\` with \`StepperStep\` children |

### useStepper()

Returns: \`{ value, totalSteps, direction, goTo, goNext, goPrevious, isFirst, isLast }\`
`,
      },
    },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof Stepper>;

// =============================================================================
// Skeleton placeholder (used across stories)
// =============================================================================
function Skeleton({ width }: { width?: number }) {
  return (
    <div
      className="bg-muted h-4 animate-pulse rounded-md"
      style={{ width: width ?? "100%" }}
    />
  );
}

// =============================================================================
// Shared navigation footer
// =============================================================================
function StepperNav() {
  const { goNext, goPrevious, isFirst, isLast } = useStepper();
  return (
    <div className="mt-6 flex justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={goPrevious}
        disabled={isFirst}
        className="rounded-full px-5"
      >
        Back
      </Button>
      <Button
        size="sm"
        onClick={goNext}
        disabled={isLast}
        className="rounded-full px-5"
      >
        Continue
      </Button>
    </div>
  );
}

// =============================================================================
// Default
// =============================================================================
function DefaultDemo() {
  const [step, setStep] = useState(0);
  return (
    <div className="mx-auto w-full max-w-[550px] rounded-xl border p-6 shadow-sm">
      <Stepper value={step} onValueChange={setStep}>
        <StepperContent>
          <StepperStep>
            <h2 className="mb-2 text-base font-semibold">This is step one</h2>
            <p className="text-muted-foreground text-sm">
              Usually in this step we would explain why this thing exists and
              what it does. Also, we would show a button to go to the next step.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Skeleton width={256} />
              <Skeleton width={192} />
              <Skeleton />
              <Skeleton width={384} />
            </div>
          </StepperStep>
          <StepperStep>
            <h2 className="mb-2 text-base font-semibold">This is step two</h2>
            <p className="text-muted-foreground text-sm">
              Usually in this step we would explain why this thing exists and
              what it does. Also, we would show a button to go to the next step.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Skeleton width={256} />
              <Skeleton width={192} />
              <Skeleton width={384} />
            </div>
          </StepperStep>
          <StepperStep>
            <h2 className="mb-2 text-base font-semibold">
              This is step three
            </h2>
            <p className="text-muted-foreground text-sm">
              Usually in this step we would explain why this thing exists and
              what it does. Also, we would show a button to go to the next step.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Skeleton width={256} />
              <Skeleton width={192} />
              <Skeleton width={128} />
              <Skeleton width={224} />
              <Skeleton width={384} />
            </div>
          </StepperStep>
        </StepperContent>
        <StepperNav />
      </Stepper>
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "A 3-step walkthrough with skeleton placeholders. Each step has different content height to demonstrate the smooth height animation. Navigate with Back/Continue buttons.",
      },
    },
  },
};

// =============================================================================
// With Step Indicator
// =============================================================================
function StepIndicator() {
  const { value, totalSteps } = useStepper();
  return (
    <div className="mb-4 flex items-center justify-center gap-1.5">
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

function StepIndicatorNav() {
  const { goNext, goPrevious, isFirst, isLast } = useStepper();
  return (
    <div className="mt-6 flex justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={goPrevious}
        disabled={isFirst}
        className="rounded-full px-5"
      >
        Back
      </Button>
      <Button
        size="sm"
        onClick={goNext}
        disabled={isLast}
        className="rounded-full px-5"
      >
        {isLast ? "Finish" : "Continue"}
      </Button>
    </div>
  );
}

function WithStepIndicatorDemo() {
  const [step, setStep] = useState(0);
  return (
    <div className="mx-auto w-full max-w-[550px] rounded-xl border p-6 shadow-sm">
      <Stepper value={step} onValueChange={setStep}>
        <StepIndicator />
        <StepperContent>
          <StepperStep>
            <h2 className="mb-2 text-base font-semibold">
              Welcome to Keystone
            </h2>
            <p className="text-muted-foreground text-sm">
              Keystone is a beautifully crafted component library that helps you
              build modern web applications faster.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Skeleton width={300} />
              <Skeleton width={240} />
              <Skeleton />
            </div>
          </StepperStep>
          <StepperStep>
            <h2 className="mb-2 text-base font-semibold">
              Set up your workspace
            </h2>
            <p className="text-muted-foreground text-sm">
              Configure your development environment. Choose your preferred
              package manager and framework.
            </p>
            <div className="mt-4 grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="workspace-name">Workspace name</Label>
                <Input id="workspace-name" placeholder="my-project" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workspace-desc">Description</Label>
                <Input
                  id="workspace-desc"
                  placeholder="A brief description..."
                />
              </div>
            </div>
          </StepperStep>
          <StepperStep>
            <h2 className="mb-2 text-base font-semibold">
              You&apos;re all set!
            </h2>
            <p className="text-muted-foreground text-sm">
              Your workspace is ready. Start building your application with
              Keystone components.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Checkbox id="email-updates" />
                <Label htmlFor="email-updates" className="text-sm font-normal">
                  Send me product updates
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="tips" defaultChecked />
                <Label htmlFor="tips" className="text-sm font-normal">
                  Send me tips and tutorials
                </Label>
              </div>
            </div>
          </StepperStep>
        </StepperContent>
        <StepIndicatorNav />
      </Stepper>
    </div>
  );
}

export const WithStepIndicator: Story = {
  name: "With Step Indicator",
  render: () => <WithStepIndicatorDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "A step indicator (pill dots) built with `useStepper()` showing progress through the wizard. The active dot expands while completed dots use a muted fill. Each step has different content (text, form fields, checkboxes) to showcase the height animation.",
      },
    },
  },
};

// =============================================================================
// Controlled
// =============================================================================
function ControlledDemo() {
  const [step, setStep] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <Button
            key={i}
            variant={step === i ? "default" : "outline"}
            size="sm"
            onClick={() => setStep(i)}
          >
            Step {i + 1}
          </Button>
        ))}
      </div>
      <div className="mx-auto w-full max-w-[550px] rounded-xl border p-6 shadow-sm">
        <Stepper value={step} onValueChange={setStep}>
          <StepperContent>
            <StepperStep>
              <h2 className="mb-2 text-base font-semibold">Account</h2>
              <p className="text-muted-foreground text-sm">
                Configure your account settings and preferences.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Skeleton width={200} />
                <Skeleton width={300} />
              </div>
            </StepperStep>
            <StepperStep>
              <h2 className="mb-2 text-base font-semibold">Notifications</h2>
              <p className="text-muted-foreground text-sm">
                Choose how and when you want to be notified.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Skeleton width={280} />
                <Skeleton width={200} />
                <Skeleton width={320} />
                <Skeleton width={180} />
              </div>
            </StepperStep>
            <StepperStep>
              <h2 className="mb-2 text-base font-semibold">Privacy</h2>
              <p className="text-muted-foreground text-sm">
                Manage your privacy and data sharing preferences.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Skeleton width={240} />
                <Skeleton width={300} />
                <Skeleton width={160} />
              </div>
            </StepperStep>
          </StepperContent>
        </Stepper>
      </div>
      <p className="text-muted-foreground text-sm">
        Current step: <code>{step}</code> &middot; Click any button above to
        jump directly. Notice the slide direction changes based on whether
        you&apos;re going forward or backward.
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
          "Navigate to any step directly using external controls. The Stepper automatically determines slide direction based on whether the target step is ahead or behind the current one.",
      },
    },
  },
};
