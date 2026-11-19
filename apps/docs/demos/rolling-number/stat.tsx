"use client";

import { Button } from "@keystoneui/react/button";
import { Card, CardContent } from "@keystoneui/react/card";
import { RollingNumber } from "@keystoneui/react/rolling-number";
import { StatValue } from "@keystoneui/react/stat";
import { useState } from "react";

export default function RollingNumberStat() {
  const [revenue, setRevenue] = useState(48_210);
  return (
    <Card className="w-full max-w-xs" size="sm">
      <CardContent className="flex flex-col gap-1">
        <div className="font-medium text-muted-foreground text-xs">
          Revenue this month
        </div>
        <StatValue>
          <RollingNumber
            format={{
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }}
            value={revenue}
          />
        </StatValue>
        <Button
          className="mt-2 self-start"
          onClick={() => setRevenue((v) => v + 137)}
          size="sm"
          variant="outline"
        >
          Record a sale
        </Button>
      </CardContent>
    </Card>
  );
}
