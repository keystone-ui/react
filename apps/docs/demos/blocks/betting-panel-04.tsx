"use client";

import { Button } from "@keystoneui/react/button";
import { Card, CardContent } from "@keystoneui/react/card";
import { Tabs, TabsList, TabsTrigger } from "@keystoneui/react/tabs";
import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

const BALANCE = 1000;
const MIN_BET = 0.01;
const MIN_ROWS = 8;
const MAX_ROWS = 16;

function BettingPanel({ className, ...props }: React.ComponentProps<"div">) {
  const [betAmount, setBetAmount] = useState(1);
  const [risk, setRisk] = useState<string[]>(["medium"]);
  const [rows, setRows] = useState(12);

  const incrementBet = () =>
    setBetAmount((prev) => Math.min(prev + 1, BALANCE));
  const decrementBet = () =>
    setBetAmount((prev) => Math.max(prev - 1, MIN_BET));
  const incrementRows = () => setRows((prev) => Math.min(prev + 1, MAX_ROWS));
  const decrementRows = () => setRows((prev) => Math.max(prev - 1, MIN_ROWS));

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

          <div className="mt-5 flex flex-col gap-4">
            <div className="rounded-md bg-muted/30 py-3 text-center">
              <span className="block text-muted-foreground text-xs uppercase tracking-wider">
                Balance
              </span>
              <span className="font-bold text-2xl">${BALANCE.toFixed(2)}</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="block text-center text-muted-foreground text-xs uppercase tracking-wide">
                Bet Amount
              </span>
              <div className="flex items-center justify-center gap-4">
                <Button
                  aria-label="Decrease bet amount"
                  className="size-12 rounded-full"
                  onClick={decrementBet}
                  size="icon"
                  variant="secondary"
                >
                  <Minus />
                </Button>
                <span className="w-32 text-center font-bold text-3xl tabular-nums">
                  ${betAmount.toFixed(2)}
                </span>
                <Button
                  aria-label="Increase bet amount"
                  className="size-12 rounded-full"
                  onClick={incrementBet}
                  size="icon"
                  variant="secondary"
                >
                  <Plus />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="block text-center text-muted-foreground text-xs uppercase tracking-wide">
                Risk
              </span>
              <ToggleGroup
                className="justify-center"
                onValueChange={setRisk}
                spacing={2}
                value={risk}
                variant="secondary"
              >
                <ToggleGroupItem
                  className="rounded-full px-8 aria-pressed:bg-emerald-500 aria-pressed:text-white dark:aria-pressed:bg-emerald-600"
                  value="low"
                >
                  Low
                </ToggleGroupItem>
                <ToggleGroupItem
                  className="rounded-full px-8 aria-pressed:bg-amber-500 aria-pressed:text-white dark:aria-pressed:bg-amber-600"
                  value="medium"
                >
                  Medium
                </ToggleGroupItem>
                <ToggleGroupItem
                  className="rounded-full px-8 aria-pressed:bg-red-500 aria-pressed:text-white dark:aria-pressed:bg-red-600"
                  value="high"
                >
                  High
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-2">
              <span className="block text-center text-muted-foreground text-xs uppercase tracking-wide">
                Rows
              </span>
              <div className="flex items-center justify-center gap-4">
                <Button
                  aria-label="Decrease rows"
                  className="size-10 rounded-full"
                  onClick={decrementRows}
                  size="icon"
                  variant="secondary"
                >
                  <Minus />
                </Button>
                <span className="w-16 text-center font-bold text-2xl tabular-nums">
                  {rows}
                </span>
                <Button
                  aria-label="Increase rows"
                  className="size-10 rounded-full"
                  onClick={incrementRows}
                  size="icon"
                  variant="secondary"
                >
                  <Plus />
                </Button>
              </div>
            </div>

            <Button className="mt-2 w-full">Place Bet</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BettingPanel04() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <BettingPanel />
      </div>
    </div>
  );
}
