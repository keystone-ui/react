#!/usr/bin/env node

/**
 * Install the committed registry into fresh consumer projects with the real
 * shadcn CLI, then typecheck what it wrote.
 *
 * Usage:
 *   node scripts/smoke-install.mjs                 all ui items + blocks
 *   node scripts/smoke-install.mjs button combobox only these items
 *   pnpm smoke:install
 *
 * Unit tests check registry.json; this checks what a consumer gets. Every
 * install bug so far passed the unit tests: `./utils` imports that resolved to
 * nothing, a doubled `components/ui/src/` path, and bare registry
 * dependencies that installed shadcn's Radix Button beside Keystone's
 * combobox. Each fixture in scripts/lib/smoke-install.mjs is a project shape
 * that has broken an install.
 *
 * Offline and side-effect free: items come from apps/docs/public/r through a
 * local server that rewrites production URLs to itself, dependency installs
 * are stubbed (npm/pnpm/yarn/bun shims that exit 0), and node_modules is a set
 * of symlinks into this workspace. Fixtures live in a temp dir that is removed
 * on success and kept on failure for inspection.
 */

import { execFile } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { promisify } from "node:util";

import {
  componentsJson,
  FIXTURES,
  misplacedUiFiles,
  rewriteRegistryBody,
  tsconfigJson,
} from "./lib/smoke-install.mjs";

const run = promisify(execFile);

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const REGISTRY_DIR = join(ROOT, "apps/docs/public/r");
const SHADCN = join(ROOT, "node_modules/.bin/shadcn");
const TSC = join(ROOT, "packages/ui/node_modules/typescript/bin/tsc6");

/** Workspaces whose node_modules together hold every dependency an item declares. */
const RESOLVE_FROM = ["packages/ui", "apps/docs", "."].map((p) =>
  join(ROOT, p, "package.json")
);

const ALWAYS_LINKED = [
  "react",
  "react-dom",
  "@types/react",
  "@types/react-dom",
  "clsx",
  "tailwind-merge",
];

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exitCode = 1;
}

/** The package root above a resolved entry file. */
function rootOf(entry, name) {
  let dir = dirname(entry);
  while (dir !== dirname(dir)) {
    const manifest = join(dir, "package.json");
    if (
      existsSync(manifest) &&
      JSON.parse(readFileSync(manifest, "utf-8")).name === name
    ) {
      return dir;
    }
    dir = dirname(dir);
  }
  return null;
}

function packageDir(name) {
  for (const from of RESOLVE_FROM) {
    const require = createRequire(from);
    try {
      return dirname(require.resolve(`${name}/package.json`));
    } catch {
      // `exports` may hide package.json (clsx, tailwind-merge, cva)
    }
    try {
      const root = rootOf(require.resolve(name), name);
      if (root) {
        return root;
      }
    } catch {
      // try the next workspace
    }
  }
  return null;
}

function selectItems(registry, requested) {
  if (requested.length > 0) {
    return requested;
  }
  return registry.items
    .filter(
      (i) =>
        i.type === "registry:ui" ||
        i.type === "registry:block" ||
        i.type === "registry:component" ||
        i.name.startsWith("density/")
    )
    .map((i) => i.name);
}

/**
 * Every npm dependency any item declares. Not just the requested items':
 * their registry dependencies bring npm dependencies of their own, and the
 * links are free.
 */
function npmDependencies(registry) {
  const deps = new Set(ALWAYS_LINKED);
  for (const item of registry.items) {
    for (const dep of item.dependencies ?? []) {
      // Strip a version range: "recharts@^3" -> "recharts".
      deps.add(dep.replace(/(?<=.)@.*$/, ""));
    }
  }
  deps.delete("@keystoneui/react");
  return [...deps].sort();
}

/**
 * ui items install together, as an app that adds components one by one ends
 * up with all of them. Each block installs alone into its own project:
 * blocks share file names (admin-01 and dashboard-01 both ship chart.tsx),
 * and nobody installs every block into one app.
 */
function installGroups(registry, names) {
  const byName = new Map(registry.items.map((i) => [i.name, i]));
  const ui = names.filter((n) => byName.get(n)?.type !== "registry:block");
  const blocks = names.filter((n) => byName.get(n)?.type === "registry:block");
  return [
    ...(ui.length > 0 ? [{ label: "ui", items: ui }] : []),
    ...blocks.map((name) => ({ label: name, items: [name] })),
  ];
}

const CONCURRENCY = 4;

async function runPool(tasks, size, worker) {
  const queue = [...tasks];
  const lanes = Array.from({ length: size }, async () => {
    while (queue.length > 0) {
      // biome-ignore lint/performance/noAwaitInLoops: each lane is sequential by design; the lanes run in parallel
      await worker(queue.shift());
    }
  });
  await Promise.all(lanes);
}

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const path = join(REGISTRY_DIR, decodeURIComponent(req.url ?? "/"));
      if (!(path.startsWith(REGISTRY_DIR) && existsSync(path))) {
        res.writeHead(404).end();
        return;
      }
      const { port } = server.address();
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        rewriteRegistryBody(
          readFileSync(path, "utf-8"),
          `http://127.0.0.1:${port}/`
        )
      );
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function writeShims(dir) {
  mkdirSync(dir, { recursive: true });
  for (const pm of ["npm", "pnpm", "yarn", "bun"]) {
    const shim = join(dir, pm);
    writeFileSync(shim, "#!/bin/sh\nexit 0\n");
    chmodSync(shim, 0o755);
  }
}

function writeFixture(dir, fixture, deps) {
  const src = fixture.srcDir ? join(dir, fixture.srcDir) : dir;
  mkdirSync(join(src, "lib"), { recursive: true });
  mkdirSync(join(dir, "node_modules/@types"), { recursive: true });

  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: `ks-smoke-${fixture.name}`,
      private: true,
      type: "module",
    })
  );
  writeFileSync(
    join(dir, "components.json"),
    JSON.stringify(componentsJson(fixture), null, 2)
  );
  writeFileSync(
    join(dir, "tsconfig.json"),
    JSON.stringify(tsconfigJson(fixture), null, 2)
  );
  const css = fixture.srcDir
    ? join(src, "index.css")
    : join(dir, "app/globals.css");
  mkdirSync(dirname(css), { recursive: true });
  writeFileSync(css, '@import "tailwindcss";\n');
  writeFileSync(
    join(src, "lib/utils.ts"),
    'import { type ClassValue, clsx } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}\n'
  );

  const missing = [];
  for (const dep of deps) {
    const target = packageDir(dep);
    if (!target) {
      missing.push(dep);
      continue;
    }
    const link = join(dir, "node_modules", dep);
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(target, link);
  }
  return missing;
}

function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules") {
      continue;
    }
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...listFiles(full, base));
    } else {
      out.push(relative(base, full));
    }
  }
  return out;
}

async function main() {
  const registry = JSON.parse(
    readFileSync(join(ROOT, "registry.json"), "utf-8")
  );
  const items = selectItems(registry, process.argv.slice(2));
  const deps = npmDependencies(registry);

  const work = mkdtempSync(join(tmpdir(), "ks-smoke-"));
  const shims = join(work, ".bin");
  writeShims(shims);
  const server = await startServer();
  const { port } = server.address();
  const env = { ...process.env, PATH: `${shims}:${process.env.PATH}` };

  const groups = installGroups(registry, items);
  const tasks = groups.flatMap((group) =>
    FIXTURES.map((fixture) => ({ fixture, group }))
  );
  console.log(
    `Installing ${items.length} item(s) as ${groups.length} install(s) × ${FIXTURES.length} fixture(s) — ${work}`
  );

  async function smoke({ fixture, group }) {
    const label = `${fixture.name} / ${group.label}`;
    const dir = join(work, fixture.name, group.label);
    const missing = writeFixture(dir, fixture, deps);
    if (missing.length > 0) {
      fail(`${label}: cannot link ${missing.join(", ")} from the workspace`);
      return;
    }
    const urls = group.items.map(
      (name) => `http://127.0.0.1:${port}/${name}.json`
    );

    // Async on purpose: the registry server runs in this process, and a
    // synchronous spawn would block the event loop it answers on.
    try {
      await run(SHADCN, ["add", ...urls, "--yes", "--overwrite", "--silent"], {
        cwd: dir,
        env,
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch (error) {
      fail(
        `${label}: shadcn add exited ${error.code}\n${error.stdout ?? ""}${error.stderr ?? ""}`
      );
      return;
    }

    const misplaced = misplacedUiFiles(listFiles(dir), fixture);
    if (misplaced.length > 0) {
      fail(
        `${label}: ${misplaced.length} ui file(s) outside ${fixture.expectedUiDir}, e.g. ${misplaced.slice(0, 3).join(", ")}`
      );
    }

    try {
      await run("node", [TSC, "-p", dir], {
        cwd: dir,
        maxBuffer: 64 * 1024 * 1024,
      });
      console.log(`✔ ${label}`);
    } catch (error) {
      const output = `${error.stdout ?? ""}${error.stderr ?? ""}`
        .trim()
        .split("\n")
        .map((line) => line.replace(`${dir}/`, ""));
      fail(
        `${label}: tsc found ${output.length} error line(s)\n${output.slice(0, 30).join("\n")}`
      );
    }
  }

  try {
    await runPool(tasks, CONCURRENCY, smoke);
  } finally {
    server.close();
  }

  if (process.exitCode) {
    console.error(`\nFixtures kept for inspection: ${work}`);
  } else {
    rmSync(work, { recursive: true, force: true });
    console.log(`\nOK — ${tasks.length} install(s) typechecked.`);
  }
}

await main();
