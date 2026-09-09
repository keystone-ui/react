"use client";

import { StatDelta, StatValue } from "@keystoneui/react/stat";

const rows = [
  {
    delta: 0.12,
    deltaLabel: "+12%",
    direction: "up-is-good",
    label: "Revenue",
    note: "rose, and rising is good — positive",
    value: "$48.2k",
  },
  {
    delta: -0.06,
    deltaLabel: "-6%",
    direction: "up-is-good",
    label: "Signups",
    note: "fell, and rising is good — negative",
    value: "1,204",
  },
  {
    delta: -0.18,
    deltaLabel: "-18%",
    direction: "down-is-good",
    label: "p95 latency",
    note: "fell, and falling is good — positive, with a down arrow",
    value: "212ms",
  },
  {
    delta: 0.09,
    deltaLabel: "+9%",
    direction: "down-is-good",
    label: "Error rate",
    note: "rose, and falling is good — negative, with an up arrow",
    value: "0.4%",
  },
  {
    delta: 0.03,
    deltaLabel: "+3%",
    direction: "neutral",
    label: "Headcount",
    note: "moved, but neither direction is better — neutral",
    value: "86",
  },
] as const;

export default function StatDirection() {
  return (
    <div className="flex w-full max-w-xl flex-col divide-y">
      {rows.map((row) => (
        <div className="flex items-baseline gap-4 py-3" key={row.label}>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-muted-foreground text-xs">
              {row.label}
            </div>
            <StatValue className="text-xl">
              {row.value}
              <StatDelta direction={row.direction} value={row.delta}>
                {row.deltaLabel}
              </StatDelta>
            </StatValue>
          </div>
          <p className="shrink-0 text-muted-foreground text-xs">{row.note}</p>
        </div>
      ))}
    </div>
  );
}
