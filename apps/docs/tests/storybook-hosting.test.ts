/**
 * Storybook is served as Workers static assets. These pin the pieces that
 * have to agree: the Worker config points at the build output, the build
 * copies a `_headers` file that makes Vite's hashed bundles immutable, and
 * the package scripts no longer reach for `wrangler pages`.
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const STORYBOOK_DIR = resolve(import.meta.dirname, "../../storybook");

const LINE_COMMENT = /^\s*\/\/.*$/gm;
const TRAILING_COMMA = /,(\s*[}\]])/g;
const STATIC_DIRS = /staticDirs:\s*\[([^\]]*)\]/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const IMMUTABLE_RULE =
  /^\s+Cache-Control:\s*public,\s*max-age=31536000,\s*immutable$/;

function readJsonc<T>(path: string): T {
  const text = readFileSync(path, "utf8")
    .replace(LINE_COMMENT, "")
    .replace(TRAILING_COMMA, "$1");
  return JSON.parse(text) as T;
}

interface WranglerConfig {
  assets?: { directory?: string; not_found_handling?: string };
  compatibility_date?: string;
  main?: string;
  name?: string;
}

describe("Storybook on Workers static assets", () => {
  it("deploys the Storybook build as an assets-only Worker", () => {
    const config = readJsonc<WranglerConfig>(
      join(STORYBOOK_DIR, "wrangler.jsonc")
    );
    expect(config.name).toBe("keystoneui-storybook");
    expect(config.assets?.directory).toBe("storybook-static");
    expect(config.main).toBeUndefined();
    expect(config.compatibility_date).toMatch(ISO_DATE);
  });

  it("marks Vite's hashed bundles immutable through _headers", () => {
    const headers = readFileSync(
      join(STORYBOOK_DIR, "public/_headers"),
      "utf8"
    );
    const rules = headers
      .split("\n")
      .filter((line) => line.trim() && !line.trim().startsWith("#"));
    const assetsRule = rules.indexOf("/assets/*");
    expect(assetsRule).toBeGreaterThanOrEqual(0);
    expect(rules[assetsRule + 1]).toMatch(IMMUTABLE_RULE);
  });

  it("copies public/ into the build so _headers ships with it", () => {
    const main = readFileSync(
      join(STORYBOOK_DIR, ".storybook/main.ts"),
      "utf8"
    );
    const match = STATIC_DIRS.exec(main);
    expect(match?.[1]).toContain('"../public"');
  });

  it("has no Pages deploy script left", () => {
    const pkg = readJsonc<{ scripts: Record<string, string> }>(
      join(STORYBOOK_DIR, "package.json")
    );
    for (const [name, script] of Object.entries(pkg.scripts)) {
      expect(script, name).not.toContain("wrangler pages");
    }
    expect(pkg.scripts["deploy:cf"]).toBe("wrangler deploy");
  });
});
