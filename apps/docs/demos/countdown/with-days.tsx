"use client";

import { Countdown } from "@keystoneui/react/countdown";
import { useEffect, useState } from "react";

const UNITS = ["days", "hours", "minutes", "seconds"] as const;

export default function CountdownWithDays() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  useEffect(() => {
    setEndsAt(Date.now() + ((2 * 24 + 4) * 3600 + 12 * 60 + 33) * 1000);
  }, []);
  return (
    <div className="flex flex-col items-center gap-6">
      <Countdown target={endsAt} units={UNITS} />
      <Countdown target={endsAt} units={UNITS} variant="labelled" />
    </div>
  );
}
