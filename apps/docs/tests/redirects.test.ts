/**
 * Moved docs URLs (lib/redirects.ts). Old URLs are printed in published
 * package READMEs and the MCP server's setup output, so each one must land
 * on a real page in a single hop.
 */

import { describe, expect, it } from "vitest";

import { DOCS_REDIRECTS } from "../lib/redirects";
import staticPaths from "../lib/static-paths.json";

const pages = new Set(staticPaths.docs);

describe("DOCS_REDIRECTS", () => {
  const entries = Object.entries(DOCS_REDIRECTS);

  it.each(entries)("%s points at a page that exists", (_from, to) => {
    expect(pages.has(to)).toBe(true);
  });

  it.each(entries)("%s is no longer a page itself", (from) => {
    expect(pages.has(from)).toBe(false);
  });

  it.each(entries)("%s redirects in one hop", (_from, to) => {
    expect(DOCS_REDIRECTS[to]).toBeUndefined();
  });
});
