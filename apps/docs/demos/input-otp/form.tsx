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
import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";
import { RefreshCwIcon } from "lucide-react";

export default function InputOTPForm() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Verify your login</CardTitle>
        <CardDescription>
          Enter the verification code we sent to{" "}
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
              href="/support/email-recovery"
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
            Having trouble?{" "}
            <a
              className="underline underline-offset-4 transition-colors hover:text-primary"
              href="/support"
            >
              Contact support
            </a>
          </div>
        </Field>
      </CardFooter>
    </Card>
  );
}
