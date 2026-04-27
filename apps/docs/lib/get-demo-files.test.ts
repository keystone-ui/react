import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { getDemoFiles, isValidDemoName } from "./get-demo-files";

const demosRoot = resolve(import.meta.dirname, "..", "demos");
const SOURCE_EXTENSION_RE = /\.(tsx|ts|css)$/;

describe("isValidDemoName", () => {
  it("accepts kebab-case names", () => {
    expect(isValidDemoName("button")).toBe(true);
    expect(isValidDemoName("date-input")).toBe(true);
    expect(isValidDemoName("tickets-01")).toBe(true);
  });

  it("rejects path traversal", () => {
    expect(isValidDemoName("../etc/passwd")).toBe(false);
    expect(isValidDemoName("foo/bar")).toBe(false);
    expect(isValidDemoName("foo.bar")).toBe(false);
    expect(isValidDemoName(".hidden")).toBe(false);
  });

  it("rejects empty input", () => {
    expect(isValidDemoName("")).toBe(false);
  });
});

describe("getDemoFiles", () => {
  it("returns demo files for a real component (button)", async () => {
    const result = await getDemoFiles({ name: "button", demosRoot });
    expect(result).not.toBeNull();
    expect(result?.name).toBe("button");
    expect(result?.files.length).toBeGreaterThan(0);
    // button has a default.tsx demo
    expect(result?.files.some((f) => f.path === "default.tsx")).toBe(true);
    // content is non-empty TSX
    const defaultDemo = result?.files.find((f) => f.path === "default.tsx");
    expect(defaultDemo?.content).toContain("Button");
  });

  it("returns demo files for a multi-file block (tickets-01)", async () => {
    const result = await getDemoFiles({ name: "tickets-01", demosRoot });
    expect(result).not.toBeNull();
    expect(result?.name).toBe("tickets-01");
    // tickets-01 has many files
    expect(result?.files.length).toBeGreaterThan(5);
    // returned paths are sorted
    const paths = result?.files.map((f) => f.path) ?? [];
    const sorted = [...paths].sort((a, b) => a.localeCompare(b));
    expect(paths).toEqual(sorted);
  });

  it("returns demo files for a single-file block (signin-01)", async () => {
    const result = await getDemoFiles({ name: "signin-01", demosRoot });
    expect(result).not.toBeNull();
    expect(result?.name).toBe("signin-01");
    expect(result?.files).toEqual([
      { path: "signin-01.tsx", content: expect.any(String) },
    ]);
    expect(result?.files[0]?.content).toContain("@keystoneui/react");
  });

  it("returns null for a name that doesn't exist", async () => {
    const result = await getDemoFiles({
      name: "definitely-not-a-real-demo",
      demosRoot,
    });
    expect(result).toBeNull();
  });

  it("returns null for a name with invalid characters (path traversal guard)", async () => {
    const result = await getDemoFiles({
      name: "../../etc/passwd",
      demosRoot,
    });
    expect(result).toBeNull();
  });

  it("only includes source extensions (.tsx, .ts, .css)", async () => {
    const result = await getDemoFiles({ name: "tickets-01", demosRoot });
    for (const file of result?.files ?? []) {
      expect(file.path).toMatch(SOURCE_EXTENSION_RE);
    }
  });
});
