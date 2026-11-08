/**
 * Under Cache Components + Partial Prefetching, a dynamic route gets a
 * fallback shell for params not returned by generateStaticParams. On the
 * Worker that shell cannot be resumed (cache interception has no PPR
 * support): `/docs/<garbage>` hung and returned 500, `/preview/<garbage>`
 * served an empty 200 shell. `proxy.ts` answers unknown paths with the
 * static 404 instead, using a generated list of known paths. These are the
 * pure helpers behind it.
 */

import { describe, expect, it } from "vitest";

import {
  buildKnownPaths,
  docsUrlFromFile,
  isKnownPath,
} from "../lib/known-paths";

describe("docsUrlFromFile", () => {
  it("drops route groups, the extension and index segments", () => {
    expect(docsUrlFromFile("(getting-started)/index.mdx")).toBe("/docs");
    expect(docsUrlFromFile("(getting-started)/agents/llms-txt.mdx")).toBe(
      "/docs/agents/llms-txt"
    );
    expect(docsUrlFromFile("components/button.mdx")).toBe(
      "/docs/components/button"
    );
    expect(docsUrlFromFile("blocks/signin-01.mdx")).toBe(
      "/docs/blocks/signin-01"
    );
  });

  it("returns null for authoring templates and non-MDX files", () => {
    expect(docsUrlFromFile("components/_template.mdx")).toBeNull();
    expect(docsUrlFromFile("blocks/_block-template.mdx")).toBeNull();
    expect(docsUrlFromFile("components/meta.json")).toBeNull();
  });

  it("accepts .md sources, which source.config.ts also collects", () => {
    expect(docsUrlFromFile("components/notes.md")).toBe(
      "/docs/components/notes"
    );
    expect(docsUrlFromFile("components/_draft.md")).toBeNull();
  });
});

describe("isKnownPath", () => {
  const known = buildKnownPaths({
    docs: ["/docs", "/docs/components/button"],
    blog: ["/blog", "/blog/introducing-keystone-ui"],
    preview: ["button-default", "block-signin-01"],
  });

  it("accepts prerendered docs, blog and preview paths", () => {
    expect(isKnownPath("/docs", known)).toBe(true);
    expect(isKnownPath("/docs/components/button", known)).toBe(true);
    expect(isKnownPath("/blog", known)).toBe(true);
    expect(isKnownPath("/blog/introducing-keystone-ui", known)).toBe(true);
    expect(isKnownPath("/preview/block-signin-01", known)).toBe(true);
  });

  it("accepts the .mdx mirror of a docs page and a trailing slash", () => {
    expect(isKnownPath("/docs/components/button.mdx", known)).toBe(true);
    expect(isKnownPath("/docs/components/button/", known)).toBe(true);
  });

  it("accepts percent-encoded forms of a known path, as Next routes them", () => {
    expect(isKnownPath("/preview/button%2Ddefault", known)).toBe(true);
    expect(isKnownPath("/docs/components/button%2Emdx", known)).toBe(true);
    expect(isKnownPath("/blog/introducing%2Dkeystone-ui", known)).toBe(true);
  });

  it("treats a malformed escape as unknown instead of throwing", () => {
    expect(isKnownPath("/docs/components/%E0%A4%A", known)).toBe(false);
  });

  it("rejects unknown params under the guarded prefixes", () => {
    expect(isKnownPath("/docs/components/nope", known)).toBe(false);
    expect(isKnownPath("/docs/blocks/_block-template", known)).toBe(false);
    expect(isKnownPath("/blog/nope", known)).toBe(false);
    expect(isKnownPath("/preview/nope-demo", known)).toBe(false);
    expect(isKnownPath("/docs/components/nope.mdx", known)).toBe(false);
  });

  it("leaves paths outside the guarded prefixes alone", () => {
    expect(isKnownPath("/gallery", known)).toBe(true);
    expect(isKnownPath("/r/demos/button", known)).toBe(true);
  });
});
