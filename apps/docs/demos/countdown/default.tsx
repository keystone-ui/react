"use client";

import { Countdown } from "@keystoneui/react/countdown";
import { useEffect, useState } from "react";

export default function CountdownDefault() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  useEffect(() => {
    // Set after mount: the server and the hydrating client show the placeholder.
    setEndsAt(Date.now() + (1 * 3600 + 36 * 60 + 53) * 1000);
  }, []);
  return (
    <p className="text-muted-foreground text-sm">
      Offer ends in{" "}
      <Countdown
        className="font-medium text-foreground"
        size="sm"
        target={endsAt}
      />
    </p>
  );
}
