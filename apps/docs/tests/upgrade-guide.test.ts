/**
 * The 1.0 betas shipped as `1.0.0-beta.N`, so a breaking change never moved a
 * semver range. The upgrade guide is the only place a beta user learns about
 * one — every changeset that declares itself breaking must be covered there.
 *
 * Coverage is an MDX comment, `{/* changeset: <slug> *\/}`, above the section
 * that explains it. Changesets are deleted on release, so the check is "every
 * pending breaking changeset is covered", never "every slug still exists".
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { REPO_ROOT } from "./registry-paths";

const GUIDE = join(
  REPO_ROOT,
  "apps/docs/content/docs/(getting-started)/upgrading.mdx"
);

/** Phrases the changesets in this repo use to flag a consumer-facing break. */
const MD_EXT_RE = /\.md$/;
const COVERAGE_RE = /\{\/\*\s*changeset:\s*([a-z0-9-]+)\s*\*\/\}/g;

const BREAKING_RE =
  /\*\*Breaking|Breaking:|Public API change|Behavior change for consumers/;

function pendingChangesets(): { slug: string; body: string }[] {
  const dirs = [".changeset", ".changeset/pre"].map((d) => join(REPO_ROOT, d));
  return dirs
    .filter((dir) => existsSync(dir))
    .flatMap((dir) =>
      readdirSync(dir)
        .filter((f) => f.endsWith(".md") && f !== "README.md")
        .map((f) => ({
          slug: f.replace(MD_EXT_RE, ""),
          body: readFileSync(join(dir, f), "utf-8"),
        }))
    );
}

const guide = readFileSync(GUIDE, "utf-8");
const covered = new Set([...guide.matchAll(COVERAGE_RE)].map((m) => m[1]));

describe("upgrade guide", () => {
  it("covers every pending breaking changeset", () => {
    const missing = pendingChangesets()
      .filter(({ body }) => BREAKING_RE.test(body))
      .map(({ slug }) => slug)
      .filter((slug) => !covered.has(slug))
      .sort();

    expect(missing).toEqual([]);
  });

  it("only cites changesets that are breaking or already released", () => {
    // A citation of a pending, non-breaking changeset is a typo for another
    // slug — the real breaking one is then uncovered.
    const pending = new Map(pendingChangesets().map((c) => [c.slug, c.body]));
    const wrong = [...covered].filter((slug) => {
      const body = pending.get(slug);
      return body !== undefined && !BREAKING_RE.test(body);
    });
    expect(wrong).toEqual([]);
  });

  it("is listed in the Getting Started navigation", () => {
    const meta = JSON.parse(
      readFileSync(
        join(REPO_ROOT, "apps/docs/content/docs/(getting-started)/meta.json"),
        "utf-8"
      )
    );
    expect(meta.pages).toContain("upgrading");
  });
});
