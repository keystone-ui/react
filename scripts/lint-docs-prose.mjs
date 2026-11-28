#!/usr/bin/env node

/**
 * Prose lint for the docs site: every apps/docs/content/docs/**\/*.mdx that
 * does not start with `_`.
 *
 * Rules (each id is stable; the baseline and the allowlist key on it):
 *   em-dash              "—", " -- " or a spaced " - " used as punctuation
 *   ellipsis             "..." (write "…")
 *   banned-word          easy, simple, simply, quick, just, very, really
 *   us-spelling          British spellings (colour, behaviour, centre…); the
 *                        docs and the CSS (`--color-*`) use American English
 *   the-user             "the user" or "one can" addressing the reader
 *   heading-case         Title Case in a Markdown heading (use sentence case)
 *   rhetorical-question  a heading or a prose sentence ending in "?"
 *   unit-spacing         "16MB", "200ms" (write "16 MB", "200 ms"; "30s" stays)
 *   code-fence-lang      an opening ``` or ~~~ fence with no language
 *   horizontal-rule      a `---` line outside frontmatter
 *   anchor-text          link text "here" / "link" / "this link", or a bare URL
 *   content-type         frontmatter `contentType:` missing or not a known type
 *
 * Never linted: frontmatter (except `contentType`), fenced code, inline code,
 * JSX/MDX element lines and `{…}` expression lines (comments included), table
 * rows, link destinations, and the generated `{/* backlinks:start *\/}` …
 * `{/* backlinks:end *\/}` block.
 *
 * The lint is a ratchet. scripts/docs-prose-baseline.json holds today's count
 * per file and rule; the run fails only when a count goes above it (a file
 * missing from the baseline has 0). Legitimate uses go in
 * scripts/docs-prose-allowlist.json, one `{ file?, rule, match, reason }` per
 * entry: a finding is dropped when `match` occurs in its line and covers it.
 *
 *   node scripts/lint-docs-prose.mjs                     lint against the baseline
 *   node scripts/lint-docs-prose.mjs --all               also print every finding
 *   node scripts/lint-docs-prose.mjs --update-baseline   lower the baseline
 *   node scripts/lint-docs-prose.mjs --update-baseline --allow-increase
 *
 * `--content-dir`, `--baseline` and `--allowlist` point the run elsewhere (the
 * tests use them). Baseline and allowlist paths are relative to the content dir.
 */

import {
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const DEFAULT_CONTENT_DIR = join(ROOT, "apps/docs/content/docs");
const DEFAULT_BASELINE = join(ROOT, "scripts/docs-prose-baseline.json");
const DEFAULT_ALLOWLIST = join(ROOT, "scripts/docs-prose-allowlist.json");

export const RULE_IDS = [
  "em-dash",
  "ellipsis",
  "banned-word",
  "us-spelling",
  "the-user",
  "heading-case",
  "rhetorical-question",
  "unit-spacing",
  "code-fence-lang",
  "horizontal-rule",
  "anchor-text",
  "content-type",
];

export const CONTENT_TYPES = new Set([
  "Tutorial",
  "How-to",
  "Reference",
  "Conceptual",
  "Troubleshooting",
  "Landing",
]);

// Words that keep their capital inside a sentence-case heading. Single words
// only; multi-word names go in PROPER_PHRASES. Acronyms (two or more capitals),
// identifiers with an inner capital (FilterChips), and words holding a dot or
// a digit (Next.js, v4) are allowed without being listed.
const PROPER_WORDS = new Set([
  // the pronoun
  "I",
  // products, tools and services the docs name
  "Apple",
  "Astro",
  "Biome",
  "Claude",
  "Cloudflare",
  "Codex",
  "Copilot",
  "Cursor",
  "English",
  "Figma",
  "Fumadocs",
  "GitHub",
  "Google",
  "JavaScript",
  "Lucide",
  "Markdown",
  "Radix",
  "React",
  "Remix",
  "Storybook",
  "Tailwind",
  "Turborepo",
  "TypeScript",
  "Vercel",
  "Vite",
  "Windsurf",
  "Zed",
  "Zod",
  "shadcn",
]);

const PROPER_PHRASES = [
  "Keystone UI",
  "Base UI",
  "Tailwind CSS",
  "Lucide React",
  "React Hook Form",
  "Server Components",
  "Claude Code",
  "VS Code",
];

// Markdown block syntax, as the docs' MDX parser reads it. Kept in step with
// scripts/lint-component-mdx.mjs; each script stays standalone.
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const HEADING_RE = /^( {0,3})(#{1,6})([ \t]+.*?)?(?:[ \t]+#+)?[ \t]*$/;
const HR_RE = /^ {0,3}-{3,}[ \t]*$/;
const TABLE_RE = /^\s*\|/;
const JSX_LINE_RE = /^\s*<[A-Za-z/>!]/;
const EXPR_LINE_RE = /^\s*\{/;
const BACKLINKS_START = "{/* backlinks:start */}";
const BACKLINKS_END = "{/* backlinks:end */}";
const TRAILING_HASHES_RE = /[ \t]+#+[ \t]*$/;
const BLOCK_PREFIX_RE = /^(\s*(?:>\s?)*\s*(?:(?:[-*+]|\d+[.)])[ \t]+)?)/;

const CODE_SPAN_RE = /(`+)(?:(?!\1)[\s\S])+?\1/g;
const INLINE_TAG_RE = /<\/?[A-Za-z][\w.:-]*(?:\s[^<>]*)?\/?>/g;
const INLINE_EXPR_RE = /\{[^{}]*\}/g;
const LINK_RE =
  /(!?)\[([^\]\n]*)\]\(([^()\s]*(?:\([^()\s]*\)[^()\s]*)*)(?:\s+"[^"]*")?\)/g;
// The `](url)` tail of a link whose text started on an earlier line.
const LINK_TAIL_RE = /\]\([^()\s]*\)/g;
const AUTOLINK_RE = /<(https?:\/\/[^>\s]+)>/g;
const BARE_URL_RE = /\bhttps?:\/\/[^\s)>\]]+/g;

const EM_DASH_RE = /—| -- /g;
// A hyphen with a space on each side and text somewhere before and after it
// on the line (masked links leave spaces beside it), unless digits sit
// directly on both sides (1 - 2).
const SPACED_HYPHEN_RE = / - /g;
const ELLIPSIS_RE = /\.{3}/g;
const BANNED_RE = /\b(?:easy|simple|simply|quick|just|very|really)\b/gi;
// British spellings, with their American form. The docs follow the CSS
// (`color`, `--color-*`), so prose and code read the same way.
const US_SPELLING = new Map([
  ["colour", "color"],
  ["colours", "colors"],
  ["coloured", "colored"],
  ["behaviour", "behavior"],
  ["behaviours", "behaviors"],
  ["centre", "center"],
  ["centred", "centered"],
  ["favour", "favor"],
  ["favourite", "favorite"],
  ["grey", "gray"],
  ["initialise", "initialize"],
  ["customise", "customize"],
  ["customised", "customized"],
  ["optimise", "optimize"],
  ["recognise", "recognize"],
  ["licence", "license"],
]);
const US_SPELLING_RE = new RegExp(
  `\\b(?:${[...US_SPELLING.keys()].join("|")})\\b`,
  "gi"
);
const THE_USER_RE = /\b(?:the user|one can)\b/gi;
const UNIT_RE = /\b\d+(?:KB|MB|GB|ms)\b/g;
// A "?" closing a sentence. The text before it may be a masked link.
const QUESTION_RE = /(?<!\?)\?(?=[\s"')*_]|$)/g;
const BAD_ANCHOR_RE = /^(?:here|link|this link)$/i;
const WORD_RE = /[A-Za-z][A-Za-z0-9'’.-]*[A-Za-z0-9]|[A-Za-z]/g;
const CLAUSE_BREAK_RE = /[:—]\s*$/;

function blank(text) {
  return text.replace(/[^\n]/g, " ");
}

/** Replace `re`'s matches in `text` with spaces, keeping every index. */
function maskAll(text, re) {
  return text.replace(re, (m) => blank(m));
}

/** Whether `line` opens a fence; returns the marker and the info string. */
function openFence(line) {
  const f = FENCE_RE.exec(line);
  // A backtick fence's info string cannot hold a backtick.
  if (!f || (f[1][0] === "`" && f[2].includes("`"))) {
    return null;
  }
  return { marker: f[1], info: f[2].trim() };
}

function closesFence(line, marker) {
  const f = FENCE_RE.exec(line);
  return (
    f !== null &&
    f[1][0] === marker[0] &&
    f[1].length >= marker.length &&
    f[2].trim() === ""
  );
}

const QUOTES = new Set(['"', "'", "`"]);

/** Advance a JSX scan by one unquoted character. */
function stepJsx(state, ch, next) {
  const open = state.inTag || state.depth > 0;
  if (ch === "{") {
    state.depth++;
  } else if (ch === "}") {
    state.depth = Math.max(0, state.depth - 1);
  } else if (open && QUOTES.has(ch)) {
    state.quote = ch;
  } else if (state.depth === 0 && state.inTag && ch === ">") {
    state.inTag = false;
  } else if (state.depth === 0 && ch === "<" && /[A-Za-z/]/.test(next)) {
    state.inTag = true;
  }
}

/**
 * Walk a JSX tag or `{…}` expression from `state` over `line`. Returns the
 * state after the line: `inTag` while a `<Tag …` is still open, `depth` for
 * unclosed braces, `quote` for an open string inside either.
 */
function scanJsx(line, state) {
  const next = { ...state };
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (!next.quote) {
      stepJsx(next, ch, line[i + 1] ?? "");
    } else if (ch === "\\") {
      i++;
    } else if (ch === next.quote) {
      next.quote = null;
    }
  }
  return next;
}

function jsxOpen(state) {
  return state.inTag || state.depth > 0 || state.quote !== null;
}

/**
 * The line inside an open zone (fence, backlinks block, multi-line JSX):
 * returns its entry and the zone after it (null once the zone closes).
 */
function continueZone(zone, raw) {
  if (zone.type === "fence") {
    return [
      { kind: "fence", raw },
      closesFence(raw, zone.marker) ? null : zone,
    ];
  }
  if (zone.type === "backlinks") {
    return [{ kind: "skip", raw }, raw.trim() === BACKLINKS_END ? null : zone];
  }
  const state = scanJsx(raw, zone.state);
  return [
    { kind: "skip", raw },
    jsxOpen(state) ? { type: "jsx", state } : null,
  ];
}

/** A line outside any zone: returns its entry and the zone it opens, if any. */
function classifyLine(raw, prevBlank) {
  const opened = openFence(raw);
  if (opened) {
    return [
      { kind: "fence-open", raw, info: opened.info },
      { type: "fence", marker: opened.marker },
    ];
  }
  if (raw.trim() === BACKLINKS_START) {
    return [{ kind: "skip", raw }, { type: "backlinks" }];
  }
  if (JSX_LINE_RE.test(raw) || EXPR_LINE_RE.test(raw)) {
    const state = scanJsx(raw, { inTag: false, depth: 0, quote: null });
    return [
      { kind: "skip", raw },
      jsxOpen(state) ? { type: "jsx", state } : null,
    ];
  }
  if (TABLE_RE.test(raw)) {
    return [{ kind: "skip", raw }, null];
  }
  if (HR_RE.test(raw) && prevBlank) {
    return [{ kind: "hr", raw }, null];
  }
  const h = HEADING_RE.exec(raw);
  if (h) {
    // Keep the heading text at its own columns; blank the `#` markers.
    const body = (h[3] ?? "").replace(TRAILING_HASHES_RE, "");
    const text = " ".repeat(h[1].length + h[2].length) + body;
    return [{ kind: "heading", raw, text: maskInline(text) }, null];
  }
  const prefix = BLOCK_PREFIX_RE.exec(raw)[1];
  const text = " ".repeat(prefix.length) + raw.slice(prefix.length);
  return [{ kind: "prose", raw, text: maskInline(text) }, null];
}

/**
 * Classify every line. Returns one entry per line: `kind` is "frontmatter",
 * "fence-open", "fence", "skip" (JSX, expression, table, backlinks), "heading",
 * "hr" or "prose"; `text` is the line with inline non-prose masked to spaces.
 */
export function scanLines(source) {
  const lines = source.split("\n");
  const out = [];
  const fmEnd = lines[0] === "---" ? lines.indexOf("---", 1) : -1;
  for (let i = 0; i <= fmEnd; i++) {
    out.push({ kind: "frontmatter", raw: lines[i] });
  }
  let zone = null;
  for (let i = fmEnd + 1; i < lines.length; i++) {
    const prevBlank = i === 0 || lines[i - 1].trim() === "";
    const [entry, next] = zone
      ? continueZone(zone, lines[i])
      : classifyLine(lines[i], prevBlank);
    out.push(entry);
    zone = next;
  }
  return out;
}

/**
 * Mask inline code, inline JSX tags, `{…}` expressions and link destinations.
 * Link text stays (it is prose). Bare URLs are left for the anchor-text rule
 * and masked by `proseOnly` before the word rules run.
 */
function maskInline(text) {
  let t = text.replace(CODE_SPAN_RE, (m) => `\`${" ".repeat(m.length - 2)}\``);
  t = maskAll(t, INLINE_EXPR_RE);
  t = t.replace(LINK_RE, (m, bang, label) => {
    // `[`label`](url)`: keep the label at its columns, blank the rest.
    const head = " ".repeat(bang.length + 1);
    return head + label + " ".repeat(m.length - head.length - label.length);
  });
  t = maskAll(t, LINK_TAIL_RE);
  t = maskAll(t, INLINE_TAG_RE);
  return t;
}

/** Text with URLs blanked, for every rule but anchor-text. */
function proseOnly(text) {
  return maskAll(maskAll(text, AUTOLINK_RE), BARE_URL_RE);
}

function finding(line, rule, index, match, message) {
  return { line, rule, index, match, message };
}

function each(re, text, fn) {
  re.lastIndex = 0;
  for (const m of text.matchAll(re)) {
    fn(m);
  }
}

function checkEmDash(text, line, out) {
  each(EM_DASH_RE, text, (m) => {
    out.push(
      finding(
        line,
        "em-dash",
        m.index,
        m[0],
        `"${m[0].trim()}" in prose; rewrite the sentence or use a comma, colon or parentheses`
      )
    );
  });
  each(SPACED_HYPHEN_RE, text, (m) => {
    const before = text[m.index - 1] ?? "";
    const after = text[m.index + 3] ?? "";
    const isRange = /\d/.test(before) && /\d/.test(after);
    const isolated =
      text.slice(0, m.index).trim() === "" ||
      text.slice(m.index + 3).trim() === "";
    if (isRange || isolated) {
      return;
    }
    out.push(
      finding(
        line,
        "em-dash",
        m.index,
        m[0],
        'spaced " - " used as a dash; rewrite the sentence'
      )
    );
  });
}

function checkEllipsis(text, line, out) {
  each(ELLIPSIS_RE, text, (m) => {
    out.push(
      finding(line, "ellipsis", m.index, m[0], 'use "…" instead of "..."')
    );
  });
}

function checkBanned(text, line, out) {
  each(BANNED_RE, text, (m) => {
    out.push(
      finding(
        line,
        "banned-word",
        m.index,
        m[0],
        `"${m[0]}" adds nothing; cut it or say something specific`
      )
    );
  });
}

function checkUsSpelling(text, line, out) {
  each(US_SPELLING_RE, text, (m) => {
    const us = US_SPELLING.get(m[0].toLowerCase());
    out.push(
      finding(
        line,
        "us-spelling",
        m.index,
        m[0],
        `"${m[0]}": the docs use American spelling ("${us}")`
      )
    );
  });
}

function checkTheUser(text, line, out) {
  each(THE_USER_RE, text, (m) => {
    out.push(
      finding(
        line,
        "the-user",
        m.index,
        m[0],
        `"${m[0]}": address the reader as "you" (allowlist it when it means an app's end user)`
      )
    );
  });
}

function checkUnits(text, line, out) {
  each(UNIT_RE, text, (m) => {
    out.push(
      finding(
        line,
        "unit-spacing",
        m.index,
        m[0],
        `"${m[0]}": put a space between the number and the unit`
      )
    );
  });
}

function checkQuestions(text, line, out, what) {
  each(QUESTION_RE, text, (m) => {
    if (text.slice(0, m.index).trim() === "") {
      return;
    }
    out.push(
      finding(
        line,
        "rhetorical-question",
        m.index,
        "?",
        `${what} ends in "?"; state the answer instead`
      )
    );
  });
}

function checkAnchors(text, raw, line, out) {
  // Link syntax inside inline code is code, not a link.
  each(LINK_RE, maskAll(raw, CODE_SPAN_RE), (m) => {
    if (!m[1] && BAD_ANCHOR_RE.test(m[2].trim())) {
      out.push(
        finding(
          line,
          "anchor-text",
          m.index,
          m[0],
          `link text "${m[2].trim()}" says nothing; name the destination`
        )
      );
    }
  });
  // Bare URLs: URLs left in the masked text sit outside a link destination.
  each(BARE_URL_RE, text, (m) => {
    out.push(
      finding(
        line,
        "anchor-text",
        m.index,
        m[0],
        "bare URL in prose; link descriptive text instead"
      )
    );
  });
}

/** Offending words in a heading's masked text, as { index, word }. */
export function titleCaseWords(text, properNouns = []) {
  let t = text;
  const extraWords = new Set(properNouns.filter((n) => !n.includes(" ")));
  const phrases = [
    ...PROPER_PHRASES,
    ...properNouns.filter((n) => n.includes(" ")),
  ];
  for (const phrase of phrases) {
    t = t.split(phrase).join(blank(phrase));
  }
  const bad = [];
  let first = true;
  let last = 0;
  for (const m of t.matchAll(WORD_RE)) {
    const between = t.slice(last, m.index);
    last = m.index + m[0].length;
    // A backticked span before the first word counts as the first word.
    if (between.includes("`")) {
      first = false;
    }
    if (CLAUSE_BREAK_RE.test(t.slice(0, m.index))) {
      first = true;
    }
    const word = m[0];
    const isFirst = first;
    first = false;
    if (isFirst || !/^[A-Z]/.test(word)) {
      continue;
    }
    const allowed =
      PROPER_WORDS.has(word) ||
      extraWords.has(word) ||
      /^[A-Z]{2,}s?$/.test(word.replace(/[^A-Za-z]/g, "")) ||
      /[a-z][A-Z]/.test(word) ||
      /[.\d]/.test(word);
    if (!allowed) {
      bad.push({ index: m.index, word });
    }
  }
  return bad;
}

function checkHeading(text, line, out, properNouns) {
  const words = titleCaseWords(text, properNouns);
  if (words.length > 0) {
    out.push({
      ...finding(
        line,
        "heading-case",
        words[0].index,
        words.map((w) => w.word).join(" "),
        `Title Case (${words.map((w) => w.word).join(", ")}); use sentence case`
      ),
      spans: words.map((w) => [w.index, w.index + w.word.length]),
    });
  }
}

function checkContentType(lines) {
  if (lines[0]?.kind !== "frontmatter") {
    return [
      finding(1, "content-type", 0, "", "no frontmatter; add `contentType:`"),
    ];
  }
  const fm = lines.filter((l) => l.kind === "frontmatter");
  const entry = fm.findIndex((l) => /^contentType:/.test(l.raw));
  if (entry === -1) {
    return [
      finding(
        1,
        "content-type",
        0,
        "",
        `frontmatter lacks \`contentType:\` (one of ${[...CONTENT_TYPES].join(", ")})`
      ),
    ];
  }
  const value = fm[entry].raw
    .replace(/^contentType:\s*/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (!CONTENT_TYPES.has(value)) {
    return [
      finding(
        entry + 1,
        "content-type",
        0,
        value,
        `contentType "${value}" is not one of ${[...CONTENT_TYPES].join(", ")}`
      ),
    ];
  }
  return [];
}

/**
 * Every finding in one MDX source, before the allowlist: an array of
 * `{ file, line, rule, index, match, message, text, spans? }`, `line`
 * 1-based and `text` the line as the rule saw it (masked for prose rules).
 * `properNouns` adds names `heading-case` keeps capitalized (lintDir passes
 * the component page titles: "Button", "Copy Button").
 *
 * @param {string} source
 * @param {string} [file]
 * @param {{ properNouns?: string[] }} [options]
 */
export function lintProse(source, file = "", { properNouns = [] } = {}) {
  const lines = scanLines(source);
  const out = checkContentType(lines);
  for (const [n, l] of lines.entries()) {
    const line = n + 1;
    const before = out.length;
    if (l.kind === "fence-open" && l.info === "") {
      out.push(
        finding(
          line,
          "code-fence-lang",
          0,
          l.raw.trim(),
          "code fence has no language; add one (`text` for plain output)"
        )
      );
    } else if (l.kind === "hr") {
      out.push(
        finding(
          line,
          "horizontal-rule",
          0,
          l.raw.trim(),
          "horizontal rule; use a heading to separate sections"
        )
      );
    } else if (l.kind === "heading" || l.kind === "prose") {
      const text = proseOnly(l.text);
      checkEmDash(text, line, out);
      checkEllipsis(text, line, out);
      checkBanned(text, line, out);
      checkUsSpelling(text, line, out);
      checkTheUser(text, line, out);
      checkUnits(text, line, out);
      checkAnchors(l.text, l.raw, line, out);
      if (l.kind === "heading") {
        checkHeading(text, line, out, properNouns);
        checkQuestions(text, line, out, "heading");
      } else {
        checkQuestions(text, line, out, "sentence");
      }
    }
    for (const f of out.slice(before)) {
      f.text =
        f.rule === "anchor-text" && f.match.startsWith("[")
          ? l.raw
          : (l.text ?? l.raw);
    }
  }
  for (const f of out) {
    f.text ??= lines[f.line - 1]?.raw ?? "";
    f.file = file;
  }
  return out.sort((a, b) => a.line - b.line || a.index - b.index);
}

/**
 * Drop findings the allowlist covers. An entry applies when its rule matches,
 * its `file` (if any) is this file, and its `match` occurs in the finding's
 * line overlapping every span of the finding. Returns the kept findings and
 * marks each entry that was used.
 */
export function applyAllowlist(findings, allowlist, file, used = new Set()) {
  return findings.filter((f) => {
    const spans = f.spans ?? [[f.index, f.index + Math.max(1, f.match.length)]];
    const covering = allowlist.filter(
      (e) => e.rule === f.rule && (!e.file || e.file === file) && e.match
    );
    const covered = spans.every(([s, e]) =>
      covering.some((entry) => {
        for (
          let at = f.text.indexOf(entry.match);
          at !== -1;
          at = f.text.indexOf(entry.match, at + 1)
        ) {
          if (at < e && at + entry.match.length > s) {
            used.add(entry);
            return true;
          }
        }
        return false;
      })
    );
    return !covered;
  });
}

export function countByRule(findings) {
  const counts = {};
  for (const f of findings) {
    counts[f.rule] = (counts[f.rule] ?? 0) + 1;
  }
  return counts;
}

/**
 * Compare `{ file: { rule: count } }` against the baseline. `over` lists every
 * file+rule above its baseline, `under` every one below it.
 */
export function compareToBaseline(counts, baseline) {
  const over = [];
  const under = [];
  const files = new Set([...Object.keys(counts), ...Object.keys(baseline)]);
  for (const file of [...files].sort()) {
    const rules = new Set([
      ...Object.keys(counts[file] ?? {}),
      ...Object.keys(baseline[file] ?? {}),
    ]);
    for (const rule of [...rules].sort()) {
      const count = counts[file]?.[rule] ?? 0;
      const base = baseline[file]?.[rule] ?? 0;
      if (count > base) {
        over.push({ file, rule, count, base });
      } else if (count < base) {
        under.push({ file, rule, count, base });
      }
    }
  }
  return { over, under };
}

/** The baseline to write: sorted keys, zero counts and empty files dropped. */
export function normalizeBaseline(counts) {
  const out = {};
  for (const file of Object.keys(counts).sort()) {
    const rules = {};
    for (const rule of Object.keys(counts[file]).sort()) {
      if (counts[file][rule] > 0) {
        rules[rule] = counts[file][rule];
      }
    }
    if (Object.keys(rules).length > 0) {
      out[file] = rules;
    }
  }
  return out;
}

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_")) {
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(path));
    } else if (entry.name.endsWith(".mdx")) {
      files.push(path);
    }
  }
  return files.sort();
}

/**
 * Component names are proper nouns in a heading ("With Button" names the
 * Button component): the `title:` of every page under components/.
 */
function componentNames(contentDir, sources) {
  const names = [];
  for (const [path, source] of sources) {
    if (!relative(contentDir, path).startsWith(`components${sep}`)) {
      continue;
    }
    const m = source.match(/^---\n[\s\S]*?^title:\s*["']?(.+?)["']?\s*$/m);
    if (m) {
      names.push(m[1]);
    }
  }
  return names;
}

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallback;
    }
    throw new Error(`${path}: ${error.message}`, { cause: error });
  }
}

const FLAGS = new Set(["--update-baseline", "--allow-increase", "--all"]);

function parseArgs(argv) {
  const opts = {
    contentDir: DEFAULT_CONTENT_DIR,
    baseline: DEFAULT_BASELINE,
    allowlist: DEFAULT_ALLOWLIST,
    update: argv.includes("--update-baseline"),
    allowIncrease: argv.includes("--allow-increase"),
    all: argv.includes("--all"),
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (FLAGS.has(arg)) {
      continue;
    }
    if (
      arg === "--content-dir" ||
      arg === "--baseline" ||
      arg === "--allowlist"
    ) {
      const value = argv[++i];
      if (!value) {
        throw new Error(`${arg} needs a path`);
      }
      opts[
        {
          "--content-dir": "contentDir",
          "--baseline": "baseline",
          "--allowlist": "allowlist",
        }[arg]
      ] = value;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return opts;
}

function validateAllowlist(allowlist) {
  const errors = [];
  for (const [i, e] of allowlist.entries()) {
    if (!RULE_IDS.includes(e.rule)) {
      errors.push(`allowlist[${i}]: unknown rule "${e.rule}"`);
    }
    if (typeof e.match !== "string" || e.match === "") {
      errors.push(`allowlist[${i}]: \`match\` must be a non-empty string`);
    }
    if (typeof e.reason !== "string" || e.reason.trim() === "") {
      errors.push(`allowlist[${i}]: every entry needs a \`reason\``);
    }
  }
  return errors;
}

/** Lint a content dir. Returns { files, findings: { file: [finding] } }. */
export function lintDir(contentDir, allowlist) {
  const used = new Set();
  const findings = {};
  const files = walk(contentDir);
  const sources = new Map(
    files.map((path) => [path, readFileSync(path, "utf8")])
  );
  const properNouns = componentNames(contentDir, sources);
  for (const path of files) {
    const file = relative(contentDir, path).split(sep).join("/");
    const kept = applyAllowlist(
      lintProse(sources.get(path), file, { properNouns }),
      allowlist,
      file,
      used
    );
    if (kept.length > 0) {
      findings[file] = kept;
    }
  }
  return { files, findings, used };
}

function printFinding(file, f) {
  console.log(`  ${file}:${f.line} ${f.rule} ${f.message}`);
}

function warnUnusedAllowlist(allowlist, used) {
  for (const entry of allowlist) {
    if (!used.has(entry)) {
      const where = entry.file ? ` in ${entry.file}` : "";
      console.log(
        `warning: allowlist entry matched nothing: ${entry.rule} "${entry.match}"${where}`
      );
    }
  }
}

function ruleTotals(counts) {
  const totals = {};
  for (const rules of Object.values(counts)) {
    for (const [rule, n] of Object.entries(rules)) {
      totals[rule] = (totals[rule] ?? 0) + n;
    }
  }
  return totals;
}

/** `--update-baseline`: write the new counts unless one goes up unasked. */
function updateBaseline(opts, counts, { over, under }) {
  if (over.length > 0 && !opts.allowIncrease) {
    console.log("Refusing to raise the docs prose baseline:");
    for (const o of over) {
      console.log(`  ${o.file} ${o.rule}: ${o.base} → ${o.count}`);
    }
    console.log(
      `\nFAIL — ${over.length} count(s) would go up. Fix the prose, allowlist a legitimate use, or pass --allow-increase.`
    );
    return 1;
  }
  writeFileSync(
    opts.baseline,
    `${JSON.stringify(normalizeBaseline(counts), null, 2)}\n`
  );
  console.log(
    `Wrote the docs prose baseline (${under.length} count(s) lowered, ${over.length} raised).`
  );
  const totals = ruleTotals(counts);
  for (const rule of RULE_IDS) {
    if (totals[rule]) {
      console.log(`  ${rule}: ${totals[rule]}`);
    }
  }
  return 0;
}

/** The default run: fail on any file+rule above its baseline. */
function checkBaseline(fileCount, findings, { over, under }) {
  if (over.length > 0) {
    let excess = 0;
    for (const o of over) {
      excess += o.count - o.base;
      console.log(
        `\n${o.file} ${o.rule}: ${o.count} finding(s), baseline ${o.base}`
      );
      for (const f of findings[o.file].filter((x) => x.rule === o.rule)) {
        printFinding(o.file, f);
      }
    }
    console.log(
      `\nFAIL — ${excess} error(s): docs prose findings above the baseline (scripts/docs-prose-baseline.json).`
    );
    return 1;
  }
  console.log(
    `OK — ${fileCount} docs MDX files at or under the prose baseline.`
  );
  if (under.length > 0) {
    console.log(
      `  ${under.length} file/rule count(s) dropped below the baseline; run \`node scripts/lint-docs-prose.mjs --update-baseline\` to lock in the gain.`
    );
  }
  return 0;
}

/** The CLI. Returns the exit status. */
export function run(argv) {
  const opts = parseArgs(argv);
  const allowlist = readJson(opts.allowlist, []);
  const allowErrors = validateAllowlist(allowlist);
  if (allowErrors.length > 0) {
    for (const e of allowErrors) {
      console.log(`  - ${e}`);
    }
    console.log(
      `\nFAIL — ${allowErrors.length} error(s) in the docs prose allowlist.`
    );
    return 1;
  }
  const { files, findings, used } = lintDir(opts.contentDir, allowlist);
  const counts = {};
  for (const [file, list] of Object.entries(findings)) {
    counts[file] = countByRule(list);
  }
  const diff = compareToBaseline(counts, readJson(opts.baseline, {}));

  if (opts.all) {
    for (const [file, list] of Object.entries(findings)) {
      for (const f of list) {
        printFinding(file, f);
      }
    }
  }
  warnUnusedAllowlist(allowlist, used);

  return opts.update
    ? updateBaseline(opts, counts, diff)
    : checkBaseline(files.length, findings, diff);
}

/**
 * True when this file is the program node was started with. Both sides are
 * resolved, as in scripts/rotate-changelog.mjs.
 */
function isEntryPoint() {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  let entryPath;
  try {
    entryPath = realpathSync(entry);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      return false;
    }
    throw error;
  }
  return entryPath === realpathSync(fileURLToPath(import.meta.url));
}

if (isEntryPoint()) {
  try {
    process.exit(run(process.argv.slice(2)));
  } catch (error) {
    console.error(`lint-docs-prose: ${error.message}`);
    process.exit(1);
  }
}
