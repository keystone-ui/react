/**
 * A focus outline width never sits beside a bare `outline-none` in the docs
 * app's own routes and components.
 *
 * In Tailwind v4 `outline-none` (and `outline-hidden`) set
 * `--tw-outline-style: none`, and `focus-visible:outline-2` only sets the
 * width plus `outline-style: var(--tw-outline-style)`, so the pair computes
 * to no outline on keyboard focus. The theme builder's colour pickers had
 * exactly this. Drop the bare `outline-none` (Button's pattern) or name the
 * style in the same variant (`focus-visible:outline-solid`).
 *
 * Scanned per string literal: one class string is one element's classes.
 * `components/ui/` is vendored shadcn source kept close to upstream, so it
 * is exempt (as in `app-styling-conventions.test.ts`).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const DOCS_ROOT = join(import.meta.dirname, "..");
const SCAN_DIRS = ["app", "components"];
const VENDORED = /(^|\/)components\/ui\//;
const SOURCE_FILE = /\.tsx?$/;

// Bare, or under a variant that is also active while :focus-visible is.
const BARE_NONE =
  /(?<![\w:/-])(?:focus:|focus-visible:)?outline-(?:none|hidden)(?![\w-])/;
// A variant width: a number or an arbitrary length. Colours are not widths.
const VARIANT_WIDTH =
  /:outline-(?:\d+|\[(?:\d*\.?\d+(?:px|r?em)?|length:[^\]]+)\])(?![\w-])/;
// Only a style that also applies on keyboard focus overrides the variable.
const FOCUS_STYLE =
  /(?<![\w:/-])(?:focus:|focus-visible:)?outline-(?:solid|dashed|dotted|double)(?![\w-])/;
const STRING_LITERAL = /"([^"\n]*)"|`([^`]*)`|'([^'\n]*)'/g;

function hidesItsOwnOutline(classes: string): boolean {
  return (
    BARE_NONE.test(classes) &&
    VARIANT_WIDTH.test(classes) &&
    !FOCUS_STYLE.test(classes)
  );
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && SOURCE_FILE.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((file) => !VENDORED.test(relative(DOCS_ROOT, file)));
}

function offenders(): string[] {
  const found: string[] = [];
  for (const file of SCAN_DIRS.flatMap((d) =>
    sourceFiles(join(DOCS_ROOT, d))
  )) {
    const source = readFileSync(file, "utf-8");
    for (const match of source.matchAll(STRING_LITERAL)) {
      const classes = match[1] ?? match[2] ?? match[3] ?? "";
      if (hidesItsOwnOutline(classes)) {
        const line = source.slice(0, match.index).split("\n").length;
        found.push(`${relative(DOCS_ROOT, file)}:${line}`);
      }
    }
  }
  return found.sort();
}

describe("docs app focus outline", () => {
  it("the pattern catches what it claims to", () => {
    expect(hidesItsOwnOutline("outline-none focus-visible:outline-2")).toBe(
      true
    );
    expect(
      hidesItsOwnOutline("focus:outline-none focus-visible:outline-2")
    ).toBe(true);
    expect(
      hidesItsOwnOutline("outline-hidden focus-visible:outline-[3px]")
    ).toBe(true);
    // Button's pattern: no bare outline-none.
    expect(
      hidesItsOwnOutline(
        "focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2"
      )
    ).toBe(false);
    // The style is named on focus, so the variable is overridden.
    expect(
      hidesItsOwnOutline(
        "outline-none focus-visible:outline-solid focus-visible:outline-2"
      )
    ).toBe(false);
    // Offset and colour are not widths; ring-based focus is unaffected.
    expect(
      hidesItsOwnOutline("outline-none focus-visible:outline-offset-2")
    ).toBe(false);
    expect(hidesItsOwnOutline("outline-none focus-visible:ring-2")).toBe(false);
  });

  it("never pairs a bare outline-none with a variant outline width", () => {
    expect(offenders()).toEqual([]);
  });
});
