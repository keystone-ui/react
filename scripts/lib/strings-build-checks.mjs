/**
 * Build-backed checks for the strings provider, run by
 * scripts/smoke-install.mjs, which runs the clean package build
 * (`pnpm --filter @keystoneui/react build`) at its start for them.
 * Unit tests resolve components from source under jsdom, so none of these
 * can fail there:
 *
 * - B1: `dist/strings.js` keeps "use client", and no built entry without the
 *   directive reaches the strings code through its imports (static imports,
 *   re-exports and literal dynamic `import("./…")`, read with the TypeScript
 *   parser). In the built
 *   package a sibling's directive is lost when it is hoisted into a shared
 *   chunk, so an entry that renders from a Server Component must never import
 *   the provider's `createContext`.
 * - B2: the built Spinner and Pagination, which have no directive, imported
 *   by their public subpaths from the published-layout fixture B4 builds,
 *   render from a genuine Server Component (React Flight under the `react-server`
 *   condition, see ./rsc-render.mjs) with their English names and their prop
 *   overrides, alone and beneath a string-only StringsProvider.
 * - B3 (in smoke-install.mjs): a vendored install of only `modal` writes
 *   exactly modal.tsx, button.tsx and strings.tsx (recursively: nothing in a
 *   subdirectory either), and the installed Modal
 *   reads the installed provider (renderModalCheck below).
 * - B4: the same render against `@keystoneui/react/strings` and
 *   `@keystoneui/react/modal` as npm serves them: two entries, one context.
 */

import { execFile } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, sep } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const USE_CLIENT = /^\s*["']use client["']/;
/**
 * The TypeScript parser, from packages/ui: the root's TypeScript 7 ships no
 * JS API, and packages/ui aliases `typescript` to TypeScript 6, which does.
 */
const ts = createRequire(
  new URL("../../packages/ui/package.json", import.meta.url)
)("typescript");
const STRINGS_SOURCE_MARKER = "// src/strings.tsx";

export const CLOSE = "SENTINEL Fermer";
export const FOOTER_CLOSE = "SENTINEL Fermer le pied";

// ---------------------------------------------------------------------------
// Required output
// ---------------------------------------------------------------------------

/** Every file under `dir`, as paths relative to it (posix separators). */
function walk(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, base));
    } else if (entry.isFile()) {
      out.push(relative(base, full).split(sep).join("/"));
    }
  }
  return out;
}

/**
 * Why `dist` cannot be checked, or null: an entry the checks read is
 * missing. The smoke builds the package right before (a clean build), so a
 * missing entry means the build no longer emits it.
 */
export function distProblem(packageDir) {
  const distDir = join(packageDir, "dist");
  for (const name of ["strings", "modal", "spinner", "pagination"]) {
    if (!existsSync(join(distDir, `${name}.js`))) {
      return `dist/${name}.js is missing`;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// B1
// ---------------------------------------------------------------------------

/**
 * Relative imports of a built file, as absolute paths: static imports,
 * re-exports and dynamic `import()` of a literal (a string or a template with
 * no substitutions), read with a parser, so comments and strings that only
 * look like imports are not edges.
 */
export function relativeImports(file, source) {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.JS
  );
  const specifiers = [];
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return specifiers
    .filter((s) => s.startsWith("./") || s.startsWith("../"))
    .map((s) => join(dirname(file), s));
}

/** Every file reachable from `entry` through relative imports, entry included. */
export function importClosure(entry, read) {
  const seen = new Set();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file)) {
      continue;
    }
    seen.add(file);
    queue.push(...relativeImports(file, read(file)));
  }
  return seen;
}

/** Built entry files: every top-level .js plus hooks/index.js, chunks excluded. */
function builtEntries(distDir) {
  const top = readdirSync(distDir)
    .filter((f) => f.endsWith(".js") && !f.startsWith("chunk-"))
    .map((f) => join(distDir, f));
  const hooks = join(distDir, "hooks/index.js");
  return existsSync(hooks) ? [...top, hooks] : top;
}

/**
 * B1 on a dist directory. Returns failure messages (empty when it holds).
 * `read` and `entries` are injectable for tests.
 */
export function checkClientBoundary(
  distDir,
  read = (f) => readFileSync(f, "utf-8"),
  entries = () => builtEntries(distDir)
) {
  const failures = [];
  const stringsEntry = join(distDir, "strings.js");
  if (!USE_CLIENT.test(read(stringsEntry))) {
    failures.push('dist/strings.js does not start with "use client"');
  }
  const holdsStrings = (file) => read(file).includes(STRINGS_SOURCE_MARKER);
  const stringsFiles = [...importClosure(stringsEntry, read)].filter(
    holdsStrings
  );
  if (stringsFiles.length === 0) {
    failures.push(
      `no built file holds "${STRINGS_SOURCE_MARKER}": the check cannot find the strings code`
    );
  }
  const modalClosure = importClosure(join(distDir, "modal.js"), read);
  if (!stringsFiles.some((f) => modalClosure.has(f))) {
    failures.push(
      "dist/modal.js does not reach the strings code: the closure walk is not seeing imports"
    );
  }
  for (const entry of entries()) {
    if (USE_CLIENT.test(read(entry))) {
      continue;
    }
    const closure = importClosure(entry, read);
    const reached = stringsFiles.filter((f) => closure.has(f));
    if (reached.length > 0) {
      failures.push(
        `${relative(distDir, entry)} has no "use client" but reaches the strings code (${reached.map((f) => relative(distDir, f)).join(", ")})`
      );
    }
  }
  return failures;
}

// ---------------------------------------------------------------------------
// B2
// ---------------------------------------------------------------------------

/**
 * The Server Component trees B2 renders, with what each payload must and
 * must not contain. Each tree imports the package's public subpaths, so it
 * is written inside a published-layout fixture and resolved through the
 * `exports` map under the `react-server` condition, as a server bundler does.
 */
export function serverTreeModule(packageName = "@keystoneui/react") {
  const entry = (name) => JSON.stringify(`${packageName}/${name}`);
  return `export default async function trees({ createElement: h }) {
  const { Spinner } = await import(${entry("spinner")});
  const p = await import(${entry("pagination")});
  const { StringsProvider } = await import(${entry("strings")});
  const pagination = (props = {}) =>
    h(p.Pagination, props.root ?? null,
      h(p.PaginationContent, null,
        h(p.PaginationItem, null, h(p.PaginationFirst, { href: "#", ...props.first })),
        h(p.PaginationItem, null, h(p.PaginationPrevious, { href: "#", ...props.previous })),
        h(p.PaginationItem, null, h(p.PaginationEllipsis, { "aria-hidden": false })),
        h(p.PaginationItem, null, h(p.PaginationNext, { href: "#", ...props.next })),
        h(p.PaginationItem, null, h(p.PaginationLast, { href: "#", ...props.last }))));
  const overridden = {
    root: { "aria-label": "Pages" },
    first: { "aria-label": "Première page" },
    previous: { "aria-label": "Page précédente", text: "Précédent" },
    next: { "aria-label": "Page suivante", text: "Suivant" },
    last: { "aria-label": "Dernière page" },
  };
  const strings = { modal: { close: "Fermer", footerClose: "Fermer" } };
  const under = (child) => h(StringsProvider, { strings }, child);
  return {
    spinner: h(Spinner),
    spinnerOverride: h(Spinner, { "aria-label": "Chargement" }),
    spinnerUnderProvider: under(h(Spinner)),
    spinnerOverrideUnderProvider: under(h(Spinner, { "aria-label": "Chargement" })),
    pagination: pagination(),
    paginationOverride: pagination(overridden),
    paginationUnderProvider: under(pagination()),
    paginationOverrideUnderProvider: under(pagination(overridden)),
    functionUnderProvider: h(StringsProvider, { strings: { modal: { close: () => "x" } } }, h(Spinner)),
  };
}
`;
}

const ENGLISH_SPINNER = ['"aria-label":"Loading"'];
const ENGLISH_PAGINATION = [
  '"aria-label":"pagination"',
  '"aria-label":"Go to first page"',
  '"aria-label":"Go to previous page"',
  '"aria-label":"Go to next page"',
  '"aria-label":"Go to last page"',
  '"Previous"',
  '"Next"',
  '"More pages"',
];
const OVERRIDDEN_SPINNER = ['"aria-label":"Chargement"'];
const OVERRIDDEN_PAGINATION = [
  '"aria-label":"Pages"',
  '"aria-label":"Première page"',
  '"aria-label":"Page précédente"',
  '"aria-label":"Page suivante"',
  '"aria-label":"Dernière page"',
  '"Précédent"',
  '"Suivant"',
];
const PROVIDER = [
  '"strings":{"modal":{"close":"Fermer","footerClose":"Fermer"}}',
];

/** What each B2 payload must and must not contain. */
export const SERVER_EXPECTATIONS = {
  spinner: { has: ENGLISH_SPINNER, lacks: OVERRIDDEN_SPINNER },
  spinnerOverride: { has: OVERRIDDEN_SPINNER, lacks: ENGLISH_SPINNER },
  spinnerUnderProvider: { has: [...ENGLISH_SPINNER, ...PROVIDER], lacks: [] },
  spinnerOverrideUnderProvider: {
    has: [...OVERRIDDEN_SPINNER, ...PROVIDER],
    lacks: ENGLISH_SPINNER,
  },
  pagination: { has: ENGLISH_PAGINATION, lacks: OVERRIDDEN_PAGINATION },
  paginationOverride: {
    has: [...OVERRIDDEN_PAGINATION, '"More pages"'],
    lacks: ENGLISH_PAGINATION.filter((s) => s !== '"More pages"'),
  },
  paginationUnderProvider: {
    has: [...ENGLISH_PAGINATION, ...PROVIDER],
    lacks: [],
  },
  paginationOverrideUnderProvider: {
    has: [...OVERRIDDEN_PAGINATION, ...PROVIDER],
    lacks: ENGLISH_PAGINATION.filter((s) => s !== '"More pages"'),
  },
};

/** Failure messages for B2's rendered results. */
export function serverFailures(results) {
  const failures = [];
  for (const [name, { has, lacks }] of Object.entries(SERVER_EXPECTATIONS)) {
    const result = results[name];
    if (!result || result.error) {
      failures.push(
        `${name}: did not render (${result?.error ?? "no result"})`
      );
      continue;
    }
    for (const text of has) {
      if (!result.payload.includes(text)) {
        failures.push(`${name}: payload lacks ${text}`);
      }
    }
    for (const text of lacks) {
      if (result.payload.includes(text)) {
        failures.push(`${name}: payload still has ${text}`);
      }
    }
  }
  // A dictionary that holds functions cannot cross from a Server Component.
  const fn = results.functionUnderProvider;
  if (!fn?.error) {
    failures.push(
      "functionUnderProvider: a function-valued override crossed into the client provider"
    );
  }
  return failures;
}

/**
 * B2. `fixtureDir` has `@keystoneui/react` installed as npm serves it (the
 * B4 fixture): the tree is written there so its imports resolve from it.
 */
export async function checkServerRender({ root, fixtureDir }) {
  const tree = join(fixtureDir, "server-trees.mjs");
  writeFileSync(tree, serverTreeModule());
  const { stdout } = await run(
    "node",
    [
      "--conditions=react-server",
      join(root, "scripts/lib/rsc-render.mjs"),
      tree,
    ],
    {
      cwd: root,
      env: { ...process.env, NODE_ENV: "production" },
      maxBuffer: 64 * 1024 * 1024,
    }
  );
  return serverFailures(JSON.parse(stdout));
}

// ---------------------------------------------------------------------------
// B3 and B4: render the Modal under the provider in a DOM
// ---------------------------------------------------------------------------

/** Absolute paths the render harness loads from this workspace. */
export function harnessPaths(root) {
  const ui = createRequire(join(root, "packages/ui/package.json"));
  const rtl = createRequire(ui.resolve("@testing-library/react"));
  const dom = createRequire(rtl.resolve("@testing-library/dom"));
  return {
    jsdom: ui.resolve("jsdom"),
    accessibleName: dom.resolve("dom-accessibility-api"),
  };
}

/**
 * A module that installs a jsdom document as the global DOM. It is preloaded
 * with `node --import`, because React DOM and Base UI decide at module load
 * whether a DOM exists, before any line of the check runs.
 */
export function domSetup(paths) {
  return `import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { JSDOM } = require(${JSON.stringify(paths.jsdom)});
const dom = new JSDOM("<!doctype html><html><body><div id=root></div></body></html>", { pretendToBeVisual: true });
for (const key of Object.getOwnPropertyNames(dom.window)) {
  if (!(key in globalThis)) {
    try { globalThis[key] = dom.window[key]; } catch {}
  }
}
for (const key of ["window", "document", "navigator"]) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true });
}
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
globalThis.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
`;
}

/**
 * The body of a render check: \`imports\` binds StringsProvider, Modal,
 * ModalContent, ModalTitle and ModalFooter; the rest renders the Modal open
 * under a provider and prints JSON { closeName, footerName, footerText }.
 * React and react-dom come from the fixture, as the components' own do. Run
 * it with runHarness, which preloads domSetup.
 */
export function renderHarness({ imports, paths }) {
  return `${imports}
import { createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { computeAccessibleName } = require(${JSON.stringify(paths.accessibleName)});

const strings = { modal: { close: ${JSON.stringify(CLOSE)}, footerClose: ${JSON.stringify(FOOTER_CLOSE)} } };
createRoot(document.getElementById("root")).render(
  h(StringsProvider, { strings },
    h(Modal, { defaultOpen: true },
      h(ModalContent, null,
        h(ModalTitle, null, "Title"),
        h(ModalFooter, { showCloseButton: true }))))
);

const deadline = Date.now() + 5000;
let close = null;
while (Date.now() < deadline) {
  close = document.querySelector('[data-slot="modal-content"] > [data-slot="modal-close"]');
  if (close) break;
  await new Promise((r) => setTimeout(r, 20));
}
const footer = document.querySelector('[data-slot="modal-footer"] > button');
process.stdout.write(JSON.stringify({
  closeName: close ? computeAccessibleName(close) : null,
  footerName: footer ? computeAccessibleName(footer) : null,
  footerText: footer ? footer.textContent : null,
}));
process.exit(0);
`;
}

/** Failure messages for a render check's printed result. */
export function renderFailures(label, result) {
  const failures = [];
  if (result.closeName !== CLOSE) {
    failures.push(
      `${label}: the corner close is named ${JSON.stringify(result.closeName)}, not the provider's ${JSON.stringify(CLOSE)}`
    );
  }
  if (
    result.footerName !== FOOTER_CLOSE ||
    result.footerText !== FOOTER_CLOSE
  ) {
    failures.push(
      `${label}: the footer close reads ${JSON.stringify(result.footerText)} (name ${JSON.stringify(result.footerName)}), not the provider's ${JSON.stringify(FOOTER_CLOSE)}`
    );
  }
  return failures;
}

/**
 * Runs a harness file with node from its own directory, the DOM preloaded;
 * parsed output.
 */
export async function runHarness(file, paths) {
  const setup = join(dirname(file), "strings-dom-setup.mjs");
  writeFileSync(setup, domSetup(paths));
  const { stdout } = await run("node", ["--import", setup, file], {
    cwd: dirname(file),
    env: { ...process.env, NODE_ENV: "production" },
    maxBuffer: 16 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

/**
 * Every file under `dir`, nested ones included, as sorted relative paths: a
 * file the installer wrote into a subdirectory must not escape B3.
 */
export function filesIn(dir) {
  return existsSync(dir) ? walk(dir).sort() : [];
}

/** B3's file-set rule: the vendored Modal install writes exactly these. */
export const MODAL_ONLY_UI_FILES = ["button.tsx", "modal.tsx", "strings.tsx"];

/**
 * Bundles a TSX harness in a vendored fixture with esbuild (the `@/` alias
 * from the fixture's tsconfig, npm packages left to Node), next to itself.
 */
export async function bundleHarness({ root, entry, outfile }) {
  const esbuild = createRequire(
    createRequire(join(root, "packages/ui/package.json")).resolve("tsup")
  )("esbuild");
  await esbuild.build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    jsx: "automatic",
    logLevel: "silent",
    absWorkingDir: dirname(entry),
    plugins: [
      {
        name: "npm-external",
        setup(build) {
          build.onResolve({ filter: /^[^./@]|^@[^/]+\/[^/]/ }, (args) =>
            args.path.startsWith("@/")
              ? undefined
              : { path: args.path, external: true }
          );
        },
      },
    ],
  });
}
