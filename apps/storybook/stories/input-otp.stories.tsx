"use client";

import { Button } from "@keystone/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@keystone/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@keystone/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "@keystone/ui/input-otp";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/InputOTP",
  component: InputOTP,
  parameters: {
    docs: {
      description: {
        component: `
A one-time password input component for verification codes. Built on top of the [input-otp](https://input-otp.rodz.dev/) library.

\`\`\`tsx
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "@keystone/ui/input-otp";

// Basic 6-digit OTP input
<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>

// With separator
<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>

// Digits only pattern
<InputOTP maxLength={4} pattern={REGEXP_ONLY_DIGITS}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
  </InputOTPGroup>
</InputOTP>

// Alphanumeric pattern
<InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
\`\`\`

## Features

- Accessible OTP input with proper keyboard navigation
- Support for digits-only or alphanumeric patterns
- Customizable slot grouping with separators
- Loading state with spinner indicator
- Invalid/error state styling
- Disabled state support
- Animated caret for active slot

## API Reference

See the [input-otp documentation](https://input-otp.rodz.dev/) for more information.
`,
      },
    },
  },
  argTypes: {
    maxLength: {
      control: "number",
      description: "Maximum number of characters allowed",
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

export const Default: Story = {
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstSlot = canvas.getAllByRole("textbox")[0];
    await expect(firstSlot).toBeInTheDocument();
  },
};

export const WithSeparator: Story = {
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const FourDigits: Story = {
  render: () => (
    <InputOTP maxLength={4} pattern={REGEXP_ONLY_DIGITS}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const Alphanumeric: Story = {
  render: () => (
    <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

function ControlledExample() {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col items-center gap-2">
      <InputOTP
        maxLength={6}
        onChange={(value) => setValue(value)}
        value={value}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
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
    <InputOTP disabled maxLength={6} value="123456">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Field>
      <FieldLabel>Enter PIN</FieldLabel>
      <InputOTP maxLength={6} value="123456">
        <InputOTPGroup>
          <InputOTPSlot aria-invalid index={0} />
          <InputOTPSlot aria-invalid index={1} />
          <InputOTPSlot aria-invalid index={2} />
          <InputOTPSlot aria-invalid index={3} />
          <InputOTPSlot aria-invalid index={4} />
          <InputOTPSlot aria-invalid index={5} />
        </InputOTPGroup>
      </InputOTP>
      <FieldError>Incorrect PIN</FieldError>
    </Field>
  ),
};

export const Loading: Story = {
  render: () => (
    <InputOTP isLoading maxLength={6} value="123456">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
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
          <InputOTP id="otp-verification" maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
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
