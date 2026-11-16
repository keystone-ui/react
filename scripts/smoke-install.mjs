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
 * Package-flavour items (`npm/*`) install into apps that depend on
 * `@keystoneui/react` instead: no ui directory, no lib/utils.ts, the
 * hand-written components.json the docs print, and only React, its types
 * and the item's own dependencies linked. The package is installed as npm
 * serves it: its manifest with `publishConfig.exports` promoted to `exports`,
 * beside a link to this workspace's packages/ui/dist, so the item typechecks
 * against the built declaration files (run `pnpm --filter @keystoneui/react
 * build` first; the run fails without them, and a stale local dist gives a
 * stale answer). Unpublished exports therefore pass here: the minimum
 * package version an item states is checked by hand against npm (see
 * apps/docs/tests/npm-flavour-minimum.test.ts).
 *
 * Offline and side-effect free: items come from apps/docs/public/r through a
 * local server that rewrites production URLs to itself, dependency installs
 * are stubbed (npm/pnpm/yarn/bun shims that exit 0), and node_modules is a set
 * of symlinks into this workspace (plus the package-flavour fixtures'
 * generated @keystoneui/react manifest). Fixtures live in a temp dir that is removed
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
  expectedPackageFiles,
  fixturesFor,
  installedPath,
  installGroups,
  lostClientDirectives,
  misplacedUiFiles,
  packageComponentsJson,
  packageFixtureDependencies,
  publishedManifest,
  rewriteRegistryBody,
  setupChanges,
  tsconfigJson,
} from "./lib/smoke-install.mjs";

const run = promisify(execFile);

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const REGISTRY_DIR = join(ROOT, "apps/docs/public/r");
const SHADCN = join(ROOT, "node_modules/.bin/shadcn");
const TSC = join(ROOT, "packages/ui/node_modules/typescript/bin/tsc6");
const PACKAGE_DIR = join(ROOT, "packages/ui");

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

const CSS = '@import "tailwindcss";\n';
const PACKAGE_CSS =
  '@import "tailwindcss";\n@import "@keystoneui/react/base.css";\n';

function cssPath(dir, fixture) {
  return fixture.srcDir
    ? join(dir, fixture.srcDir, "index.css")
    : join(dir, "app/globals.css");
}

/** The components.json bytes a fixture starts with. */
function configText(fixture) {
  return JSON.stringify(
    fixture.flavour === "package"
      ? packageComponentsJson(fixture)
      : componentsJson(fixture),
    null,
    2
  );
}

/**
 * `node_modules/@keystoneui/react` as npm installs it: a real directory whose
 * package.json maps every subpath into dist, and dist itself linked to this
 * workspace's build. TypeScript follows the link to packages/ui/dist, so the
 * declaration files find their own dependencies (`@base-ui/react` and the
 * rest) in packages/ui/node_modules.
 */
function writePublishedPackage(dir) {
  const target = join(dir, "node_modules/@keystoneui/react");
  mkdirSync(target, { recursive: true });
  const manifest = publishedManifest(
    JSON.parse(readFileSync(join(PACKAGE_DIR, "package.json"), "utf-8"))
  );
  writeFileSync(
    join(target, "package.json"),
    JSON.stringify(manifest, null, 2)
  );
  symlinkSync(join(PACKAGE_DIR, "dist"), join(target, "dist"));
}

function writeFixture(dir, fixture, deps) {
  const isPackage = fixture.flavour === "package";
  const src = fixture.srcDir ? join(dir, fixture.srcDir) : dir;
  mkdirSync(isPackage ? src : join(src, "lib"), { recursive: true });
  mkdirSync(join(dir, "node_modules/@types"), { recursive: true });

  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: `ks-smoke-${fixture.name}`,
      private: true,
      type: "module",
      // shadcn takes the framework from here and from next.config: the
      // registry:page is written only into a Next app.
      ...(fixture.framework === "next" ? { dependencies: { next: "*" } } : {}),
    })
  );
  if (fixture.framework === "next") {
    writeFileSync(join(dir, "next.config.mjs"), "export default {};\n");
  }
  writeFileSync(join(dir, "components.json"), configText(fixture));
  writeFileSync(
    join(dir, "tsconfig.json"),
    JSON.stringify(tsconfigJson(fixture), null, 2)
  );
  const css = cssPath(dir, fixture);
  mkdirSync(dirname(css), { recursive: true });
  writeFileSync(css, isPackage ? PACKAGE_CSS : CSS);
  if (isPackage) {
    writePublishedPackage(dir);
  } else {
    writeFileSync(
      join(src, "lib/utils.ts"),
      'import { type ClassValue, clsx } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}\n'
    );
  }

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

/**
 * A package-flavour install that exits 0 having written nothing would
 * typecheck an empty project, so the written files must be exactly the
 * item's, and the consumer's CSS and components.json must be byte for byte
 * as they were written. In the Next fixture (`rsc: true`) every file whose
 * source starts with "use client" must still start with it.
 */
function checkPackageInstall({ dir, fixture, item, label }) {
  const expected = new Set(expectedPackageFiles(item, fixture));
  const setup = new Set([
    "package.json",
    "components.json",
    "tsconfig.json",
    "next.config.mjs",
    relative(dir, cssPath(dir, fixture)),
  ]);
  const written = listFiles(dir).filter((f) => !setup.has(f));
  const extra = written.filter((f) => !expected.has(f));
  const absent = [...expected].filter((f) => !written.includes(f));
  if (extra.length > 0 || absent.length > 0) {
    fail(
      `${label}: wrote ${extra.length} unexpected file(s) [${extra.slice(0, 5).join(", ")}] and missed ${absent.length} [${absent.slice(0, 5).join(", ")}]`
    );
  }
  const changed = setupChanges({
    css: [PACKAGE_CSS, readFileSync(cssPath(dir, fixture), "utf-8")],
    config: [
      configText(fixture),
      readFileSync(join(dir, "components.json"), "utf-8"),
    ],
  });
  if (changed.length > 0) {
    fail(`${label}: shadcn rewrote the app's ${changed.join(" and ")}`);
  }
  if (fixture.framework === "next") {
    const files = (item.files ?? [])
      .map((file) => ({ file, path: installedPath(file, fixture) }))
      .filter(({ path }) => path !== null && existsSync(join(dir, path)))
      .map(({ file, path }) => ({
        path,
        source: readFileSync(join(ROOT, file.path), "utf-8"),
        installed: readFileSync(join(dir, path), "utf-8"),
      }));
    const lost = lostClientDirectives(files);
    if (lost.length > 0) {
      fail(
        `${label}: "use client" removed from ${lost.length} file(s): ${lost.slice(0, 5).join(", ")}`
      );
    }
  }
}

async function main() {
  const registry = JSON.parse(
    readFileSync(join(ROOT, "registry.json"), "utf-8")
  );
  const items = selectItems(registry, process.argv.slice(2));
  const byName = (name) => registry.items.find((i) => i.name === name);
  const deps = npmDependencies(registry);

  const work = mkdtempSync(join(tmpdir(), "ks-smoke-"));
  const shims = join(work, ".bin");
  writeShims(shims);
  const server = await startServer();
  const { port } = server.address();
  const env = { ...process.env, PATH: `${shims}:${process.env.PATH}` };

  const groups = installGroups(registry, items);
  if (
    groups.some((g) => g.flavour === "package") &&
    !existsSync(join(PACKAGE_DIR, "dist/button.d.ts"))
  ) {
    console.error(
      "✖ packages/ui/dist is missing: package-flavour items typecheck against the built declaration files, as npm serves them. Run `pnpm --filter @keystoneui/react build` first."
    );
    process.exit(1);
  }
  const tasks = groups.flatMap((group) =>
    fixturesFor(group).map((fixture) => ({ fixture, group }))
  );
  console.log(
    `Installing ${items.length} item(s) as ${tasks.length} install(s) — ${work}`
  );

  async function smoke({ fixture, group }) {
    const label = `${fixture.name} / ${group.label}`;
    const dir = join(work, fixture.name, group.label);
    const missing = writeFixture(
      dir,
      fixture,
      fixture.flavour === "package"
        ? packageFixtureDependencies(byName(group.items[0]))
        : deps
    );
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

    if (fixture.flavour === "package") {
      checkPackageInstall({
        dir,
        fixture,
        item: byName(group.items[0]),
        label,
      });
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
