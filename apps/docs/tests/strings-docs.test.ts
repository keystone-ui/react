/**
 * The Strings page's English table is Markdown rows inside `strings.mdx`,
 * between marker comments, so it reaches the raw-MDX text routes
 * (`/llms.mdx/docs/components/strings`, MCP `get_docs`) as plain rows; a
 * client component rendering `defaultStrings` would reach them as a tag.
 *
 * The rows are recomputed here from `defaultStrings`, functions called with
 * the typed sample arguments below. Drift fails; `UPDATE=1` rewrites them:
 *
 *   UPDATE=1 pnpm --filter @keystoneui/docs exec vitest run tests/strings-docs.test.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  defaultStrings,
  type KeystoneStrings,
} from "@keystoneui/react/strings";
import { describe, expect, it } from "vitest";

import { readMdxSource } from "../lib/read-mdx-source";

const PAGE = join(
  import.meta.dirname,
  "../content/docs/components/strings.mdx"
);
const START = "{/* strings:english:start */}";
const END = "{/* strings:english:end */}";

type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never;
}[keyof T];

/**
 * Sample arguments for every function-valued key, typed against its
 * signature. Each entry is one example row; a key may list several.
 */
type Samples = {
  [N in keyof KeystoneStrings]?: {
    [K in FunctionKeys<KeystoneStrings[N]>]: KeystoneStrings[N][K] extends (
      ...args: infer A
    ) => unknown
      ? readonly A[]
      : never;
  };
};

const SAMPLES: Samples = {};

function cell(text: string): string {
  return text.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function code(text: string): string {
  return `\`${text}\``;
}

/** One `| key | English |` row per string, one per sample per function. */
function englishRows(): string {
  const rows = ["| Key | English |", "| --- | --- |"];
  for (const [namespace, entries] of Object.entries(defaultStrings)) {
    for (const [key, value] of Object.entries(entries)) {
      const name = `${namespace}.${key}`;
      if (typeof value === "string") {
        rows.push(`| ${code(name)} | ${cell(value)} |`);
        continue;
      }
      const samples = (
        SAMPLES as Record<string, Record<string, unknown[][]> | undefined>
      )[namespace]?.[key];
      if (!samples || samples.length === 0) {
        throw new Error(`${name} is a function with no sample in SAMPLES`);
      }
      for (const args of samples) {
        const call = `${name}(${args.map((a) => JSON.stringify(a)).join(", ")})`;
        rows.push(
          `| ${code(call)} | ${cell((value as (...a: unknown[]) => string)(...args))} |`
        );
      }
    }
  }
  return rows.join("\n");
}

function withRows(page: string, rows: string): string {
  const start = page.indexOf(START);
  const end = page.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`strings.mdx lacks the ${START} … ${END} markers`);
  }
  return `${page.slice(0, start + START.length)}\n\n${rows}\n\n${page.slice(end)}`;
}

describe("Strings page English rows", () => {
  it("match defaultStrings", () => {
    const page = readFileSync(PAGE, "utf-8");
    const expected = withRows(page, englishRows());
    if (process.env.UPDATE === "1" && page !== expected) {
      writeFileSync(PAGE, expected);
      return;
    }
    expect(page).toBe(expected);
  });

  it("list Modal's English in the raw MDX the text routes read", async () => {
    const text = await readMdxSource("components/strings");
    expect(text).toContain("| `modal.close` | Close |");
    expect(text).toContain("| `modal.footerClose` | Close |");
  });

  it("name every key of defaultStrings", () => {
    const rows = englishRows();
    for (const [namespace, entries] of Object.entries(defaultStrings)) {
      for (const key of Object.keys(entries)) {
        expect(rows).toContain(`\`${namespace}.${key}`);
      }
    }
  });
});
