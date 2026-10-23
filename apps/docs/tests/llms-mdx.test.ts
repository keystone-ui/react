/**
 * `readMdxSource` feeds `/llms.mdx/docs/*`, `/llms-full.txt` and
 * `/llms-components.txt`. On 2026-10-23 production served
 * `/llms.mdx/docs` as a 200 whose body was "*Content unavailable*": the
 * MDX file read failed at request time on workerd and the helper
 * swallowed the error. A missing source file must throw so the build
 * fails instead.
 */

import { describe, expect, it } from "vitest";

import { readMdxSource } from "../lib/read-mdx-source";

const MISSING_PATH = /does-not-exist\/ghost\.mdx/;
const FRONTMATTER_START = /^---/;

describe("readMdxSource", () => {
  it("rejects when the MDX source file does not exist", async () => {
    await expect(readMdxSource("does-not-exist/ghost.mdx")).rejects.toThrow(
      MISSING_PATH
    );
  });

  it("reads a real page and appends .mdx when the path lacks it", async () => {
    const text = await readMdxSource("components/button");
    expect(text).toMatch(FRONTMATTER_START);
    expect(text.length).toBeGreaterThan(100);
  });
});
