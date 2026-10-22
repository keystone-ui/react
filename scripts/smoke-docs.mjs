#!/usr/bin/env node

/**
 * Post-deploy smoke check for the docs Worker.
 *
 * Why this exists: on 2026-10-11 a dependency bump paired Next 16.4.0 with an
 * `@opennextjs/cloudflare` that did not know about Next 16.4's
 * `preview-props.json` manifest. The Next server threw from its constructor
 * on every invocation and every dynamic route returned Cloudflare 1101 for
 * ten days. Nothing noticed, because:
 *
 *   - prerendered pages are served from assets by OpenNext's cache
 *     interception without ever invoking Next, so the site looked healthy;
 *   - CI's Playwright suite runs against `next start`, not the Workers
 *     runtime, so a crash that only happens inside workerd cannot fail it.
 *
 * This script hits routes that must reach the Next server function and
 * asserts their status codes. The deploy workflow runs it against production
 * after every push to main and against each PR preview Worker.
 *
 * Usage:
 *   node scripts/smoke-docs.mjs https://keystoneui.io
 *   pnpm smoke:docs https://keystoneui-docs-preview-26.<account>.workers.dev
 *
 * Retries each route for about a minute, since a fresh Worker version can
 * take a few seconds to serve everywhere. Env overrides: SMOKE_ATTEMPTS,
 * SMOKE_DELAY_MS, SMOKE_SETTLE_MS (one-off wait before the first request).
 */

import { pathToFileURL } from "node:url";

/**
 * Routes that cannot be answered without running the Next server.
 *
 * The dynamic route proves the server constructs and renders. The not-found
 * check is the safety net: if that route is ever prerendered, its 200 would
 * come from assets, but an unknown path always reaches the server, and a
 * throwing Worker turns it into a 500.
 */
export const DEFAULT_CHECKS = [
  { path: "/preview/button-default", status: 200 },
  { path: "/__smoke-docs-missing-route", status: 404 },
];

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs every check against `baseUrl`, retrying each until it matches or the
 * attempt budget runs out.
 *
 * @param {object} options
 * @param {string} options.baseUrl           Origin of the deployed docs site.
 * @param {Array<{path: string, status: number}>} [options.checks]
 * @param {typeof globalThis.fetch} [options.fetch]
 * @param {number} [options.attempts]        Attempts per check.
 * @param {number} [options.delayMs]         Pause between attempts.
 * @param {number} [options.settleMs]        One-off wait before the first request.
 * @param {(ms: number) => Promise<void>} [options.sleep]
 * @param {(line: string) => void} [options.log]
 * @returns {Promise<{ok: boolean, results: Array<{path: string, expected: number, actual: number | string, attempts: number, ok: boolean}>}>}
 */
export async function runChecks({
  baseUrl,
  checks = DEFAULT_CHECKS,
  fetch = globalThis.fetch,
  attempts = 10,
  delayMs = 6000,
  settleMs = 0,
  sleep = defaultSleep,
  log = console.log,
}) {
  const origin = baseUrl.replace(/\/+$/, "");
  const results = [];

  // Right after `wrangler deploy` returns, an edge can still answer with the
  // previous version for a few seconds. Retries only cover the opposite case
  // (new version not yet reachable), so the production step waits once
  // before looking, or a healthy old version could vouch for a broken new one.
  if (settleMs > 0) {
    log(
      `waiting ${Math.round(settleMs / 1000)}s for the new version to settle`
    );
    await sleep(settleMs);
  }

  for (const check of checks) {
    const url = `${origin}${check.path}`;
    let actual;
    let attempt = 0;
    let ok = false;

    while (attempt < attempts) {
      attempt += 1;
      try {
        // biome-ignore lint/performance/noAwaitInLoops: retries are sequential by design; each attempt waits for the previous one to miss
        const response = await fetch(url, {
          // The error page is `no-store`, but make sure a stale cached success
          // can never mask a broken deploy either.
          headers: { "cache-control": "no-cache" },
          // A redirect would hide the status we are asserting on.
          redirect: "manual",
        });
        actual = response.status;
      } catch (error) {
        actual = error instanceof Error ? error.message : String(error);
      }

      ok = actual === check.status;
      log(
        `${ok ? "ok  " : "miss"} ${check.path} -> ${actual} (want ${check.status}, attempt ${attempt}/${attempts})`
      );
      if (ok) {
        break;
      }
      if (attempt < attempts) {
        await sleep(delayMs);
      }
    }

    results.push({
      path: check.path,
      expected: check.status,
      actual,
      attempts: attempt,
      ok,
    });
  }

  return { ok: results.every((r) => r.ok), results };
}

async function main() {
  const baseUrl = process.argv[2] ?? process.env.SMOKE_BASE_URL;
  if (!baseUrl) {
    console.error("usage: node scripts/smoke-docs.mjs <base-url>");
    process.exit(2);
  }

  // Env overrides are for local runs against `wrangler dev`; CI uses the
  // defaults, which give a fresh Worker version about a minute to settle.
  const attempts = Number(process.env.SMOKE_ATTEMPTS) || undefined;
  const delayMs = Number(process.env.SMOKE_DELAY_MS) || undefined;
  const settleMs = Number(process.env.SMOKE_SETTLE_MS) || undefined;

  console.log(`Smoke testing ${baseUrl}`);
  const { ok, results } = await runChecks({
    baseUrl,
    attempts,
    delayMs,
    settleMs,
  });

  console.log("");
  for (const r of results) {
    console.log(
      `${r.ok ? "PASS" : "FAIL"} ${r.path}: got ${r.actual}, wanted ${r.expected} (${r.attempts} attempt${r.attempts === 1 ? "" : "s"})`
    );
  }

  if (!ok) {
    console.error(
      "\nThe docs Worker is not serving dynamic routes. Check the Workers logs for an uncaught exception; a Next/@opennextjs/cloudflare version mismatch is the usual cause."
    );
    process.exit(1);
  }
  console.log("\nAll smoke checks passed.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
