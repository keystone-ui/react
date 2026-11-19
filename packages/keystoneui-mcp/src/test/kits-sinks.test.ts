/**
 * Each output sink, per field: code blocks for source, theme commands,
 * thrown messages, CLI diagnostics, the audit formatter, table cells and the
 * inherited docs page. One fixture per field.
 */
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCli } from "../cli.js";
import type { ProjectConfig } from "../config.js";
import { clearCache } from "../fetcher.js";
import { init } from "../init.js";
import { shown } from "../render.js";
import { formatAudit } from "../theme-audit.js";
import {
  getDocsTool,
  getExamplesTool,
  getProjectContextTool,
  getThemeInfoTool,
  listComponentsTool,
  viewComponentTool,
} from "../tools.js";
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
const CONFIG: ProjectConfig = {
  docsUrl: "https://docs.example.test",
  registry: { url: R },
};
const BUILT = join(import.meta.dirname, "../../../../apps/docs/public/r");
const CODE = "k1_slate_0.55_0.2_262.5_large_inter";

const MARK_AT_LINE_START = /^\s*MARK_/m;
const FENCE = /^ {0,3}(`{3,})(.*)$/;
const CLOSING = /^ {0,3}(`{3,})[ \t]*$/;
const BACKTICK_RUN = /`{3,}/;
const ANY_RUN = /`+/g;
const NEWLINE = /\n/;
// biome-ignore lint/suspicious/noControlCharactersInRegex: the characters tested
const CONTROL = /[\u0000-\u001f]/;
const STATUS_500 = /: 500$/;

const env = { ...process.env };
const argv = [...process.argv];

beforeEach(() => {
  clearCache();
});

afterEach(() => {
  process.env = { ...env };
  process.argv = [...argv];
  process.exitCode = undefined;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  cleanDirs();
});

/**
 * The code blocks of a Markdown text, read as CommonMark does: an opener of
 * up to three spaces and a backtick run, closed by a line of up to three
 * spaces and a backtick run at least as long, with nothing after it.
 */
function closes(line: string, fence: string): boolean {
  const match = CLOSING.exec(line);
  return match !== null && match[1].length >= fence.length;
}

function codeBlocks(text: string): { body: string; info: string }[] {
  const blocks: { body: string; info: string }[] = [];
  let open: { fence: string; info: string; lines: string[] } | null = null;
  for (const line of text.split("\n")) {
    if (open) {
      if (closes(line, open.fence)) {
        blocks.push({ body: open.lines.join("\n"), info: open.info });
        open = null;
      } else {
        open.lines.push(line);
      }
      continue;
    }
    const match = FENCE.exec(line);
    if (match) {
      open = { fence: match[1], info: match[2], lines: [] };
    }
  }
  expect(open, "a code block is left open").toBeNull();
  return blocks;
}

/** The lines of a Markdown text that are outside every code block. */
function prose(text: string): string {
  const outside: string[] = [];
  let fence: string | null = null;
  for (const line of text.split("\n")) {
    if (fence) {
      if (closes(line, fence)) {
        fence = null;
      }
      continue;
    }
    const match = FENCE.exec(line);
    if (match) {
      fence = match[1];
      continue;
    }
    outside.push(line);
  }
  return outside.join("\n");
}

function serveItem(item: RegistryItem) {
  return stubFetch({ [`${R}/${item.name}.json`]: { body: item } });
}

describe("source in view_component is one code block", () => {
  it("an ordinary file prints as today", async () => {
    serveItem({
      name: "button",
      type: "registry:ui",
      title: "Button",
      files: [{ content: "export const A = 1;\n", path: "a.tsx", type: "x" }],
    });
    expect(await viewComponentTool(CONFIG, { names: ["button"] })).toBe(
      "**Button** (`button`)\n\n### a.tsx\n```tsx\nexport const A = 1;\n```"
    );
  });

  it.each([
    ["a run of three backticks", "export {};\n```\nMARK_CONTENT\n"],
    ["a run of four backticks", "export {};\n````\nMARK_CONTENT\n"],
    ["a fence with an info string", "```bash\nMARK_CONTENT\n```\n"],
  ])("a body holding %s stays inside its block", async (_label, content) => {
    serveItem({
      name: "button",
      type: "registry:ui",
      title: "Button",
      files: [{ content, path: "a.tsx", type: "x" }],
    });
    const out = await viewComponentTool(CONFIG, { names: ["button"] });
    const blocks = codeBlocks(out);
    expect(blocks).toHaveLength(1);
    expect(`${blocks[0].body}\n`).toBe(content);
    expect(blocks[0].info).toBe("tsx");
    expect(prose(out)).not.toContain("MARK_CONTENT");
  });

  it("a body without a final line break closes on its own line", async () => {
    serveItem({
      name: "button",
      type: "registry:ui",
      title: "Button",
      files: [{ content: "export {};", path: "a.tsx", type: "x" }],
    });
    expect(await viewComponentTool(CONFIG, { names: ["button"] })).toBe(
      "**Button** (`button`)\n\n### a.tsx\n```tsx\nexport {};\n```"
    );
  });
});

describe("demo files in get_examples are one code block each", () => {
  function serveBundle(path: string, content = "export {};") {
    return stubFetch({
      [`${R}/demos/odd`]: { body: { files: [{ content, path }], name: "odd" } },
    });
  }

  it.each([
    ["a line feed", "demo.tsx\n```\n\nMARK_PATH"],
    ["a carriage return", "demo.tsx\r```\r\rMARK_PATH"],
    ["a line separator", "demo.tsx\u2028```\u2028MARK_PATH"],
    ["a paragraph separator", "demo.tsx\u2029```\u2029MARK_PATH"],
    ["backticks", "demo.ts`x``` MARK_PATH"],
  ])(
    "a path suffix holding %s stays in the info string",
    async (_label, path) => {
      serveBundle(path);
      const out = await getExamplesTool(CONFIG, { name: "odd" });
      expect(out).not.toMatch(MARK_AT_LINE_START);
      const blocks = codeBlocks(out);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].body).toBe("export {};");
      expect(blocks[0].info).not.toContain("`");
    }
  );

  it.each([
    ["three", "a\n```\nMARK_CONTENT\n"],
    ["four", "a\n````\nMARK_CONTENT\n"],
  ])(
    "a body holding a run of %s backticks stays inside its block",
    async (_label, content) => {
      serveBundle("demo.tsx", content);
      const out = await getExamplesTool(CONFIG, { name: "odd" });
      const blocks = codeBlocks(out);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].body).toBe(content);
      expect(prose(out)).not.toContain("MARK_CONTENT");
    }
  );

  it("the CLI prints the same contained text", async () => {
    process.env.KEYSTONEUI_REGISTRY_URL = R;
    inDir(projectDir({}));
    serveBundle("demo.tsx\n```\n\nMARK_PATH", "a\n```\nMARK_CONTENT\n");
    const io = captureConsole();
    await runCli(["examples", "odd"]);
    expect(prose(io.stdout)).not.toMatch(MARK_AT_LINE_START);
    expect(codeBlocks(io.stdout)).toHaveLength(1);
    expect(prose(io.stdout)).not.toContain("MARK_CONTENT");
  });
});

describe("first-party sources holding a run of three backticks", () => {
  // These print with a longer fence than three, so the block holds the
  // whole file. A new such file shows up here as a change to this list.
  const EXPECTED = [
    "admin-01 registry/default/blocks/admin-01/components/filter-trigger.tsx",
    "filter-pills registry/default/blocks/admin-01/components/filter-trigger.tsx",
    "npm/filter-pills apps/docs/demos/blocks/admin-01/filter-trigger.tsx",
    "npm/users-01 apps/docs/demos/blocks/admin-01/filter-trigger.tsx",
    "table packages/ui/src/table.tsx",
    "users-01 registry/default/blocks/admin-01/components/filter-trigger.tsx",
  ];

  function builtItems(): RegistryItem[] {
    const items: RegistryItem[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir).sort()) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
        } else if (entry.endsWith(".json") && entry !== "registry.json") {
          items.push(JSON.parse(readFileSync(full, "utf-8")));
        }
      }
    };
    walk(BUILT);
    return items;
  }

  const items = builtItems();
  const holding = items.flatMap((item) =>
    (item.files ?? [])
      .filter((file) => BACKTICK_RUN.test(file.content ?? ""))
      .map((file) => ({ item, file }))
  );

  it("are exactly these", () => {
    expect(
      holding.map(({ item, file }) => `${item.name} ${file.path}`).sort()
    ).toEqual(EXPECTED);
  });

  it("each ends with a line break, so none gains one at the view", () => {
    const without = items.flatMap((item) =>
      (item.files ?? [])
        .filter((file) => file.content && !file.content.endsWith("\n"))
        .map((file) => `${item.name} ${file.path}`)
    );
    expect(without).toEqual([]);
  });

  it.each(EXPECTED.map((key) => [key] as const))(
    "%s prints the whole file in one block",
    async (key) => {
      const found = holding.find(
        (entry) => `${entry.item.name} ${entry.file.path}` === key
      );
      const { item, file } = found as (typeof holding)[number];
      serveItem(item);
      const out = await viewComponentTool(CONFIG, { names: [item.name] });
      const block = codeBlocks(out).find((b) => `${b.body}\n` === file.content);
      // The fence is longer than the longest backtick run in the file.
      const longest = Math.max(
        ...[...(file.content ?? "").matchAll(ANY_RUN)].map((m) => m[0].length)
      );
      expect(out).toContain(`\n${"`".repeat(longest + 1)}tsx\n`);
      expect(block, key).toBeDefined();
    }
  );
});

describe("theme commands quote the configured URL as one word", () => {
  it.each([
    [
      "a query",
      "https://example.test/r?team=a&b=c",
      "'https://example.test/r/default.json?team=a&b=c'",
      "'https://example.test/r/theme/<code>.json?team=a&b=c'",
    ],
    [
      "a space",
      "https://example.test/my r",
      "'https://example.test/my r/default.json'",
      "'https://example.test/my r/theme/<code>.json'",
    ],
    [
      "an apostrophe",
      "https://example.test/it's/r",
      "'https://example.test/it'\\''s/r/default.json'",
      "'https://example.test/it'\\''s/r/theme/<code>.json'",
    ],
    [
      "nothing to quote",
      "https://example.test/r",
      "https://example.test/r/default.json",
      "https://example.test/r/theme/<code>.json",
    ],
  ])("get_theme_info with %s", (_label, url, style, theme) => {
    inDir(projectDir({}));
    const out = getThemeInfoTool({ ...CONFIG, registry: { url } });
    expect(out).toContain(`\nnpx shadcn@latest add ${style}\n`);
    expect(out).toContain(`\nnpx shadcn@latest add ${theme}\n`);
  });

  it.each([
    [
      "a query",
      "https://example.test/x?a=b&c",
      [],
      `'https://example.test/x?a=b&c/r/theme/${CODE}.json'`,
    ],
    [
      "a dollar sign",
      "https://example.test/$x",
      [],
      `'https://example.test/$x/r/theme/${CODE}.json'`,
    ],
    [
      "an ordinary URL and a part",
      "https://keystoneui.io",
      ["--only", "theme"],
      `'https://keystoneui.io/r/theme/${CODE}.json?only=theme'`,
    ],
    [
      "an ordinary URL",
      "https://keystoneui.io",
      [],
      `https://keystoneui.io/r/theme/${CODE}.json`,
    ],
  ])("the theme verb with %s", async (_label, url, flags, word) => {
    process.env.KEYSTONEUI_URL = url;
    const io = captureConsole();
    await runCli(["theme", CODE, ...flags]);
    expect(io.stdout).toContain(`\n  npx shadcn@latest add ${word}\n`);
  });
});

describe("thrown messages are escaped where they are built", () => {
  it("shown twice is shown once", () => {
    const text = "a\nb\u0001c\u2028```d";
    expect(shown(shown(text))).toBe(shown(text));
  });

  it("an HTTP failure names a configured URL on one line", async () => {
    const registry = "https://example.test/r\u0001MARK_URL";
    stubFetch({
      [`${registry}/registry.json`]: { status: 500 },
    });
    const error = await listComponentsTool(
      { ...CONFIG, registry: { url: registry } },
      { limit: 20, offset: 0 }
    ).catch((e: Error) => e);
    expect((error as Error).message).not.toMatch(CONTROL);
    expect((error as Error).message).toMatch(STATUS_500);
  });

  it("a response that is not JSON is reported on one line", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve().then(() => JSON.parse("<html>\nMARK_BODY")),
        })
      )
    );
    const error = await listComponentsTool(CONFIG, {
      limit: 20,
      offset: 0,
    }).catch((e: Error) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).not.toMatch(NEWLINE);
  });

  it("a docs network failure in the CLI is reported on one line", async () => {
    process.env.KEYSTONEUI_URL = "https://docs.example.test";
    inDir(projectDir({}));
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("fetch failed\nMARK_NET")))
    );
    const error = await runCli(["docs", "button"]).catch((e: Error) => e);
    expect(error).toBeInstanceOf(TypeError);
    expect((error as Error).message).not.toMatch(NEWLINE);
  });
});

describe("CLI diagnostics echo the caller's text on one line", () => {
  it.each(["kit\nMARK_TYPE", "kit\u0001MARK_TYPE"])(
    "--type %j",
    async (value) => {
      const error = await runCli(["list", "--type", value]).catch(
        (e: Error) => e
      );
      expect((error as Error).message).toBe(
        `Invalid --type value "${shown(value)}". Expected one of: ui, block, example, kit, style, theme, item.`
      );
    }
  );

  it.each(["x\nMARK_LIMIT", "x\u0001MARK_LIMIT"])(
    "--limit %j",
    async (value) => {
      const error = await runCli(["list", "--limit", value]).catch(
        (e: Error) => e
      );
      expect((error as Error).message).toBe(
        `Expected an integer, got "${shown(value)}".`
      );
    }
  );

  it("an ordinary bad integer keeps its message", async () => {
    const error = await runCli(["list", "--limit", "x"]).catch((e: Error) => e);
    expect((error as Error).message).toBe('Expected an integer, got "x".');
  });

  it.each(["x\nMARK_VERB", "x\u0001MARK_VERB"])(
    "an unknown verb %j",
    async (verb) => {
      const io = captureConsole();
      await runCli([verb]);
      expect(io.stderr.split("\n")[0]).toBe(`Unknown verb: "${shown(verb)}".`);
      expect(process.exitCode).toBe(1);
    }
  );

  it.each(["unknown\nMARK_INIT", "unknown\u0001MARK_INIT"])(
    "init with an unknown client %j",
    (client) => {
      const dir = projectDir({});
      inDir(dir);
      process.argv = ["node", "keystoneui", "init", "--client", client];
      const io = captureConsole();
      init();
      expect(io.stderr.split("\n")[0]).toBe(
        `Unknown client: "${shown(client)}"`
      );
      expect(readdirSync(dir)).toEqual([]);
      expect(process.exitCode).toBe(1);
    }
  );
});

describe("the audit formatter names the file on one line", () => {
  it.each(["file\nMARK_AUDIT", "file\u0001MARK_AUDIT"])(
    "with no token pairs, for %j",
    (file) => {
      expect(formatAudit(file, [])).toBe(
        `No keystone token pairs found in ${shown(file)}. Pass the CSS file that holds :root and .dark.`
      );
    }
  );

  it("with results", () => {
    const out = formatAudit("file\nMARK_AUDIT", [
      { mode: "light", pair: "a on b", ratio: 5, status: "pass" },
    ]);
    expect(out).not.toMatch(MARK_AT_LINE_START);
  });

  it("through `audit --theme` with a real file", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ks-audit-"));
    const file = join(dir, "a\nMARK_FILE.css");
    writeFileSync(file, ":root { --primary: oklch(0.2 0 0); }\n");
    try {
      const io = captureConsole();
      await runCli(["audit", "--theme", file]);
      expect(io.stdout).not.toMatch(MARK_AT_LINE_START);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });
});

describe("project values stay inside their table cell", () => {
  it("a pipe does not split a cell", () => {
    inDir(
      projectDir({
        "components.json": {
          aliases: { ui: "@/ui | x | y" },
          iconLibrary: "lucide | z",
          tailwind: { css: "a|b.css" },
        },
        "package.json": { packageManager: "pnpm|q@1" },
      })
    );
    const rows = getProjectContextTool()
      .split("\n")
      .filter((line) => line.startsWith("| "));
    for (const row of rows) {
      expect(row.replaceAll("\\|", "").split("|"), row).toHaveLength(4);
    }
    expect(rows).toContain("| ui alias | @/ui \\| x \\| y |");
    expect(rows).toContain(
      "| install mode | **registry** -- source is vendored via shadcn. Import from `@/ui \\| x \\| y`. |"
    );
  });

  it("a package-mode range with a pipe stays in its cell", () => {
    inDir(
      projectDir({
        "package.json": {
          dependencies: { "@keystoneui/react": "^1.0.0 || ^2.0.0" },
        },
      })
    );
    const row = getProjectContextTool()
      .split("\n")
      .find((line) => line.startsWith("| install mode")) as string;
    expect(row.replaceAll("\\|", "").split("|")).toHaveLength(4);
  });
});

describe("a flavour's inherited docs page uses the item-name rules", () => {
  function flavourOf(
    parent: string,
    type = "registry:ui",
    flavour = `pkg/${parent}`
  ): RegistryItem[] {
    return [
      { name: parent, type },
      {
        name: flavour,
        type,
        meta: { keystoneui: { flavourOf: parent } },
      },
    ];
  }

  it.each(["Button_v2", "x.json", "button+icon", "é-x"])(
    "a parent named %j resolves",
    async (parent) => {
      const first = `${DOCS}/components/pkg/${parent}`;
      const page = `${DOCS}/components/${parent}`;
      const { calls } = stubFetch({
        [first]: { status: 404 },
        [MANIFEST_URL]: { body: manifest(flavourOf(parent)) },
        [page]: { body: "# Page\n" },
      });
      expect(
        await getDocsTool(CONFIG, { name: `pkg/${parent}`, type: "component" })
      ).toBe(`Documented in /docs/components/${parent}.\n\n# Page\n`);
      expect(calls).toEqual([first, MANIFEST_URL, page]);
    }
  );

  it("the CLI resolves the same and exits 0", async () => {
    process.env.KEYSTONEUI_URL = "https://docs.example.test";
    process.env.KEYSTONEUI_REGISTRY_URL = R;
    inDir(projectDir({}));
    stubFetch({
      [`${DOCS}/components/pkg/Button_v2`]: { status: 404 },
      [MANIFEST_URL]: { body: manifest(flavourOf("Button_v2")) },
      [`${DOCS}/components/Button_v2`]: { body: "# Page\n" },
    });
    const io = captureConsole();
    await runCli(["docs", "pkg/Button_v2"]);
    expect(io.stdout).toBe(
      "Documented in /docs/components/Button_v2.\n\n# Page\n"
    );
    expect(process.exitCode).toBeUndefined();
  });

  it.each([
    ["a delimiter", "a?b", "registry:ui"],
    ["a dot segment", "../x", "registry:ui"],
    ["a type with no docs section", "demo", "registry:example"],
  ])(
    "a parent with %s gives today's not-found text",
    async (_l, parent, type) => {
      // The flavour has a plain name; only the parent's is in question.
      const first = `${DOCS}/components/pkg/x`;
      const { calls } = stubFetch({
        [first]: { status: 404 },
        [MANIFEST_URL]: { body: manifest(flavourOf(parent, type, "pkg/x")) },
      });
      expect(
        await getDocsTool(CONFIG, { name: "pkg/x", type: "component" })
      ).toBe(
        "**pkg/x**: no component docs found (404). Try search_components to find the right name."
      );
      expect(calls).toEqual([first, MANIFEST_URL]);
    }
  );
});

describe("info prints the runtime's values on one line", () => {
  it("node version and platform", async () => {
    inDir(projectDir({}));
    const version = Object.getOwnPropertyDescriptor(process, "version");
    const platform = Object.getOwnPropertyDescriptor(process, "platform");
    Object.defineProperty(process, "version", {
      configurable: true,
      value: "v1\nMARK_NODE",
    });
    Object.defineProperty(process, "platform", {
      configurable: true,
      value: "os\nMARK_OS",
    });
    try {
      const io = captureConsole();
      await runCli(["info"]);
      expect(io.stdout).not.toMatch(MARK_AT_LINE_START);
    } finally {
      Object.defineProperty(process, "version", version as PropertyDescriptor);
      Object.defineProperty(
        process,
        "platform",
        platform as PropertyDescriptor
      );
    }
  });
});
