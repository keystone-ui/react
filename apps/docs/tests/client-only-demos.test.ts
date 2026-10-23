/**
 * Demos whose rendering reads the clock cannot be part of a prerendered
 * shell: react-day-picker computes "today" during render, and under Cache
 * Components Next fails the build on `new Date()` in a server-rendered
 * Client Component. Those demos render behind a Suspense boundary instead,
 * so the fallback prerenders and the real UI appears on hydration.
 *
 * The rule is by component prefix; this test checks it against what the
 * demo sources actually import, so a new calendar-based demo cannot slip
 * past it.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { demoFiles } from "../demos/files";
import { isClientOnlyDemo } from "../lib/client-only-demos";

const DEMOS_DIR = join(import.meta.dirname, "..", "demos");
const CLOCK_READING_IMPORTS =
  /@keystoneui\/react\/(calendar|date-input)|react-day-picker/;

describe("isClientOnlyDemo", () => {
  const clockReaders = Object.entries(demoFiles)
    .filter(([, file]) =>
      CLOCK_READING_IMPORTS.test(readFileSync(join(DEMOS_DIR, file), "utf-8"))
    )
    .map(([key]) => key);

  it("covers every demo that renders a calendar or date input", () => {
    expect(clockReaders.length).toBeGreaterThan(10);
    expect(clockReaders.filter((key) => !isClientOnlyDemo(key))).toEqual([]);
  });

  it("leaves ordinary demos server-rendered", () => {
    expect(isClientOnlyDemo("button-default")).toBe(false);
    expect(isClientOnlyDemo("block-signin-01")).toBe(false);
  });
});
