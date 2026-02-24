import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

interface ClientConfig {
  config: Record<string, unknown>;
  configPath: string;
  name: string;
  serverKey: string;
  type: "json" | "toml";
}

const SERVER_ENTRY = {
  command: "npx",
  args: ["@keystoneui/mcp@latest"],
};

const CLIENTS: ClientConfig[] = [
  {
    name: "claude",
    configPath: ".mcp.json",
    type: "json",
    serverKey: "mcpServers",
    config: { mcpServers: { keystoneui: SERVER_ENTRY } },
  },
  {
    name: "cursor",
    configPath: ".cursor/mcp.json",
    type: "json",
    serverKey: "mcpServers",
    config: { mcpServers: { keystoneui: SERVER_ENTRY } },
  },
  {
    name: "vscode",
    configPath: ".vscode/mcp.json",
    type: "json",
    serverKey: "servers",
    config: { servers: { keystoneui: SERVER_ENTRY } },
  },
  {
    name: "codex",
    configPath: "~/.codex/config.toml",
    type: "toml",
    serverKey: "",
    config: {},
  },
  {
    name: "opencode",
    configPath: "opencode.json",
    type: "json",
    serverKey: "mcp",
    config: {
      mcp: {
        keystoneui: {
          type: "stdio",
          ...SERVER_ENTRY,
          enabled: true,
        },
      },
    },
  },
];

function parseArgs(): string | null {
  const idx = process.argv.indexOf("--client");
  if (idx === -1 || idx + 1 >= process.argv.length) {
    return null;
  }
  return process.argv[idx + 1];
}

function mergeJsonConfig(
  existing: Record<string, unknown>,
  client: ClientConfig
): Record<string, unknown> {
  const key = client.serverKey;
  const existingServers =
    (existing[key] as Record<string, unknown> | undefined) ?? {};
  const newServers =
    (client.config[key] as Record<string, unknown> | undefined) ?? {};

  return {
    ...existing,
    [key]: { ...existingServers, ...newServers },
  };
}

function writeJsonClient(client: ClientConfig): void {
  const targetPath = resolve(process.cwd(), client.configPath);
  const dir = dirname(targetPath);

  mkdirSync(dir, { recursive: true });

  let existing: Record<string, unknown> = {};
  if (existsSync(targetPath)) {
    try {
      existing = JSON.parse(readFileSync(targetPath, "utf-8"));
    } catch {
      // Malformed file — overwrite
    }
  }

  const merged = mergeJsonConfig(existing, client);
  writeFileSync(targetPath, `${JSON.stringify(merged, null, 2)}\n`);

  console.log(`Created ${client.configPath}`);
  console.log(`Keystone UI MCP server configured for ${client.name}.`);
}

function printCodexInstructions(): void {
  console.log("Codex uses a global TOML config that cannot be auto-written.");
  console.log("");
  console.log("Add the following to ~/.codex/config.toml:");
  console.log("");
  console.log("  [mcp_servers.keystoneui]");
  console.log('  command = "npx"');
  console.log('  args = ["@keystoneui/mcp@latest"]');
  console.log("");
  console.log("Then restart Codex.");
}

function printUsage(): void {
  const names = CLIENTS.map((c) => c.name).join(", ");
  console.log("Usage: npx @keystoneui/mcp init --client <name>");
  console.log("");
  console.log(`Supported clients: ${names}`);
  console.log("");
  console.log("Examples:");
  console.log("  npx @keystoneui/mcp init --client cursor");
  console.log("  npx @keystoneui/mcp init --client claude");
  console.log("  npx @keystoneui/mcp init --client vscode");
}

export function init(): void {
  const clientName = parseArgs();

  if (!clientName) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const client = CLIENTS.find((c) => c.name === clientName);
  if (!client) {
    console.error(`Unknown client: "${clientName}"`);
    console.error("");
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (client.type === "toml") {
    printCodexInstructions();
    return;
  }

  writeJsonClient(client);
}
