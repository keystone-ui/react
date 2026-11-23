/**
 * Renders a module's default-exported Server Component tree to a React
 * Flight payload, the way a React Server Components bundler does: run it
 * under the `react-server` condition, with every module whose source starts
 * with "use client" replaced by client references (so its code never runs
 * on the server). Prints the payload to stdout.
 *
 * Usage (the condition must be set on the process):
 *   node --conditions=react-server scripts/lib/rsc-render.mjs <tree.mjs>
 *
 * The Flight server is React's own `react-server-dom-webpack`, as the
 * workspace's Next vendors it (apps/docs depends on next); no dependency is
 * added for this. Used by scripts/strings-build-checks.mjs (B2).
 */

import { readFileSync } from "node:fs";
import { createRequire, registerHooks } from "node:module";
import { dirname, join } from "node:path";
import { Writable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const docsRequire = createRequire(join(ROOT, "apps/docs/package.json"));
const NEXT_DIR = dirname(docsRequire.resolve("next/package.json"));
const FLIGHT_SERVER = join(
  NEXT_DIR,
  "dist/compiled/react-server-dom-webpack/server.node.js"
);
const esbuild = createRequire(
  createRequire(join(ROOT, "packages/ui/package.json")).resolve("tsup")
)("esbuild");

const PROLOGUE_ITEM =
  /^(?:\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/|(["'])([^"'\n]*)\1\s*;?)/;

/** Whether the module's directive prologue holds "use client". */
function isClientModule(source) {
  let rest = source;
  for (;;) {
    const match = PROLOGUE_ITEM.exec(rest);
    if (!match || match[0].length === 0) {
      return false;
    }
    if (match[2] === "use client") {
      return true;
    }
    rest = rest.slice(match[0].length);
  }
}

/** Export names of an ES module, read by esbuild without running it. */
function exportNames(path) {
  const result = esbuild.buildSync({
    entryPoints: [path],
    bundle: false,
    format: "esm",
    metafile: true,
    write: false,
    logLevel: "silent",
    outdir: "/ks-rsc-out",
  });
  const [output] = Object.values(result.metafile.outputs);
  return output.exports;
}

/** Client references seen in the payload, by module URL. */
export const clientModules = new Set();

const BARE_PACKAGE = /^(?:@[^/]+\/)?[^./@][^/]*$/;

/** The package.json above a resolved file whose name is `name`. */
function manifestOf(path, name) {
  let dir = dirname(path);
  while (dir !== dirname(dir)) {
    try {
      const manifest = JSON.parse(
        readFileSync(join(dir, "package.json"), "utf-8")
      );
      if (manifest.name === name) {
        return { dir, manifest };
      }
    } catch {
      // keep walking up
    }
    dir = dirname(dir);
  }
  return null;
}

registerHooks({
  // A bundler takes a package's ESM `module` entry when it has no `exports`
  // (lucide-react); Node would take the CommonJS `main`, whose "use client"
  // boundary is lost.
  resolve(specifier, context, nextResolve) {
    const resolved = nextResolve(specifier, context);
    if (!(BARE_PACKAGE.test(specifier) && resolved.url.startsWith("file:"))) {
      return resolved;
    }
    const found = manifestOf(fileURLToPath(resolved.url), specifier);
    if (found && !found.manifest.exports && found.manifest.module) {
      return {
        url: pathToFileURL(join(found.dir, found.manifest.module)).href,
        format: "module",
        shortCircuit: true,
      };
    }
    return resolved;
  },
  load(url, context, nextLoad) {
    if (!url.startsWith("file:") || url.endsWith(".json")) {
      return nextLoad(url, context);
    }
    const path = fileURLToPath(url);
    const source = readFileSync(path, "utf-8");
    if (!isClientModule(source)) {
      return nextLoad(url, context);
    }
    if (/^\s*export\s*\*/m.test(source)) {
      throw new Error(`rsc-render: "use client" module re-exports *: ${path}`);
    }
    const names = exportNames(path);
    const lines = [
      `import { registerClientReference } from ${JSON.stringify(pathToFileURL(FLIGHT_SERVER).href)};`,
      ...names.map((name) => {
        const ref = `registerClientReference(function () { throw new Error(${JSON.stringify(`client code ran on the server: ${name}`)}); }, ${JSON.stringify(url)}, ${JSON.stringify(name)})`;
        return name === "default"
          ? `export default ${ref};`
          : `export const ${name} = ${ref};`;
      }),
    ];
    return { format: "module", source: lines.join("\n"), shortCircuit: true };
  },
});

const require = createRequire(import.meta.url);
const { renderToPipeableStream } = require(FLIGHT_SERVER);

/** Any client reference resolves to itself: the payload names it. */
const clientManifest = new Proxy(
  {},
  {
    get(_target, key) {
      const [id, name] = String(key).split("#");
      clientModules.add(id);
      return { id, chunks: [], name };
    },
  }
);

export function renderFlight(element) {
  return new Promise((resolve, reject) => {
    let payload = "";
    const errors = [];
    const sink = new Writable({
      write(chunk, _encoding, done) {
        payload += chunk.toString();
        done();
      },
      final(done) {
        done();
        if (errors.length > 0) {
          reject(errors[0]);
        } else {
          resolve(payload);
        }
      },
    });
    const { pipe } = renderToPipeableStream(element, clientManifest, {
      onError(error) {
        errors.push(error);
      },
    });
    pipe(sink);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // The tree is built with the package's own React, resolved under this
  // process's `react-server` condition.
  const react = await import(
    pathToFileURL(
      createRequire(join(ROOT, "packages/ui/package.json")).resolve("react")
    ).href
  );
  const tree = await import(pathToFileURL(process.argv[2]).href);
  const trees = await tree.default(react);
  const results = {};
  for (const [name, element] of Object.entries(trees)) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: one render at a time keeps each payload's errors its own
      results[name] = { payload: await renderFlight(element) };
    } catch (error) {
      results[name] = { error: String(error?.message ?? error) };
    }
  }
  process.stdout.write(JSON.stringify(results));
}
