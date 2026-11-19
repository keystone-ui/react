"use client";

import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import { Countdown } from "@keystoneui/react/countdown";
import { useState } from "react";

export default function CountdownOnComplete() {
  const [target, setTarget] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <Countdown
        onComplete={() => setDone(true)}
        target={target}
        units={["minutes", "seconds"]}
      />
      {done ? (
        <Badge>Doors open</Badge>
      ) : (
        <Button
          onClick={() => {
            // "Five seconds from this click" is computed in the handler.
            setTarget(Date.now() + 5000);
          }}
          size="sm"
          variant="outline"
        >
          Start
        </Button>
      )}
    </div>
  );
}
