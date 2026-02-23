import { LLMS_TEXT_HEADERS } from "@/lib/llms-utils";
import { source } from "@/lib/source";

export const revalidate = false;

const SITE_URL = "https://keystoneui.io";

function getComponentList(): string[] {
  const pages = source.getPages();

  return pages
    .filter((page) => page.url.includes("/components/"))
    .map((page) => {
      const slug = page.slugs.at(-1) ?? "";

      return `- \`import { ... } from "@keystoneui/react/${slug}"\` — ${page.data.title}`;
    })
    .sort();
}

function generateAgentsMD(): string {
  const components = getComponentList();

  return `# Keystone UI

This project uses [Keystone UI](${SITE_URL}) for UI components.

## Quick Reference

- **Package**: \`@keystoneui/react\`
- **Documentation**: ${SITE_URL}/docs
- **LLMs.txt (full docs)**: ${SITE_URL}/llms-components.txt
- **Per-component docs**: \`${SITE_URL}/docs/components/{name}.mdx\`

## Import Pattern

Always use subpath imports:

\`\`\`tsx
import { Button } from "@keystoneui/react/button";
import { Card, CardHeader, CardTitle, CardContent } from "@keystoneui/react/card";
import { Input } from "@keystoneui/react/input";
\`\`\`

Never use barrel imports — \`@keystoneui/react\` does not have a root export.

## Available Components (${components.length})

${components.join("\n")}

## Theming

Keystone UI uses CSS custom properties with OKLCH color space. Key tokens:

- \`--primary\` / \`--primary-foreground\` — Main actions
- \`--secondary\` / \`--secondary-foreground\` — Alternative actions
- \`--destructive\` / \`--destructive-foreground\` — Destructive actions
- \`--muted\` / \`--muted-foreground\` — Subdued elements
- \`--accent\` / \`--accent-foreground\` — Highlights
- \`--background\` / \`--foreground\` — Page background and text
- \`--border\` — Border color
- \`--ring\` — Focus ring color
- \`--radius\` — Base border radius (default: 0.625rem)

Dark mode: add the \`dark\` class to a parent element.

## CSS Setup

\`\`\`css
@import "tailwindcss";
@import "@keystoneui/react/base.css";
\`\`\`

## Key Constraints

- Built on \`@base-ui/react\` (NOT Radix UI)
- Tailwind CSS v4 required
- Subpath imports only
- Use \`lucide-react\` for icons
- No raw color values in component styles — use semantic tokens
`;
}

export function GET() {
  try {
    const content = generateAgentsMD();

    return new Response(content, { headers: LLMS_TEXT_HEADERS });
  } catch (error) {
    console.error("Error generating AGENTS.md:", error);
    return new Response("Error generating AGENTS.md", {
      headers: LLMS_TEXT_HEADERS,
      status: 500,
    });
  }
}
