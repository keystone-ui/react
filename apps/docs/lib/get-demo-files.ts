import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

export interface DemoFile {
  content: string;
  path: string;
}

export interface DemoBundle {
  files: DemoFile[];
  name: string;
}

const SOURCE_EXTENSIONS = new Set([".tsx", ".ts", ".css"]);

const VALID_NAME = /^[a-z0-9-]+$/i;

export function isValidDemoName(name: string): boolean {
  return VALID_NAME.test(name);
}

async function readDirectory(dir: string): Promise<DemoFile[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });

  const files: DemoFile[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    const dotIndex = entry.name.lastIndexOf(".");
    const ext = dotIndex === -1 ? "" : entry.name.slice(dotIndex);
    if (!SOURCE_EXTENSIONS.has(ext)) {
      continue;
    }

    // Node 22's withFileTypes returns parentPath; older types may use path.
    const parent =
      (entry as unknown as { parentPath?: string; path?: string }).parentPath ??
      (entry as unknown as { path?: string }).path ??
      dir;
    const fullPath = join(parent, entry.name);
    const relativePath = relative(dir, fullPath);
    const content = await readFile(fullPath, "utf-8");
    files.push({ path: relativePath, content });
  }

  files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}

/**
 * Resolve and read demo files for a component or block.
 *
 * Lookup order:
 *  1. {demosRoot}/{name}/        — component demo directory
 *  2. {demosRoot}/blocks/{name}/ — multi-file block directory
 *  3. {demosRoot}/blocks/{name}.tsx — single-file block
 *
 * Returns null if the name is invalid (path traversal guard) or no demo found.
 */
export async function getDemoFiles(args: {
  name: string;
  demosRoot: string;
}): Promise<DemoBundle | null> {
  const { name, demosRoot } = args;

  if (!isValidDemoName(name)) {
    return null;
  }

  const candidates = [join(demosRoot, name), join(demosRoot, "blocks", name)];

  for (const dir of candidates) {
    if (existsSync(dir) && (await stat(dir)).isDirectory()) {
      const files = await readDirectory(dir);
      if (files.length > 0) {
        return { name, files };
      }
    }
  }

  const singleFile = join(demosRoot, "blocks", `${name}.tsx`);
  if (existsSync(singleFile)) {
    const content = await readFile(singleFile, "utf-8");
    return {
      name,
      files: [{ path: `${name}.tsx`, content }],
    };
  }

  return null;
}
