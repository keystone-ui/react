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
 *   4. Compound components must contain ## Composition. A component is
 *      compound when its Usage import names more than one export, or when
 *      packages/ui/src/<name>.tsx exports more than one component — a page
 *      whose Usage only shows the shorthand (`<Progress value={60} />`) still
 *      owes agents the parts tree.
 *   5. Variant subheadings must be ###-level under ## Examples — no loose
 *      top-level variant H2s allowed (anything that contains a
 *      <ComponentPreview> and isn't a protected section name).
 *   6. ## API Reference must exist with at least one Markdown table.
 *   7. Every <ComponentPreview name="X"> referenced in MDX must exist as a
 *      key in apps/docs/demos/manifest.json.
 *   8. No ## Import section: the import line lives at the top of ## Usage.
 *      A ## Usage holding only the import passes; no snippet is demanded.
 *      Any H2 that renders as "Import" counts (`##  Import`, `## Import ##`,
 *      a Setext underline); a `## Import` line inside a code fence does not.
 *
 * H2s are read the way the MDX parser reads them: lines inside a ``` or ~~~
 * fence are never headings.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const COMPONENTS_DIR = join(ROOT, "apps/docs/content/docs/components");
const UI_SRC = join(ROOT, "packages/ui/src");
const DEMOS_MANIFEST = join(ROOT, "apps/docs/demos/manifest.json");

const PROTECTED_HEADINGS = new Set([
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
  // a page of composition examples: no component and no registry item of its own
  "date-picker",
  // a provider that renders no UI: its page centres on the generated English table, not on parts
  "strings",
]);

function loadDemoNames() {
  // manifest.json is generated from the demo files by scripts/gen-demos.mjs.
  return new Set(
    Object.keys(JSON.parse(readFileSync(DEMOS_MANIFEST, "utf-8")))
  );
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

// Markdown block syntax, as the docs' MDX parser reads it. Kept in step with
// the copy in scripts/migrate-component-mdx.mjs; each script stays standalone.
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const ATX_H2_RE = /^ {0,3}##(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const SETEXT_H2_RE = /^ {0,3}-+[ \t]*$/;
// A line that starts some other block, so it cannot be a Setext heading text.
const NOT_PARAGRAPH_RE = /^\s*(?:[<{|>#]|[-*+][ \t]|\d+[.)][ \t])/;

/** The marker of the fence `line` opens, or null. */
function opensFence(line) {
  const f = FENCE_RE.exec(line);
  // A backtick fence's info string cannot hold a backtick.
  return f && !(f[1][0] === "`" && f[2].includes("`")) ? f[1] : null;
}

/** Whether `line` closes the fence opened with `marker`. */
function closesFence(line, marker) {
  const f = FENCE_RE.exec(line);
  return (
    f !== null &&
    f[1][0] === marker[0] &&
    f[1].length >= marker.length &&
    f[2].trim() === ""
  );
}

/** Whether lines[i] is a one-line paragraph that lines[i + 1] underlines. */
function isSetextText(lines, out, i) {
  const prev = i === 0 ? null : out[i - 1];
  const startsParagraph =
    prev === null ||
    prev.fenced ||
    prev.h2 !== null ||
    lines[i - 1].trim() === "";
  return (
    startsParagraph &&
    !out[i].fenced &&
    out[i].h2 === null &&
    !out[i].underline &&
    !out[i + 1].fenced &&
    lines[i].trim() !== "" &&
    !NOT_PARAGRAPH_RE.test(lines[i]) &&
    SETEXT_H2_RE.test(lines[i + 1])
  );
}

/**
 * One entry per line: `fenced` when the line opens, sits in or closes a
 * ``` or ~~~ code fence; `h2` holds the heading text when the line starts an
 * H2 (`## Text`, `##\tText`, `## Text ##`, or a Setext `Text` over `---`);
 * `underline` marks a Setext heading's second line.
 */
function scanLines(lines) {
  const out = [];
  let fence = null;
  for (const line of lines) {
    if (fence) {
      if (closesFence(line, fence)) {
        fence = null;
      }
      out.push({ fenced: true, h2: null });
      continue;
    }
    fence = opensFence(line);
    const atx = fence ? null : ATX_H2_RE.exec(line);
    out.push({
      fenced: fence !== null,
      h2: atx ? (atx[1] ?? "").trim() : null,
    });
  }
  for (let i = 0; i + 1 < lines.length; i++) {
    if (isSetextText(lines, out, i)) {
      out[i] = { fenced: false, h2: lines[i].trim() };
      out[i + 1] = { fenced: false, h2: null, underline: true };
    }
  }
  return out;
}

/** The page's lines after the frontmatter, with their 1-based line numbers. */
function bodyLines(content) {
  const lines = content.split("\n");
  const fm = content.match(/^---\n[\s\S]*?\n---\n/);
  const skip = fm ? fm[0].split("\n").length - 1 : 0;
  const rest = lines.slice(skip);
  return { first: skip + 1, lines: rest, scan: scanLines(rest) };
}

function getH2Sections(content) {
  // Returns ordered list of { heading, body, lineNumber }
  const { first, lines, scan } = bodyLines(content);
  const sections = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (scan[i].h2 !== null) {
      if (current) {
        sections.push(current);
      }
      current = {
        heading: scan[i].h2,
        body: [],
        lineNumber: first + i,
      };
    } else if (current && !scan[i].underline) {
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

// Multi-export components whose extra exports are not composition parts.
// Each entry must have a one-line rationale below it.
const COMPOSITION_EXEMPT = new Set([
  // CalendarDayButton is a slot override passed via `components`, not a child
  "calendar",
]);

const EXPORT_BLOCK_RE = /export\s*\{([^}]*)\}/g;
const EXPORT_DECL_RE = /export\s+(?:const|function)\s+([A-Z][A-Za-z]*)\b/g;
const NOT_A_PART_RE = /(?:Props|Variants?|Context|Style)$/;

/** PascalCase component exports of packages/ui/src/<name>.tsx. */
function sourceComponentExports(componentName) {
  const file = join(UI_SRC, `${componentName}.tsx`);
  if (!existsSync(file)) {
    return [];
  }
  const source = readFileSync(file, "utf-8");
  const names = new Set();
  for (const block of source.matchAll(EXPORT_BLOCK_RE)) {
    for (const raw of block[1].split(",")) {
      const name = raw.replace("type ", "").split(" as ").at(-1).trim();
      if (/^[A-Z]/.test(name) && !NOT_A_PART_RE.test(name)) {
        names.add(name);
      }
    }
  }
  for (const decl of source.matchAll(EXPORT_DECL_RE)) {
    if (!NOT_A_PART_RE.test(decl[1])) {
      names.add(decl[1]);
    }
  }
  return [...names];
}

function isCompound(content, componentName) {
  if (
    !COMPOSITION_EXEMPT.has(componentName) &&
    sourceComponentExports(componentName).length > 1
  ) {
    return true;
  }
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

function checkNoImportSection(content) {
  // Any H2 the docs render as "Import" (ATX or Setext); a fenced one is text.
  const { first, scan } = bodyLines(content);
  const line = scan.findIndex((l) => l.h2 === "Import");
  if (line === -1) {
    return [];
  }
  return [
    `## Import (line ${first + line}) is retired: put the import at the top of ## Usage, after ## Installation — run \`node scripts/migrate-component-mdx.mjs --only usage-import\``,
  ];
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
        ...checkNoImportSection(content),
        ...checkPreviewDemoNames(content, demoNames),
      ],
    };
  }

  const sections = getH2Sections(content);
  const headingNames = new Set(sections.map((s) => s.heading));

  const errors = [
    ...checkFrontmatter(content),
    ...checkNoImportSection(content),
    ...checkInstallation(componentName, sections, headingNames),
    ...(headingNames.has("Usage") ? [] : ["missing ## Usage"]),
    ...(isCompound(content, componentName) && !headingNames.has("Composition")
      ? ["compound component (several exported parts) missing ## Composition"]
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
