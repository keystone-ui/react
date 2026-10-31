/**
 * The `## Composition` trees are what agents (and `keystoneui docs`) compose
 * from, so a tree must describe markup that actually renders.
 *
 *  1. Every node is a real export of `@keystoneui/react` — a renamed part
 *     otherwise lives on in the docs forever.
 *  2. Parts Base UI rejects outside a parent sit under that parent. Dropdown
 *     Menu's tree put `DropdownMenuLabel` straight under the content, which
 *     throws "MenuGroupContext is missing". The runtime half of each rule is
 *     pinned in packages/ui/src/composition-contracts.test.tsx.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { REPO_ROOT } from "./registry-paths";

const COMPONENTS_DIR = join(REPO_ROOT, "apps/docs/content/docs/components");
const UI_SRC = join(REPO_ROOT, "packages/ui/src");

const COMPOSITION_RE = /^## Composition\s*\n+```text\n([\s\S]*?)\n```/m;
const EXPORT_BLOCK_RE = /export\s*\{([^}]*)\}/g;
const EXPORT_DECL_RE = /export\s+(?:const|function)\s+([A-Z][A-Za-z]*)/g;
const NODE_RE = /^([│ ]*)(?:[├└]── )?([A-Z][A-Za-z]*)\b/;

/** Child → the parents it must sit under (any one of them). */
/** Stand-ins a tree uses for "your own element here". */
const PLACEHOLDERS = new Set(["Icon"]);

const REQUIRED_ANCESTOR: Record<string, string[]> = {
  DropdownMenuLabel: ["DropdownMenuGroup", "DropdownMenuRadioGroup"],
  SelectLabel: ["SelectGroup"],
  ComboboxLabel: ["ComboboxGroup"],
};

interface TreeNode {
  ancestors: string[];
  name: string;
}

function parseTree(text: string): TreeNode[] {
  const stack: { depth: number; name: string }[] = [];
  const nodes: TreeNode[] = [];
  for (const line of text.split("\n")) {
    const match = NODE_RE.exec(line);
    if (!match) {
      continue;
    }
    // The root sits at column 0; each level adds a 4-column "│   " prefix.
    const depth = line.includes("──") ? match[1].length / 4 + 1 : 0;
    while ((stack.at(-1)?.depth ?? -1) >= depth) {
      stack.pop();
    }
    nodes.push({ name: match[2], ancestors: stack.map((s) => s.name) });
    stack.push({ depth, name: match[2] });
  }
  return nodes;
}

function libraryExports(): Set<string> {
  const names = new Set<string>();
  for (const file of readdirSync(UI_SRC)) {
    if (!file.endsWith(".tsx") || file.includes(".test.")) {
      continue;
    }
    const source = readFileSync(join(UI_SRC, file), "utf-8");
    for (const block of source.matchAll(EXPORT_BLOCK_RE)) {
      for (const raw of block[1].split(",")) {
        const name = raw.replace("type ", "").split(" as ").at(-1)?.trim();
        if (name) {
          names.add(name);
        }
      }
    }
    for (const decl of source.matchAll(EXPORT_DECL_RE)) {
      names.add(decl[1]);
    }
  }
  return names;
}

const trees = readdirSync(COMPONENTS_DIR)
  .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
  .flatMap((file) => {
    const match = COMPOSITION_RE.exec(
      readFileSync(join(COMPONENTS_DIR, file), "utf-8")
    );
    return match ? [{ file, nodes: parseTree(match[1]) }] : [];
  });

describe("composition trees", () => {
  it("finds the trees", () => {
    expect(trees.length).toBeGreaterThan(35);
  });

  it("parses nesting depth", () => {
    const nodes = parseTree(["Root", "├── A", "│   └── B", "└── C"].join("\n"));
    expect(nodes.map((n) => [n.name, n.ancestors.join(">")])).toEqual([
      ["Root", ""],
      ["A", "Root"],
      ["B", "Root>A"],
      ["C", "Root"],
    ]);
  });

  it("names only real exports", () => {
    const exported = libraryExports();
    const unknown = trees.flatMap(({ file, nodes }) =>
      nodes
        .filter((n) => !(exported.has(n.name) || PLACEHOLDERS.has(n.name)))
        .map((n) => `${file}: ${n.name}`)
    );
    expect(unknown).toEqual([]);
  });

  it("nests group labels inside their group", () => {
    const violations = trees.flatMap(({ file, nodes }) =>
      nodes
        .filter((n) => n.name in REQUIRED_ANCESTOR)
        .filter(
          (n) => !REQUIRED_ANCESTOR[n.name].some((p) => n.ancestors.includes(p))
        )
        .map((n) => `${file}: ${n.name} under ${n.ancestors.join(" > ")}`)
    );
    expect(violations).toEqual([]);
  });
});
