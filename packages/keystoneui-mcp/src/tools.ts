import { z } from "zod";
import type { ProjectConfig } from "./config.js";
import { displayUrl } from "./display-url.js";
import { resolveDocs } from "./docs.js";
import {
  fetchExamples,
  fetchItem,
  fetchManifest,
  isNotFound,
  lookupManifest,
} from "./fetcher.js";
import { metaLines, packageFlavours, readMeta } from "./item-meta.js";
import { nameRefusal } from "./item-name.js";
import {
  detectProjectContext,
  formatProjectContext,
} from "./project-context.js";
import { registryCatalogueUrl, registryItemUrl } from "./registry-url.js";
import {
  codeBlock,
  inlineCode,
  isCommandSafe,
  shellWord,
  shown,
} from "./render.js";
import { listItems, searchItems } from "./search.js";
import type { RegistryItem } from "./types.js";

/**
 * An item's lines. `extra` (its metadata lines) goes after every existing
 * line, so each entry's old lines stay an exact prefix of it.
 *
 * Text from a registry, a project file, the environment or the caller is
 * rendered through render.ts everywhere in this file: `shown` for prose,
 * `inlineCode` inside an inline code span, and a suggested command only when
 * every argument is command-safe (`shellWord` quotes it).
 */
function formatItemSummary(item: RegistryItem, extra: string[] = []): string {
  const parts = [
    `**${shown(item.title ?? item.name)}** (${inlineCode(item.name)})`,
  ];
  if (item.description) {
    parts.push(shown(item.description));
  }
  if (item.categories?.length) {
    parts.push(`Categories: ${item.categories.map(shown).join(", ")}`);
  }
  if (item.dependencies?.length) {
    parts.push(`Dependencies: ${item.dependencies.map(shown).join(", ")}`);
  }
  if (item.registryDependencies?.length) {
    parts.push(
      `Registry dependencies: ${item.registryDependencies.map(shown).join(", ")}`
    );
  }
  parts.push(...extra);
  return parts.join("\n");
}

/** Summary, then metadata lines, then the source sections. */
function formatItemDetail(item: RegistryItem, docsUrl: string): string {
  const sections = [formatItemSummary(item, metaLines(item, docsUrl))];

  if (item.files?.length) {
    for (const file of item.files) {
      if (file.content) {
        // The body is kept as it is: one that ends in a line break (LF,
        // CRLF or CR) is followed by the closing delimiter, as before; one
        // without gains a line break first.
        const body = String(file.content);
        const separator =
          body.endsWith("\n") || body.endsWith("\r") ? "" : "\n";
        sections.push(
          `### ${shown(file.path)}\n${codeBlock("tsx", body, separator)}`
        );
      }
    }
  }

  return sections.join("\n\n");
}

// --- Tool definitions ---

/**
 * `type` values and the registry type each selects. `kit` names
 * `registry:component`: `component` already means the components docs
 * section in get_docs.
 */
const ITEM_TYPES = [
  "ui",
  "block",
  "example",
  "kit",
  "style",
  "theme",
  "item",
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

function registryType(type: ItemType | undefined): string | undefined {
  return type === "kit" ? "component" : type;
}

/** Each entry with its metadata lines; relations come from the whole index. */
function formatEntries(
  items: RegistryItem[],
  allItems: RegistryItem[],
  docsUrl: string
): string[] {
  const flavours = packageFlavours(allItems);
  return items.map((item) =>
    formatItemSummary(item, metaLines(item, docsUrl, flavours))
  );
}

export const listComponentsSchema = z.object({
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(20)
    .describe("Maximum number of items to return"),
  offset: z.number().min(0).default(0).describe("Number of items to skip"),
  type: z
    .enum(ITEM_TYPES)
    .optional()
    .describe(
      "Filter by item type: 'ui' for components, 'block' for full-page blocks, 'example' for named demo variants like 'table-with-pagination', 'kit' for pieces taken from a block and installable on their own (such as 'sidebar' or 'filter-pills'), and 'style' | 'theme' | 'item' for those registry types"
    ),
  category: z
    .string()
    .optional()
    .describe(
      "Filter by category (e.g. 'authentication', 'login', 'signup', 'navigation', 'data', 'dashboard', 'admin', 'betting'). Blocks and kits carry categories; components and examples do not."
    ),
});

export async function listComponentsTool(
  config: ProjectConfig,
  input: z.infer<typeof listComponentsSchema>
) {
  const manifest = await fetchManifest(config.registry);
  const { items, total } = listItems(manifest, {
    ...input,
    type: registryType(input.type),
  });

  const lines = formatEntries(items, manifest.items, config.docsUrl);
  lines.push(`\n---\nShowing ${items.length} of ${total} items.`);
  if (input.offset + items.length < total) {
    lines.push(`Use offset: ${input.offset + items.length} to see more.`);
  }

  return lines.join("\n\n");
}

export const searchComponentsSchema = z.object({
  query: z.string().describe("Search query (name, description, or keywords)"),
  limit: z
    .number()
    .min(1)
    .max(50)
    .default(10)
    .describe("Maximum number of results"),
  type: z
    .enum(ITEM_TYPES)
    .optional()
    .describe(
      "Filter by item type: 'ui' for components, 'block' for full-page blocks, 'example' for named demo variants, 'kit' for pieces taken from a block and installable on their own, and 'style' | 'theme' | 'item' for those registry types"
    ),
  category: z
    .string()
    .optional()
    .describe(
      "Filter by category (e.g. 'authentication', 'login'). Blocks and kits carry categories; components and examples do not."
    ),
});

export async function searchComponentsTool(
  config: ProjectConfig,
  input: z.infer<typeof searchComponentsSchema>
) {
  const manifest = await fetchManifest(config.registry);
  const { results, total } = searchItems(manifest, input.query, {
    limit: input.limit,
    type: registryType(input.type),
    category: input.category,
  });

  if (results.length === 0) {
    return `No results found for "${shown(input.query)}".`;
  }

  const lines = formatEntries(
    results.map((r) => r.item),
    manifest.items,
    config.docsUrl
  );
  lines.push(`\n---\n${total} result${total === 1 ? "" : "s"} found.`);

  return lines.join("\n\n");
}

export const viewComponentSchema = z.object({
  names: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe(
      'Names of components, blocks, kits, or package flavours to view (e.g. ["button", "users-01", "sidebar", "npm/users-01"]). Returns full source code.'
    ),
});

export async function viewComponentTool(
  config: ProjectConfig,
  input: z.infer<typeof viewComponentSchema>
) {
  const results = await Promise.all(
    input.names.map(async (name) => {
      const refusal = nameRefusal(name);
      if (refusal) {
        return refusal;
      }
      try {
        const item = await fetchItem(config.registry, name);
        return formatItemDetail(item, config.docsUrl);
      } catch {
        return `**${shown(name)}**: Not found in registry.`;
      }
    })
  );

  return results.join("\n\n---\n\n");
}

export const getAddCommandSchema = z.object({
  names: z
    .array(z.string())
    .min(1)
    // Bounded so a runaway array cannot build an unbounded shell command. The
    // cap is looser than view_component's 5 because this tool only formats
    // strings -- there is no per-name network fetch to fan out.
    .max(20)
    .describe(
      "Names of components, blocks, or kits to generate install commands for (a package flavour such as `npm/users-01` may be named directly)"
    ),
  flavour: z
    .enum(["vendored", "package"])
    .optional()
    .describe(
      "'package' for a project that uses the @keystoneui/react package (get_project_context install mode `package`): installs a block's or kit's package flavour where the registry has one, and names the components to import from the package instead. Omitted or 'vendored': the commands for the names as given, with no lookup. Spelled `flavour`."
    ),
});

type AddCommandInput = z.infer<typeof getAddCommandSchema>;

/**
 * Today's text: the combined command, then one per URL. A URL holding a line
 * break or control character cannot be printed as a command line: then the
 * guidance alone.
 */
function installText(urls: string[]): string {
  const unsafe = urls.filter((url) => !isCommandSafe(url));
  if (unsafe.length > 0) {
    return `No install command: ${unsafe
      .map((url) => shown(displayUrl(url)))
      .join(
        ", "
      )} holds a line break or control character, so it cannot be printed as a command.`;
  }
  const words = urls.map(shellWord);
  return [
    "Install these components with the shadcn CLI:",
    "",
    codeBlock("bash", `npx shadcn@latest add ${words.join(" ")}`),
    "",
    "Or install individually:",
    "",
    ...words.map((word) => codeBlock("bash", `npx shadcn@latest add ${word}`)),
  ].join("\n");
}

const REFUSED_HEADER =
  "No install command: every name must be a registry item name.";

/**
 * Install commands for the names. Without `flavour`, or with `"vendored"`,
 * the handler reads and fetches nothing; existing text is preserved except
 * for the specified name refusals, URL quoting, and suppression of commands
 * containing line breaks or controls. With `"package"`, the index and the
 * project are read to pick each name's install target.
 */
export function getAddCommandTool(
  config: ProjectConfig,
  input: Omit<AddCommandInput, "flavour"> & { flavour?: "vendored" }
): string;
export function getAddCommandTool(
  config: ProjectConfig,
  input: AddCommandInput
): string | Promise<string>;
export function getAddCommandTool(
  config: ProjectConfig,
  input: AddCommandInput
): string | Promise<string> {
  const refusals = input.names
    .map((name) => nameRefusal(name))
    .filter((refusal): refusal is string => refusal !== null);
  if (refusals.length > 0) {
    return [REFUSED_HEADER, ...refusals.map((r) => `- ${r}`)].join("\n");
  }
  if (input.flavour === "package") {
    return packageAddCommand(config, input.names);
  }
  return installText(
    input.names.map((name) => registryItemUrl(config.registry, name))
  );
}

const VENDORS_SOURCE =
  "No package flavour: this vendors source that imports from your ui alias, beside the package.";
const VENDORED_TYPES = new Set([
  "registry:block",
  "registry:component",
  "registry:example",
]);

interface Pick {
  line: string;
  refusal?: string;
  target?: string;
}

function versionNote(minVersion: string | undefined, declared: string): string {
  return minVersion
    ? ` Needs @keystoneui/react ${shown(minVersion)} or later; ${declared}.`
    : "";
}

/** One name's install target under `flavour: "package"`, and its line. */
function pickTarget(
  name: string,
  items: Map<string, RegistryItem>,
  flavours: Map<string, string>,
  declared: string
): Pick {
  const item = items.get(name);
  if (!item) {
    return {
      line: `${inlineCode(name)}: Not in the registry index; command composed from the name.`,
      target: name,
    };
  }
  const meta = readMeta(item);
  if (meta?.flavourOf) {
    return {
      line: `${inlineCode(name)}: package flavour of ${inlineCode(meta.flavourOf)}.${versionNote(meta.minPackageVersion, declared)}`,
      target: name,
    };
  }
  const flavour = flavours.get(name);
  if (flavour) {
    const refusal = nameRefusal(
      flavour,
      ` (the package flavour of ${shown(name)})`
    );
    const flavourMeta = readMeta(items.get(flavour) as RegistryItem);
    return {
      line: `${inlineCode(name)} → ${inlineCode(flavour)} (package flavour).${versionNote(flavourMeta?.minPackageVersion, declared)}`,
      target: flavour,
      ...(refusal ? { refusal } : {}),
    };
  }
  if (item.type === "registry:ui") {
    return {
      line: `${shown(name)} is a component. If @keystoneui/react provides it, import it from "@keystoneui/react/${shown(name)}" instead of installing it.`,
    };
  }
  if (VENDORED_TYPES.has(item.type)) {
    return { line: `${inlineCode(name)}: ${VENDORS_SOURCE}`, target: name };
  }
  return {
    line: `${inlineCode(name)}: a ${shown(String(item.type))} item, installed as named.`,
    target: name,
  };
}

async function packageAddCommand(
  config: ProjectConfig,
  names: string[]
): Promise<string> {
  let allItems: RegistryItem[];
  try {
    allItems = (await lookupManifest(config.registry)).items;
  } catch {
    const index = shown(displayUrl(registryCatalogueUrl(config.registry)));
    return `Could not read the registry index (${index}); names kept as supplied; package-flavour selection could not be checked.\n\n${installText(
      names.map((name) => registryItemUrl(config.registry, name))
    )}`;
  }

  const { keystoneVersion } = detectProjectContext();
  const declared = keystoneVersion
    ? `package.json declares ${shown(keystoneVersion)}`
    : "package.json declares no @keystoneui/react dependency";
  const items = new Map<string, RegistryItem>();
  for (const item of allItems) {
    if (!items.has(item.name)) {
      items.set(item.name, item);
    }
  }
  const flavours = packageFlavours(allItems);
  const picks = names.map((name) =>
    pickTarget(name, items, flavours, declared)
  );

  const refusals = picks.flatMap((pick) =>
    pick.refusal ? [`- ${pick.refusal}`] : []
  );
  if (refusals.length > 0) {
    return [REFUSED_HEADER, ...refusals].join("\n");
  }

  const targets = [
    ...new Set(picks.flatMap((pick) => (pick.target ? [pick.target] : []))),
  ];
  const perName = picks.map((pick) => `- ${pick.line}`).join("\n");
  if (targets.length === 0) {
    return `${perName}\n\nNo install command: none of these names is installed with flavour: "package".`;
  }
  return `${perName}\n\n${installText(
    targets.map((target) => registryItemUrl(config.registry, target))
  )}`;
}

export const getExamplesSchema = z.object({
  name: z
    .string()
    .describe(
      'Component, block, kit, or package flavour name (e.g. "button", "signin-01", "tickets-01", "sidebar")'
    ),
});

export async function getExamplesTool(
  config: ProjectConfig,
  input: z.infer<typeof getExamplesSchema>
) {
  const refusal = nameRefusal(input.name);
  if (refusal) {
    return refusal;
  }
  try {
    const bundle = await fetchExamples(config.registry, input.name);

    if (!bundle.files.length) {
      return `**${shown(input.name)}**: no example files found.`;
    }

    const sections = [
      `# ${shown(input.name)} examples`,
      `${bundle.files.length} file${bundle.files.length === 1 ? "" : "s"}:`,
      "",
    ];

    for (const file of bundle.files) {
      const ext = file.path.includes(".") ? file.path.split(".").pop() : "tsx";
      sections.push(`### ${shown(file.path)}`);
      sections.push(codeBlock(ext, file.content));
    }

    return sections.join("\n\n");
  } catch (error) {
    const notFound = `**${shown(input.name)}**: examples not found in registry.`;
    // Only a real 404 can mean "no demos of its own"; an outage says nothing.
    if (!isNotFound(error)) {
      return notFound;
    }
    const hint = await examplesHint(config, input.name);
    return hint ? `${notFound}\n${hint}` : notFound;
  }
}

/**
 * For a kit or flavour with no demos: the block whose demos show it. A
 * flavour goes to its parent, and a kit to the blocks it is part of; no
 * further, so no cycle. Nothing when the index cannot be read.
 */
async function examplesHint(
  config: ProjectConfig,
  name: string
): Promise<string | null> {
  let items: RegistryItem[];
  try {
    items = (await lookupManifest(config.registry)).items;
  } catch {
    return null;
  }
  const find = (wanted: string) =>
    items.find((candidate) => candidate.name === wanted);
  const item = find(name);
  const meta = item && readMeta(item);
  let used = meta?.partOf;
  if (!used && meta?.flavourOf) {
    const parent = find(meta.flavourOf);
    if (parent) {
      used = readMeta(parent)?.partOf ?? [parent.name];
    }
  }
  if (!used) {
    return null;
  }
  // The call's argument is a JSON string, so it reads back as the name.
  return `No demos of its own; it is used in ${used.map(shown).join(", ")}: get_examples(${shown(JSON.stringify(used[0]))})`;
}

/**
 * A bash block for one URL as one shell word, or the guidance alone when it
 * cannot be one. `probe` is the same URL with a safe stand-in for a
 * placeholder (`<code>`): when the probe needs no quoting, the URL is
 * printed as it is, placeholder included.
 */
function commandBlock(url: string, probe = url): string {
  if (!isCommandSafe(url)) {
    return `(No command: ${shown(displayUrl(url))} holds a line break or control character.)`;
  }
  const word = shellWord(probe) === probe ? url : shellWord(url);
  return codeBlock("bash", `npx shadcn@latest add ${word}`);
}

export function getThemeInfoTool(config: ProjectConfig) {
  const defaultStyleUrl = registryItemUrl(config.registry, "default");
  const themeUrl = registryItemUrl(config.registry, "theme/<code>");
  const themeProbeUrl = registryItemUrl(config.registry, "theme/code");
  const themeCtx = detectProjectContext();

  return `# Keystone UI Theme

## CSS Setup

Add these to ${inlineCode(themeCtx.tailwindCssFile ?? "your global CSS file")} -- edit that
file rather than creating a new one, or the tokens will not reach the components.

\`\`\`css
@import "tailwindcss";
@import "@keystoneui/react/base.css";
\`\`\`

## Semantic Color Tokens (OKLCH)

| Token | Light | Dark | Usage |
|---|---|---|---|
| \`--primary\` | \`oklch(0.21 0.006 285)\` | \`oklch(0.92 0.004 286)\` | Main actions, CTAs |
| \`--secondary\` | \`oklch(0.967 0.001 286)\` | \`oklch(0.274 0.006 286)\` | Alternative actions |
| \`--destructive\` | \`oklch(0.577 0.245 27)\` | \`oklch(0.704 0.191 22)\` | Destructive actions, a metric that got worse |
| \`--success\` | \`oklch(0.627 0.194 149)\` | \`oklch(0.723 0.19 150)\` | Positive status, a metric that improved |
| \`--warning\` | \`oklch(0.769 0.188 70)\` | \`oklch(0.828 0.189 84)\` | Caution and threshold states only |
| \`--info\` | \`oklch(0.546 0.245 263)\` | \`oklch(0.707 0.165 255)\` | Neutral notices (info Alert, info Toast) |
| \`--muted\` | \`oklch(0.967 0.001 286)\` | \`oklch(0.274 0.006 286)\` | Subdued elements |
| \`--accent\` | \`oklch(0.967 0.001 286)\` | \`oklch(0.274 0.006 286)\` | Highlights |
| \`--background\` | \`oklch(1 0 0)\` | \`oklch(0.141 0.005 286)\` | Page background |
| \`--border\` | \`oklch(0.92 0.004 286)\` | \`oklch(1 0 0 / 10%)\` | Border color |
| \`--ring\` | \`oklch(0.21 0.006 286)\` | \`oklch(0.92 0.004 286)\` | Focus ring |

## Radius Scale

Base: \`--radius: 0.625rem\` (10px). Derived values:
- \`rounded-sm\`: \`--radius * 0.6\` (6px)
- \`rounded-md\`: \`--radius * 0.8\` (8px)
- \`rounded-lg\`: \`--radius\` (10px, base)
- \`rounded-xl\`: \`--radius * 1.4\` (14px)

Ratios, not pixel offsets — the scale stays proportional at any base.

## Custom Tokens

- \`--input-bg\`: Form control background (transparent light, 5% white dark)
- \`--popup-ring\`: Subtle popup container ring
- \`--border-muted\`: Lower-contrast separator inside popups, and Card's filled ring
- \`--success-foreground\` / \`--warning-foreground\`: Text on a success/warning fill. \`--warning-foreground\` is dark, not near-white — near-white on amber-500 is ~1.9:1 and fails WCAG
- \`--sidebar\` + 7 \`--sidebar-*\`: Read by the sidebar item (\`sidebar\`) and by an imported shadcn sidebar. Declared as aliases, so the sidebar follows the active keystone theme

Use \`text-success\` / \`bg-warning\` rather than raw \`emerald\`/\`amber\` classes, and never add a \`dark:\` override to a status token.

## Dark Mode

Add the \`dark\` class to a parent element.

## Registry

Get the full style definition:
${commandBlock(defaultStyleUrl)}

## Custom themes

The theme builder (${shown(config.docsUrl)}/theme-builder) encodes a theme as a code,
\`k1_<base>_<L>_<C>_<H>_<radius>_<font>\`, served as a \`registry:theme\` item.
Install one, or only its colours (\`?only=theme\`) or font (\`?only=font\`):
${commandBlock(themeUrl, themeProbeUrl)}
\`keystoneui theme <code>\` prints the decoded settings and this command.`;
}

export function auditChecklistTool() {
  const ctx = detectProjectContext();
  const registryMode = ctx.installMode === "registry";
  const uiAlias = ctx.aliases?.ui ?? "@/components/ui";
  const cssFile = ctx.tailwindCssFile ?? "your CSS entry point";
  const iconPkg = iconPackageFor(ctx.iconLibrary);

  return `# Post-Install Audit Checklist

## 1. CSS Setup (${inlineCode(cssFile)})
- [ ] \`@import "tailwindcss"\` is present in ${inlineCode(cssFile)}
- [ ] \`@import "@keystoneui/react/base.css"\` is imported AFTER tailwindcss
- [ ] Dark mode variant is configured: \`@custom-variant dark (&:is(.dark *))\`

## 2. Tailwind Configuration
- [ ] Using Tailwind CSS v4.1+
- [ ] Content paths include your component files

## 3. Dependencies
- [ ] \`@keystoneui/react\` is installed
- [ ] Component-specific peer dependencies are installed (check each component's \`dependencies\` field)
- [ ] Using React 19+

## 4. Import Pattern (install mode: ${ctx.installMode})
${
  registryMode
    ? `- [ ] Importing from the project alias: ${inlineCode(`import { Button } from "${uiAlias}/button"`)}
- [ ] NOT importing from \`@keystoneui/react\` -- it is not a dependency in this project`
    : `- [ ] Using subpath imports: \`import { Button } from "@keystoneui/react/button"\`
- [ ] NOT using barrel imports from \`@keystoneui/react\``
}

## 5. Theme Variables
- [ ] CSS custom properties are defined in \`:root\` (see \`get_theme_info\` for the full list)
- [ ] Dark mode variables are defined in \`.dark\` selector

## 6. Icon Library
- [ ] Using ${inlineCode(iconPkg)} for icons, matching this project's configured icon library

## 7. Common Issues
- [ ] If hover styles feel "sticky" on mobile: ensure \`base.css\` is imported (it gates \`hover:\` with \`@media (hover: hover)\`)
- [ ] If buttons don't show pointer cursor: Tailwind v4 changed the default — Keystone UI handles this internally
- [ ] If focus rings look wrong: don't mix outline-based and ring-based focus patterns`;
}

/**
 * npm package name for a shadcn `iconLibrary` value. Unknown values pass
 * through: a project naming its own library knows better than this map, and a
 * null means we simply have not been told, where lucide is the right default.
 */
const ICON_PACKAGES: Record<string, string> = {
  lucide: "lucide-react",
  tabler: "@tabler/icons-react",
  hugeicons: "@hugeicons/react",
  remix: "@remixicon/react",
};

function iconPackageFor(library: string | null): string {
  if (library === null) {
    return "lucide-react";
  }
  return ICON_PACKAGES[library] ?? library;
}

export const getDocsSchema = z.object({
  name: z
    .string()
    .describe(
      'Component, block, kit, or package flavour name (e.g. "select", "signin-01", "sidebar", "npm/users-01")'
    ),
  type: z
    .enum(["component", "block"])
    .default("component")
    .describe("Which docs section to read from"),
});

export async function getDocsTool(
  config: ProjectConfig,
  input: z.infer<typeof getDocsSchema>
) {
  const refusal = nameRefusal(input.name);
  if (refusal) {
    return refusal;
  }
  const result = await resolveDocs(
    config,
    input.name,
    input.type === "block" ? "blocks" : "components",
    () => ({
      headers: { "User-Agent": "keystoneui-mcp" },
      signal: AbortSignal.timeout(30_000),
    })
  );
  if (result.kind === "page") {
    return result.text;
  }
  if (result.kind === "status") {
    return `**${shown(input.name)}**: no ${input.type} docs found (${result.status}). Try search_components to find the right name.`;
  }
  return `**${shown(input.name)}**: could not reach ${shown(displayUrl(result.url))}.`;
}

// --- Tool registry ---

/**
 * One declaration site for every tool's name, description, and input shape.
 *
 * `server.ts` registers from this map rather than re-declaring each shape
 * inline. That is what keeps the two from drifting: the `category` parameter
 * once existed here and not in the registered description, and the docs
 * inherited the shorter one.
 *
 * `scripts/lint-skill.mjs` parses this map to check the skill, the MCP docs
 * page, and the package README against what is actually registered -- so the
 * tool count and parameter lists cannot go stale without failing `lint:docs`.
 */
export const emptySchema = z.object({});

export const TOOL_SPECS = {
  list_components: {
    description:
      "List all available Keystone UI components, blocks, kits, and named examples with pagination. Returns name, description, categories, and dependency info for each item. A package flavour is listed as its own entry, with a `Flavour of:` line.",
    schema: listComponentsSchema,
  },
  search_components: {
    description:
      "Fuzzy search components, blocks, kits, and named examples (e.g., `table-with-pagination`, `card-with-image`). Categories (e.g. 'authentication', 'login') participate in fuzzy matching. Use when the exact name isn't known; pair with `view_component` or `get_examples` to see code.",
    schema: searchComponentsSchema,
  },
  view_component: {
    description:
      "Get full details for one or more Keystone UI components, blocks, kits, or a package flavour such as `npm/users-01`, including complete source code, dependencies, and registry dependencies. Use this to understand how a component works before using or customizing it.",
    schema: viewComponentSchema,
  },
  get_add_command: {
    description:
      'Generate the shadcn CLI command to install one or more Keystone UI components, blocks, or kits into a project. In a project that uses the @keystoneui/react package (see get_project_context), pass flavour: "package" to install the package flavour of a block or kit where the registry has one.',
    schema: getAddCommandSchema,
  },
  get_examples: {
    description:
      "Fetch live demo files for a Keystone UI component or block. Returns the TSX source for every example/demo associated with the name (e.g. button, signin-01, tickets-01). A kit or package flavour with no demos of its own names the block whose demos show it. Use after view_component to see real-world usage patterns.",
    schema: getExamplesSchema,
  },
  get_docs: {
    description:
      "Fetch the full documentation page for a component, block, kit, or package flavour; kits and flavours resolve to the page section that documents them. Includes its Composition tree (the parts hierarchy, and nestings Base UI rejects) and its API Reference table. Read it before composing any compound component. Props are documented ONLY here -- not in the registry -- so view_component alone will not give you a prop's type or default. Previews arrive resolved to inline TSX, so one call returns prose and working code.",
    schema: getDocsSchema,
  },
  get_project_context: {
    description:
      "Read this project's Keystone UI setup: install mode (npm package vs vendored registry source), path aliases, which CSS file owns the theme tokens, icon library, whether React Server Components are in use, and the package manager. Call this FIRST -- import style and which file to edit both depend on it, and guessing wrong is the most common source of broken output.",
    schema: emptySchema,
  },
  get_theme_info: {
    description:
      "Get Keystone UI theme configuration: CSS setup, semantic color tokens (OKLCH), radius scale, dark mode setup, and custom tokens.",
    schema: emptySchema,
  },
  audit_checklist: {
    description:
      "Get a post-install audit checklist to verify Keystone UI is correctly configured in your project. Covers CSS setup, Tailwind config, dependencies, imports, and common issues.",
    schema: emptySchema,
  },
} as const;

export type ToolName = keyof typeof TOOL_SPECS;

/**
 * Report the host project's setup.
 *
 * This is the tool an agent should reach for before writing any import. The
 * MCP transport gives no shell, so without it an MCP-only client cannot see
 * install mode at all and has to assume -- which is exactly the failure this
 * whole surface existed to prevent.
 */
export function getProjectContextTool(): string {
  return formatProjectContext(detectProjectContext());
}
