"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";
import { useId } from "react";

const OTP_LENGTH = 6;

export default function InputOTPWithLabel() {
  const id = useId();
  const descriptionId = `${id}-description`;

  return (
    <div className="flex w-full max-w-80 flex-col items-start gap-1.5">
      <label className="font-medium text-foreground text-sm" htmlFor={id}>
        Verification code
      </label>
      <InputOTP aria-describedby={descriptionId} id={id} length={OTP_LENGTH}>
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
        Enter the 6-character code we sent to your device.
      </p>
    </div>
  );
}
