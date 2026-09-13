#!/usr/bin/env node
/**
 * Drift check for the published agent skill.
 *
 * The skill at skills/keystoneui-react/ is consumer-facing: it is tarballed,
 * served from keystoneui.io, and installed into other people's projects. Every
 * fact in it -- the component count, the tool names and their parameters, the
 * file tree the docs advertise -- is hand-maintained and had already gone
 * stale in five separate places before this script existed.
 *
 * Each assertion below is *derived* from the source of truth rather than
 * restated, so the only way to satisfy it is to fix the real thing.
 *
 * Run: node scripts/lint-skill.mjs        (wired into `pnpm lint:docs`)
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_DIR = join(ROOT, "skills/keystoneui-react");
const AGENTS_DOCS = join(
  ROOT,
  "apps/docs/content/docs/(getting-started)/agents"
);

const failures = [];
const fail = (file, message) => failures.push({ file, message });
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

/** Every file in the shipped skill, repo-relative, sorted. */
function walk(dir, acc = []) {
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, acc);
    } else {
      acc.push(relative(ROOT, full));
    }
  }
  return acc;
}

const skillFiles = walk(SKILL_DIR);

// ---------------------------------------------------------------------------
// 1. No repo-only paths in the shipped skill.
//
// This is the assertion that catches the whole class. The skill triggers on
// `@keystoneui/react` being in a *consumer's* dependencies, so any instruction
// naming apps/, packages/ or a bundled script resolves against their cwd and
// fails. Half the Workflow section was written this way.
// ---------------------------------------------------------------------------
const REPO_ONLY = [
  /\bapps\/(docs|storybook)\//,
  /\bpackages\/(ui|keystoneui-mcp|typescript-config)\//,
  /\bregistry\/default\//,
  /\bnode scripts\/\S+\.mjs/,
  /\$\{CLAUDE_SKILL_DIR\}/,
];

const ALLOW_MARKER = "lint-skill: allow-repo-paths";

for (const file of skillFiles) {
  if (!/\.(md|ya?ml|json)$/.test(file)) {
    continue;
  }
  const body = read(file);
  // A file may opt out when repo paths are its actual subject -- registry.md
  // documents authoring the registry, where those paths are the content. The
  // marker is explicit and greppable so the exception stays visible.
  if (body.includes(ALLOW_MARKER)) {
    continue;
  }
  const lines = body.split("\n");
  lines.forEach((line, i) => {
    for (const pattern of REPO_ONLY) {
      if (pattern.test(line)) {
        fail(
          `${file}:${i + 1}`,
          `names a path that only exists in this monorepo: ${line.trim().slice(0, 110)}`
        );
      }
    }
  });
}

// ---------------------------------------------------------------------------
// 2. Tool names, count and parameters match what the server registers.
//
// TOOL_SPECS in tools.ts is the single declaration site (server.ts registers
// from it). Parsing that one map beats parsing seven server.tool() calls, and
// beats booting the server -- which would make lint:docs depend on a build of
// a gitignored dist/.
// ---------------------------------------------------------------------------
const toolsSrc = read("packages/keystoneui-mcp/src/tools.ts");

const specsBlock = toolsSrc.match(
  /export const TOOL_SPECS = \{([\s\S]*?)\n\} as const;/
);
if (!specsBlock) {
  fail(
    "packages/keystoneui-mcp/src/tools.ts",
    "TOOL_SPECS map not found — the linter cannot verify tool drift"
  );
}

const toolNames = specsBlock
  ? [...specsBlock[1].matchAll(/^ {2}([a-z_]+): \{/gm)].map((m) => m[1])
  : [];

/** Top-level keys of an exported `z.object({ ... })`, by brace depth. */
function schemaKeys(schemaName) {
  const start = toolsSrc.indexOf(`export const ${schemaName} = z.object({`);
  if (start === -1) {
    return null;
  }
  let depth = 0;
  let i = toolsSrc.indexOf("{", start);
  const body = [];
  for (; i < toolsSrc.length; i++) {
    const ch = toolsSrc[i];
    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        break;
      }
    } else if (depth === 1) {
      body.push(ch);
    }
  }
  return [...body.join("").matchAll(/(?:^|\n)\s{2}([a-zA-Z_]+):/g)].map(
    (m) => m[1]
  );
}

const schemaFor = {
  list_components: "listComponentsSchema",
  search_components: "searchComponentsSchema",
  view_component: "viewComponentSchema",
  get_add_command: "getAddCommandSchema",
  get_examples: "getExamplesSchema",
};

// Any prose that states a tool count must state the real one.
const COUNT_WORDS = {
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};
const countSurfaces = [
  "skills/keystoneui-react/SKILL.md",
  "skills/keystoneui-react/mcp.md",
  "packages/keystoneui-mcp/README.md",
  "README.md",
  "apps/docs/content/docs/(getting-started)/agents/skills.mdx",
  "apps/docs/content/docs/(getting-started)/agents/mcp-server.mdx",
];

for (const file of countSurfaces) {
  const lines = read(file).split("\n");
  lines.forEach((line, i) => {
    const m = line.match(/\b(\d+|five|six|seven|eight|nine|ten)\s+tools\b/i);
    if (!m) {
      return;
    }
    const raw = m[1].toLowerCase();
    const stated = COUNT_WORDS[raw] ?? Number(raw);
    if (stated !== toolNames.length) {
      fail(
        `${file}:${i + 1}`,
        `says ${stated} tools; tools.ts registers ${toolNames.length} (${toolNames.join(", ")})`
      );
    }
  });
}

// Every tool the MCP docs tabulate must exist, and its documented parameters
// must match the registered schema. This is what the `category` omission was.
const mcpServerDoc = read(
  "apps/docs/content/docs/(getting-started)/agents/mcp-server.mdx"
);
for (const name of toolNames) {
  const row = mcpServerDoc.match(
    new RegExp(`^\\|\\s*\`${name}\`\\s*\\|([^|]*)\\|`, "m")
  );
  if (!row) {
    fail(
      "apps/docs/content/docs/(getting-started)/agents/mcp-server.mdx",
      `tool table has no row for \`${name}\``
    );
    continue;
  }
  const keys = schemaFor[name] ? schemaKeys(schemaFor[name]) : [];
  if (!keys) {
    continue;
  }
  const documented = row[1];
  for (const key of keys) {
    if (!documented.includes(key)) {
      fail(
        "apps/docs/content/docs/(getting-started)/agents/mcp-server.mdx",
        `\`${name}\` accepts \`${key}\` but the tool table omits it`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 3. The component count and list in SKILL.md match the registry.
//
// Scoped deliberately to the `## Component List` heading. "50+" is a
// deliberate policy everywhere else (contributing/SKILL.md records it), so a
// repo-wide count assertion would false-positive across eight files.
// ---------------------------------------------------------------------------
const registryTs = read("packages/ui/src/_registry.ts");
const actualComponents = [
  ...registryTs.matchAll(/^\s{4}name: "([a-z0-9-]+)",$/gm),
]
  .map((m) => m[1])
  .sort();

const skillMd = read("skills/keystoneui-react/SKILL.md");
const listSection = skillMd.match(/## Component List\n([\s\S]*?)(?=\n## )/);
if (listSection) {
  const stated = listSection[1].match(/(\d+)\s+components/);
  if (!stated) {
    fail(
      "skills/keystoneui-react/SKILL.md",
      "`## Component List` states no count"
    );
  } else if (Number(stated[1]) !== actualComponents.length) {
    fail(
      "skills/keystoneui-react/SKILL.md",
      `\`## Component List\` says ${stated[1]} components; _registry.ts has ${actualComponents.length}`
    );
  }
  const listed = [...listSection[1].matchAll(/`([a-z0-9-]+)`/g)]
    .map((m) => m[1])
    .sort();
  const missing = actualComponents.filter((c) => !listed.includes(c));
  const extra = listed.filter((c) => !actualComponents.includes(c));
  if (missing.length) {
    fail(
      "skills/keystoneui-react/SKILL.md",
      `\`## Component List\` omits: ${missing.join(", ")}`
    );
  }
  if (extra.length) {
    fail(
      "skills/keystoneui-react/SKILL.md",
      `\`## Component List\` names non-existent: ${extra.join(", ")}`
    );
  }
} else {
  fail("skills/keystoneui-react/SKILL.md", "no `## Component List` section");
}

// ---------------------------------------------------------------------------
// 4. The Block Selection table names blocks that exist.
// ---------------------------------------------------------------------------
const registryJson = JSON.parse(read("registry.json"));
const actualBlocks = new Set(
  registryJson.items
    .filter((i) => i.type === "registry:block")
    .map((i) => i.name)
);
const blockSection = skillMd.match(/## Block Selection\n([\s\S]*?)(?=\n## )/);
if (blockSection) {
  const named = new Set(
    [...blockSection[1].matchAll(/`([a-z]+(?:-[a-z]+)*-\d{2})`/g)].map(
      (m) => m[1]
    )
  );
  for (const name of named) {
    if (!actualBlocks.has(name)) {
      fail(
        "skills/keystoneui-react/SKILL.md",
        `Block Selection names \`${name}\`, absent from registry.json`
      );
    }
  }
  for (const name of actualBlocks) {
    if (!named.has(name)) {
      fail(
        "skills/keystoneui-react/SKILL.md",
        `registry.json has block \`${name}\`, missing from Block Selection`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Relative links inside the skill resolve.
// ---------------------------------------------------------------------------
for (const file of skillFiles.filter((f) => f.endsWith(".md"))) {
  const body = read(file);
  for (const m of body.matchAll(/\]\((\.\/[^)\s#]+)/g)) {
    const target = resolve(ROOT, dirname(file), m[1]);
    try {
      statSync(target);
    } catch {
      fail(file, `broken relative link: ${m[1]}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 6. The ASCII tree in skills.mdx matches the real directory.
// ---------------------------------------------------------------------------
const skillsDoc = readFileSync(join(AGENTS_DOCS, "skills.mdx"), "utf-8");
const tree = skillsDoc.match(/```\nskills\/keystoneui-react\/\n([\s\S]*?)```/);
if (tree) {
  const documented = new Set(
    [...tree[1].matchAll(/[├└]──\s+([A-Za-z0-9._-]+)/g)].map((m) => m[1])
  );
  const realTop = new Set(readdirSync(SKILL_DIR));
  for (const entry of realTop) {
    if (!documented.has(entry)) {
      fail("apps/docs/.../agents/skills.mdx", `tree omits \`${entry}\``);
    }
  }
  for (const entry of documented) {
    if (
      !(realTop.has(entry) || skillFiles.some((f) => f.endsWith(`/${entry}`)))
    ) {
      fail(
        "apps/docs/.../agents/skills.mdx",
        `tree lists \`${entry}\`, which does not exist`
      );
    }
  }
} else {
  fail(
    "apps/docs/.../agents/skills.mdx",
    "no skills/keystoneui-react/ tree block"
  );
}

// ---------------------------------------------------------------------------
if (failures.length) {
  console.error(`\n✖ lint-skill: ${failures.length} problem(s)\n`);
  for (const { file, message } of failures) {
    console.error(`  ${file}\n    ${message}\n`);
  }
  process.exit(1);
}

console.log(
  `✔ lint-skill: ${toolNames.length} tools, ${actualComponents.length} components, ` +
    `${actualBlocks.size} blocks, ${skillFiles.length} skill files — all consistent`
);
