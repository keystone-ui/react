"use client";

import { Button } from "@keystoneui/react/button";
import { Card, CardContent } from "@keystoneui/react/card";
import { Field, FieldGroup, FieldLabel } from "@keystoneui/react/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";
import { Tabs, TabsList, TabsTrigger } from "@keystoneui/react/tabs";
import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";
import { DollarSign } from "lucide-react";
import { useState } from "react";

const ROW_OPTIONS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

function BettingPanel({ className, ...props }: React.ComponentProps<"div">) {
  const [betAmount, setBetAmount] = useState("0.01");
  const [risk, setRisk] = useState<string[]>(["medium"]);
  const [rows, setRows] = useState("12");

  const handleHalf = () => {
    const current = Number.parseFloat(betAmount) || 0;
    setBetAmount((current / 2).toFixed(2));
  };

  const handleDouble = () => {
    const current = Number.parseFloat(betAmount) || 0;
    setBetAmount((current * 2).toFixed(2));
  };

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

          <FieldGroup className="mt-5">
            <Field>
              <FieldLabel>Balance</FieldLabel>
              <div className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
                <span className="font-semibold text-base">$1,000.00</span>
                <span className="text-muted-foreground text-xs">USD</span>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="bet-amount">Bet Amount</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <DollarSign />
                </InputGroupAddon>
                <InputGroupInput
                  id="bet-amount"
                  inputMode="decimal"
                  onChange={(e) => setBetAmount(e.target.value)}
                  type="text"
                  value={betAmount}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton onClick={handleHalf} variant="secondary">
                    ½
                  </InputGroupButton>
                  <InputGroupButton onClick={handleDouble} variant="secondary">
                    2×
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel>Risk Level</FieldLabel>
              <ToggleGroup
                className="w-full"
                onValueChange={setRisk}
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

            <Button className="mt-2" fullWidth>
              Place Bet
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BettingPanel01() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <BettingPanel />
      </div>
    </div>
  );
}
