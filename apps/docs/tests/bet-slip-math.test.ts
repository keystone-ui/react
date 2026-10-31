/**
 * bet-slip-01's arithmetic. Money is cents throughout, so a slip of many
 * singles never shows a total like €30.000000004.
 */

import { describe, expect, it } from "vitest";

import {
  accumulatorOdds,
  blockReason,
  changedSelections,
  formatMoney,
  parseStake,
  type Selection,
  slipTotals,
} from "@/demos/blocks/bet-slip-01/bet-slip-math";

const sel = (id: string, odds: number, acceptedOdds = odds): Selection => ({
  acceptedOdds,
  event: "A v B",
  id,
  market: "Match result",
  odds,
  pick: id,
});

describe("parseStake", () => {
  it.each([
    ["10", 1000],
    ["2.5", 250],
    ["2,5", 250],
    ["0.105", 11],
    ["", 0],
    ["-3", 0],
    ["abc", 0],
  ])("%j -> %d cents", (input, cents) => {
    expect(parseStake(input)).toBe(cents);
  });
});

describe("slipTotals", () => {
  const slip = [sel("a", 2.1), sel("b", 1.85)];

  it("sums singles, rounding each return down to the cent", () => {
    expect(slipTotals(slip, { a: 1000, b: 333 }, "singles", 0)).toEqual({
      potentialReturn: 2100 + 616,
      stake: 1333,
    });
  });

  it("multiplies an accumulator's legs", () => {
    expect(accumulatorOdds(slip)).toBeCloseTo(3.885);
    expect(slipTotals(slip, {}, "accumulator", 1000)).toEqual({
      potentialReturn: 3885,
      stake: 1000,
    });
  });

  it("does not price an accumulator of one", () => {
    expect(slipTotals([sel("a", 2)], {}, "accumulator", 1000)).toEqual({
      potentialReturn: 0,
      stake: 0,
    });
  });
});

describe("blockReason", () => {
  it("explains the first thing stopping the bet", () => {
    expect(blockReason([], 0, 5000)).toBe("empty");
    expect(blockReason([sel("a", 2)], 0, 5000)).toBe("no-stake");
    expect(blockReason([sel("a", 2)], 6000, 5000)).toBe("over-limit");
    expect(blockReason([sel("a", 2.2, 2)], 1000, 5000)).toBe("odds-changed");
    expect(blockReason([sel("a", 2)], 1000, 5000)).toBeNull();
  });

  it("puts the limit before a price change", () => {
    // Accepting new odds must not be the way past a responsible-gambling limit.
    expect(blockReason([sel("a", 2.2, 2)], 6000, 5000)).toBe("over-limit");
  });

  it("allows staking exactly the remaining limit", () => {
    expect(blockReason([sel("a", 2)], 5000, 5000)).toBeNull();
  });
});

describe("changedSelections", () => {
  it("finds prices that moved since they were accepted", () => {
    expect(
      changedSelections([sel("a", 2), sel("b", 1.9, 1.85)]).map((s) => s.id)
    ).toEqual(["b"]);
  });
});

describe("formatMoney", () => {
  it("formats cents as euros", () => {
    expect(formatMoney(1050)).toBe("€10.50");
  });
});
