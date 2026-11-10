/**
 * The admin-01 date filter: local-date conversion, presets, modes and taps.
 *
 * Run under two zones either side of UTC on purpose. The classic bugs here —
 * `toISOString().slice(0, 10)`, `new Date("YYYY-MM-DD")`, stepping days in
 * 24-hour units across a DST change — are all invisible in UTC, which is what
 * CI runs in.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  type DateBounds,
  datePresets,
  dateRangeLabel,
  fromIsoDate,
  modeFromBounds,
  nextBetween,
  presetFor,
  resolvePreset,
  setDateMode,
  TODAY,
  tapDay,
  toIsoDate,
} from "@/demos/blocks/admin-01/date-filter";
import { payments } from "@/demos/blocks/admin-01/mock-payments";
import {
  CREATED_PRESETS,
  EMPTY_FILTERS,
  filterDef,
  matchesPaymentFilters,
} from "@/demos/blocks/admin-01/payment-filters";

const bounds = (after: string, before: string): DateBounds => ({
  after,
  before,
});
const EMPTY = bounds("", "");

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

    describe("local dates", () => {
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
    });

    describe("presets", () => {
      // Built per test, not at collection: the describe body runs before
      // `beforeAll` switches the zone, so a date made here would be midnight
      // somewhere else.
      const today = () => new Date(2026, 7, 28);

      it.each([
        ["today", "2026-08-28", "2026-08-28"],
        ["yesterday", "2026-08-27", "2026-08-27"],
        ["last7Days", "2026-08-22", "2026-08-28"],
        ["last30Days", "2026-07-30", "2026-08-28"],
        ["thisMonth", "2026-08-01", "2026-08-28"],
        ["lastMonth", "2026-07-01", "2026-07-31"],
        ["last12Months", "2025-08-29", "2026-08-28"],
        ["thisYear", "2026-01-01", "2026-08-28"],
        ["lastYear", "2025-01-01", "2025-12-31"],
      ] as const)("%s is %s – %s, both ends included", (key, after, before) => {
        expect(resolvePreset(key, today())).toEqual(bounds(after, before));
      });

      it("crosses a year back for yesterday and last month on 1 January", () => {
        const newYear = new Date(2027, 0, 1);
        expect(resolvePreset("yesterday", newYear)).toEqual(
          bounds("2026-12-31", "2026-12-31")
        );
        expect(resolvePreset("lastMonth", newYear)).toEqual(
          bounds("2026-12-01", "2026-12-31")
        );
      });

      it("knows February's length in a leap year", () => {
        expect(resolvePreset("lastMonth", new Date(2028, 2, 1))).toEqual(
          bounds("2028-02-01", "2028-02-29")
        );
        // 29 Feb has no twin a year back: clamp to the 28th, then one on.
        expect(resolvePreset("last12Months", new Date(2028, 1, 29))).toEqual(
          bounds("2027-03-01", "2028-02-29")
        );
      });

      it("steps calendar days across a DST change", () => {
        // US clocks went forward on 8 Mar 2026; a 24-hour step lands an hour
        // short of midnight, on the wrong day.
        expect(resolvePreset("last7Days", new Date(2026, 2, 10))).toEqual(
          bounds("2026-03-04", "2026-03-10")
        );
      });
    });
  }
);

describe("the derived label", () => {
  const presets = datePresets(["last7Days", "lastMonth"]);

  it("names a preset only while the dates are exactly that preset", () => {
    expect(
      presetFor(bounds("2026-07-01", "2026-07-31"), presets, TODAY)?.key
    ).toBe("lastMonth");
    expect(presetFor(bounds("2026-07-01", "2026-07-30"), presets, TODAY)).toBe(
      null
    );
    // The same dates a month later are just dates.
    expect(
      presetFor(
        bounds("2026-07-01", "2026-07-31"),
        presets,
        new Date(2026, 8, 28)
      )
    ).toBe(null);
  });

  it.each([
    [bounds("", ""), null],
    [bounds("2026-08-22", "2026-08-28"), "Last 7 days"],
    [bounds("2026-07-22", "2026-07-22"), "2026-07-22"],
    [bounds("2026-07-01", "2026-07-15"), "2026-07-01 – 2026-07-15"],
    [bounds("2026-07-01", ""), "from 2026-07-01"],
    [bounds("", "2026-07-01"), "to 2026-07-01"],
  ])("%j reads %j", (value, expected) => {
    expect(dateRangeLabel(value, presets, TODAY)).toBe(expected);
  });
});

describe("modes", () => {
  it.each([
    [bounds("", ""), "between"],
    [bounds("2026-07-01", "2026-07-31"), "between"],
    [bounds("2026-07-22", "2026-07-22"), "on"],
    [bounds("2026-07-22", ""), "from"],
    [bounds("", "2026-07-22"), "to"],
  ] as const)("%j opens as %s", (value, mode) => {
    expect(modeFromBounds(value)).toBe(mode);
  });

  const july = bounds("2026-07-01", "2026-07-31");

  it.each([
    [july, "between", july],
    [july, "on", bounds("2026-07-01", "2026-07-01")],
    [july, "from", bounds("2026-07-01", "")],
    [july, "to", bounds("", "2026-07-31")],
    // A flipped direction keeps its date rather than starting over.
    [bounds("2026-07-22", ""), "to", bounds("", "2026-07-22")],
    [bounds("", "2026-07-22"), "from", bounds("2026-07-22", "")],
    [bounds("", "2026-07-22"), "on", bounds("2026-07-22", "2026-07-22")],
    [EMPTY, "on", EMPTY],
    [EMPTY, "from", EMPTY],
  ] as const)("%j switched to %s is %j", (value, mode, expected) => {
    expect(setDateMode(value, mode)).toEqual(expected);
  });

  it("never leaves a bound the new mode does not read", () => {
    for (const mode of ["on", "from", "to"] as const) {
      const next = setDateMode(july, mode);
      expect(modeFromBounds(next)).toBe(mode);
    }
  });
});

describe("calendar taps", () => {
  it.each([
    [
      "nothing → that day",
      EMPTY,
      "2026-07-10",
      bounds("2026-07-10", "2026-07-10"),
    ],
    [
      "a day + a later one → a range",
      bounds("2026-07-10", "2026-07-10"),
      "2026-07-20",
      bounds("2026-07-10", "2026-07-20"),
    ],
    [
      "a day + an earlier one → a range, in order",
      bounds("2026-07-10", "2026-07-10"),
      "2026-07-02",
      bounds("2026-07-02", "2026-07-10"),
    ],
    [
      "a day tapped again → nothing",
      bounds("2026-07-10", "2026-07-10"),
      "2026-07-10",
      EMPTY,
    ],
    [
      "a finished range + any day → starts again",
      bounds("2026-07-01", "2026-07-31"),
      "2026-07-15",
      bounds("2026-07-15", "2026-07-15"),
    ],
    [
      "an open start + a later day → closes the range",
      bounds("2026-07-10", ""),
      "2026-07-20",
      bounds("2026-07-10", "2026-07-20"),
    ],
    [
      "an open end + an earlier day → closes the range",
      bounds("", "2026-07-10"),
      "2026-07-02",
      bounds("2026-07-02", "2026-07-10"),
    ],
    [
      "an open start tapped on its own day → that day",
      bounds("2026-07-10", ""),
      "2026-07-10",
      bounds("2026-07-10", "2026-07-10"),
    ],
  ])("between: %s", (_name, value, day, expected) => {
    expect(nextBetween(value, day)).toEqual(expected);
    expect(tapDay(value, "between", day)).toEqual(expected);
  });

  it("never opens an end in between mode", () => {
    let value = EMPTY;
    for (const day of [
      "2026-07-10",
      "2026-07-02",
      "2026-07-20",
      "2026-07-20",
    ]) {
      value = tapDay(value, "between", day);
      expect(Boolean(value.after)).toBe(Boolean(value.before));
    }
  });

  it.each([
    ["on", EMPTY, "2026-07-10", bounds("2026-07-10", "2026-07-10")],
    [
      "on",
      bounds("2026-07-10", "2026-07-10"),
      "2026-07-12",
      bounds("2026-07-12", "2026-07-12"),
    ],
    ["on", bounds("2026-07-10", "2026-07-10"), "2026-07-10", EMPTY],
    ["from", EMPTY, "2026-07-10", bounds("2026-07-10", "")],
    ["from", bounds("2026-07-10", ""), "2026-07-10", EMPTY],
    ["to", EMPTY, "2026-07-10", bounds("", "2026-07-10")],
    ["to", bounds("", "2026-07-10"), "2026-07-04", bounds("", "2026-07-04")],
  ] as const)("%s: %j + %s → %j", (mode, value, day, expected) => {
    expect(tapDay(value, mode, day)).toEqual(expected);
  });
});

describe("the payments Created filter", () => {
  it("narrows the fixture to last month and names it", () => {
    const lastMonth = resolvePreset("lastMonth", TODAY);
    const filters = {
      ...EMPTY_FILTERS,
      createdAfter: lastMonth.after,
      createdBefore: lastMonth.before,
    };
    const rows = payments.filter((payment) =>
      matchesPaymentFilters(payment, filters)
    );

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.createdAt.startsWith("2026-07"))).toBe(true);
    expect(filterDef("created").value(filters)).toBe("Last month");
  });

  it("offers presets that each find a row in the fixture, except yesterday", () => {
    // The anchor is the last day with a payment, so a preset that came back
    // empty here would be one a demo visitor could never see work.
    const empty = CREATED_PRESETS.filter((preset) => {
      const range = resolvePreset(preset.key, TODAY);
      return !payments.some((payment) =>
        matchesPaymentFilters(payment, {
          ...EMPTY_FILTERS,
          createdAfter: range.after,
          createdBefore: range.before,
        })
      );
    }).map((preset) => preset.key);

    expect(empty).toEqual(["yesterday"]);
  });
});
