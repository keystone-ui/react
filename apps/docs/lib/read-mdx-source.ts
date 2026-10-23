import { readFile } from "node:fs/promises";
import { join } from "node:path";

const CONTENT_DIR = "content/docs";

function normalizePagePath(pagePath: string): string {
  return pagePath.endsWith(".mdx") ? pagePath : `${pagePath}.mdx`;
}

/**
 * Reads a docs page's raw MDX from `content/docs`.
 *
 * Throws on a missing or empty file on purpose. Every caller runs at build
 * time (the llms routes are prerendered), so a throw fails `next build`;
 * swallowing it shipped a 200 "Content unavailable" body to production.
 */
export async function readMdxSource(pagePath: string): Promise<string> {
  const filePath = join(
    process.cwd(),
    CONTENT_DIR,
    normalizePagePath(pagePath)
  );
  const content = await readFile(filePath, "utf-8");
  if (!content.trim()) {
    throw new Error(`MDX source is empty: ${filePath}`);
  }
  return content;
}
