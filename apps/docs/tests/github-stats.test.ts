/**
 * The changelog header is captured once per deploy and cached for a year,
 * so a degraded GitHub answer must fail loudly rather than become "0 commits
 * and 0 PRs" for everyone until the next release.
 */
import { describe, expect, it } from "vitest";

import { loadGitHubStats, loadGitHubStatsOrNull } from "@/lib/github-stats";

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

  it("sends the token as a bearer header when one is given", async () => {
    const headers: (HeadersInit | undefined)[] = [];
    const recording = ((input: string | URL | Request, init?: RequestInit) => {
      headers.push(init?.headers);
      return Promise.resolve(
        String(input).includes("/search/")
          ? json(200, { total_count: 0 })
          : json(200, { all: [] })
      );
    }) as typeof fetch;

    await loadGitHubStats(recording, Date.now(), "t0ken");
    expect(headers).toEqual([
      { Authorization: "Bearer t0ken" },
      { Authorization: "Bearer t0ken" },
    ]);

    headers.length = 0;
    await loadGitHubStats(recording, Date.now(), "");
    expect(headers).toEqual([undefined, undefined]);
  });
});

/**
 * The cached loader must never throw: an error inside `use cache` fails the
 * prerender of /changelog, and with it the whole docs build, even though the
 * component catches it.
 */
describe("loadGitHubStatsOrNull", () => {
  it("returns null on a rate-limited 403 instead of throwing", async () => {
    await expect(
      loadGitHubStatsOrNull(
        fakeFetch({
          "/stats/participation": json(403, {
            message: "API rate limit exceeded",
          }),
          "/search/issues": json(200, { total_count: 7 }),
        })
      )
    ).resolves.toBeNull();
  });

  it("returns null when fetch itself rejects", async () => {
    await expect(
      loadGitHubStatsOrNull((() =>
        Promise.reject(new TypeError("fetch failed"))) as typeof fetch)
    ).resolves.toBeNull();
  });

  it("passes clean stats through", async () => {
    await expect(
      loadGitHubStatsOrNull(
        fakeFetch({
          "/stats/participation": json(200, { all: [2, 2] }),
          "/search/issues": json(200, { total_count: 1 }),
        })
      )
    ).resolves.toEqual({ weeklyData: [2, 2], totalCommits: 4, prCount: 1 });
  });
});
