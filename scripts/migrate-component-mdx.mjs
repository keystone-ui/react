#!/usr/bin/env node

/**
 * Mechanical migration for component MDX files. Brings each
 * apps/docs/content/docs/components/<name>.mdx into the canonical
 * structure documented in apps/docs/content/docs/components/_template.mdx.
 *
 * Usage:
 *   node scripts/migrate-component-mdx.mjs                       # apply all
 *   node scripts/migrate-component-mdx.mjs --dry                 # report only
 *   node scripts/migrate-component-mdx.mjs --only usage-import   # one transform
 *
 * Transformations:
 *   1. installation: insert ## Installation after the first <ComponentPreview>.
 *   2. examples: wrap loose variant H2s (any H2 containing a <ComponentPreview>
 *      that isn't a protected section name) under a single ## Examples parent
 *      with the variant heading demoted to H3.
 *   3. rtl: insert a ## RTL paragraph before ## API Reference if missing.
 *      The codemod uses a fallback paragraph (no demo reference) so it
 *      doesn't break lint until Phase 4.5 authors per-component RTL demos.
 *   4. usage-import: retire the older `## Import` section. Its body moves,
 *      byte for byte, to the top of `## Usage`, which sits right after
 *      `## Installation`. The `<name>-default` preview moves to the top of the
 *      page (moved, never duplicated). After the import comes a snippet only
 *      when the default demo is a bare `return <El …>` whose root and every
 *      identifier come from the page's own import; the snippet is that element
 *      as the demo writes it. A `## Usage` that already has a tsx/jsx block
 *      gets no snippet. Any other prose or block under `## Usage` follows, in
 *      order. This transform deletes the `## Import` heading and nothing else.
 *      It splices the page text in place: every other section keeps its bytes.
 *
 * Transforms 1-3 re-serialize the page (blank lines normalised). With
 * `--only usage-import` only transform 4 runs. Every transform is a no-op on
 * a page that already has its shape, so a second run changes nothing.
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

const DEMOS_DIR = join(ROOT, "apps/docs/demos");

const TRANSFORMS = ["installation", "examples", "rtl", "usage-import"];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");
const onlyIdx = args.indexOf("--only");
const only = onlyIdx === -1 ? null : args[onlyIdx + 1];
if (only !== null && !TRANSFORMS.includes(only)) {
  console.error(
    `Unknown transform "${only}". Use one of: ${TRANSFORMS.join(", ")}.`
  );
  process.exit(1);
}
const runs = (name) => only === null || only === name;

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
    body: `\n<CodeBlockTabs items={["CLI", "Manual"]}>\n\n\`\`\`bash tab="CLI"\nnpx shadcn@latest add https://keystoneui.io/r/${componentName}.json\n\`\`\`\n\n<div tab="Manual">\n\n<Steps>\n\n<Step>Install dependencies.</Step>\n\n\`\`\`bash\npnpm add @keystoneui/react@beta @base-ui/react\n\`\`\`\n\n<Step>Copy the source.</Step>\n\n<ComponentSource name="${componentName}-default" />\n\n<Step>Update import paths to match your project.</Step>\n\n</Steps>\n\n</div>\n\n</CodeBlockTabs>\n\n`,
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

// --- usage-import: retire `## Import` -------------------------------------

const JS_LITERALS = new Set(["true", "false", "null", "undefined"]);

/**
 * Split text (after frontmatter) into the prose before the first H2 and the
 * H2 sections, each kept as its raw text (heading line through the byte
 * before the next heading). Lines inside ``` fences never start a section.
 */
function splitRaw(rest) {
  const lines = rest.split("\n");
  const chunks = [{ heading: null, lines: [] }];
  let fence = false;
  for (const line of lines) {
    if (line.startsWith("```")) {
      fence = !fence;
    }
    if (!fence && line.startsWith("## ")) {
      chunks.push({ heading: line.slice(3).trim(), lines: [] });
    }
    chunks.at(-1).lines.push(line);
  }
  const raw = chunks.map((c, i) => ({
    heading: c.heading,
    // Each chunk but the last owns the newline that ended its last line.
    raw: c.lines.join("\n") + (i < chunks.length - 1 ? "\n" : ""),
  }));
  return { lead: raw[0].raw, sections: raw.slice(1) };
}

function sectionBody(section) {
  return section.raw.slice(section.raw.indexOf("\n") + 1);
}

function trimNewlines(text) {
  return text.replace(/^\n+|\n+$/g, "");
}

/** Names bound by `import { … } from "@keystoneui/react/…"` in a text. */
function importedNames(text) {
  const names = new Set();
  const re =
    /import\s*\{([^}]*)\}\s*from\s*["']@keystoneui\/react\/[^"']+["']/g;
  for (const m of text.matchAll(re)) {
    for (const raw of m[1].split(",")) {
      const name = raw
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)
        .at(-1)
        .trim();
      if (name) {
        names.add(name);
      }
    }
  }
  return names;
}

const NAME_RE = /^[A-Za-z_$][\w$.:-]*/;
const IDENT_RE = /^[A-Za-z_$][\w$]*/;
const IDENT_START_RE = /[A-Za-z_$]/;
const JSX_START_RE = /[A-Za-z>]/;
// A "<" after one of these, inside an expression, opens JSX, not a compare.
const BEFORE_JSX_RE = /[({[,=?:&|>]/;
const WS_RE = /\s/;
const COMPONENT_TAG_RE = /^[A-Z]/;
const OPENERS = new Set(["{", "(", "["]);
const CLOSERS = new Set(["}", ")", "]"]);

/**
 * A small JSX reader, enough for the repo's default demos: it walks one
 * element and records every component tag and every identifier read inside
 * `{…}` expressions. Anything it does not understand throws, and a demo it
 * cannot read gets no snippet.
 */
class JsxReader {
  constructor(src, start) {
    this.src = src;
    this.i = start;
    this.used = new Set();
  }

  fail(why) {
    throw new Error(`${why} at ${this.i}`);
  }

  skipWs() {
    while (this.i < this.src.length && WS_RE.test(this.src[this.i])) {
      this.i += 1;
    }
  }

  readName() {
    const m = NAME_RE.exec(this.src.slice(this.i));
    if (!m) {
      return "";
    }
    this.i += m[0].length;
    return m[0];
  }

  readQuoted() {
    const end = this.src.indexOf(this.src[this.i], this.i + 1);
    if (end === -1) {
      this.fail("unterminated string");
    }
    this.i = end + 1;
  }

  readTemplate() {
    this.i += 1;
    while (this.i < this.src.length && this.src[this.i] !== "`") {
      if (this.src[this.i] === "\\") {
        this.i += 2;
      } else if (this.src.startsWith("${", this.i)) {
        this.i += 1;
        this.readExpression();
      } else {
        this.i += 1;
      }
    }
    this.i += 1;
  }

  skipComment() {
    const block = this.src.startsWith("/*", this.i);
    const end = this.src.indexOf(block ? "*/" : "\n", this.i + 2);
    if (end === -1) {
      this.fail("unterminated comment");
    }
    this.i = end + (block ? 2 : 1);
  }

  readIdentifier(prev) {
    const before = this.src.slice(0, this.i).trimEnd().at(-1);
    const name = IDENT_RE.exec(this.src.slice(this.i))[0];
    this.i += name.length;
    const after = this.src.slice(this.i).trimStart()[0];
    const isKey = after === ":" && (prev === "{" || prev === ",");
    if (before !== "." && !isKey) {
      this.used.add(name);
    }
  }

  /** One token of an expression; returns the new depth and `prev` mark. */
  expressionStep(depth, prev) {
    const ch = this.src[this.i];
    if (
      this.src.startsWith("/*", this.i) ||
      this.src.startsWith("//", this.i)
    ) {
      this.skipComment();
      return [depth, prev];
    }
    if (OPENERS.has(ch) || CLOSERS.has(ch)) {
      this.i += 1;
      return [depth + (OPENERS.has(ch) ? 1 : -1), ch];
    }
    if (ch === '"' || ch === "'") {
      this.readQuoted();
      return [depth, ch];
    }
    if (ch === "`") {
      this.readTemplate();
      return [depth, ch];
    }
    if (
      ch === "<" &&
      JSX_START_RE.test(this.src[this.i + 1]) &&
      BEFORE_JSX_RE.test(prev)
    ) {
      this.readElement();
      return [depth, ">"];
    }
    if (IDENT_START_RE.test(ch)) {
      this.readIdentifier(prev);
      return [depth, "a"];
    }
    this.i += 1;
    return [depth, WS_RE.test(ch) ? prev : ch];
  }

  /** At "{": read to the matching "}". */
  readExpression() {
    this.i += 1;
    let depth = 0;
    let prev = "{";
    while (this.i < this.src.length) {
      if (this.src[this.i] === "}" && depth === 0) {
        this.i += 1;
        return;
      }
      [depth, prev] = this.expressionStep(depth, prev);
    }
    this.fail("unterminated expression");
  }

  readAttributeValue() {
    this.skipWs();
    const ch = this.src[this.i];
    if (ch === "{") {
      this.readExpression();
    } else if (ch === '"' || ch === "'") {
      this.readQuoted();
    } else {
      this.fail("bad attribute value");
    }
  }

  /** After the tag name: read attributes; true when the tag self-closes. */
  readAttributes() {
    for (;;) {
      this.skipWs();
      if (this.src.startsWith("/>", this.i)) {
        this.i += 2;
        return true;
      }
      if (this.src[this.i] === ">") {
        this.i += 1;
        return false;
      }
      if (this.src[this.i] === "{") {
        this.readExpression();
      } else if (this.readName()) {
        this.skipWs();
        if (this.src[this.i] === "=") {
          this.i += 1;
          this.readAttributeValue();
        }
      } else {
        this.fail("bad attribute");
      }
    }
  }

  readClosingTag(tag) {
    this.i += 2;
    this.skipWs();
    const closing = this.readName();
    if (closing !== tag) {
      this.fail(`</${closing}> closes <${tag}>`);
    }
    this.skipWs();
    if (this.src[this.i] !== ">") {
      this.fail("bad closing tag");
    }
    this.i += 1;
  }

  readChildren(tag) {
    while (!this.src.startsWith("</", this.i)) {
      if (this.i >= this.src.length) {
        this.fail("unclosed element");
      }
      if (this.src[this.i] === "<") {
        this.readElement();
      } else if (this.src[this.i] === "{") {
        this.readExpression();
      } else {
        this.i += 1;
      }
    }
    this.readClosingTag(tag);
  }

  /** At "<": read one element, children included; returns its tag. */
  readElement() {
    this.i += 1;
    const tag = this.readName();
    if (!tag) {
      this.fail("fragment or empty tag");
    }
    // An intrinsic element (`<div>`) names no binding; a component does.
    if (COMPONENT_TAG_RE.test(tag)) {
      this.used.add(tag.split(".")[0]);
    }
    if (!this.readAttributes()) {
      this.readChildren(tag);
    }
    return tag;
  }
}

function readJsx(src, start) {
  const reader = new JsxReader(src, start);
  const tag = reader.readElement();
  return { end: reader.i, tag, used: reader.used };
}

/**
 * The snippet for a page: the default demo's returned element, as the demo
 * writes it, when the demo's default export is a bare `return <El …>` and
 * the root and every identifier in it are named by the page's own import.
 * Otherwise null, with the reason.
 */
function defaultDemoSnippet(demoSource, provided) {
  const head = /export\s+default\s+function\s*[\w$]*\s*\([^)]*\)\s*\{/.exec(
    demoSource
  );
  if (!head) {
    return { reason: "no default function export", snippet: null };
  }
  const bodyStart = head.index + head[0].length;
  const bodyEnd = demoSource.lastIndexOf("}");
  if (demoSource.slice(bodyEnd + 1).trim() !== "") {
    return { reason: "code after the default export", snippet: null };
  }
  const body = demoSource.slice(bodyStart, bodyEnd);
  const ret = /^\s*return\s*(\(\s*)?/.exec(body);
  if (!ret || body.at(ret[0].length) !== "<") {
    return { reason: "statements before the return", snippet: null };
  }
  const start = bodyStart + ret[0].length;
  let jsx;
  try {
    jsx = readJsx(demoSource, start);
  } catch (error) {
    return { reason: `not one element (${error.message})`, snippet: null };
  }
  const tail = demoSource.slice(jsx.end, bodyEnd).replace(/\s+/g, "");
  if (tail !== (ret[1] ? ");" : ";")) {
    return { reason: "more than one element returned", snippet: null };
  }
  if (!provided.has(jsx.tag.split(".")[0])) {
    return {
      reason: `root <${jsx.tag}> is not in the page's import`,
      snippet: null,
    };
  }
  const missing = [...jsx.used].filter(
    (name) => !(provided.has(name) || JS_LITERALS.has(name))
  );
  if (missing.length > 0) {
    return {
      reason: `uses ${missing.join(", ")}, not in the page's import`,
      snippet: null,
    };
  }
  const lineStart = demoSource.lastIndexOf("\n", start) + 1;
  const indent = " ".repeat(start - lineStart);
  const snippet = demoSource
    .slice(start, jsx.end)
    .split("\n")
    .map((line, n) =>
      n > 0 && line.startsWith(indent) ? line.slice(indent.length) : line
    )
    .join("\n");
  return { reason: null, snippet };
}

/**
 * Splice `## Import` into `## Usage` (see the header). Returns null when the
 * page has no `## Import`.
 */
function moveImportUnderUsage(original, componentName, readDemo) {
  const fm = original.match(/^(---\n[\s\S]*?\n---\n)/);
  const frontmatter = fm ? fm[1] : "";
  const { lead, sections } = splitRaw(original.slice(frontmatter.length));
  const importIdx = sections.findIndex((s) => s.heading === "Import");
  if (importIdx === -1) {
    return null;
  }
  const notes = [];
  const importBody = trimNewlines(sectionBody(sections[importIdx]));
  const usage = sections.find((s) => s.heading === "Usage");
  let usageRest = usage ? trimNewlines(sectionBody(usage)) : "";

  const previewLine = `<ComponentPreview name="${componentName}-default" />`;
  const previewRe = new RegExp(
    `^${previewLine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[ \\t]*$`,
    "m"
  );
  let newLead = lead;
  if (!previewRe.test(lead)) {
    const m = previewRe.exec(usageRest);
    if (m) {
      const before = usageRest.slice(0, m.index).replace(/\n+$/, "");
      const after = usageRest.slice(m.index + m[0].length).replace(/^\n+/, "");
      usageRest = [before, after].filter(Boolean).join("\n\n");
      notes.push("moved preview to top");
    } else {
      notes.push(`no ${previewLine} under ## Usage — left the preview alone`);
    }
    if (m) {
      const leadText = trimNewlines(lead);
      newLead = `\n${[previewLine, leadText].filter(Boolean).join("\n\n")}\n\n`;
    }
  }

  let snippet = null;
  if (/^```(tsx|jsx)\b/m.test(usageRest)) {
    notes.push("kept existing snippet");
  } else {
    const demo = readDemo(componentName);
    const result =
      demo === null
        ? { reason: "no default demo", snippet: null }
        : defaultDemoSnippet(demo, importedNames(importBody));
    snippet = result.snippet;
    notes.push(snippet ? "snippet" : `import only (${result.reason})`);
  }

  const parts = [importBody];
  if (snippet) {
    parts.push(`\`\`\`tsx\n${snippet}\n\`\`\``);
  }
  if (usageRest) {
    parts.push(usageRest);
  }
  const kept = sections.filter((s) => s.heading !== "Import" && s !== usage);
  const installIdx = kept.findIndex((s) => s.heading === "Installation");
  const at = installIdx + 1;
  const isLast = at === kept.length;
  const newUsage = {
    heading: "Usage",
    raw: `## Usage\n\n${parts.join("\n\n")}\n${isLast ? "" : "\n"}`,
  };
  if (at > 0 && !kept[at - 1].raw.endsWith("\n\n")) {
    kept[at - 1] = {
      ...kept[at - 1],
      raw: `${kept[at - 1].raw.replace(/\n*$/, "")}\n\n`,
    };
  }
  kept.splice(at, 0, newUsage);
  if (at === 0) {
    newLead = `${newLead.replace(/\n*$/, "")}\n\n`;
  }
  const next = frontmatter + newLead + kept.map((s) => s.raw).join("");
  return { next, notes };
}

function readDefaultDemo(componentName) {
  try {
    return readFileSync(join(DEMOS_DIR, componentName, "default.tsx"), "utf-8");
  } catch {
    return null;
  }
}

function migrate(filePath) {
  const componentName = basename(filePath, ".mdx");
  const original = readFileSync(filePath, "utf-8");

  const applied = [];
  const warnings = [];

  let text = original;
  if (runs("usage-import")) {
    const moved = moveImportUnderUsage(text, componentName, readDefaultDemo);
    if (moved) {
      text = moved.next;
      applied.push(`usage-import: ${moved.notes.join(", ")}`);
    }
  }
  if (only === "usage-import") {
    return {
      applied,
      changed: text !== original,
      componentName,
      next: text,
      warnings,
    };
  }

  const parsed = parseMdx(text);

  if (runs("installation")) {
    const installResult = tryInsertInstallation(parsed, componentName);
    if (installResult.applied) {
      applied.push(installResult.applied);
    }
    if (installResult.warning) {
      warnings.push(installResult.warning);
    }
  }

  if (runs("examples")) {
    const examplesResult = tryWrapVariantsUnderExamples(parsed);
    if (examplesResult) {
      applied.push(examplesResult);
    }
  }

  if (runs("rtl")) {
    const rtlResult = tryInsertRtl(parsed);
    if (rtlResult) {
      applied.push(rtlResult);
    }
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
