/**
 * Every link to a docs page must point at a page that exists. Docs URLs
 * are not redirected when a page moves: the move updates every link in the
 * repo instead, and this test is what catches a link the move missed.
 *
 * It scans the surfaces a reader or an agent follows: the docs content and
 * app, the READMEs, the MCP server source and the shipped agent skill. A
 * link is a Markdown link target, a `https://keystoneui.io/docs/...` URL or
 * a quoted "/docs/..." string. Template placeholders (`/docs/blocks/${x}`,
 * `/docs/components/{name}`) are skipped.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import staticPaths from "../lib/static-paths.json";

const ROOT = resolve(import.meta.dirname, "../../..");

const SCANNED = [
  "README.md",
  "packages/*/README.md",
  "packages/keystoneui-mcp/src",
  "skills",
  "apps/docs/content",
  "apps/docs/app",
  "apps/docs/lib",
];

const TEXT_FILE = /\.(md|mdx|ts|tsx|mjs|json)$/;

// A link to a docs path: a Markdown target, an absolute URL or a quoted string.
const DOCS_LINK =
  /(?:\]\(|https:\/\/keystoneui\.io|["'`])(\/docs(?:\/[\w.-]+)*)/g;
// What follows a template link: `/${name}`, `/{name}` or `/<name>`.
const PLACEHOLDER = /^\/(?:\$\{|\{|<)/;
const MDX_SUFFIX = /\.mdx$/;
const TRAILING = /[./]+$/;

const pages = new Set(staticPaths.docs);

/** The page a link resolves to: `.mdx` (the LLM view) and a trailing dot or slash dropped. */
function linkedPage(link: string): string {
  const page = link.replace(MDX_SUFFIX, "").replace(TRAILING, "");
  return page === "" ? "/docs" : page;
}

/** Every docs link in `text`, as the page it resolves to. */
function docsLinks(text: string): string[] {
  return [...text.matchAll(DOCS_LINK)]
    .filter((m) => !PLACEHOLDER.test(text.slice(m.index + m[0].length)))
    .map((m) => linkedPage(m[1]));
}

function scannedFiles(): string[] {
  return execFileSync("git", ["ls-files", "--", ...SCANNED], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .split("\n")
    .filter(
      (file) =>
        TEXT_FILE.test(file) &&
        !file.includes("/test/") &&
        !file.endsWith(".test.ts") &&
        !file.endsWith("static-paths.json") &&
        // Authoring templates link to example pages that never exist.
        !file.split("/").at(-1)?.startsWith("_")
    );
}

describe("docsLinks", () => {
  it("finds Markdown, absolute and quoted links", () => {
    expect(
      docsLinks(
        '[a](/docs/concepts/rtl#why) see https://keystoneui.io/docs/agents/mcp-server. href="/docs/components/button"'
      )
    ).toEqual([
      "/docs/concepts/rtl",
      "/docs/agents/mcp-server",
      "/docs/components/button",
    ]);
  });

  it("resolves the .mdx view to its page", () => {
    expect(
      docsLinks("(https://keystoneui.io/docs/components/button.mdx)")
    ).toEqual(["/docs/components/button"]);
  });

  it("skips template placeholders and file paths", () => {
    expect(
      docsLinks(
        // biome-ignore lint/suspicious/noTemplateCurlyInString: the template text is the input under test
        "href={`/docs/blocks/${name}`} `https://keystoneui.io/docs/components/{name}` apps/docs/content/docs/x.mdx"
      )
    ).toEqual([]);
  });
});

describe("docs links in the repo", () => {
  const broken = scannedFiles().flatMap((file) =>
    docsLinks(readFileSync(join(ROOT, file), "utf8"))
      .filter((page) => !pages.has(page))
      .map((page) => `${file} -> ${page}`)
  );

  it("all point at a page that exists", () => {
    expect(broken).toEqual([]);
  });
});
