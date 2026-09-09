"use client";

import { Card, CardContent } from "@keystoneui/react/card";
import { StatDelta, StatValue } from "@keystoneui/react/stat";

const metrics = [
  {
    delta: 0.12,
    deltaLabel: "+12%",
    // More merged PRs is better.
    direction: "up-is-good",
    label: "Merged PRs",
    sublabel: "94 opened",
    value: "128",
  },
  {
    delta: -0.08,
    deltaLabel: "-8%",
    // Faster pickup is better, so a fall is an improvement — this tile is the
    // reason the component takes a direction instead of reading the sign.
    direction: "down-is-good",
    label: "Pickup p50",
    sublabel: "time to first review",
    value: "3h 12m",
  },
  {
    delta: 0.04,
    deltaLabel: "+4%",
    direction: "down-is-good",
    label: "Review wait p50",
    sublabel: "ready to approved",
    value: "1d 4h",
  },
  {
    delta: null,
    deltaLabel: null,
    direction: "neutral",
    label: "Active authors",
    sublabel: "no prior period",
    value: "24",
  },
] as const;

export default function StatKpiRow() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
      {metrics.map((metric) => (
        <Card key={metric.label} size="sm" variant="outline">
          <CardContent className="flex flex-col gap-1">
            <div className="font-medium text-muted-foreground text-xs">
              {metric.label}
            </div>
            <StatValue>
              {metric.value}
              {metric.delta === null ? null : (
                <StatDelta direction={metric.direction} value={metric.delta}>
                  {metric.deltaLabel}
                </StatDelta>
              )}
            </StatValue>
            <div className="text-muted-foreground text-xs">
              {metric.sublabel}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
