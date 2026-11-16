/**
 * `sidebar` is admin-01's sidebar on its own: one file, the same file
 * admin-01 ships, the way `filter-pills` and `users-01` are built from
 * admin-01's files rather than from copies of them. One source means a fix
 * to the sidebar reaches both items, and an app that installs both writes
 * the same bytes to the same path.
 *
 * Its declarations are derived from what the file imports, so a new import
 * cannot ship without the item asking for it, and an unused declaration
 * cannot install a component nobody reads.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { importSpecifiers } from "./import-specifiers";
import { REPO_ROOT, readRegistry } from "./registry-paths";

const SIDEBAR_PATH = "registry/default/blocks/admin-01/components/sidebar.tsx";
const UI_PREFIX = "@/components/ui/";

const registry = readRegistry();
const item = (name: string) => registry.items.find((i) => i.name === name);

const specifiers = importSpecifiers(
  readFileSync(join(REPO_ROOT, SIDEBAR_PATH), "utf-8")
);

/** "@base-ui/react/merge-props" -> "@base-ui/react"; "lucide-react" -> itself. */
function packageName(spec: string): string {
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

/** npm packages the file imports, other than React (a peer of every app). */
const importedPackages = [
  ...new Set(
    specifiers
      .filter((spec) => !(spec.startsWith("@/") || spec.startsWith(".")))
      .map(packageName)
      .filter((name) => name !== "react")
  ),
].sort();

/** Keystone ui components the file imports, as their registry URLs. */
const importedComponents = [
  ...new Set(
    specifiers
      .filter((spec) => spec.startsWith(UI_PREFIX))
      .map(
        (spec) => `https://keystoneui.io/r/${spec.slice(UI_PREFIX.length)}.json`
      )
  ),
].sort();

describe("sidebar", () => {
  it("is a navigation component, not a block", () => {
    const sidebar = item("sidebar");
    expect(sidebar?.type).toBe("registry:component");
    expect(sidebar?.categories).toEqual(["navigation"]);
  });

  it("ships exactly the one file admin-01 ships, at the same path", () => {
    const files = item("sidebar")?.files ?? [];
    expect(files.map((file) => [file.path, file.type, file.target])).toEqual([
      [SIDEBAR_PATH, "registry:component", undefined],
    ]);
    expect((item("admin-01")?.files ?? []).map((file) => file.path)).toContain(
      SIDEBAR_PATH
    );
  });

  it("declares exactly the npm packages the file imports", () => {
    expect(importedPackages.length).toBeGreaterThan(0);
    expect([...(item("sidebar")?.dependencies ?? [])].sort()).toEqual(
      importedPackages
    );
  });

  it("declares exactly the Keystone components the file imports", () => {
    expect(importedComponents.length).toBeGreaterThan(0);
    expect([...(item("sidebar")?.registryDependencies ?? [])].sort()).toEqual(
      importedComponents
    );
  });

  it("says it needs the --sidebar-* tokens and how to install it", () => {
    const description = item("sidebar")?.description ?? "";
    expect(description).toContain("--sidebar-*");
    expect(description).toContain("https://keystoneui.io/r/sidebar.json");
  });
});
