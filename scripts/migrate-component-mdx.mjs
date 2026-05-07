#!/usr/bin/env node

/**
 * Mechanical migration for component MDX files. Brings each
 * apps/docs/content/docs/components/<name>.mdx into the canonical
 * structure documented in apps/docs/content/docs/components/_template.mdx.
 *
 * Usage:
 *   node scripts/migrate-component-mdx.mjs           # apply changes
 *   node scripts/migrate-component-mdx.mjs --dry     # report only
 *
 * Transformations (non-destructive — adds/wraps, never deletes):
 *   1. Insert ## Installation block after the first <ComponentPreview>.
 *   2. Wrap loose variant H2s (any H2 containing a <ComponentPreview> that
 *      isn't a protected section name) under a single ## Examples parent
 *      with the variant heading demoted to H3.
 *   3. Insert a ## RTL paragraph before ## API Reference if missing.
 *      The codemod uses a fallback paragraph (no demo reference) so it
 *      doesn't break lint until Phase 4.5 authors per-component RTL demos.
 *
 * Reports:
 *   - Per-file: which transforms applied, plus a flag for compound
 *     components missing ## Composition (the codemod can't author one).
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const COMPONENTS_DIR = join(ROOT, "apps/docs/content/docs/components");

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

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");

/**
 * Split MDX content into a frontmatter block, leading prose, and an ordered
 * array of H2-prefixed sections.
 *
 * @param {string} content
 * @returns {{ frontmatter: string, leading: string, sections: Array<{ heading: string, body: string }> }}
 */
function parseMdx(content) {
  const fmMatch = content.match(/^(---\n[\s\S]*?\n---\n)/);
  const frontmatter = fmMatch ? fmMatch[1] : "";
  const rest = content.slice(frontmatter.length);

  const lines = rest.split("\n");
  const sections = [];
  const leadingLines = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) {
        sections.push(current);
      }
      current = { heading: line.slice(3).trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    } else {
      leadingLines.push(line);
    }
  }
  if (current) {
    sections.push(current);
  }

  for (const s of sections) {
    s.body = s.body.join("\n");
  }

  return { frontmatter, leading: leadingLines.join("\n"), sections };
}

function serialize({ frontmatter, leading, sections }) {
  // Ensure exactly one blank line between frontmatter, leading prose,
  // and each section heading. Each block is stripped of leading/trailing
  // newlines, then joined with a single blank-line separator.
  const blocks = [];
  if (frontmatter.length > 0) {
    blocks.push(frontmatter.replace(/^\n+|\n+$/g, ""));
  }
  if (leading.trim().length > 0) {
    blocks.push(leading.replace(/^\n+|\n+$/g, ""));
  }
  for (const s of sections) {
    const body = s.body.replace(/^\n+|\n+$/g, "");
    blocks.push(`## ${s.heading}\n\n${body}`);
  }
  return `${blocks.join("\n\n")}\n`;
}

function sectionContainsPreview(section) {
  return /<ComponentPreview\b/.test(section.body);
}

function buildInstallationSection(componentName) {
  return {
    heading: "Installation",
    body: `\n<CodeBlockTabs items={["CLI", "Manual"]}>\n\n\`\`\`bash tab="CLI"\nnpx shadcn@latest add https://keystoneui.io/r/${componentName}.json\n\`\`\`\n\n<div tab="Manual">\n\n<Steps>\n\n<Step>Install dependencies.</Step>\n\n\`\`\`bash\npnpm add @keystoneui/react @base-ui/react\n\`\`\`\n\n<Step>Copy the source.</Step>\n\n<ComponentSource name="${componentName}-default" />\n\n<Step>Update import paths to match your project.</Step>\n\n</Steps>\n\n</div>\n\n</CodeBlockTabs>\n\n`,
  };
}

function buildRtlSection() {
  return {
    heading: "RTL",
    body: `\nThis component supports RTL layouts via the standard \`dir="rtl"\` attribute on a parent element. See [the RTL guide](/docs/rtl).\n\n`,
  };
}

function findFirstPreviewSectionIndex(sections) {
  for (let i = 0; i < sections.length; i++) {
    if (sectionContainsPreview(sections[i])) {
      return i;
    }
  }
  return -1;
}

function isCompound(sections) {
  const usage = sections.find((s) => s.heading === "Usage");
  const importSection = sections.find((s) => s.heading === "Import");
  const text = `${importSection?.body ?? ""}\n${usage?.body ?? ""}`;
  const importMatches = text.matchAll(
    /import\s*\{([^}]+)\}\s*from\s*["']@keystoneui\/react\//g
  );
  for (const m of importMatches) {
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

function tryInsertInstallation(parsed, componentName) {
  if (parsed.sections.some((s) => s.heading === "Installation")) {
    return { applied: null, warning: null };
  }
  const previewIdx = findFirstPreviewSectionIndex(parsed.sections);
  if (previewIdx === -1) {
    return {
      applied: null,
      warning: "no <ComponentPreview> found — skipped Installation insertion",
    };
  }
  parsed.sections.splice(
    previewIdx + 1,
    0,
    buildInstallationSection(componentName)
  );
  return { applied: "inserted Installation", warning: null };
}

function tryWrapVariantsUnderExamples(parsed) {
  if (parsed.sections.some((s) => s.heading === "Examples")) {
    return null;
  }
  const variantSections = [];
  const kept = [];
  for (const s of parsed.sections) {
    const isVariant =
      sectionContainsPreview(s) &&
      !PROTECTED_HEADINGS.has(s.heading) &&
      s.heading !== "Usage";
    (isVariant ? variantSections : kept).push(s);
  }
  if (variantSections.length === 0) {
    return null;
  }
  const examplesBody = variantSections
    .map((s) => `\n### ${s.heading}\n${s.body.replace(/\n+$/, "\n")}`)
    .join("\n");
  const examplesSection = { heading: "Examples", body: `${examplesBody}\n` };
  const apiIdx = kept.findIndex((s) => s.heading === "API Reference");
  const insertIdx = apiIdx === -1 ? kept.length : apiIdx;
  kept.splice(insertIdx, 0, examplesSection);
  parsed.sections = kept;
  return `wrapped ${variantSections.length} variant${variantSections.length === 1 ? "" : "s"} under Examples`;
}

function tryInsertRtl(parsed) {
  if (parsed.sections.some((s) => s.heading === "RTL")) {
    return null;
  }
  const apiIdx = parsed.sections.findIndex(
    (s) => s.heading === "API Reference"
  );
  if (apiIdx === -1) {
    return null;
  }
  parsed.sections.splice(apiIdx, 0, buildRtlSection());
  return "inserted RTL stub";
}

function checkCompositionWarning(parsed) {
  if (!isCompound(parsed.sections)) {
    return null;
  }
  if (parsed.sections.some((s) => s.heading === "Composition")) {
    return null;
  }
  return "compound component missing ## Composition — author manually";
}

function migrate(filePath) {
  const componentName = basename(filePath, ".mdx");
  const original = readFileSync(filePath, "utf-8");
  const parsed = parseMdx(original);

  const applied = [];
  const warnings = [];

  const installResult = tryInsertInstallation(parsed, componentName);
  if (installResult.applied) {
    applied.push(installResult.applied);
  }
  if (installResult.warning) {
    warnings.push(installResult.warning);
  }

  const examplesResult = tryWrapVariantsUnderExamples(parsed);
  if (examplesResult) {
    applied.push(examplesResult);
  }

  const rtlResult = tryInsertRtl(parsed);
  if (rtlResult) {
    applied.push(rtlResult);
  }

  const compositionWarning = checkCompositionWarning(parsed);
  if (compositionWarning) {
    warnings.push(compositionWarning);
  }

  const next = serialize(parsed);
  return { applied, changed: next !== original, componentName, next, warnings };
}

function main() {
  const files = readdirSync(COMPONENTS_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .sort();

  const summary = { changed: 0, files: 0, warnings: [] };

  for (const file of files) {
    const filePath = join(COMPONENTS_DIR, file);
    const result = migrate(filePath);
    summary.files += 1;

    if (result.changed) {
      summary.changed += 1;
      const note =
        result.applied.length > 0 ? result.applied.join(", ") : "no-op";
      console.log(
        `  ${dryRun ? "(dry) " : ""}${result.componentName}: ${note}`
      );
      if (!dryRun) {
        writeFileSync(filePath, result.next);
      }
    }

    for (const w of result.warnings) {
      summary.warnings.push(`${result.componentName}: ${w}`);
    }
  }

  console.log("");
  console.log(
    `${dryRun ? "Would change" : "Changed"} ${summary.changed} of ${summary.files} files.`
  );

  if (summary.warnings.length > 0) {
    console.log("");
    console.log("Warnings (manual follow-up needed):");
    for (const w of summary.warnings) {
      console.log(`  - ${w}`);
    }
  }
}

main();
