"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ShieldAlertIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  accumulatorOdds,
  type BlockReason,
  blockReason,
  changedSelections,
  formatMoney,
  formatOdds,
  parseStake,
  type Selection,
  type SlipMode,
  slipTotals,
} from "@/components/bet-slip-math";
import {
  DAILY_LIMIT,
  INITIAL_SELECTIONS,
  STAKED_TODAY,
} from "@/components/mock-selections";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOddsFeed } from "@/components/use-odds-feed";

const BUTTON_LABEL: Record<BlockReason, string> = {
  empty: "Add a selection",
  "no-stake": "Enter a stake",
  "odds-changed": "Accept odds changes",
  "over-limit": "Over your daily limit",
};

function OddsMovement({ selection }: { selection: Selection }) {
  if (selection.odds === selection.acceptedOdds) {
    return null;
  }
  const up = selection.odds > selection.acceptedOdds;
  const Icon = up ? ArrowUpIcon : ArrowDownIcon;
  return (
    <span
      className={up ? "text-success" : "text-destructive"}
      data-slot="odds-movement"
    >
      <Icon aria-hidden className="size-3.5" />
      <span className="sr-only">
        {up ? "Odds lengthened" : "Odds shortened"} from{" "}
        {formatOdds(selection.acceptedOdds)}
      </span>
    </span>
  );
}

function StakeInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <InputGroup size="sm">
      <InputGroupAddon>
        <InputGroupText>€</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        aria-label={label}
        inputMode="decimal"
        onChange={(event) => onChange(event.target.value)}
        placeholder="0.00"
        value={value}
      />
    </InputGroup>
  );
}

export function BetSlip({ liveOdds = true }: { liveOdds?: boolean }) {
  const [selections, setSelections] = useState(INITIAL_SELECTIONS);
  const [mode, setMode] = useState<SlipMode>("singles");
  const [stakeInputs, setStakeInputs] = useState<Record<string, string>>({
    "sel-1": "10",
  });
  const [accumulatorInput, setAccumulatorInput] = useState("");
  const [placed, setPlaced] = useState(false);

  const stableSetSelections = useCallback(
    (update: (prev: Selection[]) => Selection[]) => setSelections(update),
    []
  );
  useOddsFeed(stableSetSelections, { enabled: liveOdds && !placed });

  const stakes = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(stakeInputs).map(([id, input]) => [
          id,
          parseStake(input),
        ])
      ),
    [stakeInputs]
  );
  // An accumulator needs two legs. Below that the tab is disabled, and a
  // slip left on it would have no stake input at all.
  const activeMode: SlipMode = selections.length < 2 ? "singles" : mode;
  const totals = slipTotals(
    selections,
    stakes,
    activeMode,
    parseStake(accumulatorInput)
  );
  const remaining = DAILY_LIMIT - STAKED_TODAY;
  const reason = blockReason(selections, totals.stake, remaining);
  const changed = changedSelections(selections);

  const acceptChanges = () =>
    setSelections((prev) => prev.map((s) => ({ ...s, acceptedOdds: s.odds })));
  const remove = (id: string) =>
    setSelections((prev) => prev.filter((s) => s.id !== id));

  if (placed) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Bet placed</EmptyTitle>
              <EmptyDescription>
                {formatMoney(totals.stake)} staked to return up to{" "}
                {formatMoney(totals.potentialReturn)}.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              setPlaced(false);
              setSelections(INITIAL_SELECTIONS);
            }}
            variant="secondary"
          >
            New slip
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm" data-slot="bet-slip">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Bet slip
          <Badge variant="secondary">{selections.length}</Badge>
        </CardTitle>
        {selections.length > 0 && (
          <CardAction>
            <Button onClick={() => setSelections([])} size="sm" variant="ghost">
              Clear
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Tabs
          onValueChange={(value) => setMode(value as SlipMode)}
          value={activeMode}
        >
          <TabsList className="w-full">
            <TabsTrigger value="singles">Singles</TabsTrigger>
            <TabsTrigger disabled={selections.length < 2} value="accumulator">
              Accumulator
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {selections.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Your slip is empty</EmptyTitle>
              <EmptyDescription>
                Pick a price to add a selection.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {selections.map((s) => (
              <li className="flex flex-col gap-2 py-3 first:pt-0" key={s.id}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{s.pick}</p>
                    <p className="text-muted-foreground text-xs">
                      {s.market} · {s.event}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 font-semibold text-sm tabular-nums">
                    <OddsMovement selection={s} />
                    {formatOdds(s.odds)}
                  </span>
                  <Button
                    aria-label={`Remove ${s.pick}`}
                    onClick={() => remove(s.id)}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <XIcon />
                  </Button>
                </div>
                {activeMode === "singles" && (
                  <div className="flex items-center gap-3">
                    <StakeInput
                      label={`Stake on ${s.pick}`}
                      onChange={(value) =>
                        setStakeInputs((prev) => ({ ...prev, [s.id]: value }))
                      }
                      value={stakeInputs[s.id] ?? ""}
                    />
                    <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                      Returns{" "}
                      {formatMoney(Math.floor((stakes[s.id] ?? 0) * s.odds))}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {activeMode === "accumulator" && (
          <div className="flex items-center gap-3">
            <StakeInput
              label="Accumulator stake"
              onChange={setAccumulatorInput}
              value={accumulatorInput}
            />
            <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
              {selections.length}-fold @{" "}
              {formatOdds(accumulatorOdds(selections))}
            </span>
          </div>
        )}

        {changed.length > 0 && (
          <Alert variant="warning">
            <AlertTitle>Odds have changed</AlertTitle>
            <AlertDescription>
              {changed.length === 1
                ? `${changed[0].pick} moved from ${formatOdds(changed[0].acceptedOdds)} to ${formatOdds(changed[0].odds)}.`
                : `${changed.length} prices moved since you added them.`}
            </AlertDescription>
          </Alert>
        )}

        {reason === "over-limit" && (
          <Alert variant="error">
            <ShieldAlertIcon />
            <AlertTitle>Over your daily limit</AlertTitle>
            <AlertDescription>
              You can stake {formatMoney(remaining)} more today. Lower your
              stake, or review your limits in Responsible Gambling.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <dl className="grid w-full grid-cols-2 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Total stake</dt>
          <dd className="text-end tabular-nums">{formatMoney(totals.stake)}</dd>
          <dt className="text-muted-foreground">Potential return</dt>
          <dd className="text-end font-semibold tabular-nums">
            {formatMoney(totals.potentialReturn)}
          </dd>
        </dl>
        {reason === "odds-changed" ? (
          <Button className="w-full" onClick={acceptChanges}>
            Accept odds changes
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={reason !== null}
            onClick={() => setPlaced(true)}
          >
            {reason
              ? BUTTON_LABEL[reason]
              : `Place bet · ${formatMoney(totals.stake)}`}
          </Button>
        )}
        <p className="text-center text-muted-foreground text-xs">
          Daily limit {formatMoney(DAILY_LIMIT)} · {formatMoney(remaining)} left
          today
        </p>
      </CardFooter>
    </Card>
  );
}
