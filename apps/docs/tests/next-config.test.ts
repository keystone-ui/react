/**
 * The navigation model depends on three config facts that are easy to lose
 * in a refactor: Cache Components on, Partial Prefetching on, and a cache
 * profile whose revalidate is exactly one year. Every built-in `cacheLife`
 * profile is finite (`max` is 30 days); a finite TTL on a route makes
 * OpenNext's interceptor treat it as stale and fall through to the Worker,
 * where the read-only static-assets cache cannot store anything. One year
 * is the single finite value its `computeCacheControl` treats as SSG.
 */

import { describe, expect, it } from "vitest";

const ONE_YEAR = 31_536_000;

// A computed specifier keeps TypeScript (which has no declarations for the
// .mjs config) out of the import; vitest resolves it at runtime.
const CONFIG_URL = new URL("../next.config.mjs", import.meta.url).href;

describe("next.config", async () => {
  const { default: config } = await import(CONFIG_URL);
  const resolved = config as unknown as {
    cacheComponents?: boolean;
    partialPrefetching?: boolean;
    cacheLife?: Record<
      string,
      { stale?: number; revalidate?: number; expire?: number }
    >;
  };

  it("enables Cache Components and Partial Prefetching", () => {
    expect(resolved.cacheComponents).toBe(true);
    expect(resolved.partialPrefetching).toBe(true);
  });

  it("defines a 'static' cache profile that OpenNext serves as SSG", () => {
    const profile = resolved.cacheLife?.static;
    expect(profile).toBeDefined();
    expect(profile?.revalidate).toBe(ONE_YEAR);
    expect(profile?.expire).toBeGreaterThanOrEqual(ONE_YEAR);
  });
});
