import { loadProjectConfig } from "./config.js";
import { init } from "./init.js";
import {
  auditChecklistTool,
  getExamplesTool,
  listComponentsTool,
  searchComponentsTool,
  viewComponentTool,
} from "./tools.js";

const VERBS = [
  "init",
  "search",
  "list",
  "view",
  "examples",
  "docs",
  "audit",
  "blocks",
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

function parseType(
  value: string | undefined
): "ui" | "block" | "example" | undefined {
  if (value === undefined) {
    return;
  }
  if (value === "ui" || value === "block" || value === "example") {
    return value;
  }
  throw new Error(
    `Invalid --type value "${value}". Expected one of: ui, block, example.`
  );
}

function parseInt10(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) {
    throw new Error(`Expected an integer, got "${value}".`);
  }
  return n;
}

function printUsage(): void {
  console.log("Usage: keystoneui <verb> [args]");
  console.log("");
  console.log("Verbs:");
  console.log("  init [--client <name>]              Configure MCP client");
  console.log("  search <query> [--type T] [--category C] [--limit N]");
  console.log(
    "                                       Fuzzy search components, blocks, examples"
  );
  console.log("  list [--type T] [--category C] [--limit N] [--offset N]");
  console.log(
    "                                       List items (T = ui|block|example)"
  );
  console.log("  view <name> [<name>...]              Show component source");
  console.log(
    "  examples <name>                      Show all demos for a component/block"
  );
  console.log(
    "  docs <name>                          Fetch /llms.mdx/docs/components/<name>"
  );
  console.log(
    "  audit                                Print post-install checklist"
  );
  console.log(
    "  blocks [<filter>] [--category C]     List or filter full-page blocks"
  );
  console.log("");
  console.log("Without a verb, launches the MCP stdio server.");
}

async function runSearch(args: string[]): Promise<void> {
  const { flags, positional } = parseArgs(args);
  if (positional.length === 0) {
    console.error(
      "Usage: keystoneui search <query> [--type ui|block|example] [--category C] [--limit N]"
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
  const config = loadProjectConfig();
  const text = await viewComponentTool(config, { names: positional });
  console.log(text);
}

async function runExamples(args: string[]): Promise<void> {
  const { positional } = parseArgs(args);
  if (positional.length === 0) {
    console.error("Usage: keystoneui examples <name>");
    process.exitCode = 1;
    return;
  }
  const config = loadProjectConfig();
  const text = await getExamplesTool(config, { name: positional[0] });
  console.log(text);
}

async function runDocs(args: string[]): Promise<void> {
  const { positional } = parseArgs(args);
  if (positional.length === 0) {
    console.error("Usage: keystoneui docs <name>");
    process.exitCode = 1;
    return;
  }
  const name = positional[0];
  const siteUrl = process.env.KEYSTONEUI_URL ?? "https://keystoneui.io";
  const url = `${siteUrl}/llms.mdx/docs/components/${name}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "keystoneui-cli/0.1" },
  });
  if (!response.ok) {
    console.error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
    process.exitCode = 1;
    return;
  }
  console.log(await response.text());
}

function runAudit(): void {
  console.log(auditChecklistTool());
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

  const text = await searchComponentsTool(config, {
    query: filter,
    limit: 20,
    type: "block",
    category,
  });
  console.log(text);
}

export async function runCli(args: string[]): Promise<void> {
  const verb = args[0];
  const rest = args.slice(1);

  if (verb === "--help" || verb === "-h" || verb === "help") {
    printUsage();
    return;
  }

  if (!isCliVerb(verb)) {
    console.error(`Unknown verb: "${verb}".`);
    console.error("");
    printUsage();
    process.exitCode = 1;
    return;
  }

  switch (verb) {
    case "init":
      init();
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
      runAudit();
      return;
    case "blocks":
      await runBlocks(rest);
      return;
    default: {
      const exhaustive: never = verb;
      throw new Error(`Unhandled verb: ${exhaustive}`);
    }
  }
}
