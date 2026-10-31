import { describe, expect, it } from "vitest";

import {
  changedFields,
  confirmsDeletion,
  otherSessions,
  validateProfile,
} from "@/demos/blocks/settings-01/settings-model";

const saved = { email: "ada@keystoneui.io", name: "Ada Lovelace" };

describe("validateProfile", () => {
  it("accepts a complete profile", () => {
    expect(validateProfile(saved)).toEqual({});
  });

  it("names each problem on its field", () => {
    expect(validateProfile({ email: "ada@", name: "  " })).toEqual({
      email: "Enter an email address like name@example.com.",
      name: "Enter your name.",
    });
  });
});

describe("changedFields", () => {
  it("finds edited fields", () => {
    expect(changedFields(saved, { ...saved, name: "Ada King" })).toEqual([
      "name",
    ]);
  });

  it("ignores whitespace the user cannot see, so Save stays disabled", () => {
    expect(changedFields(saved, { ...saved, name: "Ada Lovelace " })).toEqual(
      []
    );
  });
});

describe("confirmsDeletion", () => {
  it("requires the email typed back, case-insensitively", () => {
    expect(confirmsDeletion(saved.email, "ADA@keystoneui.io ")).toBe(true);
    expect(confirmsDeletion(saved.email, "ada@keystoneui")).toBe(false);
    expect(confirmsDeletion(saved.email, "")).toBe(false);
  });
});

describe("otherSessions", () => {
  it("keeps the current session out of 'sign out others'", () => {
    expect(
      otherSessions([
        { current: true, device: "a", id: "1", lastActive: "", location: "" },
        { current: false, device: "b", id: "2", lastActive: "", location: "" },
      ]).map((s) => s.id)
    ).toEqual(["2"]);
  });
});
