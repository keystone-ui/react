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
 * Routes that must reach the Next server, plus what their bodies must say.
 *
 * `/api/search` is the dynamic canary: it reads the query string, so it can
 * never be served from assets, and it exercises the Next server plus the
 * in-memory search index. `bodyIncludes` guards against a 200 that is an
 * error page or a stale handler. `/r/demos/button` is prerendered, but it
 * is the route the MCP `get_examples` tool depends on and it 404'd in
 * production for ten days while CI was green, so it stays pinned here. The
 * two 404 checks always reach the server: an unknown path is never in
 * assets, and a throwing Worker turns them into 500s. The `.mdx` one also
 * proves the llms route answers a miss with 404, not the 500 it used to.
 */
/** @typedef {{ path: string, status: number, bodyIncludes?: string }} Check */
/** @type {Check[]} */
export const DEFAULT_CHECKS = [
  {
    path: "/api/search?query=button",
    status: 200,
    bodyIncludes: "/docs/components/button",
  },
  { path: "/r/demos/button", status: 200, bodyIncludes: '"name":"button"' },
  { path: "/r/demos/smoke-docs-missing", status: 404 },
  { path: "/__smoke-docs-missing-route", status: 404 },
  { path: "/docs/components/__smoke-docs-missing.mdx", status: 404 },
];

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs every check against `baseUrl`, retrying each until it matches or the
 * attempt budget runs out.
 *
 * @param {object} options
 * @param {string} options.baseUrl           Origin of the deployed docs site.
 * @param {Check[]} [options.checks]  Each may carry `bodyIncludes`, a substring the matching-status body must contain.
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
    // biome-ignore lint/performance/noAwaitInLoops: checks run one after another so their log lines read in order
    const result = await runCheck({
      check,
      url: `${origin}${check.path}`,
      fetch,
      attempts,
      delayMs,
      sleep,
      log,
    });
    results.push(result);
  }

  return { ok: results.every((r) => r.ok), results };
}

/**
 * One request. Returns the status on a plain match, or a string describing
 * what was wrong: an error message, or the status plus the missing marker.
 */
async function attemptCheck({ check, url, fetch }) {
  try {
    const response = await fetch(url, {
      // The error page is `no-store`, but make sure a stale cached success
      // can never mask a broken deploy either.
      headers: { "cache-control": "no-cache" },
      // A redirect would hide the status we are asserting on.
      redirect: "manual",
    });
    if (response.status !== check.status || !check.bodyIncludes) {
      return response.status;
    }
    const body = await response.text();
    return body.includes(check.bodyIncludes)
      ? response.status
      : `${response.status} without marker ${JSON.stringify(check.bodyIncludes)}`;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

/** Retries one check until it matches or the attempt budget runs out. */
async function runCheck({ check, url, fetch, attempts, delayMs, sleep, log }) {
  let actual;
  let attempt = 0;
  let ok = false;

  while (attempt < attempts) {
    attempt += 1;
    // biome-ignore lint/performance/noAwaitInLoops: retries are sequential by design; each attempt waits for the previous one to miss
    actual = await attemptCheck({ check, url, fetch });
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

  return {
    path: check.path,
    expected: check.status,
    actual,
    attempts: attempt,
    ok,
  };
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
