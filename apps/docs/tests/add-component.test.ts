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
import { basename, dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const REPO_ROOT = join(import.meta.dirname, "../../..");

/** Files the scaffold needs, copied verbatim. */
const COPIED = [
  "scripts/add-component.mjs",
  "scripts/gen-demos.mjs",
  "scripts/lib/demo-entries.mjs",
  "scripts/lib/ts-registry.mjs",
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

  // The rescan fixes the manifest and loader inputs, so it must map the key
  // the new MDX page previews to the demo this run wrote, before any
  // registry is edited.
  it.each([
    [
      "removed",
      `real.unlinkSync(at(${JSON.stringify(FILES.demo)}));`,
      [],
      false,
    ],
    [
      "moved to another path with the same key",
      `real.mkdirSync(at("apps/docs/demos/scaffold"));
real.renameSync(at(${JSON.stringify(FILES.demo)}), at("apps/docs/demos/scaffold/probe-default.tsx"));`,
      [
        "apps/docs/demos/scaffold",
        "apps/docs/demos/scaffold/probe-default.tsx",
      ],
      false,
    ],
    [
      "replaced by a symlink to a regular file",
      `real.renameSync(at(${JSON.stringify(FILES.demo)}), at("moved-demo.tsx"));
real.symlinkSync(at("moved-demo.tsx"), at(${JSON.stringify(FILES.demo)}));`,
      ["moved-demo.tsx"],
      true,
    ],
  ] as const)(
    "stops before any registry edit when the new demo is %s after its close",
    (_label, action, foreign, demoPathLeft) => {
      const repo = scratchRepo();
      const before = snapshot(repo);

      const result = runHooked(
        repo,
        `before("openSync", (path) => is(path, ${JSON.stringify(FILES.mdx)}), () => {
${action}
});`
      );

      expect(result.status, result.stderr).toBe(1);
      expect(result.stderr).toContain(
        `Stopped at ${FILES.demo} (demo key "${KEBAB}-default" not in the rescan).`
      );
      expect(result.stderr).toContain(createdLine(ALL_FIVE));
      expect(result.stderr).not.toContain("Nothing was written.");
      expect(result.stdout).not.toContain("✓ packages/ui/package.json");
      for (const path of foreign.filter((p) => p.endsWith(".tsx"))) {
        expect(read(repo, path)).toContain(
          `export default function ${PASCAL}Default()`
        );
      }
      const after = snapshot(repo);
      expect(after).not.toHaveProperty("apps/docs/demos/manifest.json");
      expect(after).not.toHaveProperty("apps/docs/demos/loader.tsx");
      expectTree(before, after, {
        added: [
          ...ALL_FIVE.filter((path) => demoPathLeft || path !== FILES.demo),
          ...foreign,
        ],
      });
    }
  );

  it("stops before any registry edit when gen-demos keys the new demo another way", () => {
    // `blocks/default.tsx` is the block key "block-default", not the
    // "blocks-default" the new page previews.
    const repo = scratchRepo();
    const before = snapshot(repo);
    const created = [
      "packages/ui/src/blocks.tsx",
      "apps/storybook/stories/blocks.stories.tsx",
      "apps/docs/demos/blocks",
      "apps/docs/demos/blocks/default.tsx",
      "apps/docs/content/docs/components/blocks.mdx",
    ];

    const result = run(repo, "Blocks");

    expect(result.status, result.stderr).toBe(1);
    expect(result.stderr).toContain(
      'Stopped at apps/docs/demos/blocks/default.tsx (demo key "blocks-default" not in the rescan).'
    );
    expect(result.stderr).toContain(createdLine(created));
    expect(result.stderr).not.toContain("Nothing was written.");
    expectTree(before, snapshot(repo), { added: created });
  });

  it("stops at an I/O error on the tsup config with only the package exports edited", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    // The edit's open, by access mode: preflight reads tsup too, through a
    // read-only open, and an error there is a preflight stop.
    const result = runHooked(
      repo,
      `before("openSync", (path, flags) => is(path, "packages/ui/tsup.config.ts") && (flags === "r+" || (typeof flags === "number" && (flags & fs.constants.O_RDWR) !== 0)), () => fail("EIO"));`
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
 * the registry's inode: through a descriptor opened on the original file
 * while the path still named it, or on the file the path names then.
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
// Descriptors opened on the original registry while TARGET still named it.
// Once a rename frees that inode, Linux file systems hand its number to the
// next new file (ext4 does, APFS does not), so a later file with the same
// number is not the registry: matching on the number alone counted the
// meta.json staging write as a write to package.json.
const originFds = new Set();
const same = (a, b) => a && b && a.dev === b.dev && a.ino === b.ino;
const liveStat = () =>
  real.existsSync(at(TARGET)) ? real.lstatSync(at(TARGET), { bigint: true }) : null;
const noteOpen = (fd) => {
  const own = real.fstatSync(fd, { bigint: true });
  if (same(own, origin) && same(liveStat(), origin)) originFds.add(fd);
};
const onLiveInode = (fd) => {
  const own = real.fstatSync(fd, { bigint: true });
  const now = liveStat();
  const hit = originFds.has(fd) || same(own, now);
  if (hit) {
    let file = "?";
    try {
      file = real.readlinkSync("/proc/self/fd/" + fd);
    } catch {}
    real.appendFileSync(
      join(OUT, "live-log"),
      "fd=" + fd + " file=" + file + " ino=" + own.ino + " origin=" + origin.ino +
        " now=" + (now ? now.ino : "none") + " nlink=" + own.nlink + "\\n"
    );
  }
  return hit;
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
  noteOpen(fd);
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
  originFds.delete(args[0]);
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
    liveLog: existsSync(join(out, "live-log"))
      ? readFileSync(join(out, "live-log"), "utf8")
      : "",
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
    expect(
      seamRun.liveWrites,
      `writes or cuts on the live inode:\n${seamRun.liveLog}`
    ).toBe(0);
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

// --- TypeScript registries (spec-registry-read.md rows 4-8) ---

const TSUP = "packages/ui/tsup.config.ts";
const UI_REGISTRY = "packages/ui/src/_registry.ts";
const TSUP_SHAPE = "expected literal entryPoints path array";
const UI_SHAPE = "expected literal ui array of named objects";
/** The lines the scaffold appends to each array, as main writes them. */
const TSUP_ENTRY = `    "src/${KEBAB}.tsx",`;
const UI_ENTRY = `  {
    name: "${KEBAB}",
    type: "registry:ui",
    dependencies: [],
    files: [{ path: "ui/${KEBAB}.tsx", type: "registry:ui" }],
  },`;
/** The checked-in closes: tsup's `],` and ui's `];`, each alone on its line. */
const TSUP_CLOSE = "\n  ],";
const UI_CLOSE = "\n];";

/** `source` with the entry on its own line above the checked-in close. */
const withTsupEntry = (source: string) =>
  source.replace(TSUP_CLOSE, `\n${TSUP_ENTRY}${TSUP_CLOSE}`);
const withUiEntry = (source: string) =>
  source.replace(UI_CLOSE, `\n${UI_ENTRY}${UI_CLOSE}`);

/**
 * A complete run: exit 0, empty stderr, the four files, both exports and
 * the page, and the two TypeScript registries exactly as `tsup` and `ui`.
 */
function expectComplete(
  repo: string,
  result: { status: number | null; stderr: string },
  { tsup, ui }: { tsup: string; ui: string }
) {
  expect(result.status, result.stderr).toBe(0);
  expect(result.stderr).toBe("");
  for (const path of Object.values(FILES)) {
    expect(existsSync(join(repo, path)), path).toBe(true);
  }
  const pkg = JSON.parse(read(repo, PACKAGE));
  expect(pkg.exports[`./${KEBAB}`]).toBe(`./src/${KEBAB}.tsx`);
  expect(pkg.publishConfig.exports[`./${KEBAB}`]).toBeDefined();
  expect(JSON.parse(read(repo, META)).pages).toContain(KEBAB);
  expect(read(repo, TSUP)).toBe(tsup);
  expect(read(repo, UI_REGISTRY)).toBe(ui);
}

/** Hook source: `path`'s text rewritten in place by `change` (a JS function). */
function rewriteAction(path: string, change: string) {
  return `const text = real.readFileSync(at(${JSON.stringify(path)}), "utf8");
const saved = (${change})(text);
if (saved === text) throw new Error("the save changed nothing");
real.writeFileSync(at(${JSON.stringify(path)}), saved);
real.writeFileSync(at("saved.txt"), saved);`;
}

/**
 * Hook source for the seam harness: an editor save of `path` that appends
 * a comment, in place or by a sibling renamed over it. The saved bytes also
 * go to OUT/saved.json.
 */
function textSaveAction(path: string, how: "in place" | "rename") {
  return `const saved = real.readFileSync(at(${JSON.stringify(path)}), "utf8") + "// editor note\\n";
real.writeFileSync(join(OUT, "saved.json"), saved);
${
  how === "in place"
    ? `real.writeFileSync(at(${JSON.stringify(path)}), saved);`
    : `real.writeFileSync(at(${JSON.stringify(`${path}.editor-tmp`)}), saved);
real.renameSync(at(${JSON.stringify(`${path}.editor-tmp`)}), at(${JSON.stringify(path)}));`
}`;
}

describe("TypeScript registries: an entry spelled another way is still the entry (row 4)", () => {
  it.each([
    [
      "tsup 'src/scaffold-probe.tsx'",
      TSUP,
      (source: string) =>
        source.replace(
          "entryPoints: [",
          `entryPoints: [\n    'src/${KEBAB}.tsx',`
        ),
      `${TSUP}: entry "src/${KEBAB}.tsx"`,
    ],
    [
      'tsup "./src/scaffold-probe.tsx"',
      TSUP,
      (source: string) =>
        source.replace(
          "entryPoints: [",
          `entryPoints: [\n    "./src/${KEBAB}.tsx",`
        ),
      `${TSUP}: entry "src/${KEBAB}.tsx"`,
    ],
    [
      'ui {name:"scaffold-probe",…}',
      UI_REGISTRY,
      (source: string) =>
        source.replace(
          UI_CLOSE,
          `\n  {name:"${KEBAB}",type:"registry:ui",files:[]},${UI_CLOSE}`
        ),
      `${UI_REGISTRY}: entry name: "${KEBAB}"`,
    ],
    [
      "ui {name : 'scaffold-probe',…}",
      UI_REGISTRY,
      (source: string) =>
        source.replace(
          UI_CLOSE,
          `\n  {name : '${KEBAB}',type:"registry:ui",files:[]},${UI_CLOSE}`
        ),
      `${UI_REGISTRY}: entry name: "${KEBAB}"`,
    ],
  ] as const)("row 4: refuses %s", (_label, path, change, reported) => {
    const repo = scratchRepo();
    edit(repo, path, change);

    expectRefusal(repo, [reported]);
  });
});

describe("TypeScript registries: comments are not entries (row 5)", () => {
  it.each([
    [
      "inside the arrays",
      (source: string) =>
        source.replace(
          "entryPoints: [\n",
          `entryPoints: [\n    // "src/${KEBAB}.tsx" ]\n`
        ),
      (source: string) =>
        source.replace(UI_CLOSE, `\n/* name: "${KEBAB}" ]; */${UI_CLOSE}`),
    ],
    [
      "at EOF",
      (source: string) => `${source}// "src/${KEBAB}.tsx" ]\n`,
      (source: string) => `${source}/* name: "${KEBAB}" ]; */\n`,
    ],
  ] as const)(
    "row 5: registers past comments naming the entry %s and keeps them",
    (_label, tsupChange, uiChange) => {
      const repo = scratchRepo();
      edit(repo, TSUP, tsupChange);
      edit(repo, UI_REGISTRY, uiChange);
      const tsup = read(repo, TSUP);
      const ui = read(repo, UI_REGISTRY);

      const result = run(repo, PASCAL);

      expectComplete(repo, result, {
        tsup: withTsupEntry(tsup),
        ui: withUiEntry(ui),
      });
    }
  );
});

describe("TypeScript registries: the close may move (row 6)", () => {
  const STRINGS = `"src/strings.tsx"`;
  it.each([
    [
      "ui `  ];` after a trailing comma",
      UI_REGISTRY,
      (source: string) => source.replace(UI_CLOSE, "\n  ];"),
      (source: string) => source.replace("\n  ];", `\n${UI_ENTRY}\n  ];`),
    ],
    [
      "ui `  ];` without a trailing comma",
      UI_REGISTRY,
      (source: string) => source.replace(`  },${UI_CLOSE}`, "  }\n  ];"),
      (source: string) =>
        source.replace("  }\n  ];", `  },\n${UI_ENTRY}\n  ];`),
    ],
    [
      "tsup `],` on the last path's line after a trailing comma",
      TSUP,
      (source: string) =>
        source.replace(`${STRINGS},${TSUP_CLOSE}`, `${STRINGS},],`),
      (source: string) =>
        source.replace(`${STRINGS},],`, `${STRINGS},\n${TSUP_ENTRY}\n  ],`),
    ],
    [
      "tsup `],` on the last path's line without a trailing comma",
      TSUP,
      (source: string) =>
        source.replace(`${STRINGS},${TSUP_CLOSE}`, `${STRINGS}],`),
      (source: string) =>
        source.replace(`${STRINGS}],`, `${STRINGS},\n${TSUP_ENTRY}\n  ],`),
    ],
  ] as const)(
    "row 6: appends the entry last with %s",
    (_label, path, change, expected) => {
      const repo = scratchRepo();
      edit(repo, path, change);
      const tsup = read(repo, TSUP);
      const ui = read(repo, UI_REGISTRY);

      const result = run(repo, PASCAL);

      expectComplete(repo, result, {
        tsup: path === TSUP ? expected(tsup) : withTsupEntry(tsup),
        ui: path === UI_REGISTRY ? expected(ui) : withUiEntry(ui),
      });
    }
  );
});

describe("TypeScript registries: anything but a literal array stops preflight (row 7)", () => {
  it.each([
    [
      "a spread first in entryPoints",
      TSUP,
      (source: string) =>
        source.replace("entryPoints: [", "entryPoints: [\n    ...more,"),
      TSUP_SHAPE,
    ],
    [
      "entryPoints' ] deleted",
      TSUP,
      (source: string) => source.replace(TSUP_CLOSE, "\n  ,"),
      TSUP_SHAPE,
    ],
    [
      "a spread first in ui",
      UI_REGISTRY,
      (source: string) =>
        source.replace(
          "ui: RegistryItem[] = [",
          "ui: RegistryItem[] = [\n  ...more,"
        ),
      UI_SHAPE,
    ],
    [
      "ui's ] deleted",
      UI_REGISTRY,
      (source: string) => source.replace(UI_CLOSE, "\n;"),
      UI_SHAPE,
    ],
  ] as const)("row 7: refuses %s", (_label, path, change, reason) => {
    const repo = scratchRepo();
    edit(repo, path, change);

    expectRefusal(repo, [stoppedLine(path, reason)]);
  });
});

describe("TypeScript registries: a save just before the edit open (row 8)", () => {
  it("row 8: merges a comment saved on the last path's line", () => {
    const repo = scratchRepo();
    const ui = read(repo, UI_REGISTRY);

    const result = runBeforeEdit(
      repo,
      TSUP,
      rewriteAction(
        TSUP,
        `(text) => text.replace('"src/strings.tsx",\\n  ],', '"src/strings.tsx" /*saved*/],')`
      )
    );

    expectComplete(repo, result, {
      tsup: read(repo, "saved.txt").replace(
        `"src/strings.tsx" /*saved*/],`,
        `"src/strings.tsx", /*saved*/\n${TSUP_ENTRY}\n  ],`
      ),
      ui: withUiEntry(ui),
    });
    expect(read(repo, TSUP)).toContain("/*saved*/");
  });

  it.each([
    [
      TSUP,
      `(text) => text.replace("entryPoints: [", "entryPoints: [\\n    ...more,")`,
      TSUP_SHAPE,
      [PACKAGE, TSUP],
    ],
    [
      UI_REGISTRY,
      `(text) => text.replace("ui: RegistryItem[] = [", "ui: RegistryItem[] = [\\n  ...more,")`,
      UI_SHAPE,
      [PACKAGE, TSUP, UI_REGISTRY],
    ],
  ] as const)(
    "row 8: stops at a spread saved in %s, keeping it",
    (path, change, reason, changed) => {
      const solo = scratchRepo();
      expect(run(solo, PASCAL).status).toBe(0);
      const repo = scratchRepo();
      const before = snapshot(repo);

      const result = runBeforeEdit(repo, path, rewriteAction(path, change));

      expectLateStop(result, path, reason, ALL_FIVE);
      expect(read(repo, path)).toBe(read(repo, "saved.txt"));
      expect(read(repo, path)).toContain("...more,");
      for (const earlier of changed.filter((other) => other !== path)) {
        expect(read(repo, earlier), earlier).toBe(read(solo, earlier));
      }
      expectTree(before, snapshot(repo), {
        added: [...ALL_FIVE, "saved.txt"],
        changed: [...changed],
      });
    }
  );
});

describe("TypeScript registries: an entry saved after the check is the contributor's", () => {
  it.each([
    [
      TSUP,
      `(text) => text.replace("entryPoints: [", "entryPoints: [\\n    'src/${KEBAB}.tsx',")`,
      [PACKAGE, TSUP],
    ],
    [
      UI_REGISTRY,
      `(text) => text.replace("\\n];", "\\n  {name:'${KEBAB}',type:'registry:ui',files:[]},\\n];")`,
      [PACKAGE, TSUP, UI_REGISTRY],
    ],
  ] as const)(
    "stops at %s gaining the entry just before its edit, keeping the save",
    (path, change, changed) => {
      const solo = scratchRepo();
      expect(run(solo, PASCAL).status).toBe(0);
      const repo = scratchRepo();
      const before = snapshot(repo);

      const result = runBeforeEdit(repo, path, rewriteAction(path, change));

      expectLateStop(result, path, "entry appeared after the check", ALL_FIVE);
      expect(read(repo, path)).toBe(read(repo, "saved.txt"));
      for (const earlier of changed.filter((other) => other !== path)) {
        expect(read(repo, earlier), earlier).toBe(read(solo, earlier));
      }
      expectTree(before, snapshot(repo), {
        added: [...ALL_FIVE, "saved.txt"],
        changed: [...changed],
      });
    }
  );
});

describe("TypeScript registries: read, staged and published like the JSON ones", () => {
  it.each(
    cross(cross([TSUP, UI_REGISTRY], LATE_SEAMS), METHODS).map(
      ([[path, seam], how]) => [path, seam, how] as const
    )
  )("%s saved at %s, %s, stops the publish", (path, seam, how) => {
    const repo = trackedRepo();
    const before = snapshot(repo);

    const seamRun = runAtSeam(repo, path, seam, textSaveAction(path, how));

    expect(seamRun.fired, "the save ran").toBe(true);
    expect(seamRun.liveWrites, "writes or cuts on the live inode").toBe(0);
    expectLateStop(seamRun.result, path, DRIFT, ALL_FIVE);
    expect(read(repo, path)).toBe(seamRun.saved());
    expect(read(repo, path)).not.toContain(KEBAB);
    expectTree(before, snapshot(repo), {
      added: ALL_FIVE,
      changed: path === TSUP ? [PACKAGE, TSUP] : [PACKAGE, TSUP, UI_REGISTRY],
    });
  });

  it.each([TSUP, UI_REGISTRY])(
    "stops at a manifest that is a symlink to %s, writing nothing through it",
    (path) => {
      const solo = trackedRepo();
      expect(run(solo, PASCAL).status).toBe(0);
      const repo = trackedRepo();
      const manifest = join(repo, MANIFEST);
      rmSync(manifest);
      symlinkSync(relative(dirname(manifest), join(repo, path)), manifest);

      const seamRun = runAtSeam(repo, path, "none");

      expect(seamRun.liveWrites, "writes or cuts on the registry").toBe(0);
      expectLateStop(
        seamRun.result,
        MANIFEST,
        `same file as ${path}`,
        ALL_FIVE
      );
      expect(read(repo, path)).toBe(read(solo, path));
    }
  );

  it.each([TSUP, UI_REGISTRY])(
    "refuses a symlinked %s in preflight and keeps its referent",
    (path) => {
      const repo = scratchRepo();
      const referent = `${path}.real`;
      const bytes = readFileSync(join(repo, path));
      renameSync(join(repo, path), join(repo, referent));
      symlinkSync(basename(referent), join(repo, path));

      expectRefusal(repo, [stoppedLine(path, "symlinked registry")]);
      expect(readFileSync(join(repo, referent)).equals(bytes)).toBe(true);
    }
  );

  it.each([TSUP, UI_REGISTRY])(
    "%s keeps its permission bits through the replacement",
    (path) => {
      const repo = scratchRepo();
      chmodSync(join(repo, path), 0o640);

      const result = run(repo, PASCAL);

      expect(result.status, result.stderr).toBe(0);
      expect(statSync(join(repo, path)).mode % 0o1_0000).toBe(0o640);
    }
  );

  it.skipIf(!ACL_SETTABLE).each([TSUP, UI_REGISTRY])(
    "%s with an ACL stops before publishing and keeps the list",
    (path) => {
      const repo = scratchRepo();
      const file = join(repo, path);
      expect(denyNobodyRead(file)).toBe(true);
      const bytes = readFileSync(file);
      const acl = aclText(file);

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

  it.each([TSUP, UI_REGISTRY])(
    "%s: a FIFO at the registry stops preflight",
    (path) => {
      const repo = scratchRepo();
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
    }
  );

  it.each([
    [TSUP, TSUP_SHAPE],
    [UI_REGISTRY, UI_SHAPE],
  ])("refuses %s bytes that are not UTF-8 in preflight", (path, reason) => {
    const repo = scratchRepo();
    const bytes = Buffer.concat([
      readFileSync(join(repo, path)),
      Buffer.from("// caf"),
      Buffer.from([0xe9]),
      Buffer.from("\n"),
    ]);
    writeFileSync(join(repo, path), bytes);

    expectRefusal(repo, [stoppedLine(path, reason)]);
    expect(readFileSync(join(repo, path)).equals(bytes)).toBe(true);
  });
});

// --- Lookup errors (spec-registry-read.md row 9) ---

/** A preflight stop: exit 1, every line, "Nothing was written.", the tree as `before`. */
function expectPreflightStop(
  repo: string,
  before: Record<string, string>,
  result: { status: number | null; stderr: string },
  lines: string[]
) {
  expect(result.status, result.stderr).toBe(1);
  expect(result.stderr).toContain("Nothing was written.");
  for (const line of lines) {
    expect(result.stderr).toContain(line);
  }
  expect(snapshot(repo)).toEqual(before);
}

describe("lookup errors other than ENOENT stop preflight (row 9)", () => {
  const SAVED_STORY = "// my saved story\n";

  it("row 9: EACCES at the story lstat stops at the story and keeps it", () => {
    const repo = scratchRepo();
    put(repo, FILES.story, SAVED_STORY);
    const before = snapshot(repo);

    const result = runHooked(
      repo,
      `before("lstatSync", (path) => is(path, ${JSON.stringify(FILES.story)}), () => fail("EACCES"));`
    );

    expectPreflightStop(repo, before, result, [
      stoppedLine(FILES.story, "EACCES"),
    ]);
    expect(read(repo, FILES.story)).toBe(SAVED_STORY);
  });

  // The spec's own setup. A privileged user reads through mode 000, so
  // there the injected EACCES above is the case.
  it.skipIf(process.getuid?.() === 0)(
    "row 9: a story directory at mode 000 stops at the story and keeps it",
    () => {
      const repo = scratchRepo();
      put(repo, FILES.story, SAVED_STORY);
      const before = snapshot(repo);
      const dir = join(repo, dirname(FILES.story));

      chmodSync(dir, 0);
      let result: ReturnType<typeof run>;
      try {
        result = run(repo, PASCAL);
      } finally {
        chmodSync(dir, 0o755);
      }

      expectPreflightStop(repo, before, result, [
        stoppedLine(FILES.story, "EACCES"),
      ]);
      expect(read(repo, FILES.story)).toBe(SAVED_STORY);
    }
  );

  it("row 9: ENOTDIR on the story's parent is a stop, not absence", () => {
    const repo = scratchRepo();
    const parent = dirname(FILES.story);
    rmSync(join(repo, parent), { recursive: true });
    put(repo, parent, "a file where the stories folder goes\n");
    const before = snapshot(repo);

    const result = run(repo, PASCAL);

    expectPreflightStop(repo, before, result, [
      stoppedLine(FILES.story, "ENOTDIR"),
    ]);
  });

  it.each([TSUP, UI_REGISTRY])(
    "row 9: a missing %s stops preflight with ENOENT beside the other collisions",
    (path) => {
      const repo = scratchRepo();
      rmSync(join(repo, path));
      COLLISIONS["meta.json entry"].arrange(repo);
      const before = snapshot(repo);

      const result = run(repo, PASCAL);

      expectPreflightStop(repo, before, result, [
        stoppedLine(path, "ENOENT"),
        COLLISIONS["meta.json entry"].reported,
      ]);
    }
  );

  it.each([PACKAGE, TSUP, UI_REGISTRY, META])(
    "row 9: EIO opening %s in preflight stops beside the other collisions",
    (path) => {
      const repo = scratchRepo();
      COLLISIONS.story.arrange(repo);
      const before = snapshot(repo);

      // The first open of a registry is the preflight read.
      const result = runHooked(
        repo,
        `before("openSync", (path) => is(path, ${JSON.stringify(path)}), () => fail("EIO"));`
      );

      expectPreflightStop(repo, before, result, [
        stoppedLine(path, "EIO"),
        FILES.story,
      ]);
    }
  );

  it("row 9: EACCES scanning the demos folder stops preflight", () => {
    const repo = scratchRepo();
    const before = snapshot(repo);

    const result = runHooked(
      repo,
      `before("readdirSync", (path) => is(path, "apps/docs/demos"), () => fail("EACCES"));`
    );

    expectPreflightStop(repo, before, result, [
      stoppedLine("apps/docs/demos", "EACCES"),
    ]);
  });

  it("row 9: an error checking that the manifest is not a registry stops before writing it", () => {
    const repo = trackedRepo();
    const before = snapshot(repo);

    // meta.json's first lstat is the manifest write's alias check.
    const result = runHooked(
      repo,
      `before("lstatSync", (path) => is(path, ${JSON.stringify(META)}), () => fail("EIO"));`
    );

    expectStop(result, META, "EIO", ALL_FIVE);
    expectTree(before, snapshot(repo), {
      added: ALL_FIVE,
      changed: [PACKAGE, TSUP, UI_REGISTRY],
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

describe("scaffolded MDX page", () => {
  it("passes the prose lint, so a new page needs no baseline entry", async () => {
    const { lintProse } = await import("../../../scripts/lint-docs-prose.mjs");
    const repo = scratchRepo();
    expect(run(repo, PASCAL).status).toBe(0);

    const findings = lintProse(read(repo, FILES.mdx), FILES.mdx, {
      properNouns: [PASCAL],
    });

    expect(findings).toEqual([]);
  });
});
