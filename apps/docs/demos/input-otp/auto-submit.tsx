"use client";

import { Button } from "@keystoneui/react/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";
import { type FormEvent, useId, useState } from "react";

const OTP_LENGTH = 6;

export default function InputOTPAutoSubmit() {
  const id = useId();
  const descriptionId = `${id}-description`;
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
      <InputOTP
        aria-describedby={descriptionId}
        autoSubmit
        id={id}
        length={OTP_LENGTH}
        name="verificationCode"
      >
        <InputOTPGroup>
          {Array.from({ length: OTP_LENGTH }, (_, index) => (
            <InputOTPSlot
              aria-label={`Character ${index + 1} of ${OTP_LENGTH}`}
              key={index}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <p className="text-muted-foreground text-sm" id={descriptionId}>
        The form submits automatically once all slots are filled.
      </p>
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
