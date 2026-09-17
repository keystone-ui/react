import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  detectProjectContext,
  formatProjectContext,
  importLineFor,
} from "../project-context.js";

/**
 * These assertions are the reason the module exists. An agent picks its import
 * style from `installMode`, so a wrong answer here is a wrong answer in every
 * file it writes -- which is precisely the bug this shipped with for two
 * minor versions.
 */

const dirs: string[] = [];

function fixture(files: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), "keystone-ctx-"));
  dirs.push(dir);
  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(
      join(dir, name),
      typeof contents === "string" ? contents : JSON.stringify(contents)
    );
  }
  return dir;
}

afterEach(() => {
  while (dirs.length > 0) {
    const dir = dirs.pop();
    if (dir) {
      rmSync(dir, { force: true, recursive: true });
    }
  }
});

describe("installMode", () => {
  it("is `package` when @keystoneui/react is a dependency", () => {
    const dir = fixture({
      "package.json": { dependencies: { "@keystoneui/react": "1.0.0" } },
    });
    const ctx = detectProjectContext(dir);
    expect(ctx.installMode).toBe("package");
    expect(ctx.keystoneVersion).toBe("1.0.0");
  });

  it("finds the dependency in devDependencies too", () => {
    const dir = fixture({
      "package.json": { devDependencies: { "@keystoneui/react": "2.0.0" } },
    });
    expect(detectProjectContext(dir).installMode).toBe("package");
  });

  it("is `registry` when only components.json is present", () => {
    const dir = fixture({ "components.json": { aliases: { ui: "@/ui" } } });
    const ctx = detectProjectContext(dir);
    expect(ctx.installMode).toBe("registry");
    expect(ctx.keystoneVersion).toBeNull();
  });

  // The precedence rule. A project can carry both signals -- someone using
  // shadcn for other registries who then installs Keystone from npm -- and the
  // dependency has to win, because subpath imports resolve and are what the
  // agent should write.
  it("prefers `package` when both signals are present", () => {
    const dir = fixture({
      "components.json": { aliases: { ui: "@/components/ui" } },
      "package.json": { dependencies: { "@keystoneui/react": "1.0.0" } },
    });
    expect(detectProjectContext(dir).installMode).toBe("package");
  });

  it("is `unknown` in a bare directory", () => {
    expect(detectProjectContext(fixture({})).installMode).toBe("unknown");
  });

  it("is `unknown` rather than throwing on malformed JSON", () => {
    const dir = fixture({ "components.json": "{ not json" });
    expect(detectProjectContext(dir).installMode).toBe("unknown");
  });
});

describe("fields read from components.json", () => {
  it("reads aliases, css file, icon library and rsc", () => {
    const dir = fixture({
      "components.json": {
        aliases: { ui: "@workspace/ui/components" },
        iconLibrary: "tabler",
        rsc: true,
        tailwind: { css: "src/styles/app.css" },
      },
    });
    const ctx = detectProjectContext(dir);
    expect(ctx.aliases?.ui).toBe("@workspace/ui/components");
    expect(ctx.iconLibrary).toBe("tabler");
    expect(ctx.isRSC).toBe(true);
    expect(ctx.tailwindCssFile).toBe("src/styles/app.css");
  });

  // shadcn writes `"config": ""` for Tailwind v4; an empty css string is the
  // same shape of "present but unset", and must not be reported as a path.
  it("treats an empty css string as unknown", () => {
    const dir = fixture({ "components.json": { tailwind: { css: "" } } });
    expect(detectProjectContext(dir).tailwindCssFile).toBeNull();
  });

  it("distinguishes rsc:false from rsc absent", () => {
    expect(
      detectProjectContext(fixture({ "components.json": { rsc: false } })).isRSC
    ).toBe(false);
    expect(
      detectProjectContext(fixture({ "components.json": {} })).isRSC
    ).toBeNull();
  });
});

describe("packageManager", () => {
  it("prefers the declared packageManager field", () => {
    const dir = fixture({
      "package.json": { packageManager: "pnpm@9.15.0" },
      "yarn.lock": "",
    });
    expect(detectProjectContext(dir).packageManager).toBe("pnpm");
  });

  it("falls back to the lockfile", () => {
    expect(
      detectProjectContext(fixture({ "bun.lock": "" })).packageManager
    ).toBe("bun");
    expect(
      detectProjectContext(fixture({ "package-lock.json": "{}" }))
        .packageManager
    ).toBe("npm");
  });

  it("is null when nothing says", () => {
    expect(detectProjectContext(fixture({})).packageManager).toBeNull();
  });
});

describe("importLineFor", () => {
  it("uses subpaths in package mode", () => {
    const dir = fixture({
      "package.json": { dependencies: { "@keystoneui/react": "1.0.0" } },
    });
    expect(importLineFor("button", detectProjectContext(dir))).toContain(
      '"@keystoneui/react/button"'
    );
  });

  it("uses the project's own alias in registry mode, not a hardcoded @/", () => {
    const dir = fixture({
      "components.json": { aliases: { ui: "@workspace/ui/components" } },
    });
    expect(importLineFor("button", detectProjectContext(dir))).toContain(
      '"@workspace/ui/components/button"'
    );
  });
});

describe("formatProjectContext", () => {
  it("tells the reader to ask when the mode is unknown", () => {
    const out = formatProjectContext(detectProjectContext(fixture({})));
    expect(out).toContain("**unknown**");
    expect(out).toContain("Ask before writing imports");
  });

  it("names the actual css file and alias when known", () => {
    const dir = fixture({
      "components.json": {
        aliases: { ui: "@/components/ui" },
        tailwind: { css: "app/globals.css" },
      },
    });
    const out = formatProjectContext(detectProjectContext(dir));
    expect(out).toContain("app/globals.css");
    expect(out).toContain("@/components/ui");
  });
});
