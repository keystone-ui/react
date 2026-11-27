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
  chmodSync,
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
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

/**
 * Runs the scaffold with `action` done just before the edit's open of
 * `path`, matched by access mode: the string "r+" or a numeric O_RDWR open.
 */
function runBeforeEdit(repo: string, path: string, action: string) {
  return runHooked(
    repo,
    `before("openSync", (path, flags) => is(path, ${JSON.stringify(path)}) && (flags === "r+" || (typeof flags === "number" && (flags & fs.constants.O_RDWR) !== 0)), () => {
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
 * The named seams of the JSON registry write (spec-json-write.md). Each is a
 * point in the scaffold's Read, Stage or Publish of `TARGET` where the
 * preload runs the action once:
 *  - before-open: before forwarding the edit's O_RDWR open
 *  - before-first-read: before forwarding the first read of the pinned fd
 *  - between-chunks: after the first snapshot read returned bytes
 *  - snapshot-eof: after the snapshot read that returned 0
 *  - first-staging-write: after the first staging write, forced to 1 byte
 *  - last-staging-write: after the staging write that completes the bytes
 *  - staging-close: after the staging file's close
 *  - before-verify-read: before forwarding the first read at offset 0 of the
 *    pinned fd after the staging close
 *  - after-rename: after the native rename onto TARGET, before it returns
 * `FAIL` injects an error instead: "enospc" fails the staging write after a
 * one-byte first write, "zero" makes the first staging write report 0
 * bytes, "rename-eio" fails the rename onto TARGET; "short" only forces the
 * one-byte first write. The preload records in OUT: `fired` when the action
 * ran, and `live-writes`, the count of writes and cuts the scaffold made on
 * the registry's inode (the original one, or the one at the path then).
 */
const SEAM_PRELOAD = `const { O_RDWR, O_EXCL } = fs.constants;
const isExclusive = (flags) =>
  flags === "wx" || (typeof flags === "number" && (flags & O_EXCL) !== 0);
const { basename, dirname } = await import("node:path");
let editing = false;
let done = false;
let sourceFd;
let stagingFd;
let stagingClosed = false;
let firstRead = true;
let eofSeen = false;
let firstStagingWrite = true;
let liveWrites = 0;
const origin = real.statSync(at(TARGET), { bigint: true });
const isEditOpen = (path, flags) =>
  is(path, TARGET) && typeof flags === "number" && (flags & O_RDWR) !== 0;
const isStaging = (path) =>
  dirname(String(path)) === dirname(at(TARGET)) &&
  basename(String(path)).startsWith("." + basename(TARGET) + ".") &&
  String(path).endsWith(".tmp");
const onLiveInode = (fd) => {
  const own = real.fstatSync(fd, { bigint: true });
  const now = real.existsSync(at(TARGET)) ? real.lstatSync(at(TARGET), { bigint: true }) : null;
  return [origin, now].some((s) => s && s.dev === own.dev && s.ino === own.ino);
};
const act = (seam) => {
  if (done || seam !== SEAM) return;
  done = true;
  editing = true;
  try {
    ACTION();
  } finally {
    editing = false;
  }
  real.writeFileSync(join(OUT, "fired"), SEAM);
};
const wrap = (name, wrapper) => {
  const inner = fs[name];
  fs[name] = function (...args) {
    return editing ? inner.apply(this, args) : wrapper.call(this, inner, args);
  };
};
wrap("openSync", function (inner, args) {
  if (isEditOpen(args[0], args[1])) act("before-open");
  const fd = inner.apply(this, args);
  if (isEditOpen(args[0], args[1])) sourceFd = fd;
  if (isStaging(args[0]) && isExclusive(args[1])) stagingFd = fd;
  return fd;
});
wrap("readSync", function (inner, args) {
  const [fd, , , , position] = args;
  const pinned = sourceFd !== undefined && fd === sourceFd;
  if (pinned && firstRead) act("before-first-read");
  if (pinned && stagingClosed && position === 0) act("before-verify-read");
  const count = inner.apply(this, args);
  if (pinned && !stagingClosed) {
    if (firstRead && count > 0) act("between-chunks");
    if (count === 0 && !eofSeen) {
      eofSeen = true;
      act("snapshot-eof");
    }
    firstRead = false;
  }
  return count;
});
wrap("writeSync", function (inner, args) {
  const [fd, buffer, offset] = args;
  if (stagingFd === undefined || fd !== stagingFd) {
    if (onLiveInode(fd)) liveWrites++;
    return inner.apply(this, args);
  }
  const first = firstStagingWrite;
  firstStagingWrite = false;
  if (FAIL === "zero" && first) return 0;
  if (FAIL === "enospc" && !first) fail("ENOSPC");
  if (first && (SEAM === "first-staging-write" || FAIL === "short" || FAIL === "enospc")) args[3] = 1;
  const count = inner.apply(this, args);
  if (first) act("first-staging-write");
  if (offset + count === buffer.length) act("last-staging-write");
  return count;
});
wrap("ftruncateSync", function (inner, args) {
  if (onLiveInode(args[0])) liveWrites++;
  return inner.apply(this, args);
});
wrap("closeSync", function (inner, args) {
  const result = inner.apply(this, args);
  if (args[0] === sourceFd) sourceFd = undefined;
  if (stagingFd !== undefined && args[0] === stagingFd) {
    stagingFd = undefined;
    stagingClosed = true;
    act("staging-close");
  }
  return result;
});
wrap("renameSync", function (inner, args) {
  if (FAIL === "rename-eio" && is(args[1], TARGET)) fail("EIO");
  const result = inner.apply(this, args);
  if (is(args[1], TARGET)) act("after-rename");
  return result;
});
process.on("exit", () => {
  real.writeFileSync(join(OUT, "live-writes"), String(liveWrites));
});
`;

type Seam =
  | "before-open"
  | "before-first-read"
  | "between-chunks"
  | "snapshot-eof"
  | "first-staging-write"
  | "last-staging-write"
  | "staging-close"
  | "before-verify-read"
  | "after-rename"
  | "none";

/** Runs the scaffold with SEAM_PRELOAD on `path`; `out` holds the preload's records. */
function runAtSeam(
  repo: string,
  path: string,
  seam: Seam,
  action = "",
  fail = ""
) {
  const out = tempDir("ks-add-component-out-");
  const extra = `const TARGET = ${JSON.stringify(path)};
const SEAM = ${JSON.stringify(seam)};
const FAIL = ${JSON.stringify(fail)};
const OUT = ${JSON.stringify(out)};
`;
  const hook = hookFile(
    repo,
    `const ACTION = () => {\n${action}\n};\n${SEAM_PRELOAD}`,
    extra
  );
  const result = spawnSync(
    process.execPath,
    ["--import", hook, join(repo, "scripts/add-component.mjs"), PASCAL],
    { encoding: "utf8", timeout: 30_000 }
  );
  return {
    result,
    out,
    fired: existsSync(join(out, "fired")),
    liveWrites: Number(readFileSync(join(out, "live-writes"), "utf8")),
    saved: () => readFileSync(join(out, "saved.json"), "utf8"),
  };
}

/**
 * Hook source: an editor save of `path` computed from its current text by
 * `change` (on `value`), in place or by a sibling renamed over it. The
 * saved bytes also go to OUT/saved.json.
 */
function editorSaveAction(
  path: string,
  change: string,
  how: "in place" | "rename"
) {
  return `const value = JSON.parse(real.readFileSync(at(${JSON.stringify(path)}), "utf8"));
${change}
const saved = JSON.stringify(value, null, 2) + "\\n";
real.writeFileSync(join(OUT, "saved.json"), saved);
${
  how === "in place"
    ? `real.writeFileSync(at(${JSON.stringify(path)}), saved);`
    : `real.writeFileSync(at(${JSON.stringify(`${path}.editor-tmp`)}), saved);
real.renameSync(at(${JSON.stringify(`${path}.editor-tmp`)}), at(${JSON.stringify(path)}));`
}`;
}

/** Hook source: `bytes` written in place over `path`, and to OUT/saved.json. */
function installAction(path: string, bytes: Buffer) {
  return `const bytes = Buffer.from(${JSON.stringify(bytes.toString("base64"))}, "base64");
real.writeFileSync(join(OUT, "saved.json"), bytes);
real.writeFileSync(at(${JSON.stringify(path)}), bytes);`;
}

/** Seams from snapshot EOF up to the gap (rows 11 to 14). */
const LATE_SEAMS: Seam[] = [
  "snapshot-eof",
  "first-staging-write",
  "last-staging-write",
  "staging-close",
  "before-verify-read",
];
const METHODS = ["in place", "rename"] as const;
const EARLIER_THAN_META = [
  PACKAGE,
  "packages/ui/tsup.config.ts",
  "packages/ui/src/_registry.ts",
  MANIFEST,
  LOADER,
];
const DRIFT = "registry changed after the read";
/** An unrelated editor change to each JSON registry. */
const UNRELATED: Record<string, string> = {
  [PACKAGE]: `value["x-editor-note"] = "saved by an editor";`,
  [META]: `value.pages.push("editor-page");`,
};

function registrations(text: string, path: string) {
  const key = path === META ? `"${KEBAB}"` : `"./${KEBAB}"`;
  return text.split(key).length - 1;
}

/** Every key in the matrix, crossed. */
function cross<A, B>(as: readonly A[], bs: readonly B[]): [A, B][] {
  return as.flatMap((a) => bs.map((b): [A, B] => [a, b]));
}

describe("JSON registries: a save at a late seam stops the publish (rows 11-14)", () => {
  it.each(
    cross(cross(LATE_SEAMS, METHODS), ['"./saved.js"', "null"]).map(
      ([[seam, how], value]) => [seam, how, value] as const
    )
  )("row 11/12: package saved at %s, %s, to %s", (seam, how, value) => {
    const repo = trackedRepo();
    const before = snapshot(repo);

    const seamRun = runAtSeam(
      repo,
      PACKAGE,
      seam,
      editorSaveAction(
        PACKAGE,
        `value.publishConfig.exports["./${KEBAB}"] = ${value};`,
        how
      )
    );

    expect(seamRun.fired, "the save ran").toBe(true);
    expect(seamRun.liveWrites, "writes or cuts on the live inode").toBe(0);
    expectLateStop(seamRun.result, PACKAGE, DRIFT, ALL_FIVE);
    expect(read(repo, PACKAGE)).toBe(seamRun.saved());
    const pkg = JSON.parse(read(repo, PACKAGE));
    expect(Object.hasOwn(pkg.exports, `./${KEBAB}`)).toBe(false);
    expect(pkg.publishConfig.exports[`./${KEBAB}`]).toEqual(JSON.parse(value));
    expectTree(before, snapshot(repo), {
      added: ALL_FIVE,
      changed: [PACKAGE],
    });
  });

  it.each(cross(LATE_SEAMS, METHODS))(
    "row 13/14: navigation saved at %s, %s",
    (seam, how) => {
      const solo = trackedRepo();
      expect(run(solo, PASCAL).status).toBe(0);
      const repo = trackedRepo();
      const before = snapshot(repo);

      const seamRun = runAtSeam(
        repo,
        META,
        seam,
        editorSaveAction(META, UNRELATED[META], how)
      );

      expect(seamRun.fired, "the save ran").toBe(true);
      expect(seamRun.liveWrites, "writes or cuts on the live inode").toBe(0);
      expectLateStop(seamRun.result, META, DRIFT, ALL_FIVE);
      expect(read(repo, META)).toBe(seamRun.saved());
      const pages = JSON.parse(read(repo, META)).pages;
      expect(pages).toContain("editor-page");
      expect(pages).not.toContain(KEBAB);
      for (const path of EARLIER_THAN_META) {
        expect(read(repo, path), path).toBe(read(solo, path));
      }
      expectTree(before, snapshot(repo), {
        added: ALL_FIVE,
        changed: [...EARLIER_THAN_META, META],
      });
    }
  );
});

describe("JSON registries: a save before or during the snapshot (row 15)", () => {
  // The snapshot sees an in-place save made before the first read, so the
  // edit merges it. A rename leaves the pinned fd on the old file, and a
  // save between chunks leaves a snapshot that is neither file: both drift.
  const cases = [
    ["before-open", "in place", 0],
    ["before-open", "rename", 0],
    ["before-first-read", "in place", 0],
    ["before-first-read", "rename", 1],
    ["between-chunks", "in place", 1],
    ["between-chunks", "rename", 1],
  ] as const;

  it.each(
    cross([PACKAGE, META], cases).map(
      ([path, [seam, how, exit]]) => [path, seam, how, exit] as const
    )
  )("%s: unrelated save at %s, %s, exits %s", (path, seam, how, exit) => {
    const repo = trackedRepo();

    const seamRun = runAtSeam(
      repo,
      path,
      seam,
      editorSaveAction(path, UNRELATED[path], how)
    );

    expect(seamRun.fired, "the save ran").toBe(true);
    expect(seamRun.liveWrites, "writes or cuts on the live inode").toBe(0);
    const live = read(repo, path);
    if (exit === 0) {
      expect(seamRun.result.status, seamRun.result.stderr).toBe(0);
      expect(seamRun.result.stderr).toBe("");
      expect(registrations(live, path)).toBe(path === META ? 1 : 2);
      expect(live).toContain(path === META ? '"editor-page"' : "x-editor-note");
    } else {
      expectLateStop(seamRun.result, path, DRIFT, ALL_FIVE);
      expect(live).toBe(seamRun.saved());
    }
  });

  it.each([
    [PACKAGE, `value.publishConfig.exports["./${KEBAB}"] = "./saved.js";`],
    [META, `value.pages.push("${KEBAB}");`],
  ])(
    "%s: a captured save of the target entry is entry appeared after the check",
    (path, change) => {
      const repo = trackedRepo();

      const seamRun = runAtSeam(
        repo,
        path,
        "before-first-read",
        editorSaveAction(path, change, "in place")
      );

      expect(seamRun.fired).toBe(true);
      expectLateStop(
        seamRun.result,
        path,
        "entry appeared after the check",
        ALL_FIVE
      );
      expect(read(repo, path)).toBe(seamRun.saved());
    }
  );
});

describe("JSON registries: staging writes and the rename fail (row 16)", () => {
  it.each([PACKAGE, META])(
    "%s: a one-byte first staging write still completes the registration",
    (path) => {
      const solo = trackedRepo();
      expect(run(solo, PASCAL).status).toBe(0);
      const repo = trackedRepo();

      const seamRun = runAtSeam(repo, path, "none", "", "short");

      expect(seamRun.result.status, seamRun.result.stderr).toBe(0);
      expect(seamRun.result.stderr).toBe("");
      expect(read(repo, path)).toBe(read(solo, path));
    }
  );

  it.each(
    cross([PACKAGE, META], [
      ["enospc", "ENOSPC"],
      ["zero", "EIO"],
      ["rename-eio", "EIO"],
    ] as const).map(([path, [fail, code]]) => [path, fail, code] as const)
  )("%s: %s stops with %s and keeps the registry", (path, fail, code) => {
    const solo = trackedRepo();
    expect(run(solo, PASCAL).status).toBe(0);
    const repo = trackedRepo();
    const before = snapshot(repo);

    const seamRun = runAtSeam(repo, path, "none", "", fail);

    expect(seamRun.liveWrites).toBe(0);
    expectStop(seamRun.result, path, code, ALL_FIVE);
    const earlier = path === META ? EARLIER_THAN_META : [];
    for (const other of earlier) {
      expect(read(repo, other), other).toBe(read(solo, other));
    }
    // The registry keeps its bytes; the staging file is gone.
    expectTree(before, snapshot(repo), { added: ALL_FIVE, changed: earlier });
  });
});

describe("JSON registries: a save after the rename is the editor's (row 17)", () => {
  it.each(cross([PACKAGE, META], METHODS))(
    "%s: edited %s right after the rename",
    (path, how) => {
      const repo = trackedRepo();

      const seamRun = runAtSeam(
        repo,
        path,
        "after-rename",
        editorSaveAction(path, UNRELATED[path], how)
      );

      expect(seamRun.fired).toBe(true);
      expect(seamRun.result.status, seamRun.result.stderr).toBe(0);
      expect(seamRun.result.stderr).toBe("");
      expect(read(repo, path)).toBe(seamRun.saved());
      expect(registrations(seamRun.saved(), path)).toBe(path === META ? 1 : 2);
    }
  );
});

describe("JSON registries: deep nesting (row 18)", () => {
  const DEPTH = 2048;
  const nested = (leaf: string) =>
    `${"[".repeat(DEPTH)}${leaf}${"]".repeat(DEPTH)}`;
  const document = (path: string, leaf: string) =>
    Buffer.from(
      `${path === META ? '{"pages":[],"x":' : '{"exports":{},"publishConfig":{"exports":{}},"x":'}${nested(leaf)}}\n`
    );
  const DUPLICATE = '{"dup":0,"\\u0064up":1}';

  it.each(cross([PACKAGE, META], ["preflight", "before-open"] as const))(
    "%s: 2,048 nested arrays installed at %s are kept and registered",
    (path, when) => {
      const repo = trackedRepo();
      const bytes = document(path, "0");
      let result: ReturnType<typeof run>;
      if (when === "preflight") {
        writeFileSync(join(repo, path), bytes);
        result = run(repo, PASCAL);
      } else {
        const seamRun = runAtSeam(
          repo,
          path,
          "before-open",
          installAction(path, bytes)
        );
        expect(seamRun.fired).toBe(true);
        result = seamRun.result;
      }

      expect(result.status, result.stderr).toBe(0);
      expect(result.stderr).toBe("");
      const live = read(repo, path);
      expect(live).toContain(`"x":${nested("0")}}`);
      expect(registrations(live, path)).toBe(path === META ? 1 : 2);
      expect(() => JSON.parse(live)).not.toThrow();
    }
  );

  it.each([PACKAGE, META])(
    "%s: a decoded duplicate key deep inside stops preflight with invalid JSON",
    (path) => {
      const repo = trackedRepo();
      const bytes = document(path, DUPLICATE);
      writeFileSync(join(repo, path), bytes);

      expectRefusal(repo, [stoppedLine(path, "invalid JSON")]);
      expect(readFileSync(join(repo, path)).equals(bytes)).toBe(true);
    }
  );

  it.each([PACKAGE, META])(
    "%s: a decoded duplicate key deep inside, installed before the edit open, stops late",
    (path) => {
      const repo = trackedRepo();
      const bytes = document(path, DUPLICATE);

      const seamRun = runAtSeam(
        repo,
        path,
        "before-open",
        installAction(path, bytes)
      );

      expect(seamRun.fired).toBe(true);
      expectLateStop(seamRun.result, path, "invalid JSON", ALL_FIVE);
      expect(readFileSync(join(repo, path)).equals(bytes)).toBe(true);
    }
  );
});

describe("JSON registries: symlinks, modes and the staging file", () => {
  const REFERENT = "packages/ui/package.real.json";
  const LINK_ACTION = `real.renameSync(at(${JSON.stringify(PACKAGE)}), at(${JSON.stringify(REFERENT)}));
real.symlinkSync("package.real.json", at(${JSON.stringify(PACKAGE)}));`;

  it("refuses a symlinked registry in preflight and keeps its referent", () => {
    const repo = trackedRepo();
    const bytes = readFileSync(join(repo, PACKAGE));
    renameSync(join(repo, PACKAGE), join(repo, REFERENT));
    symlinkSync("package.real.json", join(repo, PACKAGE));

    expectRefusal(repo, [stoppedLine(PACKAGE, "symlinked registry")]);
    expect(readFileSync(join(repo, REFERENT)).equals(bytes)).toBe(true);
  });

  it("stops at a registry made a symlink just before the edit open, keeping the referent", () => {
    const repo = trackedRepo();
    const bytes = readFileSync(join(repo, PACKAGE));

    const seamRun = runAtSeam(repo, PACKAGE, "before-open", LINK_ACTION);

    expect(seamRun.fired).toBe(true);
    expectLateStop(seamRun.result, PACKAGE, "symlinked registry", ALL_FIVE);
    expect(lstatSync(join(repo, PACKAGE)).isSymbolicLink()).toBe(true);
    expect(readFileSync(join(repo, REFERENT)).equals(bytes)).toBe(true);
  });

  it.each([PACKAGE, META])(
    "%s keeps its permission bits through the replacement",
    (path) => {
      const repo = trackedRepo();
      chmodSync(join(repo, path), 0o640);

      const result = run(repo, PASCAL);

      expect(result.status, result.stderr).toBe(0);
      expect(statSync(join(repo, path)).mode % 0o1_0000).toBe(0o640);
    }
  );

  it("keeps and lists a staging file someone edited, and leaves the registry", () => {
    const repo = trackedRepo();
    const before = snapshot(repo);
    const dir = dirname(PACKAGE);

    const seamRun = runAtSeam(
      repo,
      PACKAGE,
      "staging-close",
      `const name = real.readdirSync(at(${JSON.stringify(dir)})).find((n) => n.startsWith(".package.json.") && n.endsWith(".tmp"));
real.appendFileSync(at(${JSON.stringify(dir)} + "/" + name), "edited\\n");
real.writeFileSync(join(OUT, "staging"), ${JSON.stringify(dir)} + "/" + name);`
    );

    expect(seamRun.fired).toBe(true);
    const staging = readFileSync(join(seamRun.out, "staging"), "utf8");
    expectLateStop(seamRun.result, PACKAGE, "staging file changed", [
      ...ALL_FIVE,
      staging,
    ]);
    expect(read(repo, staging).endsWith("edited\n")).toBe(true);
    expectTree(before, snapshot(repo), { added: [...ALL_FIVE, staging] });
  });
});

/**
 * A preload for the staging-file cases (review round 3). It follows
 * TARGET's staging file from its exclusive open and does what CASE names,
 * once:
 *  - enospc-first: fail the first staging write with ENOSPC
 *  - replace-at-cleanup: as enospc-first, then put a different file (NOTE)
 *    at the staging name just before the call that removes or moves it
 *  - chgrp: after the staging writer closes, give the staging file another
 *    of this user's groups
 *  - append-after-short: force the first staging write to one byte, then
 *    append NOTE to the staging file
 *  - eio-first-fstat: fail the first fstat of the staging descriptor
 *  - umask: run under umask 0277, then as enospc-first
 *  - taken-name: put NOTE at the staging name just before its open
 *  - eio-verify-read / eio-verify-close: fail the first read, or the close
 *    after it released the descriptor, of the publish check's open of the
 *    staging file
 *  - fifo-at-staging: after the staging writer closes, rename the FIFO at
 *    FIFO over the staging name
 *  - parse-before-stage: record whether JSON.parse saw the complete text of
 *    the first staging write before the staging file was created
 * OUT/staging holds the staging name, OUT/fired is written when the case's
 * action ran, OUT/renamed-onto-target when a rename onto TARGET ran.
 */
const STAGING_PRELOAD = `const { O_EXCL, O_RDWR } = fs.constants;
const { basename, dirname, relative } = await import("node:path");
let stagingPath;
let stagingFd;
let stagingClosed = false;
let verifyFd;
let writes = 0;
let sourceOpen = false;
let done = false;
const parsed = new Set();
const once = () => {
  if (done) return false;
  done = true;
  real.writeFileSync(join(OUT, "fired"), CASE);
  return true;
};
const isStaging = (path) =>
  dirname(String(path)) === dirname(at(TARGET)) &&
  basename(String(path)).startsWith("." + basename(TARGET) + ".") &&
  String(path).endsWith(".tmp");
const exclusive = (flags) =>
  flags === "wx" || (typeof flags === "number" && (flags & O_EXCL) !== 0);
if (CASE === "umask") process.umask(0o277);
if (CASE === "parse-before-stage") {
  const parse = JSON.parse;
  JSON.parse = function (text, ...rest) {
    const value = parse.call(this, text, ...rest);
    if (sourceOpen && stagingPath === undefined) parsed.add(text);
    return value;
  };
}
const wrap = (name, wrapper) => {
  const inner = fs[name];
  fs[name] = function (...args) {
    return wrapper.call(this, inner, args);
  };
};
const replaceAtCleanup = () => {
  if (CASE !== "replace-at-cleanup" || !once()) return;
  real.writeFileSync(stagingPath + ".replacement", NOTE);
  real.renameSync(stagingPath + ".replacement", stagingPath);
};
wrap("openSync", function (inner, args) {
  const [path, flags] = args;
  if (is(path, TARGET) && typeof flags === "number" && (flags & O_RDWR) !== 0) sourceOpen = true;
  if (isStaging(path) && exclusive(flags)) {
    stagingPath = String(path);
    real.writeFileSync(join(OUT, "staging"), relative(ROOT, stagingPath));
    if (CASE === "taken-name" && once()) real.writeFileSync(stagingPath, NOTE);
    stagingFd = inner.apply(this, args);
    return stagingFd;
  }
  const fd = inner.apply(this, args);
  if (stagingClosed && String(path) === stagingPath && verifyFd === undefined) verifyFd = fd;
  return fd;
});
wrap("fstatSync", function (inner, args) {
  if (CASE === "eio-first-fstat" && stagingFd !== undefined && args[0] === stagingFd && once()) fail("EIO");
  return inner.apply(this, args);
});
wrap("readSync", function (inner, args) {
  if (CASE === "eio-verify-read" && typeof verifyFd === "number" && args[0] === verifyFd && once()) fail("EIO");
  return inner.apply(this, args);
});
wrap("writeSync", function (inner, args) {
  if (stagingFd === undefined || args[0] !== stagingFd) return inner.apply(this, args);
  writes++;
  if (writes === 1 && CASE === "parse-before-stage") {
    real.writeFileSync(join(OUT, "parsed"), String(parsed.has(Buffer.from(args[1]).toString("utf8"))));
  }
  if (writes === 1 && ["enospc-first", "umask", "replace-at-cleanup"].includes(CASE)) fail("ENOSPC");
  if (writes === 1 && CASE === "append-after-short") {
    args[3] = 1;
    const count = inner.apply(this, args);
    if (once()) real.appendFileSync(stagingPath, NOTE);
    return count;
  }
  return inner.apply(this, args);
});
wrap("closeSync", function (inner, args) {
  const [fd] = args;
  const result = inner.apply(this, args);
  if (stagingFd !== undefined && fd === stagingFd) {
    stagingFd = undefined;
    stagingClosed = true;
    if (CASE === "chgrp" && once()) {
      const own = real.statSync(stagingPath).gid;
      const other = process.getgroups().find((gid) => gid !== own);
      real.chownSync(stagingPath, process.getuid(), other);
    }
    if (CASE === "fifo-at-staging" && once()) real.renameSync(FIFO, stagingPath);
  }
  if (typeof verifyFd === "number" && fd === verifyFd) {
    verifyFd = null;
    if (CASE === "eio-verify-close" && once()) fail("EIO");
  }
  return result;
});
wrap("unlinkSync", function (inner, args) {
  if (String(args[0]) === stagingPath) replaceAtCleanup();
  return inner.apply(this, args);
});
wrap("renameSync", function (inner, args) {
  if (is(args[1], TARGET)) real.writeFileSync(join(OUT, "renamed-onto-target"), "");
  if (String(args[0]) === stagingPath && !is(args[1], TARGET)) replaceAtCleanup();
  return inner.apply(this, args);
});
`;

const NOTE = "editor note\n";

type StagingCase =
  | "enospc-first"
  | "replace-at-cleanup"
  | "chgrp"
  | "append-after-short"
  | "eio-first-fstat"
  | "umask"
  | "taken-name"
  | "eio-verify-read"
  | "eio-verify-close"
  | "fifo-at-staging"
  | "parse-before-stage";

/** Runs the scaffold with STAGING_PRELOAD doing `kase` on `path`. */
function runStagingCase(
  repo: string,
  path: string,
  kase: StagingCase,
  { fifo = "", timeout = 30_000 } = {}
) {
  const out = tempDir("ks-add-component-out-");
  const hook = hookFile(
    repo,
    STAGING_PRELOAD,
    `const TARGET = ${JSON.stringify(path)};
const CASE = ${JSON.stringify(kase)};
const OUT = ${JSON.stringify(out)};
const NOTE = ${JSON.stringify(NOTE)};
const FIFO = ${JSON.stringify(fifo)};
`
  );
  const result = spawnSync(
    process.execPath,
    ["--import", hook, join(repo, "scripts/add-component.mjs"), PASCAL],
    { encoding: "utf8", timeout }
  );
  const record = (name: string) =>
    existsSync(join(out, name))
      ? readFileSync(join(out, name), "utf8")
      : undefined;
  return {
    result,
    fired: record("fired") !== undefined,
    staging: record("staging") ?? "",
    parsed: record("parsed"),
    renamedOntoTarget: record("renamed-onto-target") !== undefined,
  };
}

/** A named pipe at `path`; mkfifo(1) is on macOS and Linux. */
function makeFifo(path: string) {
  const made = spawnSync("mkfifo", [path], { encoding: "utf8" });
  expect(made.status, made.stderr).toBe(0);
}

/**
 * The access control list entry "nobody may read" on `file`, or false where
 * this machine cannot set one (no setfacl, or a file system without ACLs).
 */
function denyNobodyRead(file: string) {
  const set =
    process.platform === "darwin"
      ? spawnSync("/bin/chmod", ["+a", "user:nobody deny read", file])
      : spawnSync("setfacl", ["-m", "u:nobody:---", file]);
  return set.status === 0;
}

/** Whether this machine can set the entry at all, tried on a throwaway file. */
const ACL_SETTABLE = (() => {
  const dir = mkdtempSync(join(tmpdir(), "ks-add-component-acl-"));
  try {
    const file = join(dir, "probe");
    writeFileSync(file, "");
    return denyNobodyRead(file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})();

function aclText(file: string) {
  return process.platform === "darwin"
    ? spawnSync("/bin/ls", ["-lde", file], { encoding: "utf8" }).stdout
    : spawnSync("getfacl", ["--omit-header", file], { encoding: "utf8" })
        .stdout;
}

/** Registries the scaffold edits before `path`, which a late stop at it keeps edited. */
const earlierThan = (path: string) => (path === META ? EARLIER_THAN_META : []);

describe("JSON registries: another output is never the live registry (review r3 finding 1)", () => {
  it.each([
    [PACKAGE, "symlink"],
    [META, "symlink"],
    [META, "hard link"],
  ] as const)(
    "stops at a manifest that is a %s %s, writing nothing through it",
    (path, kind) => {
      const solo = trackedRepo();
      expect(run(solo, PASCAL).status).toBe(0);
      const repo = trackedRepo();
      const manifest = join(repo, MANIFEST);
      rmSync(manifest);
      if (kind === "symlink") {
        symlinkSync(relative(dirname(manifest), join(repo, path)), manifest);
      } else {
        linkSync(join(repo, path), manifest);
      }
      const original = readFileSync(join(repo, path));

      const seamRun = runAtSeam(repo, path, "none");

      expect(seamRun.liveWrites, "writes or cuts on the registry").toBe(0);
      expectLateStop(
        seamRun.result,
        MANIFEST,
        `same file as ${path}`,
        ALL_FIVE
      );
      // The package was already replaced, as in a successful run; meta.json
      // comes after the manifest and keeps its bytes.
      if (path === PACKAGE) {
        expect(read(repo, PACKAGE)).toBe(read(solo, PACKAGE));
      } else {
        expect(readFileSync(join(repo, META)).equals(original)).toBe(true);
      }
    }
  );
});

describe("JSON registries: the access control list survives (review r3 finding 2)", () => {
  it.skipIf(!ACL_SETTABLE).each([PACKAGE, META])(
    "%s with an ACL stops before publishing and keeps the list",
    (path) => {
      const repo = trackedRepo();
      const file = join(repo, path);
      expect(denyNobodyRead(file)).toBe(true);
      const bytes = readFileSync(file);
      const acl = aclText(file);
      expect(acl).toContain("nobody");

      const result = run(repo, PASCAL);

      expectLateStop(
        result,
        path,
        "access control list would not be kept",
        ALL_FIVE
      );
      expect(readFileSync(file).equals(bytes)).toBe(true);
      expect(aclText(file)).toBe(acl);
    }
  );
});

describe("JSON registries: cleanup removes only its own unmodified staging file (review r3 findings 3 and 5)", () => {
  it.each([PACKAGE, META])(
    "%s: a file put at the staging name just before cleanup is kept and listed",
    (path) => {
      const repo = trackedRepo();
      const before = snapshot(repo);

      const staged = runStagingCase(repo, path, "replace-at-cleanup");

      expect(staged.fired, "the replacement ran").toBe(true);
      expectStop(staged.result, path, "ENOSPC", [...ALL_FIVE, staged.staging]);
      expect(read(repo, staged.staging)).toBe(NOTE);
      expectTree(before, snapshot(repo), {
        added: [...ALL_FIVE, staged.staging],
        changed: earlierThan(path),
      });
    }
  );

  // Needs a second group of this user to change the staging file to.
  it.skipIf((process.getgroups?.() ?? []).length < 2).each([PACKAGE, META])(
    "%s: a staging file whose group changed is kept and listed",
    (path) => {
      const repo = trackedRepo();
      const before = snapshot(repo);

      const staged = runStagingCase(repo, path, "chgrp");

      expect(staged.fired, "the group change ran").toBe(true);
      expectLateStop(staged.result, path, "staging file changed", [
        ...ALL_FIVE,
        staged.staging,
      ]);
      expectTree(before, snapshot(repo), {
        added: [...ALL_FIVE, staged.staging],
        changed: earlierThan(path),
      });
    }
  );

  it.each([PACKAGE, META])(
    "%s: an I/O error on the staging file's first fstat still removes it",
    (path) => {
      const repo = trackedRepo();
      const before = snapshot(repo);

      const staged = runStagingCase(repo, path, "eio-first-fstat");

      expect(staged.fired).toBe(true);
      expectStop(staged.result, path, "EIO", ALL_FIVE);
      expectTree(before, snapshot(repo), {
        added: ALL_FIVE,
        changed: earlierThan(path),
      });
    }
  );

  it.each([PACKAGE, META])(
    "%s: under umask 0277 a failed first write still removes the 0400 staging file",
    (path) => {
      const repo = trackedRepo();
      mkdirSync(join(repo, DEMO_DIR));
      const before = snapshot(repo);
      const created = ALL_FIVE.filter((entry) => entry !== DEMO_DIR);

      const staged = runStagingCase(repo, path, "umask");

      expectStop(staged.result, path, "ENOSPC", created);
      expectTree(before, snapshot(repo), {
        added: created,
        changed: earlierThan(path),
      });
    }
  );

  it.each([PACKAGE, META])(
    "%s: a taken staging name stops at that name and keeps its file",
    (path) => {
      const repo = trackedRepo();
      const bytes = readFileSync(join(repo, path));

      const staged = runStagingCase(repo, path, "taken-name");

      expect(staged.fired).toBe(true);
      expectStop(staged.result, staged.staging, "EEXIST", ALL_FIVE);
      expect(read(repo, staged.staging)).toBe(NOTE);
      expect(readFileSync(join(repo, path)).equals(bytes)).toBe(true);
    }
  );
});

describe("JSON registries: a short staging write never overwrites (review r3 finding 4)", () => {
  it.each([PACKAGE, META])(
    "%s: bytes appended to the staging file after a one-byte write survive",
    (path) => {
      const repo = trackedRepo();
      const before = snapshot(repo);

      const staged = runStagingCase(repo, path, "append-after-short");

      expect(staged.fired).toBe(true);
      expectLateStop(staged.result, path, "staging file changed", [
        ...ALL_FIVE,
        staged.staging,
      ]);
      expect(read(repo, staged.staging).slice(1, 1 + NOTE.length)).toBe(NOTE);
      expectTree(before, snapshot(repo), {
        added: [...ALL_FIVE, staged.staging],
        changed: earlierThan(path),
      });
    }
  );
});

describe("JSON registries: the publish check stops on I/O errors (review r3 finding 6)", () => {
  it.each(
    cross([PACKAGE, META], ["eio-verify-read", "eio-verify-close"] as const)
  )("%s: %s stops with EIO and publishes nothing", (path, kase) => {
    const repo = trackedRepo();
    const before = snapshot(repo);

    const staged = runStagingCase(repo, path, kase);

    expect(staged.fired).toBe(true);
    expect(staged.renamedOntoTarget, "rename onto the registry").toBe(false);
    expectStop(staged.result, path, "EIO", ALL_FIVE);
    expectTree(before, snapshot(repo), {
      added: ALL_FIVE,
      changed: earlierThan(path),
    });
  });
});

describe("JSON registries: a named pipe never blocks the run (review r3 finding 7)", () => {
  it.each([PACKAGE, META])(
    "%s: a FIFO put at the staging name is reported, not read",
    (path) => {
      const repo = trackedRepo();
      const bytes = readFileSync(join(repo, path));
      const fifo = join(tempDir("ks-add-component-fifo-"), "pipe");
      makeFifo(fifo);

      const staged = runStagingCase(repo, path, "fifo-at-staging", {
        fifo,
        timeout: 10_000,
      });

      expect(staged.fired).toBe(true);
      expectLateStop(staged.result, path, "staging file changed", [
        ...ALL_FIVE,
        staged.staging,
      ]);
      expect(lstatSync(join(repo, staged.staging)).isFIFO()).toBe(true);
      expect(readFileSync(join(repo, path)).equals(bytes)).toBe(true);
    }
  );

  it.each([PACKAGE, META])(
    "%s: a FIFO at the registry stops preflight",
    (path) => {
      const repo = trackedRepo();
      rmSync(join(repo, path));
      makeFifo(join(repo, path));

      const result = spawnSync(
        process.execPath,
        [join(repo, "scripts/add-component.mjs"), PASCAL],
        { encoding: "utf8", timeout: 10_000 }
      );

      expect(result.status, result.stderr).toBe(1);
      expect(result.stderr).toContain(stoppedLine(path, "not a regular file"));
      expect(result.stderr).toContain("Nothing was written.");
      for (const created of ALL_FIVE) {
        expect(existsSync(join(repo, created)), created).toBe(false);
      }
    }
  );
});

describe("JSON registries: the complete result is parsed before staging (review r3 finding 8)", () => {
  it.each([PACKAGE, META])("%s", (path) => {
    const repo = trackedRepo();

    const staged = runStagingCase(repo, path, "parse-before-stage");

    expect(staged.result.status, staged.result.stderr).toBe(0);
    expect(staged.parsed).toBe("true");
  });
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
