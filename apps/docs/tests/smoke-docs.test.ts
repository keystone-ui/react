/**
 * Post-deploy smoke check for the docs Worker (`scripts/smoke-docs.mjs`).
 *
 * The deploy workflow runs it against production and against every PR
 * preview Worker. These tests pin the retry and assertion semantics with a
 * fake `fetch`, so no network is involved.
 */

import { describe, expect, it, vi } from "vitest";

import { DEFAULT_CHECKS, runChecks } from "../../../scripts/smoke-docs.mjs";

type Reply = number | Error;

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
});

describe("runChecks", () => {
  const checks = [
    { path: "/preview/button-default", status: 200 },
    { path: "/missing", status: 404 },
  ];

  it("passes when every route answers with its expected status", async () => {
    const { fetch, calls } = fakeFetch({
      "/preview/button-default": [200],
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
      "https://example.test/preview/button-default",
      "https://example.test/missing",
    ]);
  });

  it("retries a route until it matches, sleeping between attempts", async () => {
    const { fetch } = fakeFetch({
      "/preview/button-default": [500, 500, 200],
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
      "/preview/button-default": [500],
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
        path: "/preview/button-default",
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
      "/preview/button-default": [new Error("ECONNRESET"), 200],
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
      "/preview/button-default": [new Error("ECONNRESET")],
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
      "/preview/button-default": [200],
      "/missing": [404],
    });
    await runChecks({
      baseUrl: "https://example.test/",
      checks,
      fetch,
      ...quiet,
    });
    expect(calls[0]).toBe("https://example.test/preview/button-default");
  });

  it("waits once for the deploy to settle before the first request", async () => {
    // A healthy previous version can still answer for a few seconds after
    // `wrangler deploy` returns, so the production step must not look
    // immediately.
    const { fetch } = fakeFetch({
      "/preview/button-default": [200],
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
      "/preview/button-default": [200],
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
      "/preview/button-default": [200],
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
