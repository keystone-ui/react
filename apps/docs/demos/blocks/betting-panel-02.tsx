"use client";

import { Button } from "@keystoneui/react/button";
import { Card, CardContent } from "@keystoneui/react/card";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@keystoneui/react/slider";
import { Tabs, TabsList, TabsTrigger } from "@keystoneui/react/tabs";
import { Wallet } from "lucide-react";
import { useState } from "react";

const BALANCE = 1000;

function getRiskInfo(value: number) {
  if (value < 33) {
    return { label: "Low", color: "text-emerald-500" };
  }
  if (value < 66) {
    return { label: "Medium", color: "text-amber-500" };
  }
  return { label: "High", color: "text-red-500" };
}

function BettingPanel({ className, ...props }: React.ComponentProps<"div">) {
  const [betAmount, setBetAmount] = useState(1);
  const [risk, setRisk] = useState(50);
  const [rows, setRows] = useState(12);

  const riskInfo = getRiskInfo(risk);

  return (
    <div className={className} {...props}>
      <Card>
        <CardContent>
          <Tabs defaultValue="manual">
            <TabsList className="w-full">
              <TabsTrigger className="flex-1" value="manual">
                Manual
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="auto">
                Auto
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-5 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Wallet />
                <span>Balance</span>
              </div>
              <span className="font-semibold text-base">
                ${BALANCE.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Bet Amount
                </span>
                <span className="font-bold text-xl tabular-nums">
                  ${betAmount.toFixed(2)}
                </span>
              </div>
              <Slider
                max={BALANCE}
                min={0.01}
                onValueChange={(v) =>
                  setBetAmount(typeof v === "number" ? v : v[0])
                }
                step={0.01}
                value={betAmount}
              >
                <SliderControl>
                  <SliderTrack>
                    <SliderIndicator />
                    <SliderThumb />
                  </SliderTrack>
                </SliderControl>
              </Slider>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>$0.01</span>
                <span>Max: ${BALANCE.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Risk</span>
                <span className={`font-semibold text-base ${riskInfo.color}`}>
                  {riskInfo.label}
                </span>
              </div>
              <Slider
                max={100}
                min={0}
                onValueChange={(v) => setRisk(typeof v === "number" ? v : v[0])}
                step={1}
                value={risk}
              >
                <SliderControl>
                  <SliderTrack>
                    <SliderIndicator className="bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" />
                    <SliderThumb />
                  </SliderTrack>
                </SliderControl>
              </Slider>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Rows</span>
                <span className="font-semibold text-base tabular-nums">
                  {rows}
                </span>
              </div>
              <Slider
                max={16}
                min={8}
                onValueChange={(v) => setRows(typeof v === "number" ? v : v[0])}
                step={1}
                value={rows}
              >
                <SliderControl>
                  <SliderTrack>
                    <SliderIndicator />
                    <SliderThumb />
                  </SliderTrack>
                </SliderControl>
              </Slider>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>8</span>
                <span>16</span>
              </div>
            </div>

            <Button fullWidth>Place Bet</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BettingPanel02() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <BettingPanel />
      </div>
    </div>
  );
}
