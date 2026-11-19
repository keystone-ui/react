"use client";

import { Countdown } from "@keystoneui/react/countdown";
import { useEffect, useState } from "react";

export default function CountdownSizes() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  useEffect(() => {
    setEndsAt(Date.now() + (1 * 3600 + 36 * 60 + 53) * 1000);
  }, []);
  return (
    <div className="flex flex-col items-center gap-6">
      <Countdown size="sm" target={endsAt} variant="labelled" />
      <Countdown target={endsAt} variant="labelled" />
      <Countdown size="lg" target={endsAt} variant="labelled" />
    </div>
  );
}
