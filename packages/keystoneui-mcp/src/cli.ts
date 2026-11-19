import { existsSync, readFileSync } from "node:fs";

import { loadProjectConfig } from "./config.js";
import { displayUrl, redactUrlInError } from "./display-url.js";
import { resolveDocs } from "./docs.js";
import { lookupManifest } from "./fetcher.js";
import { runInfo } from "./info.js";
import { init } from "./init.js";
import { nameRefusal } from "./item-name.js";
import { detectProjectContext } from "./project-context.js";
import { escapedError, isCommandSafe, shown } from "./render.js";
import {
  parseThemeCode,
  parseThemeParts,
  themeBuilderUrl,
  themeInstallCommand,
  themeInstallUrl,
} from "./theme.js";
import { auditTheme, formatAudit, readThemeTokens } from "./theme-audit.js";
import {
  auditChecklistTool,
  getExamplesTool,
  type ItemType,
  listComponentsTool,
  searchComponentsTool,
  viewComponentTool,
} from "./tools.js";

const VERBS = [
  "init",
  "info",
  "search",
  "list",
  "view",
  "examples",
  "docs",
  "audit",
  "blocks",
  "theme",
] as const;

type Verb = (typeof VERBS)[number];

const BLOCK_NAME_PATTERN = /^[a-z0-9-]+$/;

export function isCliVerb(arg: string | undefined): arg is Verb {
  return arg !== undefined && (VERBS as readonly string[]).includes(arg);
}

interface ParsedArgs {
  flags: Record<string, string>;
  positional: string[];
}

function parseArgs(args: string[]): ParsedArgs {
  const flags: Record<string, string> = {};
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = "true";
      }
    } else {
      positional.push(arg);
    }
  }

  return { flags, positional };
}

const TYPES: readonly ItemType[] = [
  "ui",
  "block",
  "example",
  "kit",
  "style",
  "theme",
  "item",
];

function parseType(value: string | undefined): ItemType | undefined {
  if (value === undefined) {
    return;
  }
  if ((TYPES as readonly string[]).includes(value)) {
    return value as ItemType;
  }
  throw new Error(
    `Invalid --type value "${shown(value)}". Expected one of: ${TYPES.join(", ")}.`
  );
}

/** Prints each refusal to stderr and sets exit 1; the names that remain. */
function refuseInvalid(names: string[]): string[] {
  const valid: string[] = [];
  for (const name of names) {
    const refusal = nameRefusal(name);
    if (refusal) {
      console.error(refusal);
      process.exitCode = 1;
    } else {
      valid.push(name);
    }
  }
  return valid;
}

function parseInt10(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) {
    throw new Error(`Expected an integer, got "${shown(value)}".`);
  }
  return n;
}

function printUsage(): void {
  console.log("Usage: keystoneui <verb> [args]");
  console.log("");
  console.log("Verbs:");
  console.log("  init [--client <name>]              Configure MCP client");
  console.log(
    "  info [--json]                        Print env diagnostic (registry, MCP clients, installed packages)"
  );
  console.log("  search <query> [--type T] [--category C] [--limit N]");
  console.log(
    "                                       Fuzzy search components, blocks, kits, examples"
  );
  console.log("  list [--type T] [--category C] [--limit N] [--offset N]");
  console.log(
    "                                       List items (T = ui|block|example|kit|style|theme|item)"
  );
  console.log(
    "  view <name> [<name>...]              Show source of components, blocks, kits"
  );
  console.log(
    "  examples <name>                      Show all demos for a component/block"
  );
  console.log(
    "  docs <name> [--type component|block] Fetch /llms.mdx/docs/{components|blocks}/<name>"
  );
  console.log(
    "  audit [--theme [css]] [--strict]     Post-install checklist, or measure your theme's contrast"
  );
  console.log(
    "  blocks [<filter>] [--category C]     List or filter full-page blocks; an exact block name views it (kits: list --type kit)"
  );
  console.log(
    "  theme <code> [--only theme,font]     Install a theme-builder code via shadcn"
  );
  console.log("");
  console.log("Without a verb, launches the MCP stdio server.");
}

async function runSearch(args: string[]): Promise<void> {
  const { flags, positional } = parseArgs(args);
  if (positional.length === 0) {
    console.error(
      "Usage: keystoneui search <query> [--type ui|block|example|kit|style|theme|item] [--category C] [--limit N]"
    );
    process.exitCode = 1;
    return;
  }
  const query = positional.join(" ");
  const type = parseType(flags.type);
  const category = flags.category;
  const limit = parseInt10(flags.limit, 10);

  const config = loadProjectConfig();
  const text = await searchComponentsTool(config, {
    query,
    limit,
    type,
    category,
  });
  console.log(text);
}

async function runList(args: string[]): Promise<void> {
  const { flags } = parseArgs(args);
  const type = parseType(flags.type);
  const category = flags.category;
  const limit = parseInt10(flags.limit, 20);
  const offset = parseInt10(flags.offset, 0);

  const config = loadProjectConfig();
  const text = await listComponentsTool(config, {
    limit,
    offset,
    type,
    category,
  });
  console.log(text);
}

async function runView(args: string[]): Promise<void> {
  const { positional } = parseArgs(args);
  if (positional.length === 0) {
    console.error("Usage: keystoneui view <name> [<name>...]");
    process.exitCode = 1;
    return;
  }
  // Valid names keep their results on stdout; each invalid one is refused
  // on stderr, and the exit code says something was refused.
  const names = refuseInvalid(positional);
  if (names.length === 0) {
    return;
  }
  const config = loadProjectConfig();
  const text = await viewComponentTool(config, { names });
  console.log(text);
}

async function runExamples(args: string[]): Promise<void> {
  const { positional } = parseArgs(args);
  if (positional.length === 0) {
    console.error("Usage: keystoneui examples <name>");
    process.exitCode = 1;
    return;
  }
  if (refuseInvalid([positional[0]]).length === 0) {
    return;
  }
  const config = loadProjectConfig();
  const text = await getExamplesTool(config, { name: positional[0] });
  console.log(text);
}

async function runDocs(args: string[]): Promise<void> {
  const { flags, positional } = parseArgs(args);
  if (positional.length === 0) {
    console.error("Usage: keystoneui docs <name> [--type component|block]");
    process.exitCode = 1;
    return;
  }
  const name = positional[0];
  if (refuseInvalid([name]).length === 0) {
    return;
  }
  // `--type` was read by nothing before, so only `block` selects anything
  // new: every other value keeps the components route.
  const section = flags.type === "block" ? "blocks" : "components";
  const result = await resolveDocs(loadProjectConfig(), name, section, () => ({
    headers: { "User-Agent": "keystoneui-cli/0.1" },
  }));
  if (result.kind === "unreachable") {
    throw escapedError(redactUrlInError(result.error, result.url));
  }
  if (result.kind === "status") {
    console.error(
      `Failed to fetch ${shown(displayUrl(result.url))}: ${result.status} ${shown(result.statusText)}`
    );
    process.exitCode = 1;
    return;
  }
  console.log(result.text);
}

function runAudit(args: string[]): void {
  const { flags } = parseArgs(args);
  if (!("theme" in flags)) {
    console.log(auditChecklistTool());
    return;
  }
  // `--theme` alone measures the CSS file components.json names.
  const file =
    flags.theme === "true"
      ? detectProjectContext().tailwindCssFile
      : flags.theme;
  if (!(file && existsSync(file))) {
    console.error(
      "Usage: keystoneui audit --theme [path/to/globals.css] [--strict]\n" +
        "No CSS file found — pass the one that holds your :root and .dark tokens."
    );
    process.exitCode = 1;
    return;
  }
  let css: string;
  try {
    css = readFileSync(file, "utf-8");
  } catch (error) {
    // The platform's message quotes the path.
    throw escapedError(error);
  }
  const results = auditTheme(readThemeTokens(css));
  console.log(formatAudit(file, results));
  if (flags.strict === "true" && results.some((r) => r.status === "fail")) {
    process.exitCode = 1;
  }
}

async function runBlocks(args: string[]): Promise<void> {
  const { flags, positional } = parseArgs(args);
  const config = loadProjectConfig();
  const category = flags.category;

  // No positional → list all blocks (optionally filtered by --category).
  if (positional.length === 0) {
    const text = await listComponentsTool(config, {
      limit: 100,
      offset: 0,
      type: "block",
      category,
    });
    console.log(text);
    return;
  }

  const filter = positional.join(" ");
  // Heuristic: a single token that looks like a block name (e.g. "signin-01")
  // routes to view; anything else is a fuzzy search.
  if (
    positional.length === 1 &&
    BLOCK_NAME_PATTERN.test(filter) &&
    filter.includes("-")
  ) {
    const text = await viewComponentTool(config, { names: [filter] });
    console.log(text);
    return;
  }

  // Otherwise, one positional that is exactly a block's name in the index
  // (`npm/users-01`) views it. Blocks only: a kit name stays a search. If
  // the index cannot be read, today's search runs.
  if (positional.length === 1 && (await isBlockName(config, filter))) {
    // The CLI's refusal policy: stderr and exit 1, as for `view`.
    if (refuseInvalid([filter]).length === 0) {
      return;
    }
    const text = await viewComponentTool(config, { names: [filter] });
    console.log(text);
    return;
  }

  const text = await searchComponentsTool(config, {
    query: filter,
    limit: 20,
    type: "block",
    category,
  });
  console.log(text);
}

async function isBlockName(
  config: ReturnType<typeof loadProjectConfig>,
  name: string
): Promise<boolean> {
  try {
    const { items } = await lookupManifest(config.registry);
    return items.some(
      (item) => item.name === name && item.type === "registry:block"
    );
  } catch {
    return false;
  }
}

function runTheme(args: string[]): void {
  const { flags, positional } = parseArgs(args);
  const code = positional[0];
  const fields = code ? parseThemeCode(code) : null;
  if (!(code && fields)) {
    console.error(
      "Usage: keystoneui theme <code> [--only theme,font]\n" +
        "Copy a code from https://keystoneui.io/theme-builder (Code panel)."
    );
    process.exitCode = 1;
    return;
  }
  const siteUrl = process.env.KEYSTONEUI_URL ?? "https://keystoneui.io";
  const only = parseThemeParts(flags.only);
  console.log(`Theme ${code}`);
  console.log(
    `  base ${fields.base} · primary ${fields.primary} · radius ${fields.radius} · font ${fields.font}`
  );
  console.log("");
  console.log("Install (writes the tokens into your global CSS):");
  console.log(
    isCommandSafe(themeInstallUrl(code, siteUrl, only))
      ? `  ${themeInstallCommand(code, siteUrl, only)}`
      : `  (no command: ${shown(displayUrl(siteUrl))} holds a line break or control character)`
  );
  console.log("");
  console.log(`Edit: ${shown(themeBuilderUrl(code, siteUrl))}`);
}

export async function runCli(args: string[]): Promise<void> {
  const verb = args[0];
  const rest = args.slice(1);

  if (verb === "--help" || verb === "-h" || verb === "help") {
    printUsage();
    return;
  }

  if (!isCliVerb(verb)) {
    console.error(`Unknown verb: "${shown(verb)}".`);
    console.error("");
    printUsage();
    process.exitCode = 1;
    return;
  }

  switch (verb) {
    case "init":
      init();
      return;
    case "info":
      runInfo(rest);
      return;
    case "search":
      await runSearch(rest);
      return;
    case "list":
      await runList(rest);
      return;
    case "view":
      await runView(rest);
      return;
    case "examples":
      await runExamples(rest);
      return;
    case "docs":
      await runDocs(rest);
      return;
    case "audit":
      runAudit(rest);
      return;
    case "blocks":
      await runBlocks(rest);
      return;
    case "theme":
      runTheme(rest);
      return;
    default: {
      const exhaustive: never = verb;
      throw new Error(`Unhandled verb: ${exhaustive}`);
    }
  }
}
