/**
 * registry.json <-> apps/docs/public/r/** parity.
 *
 * The built registry is committed to git, so it can silently drift from its
 * source. These tests fail when it does, in either direction.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  BUILD_OUTPUT_DIR,
  builtItemPath,
  listBuiltItemNames,
  REGISTRY_JSON,
  REPO_ROOT,
  type RegistryItem,
  readJson,
  readRegistry,
} from "./registry-paths";

const registry = readRegistry();
const builtNames = listBuiltItemNames();

const RELATIVE_UTILS_IMPORT = /from\s*["']\.\/utils["']/;
const ALIAS_UTILS_IMPORT =
  /import\s*\{([^}]*)\}\s*from\s*["']@\/lib\/utils["']/g;
const RELATIVE_SIBLING_IMPORT = /from\s*["']\.\/([a-z0-9-]+)["']/g;

const UI_ALIAS_IMPORT = /["']@\/components\/ui\/([a-z0-9-]+)["']/g;
const KEYSTONE_ADDRESS = /^https:\/\/keystoneui\.io\/r\/([a-z0-9-]+)\.json$/;
/** ui files a block ships itself rather than pulling from the registry. */
const BLOCK_LOCAL_UI = new Set<string>();

/** How an item names a Keystone sibling: its full registry URL. */
const keystoneAddress = (name: string) =>
  `https://keystoneui.io/r/${name}.json`;

describe("registry.json", () => {
  it("declares at least one item", () => {
    expect(registry.items.length).toBeGreaterThan(0);
  });

  it("has no duplicate item names", () => {
    const seen = new Map<string, number>();
    for (const item of registry.items) {
      seen.set(item.name, (seen.get(item.name) ?? 0) + 1);
    }
    const duplicates = [...seen.entries()].filter(([, n]) => n > 1);
    expect(duplicates).toEqual([]);
  });

  it("references only source files that exist on disk", () => {
    // `files[].path` is declared relative to the monorepo root.
    const missing: string[] = [];
    for (const item of registry.items) {
      for (const file of item.files ?? []) {
        if (!existsSync(join(REPO_ROOT, file.path))) {
          missing.push(`${item.name} -> ${file.path}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});

describe("built registry output", () => {
  it("has a built JSON file for every item declared in registry.json", () => {
    const missing = registry.items
      .map((item) => item.name)
      .filter((name) => !existsSync(builtItemPath(name)));

    expect(missing).toEqual([]);
  });

  it("has no orphan built files without a matching registry.json item", () => {
    const declared = new Set(registry.items.map((item) => item.name));
    const orphans = builtNames.filter((name) => !declared.has(name));

    expect(orphans).toEqual([]);
  });

  it("built one file per declared item and nothing more", () => {
    expect(builtNames.length).toBe(registry.items.length);
  });

  it("gives every built file a `name` matching its own path", () => {
    const mismatched: string[] = [];
    for (const name of builtNames) {
      const item = readJson<RegistryItem>(builtItemPath(name));
      if (item.name !== name) {
        mismatched.push(`${name}.json declares name "${item.name}"`);
      }
    }
    expect(mismatched).toEqual([]);
  });

  it("stamps every built file with the registry-item $schema", () => {
    const unstamped: string[] = [];
    for (const name of builtNames) {
      const item = readJson<Record<string, unknown>>(builtItemPath(name));
      if (item.$schema !== "https://ui.shadcn.com/schema/registry-item.json") {
        unstamped.push(name);
      }
    }
    expect(unstamped).toEqual([]);
  });

  it("ships a registry.json copy identical to the source", () => {
    const copy = `${BUILD_OUTPUT_DIR}/registry.json`;
    expect(existsSync(copy)).toBe(true);
    expect(readFileSync(copy, "utf-8")).toBe(
      readFileSync(REGISTRY_JSON, "utf-8")
    );
  });
});

/**
 * What a consumer actually receives.
 *
 * `shadcn build` embeds each source file verbatim, so the shipped content is
 * this repo's source -- including imports written for this repo's layout. Three
 * things went wrong there at once, all of them invisible to the parity tests
 * above and all of them verified against a real `shadcn add` install:
 *
 *  - `import { cn } from "./utils"` shipped in 55 items. shadcn leaves the
 *    specifier alone (it does not start with `@/`), so it resolved to a
 *    sibling that no item creates.
 *  - No `registry:ui` file declared a `target`, so shadcn derived one from the
 *    source path and wrote `components/ui/src/<name>.tsx`.
 *  - `date-input` and `input-group` imported siblings they did not declare as
 *    registry dependencies, so those files were never installed.
 */
describe("what a consumer installs", () => {
  const uiItems = registry.items.filter((item) => item.type === "registry:ui");

  it("has registry:ui items to check", () => {
    expect(uiItems.length).toBeGreaterThan(0);
  });

  // `@ui/` is shadcn's placeholder for the consumer's `aliases.ui`. A literal
  // `components/ui/` ignored a project whose ui alias points elsewhere —
  // scripts/smoke-install.mjs's custom-ui-alias fixture.
  it("targets the consumer's ui alias for every registry:ui file", () => {
    const untargeted: string[] = [];
    for (const item of uiItems) {
      for (const file of item.files ?? []) {
        if (file.target !== `@ui/${item.name}.tsx`) {
          untargeted.push(`${item.name}: ${file.target ?? "(no target)"}`);
        }
      }
    }

    expect(untargeted).toEqual([]);
  });

  it("ships no import of `./utils`, which resolves to nothing once installed", () => {
    const offenders: string[] = [];
    for (const name of builtNames) {
      const item = readJson<RegistryItem>(builtItemPath(name));
      for (const file of item.files ?? []) {
        if (RELATIVE_UTILS_IMPORT.test(file.content ?? "")) {
          offenders.push(name);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("imports nothing but `cn` from `@/lib/utils`", () => {
    // The rewrite above sends `./utils` to `@/lib/utils`, which is shadcn's own
    // file and contains `cn` and nothing else. A second symbol therefore ships
    // an import that resolves to nothing: a type error, and at runtime
    // `undefined` interpolated into whatever template used it. The `./utils`
    // check above cannot see this, because by then the specifier is correct --
    // it is the *symbol* that is wrong.
    const offenders: string[] = [];
    for (const name of builtNames) {
      const item = readJson<RegistryItem>(builtItemPath(name));
      for (const file of item.files ?? []) {
        for (const match of (file.content ?? "").matchAll(ALIAS_UTILS_IMPORT)) {
          const extra = match[1]
            .split(",")
            .map((symbol) => symbol.trim())
            .filter((symbol) => symbol && symbol !== "cn");
          if (extra.length > 0) {
            offenders.push(`${name}: ${extra.join(", ")}`);
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("declares every sibling component it imports as a registry dependency", () => {
    const undeclared: string[] = [];
    for (const name of builtNames) {
      const item = readJson<RegistryItem>(builtItemPath(name));
      if (item.type !== "registry:ui") {
        continue;
      }
      const declared = new Set(item.registryDependencies ?? []);
      for (const file of item.files ?? []) {
        for (const match of (file.content ?? "").matchAll(
          RELATIVE_SIBLING_IMPORT
        )) {
          const sibling = match[1];
          if (sibling !== "utils" && !declared.has(keystoneAddress(sibling))) {
            undeclared.push(`${name} imports ./${sibling}`);
          }
        }
      }
    }

    expect(undeclared).toEqual([]);
  });

  it("declares exactly the ui components each block imports", () => {
    // profile-dropdown-01 imported circular-progress without declaring it, so
    // a consumer's install did not typecheck; three blocks also declared
    // components they never used. Found by scripts/smoke-install.mjs.
    const drift: string[] = [];
    for (const item of registry.items) {
      if (item.type !== "registry:block") {
        continue;
      }
      const used = new Set<string>();
      for (const file of item.files ?? []) {
        const source = readFileSync(join(REPO_ROOT, file.path), "utf-8");
        for (const match of source.matchAll(UI_ALIAS_IMPORT)) {
          used.add(match[1]);
        }
      }
      const declared = new Set(
        (item.registryDependencies ?? [])
          .map((dep) => KEYSTONE_ADDRESS.exec(dep)?.[1])
          .filter((name): name is string => name !== undefined)
      );
      for (const name of used) {
        if (!(declared.has(name) || BLOCK_LOCAL_UI.has(name))) {
          drift.push(`${item.name} imports ${name} but does not declare it`);
        }
      }
      for (const name of declared) {
        if (
          !used.has(name) &&
          registry.items.some(
            (i) => i.name === name && i.type === "registry:ui"
          )
        ) {
          drift.push(`${item.name} declares ${name} but never imports it`);
        }
      }
    }
    expect(drift).toEqual([]);
  });

  it("never names a Keystone item as a bare registry dependency", () => {
    // A bare name is an address in shadcn's registry. `combobox` once
    // declared `"button"` and installed shadcn's Radix Button beside it.
    const bare: string[] = [];
    for (const name of builtNames) {
      const item = readJson<RegistryItem>(builtItemPath(name));
      for (const dep of item.registryDependencies ?? []) {
        if (builtNames.includes(dep)) {
          bare.push(`${name} -> ${dep}`);
        }
      }
    }
    expect(bare).toEqual([]);
  });
});
