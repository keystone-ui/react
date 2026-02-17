import type { InferPageType } from "fumadocs-core/source";

import type { source } from "@/lib/source";

export type Page = InferPageType<typeof source>;

export const LLMS_TEXT_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  "Content-Type": "text/plain; charset=utf-8",
} as const;

const SITE_URL = "https://keystoneui.dev";
const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/your-org/keystoneui/refs/heads/main/apps/docs/content/docs";

export function formatAbsoluteUrl(path: string): string {
  if (!path) {
    return "";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${SITE_URL}${cleanPath}`;
}

export function isComponentPage(page: Page): boolean {
  return page.url.includes("/components/");
}

export function isAgentPage(page: Page): boolean {
  return page.url.includes("/agents/");
}

export function filterComponentPages(pages: Page[]): Page[] {
  return pages.filter(isComponentPage);
}

export function formatLLMHeader(
  title: string,
  url: string,
  sourcePath: string,
  description: string
): string {
  const absoluteUrl = formatAbsoluteUrl(url);
  const descriptionBlock = description ? `\n> ${description}\n` : "\n";

  return `# ${title}

**URL**: ${absoluteUrl}
**Source**: ${GITHUB_RAW_URL}/${sourcePath}${descriptionBlock}`;
}

export function generateIndexHeader(): string[] {
  return [
    "# Keystone UI Documentation",
    "",
    "> A modern React component library built with Tailwind CSS v4 and Base UI.",
    "",
    "Keystone UI provides 54+ production-ready, accessible React components with dark mode support, OKLCH color tokens, and tree-shakeable subpath exports.",
    "",
    "**Key Features:**",
    "",
    "- 54+ Components — Buttons, inputs, modals, tables, and everything in between",
    "- Accessible — Built on Base UI primitives with ARIA support and keyboard navigation",
    "- Tailwind CSS v4 — CSS-first configuration with OKLCH color tokens",
    "- Dark Mode — First-class dark mode with automatic adaptation",
    "- Tree-Shakeable — Subpath exports: `import { Button } from 'keystoneui/button'`",
    "- TypeScript — Fully typed with comprehensive type exports",
    "",
    "## Available Files",
    "",
    `- [/llms.txt](${SITE_URL}/llms.txt) — Quick reference index for Keystone UI documentation`,
    `- [/llms-full.txt](${SITE_URL}/llms-full.txt) — Complete Keystone UI documentation`,
    `- [/llms-components.txt](${SITE_URL}/llms-components.txt) — Component documentation only`,
    "",
    "## Documentation Index",
    "",
  ];
}
