import { z } from "zod";
import type { ProjectConfig } from "./config.js";
import { fetchExamples, fetchItem, fetchManifest } from "./fetcher.js";
import {
  detectProjectContext,
  formatProjectContext,
} from "./project-context.js";
import { listItems, searchItems } from "./search.js";
import type { RegistryItem } from "./types.js";

function formatItemSummary(item: RegistryItem): string {
  const parts = [`**${item.title ?? item.name}** (\`${item.name}\`)`];
  if (item.description) {
    parts.push(item.description);
  }
  if (item.categories?.length) {
    parts.push(`Categories: ${item.categories.join(", ")}`);
  }
  if (item.dependencies?.length) {
    parts.push(`Dependencies: ${item.dependencies.join(", ")}`);
  }
  if (item.registryDependencies?.length) {
    parts.push(
      `Registry dependencies: ${item.registryDependencies.join(", ")}`
    );
  }
  return parts.join("\n");
}

function formatItemDetail(item: RegistryItem): string {
  const sections = [formatItemSummary(item)];

  if (item.files?.length) {
    for (const file of item.files) {
      if (file.content) {
        sections.push(`### ${file.path}\n\`\`\`tsx\n${file.content}\`\`\``);
      }
    }
  }

  return sections.join("\n\n");
}

// --- Tool definitions ---

export const listComponentsSchema = z.object({
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(20)
    .describe("Maximum number of items to return"),
  offset: z.number().min(0).default(0).describe("Number of items to skip"),
  type: z
    .enum(["ui", "block", "example"])
    .optional()
    .describe(
      "Filter by item type: 'ui' for components, 'block' for full-page blocks, 'example' for named demo variants like 'table-with-pagination'"
    ),
  category: z
    .string()
    .optional()
    .describe(
      "Filter by category (e.g. 'authentication', 'login', 'signup', 'navigation', 'data', 'dashboard', 'admin', 'betting'). Currently only block items carry categories."
    ),
});

export async function listComponentsTool(
  config: ProjectConfig,
  input: z.infer<typeof listComponentsSchema>
) {
  const manifest = await fetchManifest(config.registry.url);
  const { items, total } = listItems(manifest, input);

  const lines = items.map(formatItemSummary);
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
    .enum(["ui", "block", "example"])
    .optional()
    .describe(
      "Filter by item type: 'ui' for components, 'block' for full-page blocks, 'example' for named demo variants"
    ),
  category: z
    .string()
    .optional()
    .describe(
      "Filter by category (e.g. 'authentication', 'login'). Currently only block items carry categories."
    ),
});

export async function searchComponentsTool(
  config: ProjectConfig,
  input: z.infer<typeof searchComponentsSchema>
) {
  const manifest = await fetchManifest(config.registry.url);
  const { results, total } = searchItems(manifest, input.query, {
    limit: input.limit,
    type: input.type,
    category: input.category,
  });

  if (results.length === 0) {
    return `No results found for "${input.query}".`;
  }

  const lines = results.map((r) => formatItemSummary(r.item));
  lines.push(`\n---\n${total} result${total === 1 ? "" : "s"} found.`);

  return lines.join("\n\n");
}

export const viewComponentSchema = z.object({
  names: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe(
      'Component names to view (e.g. ["button", "card"]). Returns full source code.'
    ),
});

export async function viewComponentTool(
  config: ProjectConfig,
  input: z.infer<typeof viewComponentSchema>
) {
  const results = await Promise.all(
    input.names.map(async (name) => {
      try {
        const item = await fetchItem(config.registry.url, name);
        return formatItemDetail(item);
      } catch {
        return `**${name}**: Not found in registry.`;
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
    .describe("Component names to generate install commands for"),
});

export function getAddCommandTool(
  config: ProjectConfig,
  input: z.infer<typeof getAddCommandSchema>
) {
  const urls = input.names.map((name) => `${config.registry.url}/${name}.json`);

  const lines = [
    "Install these components with the shadcn CLI:",
    "",
    "```bash",
    `npx shadcn@latest add ${urls.join(" ")}`,
    "```",
    "",
    "Or install individually:",
    "",
  ];

  for (const url of urls) {
    lines.push(`\`\`\`bash\nnpx shadcn@latest add ${url}\n\`\`\``);
  }

  return lines.join("\n");
}

export const getExamplesSchema = z.object({
  name: z
    .string()
    .describe(
      'Component or block name (e.g. "button", "signin-01", "tickets-01")'
    ),
});

export async function getExamplesTool(
  config: ProjectConfig,
  input: z.infer<typeof getExamplesSchema>
) {
  try {
    const bundle = await fetchExamples(config.registry.url, input.name);

    if (!bundle.files.length) {
      return `**${input.name}**: no example files found.`;
    }

    const sections = [
      `# ${input.name} examples`,
      `${bundle.files.length} file${bundle.files.length === 1 ? "" : "s"}:`,
      "",
    ];

    for (const file of bundle.files) {
      const ext = file.path.includes(".") ? file.path.split(".").pop() : "tsx";
      sections.push(`### ${file.path}`);
      sections.push(`\`\`\`${ext}\n${file.content}\n\`\`\``);
    }

    return sections.join("\n\n");
  } catch {
    return `**${input.name}**: examples not found in registry.`;
  }
}

export function getThemeInfoTool(config: ProjectConfig) {
  const registryUrl = config.registry.url;
  const themeCtx = detectProjectContext();

  return `# Keystone UI Theme

## CSS Setup

Add these to \`${themeCtx.tailwindCssFile ?? "your global CSS file"}\` -- edit that
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
- \`--sidebar\` + 7 \`--sidebar-*\`: Read by an imported shadcn sidebar (keystone ships none). Declared as aliases, so the sidebar follows the active keystone theme

Use \`text-success\` / \`bg-warning\` rather than raw \`emerald\`/\`amber\` classes, and never add a \`dark:\` override to a status token.

## Dark Mode

Add the \`dark\` class to a parent element.

## Registry

Get the full style definition:
\`\`\`bash
npx shadcn@latest add ${registryUrl}/default.json
\`\`\``;
}

export function auditChecklistTool() {
  const ctx = detectProjectContext();
  const registryMode = ctx.installMode === "registry";
  const uiAlias = ctx.aliases?.ui ?? "@/components/ui";
  const cssFile = ctx.tailwindCssFile ?? "your CSS entry point";
  const iconPkg = iconPackageFor(ctx.iconLibrary);

  return `# Post-Install Audit Checklist

## 1. CSS Setup (\`${cssFile}\`)
- [ ] \`@import "tailwindcss"\` is present in \`${cssFile}\`
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
    ? `- [ ] Importing from the project alias: \`import { Button } from "${uiAlias}/button"\`
- [ ] NOT importing from \`@keystoneui/react\` -- it is not a dependency in this project`
    : `- [ ] Using subpath imports: \`import { Button } from "@keystoneui/react/button"\`
- [ ] NOT using barrel imports from \`@keystoneui/react\``
}

## 5. Theme Variables
- [ ] CSS custom properties are defined in \`:root\` (see \`get_theme_info\` for the full list)
- [ ] Dark mode variables are defined in \`.dark\` selector

## 6. Icon Library
- [ ] Using \`${iconPkg}\` for icons, matching this project's configured icon library

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
    .describe('Component or block name (e.g. "select", "signin-01")'),
  type: z
    .enum(["component", "block"])
    .default("component")
    .describe("Which docs section to read from"),
});

export async function getDocsTool(
  config: ProjectConfig,
  input: z.infer<typeof getDocsSchema>
) {
  const section = input.type === "block" ? "blocks" : "components";
  const url = `${config.docsUrl}/llms.mdx/docs/${section}/${input.name}`;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "keystoneui-mcp" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      return `**${input.name}**: no ${input.type} docs found (${response.status}). Try search_components to find the right name.`;
    }
    return await response.text();
  } catch {
    return `**${input.name}**: could not reach ${url}.`;
  }
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
      "List all available Keystone UI components, blocks, and named examples with pagination. Returns name, description, categories, and dependency info for each item.",
    schema: listComponentsSchema,
  },
  search_components: {
    description:
      "Fuzzy search components, blocks, and named examples (e.g., `table-with-pagination`, `card-with-image`). Categories (e.g. 'authentication', 'login') participate in fuzzy matching. Use when the exact name isn't known; pair with `view_component` or `get_examples` to see code.",
    schema: searchComponentsSchema,
  },
  view_component: {
    description:
      "Get full details for one or more Keystone UI components, including complete source code, dependencies, and registry dependencies. Use this to understand how a component works before using or customizing it.",
    schema: viewComponentSchema,
  },
  get_add_command: {
    description:
      "Generate the shadcn CLI command to install one or more Keystone UI components into a project.",
    schema: getAddCommandSchema,
  },
  get_examples: {
    description:
      "Fetch live demo files for a Keystone UI component or block. Returns the TSX source for every example/demo associated with the name (e.g. button, signin-01, tickets-01). Use after view_component to see real-world usage patterns.",
    schema: getExamplesSchema,
  },
  get_docs: {
    description:
      "Fetch the full documentation page for a component or block, including its API Reference table. Props are documented ONLY here -- not in the registry -- so view_component alone will not give you a prop's type or default. Previews arrive resolved to inline TSX, so one call returns prose and working code.",
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
