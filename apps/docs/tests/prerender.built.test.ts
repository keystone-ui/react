/**
 * Assertions over the production build output (`apps/docs/.next`). Runs in
 * the `built` vitest project only, after `next build`.
 *
 * Why these exist: the docs Worker uses a read-only static-assets cache
 * with cache interception. A route is served from assets only when it is
 * prerendered with no finite TTL; anything else reaches the Next server on
 * every request, and anything that reads the filesystem there fails. Both
 * failure modes shipped green in October 2026 (`/changelog` with a 24 h
 * ISR TTL, `/r/demos/*` 404 on workerd), so the build output is the only
 * honest place to pin them.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const NEXT_DIR = join(import.meta.dirname, "..", ".next");
const MANIFEST = join(NEXT_DIR, "prerender-manifest.json");

/** One year: the only finite value OpenNext's interceptor treats as SSG. */
const ONE_YEAR = 31_536_000;

/** A path segment starting with an underscore: `_template`, `_block-template`. */
const UNDERSCORE_SEGMENT = /\/_[a-z]/;
const TEMPLATE_NAMES = /_template|_block-template/;

interface PrerenderManifest {
  dynamicRoutes: Record<string, unknown>;
  routes: Record<string, { initialRevalidateSeconds: number | false }>;
  version: number;
}

function loadManifest(): PrerenderManifest {
  if (!existsSync(MANIFEST)) {
    throw new Error(
      `${MANIFEST} is missing. Run \`pnpm build\` in apps/docs before the built tests.`
    );
  }
  return JSON.parse(readFileSync(MANIFEST, "utf-8")) as PrerenderManifest;
}

describe("prerender-manifest.json", () => {
  const manifest = loadManifest();
  const routes = Object.keys(manifest.routes);

  it("is the manifest format these assertions were written against", () => {
    // Next may change the shape. Fail loudly rather than pass on an empty
    // or differently keyed object.
    expect(manifest.version).toBe(4);
    expect(routes.length).toBeGreaterThan(100);
    expect(routes).toContain("/changelog");
    expect(routes).toContain("/gallery");
  });

  it("serves every prerendered route from assets: no finite revalidate TTL", () => {
    const offenders = Object.entries(manifest.routes)
      .filter(
        ([, meta]) =>
          meta.initialRevalidateSeconds !== false &&
          meta.initialRevalidateSeconds !== ONE_YEAR
      )
      .map(([route, meta]) => `${route} (${meta.initialRevalidateSeconds}s)`);
    expect(offenders).toEqual([]);
  });

  it("prerenders the filesystem-reading routes so workerd never reads fs", () => {
    for (const route of [
      "/preview/button-default",
      "/preview/block-signin-01",
      "/r/demos/button",
      "/r/demos/signin-01",
      "/llms.mdx/docs",
      "/llms.mdx/docs/components/button",
      "/install",
      "/llms.txt",
      "/llms-full.txt",
    ]) {
      expect(routes, `${route} must be prerendered`).toContain(route);
    }
  });

  it("does not publish the MDX template pages", () => {
    // `/_not-found` and `/_global-error` are Next internals; content routes
    // are everything under /docs and its llms.mdx mirror.
    const templates = routes.filter(
      (r) =>
        (r.startsWith("/docs/") || r.startsWith("/llms.mdx/")) &&
        UNDERSCORE_SEGMENT.test(r)
    );
    expect(templates).toEqual([]);
    const llmsTxt = readFileSync(
      join(NEXT_DIR, "server", "app", "llms.txt.body"),
      "utf-8"
    );
    expect(llmsTxt).not.toMatch(TEMPLATE_NAMES);
  });

  it("ships real content in the prerendered llms bodies", () => {
    for (const file of ["llms.mdx/docs.body", "llms-full.txt.body"]) {
      const body = readFileSync(join(NEXT_DIR, "server", "app", file), "utf-8");
      expect(body, file).not.toContain("Content unavailable");
      expect(body.length, file).toBeGreaterThan(500);
    }
  });
});
