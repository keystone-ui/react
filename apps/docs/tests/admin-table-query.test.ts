/**
 * admin-01's table queries as URLs, and the users table's sort.
 *
 * A URL is input someone can paste, edit or truncate, so the readers have to
 * survive anything and the writers have to leave defaults out. Both failures
 * are silent in a browser — a link that opens unfiltered looks like a link
 * that was never filtered — so they are pinned here, without one.
 */
import { describe, expect, it } from "vitest";

import {
  minutesAgo,
  sortUsers,
  toUsersCsv,
  DEFAULT_SORT as USERS_DEFAULT_SORT,
  EMPTY_FILTERS as USERS_EMPTY,
  type UserFilters,
  usersFromParams,
  usersToParams,
} from "@/demos/blocks/admin-01/admin-filters";
import { type CsvColumn, toCsv } from "@/demos/blocks/admin-01/csv";
import { type User, users } from "@/demos/blocks/admin-01/mock-admin";
import {
  DEFAULT_SORT as PAYMENTS_DEFAULT_SORT,
  EMPTY_FILTERS as PAYMENTS_EMPTY,
  type PaymentFilters,
  paymentsFromParams,
  paymentsToParams,
} from "@/demos/blocks/admin-01/payment-filters";

/** What `useUrlState` writes: the non-empty entries, as a query string. */
function search(params: Record<string, string>): URLSearchParams {
  return new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== "")
  );
}

describe("payments query ⇄ URL", () => {
  it("writes nothing for an untouched table", () => {
    const params = paymentsToParams({
      filters: PAYMENTS_EMPTY,
      pageIndex: 0,
      pageSize: 10,
      sort: PAYMENTS_DEFAULT_SORT,
    });
    expect(search(params).toString()).toBe("");
  });

  it("round-trips every filter, the sort and the page", () => {
    const filters: PaymentFilters = {
      ...PAYMENTS_EMPTY,
      amountMin: "100",
      amountOp: "gt",
      createdAfter: "2026-07-01",
      currencies: ["BTC", "ETH"],
      currencyOp: "isNot",
      email: "gmail",
      player: "ada",
      playerOp: "startsWith",
      provider: "Stripe",
      status: "failed",
      type: "cashout",
    };
    const query = {
      filters,
      pageIndex: 2,
      pageSize: 20,
      sort: { direction: "asc" as const, key: "amount" as const },
    };

    expect(paymentsFromParams(search(paymentsToParams(query)))).toEqual(query);
  });

  it("drops values it does not recognise rather than trusting them", () => {
    const read = paymentsFromParams(
      new URLSearchParams(
        "status=bogus&currency=BTC,DOGE&from=yesterday&min=ten&sort=amount.up&page=-1&size=7"
      )
    );
    expect(read.filters?.status).toBe("all");
    expect(read.filters?.currencies).toEqual(["BTC"]);
    expect(read.filters?.createdAfter).toBe("");
    expect(read.filters?.amountMin).toBe("");
    expect(read.sort).toBeUndefined();
    expect(read.pageIndex).toBeUndefined();
    expect(read.pageSize).toBeUndefined();
  });
});

describe("users query ⇄ URL", () => {
  it("writes nothing for an untouched table", () => {
    const params = usersToParams({
      filters: USERS_EMPTY,
      pageIndex: 0,
      pageSize: 5,
      sort: USERS_DEFAULT_SORT,
    });
    expect(search(params).toString()).toBe("");
  });

  it("round-trips every filter, the sort and the page", () => {
    const filters: UserFilters = {
      createdAfter: "2024-01-01",
      createdBefore: "2024-12-31",
      role: "Admin",
      search: "ada",
      seats: "many",
      status: "invited",
      twoFactor: "off",
    };
    const query = {
      filters,
      pageIndex: 1,
      pageSize: 10,
      sort: { direction: "desc" as const, key: "lastActive" as const },
    };

    expect(usersFromParams(search(usersToParams(query)))).toEqual(query);
  });

  it("drops a role the table does not have", () => {
    const read = usersFromParams(new URLSearchParams("role=Owner&seats=lots"));
    expect(read.filters?.role).toBe("all");
    expect(read.filters?.seats).toBe("all");
  });
});

describe("Last active", () => {
  it("reads the fixture's relative text as minutes", () => {
    expect(minutesAgo("5 minutes ago")).toBe(5);
    expect(minutesAgo("1 hour ago")).toBe(60);
    expect(minutesAgo("yesterday")).toBe(1440);
    expect(minutesAgo("2 weeks ago")).toBe(20_160);
    expect(minutesAgo("never")).toBeNull();
  });

  it("sorts by recency, with never-active users last both ways", () => {
    const order = (direction: "asc" | "desc") =>
      sortUsers(users, { direction, key: "lastActive" }).map(
        (user) => user.lastActive
      );

    const newest = order("desc");
    expect(newest[0]).toBe("5 minutes ago");
    expect(newest.slice(-2)).toEqual(["never", "never"]);

    const oldest = order("asc");
    expect(oldest[0]).toBe("1 month ago");
    expect(oldest.slice(-2)).toEqual(["never", "never"]);
  });
});

describe("toCsv", () => {
  const columns: readonly CsvColumn<{ a: string }>[] = [
    ["A, quoted", (r) => r.a],
  ];

  it("quotes headers and fields that need it, and ends with CRLF", () => {
    expect(toCsv(columns, [{ a: 'say "hi"' }])).toBe(
      '"A, quoted"\r\n"say ""hi"""\r\n'
    );
  });

  it("neutralises cells a spreadsheet would run as a formula", () => {
    const rows = [
      { a: '=HYPERLINK("http://x")' },
      { a: "+1" },
      { a: "@SUM(A1)" },
      { a: "-5" },
      { a: "ada@example.com" },
    ];
    expect(toCsv(columns, rows).split("\r\n").slice(1, -1)).toEqual([
      '"\'=HYPERLINK(""http://x"")"',
      "+1",
      "'@SUM(A1)",
      "-5",
      "ada@example.com",
    ]);
  });

  it("writes the users export with raw values", () => {
    const [header, first] = toUsersCsv(users.slice(0, 1) as User[]).split(
      "\r\n"
    );
    expect(header).toBe(
      "User ID,Name,Email,Role,Status,Seats,Two-factor,Created,Last sign-in"
    );
    expect(first).toContain(users[0].id);
  });
});
