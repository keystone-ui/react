/**
 * Text that does not come from this package's own source: registry data,
 * project files, configured URLs and what the caller typed. Whatever its
 * shape, it stays on its own line, opens no code block, ends no inline code
 * span, and is never an unquoted argument of a printed command.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCli } from "../cli.js";
import type { ProjectConfig } from "../config.js";
import { clearCache } from "../fetcher.js";
import { metaLines } from "../item-meta.js";
import { nameRefusal } from "../item-name.js";
import {
  auditChecklistTool,
  getAddCommandTool,
  getDocsTool,
  getExamplesTool,
  getProjectContextTool,
  getThemeInfoTool,
  listComponentsTool,
  searchComponentsTool,
  viewComponentTool,
} from "../tools.js";
import type { RegistryItem } from "../types.js";
import {
  captureConsole,
  cleanDirs,
  forbidFetch,
  inDir,
  manifest,
  PACKAGE_PROJECT,
  projectDir,
  stubFetch,
} from "./fixtures.js";

const R = "https://example.test/r";
const MANIFEST_URL = `${R}/registry.json`;
const DOCS = "https://docs.example.test/llms.mdx/docs";
const CONFIG: ProjectConfig = {
  docsUrl: "https://docs.example.test",
  registry: { url: R },
};

/**
 * A value of every awkward shape at once: backticks, a fence marker, a
 * leading dash, quotes, a dollar sign, a control character and line breaks
 * of each kind, each followed by a marker that must never start a line.
 */
const ODD =
  "-v`1``` x\n```bash\nMARK_A\u0001'\"$\r\nMARK_B\u2028MARK_C\u0085MARK_D\u2029MARK_E";
/** A value that starts with a fence marker. */
const FENCED = "```bash\nMARK_A";
/** What a caller may type as a name: no C0 control, `?`, `#` or `\`. */
const TYPED = "t`1``` -x'\"$\u2028MARK_C\u0085MARK_D";

const RAW_BREAK_OR_CONTROL =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: the shapes under test
  /[\u0000-\u0009\u000b-\u001f\u007f-\u009f\u2028\u2029]/;
const MARK_AT_LINE_START = /^\s*MARK_/m;
const FENCE_LINE = /^ {0,3}(`{3,}|~{3,})/gm;
const ADD_LINE = /^npx shadcn@latest add (.*)$/gm;
const SHELL_SAFE = /^[A-Za-z0-9@%+=:,._/-]+$/;
const QUOTED = /^'(?:[^']|'\\'')*'$/;
const SHELL_WORDS = /'(?:[^']|'\\'')*'|\S+/g;
const EXAMPLES_CALL = /get_examples\((".*")\)$/;

/** Output holding an awkward value: no new line from it, no new fence. */
function expectContained(out: string, fences: number): void {
  expect(out).not.toMatch(MARK_AT_LINE_START);
  expect(out).not.toMatch(RAW_BREAK_OR_CONTROL);
  expect((out.match(FENCE_LINE) ?? []).length).toBe(fences);
  for (const [, args] of out.matchAll(ADD_LINE)) {
    for (const word of args.match(SHELL_WORDS) ?? []) {
      expect(SHELL_SAFE.test(word) || QUOTED.test(word), word).toBe(true);
    }
  }
}

const env = { ...process.env };

beforeEach(() => {
  clearCache();
});

afterEach(() => {
  process.env = { ...env };
  process.exitCode = undefined;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  cleanDirs();
});

const USERS: RegistryItem = {
  name: "users-01",
  type: "registry:block",
  title: "Users 01",
};
const ODD_ITEMS: RegistryItem[] = [
  USERS,
  {
    name: ODD,
    type: "registry:component",
    title: ODD,
    description: ODD,
    categories: [ODD],
    dependencies: [ODD],
    registryDependencies: [ODD],
    meta: {
      keystoneui: {
        flavourOf: "users-01",
        minPackageVersion: ODD,
        partOf: [ODD, "users-01"],
      },
    },
  },
  {
    name: "odd-kit",
    type: "registry:component",
    title: "Odd kit",
    description: FENCED,
    meta: { keystoneui: { flavourOf: ODD, partOf: [ODD] } },
  },
  { name: "odd-type", type: ODD, title: "Odd type" },
];

describe("the ?only refusal's CLI hint", () => {
  const code = "k1_slate_0.55_0.2_262.5_large_inter";

  it("is kept for a theme code and a part", () => {
    expect(nameRefusal(`theme/${code}?only=theme,font`)).toBe(
      `**theme/${code}?only=theme,font**: ?only is not part of a name: get the command for theme/${code}, then append ?only=theme,font to the printed URL (CLI: keystoneui theme ${code} --only theme,font).`
    );
  });

  it.each([
    ["a space in the code", "theme/a b?only=theme"],
    ["a quote in the code", "theme/it's?only=theme"],
    ["a dollar sign in the code", "theme/a$b?only=theme"],
    ["a separator in the code", "theme/a;b?only=theme"],
    ["a leading dash in the code", "theme/-a?only=theme"],
    ["a space in the part", `theme/${code}?only=theme font`],
    ["a separator in the part", `theme/${code}?only=theme;font`],
    ["a leading dash in the part", `theme/${code}?only=-x`],
    ["an empty part", `theme/${code}?only=`],
    ["a backtick in the part", `theme/${code}?only=a\`b`],
  ])("prints no command for %s, only the guidance", (_label, name) => {
    forbidFetch();
    const out = nameRefusal(name) as string;
    expect(out).toContain("?only is not part of a name");
    expect(out).not.toContain("CLI:");
    expect(out).not.toContain("keystoneui theme");
  });
});

describe("registry text in list, search and view", () => {
  it("list keeps every field of an item on its own line", async () => {
    stubFetch({ [MANIFEST_URL]: { body: manifest(ODD_ITEMS) } });
    const out = await listComponentsTool(CONFIG, { limit: 20, offset: 0 });
    expectContained(out, 0);
    // Four entries and the footer, one block each.
    expect(out.split("\n\n").length).toBe(4 + 1);
  });

  it("search keeps them on their lines and echoes the query on one", async () => {
    stubFetch({ [MANIFEST_URL]: { body: manifest(ODD_ITEMS) } });
    expectContained(
      await searchComponentsTool(CONFIG, { limit: 10, query: "odd" }),
      0
    );
    clearCache();
    stubFetch({ [MANIFEST_URL]: { body: manifest(ODD_ITEMS) } });
    expectContained(
      await searchComponentsTool(CONFIG, { limit: 10, query: ODD }),
      0
    );
  });

  it("view keeps them on their lines", async () => {
    stubFetch({
      [`${R}/button.json`]: { body: { ...ODD_ITEMS[1], name: "button" } },
    });
    expectContained(await viewComponentTool(CONFIG, { names: ["button"] }), 0);
  });

  it("an inline code span holding a backtick still closes where it should", async () => {
    inDir(projectDir(PACKAGE_PROJECT));
    stubFetch({ [MANIFEST_URL]: { body: manifest([USERS]) } });
    const out = await getAddCommandTool(CONFIG, {
      flavour: "package",
      names: ["a`b"],
    });
    expect(out.split("\n")[0]).toBe(
      "- ``a`b``: Not in the registry index; command composed from the name."
    );
  });

  it("a typed name is echoed on one line", async () => {
    stubFetch({ [`${R}/${TYPED}.json`]: { status: 404 } });
    expectContained(await viewComponentTool(CONFIG, { names: [TYPED] }), 0);
  });
});

describe("registry and project text in get_add_command", () => {
  it("package mode keeps metadata, types and the declared range on their lines", async () => {
    inDir(
      projectDir({
        "package.json": { dependencies: { "@keystoneui/react": ODD } },
      })
    );
    stubFetch({
      [MANIFEST_URL]: {
        body: manifest([
          ...ODD_ITEMS.slice(2),
          { name: "users-02", type: "registry:block" },
          {
            name: "npm/users-02",
            type: "registry:block",
            meta: {
              keystoneui: { flavourOf: "users-02", minPackageVersion: ODD },
            },
          },
        ]),
      },
    });
    const out = await getAddCommandTool(CONFIG, {
      flavour: "package",
      names: ["users-02", "odd-kit", "odd-type"],
    });
    // One line per name, then the combined and the individual commands.
    expect(
      out.split("\n\nInstall these components")[0].split("\n")
    ).toHaveLength(3);
    expectContained(out, 2 * (1 + 3));
  });

  it("prints no command whose URL holds a line break, only the guidance", async () => {
    forbidFetch();
    const out = await getAddCommandTool(CONFIG, { names: ["button", TYPED] });
    expectContained(out, 0);
    expect(out).toContain("No install command");
  });

  it("prints no command from a configured registry URL with a line break", async () => {
    forbidFetch();
    const out = await getAddCommandTool(
      { ...CONFIG, registry: { url: "https://example.test/r\nMARK_A" } },
      { names: ["button"] }
    );
    expectContained(out, 0);
    expect(out).toContain("No install command");
  });

  it("keeps the unreadable-index notice on one line", async () => {
    inDir(projectDir(PACKAGE_PROJECT));
    const registry = "https://example.test/r\u0085MARK_D";
    stubFetch({});
    const out = await getAddCommandTool(
      { ...CONFIG, registry: { url: registry } },
      { flavour: "package", names: ["button"] }
    );
    expectContained(out, 0);
  });
});

describe("registry text in get_examples and get_docs", () => {
  it("the examples hint names the block on one line and as a valid call", async () => {
    stubFetch({
      [MANIFEST_URL]: { body: manifest(ODD_ITEMS) },
      [`${R}/demos/odd-kit`]: { status: 404 },
    });
    const out = await getExamplesTool(CONFIG, { name: "odd-kit" });
    expectContained(out, 0);
    const call = EXAMPLES_CALL.exec(out)?.[1] as string;
    expect(JSON.parse(call)).toBe(ODD);
  });

  it("a typed name is echoed on one line by examples and docs", async () => {
    stubFetch({
      [`${R}/demos/${TYPED}`]: { reject: true },
      [`${DOCS}/components/${TYPED}`]: { status: 500 },
    });
    expectContained(await getExamplesTool(CONFIG, { name: TYPED }), 0);
    expectContained(
      await getDocsTool(CONFIG, { name: TYPED, type: "component" }),
      0
    );
  });

  it("an unreachable docs URL is reported on one line", async () => {
    stubFetch({});
    const docsUrl = "https://docs.example.test/a\u2028MARK_C";
    expectContained(
      await getDocsTool(
        { ...CONFIG, docsUrl },
        { name: "x", type: "component" }
      ),
      0
    );
  });
});

describe("project text in context, theme and audit", () => {
  const ODD_PROJECT = {
    "components.json": {
      aliases: { ui: ODD },
      iconLibrary: ODD,
      rsc: true,
      tailwind: { css: ODD },
    },
    "package.json": {
      dependencies: { "@keystoneui/react": ODD },
      packageManager: `${ODD}@1`,
    },
  };

  it("get_project_context keeps each field in its row", () => {
    inDir(projectDir(ODD_PROJECT));
    const out = getProjectContextTool();
    expectContained(out, 0);
    expect(out.split("\n")).toHaveLength(13);
  });

  it("audit_checklist keeps each field on its line", () => {
    inDir(projectDir(ODD_PROJECT));
    expectContained(auditChecklistTool(), 0);
  });

  it("get_theme_info prints no command from a URL with a line break", () => {
    inDir(projectDir(ODD_PROJECT));
    const out = getThemeInfoTool({
      docsUrl: "https://docs.example.test\nMARK_A",
      registry: { url: "https://example.test/r\nMARK_B" },
    });
    // Only the CSS block's fences remain.
    expectContained(out, 2);
  });
});

describe("the CLI verbs that print the same text", () => {
  beforeEach(() => {
    process.env.KEYSTONEUI_REGISTRY_URL = R;
    inDir(projectDir({}));
  });

  it("list, search, blocks and view print it contained", async () => {
    process.env.KEYSTONEUI_URL = "https://docs.example.test";
    stubFetch({
      [MANIFEST_URL]: {
        body: manifest([
          ...ODD_ITEMS,
          { ...ODD_ITEMS[1], name: "odd-block", type: "registry:block" },
        ]),
      },
      [`${R}/odd-block.json`]: { body: ODD_ITEMS[1] },
    });
    const io = captureConsole();
    await runCli(["list"]);
    await runCli(["search", "odd"]);
    await runCli(["blocks"]);
    await runCli(["blocks", "odd-block"]);
    expectContained(io.stdout, 0);
    expectContained(io.stderr, 0);
  });

  it("theme prints no command from a configured URL with a line break", async () => {
    process.env.KEYSTONEUI_URL = "https://docs.example.test\nMARK_A";
    const io = captureConsole();
    await runCli(["theme", "k1_slate_0.55_0.2_262.5_large_inter"]);
    expectContained(io.stdout, 0);
    expect(io.stdout).not.toContain("npx shadcn");
  });

  it("info prints project and environment values on their lines", async () => {
    process.env.KEYSTONEUI_URL = "https://docs.example.test/a\u2028MARK_C";
    inDir(
      projectDir({
        "components.json": {
          aliases: { ui: ODD },
          iconLibrary: ODD,
          tailwind: { css: ODD },
        },
        "package.json": { packageManager: `${ODD}@1` },
      })
    );
    const io = captureConsole();
    await runCli(["info"]);
    expectContained(io.stdout, 0);
  });

  it("docs reports a failure on one line", async () => {
    process.env.KEYSTONEUI_URL = "https://docs.example.test/a\u2028MARK_C";
    stubFetch({
      "https://docs.example.test/a\u2028MARK_C/llms.mdx/docs/components/x": {
        status: 500,
      },
    });
    const io = captureConsole();
    await runCli(["docs", "x"]);
    expectContained(io.stderr, 0);
    expect(process.exitCode).toBe(1);
  });
});

describe("docs pointer URLs are composed into the docs URL", () => {
  const SIDEBAR: RegistryItem = {
    name: "sidebar",
    type: "registry:component",
    meta: { keystoneui: { docs: "/docs/interop#the-sidebar-item" } },
  };

  it.each([
    [
      "an origin",
      "https://docs.example.test",
      "https://docs.example.test/llms.mdx/docs/interop",
      "https://docs.example.test/docs/interop#the-sidebar-item",
    ],
    [
      "a base path with a trailing slash",
      "https://docs.example.test/site/",
      "https://docs.example.test/site/llms.mdx/docs/interop",
      "https://docs.example.test/site/docs/interop#the-sidebar-item",
    ],
    [
      "a query and a fragment",
      "https://docs.example.test/site?lang=en#old",
      "https://docs.example.test/site/llms.mdx/docs/interop?lang=en",
      "https://docs.example.test/site/docs/interop?lang=REDACTED#the-sidebar-item",
    ],
    [
      "a credential",
      "https://user:FAKE_S@docs.example.test",
      "https://user:FAKE_S@docs.example.test/llms.mdx/docs/interop",
      "https://docs.example.test/docs/interop#the-sidebar-item",
    ],
  ])("with %s", async (_label, docsUrl, request, printed) => {
    const config = { ...CONFIG, docsUrl };
    expect(metaLines(SIDEBAR, docsUrl).at(-1)).toBe(`Docs: ${printed}`);
    const first = `${docsUrl}/llms.mdx/docs/components/sidebar`;
    const { calls } = stubFetch({
      [first]: { status: 404 },
      [MANIFEST_URL]: { body: manifest([SIDEBAR]) },
      [request]: { body: "# Interop\n" },
    });
    expect(
      await getDocsTool(config, { name: "sidebar", type: "component" })
    ).toBe(
      "Documented in section #the-sidebar-item of /docs/interop.\n\n# Interop\n"
    );
    expect(calls).toEqual([first, MANIFEST_URL, request]);
  });
});

describe("the exact-block route in `keystoneui blocks`", () => {
  it("refuses a block whose name cannot be a registry path, on stderr with exit 1", async () => {
    process.env.KEYSTONEUI_REGISTRY_URL = R;
    inDir(projectDir({}));
    const { calls } = stubFetch({
      [MANIFEST_URL]: {
        body: manifest([{ name: "a?b", type: "registry:block" }]),
      },
    });
    const io = captureConsole();
    await runCli(["blocks", "a?b"]);
    expect(io.stdout).toBe("");
    expect(io.stderr).toBe(
      "**a?b**: not a valid registry item name (query delimiter `?`)."
    );
    expect(process.exitCode).toBe(1);
    expect(calls).toEqual([MANIFEST_URL]);
  });
});

describe("an index holding an entry that is not an item", () => {
  const BROKEN = manifest([
    null as unknown as RegistryItem,
    7 as unknown as RegistryItem,
    { name: "button", type: "registry:ui", title: "Button" },
    {
      name: "sidebar",
      type: "registry:component",
      title: "Sidebar",
      meta: { keystoneui: { docs: "/docs/interop", partOf: ["admin-01"] } },
    },
  ]);

  it("get_docs still follows the pointer", async () => {
    stubFetch({
      [`${DOCS}/components/sidebar`]: { status: 404 },
      [MANIFEST_URL]: { body: BROKEN },
      [`${DOCS}/interop`]: { body: "# Interop\n" },
    });
    expect(
      await getDocsTool(CONFIG, { name: "sidebar", type: "component" })
    ).toBe("Documented in /docs/interop.\n\n# Interop\n");
  });

  it("get_examples still gives its hint", async () => {
    stubFetch({
      [MANIFEST_URL]: { body: BROKEN },
      [`${R}/demos/sidebar`]: { status: 404 },
    });
    expect(await getExamplesTool(CONFIG, { name: "sidebar" })).toContain(
      'get_examples("admin-01")'
    );
  });

  it("package mode still answers per name", async () => {
    inDir(projectDir(PACKAGE_PROJECT));
    stubFetch({ [MANIFEST_URL]: { body: BROKEN } });
    expect(
      await getAddCommandTool(CONFIG, { flavour: "package", names: ["button"] })
    ).toContain("button is a component.");
  });

  it("an unfiltered list prints a page that does not hold the entry", async () => {
    stubFetch({ [MANIFEST_URL]: { body: BROKEN } });
    expect(await listComponentsTool(CONFIG, { limit: 2, offset: 2 })).toContain(
      "**Button** (`button`)"
    );
  });
});
