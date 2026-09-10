"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart";
import { formatValue, type ValueFormat } from "./chart-formatters";
import type { RevenuePoint } from "./mock-analytics";
import { type SeriesDef, SeriesLegend, seriesColor } from "./series-legend";

interface RevenueTrendCardProps {
  data: readonly RevenuePoint[];
  format?: ValueFormat;
  hidden: ReadonlySet<string>;
  onToggle: (key: string) => void;
  reducedMotion: boolean;
  series: readonly SeriesDef[];
}

export function RevenueTrendCard({
  data,
  format = "money",
  hidden,
  onToggle,
  reducedMotion,
  series,
}: RevenueTrendCardProps) {
  const shown = series.filter((item) => !hidden.has(item.key));

  const config = Object.fromEntries(
    series.map((item, index) => [
      item.key,
      { color: seriesColor(item, index), label: item.label },
    ])
  );

  return (
    <Card className="lg:col-span-2" variant="outline">
      <CardHeader>
        {/* Semibold rather than CardTitle's default medium. A dashboard panel
            heading competes with a lot of dense content, so it needs more
            weight than a login card's title does -- but the component stays at
            font-medium, in line with every other *Title part in the library. */}
        <CardTitle className="font-semibold">Revenue by channel</CardTitle>
        <CardDescription>
          Stacked weekly revenue. Switch a channel off in the legend to read the
          rest.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ChartContainer className="h-[260px] w-full" config={config}>
          <BarChart accessibilityLayer data={[...data]}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="week"
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              tickFormatter={(value) => formatValue(value, "compact")}
              tickLine={false}
              width="auto"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex flex-1 items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        {config[name as string]?.label ?? name}
                      </span>
                      <span className="font-medium font-mono tabular-nums">
                        {formatValue(value, format)}
                      </span>
                    </div>
                  )}
                />
              }
              cursor={false}
            />
            {shown.map((item, index) => (
              <Bar
                dataKey={item.key}
                fill={`var(--color-${item.key})`}
                // recharts animates SVG attributes from JS, which the
                // stylesheet's prefers-reduced-motion rule cannot reach.
                isAnimationActive={!reducedMotion}
                key={item.key}
                // Rounded cap on the top band only, measured against the
                // VISIBLE bands: against all of them, hiding the top series
                // would leave the stack uncapped.
                radius={
                  index === shown.length - 1
                    ? ([4, 4, 0, 0] as [number, number, number, number])
                    : 0
                }
                stackId="revenue"
                // Separates adjacent bands. Matches the panel's real
                // background, not --card: `variant="outline"` has no fill, so
                // the page shows through and a --card seam would be visible.
                stroke="var(--background)"
                strokeWidth={2}
              />
            ))}
          </BarChart>
        </ChartContainer>
        <SeriesLegend hidden={hidden} onToggle={onToggle} series={series} />
      </CardContent>
    </Card>
  );
}
