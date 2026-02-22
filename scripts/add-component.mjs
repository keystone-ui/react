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

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const UI_DIR = join(ROOT, "packages/ui");
const STORYBOOK_DIR = join(ROOT, "apps/storybook/stories");
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
    console.error(`Error: Invalid component name "${kebab}". Use letters, numbers, and hyphens only.`);
    process.exit(1);
  }

  const componentPath = join(UI_DIR, "src", `${kebab}.tsx`);
  if (existsSync(componentPath)) {
    console.error(`Error: Component "${kebab}" already exists at ${componentPath}`);
    process.exit(1);
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

function mdxTemplate(pascal, kebab) {
  return `---
title: ${pascal}
description: TODO - Add a description for the ${pascal} component.
---

## Import

\`\`\`tsx
import { ${pascal} } from "@keystoneui/react/${kebab}";
\`\`\`

## Usage

<ComponentPreview name="${kebab}-default" />

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| \`className\` | \`string\` | - | Additional CSS classes |
| \`children\` | \`ReactNode\` | - | Content |
`;
}

// --- File modifiers ---

function addPackageJsonExport(kebab) {
  const pkgPath = join(UI_DIR, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

  if (pkg.exports[`./${kebab}`]) {
    console.log(`  ⊘ package.json export already exists`);
    return;
  }

  pkg.exports[`./${kebab}`] = `./src/${kebab}.tsx`;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`  ✓ packages/ui/package.json — added export "./${kebab}"`);
}

function addTsupEntry(kebab) {
  const tsupPath = join(UI_DIR, "tsup.config.ts");
  let content = readFileSync(tsupPath, "utf-8");

  const entry = `"src/${kebab}.tsx"`;
  if (content.includes(entry)) {
    console.log(`  ⊘ tsup.config.ts entry already exists`);
    return;
  }

  // Insert before the closing bracket of entryPoints
  content = content.replace(
    /("src\/utils\.ts",?)\s*\]/,
    `$1\n    ${entry},\n  ]`
  );
  writeFileSync(tsupPath, content);
  console.log(`  ✓ packages/ui/tsup.config.ts — added entry`);
}

function addRegistryEntry(kebab) {
  const registryPath = join(UI_DIR, "src/_registry.ts");
  let content = readFileSync(registryPath, "utf-8");

  if (content.includes(`name: "${kebab}"`)) {
    console.log(`  ⊘ _registry.ts entry already exists`);
    return;
  }

  const entry = `  {
    name: "${kebab}",
    type: "registry:ui",
    dependencies: [],
    files: [{ path: "ui/${kebab}.tsx", type: "registry:ui" }],
  },`;

  // Insert before the closing ];
  content = content.replace(/\n];/, `\n${entry}\n];`);
  writeFileSync(registryPath, content);
  console.log(`  ✓ packages/ui/src/_registry.ts — added entry`);
}

function addDemoRegistryEntry(pascal, kebab) {
  const indexPath = join(DOCS_DIR, "demos/index.ts");
  let content = readFileSync(indexPath, "utf-8");

  const importName = `${pascal}Default`;
  const importLine = `import ${importName} from "./${kebab}/default";`;

  if (content.includes(importLine)) {
    console.log(`  ⊘ demos/index.ts entry already exists`);
    return;
  }

  // Add import before the DemoItem interface
  content = content.replace(
    /\nexport interface DemoItem/,
    `\n${importLine}\n\nexport interface DemoItem`
  );

  // Add registry entry before closing };
  const entry = `  "${kebab}-default": {
    component: ${importName},
    file: "${kebab}/default.tsx",
  },`;
  content = content.replace(/\n};/, `\n${entry}\n};`);

  writeFileSync(indexPath, content);
  console.log(`  ✓ apps/docs/demos/index.ts — added import + entry`);
}

function addToComponentsMetaJson(kebab) {
  const metaPath = join(DOCS_DIR, "content/docs/components/meta.json");
  const meta = JSON.parse(readFileSync(metaPath, "utf-8"));

  if (meta.pages.includes(kebab)) {
    console.log(`  ⊘ components/meta.json already includes "${kebab}"`);
    return;
  }

  // Add before the last entry
  meta.pages.push(kebab);
  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
  console.log(`  ✓ apps/docs/content/docs/components/meta.json — added "${kebab}"`);
}

// --- Main ---

const rawName = process.argv[2];

if (!rawName) {
  console.log("Usage: pnpm add:component <ComponentName>");
  console.log("");
  console.log("Examples:");
  console.log("  pnpm add:component DatePicker");
  console.log("  pnpm add:component date-picker");
  process.exit(1);
}

const kebab = toKebabCase(rawName);
const pascal = toPascalCase(kebab);

validate(kebab);

console.log(`\nScaffolding component: ${pascal} (${kebab})\n`);

// Create files
console.log("Creating files:");

const componentPath = join(UI_DIR, "src", `${kebab}.tsx`);
writeFileSync(componentPath, componentTemplate(pascal, kebab));
console.log(`  ✓ packages/ui/src/${kebab}.tsx`);

const storyPath = join(STORYBOOK_DIR, `${kebab}.stories.tsx`);
writeFileSync(storyPath, storyTemplate(pascal, kebab));
console.log(`  ✓ apps/storybook/stories/${kebab}.stories.tsx`);

const demoDir = join(DOCS_DIR, "demos", kebab);
mkdirSync(demoDir, { recursive: true });
writeFileSync(join(demoDir, "default.tsx"), demoTemplate(pascal, kebab));
console.log(`  ✓ apps/docs/demos/${kebab}/default.tsx`);

const mdxPath = join(DOCS_DIR, "content/docs/components", `${kebab}.mdx`);
writeFileSync(mdxPath, mdxTemplate(pascal, kebab));
console.log(`  ✓ apps/docs/content/docs/components/${kebab}.mdx`);

// Update existing files
console.log("\nUpdating registries:");

addPackageJsonExport(kebab);
addTsupEntry(kebab);
addRegistryEntry(kebab);
addDemoRegistryEntry(pascal, kebab);
addToComponentsMetaJson(kebab);

console.log(`
Done! Next steps:

  1. Implement the component in packages/ui/src/${kebab}.tsx
  2. Develop with Storybook:  pnpm dev --filter=storybook
  3. Add more stories in apps/storybook/stories/${kebab}.stories.tsx
  4. Create additional demos in apps/docs/demos/${kebab}/
  5. Update the MDX docs in apps/docs/content/docs/components/${kebab}.mdx

See CONTRIBUTING.md for the full workflow.
`);
