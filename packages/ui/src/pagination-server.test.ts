// @vitest-environment node

/**
 * Pagination renders from a Server Component in the vendored layout.
 *
 * `npx shadcn add` copies each component as its own file, each keeping its
 * own directive: `pagination.tsx` has none, `button.tsx` is "use client". A
 * Server Component that renders a page link must therefore not run any code
 * from `button.tsx`: under a React Server Components bundler, everything a
 * "use client" module exports is only a reference on the server, and calling
 * one throws. Rendering `Button` (a component) is fine; calling a function
 * such as `buttonVariants` is not.
 *
 * This test builds that layout without a package build: it transforms
 * `pagination.tsx`, `button.tsx` and `utils.ts` one file each (as the
 * registry ships them) into a temporary directory, then renders thirty trees
 * to a React Flight payload with `scripts/lib/rsc-render.mjs`, in a child
 * process under the `react-server` condition. That script swaps every
 * "use client" module for client references whose call throws
 * "client code ran on the server".
 *
 * Each payload is then decoded as a client would: in a second child process,
 * without the `react-server` condition, by the Node build of the Flight
 * client the same Next vendors, with the transformed `button.mjs` as the
 * client module, and rendered to HTML with `react-dom/server`. Flight does
 * not carry every prop as it was: a key whose value is `undefined` is
 * dropped on the way, so a tree can render on the server and still fail on
 * the client.
 *
 * Both processes run with `NODE_ENV=production`, so the trees built from
 * the ordinary copy do not log the development error for an HTML label
 * without a URL (`pagination.test.tsx` checks it), and a function `render` is not sent: Flight does not
 * serialize a function from the server.
 *
 * Six of the trees use `pagination.tsx` transformed to CommonJS and
 * evaluated with `node:vm` where there is no global `process`: as is, and
 * with the literal `process.env.NODE_ENV` replaced by "development" and by
 * "production". Their development error goes to a log file, not stderr.
 *
 * It does not cover Next's own bundler, a browser, Flight's development
 * build, or an npm install (whose build puts Button's code in a chunk
 * without the directive).
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const SRC_DIR = import.meta.dirname;
const PACKAGE_DIR = join(SRC_DIR, "..");
const ROOT = join(PACKAGE_DIR, "../..");

const esbuild = createRequire(
  createRequire(join(PACKAGE_DIR, "package.json")).resolve("tsup")
)("esbuild") as typeof import("esbuild");

const FILES = {
  "pagination.mjs": "pagination.tsx",
  "button.mjs": "button.tsx",
  "utils.mjs": "utils.ts",
};

const TREES = `
export default async function trees({ createElement: h }) {
  const p = await import("./pagination.mjs");
  const html = { __html: "<b>4</b>" };
  const wrap = (child) =>
    h(p.Pagination, null, h(p.PaginationContent, null, h(p.PaginationItem, null, child)));
  return {
    linkHref: wrap(h(p.PaginationLink, { href: "?page=2" }, "2")),
    linkHrefActive: wrap(h(p.PaginationLink, { href: "?page=3", isActive: true }, "3")),
    previousHref: wrap(h(p.PaginationPrevious, { href: "?page=1" })),
    nextHref: wrap(h(p.PaginationNext, { href: "?page=3" })),
    firstHref: wrap(h(p.PaginationFirst, { href: "?page=1" })),
    lastHref: wrap(h(p.PaginationLast, { href: "?page=9" })),
    linkNoHref: wrap(h(p.PaginationLink, null, "4")),
    previousNoHref: wrap(h(p.PaginationPrevious, null)),
    // An HTML label without a URL, each beside its twin without it.
    linkNoHrefHtml: wrap(h(p.PaginationLink, { dangerouslySetInnerHTML: html })),
    linkNoHrefHtmlTwin: wrap(h(p.PaginationLink, null)),
    linkNoHrefHtmlChildren: wrap(h(p.PaginationLink, { dangerouslySetInnerHTML: html }, "4")),
    linkNoHrefHtmlChildrenTwin: wrap(h(p.PaginationLink, null, "4")),
    linkNoHrefHtmlRenderUndefined: wrap(h(p.PaginationLink, { className: "page", render: undefined, dangerouslySetInnerHTML: html })),
    linkNoHrefHtmlRenderUndefinedTwin: wrap(h(p.PaginationLink, { className: "page", render: undefined })),
    linkNoHrefHtmlRenderElement: wrap(h(p.PaginationLink, { className: "page", render: h("button", { type: "button", "data-consumer": "element" }), dangerouslySetInnerHTML: html })),
    linkNoHrefHtmlRenderElementTwin: wrap(h(p.PaginationLink, { className: "page", render: h("button", { type: "button", "data-consumer": "element" }) })),
    linkNoHrefHtmlSpan: wrap(h(p.PaginationLink, { render: h("span"), nativeButton: false, disabled: true, dangerouslySetInnerHTML: html }, "17")),
    linkNoHrefHtmlSpanTwin: wrap(h(p.PaginationLink, { render: h("span"), nativeButton: false, disabled: true }, "17")),
    linkNoHrefHtmlNotNative: wrap(h(p.PaginationLink, { nativeButton: false, dangerouslySetInnerHTML: html }, "5")),
    linkNoHrefHtmlNotNativeTwin: wrap(h(p.PaginationLink, { nativeButton: false }, "5")),
    linkNoHrefHtmlDisabled: wrap(h(p.PaginationLink, { disabled: true, dangerouslySetInnerHTML: html }, "6")),
    linkNoHrefHtmlDisabledTwin: wrap(h(p.PaginationLink, { disabled: true }, "6")),
    linkNoHrefHtmlFocusable: wrap(h(p.PaginationLink, { disabled: true, focusableWhenDisabled: true, dangerouslySetInnerHTML: html }, "7")),
    linkNoHrefHtmlFocusableTwin: wrap(h(p.PaginationLink, { disabled: true, focusableWhenDisabled: true }, "7")),
    ...(await isolatedTrees(h, wrap, html)),
  };
}

// The same HTML label and twin from \`pagination.tsx\` evaluated where there is
// no global \`process\` (see isolated.mjs): without a replacement, and with the
// literal replaced by "development" and by "production".
async function isolatedTrees(h, wrap, html) {
  const { isolate } = await import("./isolated.mjs");
  const out = {};
  for (const [mode, name] of [["none", "None"], ["development", "Development"], ["production", "Production"]]) {
    const tree = \`isolated\${name}\`;
    const twin = \`\${tree}Twin\`;
    out[tree] = wrap(h(isolate(mode, tree).PaginationLink, { dangerouslySetInnerHTML: html }, "4"));
    out[twin] = wrap(h(isolate(mode, twin).PaginationLink, null, "4"));
  }
  return out;
}
`;

/**
 * Evaluates \`pagination-<mode>.cjs\` (pagination.tsx as CommonJS) with
 * \`node:vm\` in a context with no \`process\` and a \`console\` that appends to
 * \`<treeName>.log\`, so reading \`process\` there throws a
 * \`ReferenceError\`. Its imports are the copies beside it, so under the
 * \`react-server\` condition \`./button\` is the client reference.
 */
const ISOLATED = `
import { appendFileSync, readFileSync } from "node:fs";
import { format } from "node:util";
import { createContext, runInContext } from "node:vm";
import * as cva from "class-variance-authority";
import * as lucide from "lucide-react";
import * as jsx from "react/jsx-runtime";
import * as button from "./button.mjs";
import * as utils from "./utils.mjs";

const deps = {
  "./button": button,
  "./utils": utils,
  "class-variance-authority": cva,
  "lucide-react": lucide,
  "react/jsx-runtime": jsx,
};

export function isolate(mode, treeName) {
  const code = readFileSync(new URL(\`./pagination-\${mode}.cjs\`, import.meta.url), "utf-8");
  const log = new URL(\`./\${treeName}.log\`, import.meta.url);
  const context = createContext({
    console: { error: (...args) => appendFileSync(log, format(...args) + "\\n") },
  });
  const module = { exports: {} };
  runInContext(\`(function (require, module, exports) {\${code}\\n})\`, context)(
    (id) => {
      if (!(id in deps)) throw new Error(\`unexpected import \${id}\`);
      return deps[id];
    },
    module,
    module.exports
  );
  return module.exports;
}
`;

/**
 * Decodes each payload in results.json (argv[3]) as the client does and
 * renders it to HTML. Client modules are loaded from the payload's own
 * `file://` ids, so the real transformed Button runs.
 */
const DECODE = `
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";

const [, , root, resultsPath] = process.argv;
const docsRequire = createRequire(join(root, "apps/docs/package.json"));
const nextDir = dirname(docsRequire.resolve("next/package.json"));
const require = createRequire(import.meta.url);
const { createFromNodeStream } = require(
  join(nextDir, "dist/compiled/react-server-dom-webpack/client.node.js")
);
const { renderToReadableStream } = require("react-dom/server");

const modules = new Map();
globalThis.__webpack_require__ = (id) => modules.get(id);
globalThis.__webpack_chunk_load__ = () => Promise.resolve();
globalThis.__next_require__ = globalThis.__webpack_require__;
globalThis.__next_chunk_load__ = globalThis.__webpack_chunk_load__;
const manifest = {
  moduleLoading: null,
  serverModuleMap: null,
  moduleMap: new Proxy({}, {
    get: (_, id) => new Proxy({}, { get: (_, name) => ({ id, chunks: [], name }) }),
  }),
};

const errors = [];
console.error = (...args) => errors.push(args.map(String).join(" "));

const out = {};
for (const [name, { payload }] of Object.entries(
  JSON.parse(readFileSync(resultsPath, "utf-8"))
)) {
  const before = errors.length;
  try {
    for (const [, id] of payload.matchAll(/"(file:[^"]+)"/g)) {
      if (!modules.has(id)) modules.set(id, await import(id));
    }
    const tree = await createFromNodeStream(Readable.from([Buffer.from(payload)]), manifest);
    const stream = await renderToReadableStream(tree, {
      onError: (error) => { errors.push(String(error)); },
    });
    await stream.allReady;
    out[name] = { html: await new Response(stream).text() };
  } catch (error) {
    errors.push(String(error));
  }
  out[name] = { ...out[name], errors: errors.slice(before) };
}
process.stdout.write(JSON.stringify(out));
`;

const NAV_ROOT = /^<nav /;
const CALLER_CLASS = /^<button\s(?:[^>]*\s)?class="(?:[^"]* )?page[ "]/;
const LIST_ITEM = /<li [^>]*>([\s\S]*)<\/li>/;
const CONTROL_TAG = /<(?:a|button)[\s>]/g;
const CHILDREN_LABEL_BUTTON =
  /^<button [^>]*data-slot="pagination-link"[^>]*>4<\/button>$/;
const EMPTY_BUTTON =
  /^<button [^>]*data-slot="pagination-link"[^>]*><\/button>$/;
const DISABLED_SPAN =
  /^<span [^>]*aria-disabled="true"[^>]*data-slot="pagination-link"[^>]*>17<\/span>$/;
const PROPS_NOT_IN_DOM =
  /dangerouslysetinnerhtml|nativebutton|focusablewhendisabled|\srender=/i;

/** Each HTML-label tree without a URL, its twin, and what that twin is. */
const HTML_LABEL_TWINS: Record<string, RegExp> = {
  linkNoHrefHtml: EMPTY_BUTTON,
  linkNoHrefHtmlChildren: CHILDREN_LABEL_BUTTON,
  linkNoHrefHtmlRenderUndefined: CALLER_CLASS,
  linkNoHrefHtmlRenderElement: /data-consumer="element"/,
  linkNoHrefHtmlSpan: DISABLED_SPAN,
  linkNoHrefHtmlNotNative: /^<button [^>]*role="button"[^>]*>5<\/button>$/,
  linkNoHrefHtmlDisabled: /^<button [^>]*\sdisabled=""[^>]*>6<\/button>$/,
  linkNoHrefHtmlFocusable:
    /^<button (?![^>]*\sdisabled="")[^>]*aria-disabled="true"[^>]*>7<\/button>$/,
};

/** The content of the one `li` in a decoded tree's HTML. */
function listItem(html: string | undefined): string {
  return LIST_ITEM.exec(html ?? "")?.[1] ?? "";
}

type Results = Record<string, { error?: string; payload?: string }>;
type Decoded = Record<string, { errors: string[]; html?: string }>;

let dir = "";
let results: Results = {};
let stderr = "";
let decoded: Decoded = {};
let decodeStderr = "";
const ISOLATED_MODES = ["none", "development", "production"] as const;
const ISOLATED_TREES = [
  "isolatedNone",
  "isolatedNoneTwin",
  "isolatedDevelopment",
  "isolatedDevelopmentTwin",
  "isolatedProduction",
  "isolatedProductionTwin",
] as const;
const isolatedCode: Record<string, string> = {};
const isolatedLogs: Record<string, string> = {};

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "ks-pagination-rsc-"));
  // The copies import react, lucide-react and Base UI by bare name.
  symlinkSync(join(PACKAGE_DIR, "node_modules"), join(dir, "node_modules"));
  for (const [out, source] of Object.entries(FILES)) {
    const { code } = esbuild.transformSync(
      readFileSync(join(SRC_DIR, source), "utf-8"),
      {
        format: "esm",
        jsx: "automatic",
        loader: source.endsWith(".tsx") ? "tsx" : "ts",
        target: "es2022",
      }
    );
    writeFileSync(
      join(dir, out),
      code.replace(/from "\.\/(button|utils)"/g, 'from "./$1.mjs"')
    );
  }
  const pagination = readFileSync(join(SRC_DIR, "pagination.tsx"), "utf-8");
  for (const mode of ISOLATED_MODES) {
    const { code } = esbuild.transformSync(pagination, {
      format: "cjs",
      jsx: "automatic",
      loader: "tsx",
      target: "es2022",
      ...(mode !== "none" && {
        define: { "process.env.NODE_ENV": JSON.stringify(mode) },
      }),
    });
    isolatedCode[mode] = code;
    writeFileSync(join(dir, `pagination-${mode}.cjs`), code);
  }
  writeFileSync(join(dir, "isolated.mjs"), ISOLATED);
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
  stderr = run.stderr;
  results = JSON.parse(run.stdout || "{}") as Results;

  writeFileSync(join(dir, "results.json"), JSON.stringify(results));
  writeFileSync(join(dir, "decode.mjs"), DECODE);
  const decode = spawnSync(
    process.execPath,
    [join(dir, "decode.mjs"), ROOT, join(dir, "results.json")],
    {
      cwd: ROOT,
      encoding: "utf-8",
      env: { ...process.env, NODE_ENV: "production" },
      maxBuffer: 16 * 1024 * 1024,
    }
  );
  decodeStderr = decode.stderr;
  decoded = JSON.parse(decode.stdout || "{}") as Decoded;
  for (const treeName of ISOLATED_TREES) {
    const log = join(dir, `${treeName}.log`);
    isolatedLogs[treeName] = existsSync(log) ? readFileSync(log, "utf-8") : "";
  }
}, 60_000);

afterAll(() => {
  if (dir) {
    rmSync(dir, { force: true, recursive: true });
  }
});

/** Each URL tree and the `href` its page control carries. */
const HREF_TREES: Record<string, string> = {
  linkHref: "?page=2",
  linkHrefActive: "?page=3",
  previousHref: "?page=1",
  nextHref: "?page=3",
  firstHref: "?page=1",
  lastHref: "?page=9",
};

/** A React element in a Flight payload: `["$", type, key, props]`. */
type FlightElement = ["$", string, unknown, Record<string, unknown>];

const isElement = (value: unknown): value is FlightElement =>
  Array.isArray(value) && value[0] === "$" && typeof value[1] === "string";

/**
 * The rows of a Flight payload by id. A row is `<id>:<json>\n`, except a
 * text row, `<id>:T<hex byte length>,<text>`, which has no newline (React
 * outlines a long string, such as a class list, that way).
 */
function flightRows(payload: string): Map<string, string> {
  const bytes = Buffer.from(payload, "utf-8");
  const rows = new Map<string, string>();
  let at = 0;
  while (at < bytes.length) {
    const colon = bytes.indexOf(":", at);
    if (colon === -1) {
      break;
    }
    const id = bytes.toString("utf-8", at, colon);
    if (bytes[colon + 1] === "T".charCodeAt(0)) {
      const comma = bytes.indexOf(",", colon);
      const length = Number.parseInt(
        bytes.toString("utf-8", colon + 2, comma),
        16
      );
      rows.set(id, bytes.toString("utf-8", comma + 1, comma + 1 + length));
      at = comma + 1 + length;
    } else {
      const end = bytes.indexOf("\n", colon);
      const stop = end === -1 ? bytes.length : end;
      rows.set(id, bytes.toString("utf-8", colon + 1, stop));
      at = stop + 1;
    }
  }
  return rows;
}

/**
 * The page control as the server sent it: the direct child of the `li` in
 * the root row (`0`) of the payload. A host element has its tag as type; a
 * client component is a reference such as `$L1`.
 */
function pageControl(payload: string): FlightElement | undefined {
  const root = flightRows(payload).get("0");
  let node: unknown = root ? JSON.parse(root) : undefined;
  for (const tag of ["nav", "ul", "li"]) {
    if (!isElement(node) || node[1] !== tag) {
      return;
    }
    node = node[3].children;
  }
  return isElement(node) ? node : undefined;
}

describe("Pagination from a Server Component, vendored layout", () => {
  it("renders all thirty trees without running client code on the server", () => {
    expect(stderr).toBe("");
    expect(Object.keys(results)).toHaveLength(30);
    const errors = Object.entries(results)
      .filter(([, result]) => result.error)
      .map(([name, result]) => `${name}: ${result.error}`);
    expect(errors).toEqual([]);
  });

  it("keeps the default English labels in the server payload", () => {
    const payload = Object.values(results)
      .map((result) => result.payload ?? "")
      .join("");
    for (const text of [
      '"aria-label":"pagination"',
      '"aria-label":"Go to previous page"',
      '"aria-label":"Go to next page"',
      '"Previous"',
    ]) {
      expect(payload).toContain(text);
    }
  });

  it("sends a page control with href as an `a` with that href and no role", () => {
    for (const [name, href] of Object.entries(HREF_TREES)) {
      const control = pageControl(results[name]?.payload ?? "");
      expect(control?.[1], name).toBe("a");
      expect(control?.[3].href, name).toBe(href);
      expect(control?.[3], name).not.toHaveProperty("role");
    }
  });

  it("renders every tree on the client after the Flight round trip", () => {
    expect(decodeStderr).toBe("");
    expect(Object.keys(decoded)).toEqual(Object.keys(results));
    for (const [name, result] of Object.entries(decoded)) {
      expect(result.errors, name).toEqual([]);
      expect(result.html, name).toMatch(NAV_ROOT);
    }
  });

  it("renders a children label without a URL as the label of one button", () => {
    const item = listItem(decoded.linkNoHref.html);
    expect(item.match(CONTROL_TAG)).toHaveLength(1);
    expect(item).toMatch(CHILDREN_LABEL_BUTTON);
  });

  it("drops an HTML label without a URL: each control is its twin without it", () => {
    for (const [name, twinIs] of Object.entries(HTML_LABEL_TWINS)) {
      const item = listItem(decoded[name]?.html);
      const twin = listItem(decoded[`${name}Twin`]?.html);
      expect(twin, name).toMatch(twinIs);
      expect(item, name).toBe(twin);
      expect(item.match(CONTROL_TAG) ?? [], name).toHaveLength(
        name === "linkNoHrefHtmlSpan" ? 0 : 1
      );
      expect(item, name).not.toMatch(PROPS_NOT_IN_DOM);
      expect(item, name).not.toContain("<b>4</b>");
    }
  });

  it("renders an HTML label without a URL where there is no global `process`, as its twin", () => {
    expect(isolatedCode.none).toContain("process.env.NODE_ENV");
    for (const mode of ["development", "production"]) {
      expect(isolatedCode[mode], mode).not.toContain("process.env.NODE_ENV");
    }
    expect(stderr).toBe("");
    expect(decodeStderr).toBe("");
    for (const name of [
      "isolatedNone",
      "isolatedDevelopment",
      "isolatedProduction",
    ]) {
      for (const tree of [name, `${name}Twin`]) {
        expect(results[tree]?.error, tree).toBeUndefined();
        expect(results[tree]?.payload, tree).toBeTypeOf("string");
        expect(decoded[tree]?.errors, tree).toEqual([]);
      }
      const item = listItem(decoded[name]?.html);
      const twin = listItem(decoded[`${name}Twin`]?.html);
      expect(twin, name).toMatch(CHILDREN_LABEL_BUTTON);
      expect(item, name).toBe(twin);
    }
    // Only the labelled development tree logs the diagnostic.
    expect(isolatedLogs).toEqual({
      isolatedNone: "",
      isolatedNoneTwin: "",
      isolatedDevelopment:
        "Pagination: a page control without `href` does not take `dangerouslySetInnerHTML`. Pass the label as children, or give the control an `href`.\n",
      isolatedDevelopmentTwin: "",
      isolatedProduction: "",
      isolatedProductionTwin: "",
    });
  });
});
