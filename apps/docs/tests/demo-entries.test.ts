/**
 * The demo manifest is derived from the files under `apps/docs/demos`, not
 * hand-maintained. This is the pure rule the generator applies:
 *
 *   <component>/<variant>.tsx   → key "<component>-<variant>"
 *   blocks/<name>.tsx           → key "block-<name>"
 *   blocks/<name>/index.tsx     → key "block-<name>"; sibling files are the
 *                                 block's own parts, not demos
 */

import { describe, expect, it } from "vitest";

import { demoEntriesFromPaths } from "../../../scripts/lib/demo-entries.mjs";

const DUPLICATE_KEY = /block-x/;

describe("demoEntriesFromPaths", () => {
  it("keys a component demo by directory and variant", () => {
    expect(demoEntriesFromPaths(["button/default.tsx"])).toEqual([
      { key: "button-default", file: "button/default.tsx" },
    ]);
  });

  it("keys single-file and directory blocks with the block- prefix", () => {
    expect(
      demoEntriesFromPaths([
        "blocks/signin-01.tsx",
        "blocks/admin-01/index.tsx",
        "blocks/admin-01/admin-sidebar.tsx",
        "blocks/admin-01/mock-admin.ts",
      ])
    ).toEqual([
      { key: "block-admin-01", file: "blocks/admin-01/index.tsx" },
      { key: "block-signin-01", file: "blocks/signin-01.tsx" },
    ]);
  });

  it("ignores non-TSX files and sorts by key for stable output", () => {
    expect(
      demoEntriesFromPaths([
        "tabs/variants.tsx",
        "accordion/default.tsx",
        "accordion/README.md",
        "tabs/default.tsx",
      ]).map((e) => e.key)
    ).toEqual(["accordion-default", "tabs-default", "tabs-variants"]);
  });

  it("rejects a key that two files would share", () => {
    expect(() =>
      demoEntriesFromPaths(["blocks/x.tsx", "blocks/x/index.tsx"])
    ).toThrow(DUPLICATE_KEY);
  });
});
