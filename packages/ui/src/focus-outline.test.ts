// @vitest-environment node

/**
 * A focus outline width never sits beside a bare `outline-none`.
 *
 * In Tailwind v4 `outline-none` (and `outline-hidden`) set
 * `--tw-outline-style: none`, and `focus-visible:outline-2` only sets the
 * width plus `outline-style: var(--tw-outline-style)`. Together the outline
 * computes to `none`: TagRemove and the Toast close button showed no keyboard
 * focus at all while their class lists read like Button's. Drop the bare
 * `outline-none` (Button's pattern), or name the style in the same variant
 * (`focus-visible:outline-solid`).
 *
 * `focus:outline-none` breaks it the same way. Scanned per string literal: one class string is one element's classes.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SRC_DIR = import.meta.dirname;
const SOURCE_FILE = /\.tsx?$/;

// Bare, or under a variant that is also active while :focus-visible is.
const BARE_NONE =
  /(?<![\w:/-])(?:focus:|focus-visible:)?outline-(?:none|hidden)(?![\w-])/;
const VARIANT_WIDTH = /:outline-(?:\d+|\[[^\]]+\]|\([^)]+\))(?![\w-])/;
const VARIANT_STYLE = /:outline-(?:solid|dashed|dotted|double)(?![\w-])/;
const STRING_LITERAL = /"([^"\n]*)"|`([^`]*)`|'([^'\n]*)'/g;

function hidesItsOwnOutline(classes: string): boolean {
  return (
    BARE_NONE.test(classes) &&
    VARIANT_WIDTH.test(classes) &&
    !VARIANT_STYLE.test(classes)
  );
}

function offenders(): string[] {
  const found: string[] = [];
  for (const file of readdirSync(SRC_DIR)) {
    if (
      !SOURCE_FILE.test(file) ||
      file.includes(".test.") ||
      file.includes(".stories.")
    ) {
      continue;
    }
    const source = readFileSync(join(SRC_DIR, file), "utf-8");
    for (const match of source.matchAll(STRING_LITERAL)) {
      const classes = match[1] ?? match[2] ?? match[3] ?? "";
      if (hidesItsOwnOutline(classes)) {
        const line = source.slice(0, match.index).split("\n").length;
        found.push(`${file}:${line}`);
      }
    }
  }
  return found;
}

describe("focus outline", () => {
  it("the pattern catches what it claims to", () => {
    expect(hidesItsOwnOutline("outline-none focus-visible:outline-2 p-0")).toBe(
      true
    );
    expect(
      hidesItsOwnOutline("outline-hidden focus-visible:outline-[3px]")
    ).toBe(true);
    // Button's pattern: no bare outline-none.
    expect(
      hidesItsOwnOutline(
        "focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2"
      )
    ).toBe(false);
    // The style is named in the variant, so the variable is overridden.
    expect(
      hidesItsOwnOutline(
        "outline-none focus-visible:outline-solid focus-visible:outline-2"
      )
    ).toBe(false);
    // `focus:` is also active while focusing by keyboard.
    expect(
      hidesItsOwnOutline("focus:outline-none focus-visible:outline-2")
    ).toBe(true);
    // A variant that is not active on focus does not count.
    expect(
      hidesItsOwnOutline("data-open:outline-none focus-visible:outline-2")
    ).toBe(false);
    // Colour and offset are not widths.
    expect(
      hidesItsOwnOutline("outline-none focus-visible:outline-offset-2")
    ).toBe(false);
  });

  it("never pairs a bare outline-none with a variant outline width", () => {
    expect(offenders()).toEqual([]);
  });
});
