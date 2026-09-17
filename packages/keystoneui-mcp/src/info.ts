import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

import { loadProjectConfig } from "./config.js";
import { readPackageVersion } from "./package-version.js";
import {
  detectProjectContext,
  type ProjectContext,
} from "./project-context.js";

interface McpClientStatus {
  configPath: string;
  configured: boolean;
  name: string;
}

interface InstalledPackage {
  name: string;
  version: string;
}

interface InfoData {
  environment: {
    node: string;
    platform: string;
    cwd: string;
    registryUrl: string;
    docsUrl: string;
  };
  installedPackages: InstalledPackage[];
  links: { docs: string; registry: string; llms: string };
  mcpClients: McpClientStatus[];
  package: { name: string; version: string };
  /**
   * What the host project looks like -- install mode, aliases, theme CSS file,
   * icon library, RSC. This is the half an agent needs to write correct code;
   * everything above it is a diagnostic about whether MCP is wired up.
   */
  project: ProjectContext;
  /**
   * Bumped to 2 when `project` was added. Every schema-1 key is still present
   * and unchanged, so existing readers keep working.
   */
  schema: 2;
}

const DEFAULT_DOCS_URL = "https://keystoneui.io";

function detectMcpClients(cwd: string): McpClientStatus[] {
  const candidates: { name: string; path: string }[] = [
    { name: "claude", path: resolve(cwd, ".mcp.json") },
    { name: "cursor", path: resolve(cwd, ".cursor/mcp.json") },
    { name: "vscode", path: resolve(cwd, ".vscode/mcp.json") },
    { name: "opencode", path: resolve(cwd, "opencode.json") },
    { name: "codex", path: resolve(homedir(), ".codex/config.toml") },
  ];

  return candidates.map(({ name, path }) => {
    if (!existsSync(path)) {
      return { name, configPath: path, configured: false };
    }
    try {
      const contents = readFileSync(path, "utf-8");
      // Substring check: keeps the diagnostic forgiving across JSON/TOML
      // and across slight key variations between client formats.
      const configured = contents.includes("keystoneui");
      return { name, configPath: path, configured };
    } catch {
      return { name, configPath: path, configured: false };
    }
  });
}

function detectInstalledPackages(cwd: string): InstalledPackage[] {
  const pkgPath = resolve(cwd, "package.json");
  if (!existsSync(pkgPath)) {
    return [];
  }
  let manifest: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  try {
    manifest = JSON.parse(readFileSync(pkgPath, "utf-8"));
  } catch {
    return [];
  }

  const declared = {
    ...(manifest.dependencies ?? {}),
    ...(manifest.devDependencies ?? {}),
  };
  const keystoneNames = Object.keys(declared)
    .filter((name) => name.startsWith("@keystoneui/"))
    .sort();

  return keystoneNames.map((name) => {
    const installedPkgPath = resolve(cwd, "node_modules", name, "package.json");
    if (existsSync(installedPkgPath)) {
      try {
        const installed = JSON.parse(
          readFileSync(installedPkgPath, "utf-8")
        ) as { version?: string };
        if (installed.version) {
          return { name, version: installed.version };
        }
      } catch {
        // Fall through to declared version
      }
    }
    return { name, version: `${declared[name]} (not installed)` };
  });
}

function collect(): InfoData {
  const cwd = process.cwd();
  const config = loadProjectConfig();
  const docsUrl = process.env.KEYSTONEUI_URL ?? DEFAULT_DOCS_URL;
  const version = readPackageVersion();

  return {
    schema: 2,
    package: { name: "@keystoneui/mcp", version },
    project: detectProjectContext(cwd),
    environment: {
      node: process.version,
      platform: process.platform,
      cwd,
      registryUrl: config.registry.url,
      docsUrl,
    },
    mcpClients: detectMcpClients(cwd),
    installedPackages: detectInstalledPackages(cwd),
    links: {
      docs: docsUrl,
      registry: `${config.registry.url}/registry.json`,
      llms: `${docsUrl}/llms.txt`,
    },
  };
}

function pad(label: string, width = 18): string {
  if (label.length >= width) {
    return `${label}  `;
  }
  return label.padEnd(width, " ");
}

function printText(data: InfoData): void {
  const lines: string[] = [];

  lines.push(`${data.package.name} v${data.package.version}`);
  lines.push("");

  const p = data.project;
  lines.push("Project");
  lines.push(`  ${pad("Install mode")}${p.installMode}`);
  lines.push(`  ${pad("UI alias")}${p.aliases?.ui ?? "(unknown)"}`);
  lines.push(`  ${pad("Theme CSS")}${p.tailwindCssFile ?? "(unknown)"}`);
  lines.push(`  ${pad("Icon library")}${p.iconLibrary ?? "(unknown)"}`);
  lines.push(
    `  ${pad("RSC")}${p.isRSC === null ? "(unknown)" : String(p.isRSC)}`
  );
  lines.push(`  ${pad("Package manager")}${p.packageManager ?? "(unknown)"}`);
  lines.push("");

  lines.push("Environment");
  lines.push(`  ${pad("Node")}${data.environment.node}`);
  lines.push(`  ${pad("Platform")}${data.environment.platform}`);
  lines.push(`  ${pad("Project root")}${data.environment.cwd}`);
  lines.push(`  ${pad("Registry URL")}${data.environment.registryUrl}`);
  lines.push(`  ${pad("Docs URL")}${data.environment.docsUrl}`);
  lines.push("");

  lines.push("MCP clients");
  const configured = data.mcpClients.filter((c) => c.configured);
  if (configured.length === 0) {
    lines.push("  (none configured for keystoneui)");
  } else {
    for (const client of configured) {
      lines.push(`  ${pad(client.name)}${client.configPath}`);
    }
  }
  lines.push("");

  lines.push("Installed @keystoneui packages");
  if (data.installedPackages.length === 0) {
    lines.push("  (none detected in this project)");
  } else {
    for (const pkg of data.installedPackages) {
      lines.push(`  ${pad(pkg.name, 28)}v${pkg.version}`);
    }
  }
  lines.push("");

  lines.push("Links");
  lines.push(`  ${pad("Docs")}${data.links.docs}`);
  lines.push(`  ${pad("Registry")}${data.links.registry}`);
  lines.push(`  ${pad("llms.txt")}${data.links.llms}`);

  console.log(lines.join("\n"));
}

export function runInfo(args: string[]): void {
  const json = args.includes("--json");
  const data = collect();

  if (json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  printText(data);
}
