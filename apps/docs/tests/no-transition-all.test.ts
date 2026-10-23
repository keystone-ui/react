/**
 * `transition-all` is banned in component source, demos and stories
 * (AGENTS.md: "No transition-all — always specify exact transition
 * properties"). Demos are also the registry-installable source consumers
 * copy, so a stray `transition-all` there ships to every project that
 * installs the example.
 *
 * Scope is the library source, the two example surfaces, and the docs app's
 * own routes and components. `apps/docs/components/ui/` is vendored shadcn
 * source kept close to upstream, so it is exempt.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const SCAN_DIRS = [
  "packages/ui/src",
  "apps/docs/demos",
  "apps/docs/app",
  "apps/docs/components",
  "apps/storybook/stories",
];
const VENDORED = /^apps\/docs\/components\/ui\//;
const SOURCE_FILE = /\.tsx?$/;
const TRANSITION_ALL = /\btransition-all\b/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && SOURCE_FILE.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((file) => !VENDORED.test(relative(ROOT, file)));
}

describe("no transition-all in library source, demos, stories or app", () => {
  const files = SCAN_DIRS.flatMap((dir) => sourceFiles(join(ROOT, dir)));

  it("scans a meaningful number of files", () => {
    expect(files.length).toBeGreaterThan(400);
  });

  it("finds no transition-all utility", () => {
    const offenders = files
      .filter((file) => TRANSITION_ALL.test(readFileSync(file, "utf-8")))
      .map((file) => relative(ROOT, file))
      .sort();
    expect(offenders).toEqual([]);
  });
});
