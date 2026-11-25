/**
 * Component scaffold (`scripts/add-component.mjs`).
 *
 * The scaffold creates four files and edits six registries. It must never
 * replace a file that already exists or add a registry entry that is already
 * there: `DatePicker` once overwrote a 686-line story, a demo and an MDX page
 * because only `packages/ui/src/<name>.tsx` was checked.
 *
 * Two phases, each pinned here row by row:
 *  - Preflight: every collision is listed, exit 1, "Nothing was written.",
 *    the tree byte-identical.
 *  - Write phase: files are created exclusively in a fixed order. At the
 *    first failure the run stops, names the path and error code, and lists
 *    the paths it created. It never removes anything: a path it created may
 *    since hold someone else's save.
 *
 * Every test copies the scaffold, `gen-demos.mjs` (whose renderers it uses),
 * `lib/demo-entries.mjs` and the four registry files into a throwaway tree
 * under the OS temp dir (removed afterwards) and runs the scaffold as a
 * subprocess from there. Rows that need something to happen between two of
 * the scaffold's calls start it with a `--import` preload that wraps one
 * `node:fs` function (see `HOOK_PRELUDE`). No test writes to the repo; the
 * usage-example check only reads it.
 */

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const REPO_ROOT = join(import.meta.dirname, "../../..");

/** Files the scaffold needs, copied verbatim. */
const COPIED = [
  "scripts/add-component.mjs",
  "scripts/gen-demos.mjs",
  "scripts/lib/demo-entries.mjs",
  "packages/ui/package.json",
  "packages/ui/tsup.config.ts",
  "packages/ui/src/_registry.ts",
  "apps/docs/content/docs/components/meta.json",
];

const KEBAB = "scaffold-probe";
const PASCAL = "ScaffoldProbe";
const REGISTRY_END = /\n];/;
const EXAMPLE_LINE = /pnpm add:component (\S+)$/gm;

const FILES = {
  component: `packages/ui/src/${KEBAB}.tsx`,
  story: `apps/storybook/stories/${KEBAB}.stories.tsx`,
  demo: `apps/docs/demos/${KEBAB}/default.tsx`,
  mdx: `apps/docs/content/docs/components/${KEBAB}.mdx`,
};
const DEMO_DIR = `apps/docs/demos/${KEBAB}`;

const REGISTRIES = [
  "packages/ui/package.json",
  "packages/ui/tsup.config.ts",
  "packages/ui/src/_registry.ts",
  "apps/docs/content/docs/components/meta.json",
];

/** The created list for a stop at the MDX open, in creation order. */
const BEFORE_MDX = [FILES.component, FILES.story, DEMO_DIR, FILES.demo];
/** The created list once all four files are closed. */
const ALL_FIVE = [...BEFORE_MDX, FILES.mdx];

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function tempDir(prefix: string) {
  // realpath: on macOS the temp dir is a /var symlink to /private/var, and
  // the script resolves its own location to the latter.
  const dir = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  temps.push(dir);
  return dir;
}

function scratchRepo() {
  const repo = tempDir("ks-add-component-");
  for (const path of COPIED) {
    mkdirSync(dirname(join(repo, path)), { recursive: true });
    writeFileSync(join(repo, path), readFileSync(join(REPO_ROOT, path)));
  }
  mkdirSync(join(repo, "apps/storybook/stories"), { recursive: true });
  mkdirSync(join(repo, "apps/docs/demos"), { recursive: true });
  return repo;
}

function run(repo: string, ...args: string[]) {
  return spawnSync(
    process.execPath,
    [join(repo, "scripts/add-component.mjs"), ...args],
    { encoding: "utf8", timeout: 30_000 }
  );
}

/**
 * Prepended to every hook. `before(name, when, action)` runs `action` once,
 * the first time `fs[name]` is called with arguments matching `when`, then
 * makes the real call. `real` holds the unwrapped functions for actions to
 * use; `at` makes a repo-relative path absolute; `fail` throws an fs-style
 * error. `syncBuiltinESMExports` makes the script's named imports from
 * `node:fs` see the wrappers.
 */
const HOOK_PRELUDE = `import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
const real = { ...fs };
const at = (path) => join(ROOT, path);
const is = (path, rel) => String(path) === at(rel);
const fail = (code) => {
  throw Object.assign(new Error(code), { code });
};
function before(name, when, action) {
  let done = false;
  const wrapped = fs[name];
  fs[name] = function (...args) {
    if (!done && when(...args)) {
      done = true;
      action(...args);
    }
    return wrapped.apply(this, args);
  };
}
`;

function hookFile(repo: string, body: string, extra = "") {
  const dir = tempDir("ks-add-component-hook-");
  const file = join(dir, "hook.mjs");
  writeFileSync(
    file,
    `const ROOT = ${JSON.stringify(repo)};\n${extra}${HOOK_PRELUDE}${body}\nsyncBuiltinESMExports();\n`
  );
  return pathToFileURL(file).href;
}

function runHooked(repo: string, body: string) {
  return spawnSync(
    process.execPath,
    [
      "--import",
      hookFile(repo, body),
      join(repo, "scripts/add-component.mjs"),
      PASCAL,
    ],
    { encoding: "utf8", timeout: 30_000 }
  );
}

function spawnHooked(
  repo: string,
  hook: string
): Promise<{ status: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ["--import", hook, join(repo, "scripts/add-component.mjs"), PASCAL],
      { timeout: 30_000 }
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

function put(repo: string, path: string, content: string) {
  mkdirSync(dirname(join(repo, path)), { recursive: true });
  writeFileSync(join(repo, path), content);
}

function read(repo: string, path: string) {
  return readFileSync(join(repo, path), "utf8");
}

function edit(repo: string, path: string, change: (source: string) => string) {
  const file = join(repo, path);
  const before = readFileSync(file, "utf8");
  const after = change(before);
  expect(after, `fixture edit did nothing to ${path}`).not.toBe(before);
  writeFileSync(file, after);
}

function editJson(
  repo: string,
  path: string,
  change: (value: Record<string, any>) => void
) {
  edit(repo, path, (source) => {
    const value = JSON.parse(source);
    change(value);
    return `${JSON.stringify(value, null, 2)}\n`;
  });
}

/** Every file under `repo` (directories too), mapped to a content hash. */
function snapshot(repo: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const entry of readdirSync(repo, {
    recursive: true,
    withFileTypes: true,
  })) {
    const path = relative(repo, join(entry.parentPath, entry.name));
    out[path] = entry.isDirectory()
      ? "dir"
      : createHash("sha256")
          .update(readFileSync(join(repo, path)))
          .digest("hex");
  }
  return out;
}

/**
 * The tree after a stop: every path from `before` is still there with the
 * same bytes, except those in `changed`; the only new paths are `added`.
 */
function expectTree(
  before: Record<string, string>,
  after: Record<string, string>,
  { added = [], changed = [] }: { added?: string[]; changed?: string[] }
) {
  const kept = Object.fromEntries(
    Object.entries(before).filter(([path]) => !changed.includes(path))
  );
  expect(
    Object.fromEntries(Object.entries(after).filter(([path]) => path in kept))
  ).toEqual(kept);
  expect(
    Object.keys(after)
      .filter((path) => !(path in before))
      .sort()
  ).toEqual([...added].sort());
}

function createdLine(paths: string[]) {
  return `Paths created by this run: ${paths.length > 0 ? paths.join(", ") : "none"}.`;
}

function expectStop(
  result: { status: number | null; stderr: string },
  at: string,
  code: string,
  created: string[]
) {
  expect(result.status, result.stderr).toBe(1);
  expect(result.stderr).toContain(`Stopped at ${at} (${code}).`);
  if (code === "EEXIST") {
    expect(result.stderr).toContain(`${at} (appeared after the check)`);
  } else {
    expect(result.stderr).not.toContain("appeared after the check");
  }
  expect(result.stderr).toContain(createdLine(created));
  expect(result.stderr).not.toContain("Nothing was written.");
}

function demoKeySentence(key: string, a: string, b: string) {
  const [first, second] = [a, b].sort();
  return `Demo key "${key}" is produced by both ${first} and ${second}.`;
}

/** One fixture per thing the scaffold would create or add. */
const COLLISIONS: Record<
  string,
  { arrange: (repo: string) => void; reported: string }
> = {
  component: {
    arrange: (repo) => put(repo, FILES.component, "// mine\n"),
    reported: FILES.component,
  },
  story: {
    arrange: (repo) => put(repo, FILES.story, "// my 686-line story\n"),
    reported: FILES.story,
  },
  demo: {
    arrange: (repo) => put(repo, FILES.demo, "// my demo\n"),
    reported: FILES.demo,
  },
  mdx: {
    arrange: (repo) => put(repo, FILES.mdx, "---\ntitle: Mine\n---\n"),
    reported: FILES.mdx,
  },
  "package export": {
    arrange: (repo) =>
      editJson(repo, "packages/ui/package.json", (pkg) => {
        pkg.exports[`./${KEBAB}`] = `./src/${KEBAB}.tsx`;
      }),
    reported: `packages/ui/package.json: exports "./${KEBAB}"`,
  },
  "tsup entry": {
    arrange: (repo) =>
      edit(repo, "packages/ui/tsup.config.ts", (source) =>
        source.replace(
          "entryPoints: [",
          `entryPoints: [\n    "src/${KEBAB}.tsx",`
        )
      ),
    reported: `packages/ui/tsup.config.ts: entry "src/${KEBAB}.tsx"`,
  },
  "_registry.ts entry": {
    arrange: (repo) =>
      edit(repo, "packages/ui/src/_registry.ts", (source) =>
        source.replace(
          REGISTRY_END,
          `\n  {\n    name: "${KEBAB}",\n    type: "registry:ui",\n    dependencies: [],\n    files: [],\n  },\n];`
        )
      ),
    reported: `packages/ui/src/_registry.ts: entry name: "${KEBAB}"`,
  },
  "meta.json entry": {
    arrange: (repo) =>
      editJson(repo, "apps/docs/content/docs/components/meta.json", (meta) => {
        meta.pages.push(KEBAB);
      }),
    reported: `apps/docs/content/docs/components/meta.json: pages "${KEBAB}"`,
  },
};

const PUBLISH_EXPORT = {
  arrange: (repo: string) =>
    editJson(repo, "packages/ui/package.json", (pkg) => {
      pkg.publishConfig.exports[`./${KEBAB}`] = {
        types: `./dist/${KEBAB}.d.ts`,
        default: `./dist/${KEBAB}.js`,
      };
    }),
  reported: `packages/ui/package.json: publishConfig.exports "./${KEBAB}"`,
};

function expectRefusal(repo: string, reported: string[]) {
  const before = snapshot(repo);
  const result = run(repo, PASCAL);
  expect(result.status, result.stdout).toBe(1);
  expect(result.stderr).toContain("Nothing was written.");
  for (const line of reported) {
    expect(result.stderr).toContain(line);
  }
  expect(snapshot(repo)).toEqual(before);
  return result;
}

describe("preflight: an existing file or entry stops the run before any write", () => {
  it("names an existing story when the component file is absent (the DatePicker shape)", () => {
    const repo = scratchRepo();
    COLLISIONS.story.arrange(repo);

    expectRefusal(repo, [FILES.story]);
    expect(read(repo, FILES.story)).toBe("// my 686-line story\n");
  });

  it.each(Object.keys(COLLISIONS).filter((key) => key !== "story"))(
    "refuses on an existing %s alone",
    (key) => {
      const repo = scratchRepo();
      COLLISIONS[key].arrange(repo);

      expectRefusal(repo, [COLLISIONS[key].reported]);
    }
  );

  it("refuses on a publish export alone", () => {
    const repo = scratchRepo();
    PUBLISH_EXPORT.arrange(repo);

    expectRefusal(repo, [PUBLISH_EXPORT.reported]);
  });

  it("lists all eight collisions in one run", () => {
    const repo = scratchRepo();
    for (const collision of Object.values(COLLISIONS)) {
      collision.arrange(repo);
    }

    expectRefusal(
      repo,
      Object.values(COLLISIONS).map((collision) => collision.reported)
    );
  });

  it("lists all nine with the publish export added", () => {
    const repo = scratchRepo();
    for (const collision of [...Object.values(COLLISIONS), PUBLISH_EXPORT]) {
      collision.arrange(repo);
    }

    expectRefusal(
      repo,
      [...Object.values(COLLISIONS), PUBLISH_EXPORT].map(
        (collision) => collision.reported
      )
    );
  });

  // `scaffold/probe-default.tsx` and `scaffold-probe/default.tsx` both map to
  // the key "scaffold-probe-default"; gen-demos throws on a duplicate key.
  it("refuses a demo whose key the new demo would take", () => {
    const repo = scratchRepo();
    put(
      repo,
      "apps/docs/demos/scaffold/probe-default.tsx",
      "export default function Saved() { return null; }\n"
    );

    expectRefusal(repo, [
      demoKeySentence(
        "scaffold-probe-default",
        "apps/docs/demos/scaffold/probe-default.tsx",
        FILES.demo
      ),
    ]);
  });

  it("refuses when two existing demos already share a key", () => {
    const repo = scratchRepo();
    put(repo, "apps/docs/demos/other/one-two.tsx", "// one\n");
    put(repo, "apps/docs/demos/other-one/two.tsx", "// two\n");

    expectRefusal(repo, [
      demoKeySentence(
        "other-one-two",
        "apps/docs/demos/other/one-two.tsx",
        "apps/docs/demos/other-one/two.tsx"
      ),
    ]);
  });
});

describe("write phase: stops at the first failure and removes nothing", () => {
  it("lets exactly one of two runs released together at their first exclusive open win", async () => {
    const solo = scratchRepo();
    expect(run(solo, PASCAL).status).toBe(0);

    const repo = scratchRepo();
    const barrier = tempDir("ks-add-component-barrier-");
    const body = `
before("openSync", (path, flags) => flags === "wx", () => {
  real.writeFileSync(join(BARRIER, String(process.pid)), "");
  const sleeper = new Int32Array(new SharedArrayBuffer(4));
  const deadline = Date.now() + 10_000;
  while (real.readdirSync(BARRIER).length < 2 && Date.now() < deadline) {
    Atomics.wait(sleeper, 0, 0, 5);
  }
});`;
    const hook = hookFile(
      repo,
      body,
      `const BARRIER = ${JSON.stringify(barrier)};\n`
    );

    const results = await Promise.all([
      spawnHooked(repo, hook),
      spawnHooked(repo, hook),
    ]);

    expect(readdirSync(barrier)).toHaveLength(2);
    const winners = results.filter((result) => result.status === 0);
    const losers = results.filter((result) => result.status !== 0);
    expect(winners).toHaveLength(1);
    expect(losers).toHaveLength(1);
    expect(winners[0].stderr).toBe("");
    expectStop(losers[0], FILES.component, "EEXIST", []);
    expect(snapshot(repo)).toEqual(snapshot(solo));
  });

  it("stops at a story created just before its open", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = runHooked(
      repo,
      `before("openSync", (path) => is(path, ${JSON.stringify(FILES.story)}), () => {
  real.writeFileSync(at(${JSON.stringify(FILES.story)}), "// someone else's story\\n");
});`
    );

    expectStop(result, FILES.story, "EEXIST", [FILES.component]);
    expect(read(repo, FILES.story)).toBe("// someone else's story\n");
    expectTree(before, snapshot(repo), {
      added: [FILES.component, FILES.story],
    });
  });

  it("stops at an MDX page created just before its open", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = runHooked(
      repo,
      `before("openSync", (path) => is(path, ${JSON.stringify(FILES.mdx)}), () => {
  real.writeFileSync(at(${JSON.stringify(FILES.mdx)}), "MY MDX\\n");
});`
    );

    expectStop(result, FILES.mdx, "EEXIST", BEFORE_MDX);
    expect(read(repo, FILES.mdx)).toBe("MY MDX\n");
    expectTree(before, snapshot(repo), { added: ALL_FIVE });
  });

  // The fix-round-1 clean-up deleted these saves: it removed by path.
  it("keeps saves made over its own files before the MDX open", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = runHooked(
      repo,
      `before("openSync", (path) => is(path, ${JSON.stringify(FILES.mdx)}), () => {
  real.writeFileSync(at("tmp-save.tsx"), "// MY SAVED COMPONENT\\n");
  real.renameSync(at("tmp-save.tsx"), at(${JSON.stringify(FILES.component)}));
  real.writeFileSync(at(${JSON.stringify(FILES.story)}), "// MY SAVED STORY\\n");
  real.writeFileSync(at(${JSON.stringify(`${DEMO_DIR}/notes.txt`)}), "notes\\n");
  real.writeFileSync(at(${JSON.stringify(FILES.mdx)}), "MY MDX\\n");
});`
    );

    expectStop(result, FILES.mdx, "EEXIST", BEFORE_MDX);
    expect(read(repo, FILES.component)).toBe("// MY SAVED COMPONENT\n");
    expect(read(repo, FILES.story)).toBe("// MY SAVED STORY\n");
    expect(read(repo, `${DEMO_DIR}/notes.txt`)).toBe("notes\n");
    expect(read(repo, FILES.mdx)).toBe("MY MDX\n");
    expectTree(before, snapshot(repo), {
      added: [...ALL_FIVE, `${DEMO_DIR}/notes.txt`],
    });
  });

  it("keeps a demo moved away and lists it under its original name", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = runHooked(
      repo,
      `before("openSync", (path) => is(path, ${JSON.stringify(FILES.mdx)}), () => {
  real.renameSync(at(${JSON.stringify(FILES.demo)}), at("moved-demo.tsx"));
  real.writeFileSync(at(${JSON.stringify(FILES.mdx)}), "MY MDX\\n");
});`
    );

    expectStop(result, FILES.mdx, "EEXIST", BEFORE_MDX);
    expect(read(repo, "moved-demo.tsx")).toContain(
      `export default function ${PASCAL}Default()`
    );
    expect(read(repo, FILES.mdx)).toBe("MY MDX\n");
    expectTree(before, snapshot(repo), {
      added: [
        FILES.component,
        FILES.story,
        DEMO_DIR,
        FILES.mdx,
        "moved-demo.tsx",
      ],
    });
  });

  it.each([
    ["empty", []],
    ["holding notes.txt", [`${DEMO_DIR}/notes.txt`]],
  ] as const)(
    "reuses a demo directory created just before its mkdir (%s) and leaves it out of the list",
    (_label, inside) => {
      const repo = scratchRepo();
      const before = snapshot(repo);

      const result = runHooked(
        repo,
        `before("mkdirSync", (path) => is(path, ${JSON.stringify(DEMO_DIR)}), () => {
  real.mkdirSync(at(${JSON.stringify(DEMO_DIR)}));
  for (const file of ${JSON.stringify(inside)}) {
    real.writeFileSync(at(file), "notes\\n");
  }
  real.writeFileSync(at(${JSON.stringify(FILES.mdx)}), "MY MDX\\n");
});`
      );

      expectStop(result, FILES.mdx, "EEXIST", [
        FILES.component,
        FILES.story,
        FILES.demo,
      ]);
      for (const file of inside) {
        expect(read(repo, file)).toBe("notes\n");
      }
      expectTree(before, snapshot(repo), {
        added: [...ALL_FIVE, ...inside],
      });
    }
  );

  it("stops at a regular file created where the demo directory goes", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = runHooked(
      repo,
      `before("mkdirSync", (path) => is(path, ${JSON.stringify(DEMO_DIR)}), () => {
  real.writeFileSync(at(${JSON.stringify(DEMO_DIR)}), "a file\\n");
});`
    );

    expectStop(result, DEMO_DIR, "EEXIST", [FILES.component, FILES.story]);
    expect(read(repo, DEMO_DIR)).toBe("a file\n");
    expectTree(before, snapshot(repo), {
      added: [FILES.component, FILES.story, DEMO_DIR],
    });
  });

  it("stops when the story cannot be opened (ENOENT)", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = runHooked(
      repo,
      `before("openSync", (path) => is(path, ${JSON.stringify(FILES.story)}), () => fail("ENOENT"));`
    );

    expectStop(result, FILES.story, "ENOENT", [FILES.component]);
    expectTree(before, snapshot(repo), { added: [FILES.component] });
  });

  it("stops when the story cannot be written (ENOSPC) and lists the partial story", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = runHooked(
      repo,
      `let storyFd;
const open = fs.openSync;
fs.openSync = function (...args) {
  const fd = open.apply(this, args);
  if (is(args[0], ${JSON.stringify(FILES.story)})) {
    storyFd = fd;
  }
  return fd;
};
before("writeSync", (fd) => fd === storyFd, () => fail("ENOSPC"));`
    );

    expectStop(result, FILES.story, "ENOSPC", [FILES.component, FILES.story]);
    expectTree(before, snapshot(repo), {
      added: [FILES.component, FILES.story],
    });
  });

  it("stops on a duplicate demo key that appears after the check, before any registry edit", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = runHooked(
      repo,
      `before("openSync", (path) => is(path, ${JSON.stringify(FILES.component)}), () => {
  real.mkdirSync(at("apps/docs/demos/scaffold"));
  real.writeFileSync(at("apps/docs/demos/scaffold/probe-default.tsx"), "// foreign demo\\n");
});`
    );

    expect(result.status, result.stderr).toBe(1);
    expect(result.stderr).toContain(
      demoKeySentence(
        "scaffold-probe-default",
        "apps/docs/demos/scaffold/probe-default.tsx",
        FILES.demo
      )
    );
    expect(result.stderr).toContain(createdLine(ALL_FIVE));
    expect(read(repo, "apps/docs/demos/scaffold/probe-default.tsx")).toBe(
      "// foreign demo\n"
    );
    expectTree(before, snapshot(repo), {
      added: [
        ...ALL_FIVE,
        "apps/docs/demos/scaffold",
        "apps/docs/demos/scaffold/probe-default.tsx",
      ],
    });
  });

  it("stops at an I/O error on the tsup config with only the package exports edited", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = runHooked(
      repo,
      `before("openSync", (path) => is(path, "packages/ui/tsup.config.ts"), () => fail("EIO"));`
    );

    expectStop(result, "packages/ui/tsup.config.ts", "EIO", ALL_FIVE);
    expect(
      JSON.parse(read(repo, "packages/ui/package.json")).exports[`./${KEBAB}`]
    ).toBe(`./src/${KEBAB}.tsx`);
    expectTree(before, snapshot(repo), {
      added: ALL_FIVE,
      changed: ["packages/ui/package.json"],
    });
  });
});

describe("a new name", () => {
  it("creates the four files and the registry entries, with nothing on stderr", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = run(repo, PASCAL);

    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toBe("");
    for (const path of Object.values(FILES)) {
      expect(existsSync(join(repo, path)), path).toBe(true);
    }
    const pkg = JSON.parse(read(repo, "packages/ui/package.json"));
    expect(pkg.exports[`./${KEBAB}`]).toBe(`./src/${KEBAB}.tsx`);
    expect(pkg.publishConfig.exports[`./${KEBAB}`]).toEqual({
      types: `./dist/${KEBAB}.d.ts`,
      default: `./dist/${KEBAB}.js`,
    });
    expect(read(repo, "packages/ui/tsup.config.ts")).toContain(
      `"src/${KEBAB}.tsx"`
    );
    expect(read(repo, "packages/ui/src/_registry.ts")).toContain(
      `name: "${KEBAB}"`
    );
    expect(
      JSON.parse(read(repo, "apps/docs/content/docs/components/meta.json"))
        .pages
    ).toContain(KEBAB);
    expect(JSON.parse(read(repo, "apps/docs/demos/manifest.json"))).toEqual({
      [`${KEBAB}-default`]: `${KEBAB}/default.tsx`,
    });
    expect(read(repo, "apps/docs/demos/loader.tsx")).toContain(
      `"${KEBAB}-default": dynamic(`
    );
    expectTree(before, snapshot(repo), {
      added: [
        ...ALL_FIVE,
        "apps/docs/demos/manifest.json",
        "apps/docs/demos/loader.tsx",
      ],
      changed: REGISTRIES,
    });
    expect(result.stdout).toContain("pnpm gen:static-paths");
  });
});

describe("add-component arguments", () => {
  it("rejects an invalid name with the existing message", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = run(repo, "9lives");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'Error: Invalid component name "9lives". Use letters, numbers, and hyphens only.'
    );
    expect(snapshot(repo)).toEqual(before);
  });

  // The usage example is what a newcomer pastes. It must not name anything
  // the repo already has, or pasting it is the overwrite this file guards.
  it("prints usage whose example names nothing in the repo", () => {
    const repo = scratchRepo();

    const result = run(repo);

    expect(result.status).toBe(1);
    const examples = [...result.stdout.matchAll(EXAMPLE_LINE)]
      .map((match) => match[1])
      .filter((name) => !name.startsWith("<"));
    expect(examples.length).toBeGreaterThan(0);
    for (const example of examples) {
      const kebab = example.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      for (const path of [
        `packages/ui/src/${kebab}.tsx`,
        `apps/storybook/stories/${kebab}.stories.tsx`,
        `apps/docs/demos/${kebab}`,
        `apps/docs/content/docs/components/${kebab}.mdx`,
      ]) {
        expect(existsSync(join(REPO_ROOT, path)), path).toBe(false);
      }
    }
  });
});
