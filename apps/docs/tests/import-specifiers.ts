import { createRequire } from "node:module";
import { join } from "node:path";

import { REPO_ROOT } from "./registry-paths";

/**
 * TypeScript's own scanner, from the TypeScript 6 that packages/ui already
 * pins: the docs app runs TypeScript 7, which ships no JavaScript API.
 */
const ts = createRequire(join(REPO_ROOT, "packages/ui/package.json"))(
  "typescript"
) as {
  preProcessFile: (
    source: string,
    readImportFiles: boolean,
    detectJavaScriptImports: boolean
  ) => { importedFiles: { fileName: string }[] };
};

/**
 * Every module specifier a source file imports, in source order: static,
 * multi-line, side-effect, type-only, `export … from`, and literal dynamic
 * `import("…")` in code or in a type position. Text that only looks like an
 * import (in a string, a template literal or a comment) is not one.
 */
export function importSpecifiers(code: string): string[] {
  return ts
    .preProcessFile(code, true, true)
    .importedFiles.map((file) => file.fileName);
}
