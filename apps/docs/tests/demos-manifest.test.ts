/**
 * The generated demo registry (`manifest.json`, `loader.tsx`, `index.ts`)
 * must agree with the files on disk and with each other. The generator's
 * `--check` mode runs in `pnpm lint:docs`; these tests pin the invariants
 * independently of how the generator renders its output.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { demoEntriesFromPaths } from "../../../scripts/lib/demo-entries.mjs";
import { demoFiles, getDemoFile } from "../demos/files";

const DEMOS_DIR = join(import.meta.dirname, "..", "demos");

function filesOnDisk(): string[] {
  return readdirSync(DEMOS_DIR, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(DEMOS_DIR, join(entry.parentPath, entry.name))
        .split("\\")
        .join("/")
    );
}

describe("demo manifest", () => {
  const keys = Object.keys(demoFiles);

  it("registers every demo and block on disk, and nothing else", () => {
    const expected = Object.fromEntries(
      demoEntriesFromPaths(filesOnDisk()).map((e) => [e.key, e.file])
    );
    expect(demoFiles).toEqual(expected);
    expect(keys.length).toBeGreaterThan(400);
  });

  it("points every key at an existing source file", () => {
    const missing = keys.filter(
      (key) => !existsSync(join(DEMOS_DIR, demoFiles[key]))
    );
    expect(missing).toEqual([]);
  });

  it("looks up by key without inheriting from Object.prototype", () => {
    expect(getDemoFile("button-default")).toBe("button/default.tsx");
    expect(getDemoFile("constructor")).toBeUndefined();
    expect(getDemoFile("nope")).toBeUndefined();
  });

  it("is mirrored by the client loader", () => {
    const source = readFileSync(join(DEMOS_DIR, "loader.tsx"), "utf-8");
    const absent = keys.filter((key) => !source.includes(`"${key}"`));
    expect(absent).toEqual([]);
  });

  it("no longer ships a static import map", () => {
    // index.ts imported every demo component; its presence would put all
    // of them back into every docs route's module graph.
    expect(existsSync(join(DEMOS_DIR, "index.ts"))).toBe(false);
  });
});
