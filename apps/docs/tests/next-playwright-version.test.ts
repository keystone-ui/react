/**
 * @next/playwright is versioned in lockstep with next and talks to the
 * router's testing API, so a mismatch is a silent way to test the wrong
 * behaviour. Bump both together.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const LEADING_RANGE = /^[\^~]/;

const pkg = JSON.parse(
  readFileSync(join(import.meta.dirname, "../package.json"), "utf8")
) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

describe("@next/playwright", () => {
  it("is pinned to the same version as next", () => {
    const next = pkg.dependencies.next.replace(LEADING_RANGE, "");
    expect(pkg.devDependencies["@next/playwright"]).toBe(next);
  });
});
