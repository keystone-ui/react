/**
 * Tutorial demos (apps/docs/demos/tutorial) are steps of a docs page. They
 * must not become installable registry examples, which MCP `get_examples`
 * and `npx shadcn add` would list.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import manifest from "../demos/manifest.json";

const ROOT = resolve(import.meta.dirname, "../../..");
const registry = JSON.parse(
  readFileSync(resolve(ROOT, "registry.json"), "utf8")
);

describe("tutorial demos", () => {
  const tutorialDemos = Object.keys(manifest).filter((key) =>
    key.startsWith("tutorial-")
  );

  it("exist in the demo manifest", () => {
    expect(tutorialDemos.length).toBeGreaterThan(0);
  });

  it("are not registry items", () => {
    const names = new Set(
      registry.items.map((item: { name: string }) => item.name)
    );
    expect(tutorialDemos.filter((key) => names.has(key))).toEqual([]);
  });
});
