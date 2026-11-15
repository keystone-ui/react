/**
 * A tripwire for the package version each `npm/*` item states.
 *
 * A package-flavour item ships the demo sources on `main`, which the docs
 * deploy on merge, while npm publishes the package later, at release. The
 * smoke install links this workspace's package, so a demo change that uses a
 * prop or export newer than the published minimum stays green in CI and
 * breaks every package consumer on that minimum. It happened once already:
 * Stepper's `animateHeight` was added and used by admin-01 in one commit,
 * released in the next version.
 *
 * So each item's files are recorded here with the package version they were
 * last checked against by hand. Any change to them fails this test until
 * someone checks again. No network: the check itself is manual.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import checked from "./npm-flavour-checked.json";
import { REPO_ROOT, readRegistry } from "./registry-paths";

const registry = readRegistry();
const packageItems = registry.items.filter((item) =>
  item.name.startsWith("npm/")
);

/** Every file path and its bytes, in the item's order. */
function digest(files: readonly { path: string }[]): string {
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file.path);
    hash.update("\0");
    hash.update(readFileSync(join(REPO_ROOT, file.path)));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function instructions(name: string, version: string): string {
  return [
    `${name}: its files changed since they were checked against @keystoneui/react ${version}.`,
    "Package consumers install the published package, not this workspace, so:",
    `  1. In a scratch app, install @keystoneui/react@${version} from npm, add the components.json the users-01 docs give, run \`pnpm registry:build\` here, then \`npx shadcn@latest add\` the built apps/docs/public/r/${name}.json and \`tsc --noEmit\`.`,
    "  2. If it no longer typechecks, raise the version the item states: its description in registry.json, the block MDX pages, skills/keystoneui-react/SKILL.md and npm-flavour-items.test.ts. A newer minimum must be published before the change deploys.",
    "  3. Then record the new digest and the version you checked against in apps/docs/tests/npm-flavour-checked.json.",
  ].join("\n");
}

describe("package-flavour items, against the version they were checked with", () => {
  it("records every npm/* item and nothing else", () => {
    expect(Object.keys(checked).sort()).toEqual(
      packageItems.map((item) => item.name).sort()
    );
  });

  for (const item of packageItems) {
    it(`${item.name} has not changed since its last check`, () => {
      const record = checked[item.name as keyof typeof checked];
      expect(
        digest(item.files ?? []),
        instructions(item.name, record.checkedAgainst)
      ).toBe(record.digest);
    });

    it(`${item.name} states the version it was checked against`, () => {
      // The record and the description must not drift: a new check recorded
      // here without raising the stated version, or the other way round.
      const record = checked[item.name as keyof typeof checked];
      expect(item.description).toContain(record.checkedAgainst);
    });
  }
});
