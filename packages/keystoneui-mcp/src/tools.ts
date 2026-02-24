import { z } from "zod";
import type { ProjectConfig } from "./config.js";
import { fetchItem, fetchManifest } from "./fetcher.js";
import { listItems, searchItems } from "./search.js";
import type { RegistryItem } from "./types.js";

function formatItemSummary(item: RegistryItem): string {
  const parts = [`**${item.title ?? item.name}** (\`${item.name}\`)`];
  if (item.description) {
    parts.push(item.description);
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
    .enum(["ui", "block"])
    .optional()
    .describe("Filter by item type: 'ui' for components, 'block' for blocks"),
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
  type: z.enum(["ui", "block"]).optional().describe("Filter by item type"),
});

export async function searchComponentsTool(
  config: ProjectConfig,
  input: z.infer<typeof searchComponentsSchema>
) {
  const manifest = await fetchManifest(config.registry.url);
  const { results, total } = searchItems(manifest, input.query, {
    limit: input.limit,
    type: input.type,
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

export function getThemeInfoTool(config: ProjectConfig) {
  const registryUrl = config.registry.url;

  return `# Keystone UI Theme

## CSS Setup

\`\`\`css
@import "tailwindcss";
@import "@keystoneui/react/base.css";
\`\`\`

## Semantic Color Tokens (OKLCH)

| Token | Light | Dark | Usage |
|---|---|---|---|
| \`--primary\` | \`oklch(0.21 0.006 285)\` | \`oklch(0.92 0.004 286)\` | Main actions, CTAs |
| \`--secondary\` | \`oklch(0.967 0.001 286)\` | \`oklch(0.274 0.006 286)\` | Alternative actions |
| \`--destructive\` | \`oklch(0.577 0.245 27)\` | \`oklch(0.704 0.191 22)\` | Destructive actions |
| \`--muted\` | \`oklch(0.967 0.001 286)\` | \`oklch(0.274 0.006 286)\` | Subdued elements |
| \`--accent\` | \`oklch(0.967 0.001 286)\` | \`oklch(0.274 0.006 286)\` | Highlights |
| \`--background\` | \`oklch(1 0 0)\` | \`oklch(0.141 0.005 286)\` | Page background |
| \`--border\` | \`oklch(0.92 0.004 286)\` | \`oklch(1 0 0 / 10%)\` | Border color |
| \`--ring\` | \`oklch(0.21 0.006 286)\` | \`oklch(0.92 0.004 286)\` | Focus ring |

## Radius Scale

Base: \`--radius: 0.625rem\` (10px). Derived values:
- \`rounded-sm\`: 6px
- \`rounded-md\`: 8px
- \`rounded-lg\`: 10px (base)
- \`rounded-xl\`: 14px

## Custom Tokens

- \`--input-bg\`: Form control background (transparent light, 5% white dark)
- \`--popup-ring\`: Subtle popup container ring
- \`--border-muted\`: Lower-contrast separator inside popups

## Dark Mode

Add the \`dark\` class to a parent element.

## Registry

Get the full style definition:
\`\`\`bash
npx shadcn@latest add ${registryUrl}/default.json
\`\`\``;
}

export function auditChecklistTool() {
  return `# Post-Install Audit Checklist

## 1. CSS Setup
- [ ] \`@import "tailwindcss"\` is present in your CSS entry point
- [ ] \`@import "@keystoneui/react/base.css"\` is imported AFTER tailwindcss
- [ ] Dark mode variant is configured: \`@custom-variant dark (&:is(.dark *))\`

## 2. Tailwind Configuration
- [ ] Using Tailwind CSS v4.1+
- [ ] Content paths include your component files

## 3. Dependencies
- [ ] \`@keystoneui/react\` is installed
- [ ] Component-specific peer dependencies are installed (check each component's \`dependencies\` field)
- [ ] Using React 19+

## 4. Import Pattern
- [ ] Using subpath imports: \`import { Button } from "@keystoneui/react/button"\`
- [ ] NOT using barrel imports from \`@keystoneui/react\`

## 5. Theme Variables
- [ ] CSS custom properties are defined in \`:root\` (see \`get_theme_info\` for the full list)
- [ ] Dark mode variables are defined in \`.dark\` selector

## 6. Icon Library
- [ ] Using \`lucide-react\` for icons (not \`@iconify/react\` or others)

## 7. Common Issues
- [ ] If hover styles feel "sticky" on mobile: ensure \`base.css\` is imported (it gates \`hover:\` with \`@media (hover: hover)\`)
- [ ] If buttons don't show pointer cursor: Tailwind v4 changed the default — Keystone UI handles this internally
- [ ] If focus rings look wrong: don't mix outline-based and ring-based focus patterns`;
}
