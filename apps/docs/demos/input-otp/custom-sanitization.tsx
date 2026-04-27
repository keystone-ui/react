"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";
import { useId, useState } from "react";

const OTP_LENGTH = 6;

function sanitizeTierCode(value: string) {
  return value.replace(/[^0-3]/g, "");
}

export default function InputOTPCustomSanitization() {
  const id = useId();
  const descriptionId = `${id}-description`;
  const liveId = `${id}-live`;
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
        sanitizeValue={sanitizeTierCode}
        validationType="none"
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
        Digits <code className="font-mono">0–3</code> only.
      </p>
      <span aria-live="polite" className="sr-only" id={liveId}>
        {statusMessage}
      </span>
    </div>
  );
}
