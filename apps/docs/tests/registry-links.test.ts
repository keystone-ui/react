/**
 * Link integrity for the registry: every registry URL the docs, the agent
 * skill, or the MCP server tells a user to run must resolve to a file that
 * actually exists in the built registry output.
 *
 * This is the test that would have caught the original bug. Ten places across
 * apps/docs, skills/keystoneui-react and packages/keystoneui-mcp instructed
 * `npx shadcn add https://keystoneui.io/r/default.json` and
 * `.../r/themes/<name>.json`, and none of those files were ever built.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

import { builtItemPath, REPO_ROOT } from "./registry-paths";

/** Trees that document or generate registry install commands. */
const SCANNED_ROOTS = ["apps/docs", "skills", "packages/keystoneui-mcp"];

const SCANNED_EXTENSIONS = [
  ".mdx",
  ".md",
  ".ts",
  ".tsx",
  ".mjs",
  ".js",
  ".json",
  ".yml",
  ".yaml",
];

/** Directories that are build output, dependencies, or the registry itself. */
const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  ".open-next",
  ".source",
  ".turbo",
  "storybook-static",
  "dist",
]);

/**
 * Paths that are not user-facing instructions:
 *  - the built registry output is the thing under test, not a reference to it
 *    (registry items legitimately carry the URL of their own registry);
 *  - these tests document the very URLs they check, and a doc comment is not
 *    an install command.
 */
const IGNORED_PATHS = [
  join("apps", "docs", "public", "r"),
  join("apps", "docs", "tests"),
];

/**
 * A literal URL against the production registry host.
 * e.g. https://keystoneui.io/r/themes/zinc.json
 */
const LITERAL_URL_RE = /https:\/\/keystoneui\.io\/r\/([A-Za-z0-9._/-]+)\.json/g;

/**
 * The MCP server builds its install commands from a configurable base URL:
 *   `npx shadcn@latest add ${registryUrl}/default.json`
 * so the literal host never appears. Catch that form too.
 */
const TEMPLATE_URL_RE = /\$\{\s*registryUrl\s*\}\/([A-Za-z0-9._/-]+)\.json/g;

/**
 * Authoring templates use deliberately fake names (`component-name`,
 * `block-name-01`). Fumadocs and the repo's own linters treat `_`-prefixed
 * files as templates, so they are not user-facing instructions.
 */
function isTemplate(relPath: string): boolean {
  return relPath
    .split(sep)
    .some((segment) => segment.startsWith("_") && segment !== "_");
}

function collectFiles(root: string): string[] {
  const found: string[] = [];
  const abs = join(REPO_ROOT, root);
  if (!existsSync(abs)) {
    return found;
  }

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir).sort()) {
      const full = join(dir, entry);
      const rel = relative(REPO_ROOT, full);

      if (statSync(full).isDirectory()) {
        if (IGNORED_DIRS.has(entry) || entry.startsWith(".")) {
          continue;
        }
        if (
          IGNORED_PATHS.some((p) => rel === p || rel.startsWith(`${p}${sep}`))
        ) {
          continue;
        }
        walk(full);
        continue;
      }

      if (!SCANNED_EXTENSIONS.some((ext) => entry.endsWith(ext))) {
        continue;
      }
      if (isTemplate(rel)) {
        continue;
      }
      found.push(full);
    }
  };

  walk(abs);
  return found;
}

interface Reference {
  item: string;
  source: string;
}

function collectReferences(): Reference[] {
  const references: Reference[] = [];

  for (const root of SCANNED_ROOTS) {
    for (const file of collectFiles(root)) {
      const content = readFileSync(file, "utf-8");
      const source = relative(REPO_ROOT, file).split(sep).join("/");

      for (const re of [LITERAL_URL_RE, TEMPLATE_URL_RE]) {
        re.lastIndex = 0;
        let match = re.exec(content);
        while (match !== null) {
          references.push({ item: match[1], source });
          match = re.exec(content);
        }
      }
    }
  }

  return references;
}

const references = collectReferences();
const uniqueItems = [...new Set(references.map((r) => r.item))].sort();

describe("registry link integrity", () => {
  it("finds registry URLs to check", () => {
    // A silent drop to zero would make this whole suite vacuous.
    expect(references.length).toBeGreaterThan(50);
    expect(uniqueItems.length).toBeGreaterThan(50);
  });

  it("scans the docs, the agent skill and the MCP server", () => {
    const roots = new Set(
      references.map((r) => {
        if (r.source.startsWith("apps/docs/")) {
          return "apps/docs";
        }
        if (r.source.startsWith("skills/")) {
          return "skills";
        }
        return "packages/keystoneui-mcp";
      })
    );
    expect([...roots].sort()).toEqual([
      "apps/docs",
      "packages/keystoneui-mcp",
      "skills",
    ]);
  });

  it("still checks the theme URLs specifically", () => {
    // Guards against a future refactor of the extractor quietly losing the
    // exact references that were broken in the first place.
    for (const item of [
      "default",
      "themes/default",
      "themes/zinc",
      "themes/slate",
      "themes/stone",
      "themes/gray",
      "themes/neutral",
    ]) {
      expect(uniqueItems, `${item} is no longer referenced`).toContain(item);
    }
  });

  it("resolves every referenced registry URL to a built file", () => {
    const broken = references
      .filter(({ item }) => !existsSync(builtItemPath(item)))
      .map(({ item, source }) => `${source} -> /r/${item}.json`)
      .sort();

    expect(broken).toEqual([]);
  });
});
