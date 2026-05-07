#!/usr/bin/env node

/**
 * Validates that every apps/docs/content/docs/components/<name>.mdx follows
 * the canonical structure documented in _template.mdx.
 *
 * Exits non-zero on any violation.
 *
 * Rules:
 *   1. Frontmatter must contain `title:` and `description:`.
 *   2. ## Installation must exist with a <CodeBlockTabs> block referencing
 *      the component's registry URL.
 *   3. ## Usage must exist.
 *   4. Compound components (Usage import has more than one named export)
 *      must contain ## Composition.
 *   5. Variant subheadings must be ###-level under ## Examples — no loose
 *      top-level variant H2s allowed (anything that contains a
 *      <ComponentPreview> and isn't a protected section name).
 *   6. ## API Reference must exist with at least one Markdown table.
 *   7. Every <ComponentPreview name="X"> referenced in MDX must exist as a
 *      key in apps/docs/demos/index.ts.
 */

import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const COMPONENTS_DIR = join(ROOT, "apps/docs/content/docs/components");
const DEMOS_INDEX = join(ROOT, "apps/docs/demos/index.ts");

const PROTECTED_HEADINGS = new Set([
  "Import",
  "Installation",
  "Usage",
  "Composition",
  "Examples",
  "RTL",
  "API Reference",
  "Related Blocks",
]);

// Files that legitimately don't follow the canonical component-MDX shape
// (utility-class references, multi-component overview pages, etc.).
// Each entry must have a one-line rationale below it.
const STRUCTURE_EXEMPT = new Set([
  // utility-class reference, not a component — no Usage/API Reference applies
  "typography",
]);

function loadDemoNames() {
  const content = readFileSync(DEMOS_INDEX, "utf-8");
  const names = new Set();
  // demos: Record<string, DemoItem> entries look like:  "key-name": { ... }
  const matches = content.matchAll(/^\s*"([^"]+)":\s*\{/gm);
  for (const m of matches) {
    names.add(m[1]);
  }
  return names;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return null;
  }
  const fields = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (m) {
      fields[m[1]] = m[2].trim();
    }
  }
  return fields;
}

function getH2Sections(content) {
  // Returns ordered list of { heading, body, lineNumber }
  const lines = content.split("\n");
  const sections = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      if (current) {
        sections.push(current);
      }
      current = {
        heading: line.slice(3).trim(),
        body: [],
        lineNumber: i + 1,
      };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) {
    sections.push(current);
  }
  for (const s of sections) {
    s.body = s.body.join("\n");
  }
  return sections;
}

function isCompound(content) {
  const matches = content.matchAll(
    /import\s*\{([^}]+)\}\s*from\s*["']@keystoneui\/react\//g
  );
  for (const m of matches) {
    const names = m[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length > 1) {
      return true;
    }
  }
  return false;
}

function checkFrontmatter(content) {
  const errors = [];
  const fm = parseFrontmatter(content);
  if (!fm) {
    errors.push("missing frontmatter");
    return errors;
  }
  if (!fm.title) {
    errors.push("frontmatter missing `title`");
  }
  if (!fm.description) {
    errors.push("frontmatter missing `description`");
  }
  return errors;
}

function checkInstallation(componentName, sections, headingNames) {
  if (!headingNames.has("Installation")) {
    return ["missing ## Installation"];
  }
  const errors = [];
  const install = sections.find((s) => s.heading === "Installation");
  if (!install.body.includes("<CodeBlockTabs")) {
    errors.push("## Installation must contain a <CodeBlockTabs> block");
  }
  if (!install.body.includes(`/${componentName}.json`)) {
    errors.push(
      `## Installation must reference https://keystoneui.io/r/${componentName}.json`
    );
  }
  return errors;
}

function checkApiReference(sections, headingNames) {
  if (!headingNames.has("API Reference")) {
    return ["missing ## API Reference"];
  }
  const api = sections.find((s) => s.heading === "API Reference");
  if (!/^\|.+\|$/m.test(api.body)) {
    return ["## API Reference must contain at least one props table"];
  }
  return [];
}

function checkLooseVariantH2s(sections) {
  const loose = sections
    .filter(
      (s) =>
        !PROTECTED_HEADINGS.has(s.heading) && /<ComponentPreview\b/.test(s.body)
    )
    .map((s) => `${s.heading} (line ${s.lineNumber})`);
  if (loose.length === 0) {
    return [];
  }
  return [
    `loose variant H2s (must be ### under ## Examples): ${loose.join(", ")}`,
  ];
}

function checkPreviewDemoNames(content, demoNames) {
  const errors = [];
  const matches = content.matchAll(
    /<ComponentPreview\s+[^>]*\bname=["']([^"']+)["']/g
  );
  for (const m of matches) {
    if (!demoNames.has(m[1])) {
      errors.push(`<ComponentPreview name="${m[1]}"> — no demo registered`);
    }
  }
  return errors;
}

function lintFile(filePath, demoNames) {
  const content = readFileSync(filePath, "utf-8");
  const componentName = basename(filePath, ".mdx");

  // Exempt files only get frontmatter + preview-name validation.
  // Skip structural checks (Installation, Usage, Composition, API Reference).
  if (STRUCTURE_EXEMPT.has(componentName)) {
    return {
      componentName,
      errors: [
        ...checkFrontmatter(content),
        ...checkPreviewDemoNames(content, demoNames),
      ],
    };
  }

  const sections = getH2Sections(content);
  const headingNames = new Set(sections.map((s) => s.heading));

  const errors = [
    ...checkFrontmatter(content),
    ...checkInstallation(componentName, sections, headingNames),
    ...(headingNames.has("Usage") ? [] : ["missing ## Usage"]),
    ...(isCompound(content) && !headingNames.has("Composition")
      ? [
          "compound component (multiple named exports in import) missing ## Composition",
        ]
      : []),
    ...checkLooseVariantH2s(sections),
    ...checkApiReference(sections, headingNames),
    ...checkPreviewDemoNames(content, demoNames),
  ];

  return { componentName, errors };
}

function main() {
  const demoNames = loadDemoNames();
  const files = readdirSync(COMPONENTS_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .sort();

  let totalErrors = 0;
  for (const file of files) {
    const result = lintFile(join(COMPONENTS_DIR, file), demoNames);
    if (result.errors.length > 0) {
      console.log(`\n${result.componentName}:`);
      for (const err of result.errors) {
        console.log(`  - ${err}`);
      }
      totalErrors += result.errors.length;
    }
  }

  if (totalErrors === 0) {
    console.log(`OK — ${files.length} component MDX files validated.`);
    process.exit(0);
  }

  console.log(`\nFAIL — ${totalErrors} error(s) across component MDX files.`);
  process.exit(1);
}

main();
