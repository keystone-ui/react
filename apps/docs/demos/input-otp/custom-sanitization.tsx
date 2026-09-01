"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";
import { useId, useState } from "react";

const OTP_LENGTH = 6;
const OTP_SLOTS = Array.from({ length: OTP_LENGTH }, (_, i) => ({
  key: `slot-${i + 1}`,
  ariaLabel: `Character ${i + 1} of ${OTP_LENGTH}`,
}));

function normalizeTierCode(value: string) {
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
        normalizeValue={normalizeTierCode}
        onValueChange={() => setStatusMessage("")}
        onValueInvalid={(value) =>
          setStatusMessage(`Unsupported characters were ignored from ${value}.`)
        }
        validationType="none"
      >
        <InputOTPGroup>
          {OTP_SLOTS.map((slot) => (
            <InputOTPSlot aria-label={slot.ariaLabel} key={slot.key} />
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
