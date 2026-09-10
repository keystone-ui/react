/**
 * Blocks that share infrastructure must share it byte for byte.
 *
 * A block's installable copy is flat: every `registry:component` file lands at
 * `@/components/<basename>.tsx` in the consumer's app. So two blocks that both
 * ship a `chart.tsx` write to the same path, and installing both means
 * last-writer-wins — silently. If the two copies ever diverge, one block breaks
 * with no error at all.
 *
 * Hoisting the shared files into their own registry item was the obvious
 * alternative and was rejected: it would put chart code back on the installable
 * component surface, which is exactly what keeping recharts a *block*
 * dependency was for. Duplicating and enforcing identity is the cheaper bet —
 * this test is what makes it a bet rather than a hope.
 *
 * `pnpm lint:docs` separately runs `sync-block-copies.mjs --check`, which
 * guarantees each registry copy matches its demo. Between the two, a change to
 * one block's `chart.tsx` cannot quietly reach a consumer of the other.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { REPO_ROOT } from "./registry-paths";

const DEMOS_DIR = join(REPO_ROOT, "apps", "docs", "demos", "blocks");

/**
 * Infrastructure a block may duplicate. Presentational files are deliberately
 * NOT on this list: two blocks sharing a panel would be the same demo twice.
 */
const SHARED_BASENAMES = [
  "chart-formatters.ts",
  "chart.tsx",
  "series-legend.tsx",
  "use-reduced-motion.ts",
];

function blockNames(): string[] {
  return readdirSync(DEMOS_DIR)
    .filter((entry) => statSync(join(DEMOS_DIR, entry)).isDirectory())
    .sort();
}

describe("shared block infrastructure", () => {
  it.each(SHARED_BASENAMES)(
    "%s is identical in every block that has it",
    (basename) => {
      const copies = blockNames()
        .map((block) => ({ block, path: join(DEMOS_DIR, block, basename) }))
        .filter(({ path }) => existsSync(path))
        .map(({ block, path }) => ({
          block,
          content: readFileSync(path, "utf-8"),
        }));

      if (copies.length < 2) {
        // Nothing to compare yet; the assertion below still documents intent.
        expect(copies.length).toBeLessThanOrEqual(1);
        return;
      }

      const [reference, ...rest] = copies;
      const divergent = rest
        .filter((copy) => copy.content !== reference.content)
        .map(
          (copy) =>
            `${copy.block}/${basename} differs from ${reference.block}/${basename}`
        );

      expect(divergent).toEqual([]);
    }
  );

  it("does not silently add a new duplicated basename", () => {
    // A file that appears in two blocks under the same name will collide on
    // install whether or not anyone thought about it. Anything new has to be
    // classified: added to SHARED_BASENAMES and kept identical, or renamed.
    const seen = new Map<string, string[]>();
    for (const block of blockNames()) {
      for (const entry of readdirSync(join(DEMOS_DIR, block))) {
        if (!statSync(join(DEMOS_DIR, block, entry)).isFile()) {
          continue;
        }
        // Every block has an index.tsx, and it is never installed -- page.tsx
        // takes its place, one per block, at a per-block target path.
        if (entry === "index.tsx") {
          continue;
        }
        seen.set(entry, [...(seen.get(entry) ?? []), block]);
      }
    }

    const unclassified = [...seen.entries()]
      .filter(
        ([basename, blocks]) =>
          blocks.length > 1 && !SHARED_BASENAMES.includes(basename)
      )
      .map(([basename, blocks]) => `${basename}: ${blocks.join(", ")}`);

    expect(unclassified).toEqual([]);
  });

  it("keeps every shared file's registry copy in the same collision path", () => {
    // The demo-side identity above only matters because the installed paths
    // collide; this pins that they actually do, so the test cannot be quietly
    // made irrelevant by a layout change.
    const registryDir = join(REPO_ROOT, "registry", "default", "blocks");
    const targets = new Map<string, string[]>();

    for (const block of blockNames()) {
      const components = join(registryDir, block, "components");
      if (!existsSync(components)) {
        continue;
      }
      for (const basename of SHARED_BASENAMES) {
        if (existsSync(join(components, basename))) {
          targets.set(basename, [...(targets.get(basename) ?? []), block]);
        }
      }
    }

    for (const [basename, blocks] of targets) {
      if (blocks.length < 2) {
        continue;
      }
      const contents = blocks.map((block) =>
        readFileSync(join(registryDir, block, "components", basename), "utf-8")
      );
      expect(
        new Set(contents).size,
        `${relative(REPO_ROOT, registryDir)}/*/components/${basename} differs across ${blocks.join(", ")}`
      ).toBe(1);
    }
  });
});
