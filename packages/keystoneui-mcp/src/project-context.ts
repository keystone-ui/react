import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * What an agent needs to know about the host project before it writes a line
 * of Keystone UI code.
 *
 * Keystone is dual-distribution -- the same components arrive either as an npm
 * dependency (subpath imports) or as vendored source via the shadcn registry
 * (alias imports). Every import statement, and the answer to "which CSS file
 * do I edit", depends on which. Without this, the skill had to guess, and its
 * loudest rule ("subpath imports only") was wrong half the time.
 *
 * Every field here is a plain read of `components.json` or `package.json`.
 * Deliberately absent, because they need a tsconfig `paths` resolver or a
 * token fingerprint and would be guesses rather than facts:
 *
 *   - `resolvedPaths` -- needs alias resolution through tsconfig `extends`
 *     chains. `aliases` is the honest half of it.
 *   - `installedComponents` -- depends on `resolvedPaths`.
 *   - `theme` -- the six themes differ only by OKLCH values, so detecting one
 *     means fingerprinting token sets, and any customization breaks the match.
 *
 * A field is `null` when it cannot be read. Null means "unknown, ask or look",
 * never "absent" -- the distinction matters to the caller.
 */
export interface ProjectContext {
  /** shadcn path aliases. `aliases.ui` is where vendored components land. */
  aliases: Record<string, string> | null;
  /** `lucide` | `tabler` | … -- never assume lucide. */
  iconLibrary: string | null;
  /**
   * How Keystone UI reaches this project, which decides import style.
   *
   * - `package`  -- `@keystoneui/react` is a dependency. Import from subpaths.
   * - `registry` -- source vendored via shadcn. Import from the project alias.
   * - `unknown`  -- neither signal. Ask before writing imports.
   */
  installMode: "package" | "registry" | "unknown";
  /** React Server Components: when true, interactive files need `"use client"`. */
  isRSC: boolean | null;
  /** Installed `@keystoneui/react` version, when it is a dependency. */
  keystoneVersion: string | null;
  /** For installing non-Keystone dependencies with the right runner. */
  packageManager: string | null;
  /** The global CSS file that owns the theme tokens. Edit this, never a new one. */
  tailwindCssFile: string | null;
}

function readJson(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

/** `packageManager: "pnpm@9.15.0"` wins; otherwise infer from the lockfile. */
function detectPackageManager(
  cwd: string,
  manifest: Record<string, unknown> | null
): string | null {
  const declared = manifest?.packageManager;
  if (typeof declared === "string" && declared.length > 0) {
    return declared.split("@")[0];
  }
  const lockfiles: [string, string][] = [
    ["pnpm-lock.yaml", "pnpm"],
    ["bun.lock", "bun"],
    ["bun.lockb", "bun"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
  ];
  for (const [file, name] of lockfiles) {
    if (existsSync(resolve(cwd, file))) {
      return name;
    }
  }
  return null;
}

export function detectProjectContext(cwd = process.cwd()): ProjectContext {
  const manifest = readJson(resolve(cwd, "package.json"));
  const components = readJson(resolve(cwd, "components.json"));

  const deps: Record<string, string> = {
    ...(manifest?.dependencies as Record<string, string> | undefined),
    ...(manifest?.devDependencies as Record<string, string> | undefined),
  };
  const keystoneVersion = deps["@keystoneui/react"] ?? null;

  // Precedence matters and is not arbitrary. The two paths are mutually
  // exclusive within a project (cli.md says so), but a project can carry both
  // signals -- someone using shadcn for other registries who then installs
  // Keystone from npm. The dependency is decisive: if the package is
  // installed, subpath imports resolve, and that is what the agent should
  // write. A components.json alone only tells us shadcn is in use.
  let installMode: ProjectContext["installMode"] = "unknown";
  if (keystoneVersion) {
    installMode = "package";
  } else if (components) {
    installMode = "registry";
  }

  const tailwind = components?.tailwind as Record<string, unknown> | undefined;
  const css = tailwind?.css;

  return {
    installMode,
    aliases:
      (components?.aliases as Record<string, string> | undefined) ?? null,
    tailwindCssFile: typeof css === "string" && css.length > 0 ? css : null,
    iconLibrary:
      typeof components?.iconLibrary === "string"
        ? components.iconLibrary
        : null,
    isRSC: typeof components?.rsc === "boolean" ? components.rsc : null,
    packageManager: detectPackageManager(cwd, manifest),
    keystoneVersion,
  };
}

/** The import statement an agent should write for `<name>`, given the mode. */
export function importLineFor(name: string, ctx: ProjectContext): string {
  if (ctx.installMode === "registry") {
    const ui = ctx.aliases?.ui ?? "@/components/ui";
    return `import { … } from "${ui}/${name}";`;
  }
  return `import { … } from "@keystoneui/react/${name}";`;
}

/** One line describing how Keystone reaches this project, and what it implies. */
function describeInstallMode(ctx: ProjectContext): string {
  if (ctx.installMode === "package") {
    const version = ctx.keystoneVersion ? ` (${ctx.keystoneVersion})` : "";
    return `**package** -- \`@keystoneui/react\`${version} is a dependency. Import from subpaths.`;
  }
  if (ctx.installMode === "registry") {
    const ui = ctx.aliases?.ui ?? "@/components/ui";
    return `**registry** -- source is vendored via shadcn. Import from \`${ui}\`.`;
  }
  return "**unknown** -- neither `@keystoneui/react` in dependencies nor a `components.json`. Ask before writing imports.";
}

function describeRsc(isRSC: boolean | null): string {
  if (isRSC === null) {
    return "_unknown_";
  }
  return isRSC ? 'yes -- interactive files need `"use client"`' : "no";
}

/** Human-readable context block, shared by the CLI and the MCP tool. */
export function formatProjectContext(ctx: ProjectContext): string {
  const rows = [
    `| install mode | ${describeInstallMode(ctx)} |`,
    `| ui alias | ${ctx.aliases?.ui ?? "_unknown_"} |`,
    `| theme CSS file | ${ctx.tailwindCssFile ?? "_unknown_ -- ask which file owns the tokens"} |`,
    `| icon library | ${ctx.iconLibrary ?? "_unknown_ -- ask before importing icons"} |`,
    `| RSC | ${describeRsc(ctx.isRSC)} |`,
    `| package manager | ${ctx.packageManager ?? "_unknown_"} |`,
  ];

  return [
    "# Project context",
    "",
    "| field | value |",
    "|---|---|",
    ...rows,
    "",
    `Example import: \`${importLineFor("button", ctx)}\``,
  ].join("\n");
}
