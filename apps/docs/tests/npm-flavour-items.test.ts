/**
 * The package flavour of an item: `npm/<name>`, for apps that use the
 * `@keystoneui/react` package instead of vendored components.
 *
 * The vendored item of the same name imports `@/components/ui/<x>` and pulls
 * those components in as registry dependencies. Its package flavour ships the
 * demo sources verbatim, which import `@keystoneui/react/<x>` and their
 * siblings as `./<x>`, so an app on the package gets the block without a
 * second copy of the components beside the package.
 *
 * Every file lands flat in the consumer's components directory, so a
 * relative import the item does not ship resolves to nothing; and a
 * `@keystoneui/react` dependency would make shadcn run `npm install
 * @keystoneui/react`, which resolves the `latest` dist-tag (a stale beta, see
 * install-dist-tag.test.ts) and can move the consumer's version.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";
import { importSpecifiers } from "./import-specifiers";
import {
  builtItemPath,
  REPO_ROOT,
  type RegistryItem,
  readJson,
  readRegistry,
} from "./registry-paths";

/** The only package-flavour items, deliberately. Widening is a decision. */
const PACKAGE_ITEMS = ["npm/filter-pills", "npm/sidebar", "npm/users-01"];
const PACKAGE_PREFIX = "npm/";
/**
 * What each item says about the package version. users-01 needs beta.11
 * (Stepper's `animateHeight`); filter-pills and sidebar were only tested
 * with it.
 */
const VERSION_STATEMENT: Record<string, string> = {
  "npm/filter-pills": "Tested with `@keystoneui/react` 1.0.0-beta.11.",
  "npm/sidebar": "Tested with `@keystoneui/react` 1.0.0-beta.11.",
  "npm/users-01": "Needs `@keystoneui/react` 1.0.0-beta.11 or later.",
};

const DEMO_DIR = "apps/docs/demos/blocks/admin-01/";
const TS_EXT = /\.tsx?$/;
/** "recharts@^3" -> "recharts". */
const VERSION_RANGE = /(?<=.)@.*$/;
const PACKAGE_TITLE = /\(package\)$/;

const registry = readRegistry();
const packageItems = registry.items.filter((item) =>
  item.name.startsWith(PACKAGE_PREFIX)
);
const byName = (name: string) =>
  registry.items.find((item) => item.name === name);

const basename = (path: string) => path.split("/").pop() ?? path;
const source = (path: string) => readFileSync(join(REPO_ROOT, path), "utf-8");
/** The file a specifier names in the consumer's components directory, if any. */
const localFile = (spec: string): string | null => {
  if (spec.startsWith("./")) {
    return spec.slice(2);
  }
  if (spec.startsWith("@/components/")) {
    return spec.slice("@/components/".length);
  }
  return null;
};
const specifiers = importSpecifiers;

describe("package-flavour items", () => {
  it("are exactly npm/filter-pills, npm/sidebar and npm/users-01", () => {
    expect(packageItems.map((item) => item.name).sort()).toEqual(PACKAGE_ITEMS);
  });

  it("have the type of the vendored item they mirror", () => {
    for (const item of packageItems) {
      const vendored = byName(item.name.slice(PACKAGE_PREFIX.length));
      expect(item.type, item.name).toBe(vendored?.type);
    }
  });

  it("ship no vendored component or utils import", () => {
    const offenders: string[] = [];
    for (const item of packageItems) {
      for (const file of item.files ?? []) {
        const code = source(file.path);
        if (code.includes("@/components/ui/") || code.includes("@/lib/utils")) {
          offenders.push(`${item.name}: ${file.path}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("never depend on @keystoneui/react, and pull no registry items", () => {
    for (const item of packageItems) {
      const deps = (item.dependencies ?? []).map((dep) =>
        dep.replace(VERSION_RANGE, "")
      );
      expect(deps, item.name).not.toContain("@keystoneui/react");
      expect(item.registryDependencies ?? [], item.name).toEqual([]);
    }
  });

  it("ship the demo sources themselves, not copies", () => {
    const elsewhere = packageItems.flatMap((item) =>
      (item.files ?? [])
        .filter((file) => file.type !== "registry:page")
        .filter((file) => !file.path.startsWith(DEMO_DIR))
        .map((file) => `${item.name}: ${file.path}`)
    );
    expect(elsewhere).toEqual([]);
  });

  it("ship every file their files import", () => {
    // A relative `./x` or an aliased `@/components/x` both resolve to a file
    // in the consumer's components directory, so either must be shipped.
    const missing: string[] = [];
    for (const item of packageItems) {
      const shipped = new Set(
        (item.files ?? []).map((file) =>
          basename(file.path).replace(TS_EXT, "")
        )
      );
      for (const file of item.files ?? []) {
        for (const spec of specifiers(source(file.path))) {
          const local = localFile(spec);
          if (local !== null && !shipped.has(local)) {
            missing.push(`${item.name}: ${file.path} imports ${spec}`);
          }
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("import only the package, react, their siblings and their declared dependencies", () => {
    const stray: string[] = [];
    for (const item of packageItems) {
      const allowed = (item.dependencies ?? []).map((dep) =>
        dep.replace(VERSION_RANGE, "")
      );
      // A declared dependency, or a subpath of one
      // (`@base-ui/react/merge-props` under `@base-ui/react`).
      const declared = (spec: string) =>
        allowed.some((dep) => spec === dep || spec.startsWith(`${dep}/`));
      for (const file of item.files ?? []) {
        for (const spec of specifiers(source(file.path))) {
          const ok =
            spec.startsWith("./") ||
            spec.startsWith("@/components/") ||
            spec.startsWith("@keystoneui/react/") ||
            spec === "react" ||
            declared(spec);
          if (!ok) {
            stray.push(`${item.name}: ${file.path} imports ${spec}`);
          }
        }
      }
    }
    expect(stray).toEqual([]);
  });

  it("install the same file names as the vendored item of the same name", () => {
    for (const item of packageItems) {
      const vendored = byName(item.name.slice(PACKAGE_PREFIX.length));
      const names = (i?: RegistryItem) =>
        (i?.files ?? []).map((file) => basename(file.path)).sort();
      expect(names(item), item.name).toEqual(names(vendored));
      const pages = (i?: RegistryItem) =>
        (i?.files ?? [])
          .filter((file) => file.type === "registry:page")
          .map((file) => `${file.path} -> ${file.target}`);
      expect(pages(item), item.name).toEqual(pages(vendored));
    }
  });

  it("say who they are for and the package version they need", () => {
    for (const item of packageItems) {
      expect(item.title, item.name).toMatch(PACKAGE_TITLE);
      expect(item.description, item.name).toContain(
        "for apps that use the `@keystoneui/react` package"
      );
      expect(item.description, item.name).toContain(
        VERSION_STATEMENT[item.name]
      );
    }
  });
});

describe("built package-flavour items", () => {
  it("embed every source file byte for byte", () => {
    // Nothing between the source and the consumer may rewrite these files:
    // not `shadcn build`, and not fix-registry-imports.mjs, whose `./utils`
    // rewrite is for vendored ui items.
    const changed: string[] = [];
    for (const name of PACKAGE_ITEMS) {
      const built = readJson<RegistryItem>(builtItemPath(name));
      expect(built.files?.length, name).toBe(byName(name)?.files?.length);
      for (const file of built.files ?? []) {
        if (file.content !== source(file.path)) {
          changed.push(`${name}: ${file.path}`);
        }
      }
    }
    expect(changed).toEqual([]);
  });
});
