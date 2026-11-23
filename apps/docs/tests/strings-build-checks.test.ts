/**
 * The pure half of scripts/lib/strings-build-checks.mjs: each build-backed
 * check (B1 to B4) must be able to fail. The checks themselves read the
 * built package and run in `pnpm smoke:install`, after the package build.
 */

import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  CLOSE,
  checkClientBoundary,
  distProblem,
  FOOTER_CLOSE,
  filesIn,
  importClosure,
  MODAL_ONLY_UI_FILES,
  relativeImports,
  renderFailures,
  SERVER_EXPECTATIONS,
  serverFailures,
  serverTreeModule,
} from "../../../scripts/lib/strings-build-checks.mjs";

const DIST = "/dist";

/** A fake dist: file name -> source. */
function reader(files: Record<string, string>) {
  return (path: string) => {
    const name = path.slice(DIST.length + 1);
    const source = files[name];
    if (source === undefined) {
      throw new Error(`no fake file ${name}`);
    }
    return source;
  };
}

const STRINGS_CHUNK = `// src/strings.tsx
import { createContext } from "react";
export const StringsContext = createContext(null);
`;

function healthyDist(): Record<string, string> {
  return {
    "strings.js": `"use client";\nimport { StringsProvider } from "./chunk-S.js";\nexport { StringsProvider };\n`,
    "chunk-S.js": STRINGS_CHUNK,
    "modal.js": `"use client";\nimport { useStrings } from "./chunk-S.js";\nimport { Button } from "./chunk-B.js";\n`,
    "chunk-B.js": "// src/button.tsx\nexport function Button() {}\n",
    "spinner.js": `import { cn } from "./chunk-U.js";\nexport function Spinner() {}\n`,
    "pagination.js": `import { Button } from "./chunk-B.js";\nexport function Pagination() {}\n`,
    "chunk-U.js": "export function cn() {}\n",
  };
}

// The entry list is injected; the real one (every top-level dist .js but
// chunks, plus hooks/index.js) is exercised by smoke:install.
describe("B1 client boundary", () => {
  it("follows relative imports through chunks", () => {
    const read = reader(healthyDist());
    const closure = importClosure(join(DIST, "pagination.js"), read);
    expect([...closure].sort()).toEqual([
      join(DIST, "chunk-B.js"),
      join(DIST, "pagination.js"),
    ]);
  });

  it("finds the strings code behind a shared chunk", () => {
    const files = healthyDist();
    files["chunk-B.js"] =
      '// src/button.tsx\nimport { useStrings } from "./chunk-S.js";\n';
    const closure = importClosure(join(DIST, "pagination.js"), reader(files));
    expect(closure.has(join(DIST, "chunk-S.js"))).toBe(true);
  });

  it("fails a strings entry without the directive", () => {
    const files = healthyDist();
    files["strings.js"] = files["strings.js"].replace('"use client";\n', "");
    const failures = checkClientBoundary(DIST, reader(files), () => [
      join(DIST, "spinner.js"),
    ]);
    expect(failures.join("\n")).toContain(
      'dist/strings.js does not start with "use client"'
    );
  });

  it("fails a directive-less entry that reaches the strings code", () => {
    const files = healthyDist();
    files["chunk-B.js"] =
      '// src/button.tsx\nimport { useStrings } from "./chunk-S.js";\n';
    const failures = checkClientBoundary(DIST, reader(files), () => [
      join(DIST, "pagination.js"),
      join(DIST, "spinner.js"),
    ]);
    expect(failures).toEqual([
      'pagination.js has no "use client" but reaches the strings code (chunk-S.js)',
    ]);
  });

  it("fails a directive-less entry that dynamically imports the strings chunk", () => {
    const files = healthyDist();
    files["card.js"] =
      'await import("./chunk-S.js");\nimport { cn } from "./chunk-U.js";\nexport function Card() {}\n';
    const failures = checkClientBoundary(DIST, reader(files), () => [
      join(DIST, "card.js"),
      join(DIST, "spinner.js"),
    ]);
    expect(failures).toEqual([
      'card.js has no "use client" but reaches the strings code (chunk-S.js)',
    ]);
  });

  it("passes the healthy shape", () => {
    expect(
      checkClientBoundary(DIST, reader(healthyDist()), () => [
        join(DIST, "pagination.js"),
        join(DIST, "spinner.js"),
        join(DIST, "modal.js"),
      ])
    ).toEqual([]);
  });
});

describe("B2 server render", () => {
  /** Payloads that satisfy every expectation. */
  function passing(): Record<string, { payload?: string; error?: string }> {
    const results: Record<string, { payload?: string; error?: string }> = {};
    for (const [name, { has }] of Object.entries(SERVER_EXPECTATIONS)) {
      results[name] = { payload: has.join("\n") };
    }
    results.functionUnderProvider = {
      error: "Functions cannot be passed directly to Client Components",
    };
    return results;
  }

  it("passes when every name is where it belongs", () => {
    expect(serverFailures(passing())).toEqual([]);
  });

  it("fails when an English name is missing", () => {
    const results = passing();
    results.spinner = { payload: '"aria-label":"Chargement"' };
    expect(serverFailures(results).join("\n")).toContain(
      'spinner: payload lacks "aria-label":"Loading"'
    );
  });

  it("fails when an entry does not render on the server", () => {
    const results = passing();
    results.pagination = { error: "createContext is not a function" };
    expect(serverFailures(results)).toContain(
      "pagination: did not render (createContext is not a function)"
    );
  });

  it("fails when a prop override loses to the English", () => {
    const results = passing();
    results.paginationOverride = {
      payload: `${results.paginationOverride.payload}\n"aria-label":"pagination"`,
    };
    expect(serverFailures(results).join("\n")).toContain(
      'paginationOverride: payload still has "aria-label":"pagination"'
    );
  });

  it("fails when a function-valued override crosses to the client", () => {
    const results = passing();
    results.functionUnderProvider = { payload: "" };
    expect(serverFailures(results).join("\n")).toContain(
      "function-valued override crossed"
    );
  });
});

describe("B3 and B4 render", () => {
  it("passes the provider's names", () => {
    expect(
      renderFailures("x", {
        closeName: CLOSE,
        footerName: FOOTER_CLOSE,
        footerText: FOOTER_CLOSE,
      })
    ).toEqual([]);
  });

  it("fails English, as two contexts would render it", () => {
    const failures = renderFailures("package", {
      closeName: "Close",
      footerName: "Close",
      footerText: "Close",
    });
    expect(failures).toHaveLength(2);
    expect(failures[0]).toContain('named "Close"');
  });

  it("fails a dialog that never opened", () => {
    expect(
      renderFailures("vendored", {
        closeName: null,
        footerName: null,
        footerText: null,
      })
    ).toHaveLength(2);
  });

  it("names exactly Modal, Button and the strings file for a modal-only install", () => {
    expect(MODAL_ONLY_UI_FILES).toEqual([
      "button.tsx",
      "modal.tsx",
      "strings.tsx",
    ]);
  });
});

/** A scratch directory per test, removed afterwards. */
const scratch: string[] = [];
function tempDir() {
  const dir = mkdtempSync(join(tmpdir(), "ks-strings-checks-"));
  scratch.push(dir);
  return dir;
}
afterEach(() => {
  for (const dir of scratch.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

/** Writes `files` (relative path -> mtime in seconds) under `dir`. */
function writeAt(dir: string, files: Record<string, number>) {
  for (const [path, seconds] of Object.entries(files)) {
    const full = join(dir, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, "x");
    utimesSync(full, seconds, seconds);
  }
}

describe("required output", () => {
  function builtPackage() {
    const dir = tempDir();
    writeAt(dir, {
      "dist/strings.js": 1,
      "dist/modal.js": 1,
      "dist/spinner.js": 1,
      "dist/pagination.js": 1,
    });
    return dir;
  }

  it("accepts a build with every entry the checks read", () => {
    expect(distProblem(builtPackage())).toBeNull();
  });

  it("refuses a missing build", () => {
    const dir = builtPackage();
    rmSync(join(dir, "dist"), { recursive: true });
    expect(distProblem(dir)).toContain("missing");
  });

  it("names an entry the build no longer emits", () => {
    const dir = builtPackage();
    rmSync(join(dir, "dist/spinner.js"));
    expect(distProblem(dir)).toBe("dist/spinner.js is missing");
  });
});

// Each case is one the second review ran against the built package.
describe("B1 import edges", () => {
  const edges = (source: string) =>
    relativeImports(join(DIST, "card.js"), source);

  it("follows a real dynamic import with a comment before the specifier", () => {
    expect(
      edges(
        'const { useStrings } = await import(/* webpackChunkName: "strings" */ "./strings.js");\n'
      )
    ).toEqual([join(DIST, "strings.js")]);
  });

  it("follows a dynamic import of a template literal with no substitutions", () => {
    expect(edges("await import(`./strings.js`);\n")).toEqual([
      join(DIST, "strings.js"),
    ]);
  });

  it("ignores import text inside a string", () => {
    expect(
      edges(
        "export const example = 'await import(\"./optional-widget.js\")';\n"
      )
    ).toEqual([]);
  });

  it("ignores import text inside a comment", () => {
    expect(
      edges(
        '// await import("./optional-widget.js")\n/* import { x } from "./other.js"; */\nexport const a = 1;\n'
      )
    ).toEqual([]);
  });

  it("follows a quoted import split across lines", () => {
    expect(
      edges(
        'const m = await import(\n  "./strings.js"\n);\nimport {\n  a,\n  b\n} from\n  "./chunk-U.js";\n'
      ).sort()
    ).toEqual([join(DIST, "chunk-U.js"), join(DIST, "strings.js")]);
  });

  it("skips a template literal with a substitution without throwing", () => {
    // The source holds a template with a real substitution: `./${name}.js`.
    const dollar = "$";
    const dynamic = `await import(\`./${dollar}{name}.js\`);\n`;
    expect(edges(`const name = 'x';\n${dynamic}`)).toEqual([]);
  });

  it("follows static imports, re-exports and bare imports, not packages", () => {
    expect(
      edges(
        'import "./side.js";\nimport { a } from "./a.js";\nexport { b } from "../b.js";\nexport * from "./c.js";\nimport React from "react";\n'
      ).sort()
    ).toEqual(
      [
        join(DIST, "../b.js"),
        join(DIST, "a.js"),
        join(DIST, "c.js"),
        join(DIST, "side.js"),
      ].sort()
    );
  });
});

describe("B3 file set", () => {
  it("lists files in nested directories by relative path", () => {
    const dir = tempDir();
    writeAt(dir, {
      "button.tsx": 1,
      "modal.tsx": 1,
      "strings.tsx": 1,
      "nested/extra.tsx": 1,
    });
    expect(filesIn(dir)).toEqual([
      "button.tsx",
      "modal.tsx",
      "nested/extra.tsx",
      "strings.tsx",
    ]);
  });

  it("lists exactly the three files of a clean modal-only install", () => {
    const dir = tempDir();
    writeAt(dir, { "button.tsx": 1, "modal.tsx": 1, "strings.tsx": 1 });
    expect(filesIn(dir)).toEqual(MODAL_ONLY_UI_FILES);
  });
});

describe("B2 imports", () => {
  it("imports Spinner, Pagination and Strings by their public subpaths", () => {
    const source = serverTreeModule("@keystoneui/react");
    for (const subpath of ["spinner", "pagination", "strings"]) {
      expect(source).toContain(
        `await import(${JSON.stringify(`@keystoneui/react/${subpath}`)})`
      );
    }
    expect(source).not.toContain("file:");
  });
});
