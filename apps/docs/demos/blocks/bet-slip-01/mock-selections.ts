import type { Selection } from "./bet-slip-math";

export const INITIAL_SELECTIONS: Selection[] = [
  {
    acceptedOdds: 2.1,
    event: "Arsenal v Chelsea",
    id: "sel-1",
    market: "Match result",
    odds: 2.1,
    pick: "Arsenal",
  },
  {
    acceptedOdds: 1.85,
    event: "Real Madrid v Sevilla",
    id: "sel-2",
    market: "Total goals",
    odds: 1.85,
    pick: "Over 2.5",
  },
  {
    acceptedOdds: 3.4,
    event: "Lakers v Celtics",
    id: "sel-3",
    market: "Winner",
    odds: 3.4,
    pick: "Celtics",
  },
];

/** What the account's responsible-gambling settings allow today, in cents. */
export const DAILY_LIMIT = 10_000;
export const STAKED_TODAY = 6000;
