/**
 * The sitemap is built from the docs source plus the hand-listed top-level
 * sections and blog posts. `app/sitemap.ts` is a thin wrapper; this is the
 * pure function behind it, so the exclusions can be pinned without a build.
 */

import { describe, expect, it } from "vitest";

import { buildSitemapEntries } from "../lib/sitemap-entries";

const SITE = "https://keystoneui.io";

describe("buildSitemapEntries", () => {
  const entries = buildSitemapEntries({
    siteUrl: SITE,
    docsUrls: [
      "/docs",
      "/docs/components/button",
      "/docs/components/_template",
      "/docs/blocks/_block-template",
      "/docs/components/button",
    ],
    blogSlugs: ["introducing-keystone-ui"],
  });
  const urls = entries.map((e) => e.url);

  it("emits absolute URLs under the site origin", () => {
    for (const url of urls) {
      expect(url.startsWith(`${SITE}/`) || url === SITE).toBe(true);
    }
  });

  it("includes the top-level sections, docs pages and blog posts", () => {
    expect(urls).toContain(SITE);
    expect(urls).toContain(`${SITE}/gallery`);
    expect(urls).toContain(`${SITE}/blocks`);
    expect(urls).toContain(`${SITE}/theme-builder`);
    expect(urls).toContain(`${SITE}/changelog`);
    expect(urls).toContain(`${SITE}/blog`);
    expect(urls).toContain(`${SITE}/blog/introducing-keystone-ui`);
    expect(urls).toContain(`${SITE}/docs/components/button`);
  });

  it("excludes authoring templates and iframe-only preview pages", () => {
    expect(urls.some((u) => u.includes("/_"))).toBe(false);
    expect(urls.some((u) => u.includes("/preview/"))).toBe(false);
  });

  it("is de-duplicated and sorted for stable diffs", () => {
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toEqual([...urls].sort());
  });
});
