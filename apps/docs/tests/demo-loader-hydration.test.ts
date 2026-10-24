/**
 * Every generated loader entry wraps its demo so the document is marked
 * once that demo has hydrated. e2e/preview.ts waits for the mark before
 * interacting with a preview page; without it, a click can land while the
 * demo's chunk is still loading.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { demoFiles } from "@/demos/files";

const LOADER = join(import.meta.dirname, "../demos/loader.tsx");
const WRAPPED_ENTRY = /hydrated\("([a-z0-9-]+)", m\.default\)/g;

describe("generated demo loader", () => {
  const source = readFileSync(LOADER, "utf8");

  it("marks the document when a demo has hydrated", () => {
    expect(source).toContain('"data-demo-hydrated"');
  });

  it("wraps every demo entry, with the key the manifest uses", () => {
    const wrapped = Array.from(source.matchAll(WRAPPED_ENTRY), (m) => m[1]);
    expect(wrapped.sort()).toEqual(Object.keys(demoFiles).sort());
  });
});
