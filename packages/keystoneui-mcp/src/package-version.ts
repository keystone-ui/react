import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * This package's own version, read from its package.json at runtime.
 *
 * Resolved relative to this module rather than to `process.cwd()`, so it is
 * correct however the binary is invoked. Both the bundled entry point
 * (`dist/index.js`) and the TypeScript sources (`src/*.ts`) sit exactly one
 * directory below the package root, so `../package.json` is right either way.
 *
 * npm always includes package.json in the published tarball regardless of the
 * `files` array, so this works for installed copies too.
 */
export function readPackageVersion(): string {
  try {
    const pkgPath = fileURLToPath(new URL("../package.json", import.meta.url));
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
      version?: string;
    };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}
