/**
 * Registry items carry CSS as nested JSON that shadcn turns into CSS. An
 * at-rule must be a key with an empty object (`"@apply x y": {}`): written
 * as a property (`"@apply": "x y"`), shadcn emits `@apply: x y;`, which
 * Tailwind ignores. The style item shipped that shape, so every unthemed
 * border drew in the text colour and `body` had no background.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = resolve(import.meta.dirname, "../../..");

function jsonFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".json"))
    .map((file) => join(dir, file));
}

const SOURCES = [
  ...jsonFiles(join(ROOT, "packages/ui/registry")),
  join(ROOT, "registry.json"),
  join(ROOT, "apps/docs/public/r/default.json"),
];

/** Every key path whose key is an at-rule but whose value is not an object. */
function atRulesAsProperties(node: unknown, path: string[] = []): string[] {
  if (node === null || typeof node !== "object") {
    return [];
  }
  return Object.entries(node).flatMap(([key, value]) => {
    const here = [...path, key];
    if (key.startsWith("@") && typeof value !== "object") {
      return [here.join(" > ")];
    }
    return atRulesAsProperties(value, here);
  });
}

describe("registry CSS", () => {
  it.each(SOURCES)(
    "%s writes at-rules as keys, never as properties",
    (file) => {
      const json = JSON.parse(readFileSync(file, "utf8"));
      expect(atRulesAsProperties(json)).toEqual([]);
    }
  );

  it("the style item applies the border and body defaults", () => {
    const style = JSON.parse(
      readFileSync(join(ROOT, "packages/ui/registry/default.json"), "utf8")
    );
    const base = style.css["@layer base"];
    expect(base["*"]).toEqual({ "@apply border-border outline-ring/50": {} });
    expect(base.body).toEqual({ "@apply bg-background text-foreground": {} });
  });
});
