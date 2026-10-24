#!/usr/bin/env node

/**
 * Generates apps/docs/lib/static-paths.json: every docs, blog and preview
 * path the site prerenders. Read by apps/docs/proxy.ts, which answers any
 * other path under those prefixes with the static 404 instead of letting
 * Next try to resume a dynamic route's fallback shell (unsupported on the
 * Worker).
 *
 *   node scripts/gen-static-paths.mjs          regenerate
 *   node scripts/gen-static-paths.mjs --check  exit 1 if stale
 *
 * The URL rule for docs files lives in apps/docs/lib/known-paths.ts and is
 * duplicated here in plain JS; tests/static-paths.built.test.ts checks the
 * output against the real prerender manifest after a build.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DOCS_CONTENT = join(ROOT, "apps/docs/content/docs");
const BLOG_CONTENT = join(ROOT, "apps/docs/content/blog");
const MANIFEST = join(ROOT, "apps/docs/demos/manifest.json");
const OUTPUT = join(ROOT, "apps/docs/lib/static-paths.json");

const ROUTE_GROUP = /^\(.*\)$/;
// Mirrors lib/known-paths.ts: fumadocs collects `**/*.{md,mdx}`.
const MDX_EXT = /\.mdx?$/;

function walk(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(dir, join(entry.parentPath, entry.name)).split("\\").join("/")
    );
}

function docsUrlFromFile(file) {
  if (!MDX_EXT.test(file)) {
    return null;
  }
  const segments = file
    .replace(MDX_EXT, "")
    .split("/")
    .filter((s) => s && !ROUTE_GROUP.test(s));
  if (segments.some((s) => s.startsWith("_"))) {
    return null;
  }
  if (segments.at(-1) === "index") {
    segments.pop();
  }
  return segments.length === 0 ? "/docs" : `/docs/${segments.join("/")}`;
}

function compare(a, b) {
  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
}

function main() {
  const check = process.argv.includes("--check");

  const docs = [
    ...new Set(walk(DOCS_CONTENT).map(docsUrlFromFile).filter(Boolean)),
  ].sort(compare);
  const blog = [
    "/blog",
    ...walk(BLOG_CONTENT)
      .filter((f) => MDX_EXT.test(f))
      .map((f) => `/blog/${f.replace(MDX_EXT, "")}`),
  ].sort(compare);
  const preview = Object.keys(JSON.parse(readFileSync(MANIFEST, "utf-8"))).sort(
    compare
  );

  const content = `${JSON.stringify({ docs, blog, preview }, null, 2)}\n`;
  let current = null;
  try {
    current = readFileSync(OUTPUT, "utf-8");
  } catch {
    current = null;
  }

  if (current === content) {
    console.log(
      `OK — static paths up to date (${docs.length} docs, ${blog.length} blog, ${preview.length} preview).`
    );
    return;
  }
  if (check) {
    console.error(
      "apps/docs/lib/static-paths.json is out of date. Run `pnpm gen:static-paths`."
    );
    process.exit(1);
  }
  writeFileSync(OUTPUT, content);
  console.log(
    `Generated static paths (${docs.length} docs, ${blog.length} blog, ${preview.length} preview).`
  );
}

main();
