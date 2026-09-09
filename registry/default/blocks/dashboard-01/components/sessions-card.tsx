"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/chart";
import { formatValue } from "@/components/chart-formatters";
import type { ChannelPoint } from "@/components/mock-analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SessionsCardProps {
  data: readonly ChannelPoint[];
  reducedMotion: boolean;
}

const config = {
  sessions: { color: "var(--chart-1)", label: "Sessions" },
};

export function SessionsCard({ data, reducedMotion }: SessionsCardProps) {
  return (
    <Card variant="outline">
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>Weekly, all channels.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[260px] w-full" config={config}>
          <AreaChart accessibilityLayer data={[...data]}>
            <defs>
              <linearGradient id="sessions-fill" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-sessions)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-sessions)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="week"
              interval="preserveStartEnd"
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
                  formatter={(value) => (
                    <div className="flex flex-1 items-center justify-between gap-3">
                      <span className="text-muted-foreground">Sessions</span>
                      <span className="font-medium font-mono tabular-nums">
                        {formatValue(value, "number")}
                      </span>
                    </div>
                  )}
                />
              }
              cursor={false}
            />
            <Area
              dataKey="sessions"
              fill="url(#sessions-fill)"
              isAnimationActive={!reducedMotion}
              stroke="var(--color-sessions)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
