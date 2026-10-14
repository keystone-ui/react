import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { REPO_ROOT } from "./registry-paths";

/**
 * Install commands name the dist-tag that release CI actually moves.
 *
 * While Changesets is in pre-release mode, `changeset publish` puts
 * `@keystoneui/react` on the `beta` dist-tag only -- it refuses `--tag` in pre
 * mode, and a Trusted Publishing credential can't move tags afterwards. So
 * `latest` stays on whatever it last pointed at, and a bare
 * `pnpm add @keystoneui/react` installs a stale beta. Every install command a
 * reader or agent copies has to say `@beta` until the beta ends.
 *
 * Once `changeset pre exit` lands, stable versions publish to `latest` and the
 * `@beta` suffix becomes the stale one -- so the same test then requires it to
 * be gone, and shipping 1.0 flags the docs cleanup instead of leaving it to
 * memory.
 *
 * The blog and changelogs are dated records and are left out on purpose.
 */

const SCANNED = [
  "README.md",
  "packages/ui/README.md",
  "apps/docs/app",
  "apps/docs/content/docs",
  "skills",
  "scripts/migrate-component-mdx.mjs",
];

const EXTENSIONS = new Set([".md", ".mdx", ".ts", ".tsx", ".mjs"]);

const INSTALL_RE =
  /(?:pnpm add|npm install|npm i|yarn add|bun add) @keystoneui\/react(@[\w.-]+)?(?![\w/-])/g;

function files(path: string): string[] {
  const abs = join(REPO_ROOT, path);
  if (!existsSync(abs)) {
    return [];
  }
  if (statSync(abs).isFile()) {
    return [abs];
  }
  return readdirSync(abs, { recursive: true, encoding: "utf8" })
    .map((entry) => join(abs, entry))
    .filter((file) => EXTENSIONS.has(extname(file)) && statSync(file).isFile());
}

function installCommands() {
  return SCANNED.flatMap(files).flatMap((file) =>
    [...readFileSync(file, "utf8").matchAll(INSTALL_RE)].map((match) => ({
      where: relative(REPO_ROOT, file),
      command: match[0],
      tag: match[1] ?? null,
    }))
  );
}

function inPreMode() {
  const preJson = join(REPO_ROOT, ".changeset/pre.json");
  return (
    existsSync(preJson) &&
    JSON.parse(readFileSync(preJson, "utf8")).mode === "pre"
  );
}

describe("install commands", () => {
  const commands = installCommands();

  it("finds the install commands it guards", () => {
    // A regex or path drift that matches nothing would pass vacuously.
    expect(commands.length).toBeGreaterThan(10);
  });

  it("name the dist-tag release CI moves", () => {
    const expected = inPreMode() ? "@beta" : null;
    const wrong = commands
      .filter((c) => c.tag !== expected)
      .map((c) => `${c.where}: ${c.command}`);
    expect(wrong).toEqual([]);
  });
});
