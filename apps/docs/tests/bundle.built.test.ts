/**
 * Client bundle budget for a representative docs page, measured from the
 * production build (`apps/docs/.next`). Runs in the `built` vitest project.
 *
 * Why: `demos/index.ts` used to import all ~450 demo components statically,
 * so Turbopack merged them into a single 1.5 MB chunk that every docs page
 * loaded. These assertions parse the page's own `<script src>` tags and
 * `stat` the files, so they are deterministic (no network, no compression
 * variance) and fail the moment a merged mega-chunk returns.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const NEXT_DIR = join(import.meta.dirname, "..", ".next");
const SCRIPT_SRC = /<script[^>]+src="(\/_next\/static\/[^"]+\.js)"/g;
const KB = 1024;

/** No single chunk on a docs page may exceed this (uncompressed). */
const MAX_CHUNK_BYTES = 300 * KB;
/**
 * Total JavaScript referenced by the page (uncompressed). Measured at
 * 1,030 KB after the loader change (down from 2,565 KB); the budget leaves
 * ~15% headroom for ordinary growth while catching a regression of the
 * mega-chunk kind.
 */
const MAX_TOTAL_BYTES = 1200 * KB;
/** Only block pages use recharts; a docs page must not pull it in. */
const RECHARTS_SENTINEL = "recharts";

interface PageScripts {
  chunks: { path: string; bytes: number }[];
  total: number;
}

function scriptsOf(htmlPath: string): PageScripts {
  const html = readFileSync(join(NEXT_DIR, "server", "app", htmlPath), "utf-8");
  const seen = new Set<string>();
  const chunks: PageScripts["chunks"] = [];
  for (const match of html.matchAll(SCRIPT_SRC)) {
    const url = match[1].split("?")[0];
    if (seen.has(url)) {
      continue;
    }
    seen.add(url);
    const file = join(NEXT_DIR, url.replace("/_next/", ""));
    if (!existsSync(file)) {
      throw new Error(`${htmlPath} references ${url} but ${file} is missing`);
    }
    chunks.push({ path: url, bytes: statSync(file).size });
  }
  return {
    chunks,
    total: chunks.reduce((sum, chunk) => sum + chunk.bytes, 0),
  };
}

function describeChunks(page: PageScripts): string[] {
  return page.chunks
    .filter((c) => c.bytes > MAX_CHUNK_BYTES)
    .map((c) => `${c.path} (${Math.round(c.bytes / KB)} KB)`);
}

describe("preview page client bundle", () => {
  // Iframed by every block doc, so it must not carry the whole demo map.
  const page = scriptsOf("preview/button-default.html");

  it("loads no chunk larger than the per-chunk budget", () => {
    expect(describeChunks(page)).toEqual([]);
  });
});

describe("docs page client bundle", () => {
  const page = scriptsOf("docs/components/button.html");

  it("references a realistic set of scripts", () => {
    expect(page.chunks.length).toBeGreaterThan(3);
    expect(page.chunks.length).toBeLessThan(60);
  });

  it("loads no chunk larger than the per-chunk budget", () => {
    expect(describeChunks(page)).toEqual([]);
  });

  it("stays under the total JavaScript budget", () => {
    expect(
      page.total,
      `total ${Math.round(page.total / KB)} KB over ${MAX_TOTAL_BYTES / KB} KB`
    ).toBeLessThanOrEqual(MAX_TOTAL_BYTES);
  });

  it("keeps the server-component payload small", () => {
    // The highlighted demo source used to be serialised token-by-token as
    // props of the client <Pre>: ~1,700 spans per page, sent once as HTML
    // and again in the Flight payload. button.rsc was 205 KB; as one HTML
    // string it is 149 KB. What remains is the code itself, so the next
    // step down is loading code on demand, not a tighter serialisation.
    const rsc = statSync(
      join(NEXT_DIR, "server", "app", "docs", "components", "button.rsc")
    ).size;
    expect(rsc, `button.rsc is ${Math.round(rsc / KB)} KB`).toBeLessThan(
      160 * KB
    );
  });

  it("does not ship the charting library to a component page", () => {
    const offenders = page.chunks.filter((c) =>
      readFileSync(
        join(NEXT_DIR, c.path.replace("/_next/", "")),
        "utf-8"
      ).includes(RECHARTS_SENTINEL)
    );
    expect(offenders.map((c) => c.path)).toEqual([]);
  });
});
