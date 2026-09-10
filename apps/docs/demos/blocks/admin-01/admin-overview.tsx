"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import { StatDelta, StatValue } from "@keystoneui/react/stat";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart";
import { formatValue } from "./chart-formatters";
import {
  type AdminMetric,
  SIGNUP_SERIES,
  type SignupPoint,
} from "./mock-admin";
import { SeriesLegend, seriesColor } from "./series-legend";

interface AdminOverviewProps {
  hidden: ReadonlySet<string>;
  metrics: readonly AdminMetric[];
  onToggle: (key: string) => void;
  reducedMotion: boolean;
  signups: readonly SignupPoint[];
}

export function AdminOverview({
  hidden,
  metrics,
  onToggle,
  reducedMotion,
  signups,
}: AdminOverviewProps) {
  const shown = SIGNUP_SERIES.filter((item) => !hidden.has(item.key));

  const config = Object.fromEntries(
    SIGNUP_SERIES.map((item, index) => [
      item.key,
      { color: seriesColor(item, index), label: item.label },
    ])
  );

  return (
    <div className="flex flex-col gap-6">
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

      <Card variant="outline">
        <CardHeader>
          {/* Semibold rather than CardTitle's default medium. A dashboard panel
              heading competes with a lot of dense content, so it needs more
              weight than a login card's title does -- but the component stays at
              font-medium, in line with every other *Title part in the library. */}
          <CardTitle className="font-semibold">Signups</CardTitle>
          <CardDescription>
            Trial and paid accounts started each month.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ChartContainer className="h-[240px] w-full" config={config}>
            <BarChart accessibilityLayer data={[...signups]}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="month"
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickFormatter={(value) => formatValue(value, "number")}
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
                          {formatValue(value, "number")}
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
                  isAnimationActive={!reducedMotion}
                  key={item.key}
                  // Cap measured against the VISIBLE bands, so hiding the top
                  // series does not leave the stack uncapped.
                  radius={
                    index === shown.length - 1
                      ? ([4, 4, 0, 0] as [number, number, number, number])
                      : 0
                  }
                  stackId="signups"
                  // Matches the panel's real background: `variant="outline"`
                  // has no fill, so a --card seam would be visibly wrong.
                  stroke="var(--background)"
                  strokeWidth={2}
                />
              ))}
            </BarChart>
          </ChartContainer>
          <SeriesLegend
            hidden={hidden}
            onToggle={onToggle}
            series={SIGNUP_SERIES}
          />
        </CardContent>
      </Card>
    </div>
  );
}
