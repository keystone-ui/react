/**
 * The pure half of scripts/smoke-install.mjs. The script itself runs the
 * shadcn CLI and tsc, which is too slow for this suite; it runs in CI as its
 * own step (`pnpm smoke:install`).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  componentsJson,
  expectedPackageFiles,
  FIXTURES,
  fixturesFor,
  installGroups,
  lostClientDirectives,
  misplacedUiFiles,
  PACKAGE_FIXTURES,
  PRODUCTION_REGISTRY,
  packageComponentsJson,
  packageFixtureDependencies,
  publishedManifest,
  rewriteRegistryBody,
  setupChanges,
  tsconfigJson,
} from "../../../scripts/lib/smoke-install.mjs";
import { importSpecifiers } from "./import-specifiers";
import { REPO_ROOT, readJson, readRegistry } from "./registry-paths";

const DIST_DECLARATION = /^\.\/dist\/.+\.d\.ts$/;
/** The fenced block the users-01 docs print, indented under a list item. */
const COMPONENTS_JSON_BLOCK = /```json title="components\.json"\n([\s\S]*?)```/;
const LIST_INDENT = /^ {2}/gm;

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

describe("package-flavour installs", () => {
  const registry = {
    items: [
      { name: "button", type: "registry:ui" },
      { name: "filter-pills", type: "registry:component" },
      { name: "users-01", type: "registry:block" },
      { name: "npm/filter-pills", type: "registry:component" },
      { name: "npm/users-01", type: "registry:block" },
    ],
  };

  it("install each npm/* item alone, into the package fixtures only", () => {
    const groups = installGroups(
      registry,
      registry.items.map((i) => i.name)
    );
    expect(
      groups.map((g) => `${g.flavour}:${g.label}:${g.items.join(",")}`)
    ).toEqual([
      "vendored:ui:button,filter-pills",
      "vendored:users-01:users-01",
      "package:npm-filter-pills:npm/filter-pills",
      "package:npm-users-01:npm/users-01",
    ]);
    expect(fixturesFor({ flavour: "package" }).map((f) => f.name)).toEqual(
      PACKAGE_FIXTURES.map((f) => f.name)
    );
    expect(fixturesFor({ flavour: "vendored" })).toBe(FIXTURES);
  });

  it("cover a Next app and a Vite app, with no ui directory", () => {
    expect(PACKAGE_FIXTURES.map((f) => f.name)).toEqual([
      "package-next",
      "package-vite",
    ]);
    for (const fixture of PACKAGE_FIXTURES) {
      expect(fixture.flavour).toBe("package");
    }
  });

  it("use the five-field components.json the docs print, with no ui alias", () => {
    const [next, vite] = PACKAGE_FIXTURES;
    expect(packageComponentsJson(vite)).toEqual({
      style: "new-york",
      tailwind: { css: "src/index.css", baseColor: "neutral" },
      aliases: { components: "@/components", utils: "@/lib/utils" },
    });
    expect(packageComponentsJson(next)).toEqual({
      style: "new-york",
      // Keeps client boundaries in a Next App Router app.
      rsc: true,
      tailwind: { css: "app/globals.css", baseColor: "neutral" },
      aliases: { components: "@/components", utils: "@/lib/utils" },
    });
  });

  it("expect the item's files flat in components/, and the page only in Next", () => {
    const item = {
      name: "npm/users-01",
      type: "registry:block",
      files: [
        {
          path: "registry/default/blocks/users-01/page.tsx",
          type: "registry:page",
          target: "app/users/page.tsx",
        },
        {
          path: "apps/docs/demos/blocks/admin-01/sort.ts",
          type: "registry:component",
        },
      ],
    };
    const [next, vite] = PACKAGE_FIXTURES;
    expect(expectedPackageFiles(item, next)).toEqual([
      "app/users/page.tsx",
      "components/sort.ts",
    ]);
    // shadcn writes a registry:page only into a Next app.
    expect(expectedPackageFiles(item, vite)).toEqual([
      "src/components/sort.ts",
    ]);
  });
});

describe("the package a package fixture installs", () => {
  const ui = readJson<Record<string, unknown>>(
    join(REPO_ROOT, "packages/ui/package.json")
  );
  const manifest = publishedManifest(ui) as {
    exports: Record<string, string | { types?: string }>;
    publishConfig?: unknown;
  };
  const typesOf = (subpath: string) => {
    const entry = manifest.exports[subpath];
    return typeof entry === "string" ? entry : entry?.types;
  };

  it("is the published manifest: exports point at dist, not src", () => {
    // The workspace `exports` map points at src; npm gets
    // `publishConfig.exports`. A consumer's types come from the latter.
    expect(typesOf("./button")).toBe("./dist/button.d.ts");
    expect(manifest.publishConfig).toBeUndefined();
  });

  it("resolves every subpath an npm/* item imports to a declaration file in dist", () => {
    const subpaths = new Set<string>();
    for (const item of readRegistry().items) {
      if (!item.name.startsWith("npm/")) {
        continue;
      }
      for (const file of item.files ?? []) {
        const code = readFileSync(join(REPO_ROOT, file.path), "utf-8");
        for (const spec of importSpecifiers(code)) {
          if (spec.startsWith("@keystoneui/react/")) {
            subpaths.add(`./${spec.slice("@keystoneui/react/".length)}`);
          }
        }
      }
    }
    expect(subpaths.size).toBeGreaterThan(0);
    const unresolved = [...subpaths]
      .sort()
      .filter((subpath) => !DIST_DECLARATION.test(typesOf(subpath) ?? ""));
    expect(unresolved).toEqual([]);
  });

  it("links react, its types and the item's own dependencies, nothing else", () => {
    expect(
      packageFixtureDependencies({ dependencies: ["lucide-react@^1", "zod"] })
    ).toEqual([
      "@types/react",
      "@types/react-dom",
      "lucide-react",
      "react",
      "react-dom",
      "zod",
    ]);
    expect(packageFixtureDependencies({})).toEqual([
      "@types/react",
      "@types/react-dom",
      "react",
      "react-dom",
    ]);
  });
});

describe("setupChanges", () => {
  const config = '{\n  "style": "new-york"\n}\n';
  const css = '@import "tailwindcss";\n';
  const unchanged = { css: [css, css], config: [config, config] } as const;

  it("is empty when the app's CSS and components.json are byte for byte as written", () => {
    expect(setupChanges(unchanged)).toEqual([]);
  });

  it("names each file that changed, however small the change", () => {
    const valueChange = config.replace("new-york", "default");
    const addedField = config.replace("\n}", ',\n  "rsc": false\n}');
    const whitespaceOnly = '{"style":"new-york"}\n';
    for (const after of [valueChange, addedField, whitespaceOnly]) {
      expect(setupChanges({ ...unchanged, config: [config, after] })).toEqual([
        "components.json",
      ]);
    }
    expect(
      setupChanges({ ...unchanged, css: [css, `${css}@theme {}\n`] })
    ).toEqual(["css"]);
  });
});

describe("lostClientDirectives", () => {
  it("names installed files whose source is a client module and that lost the directive", () => {
    expect(
      lostClientDirectives([
        {
          path: "components/a.tsx",
          source: '"use client";\n\nexport const a = 1;\n',
          installed: '"use client";\n\nexport const a = 1;\n',
        },
        {
          path: "components/b.tsx",
          source: "'use client'\nexport const b = 1;\n",
          installed: "export const b = 1;\n",
        },
        {
          path: "components/c.ts",
          source: "export const c = 1;\n",
          installed: "export const c = 1;\n",
        },
      ])
    ).toEqual(["components/b.tsx"]);
  });
});

describe("the components.json printed in the users-01 docs", () => {
  const mdx = readFileSync(
    join(REPO_ROOT, "apps/docs/content/docs/blocks/users-01.mdx"),
    "utf-8"
  );
  const block = mdx.match(COMPONENTS_JSON_BLOCK);
  const printed = JSON.parse(
    (block?.[1] ?? "").replace(LIST_INDENT, "")
  ) as Record<string, unknown>;
  const [next, vite] = PACKAGE_FIXTURES;

  it("is what the Next package fixture writes", () => {
    expect(printed).toEqual(packageComponentsJson(next));
  });

  it("is what the Vite fixture writes once rsc is dropped and css points at src/index.css", () => {
    const { rsc: _rsc, ...rest } = printed;
    expect({
      ...rest,
      tailwind: { ...(rest.tailwind as object), css: "src/index.css" },
    }).toEqual(packageComponentsJson(vite));
    expect(mdx).toContain("leave out `rsc`");
    expect(mdx).toContain("`src/index.css`");
  });
});
