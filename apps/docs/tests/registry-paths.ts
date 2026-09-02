/**
 * Shared filesystem helpers for the registry integrity tests.
 *
 * These tests guard the shadcn registry pipeline:
 *
 *   registry source  ->  registry.json  ->  apps/docs/public/r/**
 *   (packages/ui/registry/, packages/ui/src/, apps/docs/demos/)
 *
 * The built output under apps/docs/public/r/ is committed to git and served
 * statically at https://keystoneui.io/r/, so the committed output -- not a
 * freshly built one -- is what consumers actually fetch. The tests therefore
 * assert against what is on disk, which also catches "someone changed the
 * source and forgot to run `pnpm registry:build`".
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

/** Monorepo root, three levels up from apps/docs/tests/. */
export const REPO_ROOT = resolve(import.meta.dirname, "..", "..", "..");

const JSON_EXTENSION_RE = /\.json$/;

export const REGISTRY_JSON = join(REPO_ROOT, "registry.json");
export const BUILD_OUTPUT_DIR = join(REPO_ROOT, "apps", "docs", "public", "r");

export interface RegistryItem {
  css?: Record<string, unknown>;
  cssVars?: Record<string, Record<string, string>>;
  dependencies?: string[];
  description?: string;
  files?: { path: string; type: string; content?: string }[];
  name: string;
  registryDependencies?: string[];
  title?: string;
  type: string;
}

export interface Registry {
  homepage: string;
  items: RegistryItem[];
  name: string;
}

export function readRegistry(): Registry {
  return JSON.parse(readFileSync(REGISTRY_JSON, "utf-8")) as Registry;
}

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

/**
 * Every built item file, as a registry item *name* (POSIX-style, no `.json`),
 * so `apps/docs/public/r/themes/zinc.json` becomes `themes/zinc`.
 *
 * `registry.json` itself is excluded -- `shadcn build` copies the source
 * registry into the output directory alongside the item files, so it is output
 * but not an item.
 */
export function listBuiltItemNames(): string[] {
  const names: string[] = [];

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir).sort()) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.endsWith(".json")) {
        continue;
      }
      const rel = relative(BUILD_OUTPUT_DIR, full).split(sep).join("/");
      if (rel === "registry.json") {
        continue;
      }
      names.push(rel.replace(JSON_EXTENSION_RE, ""));
    }
  };

  walk(BUILD_OUTPUT_DIR);
  return names;
}

/** Absolute path of the built file for a registry item name. */
export function builtItemPath(name: string): string {
  return join(BUILD_OUTPUT_DIR, ...`${name}.json`.split("/"));
}
