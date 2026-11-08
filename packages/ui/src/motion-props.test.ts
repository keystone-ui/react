// @vitest-environment node

/**
 * Transitions name the properties Tailwind v4 actually emits, and time
 * themselves from the motion tokens.
 *
 * In Tailwind v4 `scale-*`, `translate-*` and `rotate-*` set the standalone
 * `scale` / `translate` / `rotate` properties, not `transform`. A
 * `transition-[transform,…]` list therefore never animates them: Button's
 * press, the Checkbox/Radio indicators, the Slider thumb and SelectionBar's
 * rise all snapped while the code read as animated. `transition-transform`
 * is fine — v4 expands it to all four properties.
 *
 * Literal durations (`duration-150`, `duration-[160ms]`) drift from the
 * `--duration-*` scale; use `duration-(--duration-fast)` and friends.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SRC_DIR = import.meta.dirname;
const SOURCE_FILE = /\.tsx?$/;

const TRANSFORM_IN_LIST = /transition-\[[^\]]*\btransform\b[^\]]*\]/;
const LITERAL_DURATION = /\bduration-(?:\d+|\[\d+(?:\.\d+)?m?s\])(?![\w-])/;

function offendersOf(pattern: RegExp): string[] {
  const offenders: string[] = [];
  for (const file of readdirSync(SRC_DIR)) {
    if (
      !SOURCE_FILE.test(file) ||
      file.includes(".test.") ||
      file.includes(".stories.")
    ) {
      continue;
    }
    const lines = readFileSync(join(SRC_DIR, file), "utf-8").split("\n");
    lines.forEach((line, i) => {
      const match = pattern.exec(line);
      if (match) {
        offenders.push(`${file}:${i + 1} ${match[0]}`);
      }
    });
  }
  return offenders;
}

describe("motion properties", () => {
  it("the patterns catch what they claim to", () => {
    expect(TRANSFORM_IN_LIST.test("transition-[transform,opacity]")).toBe(true);
    expect(TRANSFORM_IN_LIST.test("transition-[opacity,transform]")).toBe(true);
    expect(TRANSFORM_IN_LIST.test("transition-[scale,opacity]")).toBe(false);
    expect(TRANSFORM_IN_LIST.test("transition-transform")).toBe(false);

    expect(LITERAL_DURATION.test("duration-150")).toBe(true);
    expect(LITERAL_DURATION.test("duration-[160ms]")).toBe(true);
    expect(LITERAL_DURATION.test("duration-(--duration-fast,125ms)")).toBe(
      false
    );
  });

  it("never lists `transform` in a transition-[…] property list", () => {
    expect(offendersOf(TRANSFORM_IN_LIST)).toEqual([]);
  });

  it("never hard-codes a transition duration", () => {
    expect(offendersOf(LITERAL_DURATION)).toEqual([]);
  });
});
