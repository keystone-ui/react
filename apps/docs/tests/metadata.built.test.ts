/**
 * Every indexable page carries its own canonical URL and og:url. The root
 * layout deliberately sets neither (a root value would pin every page's
 * social card to the home page), so each page has to supply them. Read
 * straight off the prerendered HTML.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const APP_DIR = join(import.meta.dirname, "../.next/server/app");
const ORIGIN = "https://keystoneui.io";

const CANONICAL = /<link rel="canonical" href="([^"]+)"\/?>/;
const OG_URL = /<meta property="og:url" content="([^"]+)"\/?>/;

function html(file: string): string {
  return readFileSync(join(APP_DIR, file), "utf8");
}

const PAGES: [file: string, path: string][] = [
  ["docs/components/button.html", "/docs/components/button"],
  ["docs.html", "/docs"],
  ["gallery.html", "/gallery"],
  ["blocks.html", "/blocks"],
  ["changelog.html", "/changelog"],
  ["blog.html", "/blog"],
];

describe("canonical and og:url", () => {
  for (const [file, path] of PAGES) {
    it(`${path} points at itself`, () => {
      const page = html(file);
      expect(CANONICAL.exec(page)?.[1], "canonical").toBe(`${ORIGIN}${path}`);
      expect(OG_URL.exec(page)?.[1], "og:url").toBe(`${ORIGIN}${path}`);
    });
  }
});
