import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { vi } from "vitest";
import type { RegistryItem, RegistryManifest } from "../types.js";

export interface Route {
  body?: unknown;
  /** Never settles: for a lookup that hangs until its bound. */
  hang?: boolean;
  /** Rejects as a network failure would. */
  reject?: boolean;
  status?: number;
}

/**
 * A fetch stub that answers only the URLs it is given and fails loudly on
 * any other, recording every request. JSON bodies are served for objects,
 * text for strings.
 */
export function stubFetch(routes: Record<string, Route>) {
  const calls: string[] = [];
  const fn = vi.fn((input: unknown, init?: { signal?: AbortSignal }) => {
    const url = String(input);
    calls.push(url);
    const route = routes[url];
    if (!route) {
      return Promise.reject(new Error(`unexpected request: ${url}`));
    }
    if (route.reject) {
      return Promise.reject(new TypeError("fetch failed"));
    }
    if (route.hang) {
      return new Promise((_, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new Error("aborted"))
        );
      });
    }
    const status = route.status ?? 200;
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 404 ? "Not Found" : "",
      json: () => Promise.resolve(route.body),
      text: () =>
        Promise.resolve(
          typeof route.body === "string"
            ? route.body
            : JSON.stringify(route.body)
        ),
    });
  });
  vi.stubGlobal("fetch", fn);
  return { calls, fn };
}

/** A fetch stub that fails the test on any request at all. */
export function forbidFetch() {
  const calls: string[] = [];
  const fn = vi.fn((input: unknown) => {
    calls.push(String(input));
    throw new Error(`no request expected, got ${String(input)}`);
  });
  vi.stubGlobal("fetch", fn);
  return { calls, fn };
}

export function manifest(items: RegistryItem[]): RegistryManifest {
  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    homepage: "https://example.test",
    items,
    name: "fixture",
  };
}

const dirs: string[] = [];

/** A project directory holding the given files, removed by `cleanDirs`. */
export function projectDir(files: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), "ks-mcp-kits-"));
  dirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, name), JSON.stringify(content));
  }
  return dir;
}

export function cleanDirs(): void {
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true });
  }
}

/** Run with `dir` as the working directory the tools read. */
export function inDir(dir: string): void {
  vi.spyOn(process, "cwd").mockReturnValue(dir);
}

export const REGISTRY_PROJECT = {
  "components.json": {
    aliases: { ui: "@/components/ui" },
    tailwind: { css: "app/globals.css" },
  },
};

export const PACKAGE_PROJECT = {
  "package.json": {
    dependencies: { "@keystoneui/react": "^1.0.0-beta.10" },
  },
};

/** Console output captured per stream, for CLI tests. */
export function captureConsole() {
  const out: string[] = [];
  const err: string[] = [];
  vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    out.push(args.join(" "));
  });
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    err.push(args.join(" "));
  });
  return {
    get stdout() {
      return out.join("\n");
    },
    get stderr() {
      return err.join("\n");
    },
  };
}
