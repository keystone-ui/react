// @vitest-environment node

/**
 * Every published subpath must actually be built.
 *
 * `exports` points at `./src/*.tsx` so the monorepo resolves components from
 * source, and `publishConfig.exports` swaps each one to `./dist/*.js` at
 * publish time. Nothing in the repo consumes the dist paths, so a subpath that
 * is exported but absent from `tsup.config.ts` resolves fine in every app here
 * and fails only for an npm consumer -- which is how `./stat`,
 * `./table-pagination` and `./copy-button` shipped pointing at files that were
 * never emitted.
 *
 * `scripts/add-component.mjs` wires exports, tsup and `_registry.ts` together,
 * so this only goes wrong for a component added by hand.
 *
 * Runs in the node environment: importing `tsup.config.ts` pulls in esbuild,
 * which refuses to load under jsdom.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import tsupConfig from "../tsup.config";

const PKG_DIR = join(import.meta.dirname, "..");

const DIST_PREFIX = /^\.\/dist\//;
const JS_SUFFIX = /\.js$/;
const SRC_PREFIX = /^src\//;
const TS_SUFFIX = /\.tsx?$/;
const LEADING_DOT_SLASH = /^\.\//;

/** A built entry, as `publishConfig.exports` spells it. */
interface BuiltTarget {
  default: string;
  types: string;
}

/**
 * A published subpath is either a built entry or a raw asset copied from
 * `src/` -- `./base.css` is the only one of the latter, and it ships because
 * `files` includes `src`.
 */
type PublishedTarget = string | BuiltTarget;

interface Pkg {
  exports: Record<string, string>;
  files: string[];
  publishConfig?: { exports?: Record<string, PublishedTarget> };
}

function pkg(): Pkg {
  return JSON.parse(readFileSync(join(PKG_DIR, "package.json"), "utf-8"));
}

/** The `entryPoints` array, resolved through tsup's function form. */
function entryPoints(): string[] {
  const resolved =
    typeof tsupConfig === "function"
      ? (
          tsupConfig as (o: Record<string, unknown>) => {
            entryPoints?: string[];
          }
        )({})
      : (tsupConfig as { entryPoints?: string[] });
  const entries = resolved.entryPoints;
  if (!entries) {
    throw new Error("tsup.config.ts declares no entryPoints");
  }
  return entries;
}

/** `./dist/button.js` -> `button`, so it matches `src/button.tsx`. */
function distBasename(distPath: string): string {
  return distPath.replace(DIST_PREFIX, "").replace(JS_SUFFIX, "");
}

/** `src/button.tsx` -> `button`, `src/hooks/index.ts` -> `hooks/index`. */
function entryBasename(entry: string): string {
  return entry.replace(SRC_PREFIX, "").replace(TS_SUFFIX, "");
}

describe("package exports", () => {
  it("builds every subpath that publishConfig exports", () => {
    const built = new Set(entryPoints().map(entryBasename));
    const published = pkg().publishConfig?.exports ?? {};

    const missing = Object.entries(published)
      .flatMap(([subpath, target]) =>
        typeof target === "string"
          ? []
          : [{ subpath, name: distBasename(target.default) }]
      )
      .filter(({ name }) => !built.has(name))
      .map(({ subpath }) => subpath);

    expect(missing).toEqual([]);
  });

  it("publishes every subpath that exports declares", () => {
    const { exports: dev, publishConfig } = pkg();
    const published = publishConfig?.exports ?? {};

    const missing = Object.keys(dev).filter(
      (subpath) => !(subpath in published)
    );

    expect(missing).toEqual([]);
  });

  it("ships the raw assets it publishes from source", () => {
    const { files, publishConfig } = pkg();
    const roots = files.filter((entry) => !entry.startsWith("!"));

    const unshipped = Object.entries(publishConfig?.exports ?? {})
      .flatMap(([subpath, target]) =>
        typeof target === "string"
          ? [{ subpath, path: target.replace(LEADING_DOT_SLASH, "") }]
          : []
      )
      .filter(({ path }) => !roots.some((root) => path.startsWith(`${root}/`)))
      .map(({ subpath }) => subpath);

    expect(unshipped).toEqual([]);
  });

  it("exports every entryPoint that is a component", () => {
    const { exports: dev } = pkg();
    const exported = new Set(
      Object.values(dev).map((path) => path.replace(LEADING_DOT_SLASH, ""))
    );

    const orphaned = entryPoints().filter((entry) => !exported.has(entry));

    expect(orphaned).toEqual([]);
  });
});
