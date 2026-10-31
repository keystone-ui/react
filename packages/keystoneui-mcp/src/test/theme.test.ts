import { describe, expect, it } from "vitest";

import {
  parseThemeCode,
  parseThemeParts,
  themeBuilderUrl,
  themeInstallCommand,
} from "../theme.js";

const CODE = "k1_slate_0.55_0.2_262.5_large_dm-sans";
const SITE = "https://keystoneui.io";

describe("theme codes", () => {
  it("reads the fields of a code", () => {
    expect(parseThemeCode(CODE)).toEqual({
      base: "slate",
      font: "dm-sans",
      primary: "oklch(0.55 0.2 262.5)",
      radius: "large",
    });
  });

  it.each([
    "k2_slate_0.55_0.2_262.5_large_inter",
    "k1_slate_0.55_0.2_large_inter",
    "k1_slate_abc_0.2_262.5_large_inter",
    "",
  ])("rejects %j", (code) => {
    expect(parseThemeCode(code)).toBeNull();
  });

  it("builds the shadcn install command, optionally partial", () => {
    expect(themeInstallCommand(CODE, SITE)).toBe(
      `npx shadcn@latest add ${SITE}/r/theme/${CODE}.json`
    );
    expect(themeInstallCommand(CODE, SITE, ["font"])).toBe(
      `npx shadcn@latest add ${SITE}/r/theme/${CODE}.json?only=font`
    );
  });

  it("links back to the builder with its URL state keys", () => {
    const url = new URL(themeBuilderUrl(CODE, SITE) ?? "");
    expect(url.pathname).toBe("/theme-builder");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      base: "slate",
      font: "dm-sans",
      primaryC: "0.2",
      primaryH: "262.5",
      primaryL: "0.55",
      radius: "large",
    });
  });

  it("keeps only the parts it knows", () => {
    expect(parseThemeParts("theme, font,colors")).toEqual(["theme", "font"]);
    expect(parseThemeParts(undefined)).toEqual([]);
  });
});
