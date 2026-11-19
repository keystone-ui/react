/**
 * Errors from the file system that reach the CLI: the audit read and the
 * `init` directory and config writes. The platform's message quotes the
 * path, so it is escaped where it is rethrown, with its kind and code kept.
 */
import type * as fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

const failing = new Map<string, Error>();
const failingDirs = new Map<string, Error>();
const failingWrites = new Map<string, Error>();

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof fs>();
  return {
    ...actual,
    existsSync: (path: fs.PathLike) =>
      failing.has(String(path)) || actual.existsSync(path),
    mkdirSync: (path: fs.PathLike, options?: fs.MakeDirectoryOptions) => {
      for (const [dir, error] of failingDirs) {
        if (String(path).startsWith(dir)) {
          throw error;
        }
      }
      return actual.mkdirSync(path, options);
    },
    readFileSync: ((path: fs.PathOrFileDescriptor, options?: unknown) => {
      const error = failing.get(String(path));
      if (error) {
        throw error;
      }
      return (actual.readFileSync as (p: unknown, o?: unknown) => unknown)(
        path,
        options
      );
    }) as typeof fs.readFileSync,
    writeFileSync: ((path: fs.PathOrFileDescriptor, data: unknown) => {
      for (const [file, error] of failingWrites) {
        if (String(path).startsWith(file)) {
          throw error;
        }
      }
      return (actual.writeFileSync as (p: unknown, d: unknown) => void)(
        path,
        data
      );
    }) as typeof fs.writeFileSync,
  };
});

const { runCli } = await import("../cli.js");
const { init } = await import("../init.js");
const { cleanDirs, inDir, projectDir } = await import("./fixtures.js");

const BREAK = /[\n\r]/;
const argv = [...process.argv];

function systemError(message: string, path: string): Error {
  return Object.assign(new Error(message), {
    code: "EACCES",
    errno: -13,
    path,
    syscall: "open",
  });
}

afterEach(() => {
  failing.clear();
  failingDirs.clear();
  failingWrites.clear();
  process.argv = [...argv];
  process.exitCode = undefined;
  vi.restoreAllMocks();
  cleanDirs();
});

describe("audit --theme when the file cannot be read", () => {
  it("rethrows the error on one line, kind and code kept", async () => {
    const path = "unreadable\nMARK_PATH.css";
    failing.set(
      path,
      systemError(`EACCES: permission denied, open '${path}'`, path)
    );
    const error = (await runCli(["audit", "--theme", path]).catch(
      (e: unknown) => e
    )) as Error & { code: string };
    expect(error).toBeInstanceOf(Error);
    expect(error.message).not.toMatch(BREAK);
    expect(error.message).toContain("unreadable\\u000aMARK_PATH.css");
    expect(error.code).toBe("EACCES");
  });

  it("rethrows a plain error as it is", async () => {
    const path = "unreadable.css";
    const original = systemError(
      `EACCES: permission denied, open '${path}'`,
      path
    );
    failing.set(path, original);
    expect(
      await runCli(["audit", "--theme", path]).catch((e: unknown) => e)
    ).toBe(original);
  });
});

describe("init when the config cannot be written", () => {
  function initCursor() {
    const dir = projectDir({});
    inDir(dir);
    process.argv = ["node", "keystoneui", "init", "--client", "cursor"];
    return dir;
  }

  it("a directory that cannot be made: one line, code kept", () => {
    const dir = initCursor();
    failingDirs.set(
      dir,
      systemError(
        "EACCES: permission denied, mkdir 'project\nMARK_PATH/.cursor'",
        dir
      )
    );
    let error: (Error & { code: string }) | undefined;
    try {
      init();
    } catch (e) {
      error = e as Error & { code: string };
    }
    expect(error?.message).not.toMatch(BREAK);
    expect(error?.message).toContain("project\\u000aMARK_PATH");
    expect(error?.code).toBe("EACCES");
  });

  it("a config that cannot be written: one line, code kept", () => {
    const dir = initCursor();
    failingWrites.set(
      dir,
      systemError(
        "EACCES: permission denied, open 'project\nMARK_PATH/.cursor/mcp.json'",
        dir
      )
    );
    let error: (Error & { code: string }) | undefined;
    try {
      init();
    } catch (e) {
      error = e as Error & { code: string };
    }
    expect(error?.message).not.toMatch(BREAK);
    expect(error?.code).toBe("EACCES");
  });

  it("a plain failure is rethrown as it is", () => {
    const dir = initCursor();
    const original = systemError("EACCES: permission denied", dir);
    failingDirs.set(dir, original);
    let error: unknown;
    try {
      init();
    } catch (e) {
      error = e;
    }
    expect(error).toBe(original);
  });
});
