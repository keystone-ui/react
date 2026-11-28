/**
 * The CLI verbs over kits and package flavours, through `runCli`: what goes
 * to stdout and stderr, and the exit code.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCli } from "../cli.js";
import { clearCache } from "../fetcher.js";
import type { RegistryItem } from "../types.js";
import {
  captureConsole,
  cleanDirs,
  inDir,
  manifest,
  projectDir,
  stubFetch,
} from "./fixtures.js";

const R = "https://example.test/r";
const MANIFEST_URL = `${R}/registry.json`;
const DOCS = "https://docs.example.test/llms.mdx/docs";

const USERS: RegistryItem = {
  name: "users-01",
  type: "registry:block",
  title: "Users 01",
};
const NPM_USERS: RegistryItem = {
  name: "npm/users-01",
  type: "registry:block",
  title: "Users 01 (package)",
  meta: {
    keystoneui: {
      docs: "/docs/blocks/users-01#apps-that-use-the-npm-package",
      flavourOf: "users-01",
      minPackageVersion: "1.0.0-beta.11",
    },
  },
};
const SIDEBAR: RegistryItem = {
  name: "sidebar",
  type: "registry:component",
  title: "Sidebar",
  meta: {
    keystoneui: {
      docs: "/docs/reference/shadcn-sidebar#installation",
      partOf: ["admin-01"],
    },
  },
};
const NPM_FILTER_PILLS: RegistryItem = {
  name: "npm/filter-pills",
  type: "registry:component",
  title: "Filter Pills (package)",
  meta: { keystoneui: { flavourOf: "filter-pills" } },
};
const ITEMS: RegistryItem[] = [
  { name: "button", type: "registry:ui", title: "Button" },
  { name: "admin-01", type: "registry:block", title: "Admin 01" },
  USERS,
  NPM_USERS,
  SIDEBAR,
  { name: "filter-pills", type: "registry:component", title: "Filter Pills" },
  NPM_FILTER_PILLS,
];

const NPM_USERS_VIEW = `**Users 01 (package)** (\`npm/users-01\`)
Flavour of: users-01 — for apps that use the @keystoneui/react package
Needs @keystoneui/react 1.0.0-beta.11 or later
Docs: https://docs.example.test/docs/blocks/users-01#apps-that-use-the-npm-package`;

const env = { ...process.env };

beforeEach(() => {
  clearCache();
  process.env.KEYSTONEUI_URL = "https://docs.example.test";
  process.env.KEYSTONEUI_REGISTRY_URL = R;
  inDir(projectDir({}));
});

afterEach(() => {
  process.env = { ...env };
  process.exitCode = undefined;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  cleanDirs();
});

function serve(extra = {}) {
  return stubFetch({ [MANIFEST_URL]: { body: manifest(ITEMS) }, ...extra });
}

describe("keystoneui blocks", () => {
  it("views a block named exactly, slash included", async () => {
    serve({ [`${R}/npm/users-01.json`]: { body: NPM_USERS } });
    const io = captureConsole();
    await runCli(["blocks", "npm/users-01"]);
    expect(io.stdout).toBe(NPM_USERS_VIEW);
    expect(io.stderr).toBe("");
    expect(process.exitCode).toBeUndefined();
  });

  it("keeps kits out: sidebar and npm/filter-pills still search blocks", async () => {
    const { calls } = serve();
    const io = captureConsole();
    await runCli(["blocks", "sidebar"]);
    await runCli(["blocks", "npm/filter-pills"]);
    expect(io.stdout).toBe(
      'No results found for "sidebar".\nNo results found for "npm/filter-pills".'
    );
    expect(calls.every((url) => url === MANIFEST_URL)).toBe(true);
  });

  it("lists blocks only, with the appended lines", async () => {
    serve();
    const io = captureConsole();
    await runCli(["blocks"]);
    expect(io.stdout).toBe(
      [
        "**Admin 01** (`admin-01`)",
        "**Users 01** (`users-01`)\nPackage flavour: npm/users-01",
        NPM_USERS_VIEW,
        "\n---\nShowing 3 of 3 items.",
      ].join("\n\n")
    );
  });
});

describe("keystoneui docs", () => {
  it("reads the blocks route with --type block", async () => {
    const { calls } = serve({
      [`${DOCS}/blocks/admin-01`]: { body: "# Admin 01\n" },
    });
    const io = captureConsole();
    await runCli(["docs", "admin-01", "--type", "block"]);
    expect(io.stdout).toBe("# Admin 01\n");
    expect(calls).toEqual([`${DOCS}/blocks/admin-01`]);
    expect(process.exitCode).toBeUndefined();
  });

  it("follows a pointer after a 404 and exits 0", async () => {
    serve({
      [`${DOCS}/components/sidebar`]: { status: 404 },
      [`${DOCS}/reference/shadcn-sidebar`]: { body: "# shadcn sidebar\n" },
    });
    const io = captureConsole();
    await runCli(["docs", "sidebar"]);
    expect(io.stdout).toBe(
      "Documented in section #installation of /docs/reference/shadcn-sidebar.\n\n# shadcn sidebar\n"
    );
    expect(io.stderr).toBe("");
    expect(process.exitCode).toBeUndefined();
  });

  it("refuses an invalid name on stderr with exit 1 and no request", async () => {
    const { calls } = serve();
    const io = captureConsole();
    await runCli(["docs", "a#b"]);
    expect(io.stderr).toBe(
      "**a#b**: not a valid registry item name (fragment delimiter `#`)."
    );
    expect(io.stdout).toBe("");
    expect(process.exitCode).toBe(1);
    expect(calls).toEqual([]);
  });
});

describe("keystoneui list and search", () => {
  it("list --type kit lists the kits", async () => {
    serve();
    const io = captureConsole();
    await runCli(["list", "--type", "kit"]);
    expect(io.stdout).toContain("**Sidebar** (`sidebar`)\nKind: kit");
    expect(io.stdout).toContain("Showing 3 of 3 items.");
  });

  it("search --type kit searches the kits", async () => {
    serve();
    const io = captureConsole();
    await runCli(["search", "sidebar", "--type", "kit"]);
    expect(io.stdout).toContain("**Sidebar** (`sidebar`)");
    expect(io.stdout).toContain("1 result found.");
  });

  it("names the new values when --type is wrong", async () => {
    serve();
    await expect(runCli(["list", "--type", "widget"])).rejects.toThrow(
      'Invalid --type value "widget". Expected one of: ui, block, example, kit, style, theme, item.'
    );
  });
});

describe("keystoneui view and examples with an invalid name", () => {
  it("view prints the valid results, refuses the invalid name on stderr, exits 1", async () => {
    const { calls } = serve({
      [`${R}/sidebar.json`]: { body: SIDEBAR },
    });
    const io = captureConsole();
    await runCli(["view", "sidebar", "../x"]);
    expect(io.stdout).toBe(
      "**Sidebar** (`sidebar`)\nKind: kit\nPart of: admin-01\nDocs: https://docs.example.test/docs/reference/shadcn-sidebar#installation"
    );
    expect(io.stderr).toBe(
      "**../x**: not a valid registry item name (dot segment)."
    );
    expect(process.exitCode).toBe(1);
    expect(calls).toEqual([`${R}/sidebar.json`]);
  });

  it("view with only invalid names prints nothing on stdout", async () => {
    const { calls } = serve();
    const io = captureConsole();
    await runCli(["view", "a?b"]);
    expect(io.stdout).toBe("");
    expect(io.stderr).toBe(
      "**a?b**: not a valid registry item name (query delimiter `?`)."
    );
    expect(process.exitCode).toBe(1);
    expect(calls).toEqual([]);
  });

  it("examples refuses an invalid name on stderr with exit 1", async () => {
    const { calls } = serve();
    const io = captureConsole();
    await runCli(["examples", "a\\b"]);
    expect(io.stderr).toBe(
      "**a\\b**: not a valid registry item name (backslash, read as a path separator)."
    );
    expect(process.exitCode).toBe(1);
    expect(calls).toEqual([]);
  });
});
