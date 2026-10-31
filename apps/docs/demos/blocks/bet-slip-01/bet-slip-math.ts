/**
 * The arithmetic of a bet slip, kept out of the UI so it can be tested.
 * Money is held in integer minor units (cents) so totals never pick up
 * floating-point drift; odds are decimal.
 */

export interface Selection {
  /** The odds the punter last accepted. Differs from `odds` after a move. */
  acceptedOdds: number;
  event: string;
  id: string;
  market: string;
  odds: number;
  pick: string;
}

export type SlipMode = "accumulator" | "singles";

/** Parse a stake typed by the punter into cents; anything invalid is 0. */
export function parseStake(input: string): number {
  const value = Number(input.replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.round(value * 100);
}

/** Combined decimal odds of an accumulator: the product of every leg. */
export function accumulatorOdds(selections: readonly Selection[]): number {
  return selections.reduce((product, s) => product * s.odds, 1);
}

/** Total staked and total potential return, both in cents. */
export function slipTotals(
  selections: readonly Selection[],
  stakes: Readonly<Record<string, number>>,
  mode: SlipMode,
  accumulatorStake: number
): { stake: number; potentialReturn: number } {
  if (mode === "accumulator") {
    if (selections.length < 2) {
      return { potentialReturn: 0, stake: 0 };
    }
    return {
      potentialReturn: Math.floor(
        accumulatorStake * accumulatorOdds(selections)
      ),
      stake: accumulatorStake,
    };
  }
  let stake = 0;
  let potentialReturn = 0;
  for (const s of selections) {
    const cents = stakes[s.id] ?? 0;
    stake += cents;
    potentialReturn += Math.floor(cents * s.odds);
  }
  return { potentialReturn, stake };
}

/** Selections whose price moved since the punter last accepted it. */
export function changedSelections(
  selections: readonly Selection[]
): Selection[] {
  return selections.filter((s) => s.odds !== s.acceptedOdds);
}

export type BlockReason = "empty" | "odds-changed" | "over-limit" | "no-stake";

/**
 * Why the slip cannot be placed, if it cannot. Order matters: the first
 * reason is the one the button explains.
 */
export function blockReason(
  selections: readonly Selection[],
  totalStake: number,
  remainingLimit: number
): BlockReason | null {
  if (selections.length === 0) {
    return "empty";
  }
  if (totalStake === 0) {
    return "no-stake";
  }
  if (totalStake > remainingLimit) {
    return "over-limit";
  }
  if (changedSelections(selections).length > 0) {
    return "odds-changed";
  }
  return null;
}

export function formatMoney(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-IE", {
    currency,
    style: "currency",
  }).format(cents / 100);
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}
