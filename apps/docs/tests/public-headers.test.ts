/**
 * `public/_headers` is the only place that can set caching for
 * `/_next/static/*`: Workers static assets are served without invoking the
 * Worker, so `headers()` in next.config never sees them. Without this file
 * production served every hashed chunk with `max-age=0, must-revalidate`,
 * one revalidation round trip per chunk per page view.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const HEADERS_FILE = join(import.meta.dirname, "..", "public", "_headers");
/** Header lines are indented under their path line. */
const INDENTED = /^\s/;

/** Parses the Cloudflare `_headers` format into { path: { name: value } }. */
function parseHeadersFile(
  text: string
): Record<string, Record<string, string>> {
  const rules: Record<string, Record<string, string>> = {};
  let current: string | null = null;
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }
    if (!INDENTED.test(line)) {
      current = line.trim();
      rules[current] = {};
      continue;
    }
    if (!current) {
      throw new Error(`header line before any path: ${line}`);
    }
    const idx = line.indexOf(":");
    const name = line.slice(0, idx).trim().toLowerCase();
    rules[current][name] = line.slice(idx + 1).trim();
  }
  return rules;
}

describe("public/_headers", () => {
  const rules = parseHeadersFile(readFileSync(HEADERS_FILE, "utf-8"));

  it("marks hashed Next assets immutable for a year", () => {
    const cache = rules["/_next/static/*"]?.["cache-control"];
    expect(cache).toBeDefined();
    expect(cache).toContain("immutable");
    expect(cache).toContain("max-age=31536000");
  });

  it("does not cache HTML routes through this file", () => {
    // Pages are served by the Worker (cache interception); a blanket rule
    // here would pin stale HTML in browsers across deploys.
    expect(Object.keys(rules).some((p) => p === "/*" || p === "/")).toBe(false);
  });
});
