"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";

const OTP_LENGTH = 6;

export default function InputOTPMasked() {
  return (
    <InputOTP length={OTP_LENGTH} mask>
      <InputOTPGroup>
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <InputOTPSlot
            aria-label={`Character ${index + 1} of ${OTP_LENGTH}`}
            key={index}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
