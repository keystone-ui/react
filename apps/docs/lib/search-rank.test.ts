import { describe, expect, it } from "vitest";

import { rankResults, type SearchResult } from "./search-rank";

const page = (url: string, title: string): SearchResult => ({
  id: url,
  type: "page",
  content: title,
  url,
});
const hit = (url: string, n: number): SearchResult => ({
  id: `${url}-${n}`,
  type: "text",
  content: "matching text",
  url: `${url}#s${n}`,
});

// Groups in index order, the way the Orama search returns them.
const results = [
  page("/docs/concepts/accessibility", "Accessibility"),
  hit("/docs/concepts/accessibility", 1),
  hit("/docs/concepts/accessibility", 2),
  page("/docs/blocks/admin-01", "Admin 01"),
  hit("/docs/blocks/admin-01", 1),
  page("/docs/components/button-group", "Button Group"),
  hit("/docs/components/button-group", 1),
  page("/docs/components/button", "Button"),
  hit("/docs/components/button", 1),
  page("/docs/components/toggle", "Toggle button"),
];

const pages = (list: SearchResult[]) =>
  list.filter((r) => r.type === "page").map((r) => r.url);

describe("rankResults", () => {
  it("puts the exact title first, then titles starting with the query, then containing it", () => {
    expect(pages(rankResults(results, "Button", 60))).toEqual([
      "/docs/components/button",
      "/docs/components/button-group",
      "/docs/components/toggle",
      "/docs/concepts/accessibility",
      "/docs/blocks/admin-01",
    ]);
  });

  it("keeps each page's hits right after it", () => {
    const ranked = rankResults(results, "button", 60);
    const i = ranked.findIndex((r) => r.url === "/docs/components/button");
    expect(ranked[i + 1].url).toBe("/docs/components/button#s1");
  });

  it("orders pages without a title match by how many sections matched", () => {
    expect(pages(rankResults(results, "nothing-in-titles", 60))).toEqual([
      "/docs/concepts/accessibility",
      "/docs/blocks/admin-01",
      "/docs/components/button-group",
      "/docs/components/button",
      "/docs/components/toggle",
    ]);
  });

  it("cuts the list to the limit after ranking", () => {
    const ranked = rankResults(results, "button", 2);
    expect(ranked.map((r) => r.url)).toEqual([
      "/docs/components/button",
      "/docs/components/button#s1",
    ]);
  });

  it("returns nothing for no results", () => {
    expect(rankResults([], "button", 60)).toEqual([]);
  });
});
