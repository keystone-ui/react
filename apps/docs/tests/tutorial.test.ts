/**
 * A tutorial promises that the code the reader types compiles. The page shows
 * each step's code from a demo file (`<ComponentSource>` / `<ComponentPreview>`),
 * and the docs build type-checks the demos, so the promise holds only while
 * every name on the page resolves to a demo. A typo would render a red "demo
 * not found" box on the page instead of failing CI.
 *
 * The `@beta` dist-tag on install commands is guarded for every docs page,
 * this one included, by install-dist-tag.test.ts.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const DOCS_DIR = join(import.meta.dirname, "..");
const TUTORIALS_DIR = join(
  DOCS_DIR,
  "content/docs/(getting-started)/tutorials"
);
const TUTORIAL_DEMOS_DIR = join(DOCS_DIR, "demos/tutorial");
const MANIFEST: Record<string, string> = JSON.parse(
  readFileSync(join(DOCS_DIR, "demos/manifest.json"), "utf8")
);

const DEMO_TAG_RE =
  /<(?:ComponentPreview|ComponentSource)\s[^>]*?name="([^"]+)"/g;
const TSX_FENCE_RE = /^```tsx([^\n]*)\n([\s\S]*?)^```$/gm;
const TITLE_RE = /title="([^"]+)"/;
/** Files outside `app/page.tsx` that a step edits in place; no demo holds them. */
const UNBACKED_FILES = new Set(["app/layout.tsx"]);

const pages = readdirSync(TUTORIALS_DIR)
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => ({
    file,
    source: readFileSync(join(TUTORIALS_DIR, file), "utf8"),
  }));

function demoNames(source: string): string[] {
  return [...source.matchAll(DEMO_TAG_RE)].map((match) => match[1]);
}

describe("tutorial pages", () => {
  it("exist", () => {
    expect(pages.map((page) => page.file)).toContain(
      "build-a-settings-screen.mdx"
    );
  });

  for (const { file, source } of pages) {
    describe(file, () => {
      const names = demoNames(source);

      it("show their code from demos", () => {
        // An empty list would let the next assertion pass vacuously.
        expect(names.length).toBeGreaterThan(0);
      });

      it("name only demos that exist in demos/manifest.json", () => {
        expect(names.filter((name) => !Object.hasOwn(MANIFEST, name))).toEqual(
          []
        );
      });

      it("type no tsx by hand that a demo does not contain", () => {
        const demoSource = readdirSync(TUTORIAL_DEMOS_DIR)
          .map((demo) => readFileSync(join(TUTORIAL_DEMOS_DIR, demo), "utf8"))
          .join("\n");
        const stray = [...source.matchAll(TSX_FENCE_RE)]
          .filter(([, meta]) => {
            const title = meta.match(TITLE_RE)?.[1];
            return !(title && UNBACKED_FILES.has(title));
          })
          .flatMap(([, , body]) => body.split("\n"))
          .map((line) => line.trim())
          .filter((line) => line && !demoSource.includes(line));
        expect(stray).toEqual([]);
      });
    });
  }

  it("leave no tutorial demo unused", () => {
    const used = new Set(pages.flatMap((page) => demoNames(page.source)));
    const unused = Object.entries(MANIFEST)
      .filter(([, path]) => path.startsWith("tutorial/"))
      .map(([key]) => key)
      .filter((key) => !used.has(key));
    expect(unused).toEqual([]);
  });
});
