#!/usr/bin/env node

/**
 * Syncs UI component entries from _registry.ts + MDX frontmatter into registry.json.
 *
 * Usage:
 *   node scripts/sync-registry.mjs
 *   pnpm sync:registry
 *
 * Reads:
 *   - packages/ui/src/_registry.ts        (component metadata)
 *   - apps/docs/content/docs/components/  (MDX descriptions)
 *   - registry.json                       (existing blocks)
 *
 * Writes:
 *   - registry.json                       (merged: UI components + blocks)
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const REGISTRY_TS = join(ROOT, "packages/ui/src/_registry.ts");
const MDX_DIR = join(ROOT, "apps/docs/content/docs/components");
const DEMOS_DIR = join(ROOT, "apps/docs/demos");
const REGISTRY_JSON = join(ROOT, "registry.json");

function parseRegistryTs() {
  const content = readFileSync(REGISTRY_TS, "utf-8");
  const entries = [];
  const entryRegex =
    /\{\s*name:\s*"([^"]+)"[\s\S]*?type:\s*"([^"]+)"[\s\S]*?\}/g;

  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const block = match[0];
    const name = match[1];

    const depsMatch = block.match(/dependencies:\s*\[([\s\S]*?)\]/);
    const deps = depsMatch
      ? (depsMatch[1].match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, "")) ??
        [])
      : [];

    const regDepsMatch = block.match(/registryDependencies:\s*\[([\s\S]*?)\]/);
    const regDeps = regDepsMatch
      ? (regDepsMatch[1].match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, "")) ??
        [])
      : [];

    entries.push({ name, dependencies: deps, registryDependencies: regDeps });
  }

  return entries;
}

function parseMdxDescriptions() {
  const descriptions = new Map();
  const files = readdirSync(MDX_DIR).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const content = readFileSync(join(MDX_DIR, file), "utf-8");
    const descMatch = content.match(/^description:\s*(.+)$/m);
    const titleMatch = content.match(/^title:\s*(.+)$/m);
    const name = file.replace(".mdx", "");

    const rawTitle = titleMatch?.[1]?.trim() ?? toTitleCase(name);
    descriptions.set(name, {
      title: pascalToTitle(rawTitle),
      description: descMatch?.[1]?.trim() ?? "",
    });
  }

  return descriptions;
}

function toTitleCase(kebab) {
  return kebab
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function pascalToTitle(pascal) {
  return pascal.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function buildUiItems(registryEntries, mdxMeta) {
  return registryEntries.map((entry) => {
    const meta = mdxMeta.get(entry.name) ?? {
      title: toTitleCase(entry.name),
      description: "",
    };

    const item = {
      name: entry.name,
      type: "registry:ui",
      title: meta.title,
      description: meta.description,
    };

    if (entry.dependencies.length > 0) {
      item.dependencies = entry.dependencies;
    }

    if (entry.registryDependencies.length > 0) {
      item.registryDependencies = entry.registryDependencies;
    }

    item.files = [
      {
        path: `packages/ui/src/${entry.name}.tsx`,
        type: "registry:ui",
      },
    ];

    return item;
  });
}

function extractKeystoneImports(source) {
  const imports = new Set();
  const matches = source.matchAll(
    /from\s+["']@keystoneui\/react\/([a-z0-9-]+)["']/g
  );
  for (const match of matches) {
    imports.add(match[1]);
  }
  return [...imports].sort();
}

function extractDemoDescription(source) {
  // Prefer a leading file-level comment (//, /** ... */, /* ... */)
  const trimmed = source.trimStart();
  const block = trimmed.match(/^\/\*\*?([\s\S]*?)\*\//);
  if (block) {
    const text = block[1]
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, "").trim())
      .filter(Boolean)
      .join(" ")
      .trim();
    if (text) {
      return text;
    }
  }
  const lineComments = trimmed.match(/^(?:\/\/[^\n]*\n)+/);
  if (lineComments) {
    const text = lineComments[0]
      .split("\n")
      .map((l) => l.replace(/^\s*\/\/\s?/, "").trim())
      .filter(Boolean)
      .join(" ")
      .trim();
    if (text) {
      return text;
    }
  }
  return "";
}

function buildComponentExampleItems(componentDirs, knownComponents) {
  const items = [];

  for (const componentDir of componentDirs.sort()) {
    const componentName = componentDir;
    const files = readdirSync(join(DEMOS_DIR, componentDir))
      .filter((f) => f.endsWith(".tsx") && !f.startsWith("_"))
      .sort();

    for (const file of files) {
      const variant = file.replace(/\.tsx$/, "");
      const name = `${componentName}-${variant}`;
      const filePath = join(DEMOS_DIR, componentDir, file);
      const source = readFileSync(filePath, "utf-8");
      const registryDeps = extractKeystoneImports(source).filter((dep) =>
        knownComponents.has(dep)
      );

      const item = {
        name,
        type: "registry:example",
        title: `${toTitleCase(componentName)} ${toTitleCase(variant)}`,
        description:
          extractDemoDescription(source) ||
          `${toTitleCase(componentName)} example: ${toTitleCase(variant)}.`,
      };

      if (registryDeps.length > 0) {
        item.registryDependencies = registryDeps;
      }

      item.files = [
        {
          path: `apps/docs/demos/${componentDir}/${file}`,
          type: "registry:example",
        },
      ];

      items.push(item);
    }
  }

  return items;
}

function buildExampleItems(uiNames) {
  // Examples cover per-component demos only. Blocks are first-class
  // registry:block items (hand-maintained in registry.json) and are not
  // also dual-registered as registry:example — that mirrors shadcn's
  // separation and avoids search-result duplication.
  const componentDirs = readdirSync(DEMOS_DIR).filter((entry) => {
    if (entry.startsWith("_") || entry.startsWith(".")) {
      return false;
    }
    const full = join(DEMOS_DIR, entry);
    if (!statSync(full).isDirectory()) {
      return false;
    }
    if (entry === "blocks") {
      return false;
    }
    return true;
  });

  const knownComponents = new Set(uiNames);
  return buildComponentExampleItems(componentDirs, knownComponents);
}

function warnOnUncategorizedBlocks(blockItems) {
  const uncategorized = blockItems
    .filter((i) => i.type === "registry:block")
    .filter((i) => !(Array.isArray(i.categories) && i.categories.length > 0))
    .map((i) => i.name);

  if (uncategorized.length === 0) {
    return;
  }
  console.warn(
    `\n⚠ ${uncategorized.length} block(s) missing \`categories\`: ${uncategorized.join(", ")}`
  );
  console.warn(
    "  Every registry:block item should declare at least one category " +
      "(e.g. ['authentication', 'login'], ['betting'], ['data']). " +
      "See AGENTS.md → Block Authoring."
  );
}

const registryEntries = parseRegistryTs();
const mdxMeta = parseMdxDescriptions();
const uiItems = buildUiItems(registryEntries, mdxMeta);
const exampleItems = buildExampleItems(registryEntries.map((e) => e.name));

const existing = JSON.parse(readFileSync(REGISTRY_JSON, "utf-8"));
const blockItems = existing.items.filter(
  (i) => i.type !== "registry:ui" && i.type !== "registry:example"
);

warnOnUncategorizedBlocks(blockItems);

const merged = {
  $schema: existing.$schema,
  name: existing.name,
  homepage: existing.homepage,
  items: [...uiItems, ...blockItems, ...exampleItems],
};

writeFileSync(REGISTRY_JSON, JSON.stringify(merged, null, 2) + "\n");

console.log(
  `Synced registry.json: ${uiItems.length} UI components + ${blockItems.length} blocks + ${exampleItems.length} examples = ${merged.items.length} total items`
);
