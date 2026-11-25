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

const PACKAGE = "packages/ui/package.json";
const META = "apps/docs/content/docs/components/meta.json";

/** `Stopped at <path> (<reason>).`, the line for an unusable registry. */
function stoppedLine(path: string, reason: string) {
  return `Stopped at ${path} (${reason}).`;
}

/** Runs the scaffold with `action` done just before the `r+` open of `path`. */
function runBeforeEdit(repo: string, path: string, action: string) {
  return runHooked(
    repo,
    `before("openSync", (path, flags) => is(path, ${JSON.stringify(path)}) && flags === "r+", () => {
${action}
});`
  );
}

/** A late stop: exit 1, the reason, the created list, never "Nothing was written.". */
function expectLateStop(
  result: { status: number | null; stderr: string },
  path: string,
  reason: string,
  created: string[]
) {
  expect(result.status, result.stderr).toBe(1);
  expect(result.stderr).toContain(stoppedLine(path, reason));
  expect(result.stderr).toContain(createdLine(created));
  expect(result.stderr).not.toContain("Nothing was written.");
}

describe("JSON registries: read by their fields", () => {
  // Row 1. A key holding `null` is still a key: the edit must not take it.
  it.each([
    ["exports", (pkg: Record<string, any>) => pkg.exports],
    [
      "publishConfig.exports",
      (pkg: Record<string, any>) => pkg.publishConfig.exports,
    ],
  ] as const)('refuses %s "./scaffold-probe": null', (field, map) => {
    const repo = scratchRepo();
    editJson(repo, PACKAGE, (pkg) => {
      map(pkg)[`./${KEBAB}`] = null;
    });

    expectRefusal(repo, [`${PACKAGE}: ${field} "./${KEBAB}"`]);
  });

  // Row 2. A registry the scaffold cannot read by its fields stops the run
  // before anything is written, with the file and the reason.
  it.each([
    [
      "publishConfig.exports deleted",
      (repo: string) =>
        editJson(repo, PACKAGE, (pkg) => {
          // JSON.stringify drops the undefined member.
          pkg.publishConfig.exports = undefined;
        }),
      PACKAGE,
      "expected publishConfig.exports object",
    ],
    [
      "exports deleted",
      (repo: string) =>
        editJson(repo, PACKAGE, (pkg) => {
          // JSON.stringify drops the undefined member.
          pkg.exports = undefined;
        }),
      PACKAGE,
      "expected exports object",
    ],
    [
      "pages set to a string",
      (repo: string) =>
        editJson(repo, META, (meta) => {
          meta.pages = KEBAB;
        }),
      META,
      "expected pages array of strings",
    ],
    [
      "package.json is just {",
      (repo: string) => put(repo, PACKAGE, "{"),
      PACKAGE,
      "invalid JSON",
    ],
    [
      "meta.json is just {",
      (repo: string) => put(repo, META, "{"),
      META,
      "invalid JSON",
    ],
    [
      "package.json has a duplicate key",
      (repo: string) =>
        edit(repo, PACKAGE, (source) =>
          source.replace(
            '"exports": {',
            '"exports": {\n    "./a": "./x.js",\n    "./a": "./y.js",'
          )
        ),
      PACKAGE,
      "invalid JSON",
    ],
  ] as const)(
    "stops on %s, naming the file and the reason",
    (_label, arrange, path, reason) => {
      const repo = scratchRepo();
      arrange(repo);

      expectRefusal(repo, [stoppedLine(path, reason)]);
    }
  );

  it("still lists the collisions it can read beside an unreadable registry", () => {
    const repo = scratchRepo();
    put(repo, PACKAGE, "{");
    COLLISIONS.story.arrange(repo);
    COLLISIONS["meta.json entry"].arrange(repo);

    expectRefusal(repo, [
      stoppedLine(PACKAGE, "invalid JSON"),
      FILES.story,
      COLLISIONS["meta.json entry"].reported,
    ]);
  });

  // Row 3. An entry saved after the check is the contributor's: the run
  // stops before its own edit, and the saved value survives.
  it.each([
    ["publishConfig.exports", '"./saved.js"'],
    ["exports", "null"],
  ] as const)(
    "stops when %s gains the entry just before the package edit, keeping the save",
    (field, value) => {
      const repo = scratchRepo();
      const before = snapshot(repo);

      const result = runBeforeEdit(
        repo,
        PACKAGE,
        `const pkg = JSON.parse(real.readFileSync(at(${JSON.stringify(PACKAGE)}), "utf8"));
${field === "exports" ? "pkg.exports" : "pkg.publishConfig.exports"}["./${KEBAB}"] = ${value};
real.writeFileSync(at(${JSON.stringify(PACKAGE)}), JSON.stringify(pkg, null, 2) + "\\n");
real.writeFileSync(at("saved-package.json"), JSON.stringify(pkg, null, 2) + "\\n");`
      );

      expectLateStop(
        result,
        PACKAGE,
        "entry appeared after the check",
        ALL_FIVE
      );
      expect(read(repo, PACKAGE)).toBe(read(repo, "saved-package.json"));
      expectTree(before, snapshot(repo), {
        added: [...ALL_FIVE, "saved-package.json"],
        changed: [PACKAGE],
      });
    }
  );

  it("stops when publishConfig.exports is deleted just before the package edit, keeping the save", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = runBeforeEdit(
      repo,
      PACKAGE,
      `const pkg = JSON.parse(real.readFileSync(at(${JSON.stringify(PACKAGE)}), "utf8"));
delete pkg.publishConfig.exports;
real.writeFileSync(at(${JSON.stringify(PACKAGE)}), JSON.stringify(pkg, null, 2) + "\\n");
real.writeFileSync(at("saved-package.json"), JSON.stringify(pkg, null, 2) + "\\n");`
    );

    expectLateStop(
      result,
      PACKAGE,
      "expected publishConfig.exports object",
      ALL_FIVE
    );
    expect(read(repo, PACKAGE)).toBe(read(repo, "saved-package.json"));
    expectTree(before, snapshot(repo), {
      added: [...ALL_FIVE, "saved-package.json"],
      changed: [PACKAGE],
    });
  });

  it("stops when meta.json gains the page just before its edit, keeping the save", () => {
    const repo = scratchRepo();

    const result = runBeforeEdit(
      repo,
      META,
      `const meta = JSON.parse(real.readFileSync(at(${JSON.stringify(META)}), "utf8"));
meta.pages.unshift("${KEBAB}");
real.writeFileSync(at(${JSON.stringify(META)}), JSON.stringify(meta, null, 2) + "\\n");
real.writeFileSync(at("saved-meta.json"), JSON.stringify(meta, null, 2) + "\\n");`
    );

    // The manifest and loader were absent in the scratch tree, so this run
    // created them exclusively before it reached meta.json.
    expectLateStop(result, META, "entry appeared after the check", [
      ...ALL_FIVE,
      "apps/docs/demos/manifest.json",
      "apps/docs/demos/loader.tsx",
    ]);
    expect(read(repo, META)).toBe(read(repo, "saved-meta.json"));
  });

  it("keeps a save to another key that lands just before the package edit", () => {
    const repo = scratchRepo();

    const result = runBeforeEdit(
      repo,
      PACKAGE,
      `const pkg = JSON.parse(real.readFileSync(at(${JSON.stringify(PACKAGE)}), "utf8"));
pkg.publishConfig.exports["./saved"] = "./saved.js";
real.writeFileSync(at(${JSON.stringify(PACKAGE)}), JSON.stringify(pkg, null, 2) + "\\n");`
    );

    expect(result.status, result.stderr).toBe(0);
    const pkg = JSON.parse(read(repo, PACKAGE));
    expect(pkg.publishConfig.exports["./saved"]).toBe("./saved.js");
    expect(pkg.exports[`./${KEBAB}`]).toBe(`./src/${KEBAB}.tsx`);
    expect(pkg.publishConfig.exports[`./${KEBAB}`]).toEqual({
      types: `./dist/${KEBAB}.d.ts`,
      default: `./dist/${KEBAB}.js`,
    });
  });
});

const MANIFEST = "apps/docs/demos/manifest.json";
const LOADER = "apps/docs/demos/loader.tsx";

/** A scratch tree that also holds the checked-in manifest and loader. */
function trackedRepo() {
  const repo = scratchRepo();
  for (const path of [MANIFEST, LOADER]) {
    writeFileSync(join(repo, path), readFileSync(join(REPO_ROOT, path)));
  }
  return repo;
}

/**
 * Runs the scaffold and does `action` once, just before the first positional
 * read at offset 0 of the `r+` descriptor of `path`: the moment after the
 * edit is prepared and before the scaffold writes it.
 */
function runAtFinalCheck(repo: string, path: string, action: string) {
  return runHooked(
    repo,
    `let target;
const open = fs.openSync;
fs.openSync = function (...args) {
  const fd = open.apply(this, args);
  if (is(args[0], ${JSON.stringify(path)}) && args[1] === "r+") {
    target = fd;
  }
  return fd;
};
before("readSync", (fd, _buffer, _offset, _length, position) => target !== undefined && fd === target && position === 0, () => {
${action}
});`
  );
}

/** Hook source: an editor save of `path`, in place or by rename, to `bytes`. */
function editorSave(path: string, change: string, how: "in place" | "rename") {
  return `const saved = (() => {
  const value = JSON.parse(real.readFileSync(at(${JSON.stringify(path)}), "utf8"));
  ${change}
  return JSON.stringify(value, null, 2) + "\\n";
})();
real.writeFileSync(at("saved-copy.json"), saved);
${
  how === "in place"
    ? `real.writeFileSync(at(${JSON.stringify(path)}), saved);`
    : `real.writeFileSync(at(${JSON.stringify(`${path}.editor-tmp`)}), saved);
real.renameSync(at(${JSON.stringify(`${path}.editor-tmp`)}), at(${JSON.stringify(path)}));`
}`;
}

describe("JSON registries: a save after the read stops the edit (rows 11-14)", () => {
  it.each([
    ["in place", '"./saved.js"'],
    ["in place", "null"],
    ["rename", '"./saved.js"'],
  ] as const)(
    "keeps a package save made %s (%s) and edits nothing after it",
    (how, value) => {
      const repo = trackedRepo();
      const before = snapshot(repo);

      const result = runAtFinalCheck(
        repo,
        PACKAGE,
        editorSave(
          PACKAGE,
          `value.publishConfig.exports["./${KEBAB}"] = ${value};`,
          how
        )
      );

      expectLateStop(
        result,
        PACKAGE,
        "registry changed after the read",
        ALL_FIVE
      );
      expect(read(repo, PACKAGE)).toBe(read(repo, "saved-copy.json"));
      expect(
        Object.hasOwn(JSON.parse(read(repo, PACKAGE)).exports, `./${KEBAB}`)
      ).toBe(false);
      expectTree(before, snapshot(repo), {
        added: [...ALL_FIVE, "saved-copy.json"],
        changed: [PACKAGE],
      });
    }
  );

  it.each(["in place", "rename"] as const)(
    "keeps a navigation save made %s, with the earlier registries as a successful run left them",
    (how) => {
      const solo = trackedRepo();
      expect(run(solo, PASCAL).status).toBe(0);
      const repo = trackedRepo();
      const before = snapshot(repo);

      const result = runAtFinalCheck(
        repo,
        META,
        editorSave(META, `value.pages.push("editor-page");`, how)
      );

      expectLateStop(result, META, "registry changed after the read", ALL_FIVE);
      expect(read(repo, META)).toBe(read(repo, "saved-copy.json"));
      const pages = JSON.parse(read(repo, META)).pages;
      expect(pages).toContain("editor-page");
      expect(pages).not.toContain(KEBAB);
      for (const path of [
        PACKAGE,
        "packages/ui/tsup.config.ts",
        "packages/ui/src/_registry.ts",
        MANIFEST,
        LOADER,
      ]) {
        expect(read(repo, path), path).toBe(read(solo, path));
      }
      expectTree(before, snapshot(repo), {
        added: [...ALL_FIVE, "saved-copy.json"],
        changed: [
          PACKAGE,
          "packages/ui/tsup.config.ts",
          "packages/ui/src/_registry.ts",
          MANIFEST,
          LOADER,
          META,
        ],
      });
    }
  );
});

const REVIEW_LINE =
  '  "x-review": {"label": true, "10": "ten", "2": "two", "id": 9007199254740993, "bound": 1e400},';

describe("JSON registries: the edit changes nothing but the new entry", () => {
  it.each([PACKAGE, META])(
    "keeps member order and number text in %s",
    (path) => {
      const solo = scratchRepo();
      expect(run(solo, PASCAL).status).toBe(0);
      const repo = scratchRepo();
      edit(repo, path, (source) =>
        source.replace("{\n", `{\n${REVIEW_LINE}\n`)
      );

      const result = run(repo, PASCAL);

      expect(result.status, result.stderr).toBe(0);
      const after = read(repo, path);
      expect(after).toContain(`\n${REVIEW_LINE}\n`);
      expect(after.replace(`${REVIEW_LINE}\n`, "")).toBe(read(solo, path));
    }
  );
});

describe("JSON registries: bytes that are not UTF-8", () => {
  const META_BYTES = Buffer.concat([
    Buffer.from('{"pages":["caf'),
    Buffer.from([0xe9]),
    Buffer.from('"]}\n'),
  ]);
  const PACKAGE_BYTES = Buffer.concat([
    Buffer.from('{"exports":{},"publishConfig":{"exports":{}},"x":"caf'),
    Buffer.from([0xe9]),
    Buffer.from('"}\n'),
  ]);

  it.each([
    [META, META_BYTES],
    [PACKAGE, PACKAGE_BYTES],
  ] as const)("refuses %s in preflight and keeps its bytes", (path, bytes) => {
    const repo = scratchRepo();
    writeFileSync(join(repo, path), bytes);

    expectRefusal(repo, [stoppedLine(path, "invalid JSON")]);
    expect(readFileSync(join(repo, path)).equals(bytes)).toBe(true);
  });

  it("stops when meta.json turns invalid just before its edit, keeping its bytes", () => {
    const repo = trackedRepo();

    const result = runBeforeEdit(
      repo,
      META,
      `real.writeFileSync(at(${JSON.stringify(META)}), Buffer.from(${JSON.stringify([...META_BYTES])}));`
    );

    expectLateStop(result, META, "invalid JSON", ALL_FIVE);
    expect(readFileSync(join(repo, META)).equals(META_BYTES)).toBe(true);
  });
});

describe("JSON registries: one malformed export map does not hide the other's entry", () => {
  it.each([
    [
      '{"exports":{"./scaffold-probe":null},"publishConfig":{}}\n',
      "expected publishConfig.exports object",
      `${PACKAGE}: exports "./${KEBAB}"`,
    ],
    [
      '{"exports":[],"publishConfig":{"exports":{"./scaffold-probe":null}}}\n',
      "expected exports object",
      `${PACKAGE}: publishConfig.exports "./${KEBAB}"`,
    ],
  ])("reports both for %s", (content, reason, collision) => {
    const repo = scratchRepo();
    put(repo, PACKAGE, content);

    expectRefusal(repo, [stoppedLine(PACKAGE, reason), collision]);
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
