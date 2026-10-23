/**
 * `/r/demos/[name]` is prerendered for every component directory and block
 * name. The names come from the demo map's `file` paths, not from demo keys
 * (`button-default` is a key; `button` is what the route serves).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { demoNamesFromFiles } from "../lib/demo-names";

const DEMOS_DIR = join(import.meta.dirname, "..", "demos");
const FILE_FIELD = /file: "([^"]+)"/g;
const TSX_EXT = /\.tsx$/;

describe("demoNamesFromFiles against the real demo map", () => {
  // The demo map is read as text: importing it pulls ~450 TSX components
  // into vitest. B0 replaces it with an importable `demos/files.ts`.
  const files = [
    ...readFileSync(join(DEMOS_DIR, "index.ts"), "utf-8").matchAll(FILE_FIELD),
  ].map((m) => m[1]);
  const names = demoNamesFromFiles(files);

  it("prerenders a /r/demos entry for every component directory and block on disk", () => {
    const onDisk = [
      ...readdirSync(DEMOS_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name !== "blocks")
        .map((d) => d.name),
      ...readdirSync(join(DEMOS_DIR, "blocks")).map((b) =>
        b.replace(TSX_EXT, "")
      ),
    ];
    expect(files.length).toBeGreaterThan(400);
    expect(names.length).toBeGreaterThan(50);
    expect(onDisk.filter((n) => !names.includes(n))).toEqual([]);
    expect(names.filter((n) => !onDisk.includes(n))).toEqual([]);
  });
});

describe("demoNamesFromFiles", () => {
  it("maps component demo files to their directory name", () => {
    expect(
      demoNamesFromFiles(["button/default.tsx", "button/variants.tsx"])
    ).toEqual(["button"]);
  });

  it("maps single-file and directory blocks to the block name", () => {
    expect(
      demoNamesFromFiles([
        "blocks/signin-01.tsx",
        "blocks/admin-01/index.tsx",
        "blocks/admin-01/mock-admin.ts",
      ])
    ).toEqual(["admin-01", "signin-01"]);
  });

  it("returns a sorted, de-duplicated list across components and blocks", () => {
    expect(
      demoNamesFromFiles([
        "tabs/default.tsx",
        "blocks/tickets-01/index.tsx",
        "accordion/default.tsx",
        "tabs/variants.tsx",
      ])
    ).toEqual(["accordion", "tabs", "tickets-01"]);
  });

  it("never yields the reserved 'blocks' directory itself or hidden names", () => {
    expect(
      demoNamesFromFiles(["blocks/_template.tsx", "_scratch/x.tsx"])
    ).toEqual([]);
  });
});
