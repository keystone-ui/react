"use client";

import { useCountdown } from "@keystoneui/react/countdown";
import { Progress } from "@keystoneui/react/progress";
import { useEffect, useState } from "react";

const HOLD_SECONDS = 5 * 60;

export default function CountdownHook() {
  const [heldUntil, setHeldUntil] = useState<number | null>(null);
  useEffect(() => {
    setHeldUntil(Date.now() + HOLD_SECONDS * 1000);
  }, []);
  const { isComplete, isPending, minutes, seconds, totalSeconds } =
    useCountdown({ target: heldUntil, units: ["minutes", "seconds"] });
  let message = "Holding your seats…";
  if (isComplete) {
    message = "Your hold has expired.";
  } else if (!isPending) {
    message = `Seats held for ${minutes} min ${seconds} s`;
  }
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <p className="text-sm">{message}</p>
      <Progress value={((totalSeconds ?? HOLD_SECONDS) / HOLD_SECONDS) * 100} />
    </div>
  );
}
