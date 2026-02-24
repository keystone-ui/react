import { existsSync } from "node:fs";
import { join } from "node:path";

let cached: string | null = null;

/**
 * Resolves the docs app directory at build time.
 *
 * In a monorepo, `process.cwd()` may return the workspace root instead of
 * `apps/docs/`. This checks for a known landmark directory and falls back
 * to the monorepo path when needed.
 *
 * See: https://github.com/opennextjs/opennextjs-cloudflare/issues/545
 */
export function getAppDir(): string {
  if (cached) {
    return cached;
  }

  const cwd = process.cwd();
  const directPath = join(cwd, "demos");
  const monorepoPath = join(cwd, "apps", "docs", "demos");

  console.log(`[getAppDir] cwd=${cwd}`);
  console.log(
    `[getAppDir] direct demos: ${directPath} exists=${existsSync(directPath)}`
  );
  console.log(
    `[getAppDir] monorepo demos: ${monorepoPath} exists=${existsSync(monorepoPath)}`
  );

  cached = existsSync(directPath) ? cwd : join(cwd, "apps", "docs");

  console.log(`[getAppDir] resolved=${cached}`);

  return cached;
}
