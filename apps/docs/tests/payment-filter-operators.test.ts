/**
 * The admin-01 payments filters: operators, which pills are on the row, and
 * the sort order.
 *
 * Pinned here rather than only in the browser because the failure modes are
 * silent ones — a stale bound narrowing rows no label mentions, an `is not`
 * that quietly behaves as `is` — and a table of plain inputs catches them
 * without a build.
 */
import { describe, expect, it } from "vitest";

import {
  formatAmount,
  type Payment,
} from "@/demos/blocks/admin-01/mock-payments";
import {
  addableKeys,
  DEFAULT_KEYS,
  defaultDirection,
  EMPTY_FILTERS,
  filterDef,
  matchesPaymentFilters,
  type PaymentFilters,
  setAmountOp,
  sortPayments,
  toPaymentsCsv,
  visibleKeys,
} from "@/demos/blocks/admin-01/payment-filters";
import { directionsFor } from "@/demos/blocks/admin-01/sort";

const payment = (amount: string, currency: Payment["currency"]): Payment => ({
  amount,
  createdAt: "2026-07-01T00:00:00Z",
  currency,
  finishedAt: null,
  id: "p",
  playerEmail: "a@b.c",
  provider: "Stripe",
  status: "completed",
  type: "deposit",
});

const filtersWith = (patch: Partial<PaymentFilters>): PaymentFilters => ({
  ...EMPTY_FILTERS,
  ...patch,
});

describe("currency operators", () => {
  it.each([
    ["is", "BTC", true],
    ["is", "ETH", false],
    ["isNot", "BTC", false],
    ["isNot", "ETH", true],
  ] as const)("%s BTC matches %s → %s", (op, currency, expected) => {
    expect(
      matchesPaymentFilters(
        payment("1", currency),
        filtersWith({ currencies: ["BTC"], currencyOp: op })
      )
    ).toBe(expected);
  });

  it("an operator with no currencies narrows nothing", () => {
    expect(
      matchesPaymentFilters(
        payment("1", "BTC"),
        filtersWith({ currencyOp: "isNot" })
      )
    ).toBe(true);
  });
});

describe("player operators", () => {
  it.each([
    ["contains", "GMAIL", "ana@gmail.com", true],
    ["contains", "gmail", "ana@proton.me", false],
    ["notContains", "gmail", "ana@gmail.com", false],
    ["notContains", "gmail", "ana@proton.me", true],
    ["is", "ana@gmail.com", "ana@gmail.com", true],
    ["is", "ana@gmail", "ana@gmail.com", false],
    ["notContains", "   ", "ana@gmail.com", true],
    ["isNot", "ana@gmail.com", "ana@gmail.com", false],
    ["isNot", "ana@gmail.com", "bo@gmail.com", true],
    ["startsWith", "ANA", "ana@gmail.com", true],
    ["startsWith", "gmail", "ana@gmail.com", false],
    ["endsWith", "@gmail.com", "ana@gmail.com", true],
    ["endsWith", "@gmail", "ana@gmail.com", false],
  ] as const)("%s %j on %s → %s", (op, player, email, expected) => {
    expect(
      matchesPaymentFilters(
        { ...payment("1", "BTC"), playerEmail: email },
        filtersWith({ player, playerOp: op })
      )
    ).toBe(expected);
  });

  it("names the operator only when it is not contains", () => {
    const def = filterDef("player");
    expect(def.operator?.(filtersWith({ player: "x" }))).toBeNull();
    expect(
      def.operator?.(filtersWith({ player: "x", playerOp: "notContains" }))
    ).toBe("does not contain");
  });
});

describe("amount operators", () => {
  it.each([
    ["eq", "100", "", "100", true],
    ["eq", "100", "", "100.5", false],
    ["gt", "100", "", "100", false],
    ["gt", "100", "", "101", true],
    ["lt", "", "100", "99", true],
    ["lt", "", "100", "100", false],
    ["between", "10", "100", "10", true],
    ["between", "10", "100", "101", false],
    ["between", "10", "", "5000", true],
    ["between", "", "", "5000", true],
  ] as const)(
    "%s (min %s, max %s) on %s → %s",
    (op, min, max, amount, expected) => {
      expect(
        matchesPaymentFilters(
          payment(amount, "BTC"),
          filtersWith({ amountMax: max, amountMin: min, amountOp: op })
        )
      ).toBe(expected);
    }
  );

  it("switching operator drops the bound the new one does not read", () => {
    const range = filtersWith({ amountMax: "500", amountMin: "10" });
    const gt = { ...range, ...setAmountOp("gt") };
    expect(gt).toMatchObject({ amountMax: "", amountMin: "10" });
    const lt = { ...range, ...setAmountOp("lt") };
    expect(lt).toMatchObject({ amountMax: "500", amountMin: "" });
    expect(setAmountOp("between")).toEqual({ amountOp: "between" });
  });
});

describe("labels", () => {
  it("names the operator only when it is not the default", () => {
    const currency = filterDef("currencies");
    expect(
      currency.operator?.(filtersWith({ currencies: ["BTC"] }))
    ).toBeNull();
    expect(
      currency.operator?.(
        filtersWith({ currencies: ["BTC"], currencyOp: "isNot" })
      )
    ).toBe("is not");
  });

  it.each([
    ["eq", "100", "", "= 100"],
    ["gt", "100", "", "> 100"],
    ["lt", "", "100", "< 100"],
    ["between", "1", "500", "1 – 500"],
    ["between", "1", "", "from 1"],
    ["gt", "", "", null],
  ] as const)("amount %s (%s, %s) reads %s", (op, min, max, expected) => {
    expect(
      filterDef("amount").value(
        filtersWith({ amountMax: max, amountMin: min, amountOp: op })
      )
    ).toBe(expected);
  });

  it("clearing resets the operator too", () => {
    expect(filterDef("currencies").clear).toMatchObject({ currencyOp: "is" });
    expect(filterDef("amount").clear).toMatchObject({ amountOp: "between" });
  });
});

describe("which pills are on the row", () => {
  it("is the row as left, starting pair included", () => {
    expect(visibleKeys(EMPTY_FILTERS, [...DEFAULT_KEYS])).toEqual([
      "type",
      "status",
    ]);
    // A starting pill taken off stays off…
    expect(visibleKeys(EMPTY_FILTERS, ["status"])).toEqual(["status"]);
    // …and re-added, it lands at the end, next to the button it came from.
    expect(visibleKeys(EMPTY_FILTERS, ["status", "type"])).toEqual([
      "status",
      "type",
    ]);
  });

  it("still shows any filter holding a value, on the row or not", () => {
    expect(
      visibleKeys(filtersWith({ provider: "Stripe" }), ["status"])
    ).toEqual(["status", "provider"]);
  });

  it("offers every filter not on the row back through Add filter", () => {
    expect(addableKeys(EMPTY_FILTERS, ["status"])).toEqual([
      "type",
      "currencies",
      "provider",
      "player",
      "created",
      "amount",
    ]);
  });
});

describe("sortPayments", () => {
  const at = (id: string, finishedAt: string | null): Payment => ({
    ...payment("1", "EUR"),
    finishedAt,
    id,
  });
  const rows = [
    at("open-1", null),
    at("early", "2026-07-01 10:00:00"),
    at("open-2", null),
    at("late", "2026-07-03 10:00:00"),
  ];
  const ids = (direction: "asc" | "desc") =>
    sortPayments(rows, { direction, key: "finishedAt" }).map((row) => row.id);

  it("puts unfinished payments last when sorting newest first", () => {
    expect(ids("desc")).toEqual(["late", "early", "open-1", "open-2"]);
  });

  it("puts unfinished payments last when sorting oldest first too", () => {
    expect(ids("asc")).toEqual(["early", "late", "open-1", "open-2"]);
  });

  it("orders amounts numerically, not as strings", () => {
    const amounts = ["9.5", "10", "100.25"].map((amount) =>
      payment(amount, "EUR")
    );
    expect(
      sortPayments(amounts, { direction: "desc", key: "amount" }).map(
        (row) => row.amount
      )
    ).toEqual(["100.25", "10", "9.5"]);
  });
});

describe("directionsFor", () => {
  it("lists a column's natural direction first", () => {
    expect(directionsFor(defaultDirection("createdAt"))).toEqual([
      "desc",
      "asc",
    ]);
    expect(directionsFor(defaultDirection("playerEmail"))).toEqual([
      "asc",
      "desc",
    ]);
  });
});

describe("formatAmount", () => {
  it("groups thousands and gives fiat and stablecoins cents", () => {
    expect(formatAmount("10000.000000", "USDT")).toBe("10,000.00");
    expect(formatAmount("0.750000", "EUR")).toBe("0.75");
  });

  it("keeps crypto's precision without the fixture's padding", () => {
    expect(formatAmount("0.045000", "BTC")).toBe("0.045");
    expect(formatAmount("0.001000", "ETH")).toBe("0.001");
    expect(formatAmount("2.000000", "BTC")).toBe("2.00");
  });
});

describe("toPaymentsCsv", () => {
  const lines = (rows: Payment[]) => toPaymentsCsv(rows).split("\r\n");

  it("writes a header, one line per row and a trailing newline", () => {
    const out = lines([payment("1", "EUR"), payment("2", "BTC")]);
    expect(out[0]).toBe(
      "Payment ID,Player,Amount,Currency,Type,Status,Provider,Created,Finished"
    );
    expect(out).toHaveLength(4);
    expect(out.at(-1)).toBe("");
  });

  it("exports raw values, and an empty cell for an unfinished payment", () => {
    const [, row] = lines([payment("10000.000000", "USDT")]);
    const cells = row.split(",");
    expect(cells[2]).toBe("10000.000000");
    expect(cells.at(-1)).toBe("");
  });

  it("quotes a field holding a comma or a quote", () => {
    const [, row] = lines([
      { ...payment("1", "EUR"), playerEmail: 'a,"b"@c.d' },
    ]);
    expect(row).toContain('"a,""b""@c.d"');
  });
});
