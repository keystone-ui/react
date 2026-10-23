/**
 * Post-deploy smoke check for the docs Worker (`scripts/smoke-docs.mjs`).
 *
 * The deploy workflow runs it against production and against every PR
 * preview Worker. These tests pin the retry and assertion semantics with a
 * fake `fetch`, so no network is involved.
 */

import { describe, expect, it, vi } from "vitest";

import { DEFAULT_CHECKS, runChecks } from "../../../scripts/smoke-docs.mjs";

type Reply = number | Error | { status: number; body: string };

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

/** Builds a fake fetch that answers each URL with the next queued reply. */
function fakeFetch(queues: Record<string, Reply[]>) {
  const calls: string[] = [];
  const fetch = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = urlOf(input);
    calls.push(url);
    const { pathname } = new URL(url);
    const queue = queues[pathname];
    if (!queue || queue.length === 0) {
      throw new Error(`unexpected request for ${pathname}`);
    }
    const reply = queue.length > 1 ? queue.shift() : queue[0];
    if (reply instanceof Error) {
      throw reply;
    }
    if (typeof reply === "object") {
      return new Response(reply.body, { status: reply.status });
    }
    return new Response(null, { status: reply as number });
  });
  return { fetch, calls };
}

const quiet = { log: () => {}, sleep: vi.fn(async () => {}) };

describe("DEFAULT_CHECKS", () => {
  it("covers a dynamic route and the not-found path", () => {
    // A dynamic route proves the Next server function constructs. The 404
    // check still reaches the server even if that route ever gets
    // prerendered, so the pair cannot both pass on a Worker that throws.
    expect(DEFAULT_CHECKS.some((c) => c.status === 200)).toBe(true);
    expect(DEFAULT_CHECKS.some((c) => c.status === 404)).toBe(true);
    for (const check of DEFAULT_CHECKS) {
      expect(check.path.startsWith("/")).toBe(true);
    }
  });

  it("does not use a prerendered route as a 200 canary", () => {
    // `/preview/*` becomes static; a 200 served from assets proves nothing
    // about the server function. Every 200 check therefore carries a body
    // marker, so a stale or wrong handler cannot pass on status alone.
    for (const check of DEFAULT_CHECKS.filter((c) => c.status === 200)) {
      expect(check.path.startsWith("/preview/")).toBe(false);
      expect(check.bodyIncludes).toBeTypeOf("string");
    }
  });
});

describe("runChecks with bodyIncludes", () => {
  const checks = [
    {
      path: "/api/search?query=button",
      status: 200,
      bodyIncludes: "/docs/components/button",
    },
  ];

  it("passes when the status matches and the body carries the marker", async () => {
    const { fetch } = fakeFetch({
      "/api/search": [
        { status: 200, body: '[{"url":"/docs/components/button"}]' },
      ],
    });
    const result = await runChecks({
      baseUrl: "https://example.test",
      checks,
      fetch,
      ...quiet,
    });
    expect(result.ok).toBe(true);
  });

  it("fails a 200 whose body lacks the marker, after retrying", async () => {
    const { fetch } = fakeFetch({
      "/api/search": [{ status: 200, body: "<html>Error</html>" }],
    });
    const result = await runChecks({
      baseUrl: "https://example.test",
      checks,
      fetch,
      attempts: 3,
      ...quiet,
    });
    expect(result.ok).toBe(false);
    expect(result.results[0].attempts).toBe(3);
    expect(String(result.results[0].actual)).toContain("marker");
  });

  it("fails a 200 with an empty body when a marker is required", async () => {
    const { fetch } = fakeFetch({ "/api/search": [200] });
    const result = await runChecks({
      baseUrl: "https://example.test",
      checks,
      fetch,
      attempts: 1,
      ...quiet,
    });
    expect(result.ok).toBe(false);
  });

  it("recovers when a later attempt carries the marker", async () => {
    const { fetch } = fakeFetch({
      "/api/search": [
        { status: 200, body: "warming" },
        { status: 200, body: '{"url":"/docs/components/button"}' },
      ],
    });
    const result = await runChecks({
      baseUrl: "https://example.test",
      checks,
      fetch,
      attempts: 3,
      ...quiet,
    });
    expect(result.ok).toBe(true);
    expect(result.results[0].attempts).toBe(2);
  });
});

describe("runChecks", () => {
  const checks = [
    { path: "/r/demos/button", status: 200 },
    { path: "/missing", status: 404 },
  ];

  it("passes when every route answers with its expected status", async () => {
    const { fetch, calls } = fakeFetch({
      "/r/demos/button": [200],
      "/missing": [404],
    });
    const result = await runChecks({
      baseUrl: "https://example.test",
      checks,
      fetch,
      ...quiet,
    });
    expect(result.ok).toBe(true);
    expect(result.results.map((r) => r.attempts)).toEqual([1, 1]);
    expect(calls).toEqual([
      "https://example.test/r/demos/button",
      "https://example.test/missing",
    ]);
  });

  it("retries a route until it matches, sleeping between attempts", async () => {
    const { fetch } = fakeFetch({
      "/r/demos/button": [500, 500, 200],
      "/missing": [404],
    });
    const sleep = vi.fn(async () => {});
    const result = await runChecks({
      baseUrl: "https://example.test",
      checks,
      fetch,
      attempts: 5,
      delayMs: 1234,
      sleep,
      log: () => {},
    });
    expect(result.ok).toBe(true);
    expect(result.results[0].attempts).toBe(3);
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(1234);
  });

  it("fails after the attempt budget when a route keeps returning 500", async () => {
    // This is the Cloudflare 1101 shape: the Worker throws, every dynamic
    // route is a 500, and prerendered pages hide it.
    const { fetch } = fakeFetch({
      "/r/demos/button": [500],
      "/missing": [500],
    });
    const result = await runChecks({
      baseUrl: "https://example.test",
      checks,
      fetch,
      attempts: 3,
      ...quiet,
    });
    expect(result.ok).toBe(false);
    expect(result.results).toEqual([
      expect.objectContaining({
        path: "/r/demos/button",
        expected: 200,
        actual: 500,
        attempts: 3,
        ok: false,
      }),
      expect.objectContaining({
        path: "/missing",
        expected: 404,
        actual: 500,
        attempts: 3,
        ok: false,
      }),
    ]);
  });

  it("treats a network error as a failed attempt and keeps retrying", async () => {
    const { fetch } = fakeFetch({
      "/r/demos/button": [new Error("ECONNRESET"), 200],
      "/missing": [404],
    });
    const result = await runChecks({
      baseUrl: "https://example.test",
      checks,
      fetch,
      attempts: 3,
      ...quiet,
    });
    expect(result.ok).toBe(true);
    expect(result.results[0].attempts).toBe(2);
  });

  it("reports the error message when a route never answers", async () => {
    const { fetch } = fakeFetch({
      "/r/demos/button": [new Error("ECONNRESET")],
      "/missing": [404],
    });
    const result = await runChecks({
      baseUrl: "https://example.test",
      checks,
      fetch,
      attempts: 2,
      ...quiet,
    });
    expect(result.ok).toBe(false);
    expect(result.results[0].actual).toBe("ECONNRESET");
  });

  it("does not double the slash when the base URL has a trailing one", async () => {
    const { fetch, calls } = fakeFetch({
      "/r/demos/button": [200],
      "/missing": [404],
    });
    await runChecks({
      baseUrl: "https://example.test/",
      checks,
      fetch,
      ...quiet,
    });
    expect(calls[0]).toBe("https://example.test/r/demos/button");
  });

  it("waits once for the deploy to settle before the first request", async () => {
    // A healthy previous version can still answer for a few seconds after
    // `wrangler deploy` returns, so the production step must not look
    // immediately.
    const { fetch } = fakeFetch({
      "/r/demos/button": [200],
      "/missing": [404],
    });
    const sleep = vi.fn(async () => {});
    await runChecks({
      baseUrl: "https://example.test",
      checks,
      fetch,
      settleMs: 10_000,
      sleep,
      log: () => {},
    });
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(10_000);
    expect(sleep.mock.invocationCallOrder[0]).toBeLessThan(
      fetch.mock.invocationCallOrder[0]
    );
  });

  it("does not wait at all when no settle time is given", async () => {
    const { fetch } = fakeFetch({
      "/r/demos/button": [200],
      "/missing": [404],
    });
    const sleep = vi.fn(async () => {});
    await runChecks({
      baseUrl: "https://example.test",
      checks,
      fetch,
      sleep,
      log: () => {},
    });
    expect(sleep).not.toHaveBeenCalled();
  });

  it("asks the edge not to serve a cached answer", async () => {
    const { fetch } = fakeFetch({
      "/r/demos/button": [200],
      "/missing": [404],
    });
    await runChecks({
      baseUrl: "https://example.test",
      checks,
      fetch,
      ...quiet,
    });
    const init = fetch.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("cache-control")).toBe("no-cache");
    expect(init.redirect).toBe("manual");
  });
});
