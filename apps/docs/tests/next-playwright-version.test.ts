/**
 * @next/playwright is versioned in lockstep with next and talks to the
 * router's testing API, so a mismatch is a silent way to test the wrong
 * behaviour. Compare what is installed, not what package.json declares: a
 * lockfile refresh can move `next` within its range while the pin on
 * `@next/playwright` stays put.
 */
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

function installedVersion(pkg: string): string {
  return (require(`${pkg}/package.json`) as { version: string }).version;
}

describe("@next/playwright", () => {
  it("is installed at the same version as next", () => {
    expect(installedVersion("@next/playwright")).toBe(installedVersion("next"));
  });
});
