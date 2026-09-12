/**
 * The same component, declared in two blocks.
 *
 * `block-shared-files.test.ts` next door checks duplicated *file basenames*,
 * because its subject is install collision: two blocks shipping `chart.tsx`
 * overwrite each other in a consumer's flat `components/` directory. This one
 * checks duplicated *symbols*, which is a different failure and invisible to
 * that test — `SubHeader` lives in `admin-filters-drawer.tsx` in one block and
 * `tickets-filters-drawer.tsx` in another, so no basename ever collides.
 *
 * It found three byte-identical copies of `SubHeader`, three of `ResultSummary`
 * and two of `TriggerLabel`, none of which anything had ever reported.
 *
 * ## Two remedies, not one
 *
 * A failure here has two legitimate answers and the allowlist is one of them:
 *
 *  1. **Extract it** — to `packages/ui` if it is genuinely a library concern.
 *  2. **Record it** — blocks are copy-paste starters, and a block that owns its
 *     own presentation is working as intended. Add it to `DUPLICATED_ON_PURPOSE`
 *     with a reason.
 *
 * Only ever taking remedy 1 would ratchet the library's API upward forever,
 * which is exactly what the audit that produced this test set out to stop.
 *
 * ## What it cannot see
 *
 * Same-name duplication only. The three row-action menus are `RowActions`,
 * `UserRowActions` and `TicketRowActions` — the same component wearing three
 * names, and this test is blind to them. Renaming is not a fix.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { REPO_ROOT } from "./registry-paths";

const DEMOS_DIR = join(REPO_ROOT, "apps", "docs", "demos", "blocks");

/**
 * Files the sibling test already owns. Their symbols are duplicated because
 * the whole file is, deliberately and byte-identically.
 */
const SHARED_BASENAMES = new Set([
  "chart-formatters.ts",
  "chart.tsx",
  "series-legend.tsx",
  "use-reduced-motion.ts",
]);

/** Duplication that is correct. Each entry needs a reason. */
const DUPLICATED_ON_PURPOSE: Record<string, string> = {
  // A one-line muted span. Below the bar for library API, and a block that
  // spells out its own label styling is easier to read than one that imports it.
  TriggerLabel: "one-line presentational span; not worth an API",
  // Two lines of arithmetic and a plural, in two blocks. `TablePaginationInfo`
  // already takes `children`, which is the composition answer; a library prop
  // would be four props to delete four lines from demos. Each block's copy is
  // shared within that block.
  ResultSummary: "trivial arithmetic; `TablePaginationInfo` takes children",
};

/** Top-level declarations whose name is capitalised — React's own convention. */
const DECLARATION_RE =
  /^(?:export\s+)?(?:function|const)\s+([A-Z]\w*)\s*[(=]/gm;

function blockNames(): string[] {
  return readdirSync(DEMOS_DIR)
    .filter((entry) => statSync(join(DEMOS_DIR, entry)).isDirectory())
    .sort();
}

/**
 * Every site, not one per block: `admin-01` declares `SubHeader` in two of its
 * own files, and a map keyed by name would report one of them and hide the
 * other.
 */
function declarationsIn(block: string): { name: string; where: string }[] {
  const found: { name: string; where: string }[] = [];
  const dir = join(DEMOS_DIR, block);
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith(".tsx") || SHARED_BASENAMES.has(entry)) {
      continue;
    }
    const source = readFileSync(join(dir, entry), "utf-8");
    for (const match of source.matchAll(DECLARATION_RE)) {
      const line = source.slice(0, match.index).split("\n").length;
      found.push({ name: match[1], where: `${block}/${entry}:${line}` });
    }
  }
  return found;
}

describe("block-local components", () => {
  it("declares each component name in only one block", () => {
    const sites = new Map<string, string[]>();
    for (const block of blockNames()) {
      for (const { name, where } of declarationsIn(block)) {
        sites.set(name, [...(sites.get(name) ?? []), where]);
      }
    }

    const offenders = [...sites.entries()]
      .filter(
        ([name, where]) => where.length > 1 && !(name in DUPLICATED_ON_PURPOSE)
      )
      .map(([name, where]) => `${name} — ${where.join(", ")}`)
      .sort();

    expect(offenders).toEqual([]);
  });

  it("keeps the allowlist honest", () => {
    // An entry that no longer duplicates anything is a stale exemption, and a
    // stale exemption is how the next real one gets waved through.
    const counts = new Map<string, number>();
    for (const block of blockNames()) {
      for (const { name } of declarationsIn(block)) {
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }

    const stale = Object.keys(DUPLICATED_ON_PURPOSE).filter(
      (name) => (counts.get(name) ?? 0) < 2
    );

    expect(stale).toEqual([]);
  });
});
