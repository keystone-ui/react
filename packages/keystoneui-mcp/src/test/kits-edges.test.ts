/**
 * The edges of the output rule: table cells read by a GFM table parser,
 * names whose last segment the URL parser trims, errors caught from the
 * platform, a parent type that is not a registry type, code block endings,
 * install commands as code blocks, and a file content that is not text.
 */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProjectConfig } from "../config.js";
import { clearCache } from "../fetcher.js";
import { nameRefusal } from "../item-name.js";
import { registryDemosUrl, registryItemUrl } from "../registry-url.js";
import { escapedError, inlineCode, shown, tableCell } from "../render.js";
import {
  getAddCommandTool,
  getDocsTool,
  getExamplesTool,
  getProjectContextTool,
  listComponentsTool,
  viewComponentTool,
} from "../tools.js";
import {
  cleanDirs,
  forbidFetch,
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
const REPO_ROOT = join(import.meta.dirname, "../../../..");
const CELL = /<t[dh]>([\s\S]*?)<\/t[dh]>/g;
const ROW = /<tr>([\s\S]*?)<\/tr>/g;
const BREAK = /[\n\r]/;
const THREE_FENCE_BASH = /^```bash$/m;

const env = { ...process.env };

beforeEach(() => {
  clearCache();
});

afterEach(() => {
  process.env = { ...env };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  cleanDirs();
});

/**
 * The repository's installed GFM table parser, reached through the docs
 * app's own dependencies (no new dependency).
 */
async function gfmTable(): Promise<(markdown: string) => string[][]> {
  const fromDocs = createRequire(join(REPO_ROOT, "apps/docs/package.json"));
  const gfm = createRequire(fromDocs.resolve("remark-gfm")).resolve(
    "micromark-extension-gfm"
  );
  const table = createRequire(gfm).resolve("micromark-extension-gfm-table");
  const core = createRequire(table).resolve("micromark");
  const { micromark } = await import(core);
  const { gfmTable: syntax, gfmTableHtml: html } = await import(table);
  return (markdown: string) =>
    [
      ...(
        micromark(markdown, {
          extensions: [syntax()],
          htmlExtensions: [html()],
        }) as string
      ).matchAll(ROW),
    ].map((row) => [...row[1].matchAll(CELL)].map((cell) => cell[1]));
}

describe("a table cell, read by the GFM table parser", () => {
  const SLASH = "\\";

  it.each([0, 1, 2, 3])(
    "a pipe after %i backslashes stays in its prose cell",
    async (count) => {
      const parse = await gfmTable();
      const value = `a${SLASH.repeat(count)}|b`;
      const rows = parse(
        `| field | value |\n|---|---|\n| x | ${tableCell(shown(value))} |\n`
      );
      expect(rows[1]).toHaveLength(2);
      // The pipe and both sides stay in the one cell; each backslash pair
      // reads as one backslash, as GFM escapes do.
      expect(rows[1][1]).toBe(`a${SLASH.repeat(Math.floor(count / 2))}|b`);
    }
  );

  async function inlineCodeRow(count: number): Promise<string[]> {
    const parse = await gfmTable();
    const value = `a${SLASH.repeat(count)}|b`;
    return parse(
      `| field | value |\n|---|---|\n| x | ${tableCell(inlineCode(value))} |\n`
    )[1];
  }

  it.each([0, 1, 2, 3])(
    "a pipe after %i backslashes stays in its inline-code cell",
    async (count) => {
      const row = await inlineCodeRow(count);
      expect(row).toHaveLength(2);
      expect(row[0]).toBe("x");
      expect(row[1].startsWith("<code>a")).toBe(true);
      expect(row[1].endsWith("|b</code>")).toBe(true);
    }
  );

  it.each([0, 2])(
    "an inline-code cell with %i backslashes before a pipe shows the value",
    async (count) => {
      expect(await inlineCodeRow(count)).toEqual([
        "x",
        `<code>a${SLASH.repeat(count)}|b</code>`,
      ]);
    }
  );

  // Known limit: a table reads `\|` as a pipe even inside a code span, so
  // after an odd run of backslashes one backslash is lost. A fix turns
  // these red; then drop `.fails`.
  it.fails.each([1, 3])(
    "an inline-code cell with %i backslashes before a pipe shows the value",
    async (count) => {
      expect(await inlineCodeRow(count)).toEqual([
        "x",
        `<code>a${SLASH.repeat(count)}|b</code>`,
      ]);
    }
  );

  it("a value ending in a backslash keeps the row's closing pipe", async () => {
    const parse = await gfmTable();
    const rows = parse(
      `| field | value |\n|---|---|\n| x | ${tableCell(shown("dir\\"))} |\n`
    );
    expect(rows[1]).toEqual(["x", "dir\\"]);
  });

  it("an already escaped pipe is kept as it is", () => {
    expect(tableCell("a\\|b")).toBe("a\\|b");
    expect(tableCell("a|b")).toBe("a\\|b");
    expect(tableCell("a\\\\|b")).toBe("a\\\\\\|b");
  });

  it("project context rows keep two cells for a backslash before a pipe", async () => {
    const parse = await gfmTable();
    inDir(
      projectDir({
        "components.json": {
          aliases: { ui: "@/ui\\|x" },
          iconLibrary: "lucide\\| y | z",
          tailwind: { css: "a\\\\|b.css" },
        },
        "package.json": {
          dependencies: { "@keystoneui/react": "^1.0.0 || ^2.0.0" },
        },
      })
    );
    const out = getProjectContextTool();
    const table = out.split("\n").filter((line) => line.startsWith("|"));
    const rows = parse(`${table.join("\n")}\n`);
    for (const row of rows) {
      expect(row, row.join(" ¦ ")).toHaveLength(2);
    }
    // GFM drops cells past the header's count, so the values tell.
    const cell = (field: string) => rows.find((row) => row[0] === field)?.[1];
    expect(cell("icon library")).toBe("lucide| y | z");
    expect(cell("ui alias")).toBe("@/ui|x");
    expect(cell("theme CSS file")).toBe("a\\|b.css");
    expect(rows.find((row) => row[0] === "install mode")?.[1]).toContain(
      "^1.0.0 || ^2.0.0"
    );
  });
});

describe("a name whose last segment the URL parser trims", () => {
  const REFUSED: [string, string][] = [
    [".. ", "dot segment"],
    ["x/.. ", "dot segment"],
    [". ", "dot segment"],
    ["a/ ", "empty path segment"],
  ];

  it.each(REFUSED)("%j is refused (%s)", (name, reason) => {
    expect(nameRefusal(name)).toBe(
      `**${name}**: not a valid registry item name (${reason}).`
    );
  });

  it.each(REFUSED)(
    "%j is refused by every tool, with no request",
    async (name) => {
      const { fn } = forbidFetch();
      expect(await viewComponentTool(CONFIG, { names: [name] })).toContain(
        "not a valid registry item name"
      );
      expect(await getAddCommandTool(CONFIG, { names: [name] })).toContain(
        "No install command"
      );
      expect(await getExamplesTool(CONFIG, { name })).toContain(
        "not a valid registry item name"
      );
      expect(await getDocsTool(CONFIG, { name, type: "component" })).toContain(
        "not a valid registry item name"
      );
      expect(fn).not.toHaveBeenCalled();
    }
  );

  it("where the name is last, the parser would leave the item's path", () => {
    expect(new URL(registryDemosUrl(CONFIG.registry, ".. ")).pathname).toBe(
      "/r/"
    );
    expect(
      new URL(`${CONFIG.docsUrl}/llms.mdx/docs/components/.. `).pathname
    ).toBe("/llms.mdx/docs/");
    expect(new URL(registryDemosUrl(CONFIG.registry, "a/ ")).pathname).toBe(
      "/r/demos/a/"
    );
    // In the item URL the name is not last.
    expect(new URL(registryItemUrl(CONFIG.registry, ".. ")).pathname).toBe(
      "/r/..%20.json"
    );
  });

  it.each(["a b", "x ", "a b ", "..x ", "x/.y "])(
    "%j stays accepted and is requested as before",
    async (name) => {
      expect(nameRefusal(name)).toBeNull();
      const { calls } = stubFetch({
        [`${R}/${name}.json`]: { body: { name, title: "T" } },
      });
      await viewComponentTool(CONFIG, { names: [name] });
      expect(calls).toEqual([`${R}/${name}.json`]);
    }
  );

  it("no first-party name ends with a space", () => {
    const registry = JSON.parse(
      readFileSync(join(REPO_ROOT, "registry.json"), "utf-8")
    ) as { items: { name: string }[] };
    expect(registry.items.filter((item) => item.name.endsWith(" "))).toEqual(
      []
    );
  });
});

describe("an error caught from the platform", () => {
  it("keeps its kind and escapes its message", () => {
    const error = escapedError(new SyntaxError("bad\nJSON")) as Error;
    expect(error).toBeInstanceOf(SyntaxError);
    expect(error.name).toBe("SyntaxError");
    expect(error.message).toBe("bad\\u000aJSON");
  });

  it("keeps its code and cause", () => {
    const original = Object.assign(
      new TypeError("failed\nagain", { cause: new Error("network") }),
      { code: "ECONNRESET" }
    );
    const error = escapedError(original) as TypeError & {
      cause: Error;
      code: string;
    };
    expect(error).toBeInstanceOf(TypeError);
    expect(error.code).toBe("ECONNRESET");
    expect(error.cause).toBeInstanceOf(Error);
    expect(error.cause.message).toBe("network");
    expect(error.message).toBe("failed\\u000aagain");
  });

  it("escapes a leading fence marker", () => {
    expect((escapedError(new Error("```text")) as Error).message).toBe(
      shown("```text")
    );
  });

  it("escapes a string rejection", () => {
    expect(escapedError("bad\nMARK_STRING")).toBe("bad\\u000aMARK_STRING");
  });

  it("escapes a multi-line cause under a plain message", () => {
    const original = new TypeError("fetch failed", {
      cause: new Error("cause\nMARK_CAUSE"),
    });
    const error = escapedError(original) as TypeError & { cause: Error };
    expect(error).toBeInstanceOf(TypeError);
    expect(error.message).toBe("fetch failed");
    expect(error.cause.message).toBe("cause\\u000aMARK_CAUSE");
  });

  it("stops at a cause that cycles", () => {
    const a = new Error("a\nA");
    const b = new Error("b\nB", { cause: a });
    (a as Error & { cause: unknown }).cause = b;
    const error = escapedError(a) as Error & {
      cause: Error & { cause: Error };
    };
    expect(error.message).toBe("a\\u000aA");
    expect(error.cause.message).toBe("b\\u000aB");
    expect(error.cause.cause).toBe(error);
  });

  it("escapes the message at the head of a stack already read", () => {
    const original = new Error("first\nMARK_STACK");
    expect(original.stack).toContain("first\nMARK_STACK");
    const error = escapedError(original) as Error;
    expect(error.stack?.split("\n")[0]).toBe("Error: first\\u000aMARK_STACK");
  });

  it("returns a plain error as it is", () => {
    const original = Object.assign(new Error("plain"), { code: "X" });
    expect(escapedError(original)).toBe(original);
  });

  it("a body that is not JSON rejects as a SyntaxError on one line", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("<html>\nMARK_BODY")))
    );
    const error = await listComponentsTool(CONFIG, {
      limit: 20,
      offset: 0,
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(SyntaxError);
    expect((error as Error).message).not.toMatch(BREAK);
  });

  it("a string rejection reaches the caller on one line", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject("bad\nMARK_STRING"))
    );
    const error = await listComponentsTool(CONFIG, {
      limit: 20,
      offset: 0,
    }).catch((e: unknown) => e);
    expect(error).toBe("bad\\u000aMARK_STRING");
  });

  it("a multi-line cause reaches the caller escaped", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.reject(
          new TypeError("fetch failed", {
            cause: new Error("cause\nMARK_CAUSE"),
          })
        )
      )
    );
    const error = (await listComponentsTool(CONFIG, {
      limit: 20,
      offset: 0,
    }).catch((e: unknown) => e)) as TypeError & { cause: Error };
    expect(error).toBeInstanceOf(TypeError);
    expect(error.cause.message).toBe("cause\\u000aMARK_CAUSE");
  });
});

describe("a parent type that is not a registry type", () => {
  it.each(["constructor", "toString", "__proto__"])(
    "type %j gives the first 404 and no third request",
    async (type) => {
      const first = `${DOCS}/components/pkg/x`;
      const { calls } = stubFetch({
        [first]: { status: 404 },
        [MANIFEST_URL]: {
          body: manifest([
            { name: "x", type },
            {
              name: "pkg/x",
              type: "registry:ui",
              meta: { keystoneui: { flavourOf: "x" } },
            },
          ]),
        },
      });
      expect(
        await getDocsTool(CONFIG, { name: "pkg/x", type: "component" })
      ).toBe(
        "**pkg/x**: no component docs found (404). Try search_components to find the right name."
      );
      expect(calls).toEqual([first, MANIFEST_URL]);
    }
  );

  it.each([
    ["registry:ui", "components"],
    ["registry:block", "blocks"],
  ])("type %j still gives its parent's page", async (type, section) => {
    const first = `${DOCS}/components/pkg/Button_v2`;
    const page = `${DOCS}/${section}/Button_v2`;
    stubFetch({
      [first]: { status: 404 },
      [MANIFEST_URL]: {
        body: manifest([
          { name: "Button_v2", type },
          {
            name: "pkg/Button_v2",
            type,
            meta: { keystoneui: { flavourOf: "Button_v2" } },
          },
        ]),
      },
      [page]: { body: "# Page\n" },
    });
    expect(
      await getDocsTool(CONFIG, { name: "pkg/Button_v2", type: "component" })
    ).toBe(`Documented in /docs/${section}/Button_v2.\n\n# Page\n`);
  });
});

describe("how a source body ends", () => {
  function serveItem(content: unknown) {
    stubFetch({
      [`${R}/odd.json`]: {
        body: {
          name: "odd",
          title: "Odd",
          files: [{ content, path: "a.tsx", type: "x" }],
        },
      },
    });
  }
  function serveDemo(content: string) {
    stubFetch({
      [`${R}/demos/odd`]: {
        body: { files: [{ content, path: "a.tsx" }], name: "odd" },
      },
    });
  }
  const HEAD = "**Odd** (`odd`)\n\n### a.tsx\n";
  const DEMO_HEAD = "# odd examples\n\n1 file:\n\n\n\n### a.tsx\n\n";

  it.each([
    ["LF", "x\n", "```tsx\nx\n```"],
    ["CRLF", "x\r\n", "```tsx\nx\r\n```"],
    ["CR", "x\r", "```tsx\nx\r```"],
    ["no final break (named exception)", "x", "```tsx\nx\n```"],
    ["a backtick run", "a\n```\nb\n", "````tsx\na\n```\nb\n````"],
  ])("view keeps a body ending in %s", async (_label, content, block) => {
    serveItem(content);
    expect(await viewComponentTool(CONFIG, { names: ["odd"] })).toBe(
      `${HEAD}${block}`
    );
  });

  it.each([
    ["LF", "x\n", "```tsx\nx\n\n```"],
    ["CRLF", "x\r\n", "```tsx\nx\r\n\n```"],
    ["CR", "x\r", "```tsx\nx\r\n```"],
    ["no final break", "x", "```tsx\nx\n```"],
    ["an empty file", "", "```tsx\n\n```"],
  ])(
    "examples keeps its extra line break for a body ending in %s",
    async (_label, content, block) => {
      serveDemo(content);
      expect(await getExamplesTool(CONFIG, { name: "odd" })).toBe(
        `${DEMO_HEAD}${block}`
      );
    }
  );

  it("view prints a file content that is not text inside its code block; a body without a final line break gains one", async () => {
    serveItem(5);
    expect(await viewComponentTool(CONFIG, { names: ["odd"] })).toBe(
      `${HEAD}\`\`\`tsx\n5\n\`\`\``
    );
  });
});

describe("install commands are code blocks", () => {
  it("a URL holding a backtick run gets a longer fence", async () => {
    forbidFetch();
    const out = await getAddCommandTool(CONFIG, { names: ["a```b"] });
    const url = `'${R}/a\`\`\`b.json'`;
    expect(out).toContain(
      `\`\`\`\`bash\nnpx shadcn@latest add ${url}\n\`\`\`\``
    );
    expect(out).not.toMatch(THREE_FENCE_BASH);
  });
});
