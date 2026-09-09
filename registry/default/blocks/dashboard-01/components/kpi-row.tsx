"use client";

import type { Metric } from "@/components/mock-analytics";
import { Card, CardContent } from "@/components/ui/card";
import { StatDelta, StatValue } from "@/components/ui/stat";

export function KpiRow({ metrics }: { metrics: readonly Metric[] }) {
  return (
    // [&>*]:min-w-0 is load-bearing: grid children resolve to min-content, so
    // one long value would push its track open and give the page a horizontal
    // scrollbar.
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
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
    </section>
  );
}
