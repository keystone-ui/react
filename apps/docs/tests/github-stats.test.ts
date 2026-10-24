/**
 * The changelog header is captured once per deploy and cached for a year,
 * so a degraded GitHub answer must fail loudly rather than become "0 commits
 * and 0 PRs" for everyone until the next release.
 */
import { describe, expect, it } from "vitest";

import { loadGitHubStats } from "@/lib/github-stats";

const RATE_LIMITED = /403/;
const STATS_PENDING = /202/;
const BAD_SHAPE = /shape/;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function fakeFetch(responses: Record<string, Response>): typeof fetch {
  return ((input: string | URL | Request) => {
    const url = String(input);
    const key = Object.keys(responses).find((fragment) =>
      url.includes(fragment)
    );
    if (!key) {
      throw new Error(`Unexpected fetch: ${url}`);
    }
    return Promise.resolve(responses[key]);
  }) as typeof fetch;
}

describe("loadGitHubStats", () => {
  it("totals weekly participation and the PR count from 200 responses", async () => {
    const stats = await loadGitHubStats(
      fakeFetch({
        "/stats/participation": json(200, { all: [1, 2, 3], owner: [1, 1, 1] }),
        "/search/issues": json(200, { total_count: 7 }),
      })
    );
    expect(stats).toEqual({
      weeklyData: [1, 2, 3],
      totalCommits: 6,
      prCount: 7,
    });
  });

  it("asks for pull requests created in the last year", async () => {
    const urls: string[] = [];
    await loadGitHubStats(
      ((input: string | URL | Request) => {
        urls.push(String(input));
        return Promise.resolve(
          String(input).includes("/search/")
            ? json(200, { total_count: 0 })
            : json(200, { all: [] })
        );
      }) as typeof fetch,
      Date.UTC(2026, 9, 24)
    );
    expect(urls.find((u) => u.includes("/search/"))).toContain(
      "created:>2025-10-24"
    );
  });

  it("rejects a rate-limited 403 instead of reporting zero", async () => {
    await expect(
      loadGitHubStats(
        fakeFetch({
          "/stats/participation": json(403, {
            message: "API rate limit exceeded",
          }),
          "/search/issues": json(200, { total_count: 7 }),
        })
      )
    ).rejects.toThrow(RATE_LIMITED);
  });

  it("rejects a 202 'statistics are being computed' answer", async () => {
    await expect(
      loadGitHubStats(
        fakeFetch({
          "/stats/participation": new Response("", { status: 202 }),
          "/search/issues": json(200, { total_count: 7 }),
        })
      )
    ).rejects.toThrow(STATS_PENDING);
  });

  it("rejects a 200 whose body lacks the participation array", async () => {
    await expect(
      loadGitHubStats(
        fakeFetch({
          "/stats/participation": json(200, {}),
          "/search/issues": json(200, { total_count: 7 }),
        })
      )
    ).rejects.toThrow(BAD_SHAPE);
  });
});
