"use client";

import { Button } from "@keystoneui/react/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@keystoneui/react/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RefreshCw as RefreshCwIcon } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { expect, within } from "storybook/test";

const OTP_LENGTH = 6;

const meta = {
  title: "Components/InputOTP",
  component: InputOTP,
  parameters: {
    docs: {
      description: {
        component: `
A one-time password input for verification codes. Built on Base UI's [\`OTPField\`](https://base-ui.com/react/components/otp-field) preview primitive.

\`\`\`tsx
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";

// Basic 6-digit OTP input
<InputOTP length={6}>
  <InputOTPGroup>
    <InputOTPSlot aria-label="Character 1 of 6" />
    <InputOTPSlot aria-label="Character 2 of 6" />
    <InputOTPSlot aria-label="Character 3 of 6" />
    <InputOTPSlot aria-label="Character 4 of 6" />
    <InputOTPSlot aria-label="Character 5 of 6" />
    <InputOTPSlot aria-label="Character 6 of 6" />
  </InputOTPGroup>
</InputOTP>

// Grouped layout with separator
<InputOTP length={6}>
  <InputOTPGroup>
    <InputOTPSlot aria-label="Character 1 of 6" />
    <InputOTPSlot aria-label="Character 2 of 6" />
    <InputOTPSlot aria-label="Character 3 of 6" />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot aria-label="Character 4 of 6" />
    <InputOTPSlot aria-label="Character 5 of 6" />
    <InputOTPSlot aria-label="Character 6 of 6" />
  </InputOTPGroup>
</InputOTP>

// Alphanumeric verification
<InputOTP length={6} validationType="alphanumeric">…</InputOTP>

// Masked entry
<InputOTP length={6} mask>…</InputOTP>
\`\`\`

## Features

- Six built-in props for verification UX: \`length\`, \`validationType\`, \`mask\`, \`autoSubmit\`, \`onValueComplete\`, \`onValueInvalid\`.
- Each slot is a real \`<input>\` — native caret, native focus ring, native paste/autofill.
- Supports \`autoComplete="one-time-code"\` for iOS SMS autofill (applied automatically to the first slot).
- Loading state with spinner indicator (\`isLoading\`).
- Invalid/error styling via \`aria-invalid\` or Base UI's \`data-[invalid]\`.
- Disabled and read-only states.
        `,
      },
    },
  },
  argTypes: {
    length: {
      control: "number",
      description: "Number of OTP input slots",
    },
    validationType: {
      control: "select",
      options: ["numeric", "alpha", "alphanumeric", "none"],
      description: "Built-in validation",
    },
    mask: {
      control: "boolean",
      description: "Whether the slots mask entered characters",
    },
    autoSubmit: {
      control: "boolean",
      description: "Submit the owning form once all slots are filled",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    isLoading: {
      control: "boolean",
      description: "Whether the input is in a loading state",
    },
  },
  subcomponents: { InputOTPGroup, InputOTPSlot, InputOTPSeparator },
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof InputOTP>;

function renderSlots(length: number, offset = 0) {
  return Array.from({ length }, (_, index) => (
    <InputOTPSlot
      aria-label={`Character ${offset + index + 1} of ${OTP_LENGTH}`}
      key={index}
    />
  ));
}

export const Default: Story = {
  render: () => (
    <InputOTP length={OTP_LENGTH}>
      <InputOTPGroup>{renderSlots(OTP_LENGTH)}</InputOTPGroup>
    </InputOTP>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstSlot = canvas.getAllByRole("textbox")[0];
    await expect(firstSlot).toBeInTheDocument();
  },
};

export const WithLabel: Story = {
  render: () => {
    function WithLabelExample() {
      const id = useId();
      const descriptionId = `${id}-description`;

      return (
        <div className="flex w-full max-w-80 flex-col items-start gap-1.5">
          <label className="font-medium text-foreground text-sm" htmlFor={id}>
            Verification code
          </label>
          <InputOTP
            aria-describedby={descriptionId}
            id={id}
            length={OTP_LENGTH}
          >
            <InputOTPGroup>{renderSlots(OTP_LENGTH)}</InputOTPGroup>
          </InputOTP>
          <p className="text-muted-foreground text-sm" id={descriptionId}>
            Enter the 6-character code we sent to your device.
          </p>
        </div>
      );
    }

    return <WithLabelExample />;
  },
};

export const WithSeparator: Story = {
  render: () => (
    <InputOTP length={OTP_LENGTH}>
      <InputOTPGroup>{renderSlots(2)}</InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>{renderSlots(2, 2)}</InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>{renderSlots(2, 4)}</InputOTPGroup>
    </InputOTP>
  ),
};

export const FourDigits: Story = {
  render: () => (
    <InputOTP length={4}>
      <InputOTPGroup>
        {Array.from({ length: 4 }, (_, index) => (
          <InputOTPSlot
            aria-label={`Character ${index + 1} of 4`}
            key={index}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const Alphanumeric: Story = {
  render: () => (
    <InputOTP length={OTP_LENGTH} validationType="alphanumeric">
      <InputOTPGroup>{renderSlots(3)}</InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>{renderSlots(3, 3)}</InputOTPGroup>
    </InputOTP>
  ),
};

export const Masked: Story = {
  render: () => (
    <InputOTP length={OTP_LENGTH} mask>
      <InputOTPGroup>{renderSlots(OTP_LENGTH)}</InputOTPGroup>
    </InputOTP>
  ),
};

export const PlaceholderHints: Story = {
  render: () => (
    <InputOTP length={OTP_LENGTH}>
      <InputOTPGroup>
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <InputOTPSlot
            aria-label={`Character ${index + 1} of ${OTP_LENGTH}`}
            className="placeholder:text-muted-foreground/60 focus:placeholder:text-transparent"
            key={index}
            placeholder="•"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
};

function CustomSanitizationExample() {
  const id = useId();
  const descriptionId = `${id}-description`;
  const [statusMessage, setStatusMessage] = useState("");

  return (
    <div className="flex w-full max-w-80 flex-col items-start gap-1.5">
      <label className="font-medium text-foreground text-sm" htmlFor={id}>
        Tier code
      </label>
      <InputOTP
        aria-describedby={descriptionId}
        id={id}
        inputMode="numeric"
        length={OTP_LENGTH}
        onValueChange={() => setStatusMessage("")}
        onValueInvalid={(value) =>
          setStatusMessage(`Unsupported characters were ignored from ${value}.`)
        }
        sanitizeValue={(value) => value.replace(/[^0-3]/g, "")}
        validationType="none"
      >
        <InputOTPGroup>{renderSlots(OTP_LENGTH)}</InputOTPGroup>
      </InputOTP>
      <p className="text-muted-foreground text-sm" id={descriptionId}>
        Digits <code className="font-mono">0–3</code> only.
      </p>
      <span aria-live="polite" className="sr-only">
        {statusMessage}
      </span>
    </div>
  );
}

export const CustomSanitization: Story = {
  render: () => <CustomSanitizationExample />,
};

function AutoSubmitExample() {
  const id = useId();
  const [submittedValue, setSubmittedValue] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmittedValue(String(formData.get("verificationCode") ?? ""));
  }

  return (
    <form
      className="flex w-full max-w-80 flex-col items-start gap-1.5"
      onSubmit={handleSubmit}
    >
      <label className="font-medium text-foreground text-sm" htmlFor={id}>
        Verification code
      </label>
      <InputOTP autoSubmit id={id} length={OTP_LENGTH} name="verificationCode">
        <InputOTPGroup>{renderSlots(OTP_LENGTH)}</InputOTPGroup>
      </InputOTP>
      <div className="flex items-center gap-2">
        <Button size="sm" type="submit" variant="outline">
          Verify
        </Button>
        {submittedValue !== null && (
          <span className="text-muted-foreground text-sm">
            Submitted: <code className="font-mono">{submittedValue}</code>
          </span>
        )}
      </div>
    </form>
  );
}

export const AutoSubmit: Story = {
  render: () => <AutoSubmitExample />,
};

function ControlledExample() {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col items-center gap-2">
      <InputOTP
        length={OTP_LENGTH}
        onValueChange={(next) => setValue(next)}
        value={value}
      >
        <InputOTPGroup>{renderSlots(OTP_LENGTH)}</InputOTPGroup>
      </InputOTP>
      <div className="text-muted-foreground text-sm">
        {value === "" ? (
          <>Enter your one-time password.</>
        ) : (
          <>You entered: {value}</>
        )}
      </div>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

export const Disabled: Story = {
  render: () => (
    <InputOTP disabled length={OTP_LENGTH} value="123456">
      <InputOTPGroup>{renderSlots(3)}</InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>{renderSlots(3, 3)}</InputOTPGroup>
    </InputOTP>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="otp-invalid">Enter PIN</FieldLabel>
      <InputOTP
        aria-invalid
        id="otp-invalid"
        length={OTP_LENGTH}
        value="123456"
      >
        <InputOTPGroup>
          {Array.from({ length: OTP_LENGTH }, (_, index) => (
            <InputOTPSlot
              aria-invalid
              aria-label={`Character ${index + 1} of ${OTP_LENGTH}`}
              key={index}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FieldError>Incorrect PIN</FieldError>
    </Field>
  ),
};

export const Loading: Story = {
  render: () => (
    <InputOTP isLoading length={OTP_LENGTH} value="123456">
      <InputOTPGroup>{renderSlots(3)}</InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>{renderSlots(3, 3)}</InputOTPGroup>
    </InputOTP>
  ),
};

export const Form: Story = {
  render: () => (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Verify your login</CardTitle>
        <CardDescription>
          Enter the verification code we sent to your email address:{" "}
          <span className="font-medium">m@example.com</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="otp-verification">
              Verification code
            </FieldLabel>
            <Button size="xs" variant="outline">
              <RefreshCwIcon className="size-3" />
              Resend Code
            </Button>
          </div>
          <InputOTP id="otp-verification" length={OTP_LENGTH}>
            <InputOTPGroup>{renderSlots(3)}</InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>{renderSlots(3, 3)}</InputOTPGroup>
          </InputOTP>
          <FieldDescription>
            <a
              className="underline underline-offset-4 transition-colors hover:text-primary"
              href="#"
            >
              I no longer have access to this email address.
            </a>
          </FieldDescription>
        </Field>
      </CardContent>
      <CardFooter>
        <Field className="w-full">
          <Button className="w-full" type="submit">
            Verify
          </Button>
          <div className="text-center text-muted-foreground text-sm">
            Having trouble signing in?{" "}
            <a
              className="underline underline-offset-4 transition-colors hover:text-primary"
              href="#"
            >
              Contact support
            </a>
          </div>
        </Field>
      </CardFooter>
    </Card>
  ),
};
