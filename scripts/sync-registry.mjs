#!/usr/bin/env node

/**
 * Syncs UI component entries from _registry.ts + MDX frontmatter into registry.json.
 *
 * Usage:
 *   node scripts/sync-registry.mjs           regenerate registry.json
 *   node scripts/sync-registry.mjs --check   fail if it is out of date
 *   pnpm sync:registry
 *
 * --check writes nothing. registry.json is generated but committed, so CI has
 * to detect drift rather than quietly regenerate it -- `shadcn registry
 * validate` downstream would otherwise be validating whatever the last local
 * sync happened to leave behind.
 *
 * Reads:
 *   - packages/ui/src/_registry.ts        (component metadata)
 *   - apps/docs/content/docs/components/  (MDX descriptions)
 *   - packages/ui/registry/default.json   (registry:style -- full theme setup)
 *   - packages/ui/registry/themes/*.json  (registry:theme -- color palettes)
 *   - registry.json                       (existing blocks)
 *
 * Writes:
 *   - registry.json                       (merged: style + themes + UI components
 *                                          + blocks + examples)
 *   - apps/docs/public/r/themes/          (created if missing -- see note in
 *                                          ensureNestedOutputDirs)
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const REGISTRY_TS = join(ROOT, "packages/ui/src/_registry.ts");
const UI_SRC_DIR = join(ROOT, "packages/ui/src");
const MDX_DIR = join(ROOT, "apps/docs/content/docs/components");
const DEMOS_DIR = join(ROOT, "apps/docs/demos");
const REGISTRY_JSON = join(ROOT, "registry.json");
const STYLE_JSON = join(ROOT, "packages/ui/registry/default.json");
const THEMES_DIR = join(ROOT, "packages/ui/registry/themes");
const BUILD_OUTPUT_DIR = join(ROOT, "apps/docs/public/r");

/** Item types owned by packages/ui/registry/ and regenerated on every sync. */
const THEME_ITEM_TYPES = new Set(["registry:style", "registry:theme"]);

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

/**
 * Sibling components a source file imports relatively (`./button`).
 *
 * These are real registry dependencies, but `_registry.ts` lists them by hand,
 * so they get missed -- `date-input` and `input-group` both shipped without
 * them, which installs a file whose sibling import resolves to nothing.
 * Deriving them from the source makes that class of omission impossible.
 */
function extractSiblingImports(name) {
  const file = join(UI_SRC_DIR, `${name}.tsx`);
  if (!existsSync(file)) {
    return [];
  }
  const source = readFileSync(file, "utf-8");
  const siblings = new Set();
  for (const match of source.matchAll(/from\s+["']\.\/([a-z0-9-]+)["']/g)) {
    // `utils` is not a registry item -- it is the consumer's own lib/utils,
    // and the built output rewrites the specifier to point at it.
    if (match[1] !== "utils") {
      siblings.add(match[1]);
    }
  }
  return [...siblings];
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

    const registryDeps = [
      ...new Set([
        ...entry.registryDependencies,
        ...extractSiblingImports(entry.name),
      ]),
    ].sort();

    if (registryDeps.length > 0) {
      item.registryDependencies = registryDeps;
    }

    item.files = [
      {
        path: `packages/ui/src/${entry.name}.tsx`,
        // Without an explicit target, shadcn derives the destination from the
        // source path and writes `components/ui/src/<name>.tsx` -- a doubled
        // segment that puts the file somewhere nothing imports from.
        target: `components/ui/${entry.name}.tsx`,
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

function buildThemeItems() {
  const items = [];

  // registry:style -- the full setup item, served at /r/default.json.
  const style = JSON.parse(readFileSync(STYLE_JSON, "utf-8"));
  items.push(style);

  // registry:theme -- one palette per file, served at /r/themes/<name>.json.
  // The item `name` carries the `themes/` prefix because `shadcn build` writes
  // each item to `<outputDir>/<item.name>.json`, so the name *is* the URL path.
  const themeFiles = readdirSync(THEMES_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  for (const file of themeFiles) {
    const theme = JSON.parse(readFileSync(join(THEMES_DIR, file), "utf-8"));
    const expected = `themes/${file.replace(/\.json$/, "")}`;
    if (theme.name !== expected) {
      throw new Error(
        `${join(THEMES_DIR, file)}: item name is "${theme.name}" but must be ` +
          `"${expected}" so that \`shadcn build\` emits it at ` +
          `apps/docs/public/r/${expected}.json (the URL the docs instruct).`
      );
    }
    items.push(theme);
  }

  return items;
}

/**
 * `shadcn build` writes each item with a plain `fs.writeFile` to
 * `<outputDir>/<item.name>.json` and does NOT create parent directories, so a
 * slash-bearing item name (e.g. `themes/zinc`) fails with ENOENT unless the
 * subdirectory already exists. Create the ones our item names imply.
 */
function ensureNestedOutputDirs(items) {
  const dirs = new Set();
  for (const item of items) {
    const slash = item.name.lastIndexOf("/");
    if (slash > 0) {
      dirs.add(item.name.slice(0, slash));
    }
  }
  for (const dir of [...dirs].sort()) {
    mkdirSync(join(BUILD_OUTPUT_DIR, dir), { recursive: true });
  }
  return [...dirs].sort();
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

const themeItems = buildThemeItems();

const existing = JSON.parse(readFileSync(REGISTRY_JSON, "utf-8"));
// Blocks are hand-maintained in registry.json and passed through. Style/theme
// items are owned by packages/ui/registry/ and regenerated here, so drop any
// stale copies before merging.
const blockItems = existing.items.filter(
  (i) =>
    i.type !== "registry:ui" &&
    i.type !== "registry:example" &&
    !THEME_ITEM_TYPES.has(i.type)
);

warnOnUncategorizedBlocks(blockItems);

const merged = {
  $schema: existing.$schema,
  name: existing.name,
  homepage: existing.homepage,
  items: [...themeItems, ...uiItems, ...blockItems, ...exampleItems],
};

const serialized = JSON.stringify(merged, null, 2) + "\n";

if (process.argv.includes("--check")) {
  if (readFileSync(REGISTRY_JSON, "utf-8") !== serialized) {
    console.error(
      "registry.json is out of date. Run `pnpm registry:sync` and commit the result."
    );
    process.exit(1);
  }
  console.log(`registry.json is up to date (${merged.items.length} items)`);
  process.exit(0);
}

writeFileSync(REGISTRY_JSON, serialized);

const nestedDirs = ensureNestedOutputDirs(merged.items);

console.log(
  `Synced registry.json: ${themeItems.length} style/theme + ${uiItems.length} UI components + ${blockItems.length} blocks + ${exampleItems.length} examples = ${merged.items.length} total items`
);
if (nestedDirs.length > 0) {
  console.log(
    `Ensured nested build output dir(s): ${nestedDirs.map((d) => `apps/docs/public/r/${d}`).join(", ")}`
  );
}
