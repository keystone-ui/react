/**
 * The /blocks gallery shows one card per block page. `npm/users-01` is the
 * package flavour of `users-01`, documented on users-01's own page; a card
 * for it would link to /docs/blocks/npm/users-01, which does not exist.
 */

import { describe, expect, it } from "vitest";

import { galleryBlocks } from "@/lib/gallery-blocks";
import registry from "../public/r/registry.json";

describe("galleryBlocks", () => {
  const names = galleryBlocks(registry.items).map((item) => item.name);

  it("lists the blocks with a docs page", () => {
    expect(names).toContain("users-01");
    expect(names).toContain("admin-01");
  });

  it("leaves out package-flavour items and anything that is not a block", () => {
    expect(names.filter((name) => name.includes("/"))).toEqual([]);
    expect(names).not.toContain("filter-pills");
    expect(registry.items.some((item) => item.name === "npm/users-01")).toBe(
      true
    );
  });
});
