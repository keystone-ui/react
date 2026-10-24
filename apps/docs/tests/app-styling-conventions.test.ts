/**
 * The docs app follows the library's styling rules (AGENTS.md): status
 * tones come from semantic tokens, never from the raw Tailwind palette and
 * never with a `dark:` override, and every `sticky` is paired with
 * `print:static` so a printed page does not pin a sidebar over the content.
 *
 * Scope: app routes and shared components. `components/ui/` is vendored
 * shadcn source kept close to upstream, so it is exempt.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const DOCS_ROOT = join(import.meta.dirname, "..");
const SCAN_DIRS = ["app", "components"];
const VENDORED = /(^|\/)components\/ui\//;
const SOURCE_FILE = /\.tsx?$/;

const HUES =
  "emerald|green|amber|red|yellow|blue|gray|zinc|slate|neutral|stone|orange|lime|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose";
const RAW_PALETTE = new RegExp(
  `(?:^|[\\s"'\`])(?:[\\w-]+:)*(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|shadow)-(?:${HUES})-\\d{2,3}(?:/\\d+)?(?=$|[\\s"'\`])`,
  "g"
);
const STICKY = /\bsticky\b/;
const PRINT_STATIC = /\bprint:static\b/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && SOURCE_FILE.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((file) => !VENDORED.test(relative(DOCS_ROOT, file)));
}

const files = SCAN_DIRS.flatMap((dir) => sourceFiles(join(DOCS_ROOT, dir)));

describe("docs app styling conventions", () => {
  it("scans the app and shared components", () => {
    expect(files.length).toBeGreaterThan(40);
  });

  it("uses semantic tokens, not raw palette colours", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, "utf-8").split("\n");
      lines.forEach((line, index) => {
        const matches = line.match(RAW_PALETTE);
        if (matches) {
          offenders.push(
            `${relative(DOCS_ROOT, file)}:${index + 1} ${matches.map((m) => m.trim()).join(" ")}`
          );
        }
      });
    }
    expect(offenders).toEqual([]);
  });

  it("pairs every sticky element with print:static", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, "utf-8").split("\n");
      lines.forEach((line, index) => {
        if (STICKY.test(line) && !PRINT_STATIC.test(line)) {
          offenders.push(`${relative(DOCS_ROOT, file)}:${index + 1}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});
