import { describe, expect, it } from "vitest";

import { searchTag } from "./search-tag";

describe("searchTag", () => {
  it("tags component and block pages by their section", () => {
    expect(searchTag(["components", "button"], undefined)).toBe("Components");
    expect(searchTag(["blocks", "signin-01"], "Reference")).toBe("Blocks");
  });

  it("tags other pages by their content type", () => {
    expect(searchTag(["concepts", "rtl"], "Conceptual")).toBe("Conceptual");
  });

  it("falls back to Docs for a page with no content type", () => {
    expect(searchTag(["theming"], undefined)).toBe("Docs");
    expect(searchTag([], undefined)).toBe("Docs");
  });
});
