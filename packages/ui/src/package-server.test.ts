// @vitest-environment node

/**
 * Pagination and Spinner render from a Server Component when installed from
 * npm, where `publishConfig.exports` points each subpath at the tsup build.
 *
 * The build moves a module that more than one entry imports into a shared
 * `chunk-*.js`, and esbuild (0.27, under tsup 8.5) keeps a module's
 * "use client" directive only on the entry file built from it, never on a
 * chunk. So `dist/pagination.js`
 * (no directive) imports Button's code from a chunk without the directive,
 * and under a React Server Components bundler that code runs on the server:
 * `buttonVariants` and the `Button` wrapper are ordinary server functions.
 * That is safe only because the wrapper calls no hook. The client boundary
 * is the "use client" in Base UI's own `@base-ui/react/button` module, which
 * a Next build turns into a client reference (checked with `next build` on
 * an app installing the packed package and `@keystoneui/react@beta`).
 *
 * This test pins that property on a real build. It runs tsup with the
 * package's own config (without declarations) into a temporary directory,
 * then:
 *
 * - walks every entry without the directive through the chunks it imports
 *   and fails if any of that code imports a React API that does not exist
 *   under the `react-server` condition (`useState`, `useEffect`,
 *   `createContext`, ...);
 * - renders Pagination (with and without `href`) and Spinner from the built
 *   files to a React Flight payload with `scripts/lib/rsc-render.mjs`, in a
 *   child process under the `react-server` condition, where every module
 *   whose source starts with "use client" is a client reference. A page
 *   control without `href` must reach the client only through Base UI's
 *   Button, never through a file of the build. (Lucide's icon component is
 *   a "use client" module too, so icons are client references as well.)
 *
 * `pagination-server.test.ts` covers the registry's one-file-per-component
 * layout.
 */

import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const SRC_DIR = import.meta.dirname;
const PACKAGE_DIR = join(SRC_DIR, "..");
const ROOT = join(PACKAGE_DIR, "../..");

const TSUP_BIN = join(
  dirname(
    createRequire(join(PACKAGE_DIR, "package.json")).resolve(
      "tsup/package.json"
    )
  ),
  "dist/cli-default.js"
);

/** React exports the `react-server` build of React does not have. */
const CLIENT_ONLY_REACT = new Set([
  "Component",
  "PureComponent",
  "createContext",
  "useActionState",
  "useContext",
  "useDeferredValue",
  "useEffect",
  "useEffectEvent",
  "useFormStatus",
  "useImperativeHandle",
  "useInsertionEffect",
  "useLayoutEffect",
  "useOptimistic",
  "useReducer",
  "useRef",
  "useState",
  "useSyncExternalStore",
  "useTransition",
]);

const PROLOGUE_ITEM =
  /^(?:\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/|(["'])([^"'\n]*)\1\s*;?)/;

/** Whether the module's directive prologue holds "use client". */
function isClientModule(source: string): boolean {
  let rest = source;
  for (;;) {
    const match = PROLOGUE_ITEM.exec(rest);
    if (!match || match[0].length === 0) {
      return false;
    }
    if (match[2] === "use client") {
      return true;
    }
    rest = rest.slice(match[0].length);
  }
}

const RELATIVE_IMPORT = /(?:from|import)\s*"(\.\/[^"]+)"/g;
const REACT_NAMED_IMPORT =
  /import\s+(?:\w+\s*,\s*)?\{([^}]*)\}\s*from\s*"react"/g;
const REACT_NAMESPACE_IMPORT =
  /import\s+(?:\*\s+as\s+|)(\w+)\s*(?:,\s*\{[^}]*\})?\s*from\s*"react"/g;
const IMPORT_ALIAS = /\s+as\s+\w+$/;

/** The React APIs a built module imports by name or reads off a namespace. */
function reactApis(source: string): string[] {
  const names: string[] = [];
  for (const [, list] of source.matchAll(REACT_NAMED_IMPORT)) {
    for (const part of list.split(",")) {
      const name = part.trim().replace(IMPORT_ALIAS, "");
      if (name) {
        names.push(name);
      }
    }
  }
  for (const [, namespace] of source.matchAll(REACT_NAMESPACE_IMPORT)) {
    for (const [, name] of source.matchAll(
      new RegExp(`\\b${namespace}\\.(\\w+)`, "g")
    )) {
      names.push(name);
    }
  }
  return names;
}

/** Each built file an entry reaches through relative imports, itself first. */
function reachable(buildDir: string, entry: string): string[] {
  const seen = new Set([entry]);
  const queue = [entry];
  for (let file = queue.shift(); file; file = queue.shift()) {
    const source = readFileSync(join(buildDir, file), "utf-8");
    for (const [, specifier] of source.matchAll(RELATIVE_IMPORT)) {
      const next = specifier.slice(2);
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return [...seen];
}

const TREES = `
export default async function trees({ createElement: h }) {
  const p = await import("./dist/pagination.js");
  const { Spinner } = await import("./dist/spinner.js");
  const { Button } = await import("./dist/button.js");
  const wrap = (...children) =>
    h(p.Pagination, null, h(p.PaginationContent, null,
      ...children.map((child, i) => h(p.PaginationItem, { key: i }, child))));
  return {
    spinner: h(Spinner),
    hrefPage: wrap(
      h(p.PaginationFirst, { href: "?page=1" }),
      h(p.PaginationPrevious, { href: "?page=1" }),
      h(p.PaginationLink, { href: "?page=1" }, "1"),
      h(p.PaginationLink, { href: "?page=2", isActive: true }, "2"),
      h(p.PaginationEllipsis),
      h(p.PaginationNext, { href: "?page=3" }),
      h(p.PaginationLast, { href: "?page=9" })
    ),
    noHrefLink: wrap(h(p.PaginationLink, { "aria-disabled": "true" }, "7")),
    noHrefPrevious: wrap(h(p.PaginationPrevious, { disabled: true })),
    noHrefActive: wrap(h(p.PaginationLink, { isActive: true }, "3")),
    clientEntry: h(Button, null, "Save"),
  };
}
`;

const HREF_TREES = ["spinner", "hrefPage"] as const;
const NO_HREF_TREES = ["noHrefLink", "noHrefPrevious", "noHrefActive"] as const;
const CLIENT_ID = /"(file:[^"]+)"/g;
const BASE_UI_BUTTON = /\/@base-ui\/react\/button\/Button\.mjs$/;
const DEPENDENCY = /\/node_modules\//;

type Results = Partial<Record<string, { error?: string; payload?: string }>>;

let dir = "";
let outDir = "";
let build: ReturnType<typeof spawnSync> | undefined;
let results: Results = {};
let renderStderr = "";

beforeAll(() => {
  // Real path: the render reports module URLs with symlinks resolved
  // (macOS's /var is /private/var), and the test compares against them.
  dir = realpathSync(mkdtempSync(join(tmpdir(), "ks-package-rsc-")));
  outDir = join(dir, "dist");
  // The built files import react, lucide-react and Base UI by bare name.
  symlinkSync(join(PACKAGE_DIR, "node_modules"), join(dir, "node_modules"));
  build = spawnSync(
    process.execPath,
    [TSUP_BIN, "--out-dir", outDir, "--no-dts", "--silent"],
    { cwd: PACKAGE_DIR, encoding: "utf-8" }
  );
  if (build.status !== 0) {
    return;
  }
  writeFileSync(join(dir, "trees.mjs"), TREES);
  const run = spawnSync(
    process.execPath,
    [
      "--conditions=react-server",
      join(ROOT, "scripts/lib/rsc-render.mjs"),
      join(dir, "trees.mjs"),
    ],
    {
      cwd: ROOT,
      encoding: "utf-8",
      env: { ...process.env, NODE_ENV: "production" },
      maxBuffer: 16 * 1024 * 1024,
    }
  );
  renderStderr = run.stderr;
  results = JSON.parse(run.stdout || "{}") as Results;
}, 120_000);

afterAll(() => {
  if (dir) {
    rmSync(dir, { force: true, recursive: true });
  }
});

/** The client module ids a Flight payload references. */
function clientModules(payload: string | undefined): string[] {
  return [
    ...new Set([...(payload ?? "").matchAll(CLIENT_ID)].map(([, id]) => id)),
  ];
}

describe("the npm build", () => {
  it("builds", () => {
    expect(build?.stderr).toBe("");
    expect(build?.status).toBe(0);
  });

  it("ships Pagination and Spinner as entries without the directive", () => {
    for (const entry of ["pagination.js", "spinner.js"]) {
      expect(
        isClientModule(readFileSync(join(outDir, entry), "utf-8")),
        entry
      ).toBe(false);
    }
  });

  it("reaches no client-only React API from an entry without the directive", () => {
    const entries = readdirSync(outDir).filter(
      (file) => file.endsWith(".js") && !file.startsWith("chunk-")
    );
    const serverEntries = entries.filter(
      (entry) => !isClientModule(readFileSync(join(outDir, entry), "utf-8"))
    );
    expect(serverEntries).toEqual(
      expect.arrayContaining(["pagination.js", "spinner.js"])
    );
    const found: string[] = [];
    for (const entry of serverEntries) {
      for (const file of reachable(outDir, entry)) {
        const source = readFileSync(join(outDir, file), "utf-8");
        for (const api of reactApis(source)) {
          if (CLIENT_ONLY_REACT.has(api)) {
            found.push(`${entry} -> ${file}: ${api}`);
          }
        }
      }
    }
    expect(found).toEqual([]);
  });
});

describe("rendering the npm build from a Server Component", () => {
  it("renders every tree", () => {
    expect(renderStderr).toBe("");
    for (const name of [...HREF_TREES, ...NO_HREF_TREES, "clientEntry"]) {
      expect(results[name]?.error, name).toBeUndefined();
      expect(results[name]?.payload, name).toBeTruthy();
    }
  });

  it("renders Spinner and the links with a URL on the server", () => {
    // Lucide's icon is a "use client" module of its own, so these trees may
    // hold client references, but only to a dependency's module.
    const built = pathToFileURL(outDir).href;
    for (const name of HREF_TREES) {
      for (const id of clientModules(results[name]?.payload)) {
        expect(id.startsWith(built), `${name}: ${id}`).toBe(false);
        expect(id, name).toMatch(DEPENDENCY);
      }
    }
    const payload = results.hrefPage?.payload ?? "";
    for (const href of ["?page=1", "?page=2", "?page=3", "?page=9"]) {
      expect(payload).toContain(`"href":"${href}"`);
    }
    expect(results.spinner?.payload).toContain('"data-slot":"spinner"');
  });

  it("reaches the client without a URL only through Base UI's Button", () => {
    const built = pathToFileURL(outDir).href;
    for (const name of NO_HREF_TREES) {
      const ids = clientModules(results[name]?.payload);
      expect(
        ids.filter((id) => BASE_UI_BUTTON.test(id)),
        name
      ).toHaveLength(1);
      for (const id of ids) {
        expect(id.startsWith(built), `${name}: ${id}`).toBe(false);
        expect(id, name).toMatch(DEPENDENCY);
      }
    }
  });

  it("would name a built file if one were the boundary", () => {
    // Button's own entry keeps the directive, so rendering it gives a client
    // reference to that built file: the check above can see one.
    const built = pathToFileURL(outDir).href;
    expect(clientModules(results.clientEntry?.payload)).toEqual([
      `${built}/button.js`,
    ]);
  });
});
