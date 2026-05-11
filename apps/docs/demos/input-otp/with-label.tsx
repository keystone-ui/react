"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";
import { useId } from "react";

const OTP_LENGTH = 6;
const OTP_SLOTS = Array.from({ length: OTP_LENGTH }, (_, i) => ({
  key: `slot-${i + 1}`,
  ariaLabel: `Character ${i + 1} of ${OTP_LENGTH}`,
}));

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
          {OTP_SLOTS.map((slot) => (
            <InputOTPSlot aria-label={slot.ariaLabel} key={slot.key} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <p className="text-muted-foreground text-sm" id={descriptionId}>
        Enter the 6-character code we sent to your device.
      </p>
    </div>
  );
}
