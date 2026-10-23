/**
 * The generated known-path list (`lib/static-paths.json`, read by proxy.ts)
 * must equal what the build actually prerendered. If a docs page exists
 * that the list does not know, the proxy would 404 a real page; if the list
 * names a page the build did not produce, the proxy would let a request
 * through to the unresumable shell.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import staticPaths from "../lib/static-paths.json";

const MANIFEST = join(
  import.meta.dirname,
  "..",
  ".next",
  "prerender-manifest.json"
);

describe("lib/static-paths.json vs prerender-manifest.json", () => {
  const routes = Object.keys(
    (JSON.parse(readFileSync(MANIFEST, "utf-8")) as { routes: object }).routes
  );
  const prerendered = (prefix: string) =>
    routes.filter((r) => r === prefix || r.startsWith(`${prefix}/`)).sort();

  it("lists exactly the prerendered docs pages", () => {
    expect([...staticPaths.docs].sort()).toEqual(prerendered("/docs"));
  });

  it("lists exactly the prerendered blog pages", () => {
    expect([...staticPaths.blog].sort()).toEqual(prerendered("/blog"));
  });

  it("lists exactly the prerendered preview pages", () => {
    expect(
      staticPaths.preview.map((name: string) => `/preview/${name}`).sort()
    ).toEqual(prerendered("/preview"));
  });
});
