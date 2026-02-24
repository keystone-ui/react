import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getDemo } from "@/demos";
import { formatLLMHeader, type Page } from "@/lib/llms-utils";
import { getAppDir } from "@/lib/resolve-app-dir";

const CONTENT_DIR = "content/docs";
const DEMOS_DIR = "demos";

function normalizePagePath(pagePath: string): string {
  return pagePath.endsWith(".mdx") ? pagePath : `${pagePath}.mdx`;
}

async function getRawMDXContent(pagePath: string): Promise<string> {
  try {
    const normalizedPath = normalizePagePath(pagePath);
    const filePath = join(getAppDir(), CONTENT_DIR, normalizedPath);
    const content = await readFile(filePath, "utf-8");

    return content.trim() ? content : "";
  } catch (error) {
    console.error(`Failed to read MDX file: ${pagePath}`, error);
    return "";
  }
}

// --- ComponentPreview replacement ---

const COMPONENT_PREVIEW_REGEX =
  /<ComponentPreview\s+name\s*=\s*["']([^"']+)["'][^/>]*\/>/g;

async function replaceComponentPreviews(content: string): Promise<string> {
  const matches = Array.from(content.matchAll(COMPONENT_PREVIEW_REGEX));

  if (matches.length === 0) {
    return content;
  }

  const replacements = await Promise.all(
    matches.map(async (match) => {
      const fullMatch = match[0];
      const demoName = match[1];

      if (!demoName) {
        return { match: fullMatch, replacement: fullMatch };
      }

      const demo = getDemo(demoName);

      if (!demo?.file) {
        return { match: fullMatch, replacement: fullMatch };
      }

      try {
        const filePath = join(getAppDir(), DEMOS_DIR, demo.file);
        const code = await readFile(filePath, "utf-8");

        return {
          match: fullMatch,
          replacement: `\`\`\`tsx\n${code.trimEnd()}\n\`\`\``,
        };
      } catch {
        return { match: fullMatch, replacement: fullMatch };
      }
    })
  );

  let result = content;
  const processed = new Set<string>();

  for (const { match, replacement } of replacements) {
    if (processed.has(match)) {
      continue;
    }
    processed.add(match);

    const escaped = match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    result = result.replace(new RegExp(escaped, "g"), replacement);
  }

  return result;
}

// --- Content cleanup ---

const CUSTOM_COMPONENT_TAGS =
  /<(ComponentPreview|ComponentPreviewContainer|ComponentSource)[^>]*\/?>/g;
const FRONTMATTER = /^---\s*\n[\s\S]*?\n---\s*\n/m;
const EXCESSIVE_NEWLINES = /\n{3,}/g;

function cleanContentForLLM(content: string): string {
  return content
    .replace(CUSTOM_COMPONENT_TAGS, "")
    .replace(FRONTMATTER, "")
    .replace(EXCESSIVE_NEWLINES, "\n\n")
    .trim();
}

// --- Main export ---

export async function getLLMText(page: Page): Promise<string> {
  const title = page.data.title || "Untitled";
  const description = page.data.description || "";
  const url = page.url || "";
  const normalizedPath = normalizePagePath(page.path);

  const header = formatLLMHeader(title, url, normalizedPath, description);

  const rawContent = await getRawMDXContent(page.path);

  if (!rawContent) {
    return `<page url="${url}">\n${header}\n*Content unavailable*\n</page>`;
  }

  // Replace <ComponentPreview> tags with actual demo source code
  const withDemos = await replaceComponentPreviews(rawContent);

  // Clean up for LLM consumption
  const cleaned = cleanContentForLLM(withDemos);

  return `<page url="${url}">\n${header}\n${cleaned}\n</page>`;
}
