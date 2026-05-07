#!/usr/bin/env node

/**
 * Reports drift between Storybook stories and Fumadocs demos.
 *
 * Stories and demos are intentionally separate surfaces (stories = dev
 * sandbox + interaction tests; demos = docs render + registry-installable
 * source) but their conceptual variant set should overlap. This script
 * flags variants that appear in only one surface so the team notices
 * drift without forcing one to generate the other.
 *
 * Legitimate divergences (story-only dev fixtures, demo-only registry
 * entries) live in scripts/stories-demos-allowlist.json.
 *
 * Usage:
 *   node scripts/lint-stories-vs-demos.mjs           # validate
 *   node scripts/lint-stories-vs-demos.mjs --emit-allowlist
 *                                                   # print allowlist
 *                                                   # JSON for current
 *                                                   # divergences (seed)
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const STORIES_DIR = join(ROOT, "apps/storybook/stories");
const DEMOS_INDEX = join(ROOT, "apps/docs/demos/index.ts");
const DEMOS_DIR = join(ROOT, "apps/docs/demos");
const ALLOWLIST_PATH = join(ROOT, "scripts/stories-demos-allowlist.json");

const args = process.argv.slice(2);
const emitAllowlist = args.includes("--emit-allowlist");

function pascalToKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function spaceToKebab(name) {
  return name.trim().replace(/\s+/g, "-").toLowerCase();
}

function parseStories(filePath) {
  const content = readFileSync(filePath, "utf-8");

  const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
  const componentName = titleMatch
    ? pascalToKebab(titleMatch[1].split("/").pop())
    : basename(filePath, ".stories.tsx");

  const variants = new Set();

  // Capture every `export const <Name>: Story = ...` or `: StoryObj<...>`
  const exportMatches = content.matchAll(
    /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*:\s*Story(?:Obj)?\b/g
  );
  for (const m of exportMatches) {
    variants.add(pascalToKebab(m[1]));
  }

  // Honor `name: "Some Display Name"` override on individual stories.
  // The override appears inside the same object literal as the export, so
  // a simple per-file scan is good enough.
  const nameOverrides = content.matchAll(/\bname:\s*["']([^"']+)["']/g);
  for (const m of nameOverrides) {
    // Skip if it's the meta-level title (already handled).
    if (titleMatch && m[1] === titleMatch[1]) {
      continue;
    }
    variants.add(spaceToKebab(m[1]));
  }

  return { componentName, variants };
}

function loadStoryIndex() {
  const files = readdirSync(STORIES_DIR)
    .filter((f) => f.endsWith(".stories.tsx"))
    .sort();
  const index = new Map();
  for (const file of files) {
    const { componentName, variants } = parseStories(join(STORIES_DIR, file));
    index.set(componentName, variants);
  }
  return index;
}

function loadDemoIndex() {
  // Prefer the registry index — it's the canonical demo set seen by
  // <ComponentPreview>, MCP, and the registry build. Fall back to a
  // filesystem walk for blocks (which use a different naming convention).
  const content = readFileSync(DEMOS_INDEX, "utf-8");
  const index = new Map();

  const matches = content.matchAll(/^\s*"([a-z0-9-]+)":\s*\{/gm);
  for (const m of matches) {
    const key = m[1];
    if (key.startsWith("block-")) {
      continue;
    }
    // Component-variant split: take the longest prefix that matches a real
    // demos/<dir>. Walk dirs once to make the lookup cheap.
    const componentDirs = readdirSync(DEMOS_DIR).filter((entry) => {
      const full = join(DEMOS_DIR, entry);
      return (
        !(entry.startsWith("_") || entry.startsWith(".")) &&
        statSync(full).isDirectory() &&
        entry !== "blocks"
      );
    });

    let component;
    let variant;
    for (const dir of componentDirs) {
      if (
        (key === dir || key.startsWith(`${dir}-`)) &&
        (!component || dir.length > component.length)
      ) {
        component = dir;
        variant = key.slice(dir.length).replace(/^-/, "") || "default";
      }
    }
    if (!component) {
      continue;
    }
    if (!index.has(component)) {
      index.set(component, new Set());
    }
    index.get(component).add(variant);
  }

  return index;
}

function loadAllowlist() {
  if (!existsSync(ALLOWLIST_PATH)) {
    return { storyOnly: {}, demoOnly: {} };
  }
  const raw = JSON.parse(readFileSync(ALLOWLIST_PATH, "utf-8"));
  return {
    storyOnly: raw.storyOnly ?? {},
    demoOnly: raw.demoOnly ?? {},
  };
}

function diffSurfaces(storyIndex, demoIndex, allowlist) {
  const drift = { storyOnly: {}, demoOnly: {} };
  const allComponents = new Set([...storyIndex.keys(), ...demoIndex.keys()]);

  for (const component of [...allComponents].sort()) {
    const stories = storyIndex.get(component) ?? new Set();
    const demos = demoIndex.get(component) ?? new Set();
    const storyOnlyAllow = new Set(
      (allowlist.storyOnly[component] ?? []).map(spaceToKebab)
    );
    const demoOnlyAllow = new Set(
      (allowlist.demoOnly[component] ?? []).map(spaceToKebab)
    );

    const sOnly = [...stories]
      .filter((v) => !(demos.has(v) || storyOnlyAllow.has(v)))
      .sort();
    const dOnly = [...demos]
      .filter((v) => !(stories.has(v) || demoOnlyAllow.has(v)))
      .sort();

    if (sOnly.length > 0) {
      drift.storyOnly[component] = sOnly;
    }
    if (dOnly.length > 0) {
      drift.demoOnly[component] = dOnly;
    }
  }

  return drift;
}

function reportDrift(drift) {
  const components = new Set([
    ...Object.keys(drift.storyOnly),
    ...Object.keys(drift.demoOnly),
  ]);
  if (components.size === 0) {
    return 0;
  }

  let total = 0;
  for (const component of [...components].sort()) {
    console.log(`\n${component}:`);
    if (drift.storyOnly[component]) {
      console.log(`  story-only: ${drift.storyOnly[component].join(", ")}`);
      total += drift.storyOnly[component].length;
    }
    if (drift.demoOnly[component]) {
      console.log(`  demo-only:  ${drift.demoOnly[component].join(", ")}`);
      total += drift.demoOnly[component].length;
    }
  }
  console.log(
    `\nFAIL — ${total} unexpected divergence(s) across ${components.size} component(s).`
  );
  console.log(
    "Add to scripts/stories-demos-allowlist.json or author the missing variant."
  );
  return total;
}

function emitAllowlistJson(drift) {
  const seed = {
    storyOnly: drift.storyOnly,
    demoOnly: drift.demoOnly,
    _notes: {
      _format:
        "Each entry under storyOnly/demoOnly is a kebab-case variant name allowed to exist on only one surface. Annotate why in this _notes block.",
    },
  };
  console.log(JSON.stringify(seed, null, 2));
}

function main() {
  const storyIndex = loadStoryIndex();
  const demoIndex = loadDemoIndex();
  const allowlist = loadAllowlist();
  const drift = diffSurfaces(storyIndex, demoIndex, allowlist);

  if (emitAllowlist) {
    emitAllowlistJson(drift);
    return;
  }

  const total = reportDrift(drift);
  if (total === 0) {
    const checked = new Set([...storyIndex.keys(), ...demoIndex.keys()]).size;
    console.log(`OK — ${checked} component(s) reconciled.`);
    process.exit(0);
  }
  process.exit(1);
}

main();
