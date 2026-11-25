#!/usr/bin/env node

/**
 * Scaffolding script for adding a new Keystone UI component.
 *
 * Usage:
 *   pnpm add:component MyComponent
 *   pnpm add:component my-component
 *
 * This creates all necessary files across the monorepo:
 *   - Component source file
 *   - package.json export
 *   - tsup.config.ts entry
 *   - _registry.ts entry
 *   - Storybook story template
 *   - Fumadocs demo + registry entry + MDX page
 */

import {
  closeSync,
  fstatSync,
  ftruncateSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  writeSync,
} from "node:fs";
import { join, relative } from "node:path";

import { renderLoader, renderManifest } from "./gen-demos.mjs";
import { demoEntriesFromPaths } from "./lib/demo-entries.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const UI_DIR = join(ROOT, "packages/ui");
const DOCS_DIR = join(ROOT, "apps/docs");

// --- Name utilities ---

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function toPascalCase(str) {
  return str
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

// --- Validation ---

function validate(kebab) {
  if (!/^[a-z][a-z0-9-]*$/.test(kebab)) {
    console.error(
      `Error: Invalid component name "${kebab}". Use letters, numbers, and hyphens only.`
    );
    process.exit(1);
  }
}

// --- Collision check ---

/** Repo-relative paths of the four files the scaffold creates. */
function destinations(name) {
  return [
    `packages/ui/src/${name}.tsx`,
    `apps/storybook/stories/${name}.stories.tsx`,
    `apps/docs/demos/${name}/default.tsx`,
    `apps/docs/content/docs/components/${name}.mdx`,
  ];
}

/** lstat, so a dangling symlink counts as taken rather than written through. */
function statOrNull(path) {
  try {
    return lstatSync(path);
  } catch {
    return null;
  }
}

/**
 * Everything the scaffold would create or add that is already there, one
 * line each. Runs before the first write: a single collision means nothing
 * is written, so a contributor's existing story, demo or page survives.
 */
function findCollisions(name) {
  const collisions = [];

  for (const path of destinations(name)) {
    if (statOrNull(join(ROOT, path))) {
      collisions.push(path);
    }
  }
  const demoDir = `apps/docs/demos/${name}`;
  const demoDirStat = statOrNull(join(ROOT, demoDir));
  if (demoDirStat && !demoDirStat.isDirectory()) {
    collisions.push(`${demoDir} (exists and is not a directory)`);
  }

  collisions.push(
    ...duplicateDemoKeys([...demoFiles(), `${name}/default.tsx`])
  );

  const pkg = JSON.parse(readFileSync(join(UI_DIR, "package.json"), "utf-8"));
  const exportKey = `./${name}`;
  if (pkg.exports && Object.hasOwn(pkg.exports, exportKey)) {
    collisions.push(`packages/ui/package.json: exports "${exportKey}"`);
  }
  const published = pkg.publishConfig?.exports;
  if (published && Object.hasOwn(published, exportKey)) {
    collisions.push(
      `packages/ui/package.json: publishConfig.exports "${exportKey}"`
    );
  }

  const tsup = readFileSync(join(UI_DIR, "tsup.config.ts"), "utf-8");
  if (tsup.includes(`"src/${name}.tsx"`)) {
    collisions.push(`packages/ui/tsup.config.ts: entry "src/${name}.tsx"`);
  }

  const registry = readFileSync(join(UI_DIR, "src/_registry.ts"), "utf-8");
  if (registry.includes(`name: "${name}"`)) {
    collisions.push(`packages/ui/src/_registry.ts: entry name: "${name}"`);
  }

  const meta = JSON.parse(
    readFileSync(join(DOCS_DIR, "content/docs/components/meta.json"), "utf-8")
  );
  if (meta.pages.includes(name)) {
    collisions.push(
      `apps/docs/content/docs/components/meta.json: pages "${name}"`
    );
  }

  return collisions;
}

const DEMOS = "apps/docs/demos";

/**
 * Every file under apps/docs/demos, relative and POSIX-separated, walked the
 * way gen-demos walks it. A missing demos folder counts as empty.
 */
function demoFiles() {
  const dir = join(ROOT, DEMOS);
  let entries;
  try {
    entries = readdirSync(dir, { recursive: true, withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(dir, join(entry.parentPath, entry.name)).split("\\").join("/")
    );
}

/**
 * One sentence per pair of demo files that get the same registry key, by
 * gen-demos' own key calculation. `scaffold/probe-default.tsx` and
 * `scaffold-probe/default.tsx` are both "scaffold-probe-default", and
 * gen-demos refuses to build a registry with a duplicate key.
 */
function duplicateDemoKeys(files) {
  const byKey = new Map();
  for (const file of [...new Set(files)].sort()) {
    const [entry] = demoEntriesFromPaths([file]);
    if (entry) {
      byKey.set(entry.key, [...(byKey.get(entry.key) ?? []), file]);
    }
  }
  const sentences = [];
  for (const [key, [first, ...others]] of byKey) {
    for (const other of others) {
      sentences.push(
        `Demo key "${key}" is produced by both ${DEMOS}/${first} and ${DEMOS}/${other}.`
      );
    }
  }
  return sentences;
}

function refuseCollisions(name) {
  const collisions = findCollisions(name);
  if (collisions.length === 0) {
    return;
  }
  console.error(
    `Error: "${name}" collides with what is already in the repo. Nothing was written.\n`
  );
  for (const collision of collisions) {
    console.error(`  ${collision}`);
  }
  console.error(
    "\nPick another name, or move the existing files and entries out of the way first."
  );
  process.exit(1);
}

// --- Write phase ---
//
// Past the check another process can still get somewhere first: a second
// run, an editor saving. So nothing is overwritten (files are opened `wx`)
// and nothing is ever removed: by the time something fails, a path this run
// created may hold someone else's save. The run stops at the first failure
// and lists what it created, for the person to look at.

/** Repo-relative paths this run created, in creation order. */
const created = [];

function stop(lines) {
  console.error(
    "\nError: scaffolding stopped part-way. Nothing was removed.\n"
  );
  for (const line of lines) {
    console.error(line);
  }
  console.error(
    `Paths created by this run: ${created.length > 0 ? created.join(", ") : "none"}.`
  );
  process.exit(1);
}

function stopAt(path, error) {
  const lines = [`Stopped at ${path} (${error.code ?? error.message}).`];
  if (error.code === "EEXIST") {
    lines.push(`${path} (appeared after the check)`);
  }
  stop(lines);
}

function closeQuietly(fd) {
  try {
    closeSync(fd);
  } catch {
    // The error already being reported is the one that matters.
  }
}

/** Writes all of `text` through `fd`, from `position` when one is given. */
function writeAll(fd, text, position = null) {
  const bytes = Buffer.from(text);
  let done = 0;
  while (done < bytes.length) {
    done += writeSync(
      fd,
      bytes,
      done,
      bytes.length - done,
      position === null ? null : position + done
    );
  }
  return bytes.length;
}

/**
 * Creates a file that must not exist (`wx`), writes it through that
 * descriptor and closes it. The path counts as created as soon as the open
 * succeeds, even if the write or the close then fails.
 */
function createFile(path, content) {
  let fd;
  try {
    fd = openSync(join(ROOT, path), "wx");
  } catch (error) {
    stopAt(path, error);
  }
  created.push(path);
  try {
    writeAll(fd, content);
  } catch (error) {
    closeQuietly(fd);
    stopAt(path, error);
  }
  try {
    closeSync(fd);
  } catch (error) {
    stopAt(path, error);
  }
}

/** One level of mkdir. An existing real directory is reused, not recorded. */
function makeDirectory(path) {
  try {
    mkdirSync(join(ROOT, path));
  } catch (error) {
    if (
      error.code === "EEXIST" &&
      statOrNull(join(ROOT, path))?.isDirectory()
    ) {
      return;
    }
    stopAt(path, error);
  }
  created.push(path);
}

/**
 * Rewrites a registry file through one descriptor: read it, apply `change`,
 * write back only if the bytes differ. A generated output that is absent is
 * created exclusively instead. Returns whether the file changed.
 */
function editFile(path, change, { generated = false } = {}) {
  let fd;
  try {
    fd = openSync(join(ROOT, path), "r+");
  } catch (error) {
    if (!(generated && error.code === "ENOENT")) {
      stopAt(path, error);
    }
  }
  if (fd === undefined) {
    let content;
    try {
      content = change(null);
    } catch (error) {
      stopAt(path, error);
    }
    createFile(path, content);
    return true;
  }
  try {
    if (!fstatSync(fd).isFile()) {
      throw new Error("not a regular file");
    }
    const source = readFileSync(fd, "utf-8");
    const next = change(source);
    if (next === source) {
      closeSync(fd);
      return false;
    }
    ftruncateSync(fd, writeAll(fd, next, 0));
    closeSync(fd);
    return true;
  } catch (error) {
    closeQuietly(fd);
    stopAt(path, error);
  }
}

// --- File generators ---

function componentTemplate(pascal, kebab) {
  return `"use client";

import * as React from "react";
import { cn } from "./utils";

interface ${pascal}Props extends React.HTMLAttributes<HTMLDivElement> {
  // Add props here
}

function ${pascal}({
  className,
  ref,
  ...props
}: ${pascal}Props & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      className={cn("", className)}
      data-slot="${kebab}"
      ref={ref}
      {...props}
    />
  );
}

export { ${pascal} };
export type { ${pascal}Props };
`;
}

function storyTemplate(pascal, kebab) {
  return `import type { Meta, StoryObj } from "@storybook/react";
import { ${pascal} } from "@keystoneui/react/${kebab}";

const meta: Meta<typeof ${pascal}> = {
  title: "${pascal}",
  component: ${pascal},
};

export default meta;
type Story = StoryObj<typeof ${pascal}>;

export const Default: Story = {
  render: () => (
    <${pascal}>
      ${pascal} component
    </${pascal}>
  ),
};
`;
}

function demoTemplate(pascal, kebab) {
  return `"use client";

import { ${pascal} } from "@keystoneui/react/${kebab}";

export default function ${pascal}Default() {
  return <${pascal}>${pascal} component</${pascal}>;
}
`;
}

// The canonical page of apps/docs/content/docs/components/_template.mdx:
// preview first, Installation, then Usage with the import. The demo above is
// a bare `return` of one element from that import, so Usage carries it as
// the snippet, as `migrate-component-mdx.mjs` would.
function mdxTemplate(pascal, kebab) {
  return `---
title: ${pascal}
description: TODO - Add a description for the ${pascal} component.
---

<ComponentPreview name="${kebab}-default" />

## Installation

<CodeBlockTabs items={["CLI", "Manual"]}>

\`\`\`bash tab="CLI"
npx shadcn@latest add https://keystoneui.io/r/${kebab}.json
\`\`\`

<div tab="Manual">

<Steps>

<Step>Install dependencies.</Step>

\`\`\`bash
pnpm add @keystoneui/react@beta @base-ui/react
\`\`\`

<Step>Copy the source.</Step>

<ComponentSource name="${kebab}-default" />

<Step>Update import paths to match your project.</Step>

</Steps>

</div>

</CodeBlockTabs>

## Usage

\`\`\`tsx
import { ${pascal} } from "@keystoneui/react/${kebab}";
\`\`\`

\`\`\`tsx
<${pascal}>${pascal} component</${pascal}>
\`\`\`

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| \`className\` | \`string\` | - | Additional CSS classes |
| \`children\` | \`ReactNode\` | - | Content |
`;
}

// --- Registry edits ---
//
// Each runs through editFile(), only after the four files are closed, in the
// order the main block calls them. A registry that already holds the entry
// is left byte-for-byte as it is.

function addPackageJsonExport(kebab) {
  const added = editFile("packages/ui/package.json", (source) => {
    const pkg = JSON.parse(source);
    if (pkg.exports[`./${kebab}`]) {
      return source;
    }
    pkg.exports[`./${kebab}`] = `./src/${kebab}.tsx`;
    if (pkg.publishConfig?.exports) {
      pkg.publishConfig.exports[`./${kebab}`] = {
        types: `./dist/${kebab}.d.ts`,
        default: `./dist/${kebab}.js`,
      };
    }
    return `${JSON.stringify(pkg, null, 2)}\n`;
  });
  console.log(
    added
      ? `  ✓ packages/ui/package.json — added export "./${kebab}"`
      : "  ⊘ package.json export already exists"
  );
}

function addTsupEntry(kebab) {
  const entry = `"src/${kebab}.tsx"`;
  const added = editFile("packages/ui/tsup.config.ts", (source) => {
    if (source.includes(entry)) {
      return source;
    }
    // Append before the closing bracket of the entryPoints array. Anchoring
    // on a particular last entry broke silently once `src/utils.ts` stopped
    // being last: the replace matched nothing and the script still reported
    // success, shipping an export that `tsup` never built.
    const updated = source.replace(
      /(entryPoints:\s*\[[\s\S]*?)(\n\s*\],)/,
      `$1\n    ${entry},$2`
    );
    if (updated === source) {
      throw new Error("could not find the entryPoints array");
    }
    return updated;
  });
  console.log(
    added
      ? "  ✓ packages/ui/tsup.config.ts — added entry"
      : "  ⊘ tsup.config.ts entry already exists"
  );
}

function addRegistryEntry(kebab) {
  const added = editFile("packages/ui/src/_registry.ts", (source) => {
    if (source.includes(`name: "${kebab}"`)) {
      return source;
    }
    const entry = `  {
    name: "${kebab}",
    type: "registry:ui",
    dependencies: [],
    files: [{ path: "ui/${kebab}.tsx", type: "registry:ui" }],
  },`;
    // Insert before the closing ];
    return source.replace(/\n];/, `\n${entry}\n];`);
  });
  console.log(
    added
      ? "  ✓ packages/ui/src/_registry.ts — added entry"
      : "  ⊘ _registry.ts entry already exists"
  );
}

/**
 * The demo files as they are now that the four files exist: another process
 * may have added a demo with the new key since the check. These are the
 * inputs for this run's manifest and loader.
 */
function liveDemoEntries() {
  let files;
  try {
    files = demoFiles();
  } catch (error) {
    stopAt(DEMOS, error);
  }
  const duplicates = duplicateDemoKeys(files);
  if (duplicates.length > 0) {
    stop(duplicates);
  }
  return demoEntriesFromPaths(files);
}

/** apps/docs/demos/manifest.json, rendered by gen-demos' own renderer. */
function writeDemoManifest(entries) {
  editFile(`${DEMOS}/manifest.json`, () => renderManifest(entries), {
    generated: true,
  });
}

/** apps/docs/demos/loader.tsx, rendered by gen-demos' own renderer. */
function writeDemoLoader(entries) {
  editFile(`${DEMOS}/loader.tsx`, () => renderLoader(entries), {
    generated: true,
  });
  console.log("  ✓ apps/docs/demos — registry regenerated");
}

function addToComponentsMetaJson(kebab) {
  const added = editFile(
    "apps/docs/content/docs/components/meta.json",
    (source) => {
      const meta = JSON.parse(source);
      if (meta.pages.includes(kebab)) {
        return source;
      }
      meta.pages.push(kebab);
      return `${JSON.stringify(meta, null, 2)}\n`;
    }
  );
  console.log(
    added
      ? `  ✓ apps/docs/content/docs/components/meta.json — added "${kebab}"`
      : `  ⊘ components/meta.json already includes "${kebab}"`
  );
}

// --- Main ---

const rawName = process.argv[2];

if (!rawName) {
  console.log("Usage: pnpm add:component <ComponentName>");
  console.log("");
  console.log("Examples:");
  console.log("  pnpm add:component MyComponent");
  console.log("  pnpm add:component my-component");
  process.exit(1);
}

const kebab = toKebabCase(rawName);
const pascal = toPascalCase(kebab);

validate(kebab);
refuseCollisions(kebab);

console.log(`\nScaffolding component: ${pascal} (${kebab})\n`);

// Create files
console.log("Creating files:");

const [componentFile, storyFile, demoFile, mdxFile] = destinations(kebab);

createFile(componentFile, componentTemplate(pascal, kebab));
console.log(`  ✓ ${componentFile}`);
createFile(storyFile, storyTemplate(pascal, kebab));
console.log(`  ✓ ${storyFile}`);
makeDirectory(DEMOS);
makeDirectory(`${DEMOS}/${kebab}`);
createFile(demoFile, demoTemplate(pascal, kebab));
console.log(`  ✓ ${demoFile}`);
createFile(mdxFile, mdxTemplate(pascal, kebab));
console.log(`  ✓ ${mdxFile}`);

// Registries, only once all four files are closed
console.log("\nUpdating registries:");

const demoEntries = liveDemoEntries();
addPackageJsonExport(kebab);
addTsupEntry(kebab);
addRegistryEntry(kebab);
writeDemoManifest(demoEntries);
writeDemoLoader(demoEntries);
addToComponentsMetaJson(kebab);

console.log(`
Done! Next steps:

  1. Implement the component in packages/ui/src/${kebab}.tsx
  2. Develop with Storybook:  pnpm dev --filter=@keystoneui/storybook
  3. Add more stories in apps/storybook/stories/${kebab}.stories.tsx
  4. Create additional demos in apps/docs/demos/${kebab}/
  5. Update the MDX docs in apps/docs/content/docs/components/${kebab}.mdx
  6. Run pnpm gen:static-paths, or the new docs and preview URLs answer 404

See CONTRIBUTING.md for the full workflow.
`);
