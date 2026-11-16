import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { init } from "../init.js";

/**
 * `init` writes a launch entry into project files that teams usually commit,
 * and prints the Codex entry for the user to paste. These tests run it as a
 * function against a temporary folder: no network, no package runner.
 */

const TRUST_POINTER =
  "The server runs with this project's settings. Before using it in a project you have not reviewed, read https://keystoneui.io/docs/agents/mcp-server#projects-you-do-not-trust";

const LAUNCH = { command: "npx", args: ["@keystoneui/mcp@latest"] };

const dirs: string[] = [];
let logged: string[];
let errored: string[];
let savedArgv: string[];

function project(files: Record<string, unknown> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "keystone-init-"));
  dirs.push(dir);
  for (const [name, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), JSON.stringify(contents));
  }
  return dir;
}

function run(cwd: string, ...args: string[]): void {
  vi.spyOn(process, "cwd").mockReturnValue(cwd);
  process.argv = ["node", "keystoneui", "init", ...args];
  init();
}

function readJson(dir: string, file: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(dir, file), "utf-8"));
}

beforeEach(() => {
  savedArgv = process.argv;
  logged = [];
  errored = [];
  vi.spyOn(console, "log").mockImplementation((...parts: unknown[]) => {
    logged.push(parts.join(" "));
  });
  vi.spyOn(console, "error").mockImplementation((...parts: unknown[]) => {
    errored.push(parts.join(" "));
  });
});

afterEach(() => {
  process.argv = savedArgv;
  process.exitCode = undefined;
  vi.restoreAllMocks();
  while (dirs.length > 0) {
    const dir = dirs.pop();
    if (dir) {
      rmSync(dir, { force: true, recursive: true });
    }
  }
});

const JSON_CLIENTS = [
  {
    client: "claude",
    file: ".mcp.json",
    key: "mcpServers",
    entry: LAUNCH,
  },
  {
    client: "cursor",
    file: ".cursor/mcp.json",
    key: "mcpServers",
    entry: LAUNCH,
  },
  {
    client: "vscode",
    file: ".vscode/mcp.json",
    key: "servers",
    entry: LAUNCH,
  },
  {
    client: "opencode",
    file: "opencode.json",
    key: "mcp",
    entry: { type: "stdio", ...LAUNCH, enabled: true },
  },
] as const;

describe("init for clients with a JSON config", () => {
  for (const { client, file, key, entry } of JSON_CLIENTS) {
    it(`${client}: writes the launch entry into ${file}`, () => {
      const dir = project();
      run(dir, "--client", client);

      expect(readJson(dir, file)).toEqual({ [key]: { keystoneui: entry } });
      expect(process.exitCode).toBeUndefined();
    });

    it(`${client}: keeps unrelated entries already in ${file}`, () => {
      const other = { command: "node", args: ["other-server.js"] };
      const dir = project({
        [file]: { theme: "dark", [key]: { other } },
      });
      run(dir, "--client", client);

      expect(readJson(dir, file)).toEqual({
        theme: "dark",
        [key]: { other, keystoneui: entry },
      });
    });

    it(`${client}: prints the written file, then the trust pointer once`, () => {
      run(project(), "--client", client);

      expect(logged).toEqual([
        `Created ${file}`,
        `Keystone UI MCP server configured for ${client}.`,
        TRUST_POINTER,
      ]);
      expect(errored).toEqual([]);
    });
  }
});

describe("init for codex", () => {
  const TOML_OUTPUT = [
    "Codex uses a global TOML config that cannot be auto-written.",
    "",
    "Add the following to ~/.codex/config.toml:",
    "",
    "  [mcp_servers.keystoneui]",
    '  command = "npx"',
    '  args = ["@keystoneui/mcp@latest"]',
    "",
    "Then restart Codex.",
  ];

  it("prints the TOML entry and writes nothing", () => {
    const dir = project();
    run(dir, "--client", "codex");

    expect(logged.slice(0, TOML_OUTPUT.length)).toEqual(TOML_OUTPUT);
    expect(readdirSync(dir)).toEqual([]);
    expect(existsSync(join(dir, "~"))).toBe(false);
    expect(process.exitCode).toBeUndefined();
  });

  it("prints the trust pointer once, after the TOML entry", () => {
    run(project(), "--client", "codex");

    expect(logged).toEqual([...TOML_OUTPUT, TRUST_POINTER]);
  });
});

describe("init usage", () => {
  const USAGE = [
    "Usage: npx @keystoneui/mcp@latest init --client <name>",
    "",
    "Supported clients: claude, cursor, vscode, codex, opencode",
    "",
    "Examples:",
    "  npx @keystoneui/mcp@latest init --client cursor",
    "  npx @keystoneui/mcp@latest init --client claude",
    "  npx @keystoneui/mcp@latest init --client vscode",
  ];

  it("prints usage naming the tagged package when no client is given", () => {
    const dir = project();
    run(dir);

    expect(logged).toEqual(USAGE);
    expect(process.exitCode).toBe(1);
    expect(readdirSync(dir)).toEqual([]);
  });

  it("rejects an unknown client with the same usage and no pointer", () => {
    const dir = project();
    run(dir, "--client", "emacs");

    expect(errored).toEqual(['Unknown client: "emacs"', ""]);
    expect(logged).toEqual(USAGE);
    expect(process.exitCode).toBe(1);
    expect(readdirSync(dir)).toEqual([]);
  });
});
