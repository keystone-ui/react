"use client";

import { DollarSign } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const BALANCE = 1000;
const PRESETS = [0.1, 1, 5, 10, 50, BALANCE];
const ROW_OPTIONS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

export function BettingPanel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [betAmount, setBetAmount] = useState(1);
  const [risk, setRisk] = useState<string[]>(["medium"]);
  const [rows, setRows] = useState("12");

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

          <div className="mt-5 flex flex-col gap-5">
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
              <span className="text-muted-foreground text-sm">Balance</span>
              <span className="font-semibold text-base">
                ${BALANCE.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <FieldLabel htmlFor="bet-amount">Bet Amount</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <DollarSign />
                </InputGroupAddon>
                <InputGroupInput
                  id="bet-amount"
                  inputMode="decimal"
                  onChange={(e) =>
                    setBetAmount(Number.parseFloat(e.target.value) || 0)
                  }
                  type="number"
                  value={betAmount}
                />
              </InputGroup>
              <div className="grid grid-cols-6 gap-2">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    onClick={() => setBetAmount(preset)}
                    size="sm"
                    variant={betAmount === preset ? "default" : "secondary"}
                  >
                    {preset === BALANCE ? "Max" : `$${preset}`}
                  </Button>
                ))}
              </div>
            </div>

            <Field>
              <FieldLabel>Risk</FieldLabel>
              <ToggleGroup
                className="w-full"
                onValueChange={setRisk}
                size="lg"
                spacing={2}
                value={risk}
                variant="secondary"
              >
                <ToggleGroupItem
                  className="flex-1 aria-pressed:bg-emerald-500 aria-pressed:text-white dark:aria-pressed:bg-emerald-600"
                  value="low"
                >
                  Low
                </ToggleGroupItem>
                <ToggleGroupItem
                  className="flex-1 aria-pressed:bg-amber-500 aria-pressed:text-white dark:aria-pressed:bg-amber-600"
                  value="medium"
                >
                  Medium
                </ToggleGroupItem>
                <ToggleGroupItem
                  className="flex-1 aria-pressed:bg-red-500 aria-pressed:text-white dark:aria-pressed:bg-red-600"
                  value="high"
                >
                  High
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="rows">Rows</FieldLabel>
              <Select
                onValueChange={(v) => v !== null && setRows(v)}
                value={rows}
              >
                <SelectTrigger className="w-full" id="rows">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROW_OPTIONS.map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} rows
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Button fullWidth>Place Bet</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BettingPanel03() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <BettingPanel />
      </div>
    </div>
  );
}
