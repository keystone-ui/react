/**
 * The pure half of scripts/smoke-install.mjs. The script itself runs the
 * shadcn CLI and tsc, which is too slow for this suite; it runs in CI as its
 * own step (`pnpm smoke:install`).
 */

import { describe, expect, it } from "vitest";

import {
  componentsJson,
  FIXTURES,
  misplacedUiFiles,
  PRODUCTION_REGISTRY,
  rewriteRegistryBody,
  tsconfigJson,
} from "../../../scripts/lib/smoke-install.mjs";

describe("rewriteRegistryBody", () => {
  it("points every production registry address at the local server", () => {
    const body = JSON.stringify({
      registryDependencies: [
        `${PRODUCTION_REGISTRY}button.json`,
        `${PRODUCTION_REGISTRY}themes/zinc.json`,
        "sidebar",
      ],
    });
    const rewritten = JSON.parse(
      rewriteRegistryBody(body, "http://127.0.0.1:4000/")
    );
    expect(rewritten.registryDependencies).toEqual([
      "http://127.0.0.1:4000/button.json",
      "http://127.0.0.1:4000/themes/zinc.json",
      "sidebar",
    ]);
  });
});

describe("fixtures", () => {
  it("cover src/, root and a non-default ui alias", () => {
    expect(FIXTURES.map((f) => f.name)).toEqual([
      "vite-src",
      "next-root",
      "custom-ui-alias",
    ]);
  });

  it("map @/* to the fixture's source root", () => {
    const [viteSrc, nextRoot] = FIXTURES;
    expect(tsconfigJson(viteSrc).compilerOptions.paths["@/*"]).toEqual([
      "./src/*",
    ]);
    expect(tsconfigJson(nextRoot).compilerOptions.paths["@/*"]).toEqual([
      "./*",
    ]);
  });

  it("write the fixture's aliases into components.json", () => {
    const custom = FIXTURES.find((f) => f.name === "custom-ui-alias");
    expect(custom && componentsJson(custom).aliases.ui).toBe(
      "@/components/kit"
    );
  });
});

describe("misplacedUiFiles", () => {
  const custom = FIXTURES.find((f) => f.name === "custom-ui-alias");

  it("flags ui files that ignored the project's ui alias", () => {
    expect(
      custom &&
        misplacedUiFiles(
          ["src/components/ui/button.tsx", "src/components/kit/card.tsx"],
          custom
        )
    ).toEqual(["src/components/ui/button.tsx"]);
  });

  it("ignores block components and other files", () => {
    expect(
      custom &&
        misplacedUiFiles(
          ["src/components/signin-form.tsx", "src/lib/utils.ts"],
          custom
        )
    ).toEqual([]);
  });
});
