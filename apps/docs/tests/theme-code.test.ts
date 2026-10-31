/**
 * Theme-builder codes and the `/r/theme/<code>.json` route that serves them
 * as shadcn `registry:theme` items. A code is the whole theme, so the route
 * computes the item rather than reading it — nothing here touches the
 * filesystem, which is what lets it run on the Worker.
 */

import { registryItemSchema } from "shadcn/schema";
import { describe, expect, it } from "vitest";
import { fontIds, radiusIds } from "@/app/(home)/theme-builder/constants";
import { baseColorIds } from "@/app/(home)/theme-builder/theme-data";
import {
  decodeThemeCode,
  encodeThemeCode,
  type ThemeSettings,
} from "@/app/(home)/theme-builder/utils/theme-code";
import { GET } from "@/app/r/theme/[code]/route";
import { parseThemeCode } from "../../../packages/keystoneui-mcp/src/theme";

const DEFAULT: ThemeSettings = {
  base: "zinc",
  font: "geist",
  primaryC: 0.006,
  primaryH: 285.885,
  primaryL: 0.21,
  radius: "default",
};

function call(path: string): Promise<Response> {
  const url = new URL(`http://localhost/r/theme/${path}`);
  const code = url.pathname.split("/").pop() ?? "";
  return GET(new Request(url), { params: Promise.resolve({ code }) });
}

describe("theme codes", () => {
  it("encodes to a readable, versioned code", () => {
    expect(encodeThemeCode(DEFAULT)).toBe(
      "k1_zinc_0.21_0.006_285.885_default_geist"
    );
  });

  it("round-trips", () => {
    const custom: ThemeSettings = {
      ...DEFAULT,
      base: "slate",
      font: "dm-sans",
      primaryC: 0.2,
      primaryH: 262.5,
      primaryL: 0.55,
      radius: "large",
    };
    expect(decodeThemeCode(encodeThemeCode(custom))).toEqual(custom);
  });

  it("trims colour-picker float noise", () => {
    expect(
      encodeThemeCode({ ...DEFAULT, primaryL: 0.210_000_000_1 })
    ).toContain("_0.21_");
  });

  it.each([
    ["wrong version", "k2_zinc_0.21_0.006_285.885_default_geist"],
    ["unknown base", "k1_purple_0.21_0.006_285.885_default_geist"],
    ["unknown font", "k1_zinc_0.21_0.006_285.885_default_comic"],
    ["unknown radius", "k1_zinc_0.21_0.006_285.885_huge_geist"],
    ["lightness out of range", "k1_zinc_1.5_0.006_285.885_default_geist"],
    ["not a number", "k1_zinc_abc_0.006_285.885_default_geist"],
    ["exponent notation", "k1_zinc_1e-1_0.006_285.885_default_geist"],
    ["too few fields", "k1_zinc_0.21"],
  ])("rejects %s", (_, code) => {
    expect(decodeThemeCode(code)).toBeNull();
  });
});

describe("the keystoneui CLI", () => {
  // `keystoneui theme <code>` checks a code's shape on its own, so it never
  // has to ship the site's theme data. Every code the builder can produce
  // must pass that check.
  it("accepts every code the builder can produce", () => {
    const rejected: string[] = [];
    for (const base of baseColorIds) {
      for (const radius of radiusIds) {
        for (const font of fontIds) {
          const code = encodeThemeCode({ ...DEFAULT, base, font, radius });
          if (!parseThemeCode(code)) {
            rejected.push(code);
          }
        }
      }
    }
    expect(rejected).toEqual([]);
  });
});

describe("GET /r/theme/[code]", () => {
  it("serves a schema-valid registry:theme item", async () => {
    const res = await call("k1_slate_0.55_0.2_262.5_large_inter.json");
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toContain("immutable");
    const item = await res.json();
    expect(registryItemSchema.safeParse(item).success).toBe(true);
    expect(item.type).toBe("registry:theme");
    expect(item.cssVars.light.primary).toBe("oklch(0.55 0.2 262.5)");
    expect(item.cssVars.light.radius).toBe("0.875rem");
    expect(item.cssVars.light["font-sans"]).toContain("Inter");
    // Registry items name variables without the leading dashes.
    expect(Object.keys(item.cssVars.light).some((k) => k.startsWith("-"))).toBe(
      false
    );
    expect(item.cssVars.dark.primary).toBeDefined();
  });

  it("applies only the theme or only the font", async () => {
    const theme = await (
      await call("k1_zinc_0.21_0.006_285.885_default_geist.json?only=theme")
    ).json();
    expect(theme.cssVars.light["font-sans"]).toBeUndefined();
    expect(theme.cssVars.light.primary).toBeDefined();

    const font = await (
      await call("k1_zinc_0.21_0.006_285.885_default_geist.json?only=font")
    ).json();
    expect(Object.keys(font.cssVars.light)).toEqual(["font-sans"]);
    expect(font.cssVars.dark).toEqual({});
  });

  it("answers 404 for a malformed code", async () => {
    const res = await call("k1_purple_0.21_0.006_285.885_default_geist.json");
    expect(res.status).toBe(404);
  });
});
