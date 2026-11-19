"use client";

import { Countdown } from "@keystoneui/react/countdown";
import { useEffect, useState } from "react";

export default function CountdownLabelled() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  useEffect(() => {
    setEndsAt(Date.now() + (1 * 3600 + 36 * 60 + 53) * 1000);
  }, []);
  return (
    <Countdown
      animated
      className="font-light [&_[data-slot=countdown-label]]:font-medium [&_[data-slot=countdown-separator]]:text-muted-foreground"
      size="lg"
      target={endsAt}
      variant="labelled"
    />
  );
}
