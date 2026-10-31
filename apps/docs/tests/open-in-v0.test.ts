import { describe, expect, it } from "vitest";

import { openInV0Href } from "@/lib/open-in-v0";

describe("openInV0Href", () => {
  it("opens the production registry item in v0 by default", () => {
    expect(openInV0Href("button", {})).toBe(
      `https://v0.dev/chat/api/open?url=${encodeURIComponent("https://keystoneui.io/r/button.json")}`
    );
  });

  it("points a preview deploy at its own registry", () => {
    const href = openInV0Href("signin-01", {
      appUrl: "https://pr-12.keystoneui.workers.dev",
    });
    expect(decodeURIComponent(href ?? "")).toContain(
      "https://pr-12.keystoneui.workers.dev/r/signin-01.json"
    );
  });

  it("can be switched off", () => {
    expect(openInV0Href("button", { v0Url: "" })).toBeUndefined();
  });
});
