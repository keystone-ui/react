/**
 * `meta.keystoneui` on registry items: what the MCP server and CLI read to
 * describe kits and package flavours.
 *
 *   docs               a site-relative docs page, with an optional section
 *   flavourOf          the item this one is the package flavour of
 *   minPackageVersion  the lowest @keystoneui/react the flavour supports
 *   partOf             the blocks a kit was taken from
 *
 * The server reads only this data (no name prefix), so a package-flavour
 * item without `flavourOf` would silently be an ordinary item, and a kit
 * without it would get no docs pointer. The key must also survive the
 * build: consumers fetch the built files, not registry.json.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";
import {
  BUILD_OUTPUT_DIR,
  builtItemPath,
  REPO_ROOT,
  readJson,
  readRegistry,
} from "./registry-paths";

interface KeystoneMeta {
  docs?: unknown;
  flavourOf?: unknown;
  minPackageVersion?: unknown;
  partOf?: unknown;
}
interface ItemWithMeta {
  meta?: { keystoneui?: KeystoneMeta };
  name: string;
  type: string;
}

/** Kits: pieces taken from a block and installable on their own. */
const KITS = ["filter-pills", "sidebar"];
const PACKAGE_PREFIX = "npm/";
/** The docs pointer shape the server accepts. */
const DOCS_POINTER = /^(\/docs\/[a-z0-9/-]+)(?:#([a-z0-9-]+))?$/;
const HEADING = /^#{2,6}\s+(.+?)\s*$/gm;
const CONTENT_DIR = join(REPO_ROOT, "apps/docs/content/docs");
const ROUTE_GROUP = /^\(.+\)$/;
const NOT_SLUG = /[^a-z0-9 -]/g;
const DOCS_PREFIX = /^\/docs\//;

const items = readRegistry().items as unknown as ItemWithMeta[];
const byName = new Map(items.map((item) => [item.name, item]));
const described = items.filter(
  (item) => KITS.includes(item.name) || item.name.startsWith(PACKAGE_PREFIX)
);

/** A heading's anchor as the docs site renders it. */
function slug(heading: string): string {
  return heading
    .replaceAll("`", "")
    .toLowerCase()
    .replace(NOT_SLUG, "")
    .replaceAll(" ", "-");
}

/** The MDX file serving `/docs/<path>`, route groups included. */
function pageFile(path: string): string | null {
  const rest = path.replace(DOCS_PREFIX, "");
  const dirs = [
    CONTENT_DIR,
    ...readdirSync(CONTENT_DIR)
      .filter((entry) => ROUTE_GROUP.test(entry))
      .map((entry) => join(CONTENT_DIR, entry)),
  ];
  for (const dir of dirs) {
    for (const candidate of [`${rest}.mdx`, `${rest}/index.mdx`]) {
      const file = join(dir, candidate);
      if (existsSync(file)) {
        return file;
      }
    }
  }
  return null;
}

describe("meta.keystoneui in registry.json", () => {
  it("is on every kit and every package-flavour item", () => {
    expect(described.map((item) => item.name).sort()).toEqual(
      expect.arrayContaining(KITS)
    );
    for (const item of described) {
      expect(item.meta?.keystoneui, item.name).toBeTypeOf("object");
    }
  });

  it("names each package flavour's existing parent and records its documented minimum", () => {
    for (const item of items.filter((i) => i.name.startsWith(PACKAGE_PREFIX))) {
      const meta = item.meta?.keystoneui ?? {};
      const parent = item.name.slice(PACKAGE_PREFIX.length);
      expect(meta.flavourOf, item.name).toBe(parent);
      expect(byName.has(parent), `${item.name} parent`).toBe(true);
      expect(meta.minPackageVersion, item.name).toBe(
        item.name === "npm/users-01" ? "1.0.0-beta.11" : undefined
      );
    }
  });

  it("gives every item at most one package flavour", () => {
    const parents = items
      .map((item) => item.meta?.keystoneui?.flavourOf)
      .filter((parent) => parent !== undefined);
    expect(parents.length).toBeGreaterThan(0);
    expect(new Set(parents).size).toBe(parents.length);
  });

  it("names kits' blocks that exist", () => {
    for (const name of KITS) {
      const partOf = byName.get(name)?.meta?.keystoneui?.partOf;
      expect(Array.isArray(partOf), name).toBe(true);
      for (const block of partOf as string[]) {
        expect(byName.get(block)?.type, `${name} part of ${block}`).toBe(
          "registry:block"
        );
      }
    }
  });

  it("points at a docs page that has the named section", () => {
    for (const item of described) {
      const docs = item.meta?.keystoneui?.docs;
      expect(docs, item.name).toBeTypeOf("string");
      const match = DOCS_POINTER.exec(docs as string);
      expect(match, `${item.name}: ${String(docs)}`).not.toBeNull();
      const [, path, anchor] = match as RegExpExecArray;
      const file = pageFile(path);
      expect(file, `${item.name}: ${path}`).not.toBeNull();
      if (anchor) {
        const slugs = [
          ...readFileSync(file as string, "utf-8").matchAll(HEADING),
        ].map((m) => slug(m[1]));
        expect(slugs, `${item.name}: #${anchor}`).toContain(anchor);
      }
    }
  });
});

describe("meta.keystoneui in the built registry", () => {
  const built = readJson<{ items: ItemWithMeta[] }>(
    join(BUILD_OUTPUT_DIR, "registry.json")
  );

  it("is kept in the emitted index and in each item file", () => {
    for (const item of described) {
      const meta = item.meta?.keystoneui;
      expect(
        built.items.find((b) => b.name === item.name)?.meta?.keystoneui,
        `index: ${item.name}`
      ).toEqual(meta);
      expect(
        readJson<ItemWithMeta>(builtItemPath(item.name)).meta?.keystoneui,
        `item file: ${item.name}`
      ).toEqual(meta);
    }
  });
});
