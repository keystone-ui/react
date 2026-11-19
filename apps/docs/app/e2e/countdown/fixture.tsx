"use client";

import { Countdown } from "@keystoneui/react/countdown";
import { useEffect } from "react";

const NOW = Date.UTC(2026, 10, 19, 12, 0, 0);
const TARGET = NOW + ((1 * 60 + 36) * 60 + 53) * 1000;
/** A fixed clock: every client run shows 01:36:53. Each form sits in a paragraph. */
const now = () => NOW;

export function CountdownFixture() {
  useEffect(() => {
    document.documentElement.dataset.fixtureHydrated = "countdown";
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-start gap-6 bg-background p-4 text-foreground">
      <p data-testid="compact">
        Ends in <Countdown now={now} target={TARGET} /> today
      </p>
      <p data-testid="labelled">
        Doors open in{" "}
        <Countdown
          animated
          now={now}
          size="lg"
          target={TARGET}
          variant="labelled"
        />
      </p>
      <p className="text-5xl" data-testid="large">
        <Countdown now={now} size="lg" target={TARGET} />
      </p>
      {/* The 2ch floor removed: only the reservation holds the width.
          geometricPrecision, as the docs advise without the floor: where
          glyphs are rounded to whole pixels (hinted text on Linux) tabular
          digits differ by a pixel or two, and the row would move for that
          reason instead of a missing reservation. */}
      <p className="text-5xl" data-testid="nofloor">
        <Countdown
          className="[text-rendering:geometricPrecision] [&_[data-slot=countdown-value]]:min-w-0"
          now={now}
          size="lg"
          target={TARGET}
        />
        <span data-marker="">|</span>
      </p>
      <p data-testid="animated">
        <Countdown animated now={now} size="sm" target={TARGET} />
      </p>
    </main>
  );
}
