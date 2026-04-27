"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";

const OTP_LENGTH = 6;

export default function InputOTPLoading() {
  return (
    <InputOTP isLoading length={OTP_LENGTH} value="123456">
      <InputOTPGroup>
        <InputOTPSlot aria-label={`Character 1 of ${OTP_LENGTH}`} />
        <InputOTPSlot aria-label={`Character 2 of ${OTP_LENGTH}`} />
        <InputOTPSlot aria-label={`Character 3 of ${OTP_LENGTH}`} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot aria-label={`Character 4 of ${OTP_LENGTH}`} />
        <InputOTPSlot aria-label={`Character 5 of ${OTP_LENGTH}`} />
        <InputOTPSlot aria-label={`Character 6 of ${OTP_LENGTH}`} />
      </InputOTPGroup>
    </InputOTP>
  );
}
