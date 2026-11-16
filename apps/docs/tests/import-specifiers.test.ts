/**
 * The import collector the package-flavour item checks rely on. A regex
 * missed `import("recharts")` and read `'from "ghost"'` as an import; these
 * cases pin both directions.
 */

import { describe, expect, it } from "vitest";

import { importSpecifiers } from "./import-specifiers";

describe("importSpecifiers", () => {
  it("collects static, multi-line, side-effect and type-only imports", () => {
    const code = [
      'import a from "./static";',
      "import {",
      "  b,",
      "  c,",
      '} from "multi-line";',
      'import "./side-effect";',
      'import type { T } from "type-only";',
    ].join("\n");
    expect(importSpecifiers(code)).toEqual([
      "./static",
      "multi-line",
      "./side-effect",
      "type-only",
    ]);
  });

  it("collects re-exports", () => {
    const code = 'export { d } from "./re-export";\nexport * from "./star";';
    expect(importSpecifiers(code)).toEqual(["./re-export", "./star"]);
  });

  it("collects literal dynamic imports, in code and in a type position", () => {
    const code = [
      'export const loadChart = () => import("recharts");',
      'const lazy = () => import("./lazy-sibling");',
      'type U = typeof import("./type-position");',
    ].join("\n");
    expect(importSpecifiers(code)).toEqual([
      "recharts",
      "./lazy-sibling",
      "./type-position",
    ]);
  });

  it("ignores import-like text in strings, template literals and comments", () => {
    const code = [
      "export const hint = 'from \"ghost\"';",
      'const doc = "import x from \\"in-a-string\\"";',
      "const tpl = `",
      'import y from "template-literal";',
      "`;",
      '// import z from "line-comment";',
      '/* import w from "block-comment"; */',
      "/**",
      ' * import v from "jsdoc";',
      " */",
    ].join("\n");
    expect(importSpecifiers(code)).toEqual([]);
  });

  it("reads a dynamic import and ignores an import-like string", () => {
    expect(
      importSpecifiers('export const loadChart = () => import("recharts");')
    ).toEqual(["recharts"]);
    expect(importSpecifiers("export const hint = 'from \"ghost\"';")).toEqual(
      []
    );
  });
});
