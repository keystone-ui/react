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

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const REGISTRY_TS = join(ROOT, "packages/ui/src/_registry.ts");
const MDX_DIR = join(ROOT, "apps/docs/content/docs/components");
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

const registryEntries = parseRegistryTs();
const mdxMeta = parseMdxDescriptions();
const uiItems = buildUiItems(registryEntries, mdxMeta);

const existing = JSON.parse(readFileSync(REGISTRY_JSON, "utf-8"));
const blockItems = existing.items.filter((i) => i.type !== "registry:ui");

const merged = {
  $schema: existing.$schema,
  name: existing.name,
  homepage: existing.homepage,
  items: [...uiItems, ...blockItems],
};

writeFileSync(REGISTRY_JSON, JSON.stringify(merged, null, 2) + "\n");

console.log(
  `Synced registry.json: ${uiItems.length} UI components + ${blockItems.length} blocks = ${merged.items.length} total items`
);
