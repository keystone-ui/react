/**
 * Next merges `openGraph` and `twitter` only when the current segment sets
 * them, and the title/description fallback only fills fields that are
 * missing. A root-layout `openGraph.title` (or `description`, or `url`)
 * therefore wins over every page that exports just `title`/`description`,
 * and each shared docs link gets the home page's card. Keep those fields off
 * the root so Next derives og/twitter title and description from each page's
 * resolved metadata, and keep `metadataBase` + `siteName` so the cards still
 * resolve absolute URLs and name the site.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const LAYOUT = join(import.meta.dirname, "../app/layout.tsx");
const PER_PAGE_FIELD = /^\s*(title|description|url)\s*:/m;

/** Body of the `<key>: {` block inside `export const metadata`, braces matched. */
function metadataBlock(source: string, key: string): string {
  const start = source.indexOf(`${key}: {`);
  if (start === -1) {
    throw new Error(`metadata.${key} not found in app/layout.tsx`);
  }
  let depth = 0;
  for (let i = source.indexOf("{", start); i < source.length; i += 1) {
    if (source[i] === "{") {
      depth += 1;
    } else if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }
  throw new Error(`metadata.${key} block is not closed`);
}

describe("root layout metadata", () => {
  const source = readFileSync(LAYOUT, "utf8");

  it("resolves social URLs against the production origin", () => {
    expect(source).toContain('metadataBase: new URL("https://keystoneui.io")');
    expect(metadataBlock(source, "openGraph")).toContain("siteName");
  });

  it("leaves Open Graph title, description and url to each page", () => {
    expect(metadataBlock(source, "openGraph")).not.toMatch(PER_PAGE_FIELD);
  });

  it("leaves Twitter title and description to each page", () => {
    expect(metadataBlock(source, "twitter")).not.toMatch(PER_PAGE_FIELD);
  });
});
