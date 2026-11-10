/**
 * The admin-01 date filter: local dates, relative rules, the nine operators,
 * switching between them, calendar taps and the URL.
 *
 * The date arithmetic runs under two zones either side of UTC on purpose. The
 * classic bugs — `toISOString().slice(0, 10)`, `new Date("YYYY-MM-DD")`,
 * stepping days in 24-hour units across a DST change — are all invisible in
 * UTC, which is what CI runs in.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  type DateFilter,
  type DateOperator,
  dateFilterFromParams,
  dateFilterToParams,
  dateFilterValue,
  dateOperand,
  dateQualifier,
  EMPTY_DATE_FILTER,
  fromIsoDate,
  matchesDate,
  nextBetween,
  parseRelative,
  type Relative,
  relativeLabel,
  relativeToParam,
  resolveRelative,
  setDateOperator,
  TODAY,
  tapDay,
  toIsoDate,
} from "@/demos/blocks/admin-01/date-filter";
import { payments } from "@/demos/blocks/admin-01/mock-payments";
import {
  CREATED_PRESETS,
  createdPatch,
  EMPTY_FILTERS,
  filterDef,
  matchesPaymentFilters,
} from "@/demos/blocks/admin-01/payment-filters";

const f = (patch: Partial<DateFilter>): DateFilter => ({
  ...EMPTY_DATE_FILTER,
  ...patch,
});

describe.each(["America/Los_Angeles", "Pacific/Kiritimati"])(
  "in %s",
  (zone) => {
    const original = process.env.TZ;
    beforeAll(() => {
      process.env.TZ = zone;
    });
    afterAll(() => {
      // Assigning `undefined` would set the string "undefined", an unknown zone
      // that Node reads as UTC — and every later test would run in it.
      if (original === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = original;
      }
    });

    it("formats the local day, not the UTC one", () => {
      // 23:30 in Los Angeles is the next day in UTC; midnight in Kiritimati
      // is the previous one.
      expect(toIsoDate(new Date(2026, 6, 1, 23, 30))).toBe("2026-07-01");
      expect(toIsoDate(new Date(2026, 6, 1, 0, 0))).toBe("2026-07-01");
    });

    it("parses as local midnight and round-trips", () => {
      const date = fromIsoDate("2026-07-01");
      expect(date?.getDate()).toBe(1);
      expect(date?.getHours()).toBe(0);
      expect(toIsoDate(date as Date)).toBe("2026-07-01");
    });

    it.each(["", "2026-7-1", "2026-02-30", "2026-13-01", "yesterday"])(
      "rejects %j",
      (value) => {
        expect(fromIsoDate(value)).toBeNull();
      }
    );

    describe("relative rules", () => {
      // Built per test, not at collection: the describe body runs before
      // `beforeAll` switches the zone, so a date made here would be midnight
      // somewhere else. 28 Aug 2026 is a Friday.
      const friday = () => new Date(2026, 7, 28);
      const range = (after: string, before: string) => ({ after, before });

      it.each([
        [{ dir: "this", unit: "day" }, range("2026-08-28", "2026-08-28")],
        // Weeks start on Monday, and This week runs to its Sunday.
        [{ dir: "this", unit: "week" }, range("2026-08-24", "2026-08-30")],
        [{ dir: "this", unit: "month" }, range("2026-08-01", "2026-08-31")],
        [{ dir: "this", unit: "year" }, range("2026-01-01", "2026-12-31")],
        // Past N counts today: seven days, not Notion's eight.
        [
          { count: 7, dir: "past", unit: "day" },
          range("2026-08-22", "2026-08-28"),
        ],
        [
          { count: 1, dir: "past", unit: "week" },
          range("2026-08-22", "2026-08-28"),
        ],
        [
          { count: 1, dir: "past", unit: "month" },
          range("2026-07-29", "2026-08-28"),
        ],
        [
          { count: 12, dir: "past", unit: "month" },
          range("2025-08-29", "2026-08-28"),
        ],
        [
          { count: 1, dir: "past", unit: "year" },
          range("2025-08-29", "2026-08-28"),
        ],
      ] as const)("%j covers %j", (rel, expected) => {
        expect(resolveRelative(rel as Relative, friday())).toEqual(expected);
      });

      it("starts a Sunday's week on the Monday before it", () => {
        expect(
          resolveRelative({ dir: "this", unit: "week" }, new Date(2026, 7, 30))
        ).toEqual(range("2026-08-24", "2026-08-30"));
      });

      it("clamps a month back from the 31st", () => {
        // 31 Mar minus a month is 28 Feb (2027 is not a leap year), plus one.
        expect(
          resolveRelative(
            { count: 1, dir: "past", unit: "month" },
            new Date(2027, 2, 31)
          )
        ).toEqual(range("2027-03-01", "2027-03-31"));
      });

      it("steps calendar days across a DST change", () => {
        // US clocks went forward on 8 Mar 2026; a 24-hour step lands an hour
        // short of midnight, on the wrong day.
        expect(
          resolveRelative(
            { count: 7, dir: "past", unit: "day" },
            new Date(2026, 2, 10)
          )
        ).toEqual(range("2026-03-04", "2026-03-10"));
      });
    });
  }
);

describe("relative rules as text", () => {
  it.each([
    ["past.7.day", "Past 7 days"],
    ["past.1.week", "Past week"],
    ["this.day", "Today"],
    ["this.month", "This month"],
  ])("%s reads %s and round-trips", (param, label) => {
    const rel = parseRelative(param) as Relative;
    expect(relativeLabel(rel)).toBe(label);
    expect(relativeToParam(rel)).toBe(param);
  });

  it.each(["", "past.0.day", "next.1.week", "this.fortnight", "past.7"])(
    "refuses %j",
    (param) => {
      expect(parseRelative(param)).toBeNull();
    }
  );
});

describe("matching", () => {
  const on = "2026-07-22";
  it.each([
    ["is", on, "2026-07-22", true],
    ["is", on, "2026-07-23", false],
    ["before", on, "2026-07-21", true],
    ["before", on, "2026-07-22", false],
    ["after", on, "2026-07-23", true],
    ["after", on, "2026-07-22", false],
    ["onOrBefore", on, "2026-07-22", true],
    ["onOrBefore", on, "2026-07-23", false],
    ["onOrAfter", on, "2026-07-22", true],
    ["onOrAfter", on, "2026-07-21", false],
  ] as const)("%s %s matches %s → %s", (op, after, value, expected) => {
    expect(matchesDate(value, f({ after, op }), TODAY)).toBe(expected);
  });

  it("between is inclusive, and either end may be open", () => {
    const july = f({ after: "2026-07-01", before: "2026-07-31" });
    expect(matchesDate("2026-07-01", july, TODAY)).toBe(true);
    expect(matchesDate("2026-07-31", july, TODAY)).toBe(true);
    expect(matchesDate("2026-08-01", july, TODAY)).toBe(false);
    expect(matchesDate("2026-01-01", f({ before: "2026-07-31" }), TODAY)).toBe(
      true
    );
  });

  it("a rule resolves against today", () => {
    const rule = f({ op: "relative", rel: "past.7.day" });
    expect(matchesDate("2026-08-22", rule, TODAY)).toBe(true);
    expect(matchesDate("2026-08-21", rule, TODAY)).toBe(false);
  });

  it("empty and not empty read only whether there is a date", () => {
    expect(matchesDate("", f({ op: "empty" }), TODAY)).toBe(true);
    expect(matchesDate("2026-07-01", f({ op: "empty" }), TODAY)).toBe(false);
    expect(matchesDate("2026-07-01", f({ op: "notEmpty" }), TODAY)).toBe(true);
  });

  it.each([
    "is",
    "before",
    "after",
    "onOrBefore",
    "onOrAfter",
    "between",
    "relative",
  ] as const)("%s with nothing picked narrows nothing", (op) => {
    expect(matchesDate("2026-07-01", f({ op, rel: "" }), TODAY)).toBe(true);
  });
});

describe("reading a filter", () => {
  it.each([
    [f({}), null, null, null],
    [f({ after: "2026-07-22", op: "is" }), "2026-07-22", null, "2026-07-22"],
    [
      f({ after: "2026-07-22", op: "before" }),
      "2026-07-22",
      "is before",
      "2026-07-22",
    ],
    [
      f({ after: "2026-07-01", before: "2026-07-31" }),
      "2026-07-01 – 2026-07-31",
      null,
      "2026-07-01 – 2026-07-31",
    ],
    [
      f({ op: "relative", rel: "past.7.day" }),
      "Past 7 days",
      null,
      "Past 7 days",
    ],
    [f({ op: "empty" }), "Empty", null, null],
    [f({ op: "notEmpty" }), "Not empty", null, null],
  ] as const)(
    "%j reads %j, says %j, beside a badge %j",
    (filter, value, qualifier, operand) => {
      expect(dateFilterValue(filter)).toBe(value);
      expect(dateQualifier(filter)).toBe(qualifier);
      expect(dateOperand(filter)).toBe(operand);
    }
  );
});

describe("switching operator", () => {
  const july = f({ after: "2026-07-01", before: "2026-07-31" });

  it("keeps the start when a range becomes a single date", () => {
    expect(setDateOperator(july, "before", TODAY)).toEqual(
      f({ after: "2026-07-01", op: "before" })
    );
  });

  it("turns a rule into the dates it covers today", () => {
    const rule = f({ op: "relative", rel: "past.7.day" });
    expect(setDateOperator(rule, "between", TODAY)).toEqual(
      f({ after: "2026-08-22", before: "2026-08-28" })
    );
  });

  it("starts a rule at This week, and drops the dates", () => {
    expect(setDateOperator(july, "relative", TODAY)).toEqual(
      f({ op: "relative", rel: "this.week" })
    );
  });

  it.each(["empty", "notEmpty"] as const)("drops everything for %s", (op) => {
    expect(setDateOperator(july, op, TODAY)).toEqual(f({ op }));
  });

  it("never leaves a value the new operator does not read", () => {
    const ops: DateOperator[] = [
      "is",
      "before",
      "after",
      "onOrBefore",
      "onOrAfter",
    ];
    for (const op of ops) {
      const next = setDateOperator(july, op, TODAY);
      expect(next.before).toBe("");
      expect(next.rel).toBe("");
    }
  });
});

describe("calendar taps", () => {
  const b = (after: string, before: string) => ({ after, before });

  it.each([
    [b("", ""), "2026-07-10", b("2026-07-10", "2026-07-10")],
    [
      b("2026-07-10", "2026-07-10"),
      "2026-07-20",
      b("2026-07-10", "2026-07-20"),
    ],
    [
      b("2026-07-10", "2026-07-10"),
      "2026-07-02",
      b("2026-07-02", "2026-07-10"),
    ],
    [b("2026-07-10", "2026-07-10"), "2026-07-10", b("", "")],
    [
      b("2026-07-01", "2026-07-31"),
      "2026-07-15",
      b("2026-07-15", "2026-07-15"),
    ],
  ])("between: %j + %s → %j", (bounds, day, expected) => {
    expect(nextBetween(bounds, day)).toEqual(expected);
  });

  it("a single-date operator sets its day, and the same tap clears it", () => {
    const set = tapDay(f({ op: "before" }), "2026-07-10");
    expect(set).toEqual(f({ after: "2026-07-10", op: "before" }));
    expect(tapDay(set, "2026-07-10")).toEqual(f({ op: "before" }));
  });

  it("a tap under a rule names that day", () => {
    expect(
      tapDay(f({ op: "relative", rel: "this.week" }), "2026-08-25")
    ).toEqual(f({ after: "2026-08-25", op: "is" }));
  });
});

describe("the URL", () => {
  const read = (search: string) =>
    dateFilterFromParams(new URLSearchParams(search));
  const write = (filter: DateFilter) =>
    new URLSearchParams(
      Object.entries(dateFilterToParams(filter)).filter(([, value]) => value)
    ).toString();

  it.each([
    f({ after: "2026-07-01", before: "2026-07-31" }),
    // An open `between` names itself, or it would read back as `on or after`.
    f({ after: "2026-07-01" }),
    f({ after: "2026-07-22", op: "before" }),
    f({ after: "2026-07-22", op: "onOrAfter" }),
    f({ op: "relative", rel: "past.30.day" }),
    f({ op: "empty" }),
  ])("round-trips %j", (filter) => {
    expect(read(write(filter))).toEqual(filter);
  });

  it("leaves an unset filter out", () => {
    expect(write(f({}))).toBe("");
  });

  it.each([
    [
      "from=2026-07-01&to=2026-07-31",
      f({ after: "2026-07-01", before: "2026-07-31" }),
    ],
    ["from=2026-07-01", f({ after: "2026-07-01", op: "onOrAfter" })],
    ["to=2026-07-22", f({ after: "2026-07-22", op: "onOrBefore" })],
  ])("reads an older link %s as the range it meant", (search, expected) => {
    expect(read(search)).toEqual(expected);
  });

  it.each([
    ["createdOp=relative&rel=next.1.week", f({})],
    ["createdOp=sometimes", f({})],
    ["from=2026-02-30", f({})],
  ])("does not trust %s", (search, expected) => {
    expect(read(search)).toEqual(expected);
  });
});

describe("the payments Created filter", () => {
  const withCreated = (filter: DateFilter) => ({
    ...EMPTY_FILTERS,
    ...createdPatch(filter),
  });

  it("offers presets that each find a row in the fixture", () => {
    // The anchor is the last day with a payment, so a preset that came back
    // empty here would be one a demo visitor could never see work.
    const empty = CREATED_PRESETS.filter(
      (preset) =>
        !payments.some((payment) =>
          matchesPaymentFilters(
            payment,
            withCreated(f({ op: "relative", rel: relativeToParam(preset.rel) }))
          )
        )
    ).map((preset) => preset.label);

    expect(empty).toEqual([]);
  });

  it("names a preset on the pill, and a qualifier only where it earns one", () => {
    const rule = withCreated(f({ op: "relative", rel: "past.7.day" }));
    expect(filterDef("created").value(rule)).toBe("Past 7 days");
    expect(filterDef("created").operator?.(rule)).toBeNull();

    const before = withCreated(f({ after: "2026-07-01", op: "before" }));
    expect(filterDef("created").operator?.(before)).toBe("is before");
  });
});
