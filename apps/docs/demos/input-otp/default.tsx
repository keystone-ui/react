"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";

const OTP_LENGTH = 6;
const OTP_SLOTS = Array.from({ length: OTP_LENGTH }, (_, i) => ({
  key: `slot-${i + 1}`,
  ariaLabel: `Character ${i + 1} of ${OTP_LENGTH}`,
}));

export default function InputOTPDefault() {
  return (
    <InputOTP length={OTP_LENGTH}>
      <InputOTPGroup>
        {OTP_SLOTS.map((slot) => (
          <InputOTPSlot aria-label={slot.ariaLabel} key={slot.key} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
