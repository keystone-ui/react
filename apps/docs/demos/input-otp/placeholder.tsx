"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";

const OTP_LENGTH = 6;

export default function InputOTPPlaceholder() {
  return (
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
  );
}
