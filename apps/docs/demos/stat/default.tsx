"use client";

import { Card, CardContent } from "@keystoneui/react/card";
import { StatDelta, StatValue } from "@keystoneui/react/stat";

export default function StatDefault() {
  return (
    <Card className="w-full max-w-xs" size="sm">
      <CardContent className="flex flex-col gap-1">
        <div className="font-medium text-muted-foreground text-xs">
          Merged PRs
        </div>
        <StatValue>
          128
          <StatDelta direction="up-is-good" value={0.12}>
            +12%
          </StatDelta>
        </StatValue>
        <div className="text-muted-foreground text-xs">94 opened</div>
      </CardContent>
    </Card>
  );
}
