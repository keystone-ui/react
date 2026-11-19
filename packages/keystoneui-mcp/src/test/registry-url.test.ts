import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadProjectConfig } from "../config.js";
import { displayUrl } from "../display-url.js";
import { clearCache } from "../fetcher.js";
import { runInfo } from "../info.js";
import {
  getAddCommandTool,
  getExamplesTool,
  getThemeInfoTool,
  listComponentsTool,
  viewComponentTool,
} from "../tools.js";

// How a configured registry URL becomes the URL of the catalogue, an item and
// its demos: the query stays a query, the fragment is dropped, trailing
// slashes do not double, and a components.json `{name}` template is filled
// in with its `params` after the template's own query.

const TRAILING_SLASHES = /\/+$/;

// Obviously fake: never a real credential.
const FAKE = "FAKE_S_not_a_real_value";

const env = { ...process.env };
let dirs: string[] = [];
let calls: string[] = [];

beforeEach(() => {
  clearCache();
  calls = [];
  delete process.env.KEYSTONEUI_URL;
  delete process.env.KEYSTONEUI_REGISTRY_URL;
  // No request leaves the process: every fetch is answered here.
  vi.spyOn(globalThis, "fetch").mockImplementation(
    (input: string | URL | Request) => {
      calls.push(String(input));
      return Promise.resolve(
        Response.json({
          name: "button",
          type: "registry:ui",
          items: [],
          files: [],
        })
      );
    }
  );
});

afterEach(() => {
  process.env = { ...env };
  vi.restoreAllMocks();
  for (const dir of dirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  dirs = [];
});

/** Run with a fresh cwd, holding this components.json if one is given. */
function project(componentsJson?: unknown): void {
  const dir = mkdtempSync(join(tmpdir(), "keystoneui-mcp-registry-"));
  dirs.push(dir);
  if (componentsJson !== undefined) {
    writeFileSync(join(dir, "components.json"), JSON.stringify(componentsJson));
  }
  vi.spyOn(process, "cwd").mockReturnValue(dir);
}

function envRegistry(url: string): void {
  project();
  process.env.KEYSTONEUI_REGISTRY_URL = url;
}

function entry(value: unknown): void {
  project({ registries: { "@keystoneui": value } });
}

async function requestsFor(name: string): Promise<string[]> {
  const config = loadProjectConfig();
  await listComponentsTool(config, { limit: 20, offset: 0 });
  await viewComponentTool(config, { names: [name] });
  await getExamplesTool(config, { name });
  return calls;
}

/**
 * A configured URL holding a line break or control character: no command is
 * printed from it, only the guidance, since it cannot be one command line.
 */
// biome-ignore lint/suspicious/noControlCharactersInRegex: the characters tested
const BREAK_OR_CONTROL = /[\u0000-\u001f\u007f]/;

function printedAdd(name: string): string {
  return getAddCommandTool(loadProjectConfig(), { names: [name] });
}

/**
 * A URL printed in an install command, as the shell reads it: one with a
 * character the shell treats specially is printed in single quotes.
 */
function unquoted(word: string): string {
  return word.startsWith("'") && word.endsWith("'")
    ? word.slice(1, -1).replaceAll("'\\''", "'")
    : word;
}

function registryLink(): string {
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  runInfo(["--json"]);
  const out = log.mock.calls.map((c) => c.join(" ")).join("\n");
  log.mockRestore();
  return JSON.parse(out).links.registry;
}

describe("a base URL with a query", () => {
  const base = `https://reg.example.test/r?token=${FAKE}`;

  it("keeps the query after the path", async () => {
    envRegistry(base);
    expect(await requestsFor("button")).toEqual([
      `https://reg.example.test/r/registry.json?token=${FAKE}`,
      `https://reg.example.test/r/button.json?token=${FAKE}`,
      `https://reg.example.test/r/demos/button?token=${FAKE}`,
    ]);
  });

  it("keeps every parameter and their order", async () => {
    envRegistry("https://reg.example.test/r?a=1&b=2&a=3");
    expect(await requestsFor("npm/users-01")).toEqual([
      "https://reg.example.test/r/registry.json?a=1&b=2&a=3",
      "https://reg.example.test/r/npm/users-01.json?a=1&b=2&a=3",
      "https://reg.example.test/r/demos/npm/users-01?a=1&b=2&a=3",
    ]);
  });

  it("prints an install command whose path is the item's", () => {
    envRegistry(base);
    expect(printedAdd("button")).toContain(
      `npx shadcn@latest add 'https://reg.example.test/r/button.json?token=${FAKE}'\n`
    );
  });

  it("prints theme commands whose paths are the items'", () => {
    envRegistry(base);
    const text = getThemeInfoTool(loadProjectConfig());
    // A URL with a query is one quoted word, as in get_add_command.
    expect(text).toContain(
      `npx shadcn@latest add 'https://reg.example.test/r/default.json?token=${FAKE}'\n`
    );
    expect(text).toContain(
      `npx shadcn@latest add 'https://reg.example.test/r/theme/<code>.json?token=${FAKE}'\n`
    );
  });

  it("links the catalogue in info with the value hidden", () => {
    envRegistry(base);
    expect(registryLink()).toBe(
      "https://reg.example.test/r/registry.json?token=REDACTED"
    );
  });

  it("is fixed the same way in a components.json base url object", async () => {
    entry({ url: "https://legacy.example.test/r/?v=1" });
    expect(await requestsFor("button")).toEqual([
      "https://legacy.example.test/r/registry.json?v=1",
      "https://legacy.example.test/r/button.json?v=1",
      "https://legacy.example.test/r/demos/button?v=1",
    ]);
  });
});

describe("a base URL with a fragment", () => {
  it("drops the fragment instead of the path", async () => {
    envRegistry("https://reg.example.test/r#frag");
    expect(await requestsFor("button")).toEqual([
      "https://reg.example.test/r/registry.json",
      "https://reg.example.test/r/button.json",
      "https://reg.example.test/r/demos/button",
    ]);
    expect(printedAdd("button")).toContain(
      "npx shadcn@latest add https://reg.example.test/r/button.json\n"
    );
  });

  it("keeps the query that comes before it", async () => {
    envRegistry("https://reg.example.test/r?v=1#frag");
    expect(await requestsFor("button")).toEqual([
      "https://reg.example.test/r/registry.json?v=1",
      "https://reg.example.test/r/button.json?v=1",
      "https://reg.example.test/r/demos/button?v=1",
    ]);
  });
});

describe("a base URL with trailing slashes", () => {
  it.each(["https://reg.example.test/r/", "https://reg.example.test/r//"])(
    "%s does not double the slash",
    async (url) => {
      envRegistry(url);
      expect(await requestsFor("button")).toEqual([
        "https://reg.example.test/r/registry.json",
        "https://reg.example.test/r/button.json",
        "https://reg.example.test/r/demos/button",
      ]);
      expect(printedAdd("button")).toContain(
        "npx shadcn@latest add https://reg.example.test/r/button.json\n"
      );
      expect(registryLink()).toBe("https://reg.example.test/r/registry.json");
    }
  );

  it("composes from a bare origin with a slash", async () => {
    envRegistry("https://reg.example.test/");
    expect(await requestsFor("button")).toEqual([
      "https://reg.example.test/registry.json",
      "https://reg.example.test/button.json",
      "https://reg.example.test/demos/button",
    ]);
  });
});

describe("a components.json {name} template", () => {
  const url = "https://tpl.example.test/r/{name}.json";

  it("fills in the item and derives the catalogue and demos", async () => {
    entry({ url });
    expect(await requestsFor("button")).toEqual([
      "https://tpl.example.test/r/registry.json",
      "https://tpl.example.test/r/button.json",
      "https://tpl.example.test/r/demos/button",
    ]);
  });

  it("keeps the slashes of a nested name", async () => {
    entry({ url });
    expect(await requestsFor("theme/k1_slate_0.55_0.2_250_md_inter")).toEqual([
      "https://tpl.example.test/r/registry.json",
      "https://tpl.example.test/r/theme/k1_slate_0.55_0.2_250_md_inter.json",
      "https://tpl.example.test/r/demos/theme/k1_slate_0.55_0.2_250_md_inter",
    ]);
  });

  it("fills in a name in the middle of the path", async () => {
    entry({ url: "https://tpl.example.test/items/{name}/index.json" });
    const config = loadProjectConfig();
    await viewComponentTool(config, { names: ["button"] });
    expect(calls).toEqual(["https://tpl.example.test/items/button/index.json"]);
  });

  it("prints install commands with the item filled in", () => {
    entry({ url });
    expect(printedAdd("button")).toContain(
      "npx shadcn@latest add https://tpl.example.test/r/button.json\n"
    );
    const text = getThemeInfoTool(loadProjectConfig());
    expect(text).toContain(
      "npx shadcn@latest add https://tpl.example.test/r/default.json\n"
    );
    expect(text).toContain(
      "npx shadcn@latest add https://tpl.example.test/r/theme/<code>.json\n"
    );
  });

  it("links the catalogue in info", () => {
    entry({ url });
    expect(registryLink()).toBe("https://tpl.example.test/r/registry.json");
  });

  it("drops a fragment", async () => {
    entry({ url: `${url}#frag` });
    expect(await requestsFor("button")).toEqual([
      "https://tpl.example.test/r/registry.json",
      "https://tpl.example.test/r/button.json",
      "https://tpl.example.test/r/demos/button",
    ]);
  });
});

describe("a {name} template's query and params", () => {
  it("appends params after the template's own query", async () => {
    entry({
      url: "https://tpl.example.test/r/{name}.json?v=1",
      params: { flavor: "a b", "x&y": "1#2" },
    });
    const query = "?v=1&flavor=a+b&x%26y=1%232";
    expect(await requestsFor("button")).toEqual([
      `https://tpl.example.test/r/registry.json${query}`,
      `https://tpl.example.test/r/button.json${query}`,
      `https://tpl.example.test/r/demos/button${query}`,
    ]);
    expect(printedAdd("button")).toContain(
      `npx shadcn@latest add 'https://tpl.example.test/r/button.json${query}'\n`
    );
  });

  it("keeps both values of a key the template and params share", async () => {
    entry({
      url: "https://tpl.example.test/r/{name}.json?v=1",
      params: { v: "2" },
    });
    await viewComponentTool(loadProjectConfig(), { names: ["button"] });
    expect(calls).toEqual(["https://tpl.example.test/r/button.json?v=1&v=2"]);
  });

  it("keeps every string param, whatever its key, in order", async () => {
    project();
    // Raw JSON, as a project's file holds it: an object literal here would
    // itself lose the `__proto__` key.
    writeFileSync(
      join(process.cwd(), "components.json"),
      `{"registries":{"@keystoneui":{
        "url":"https://tpl.example.test/r/{name}.json?v=old",
        "params":{"__proto__":"literal","v":"new","sep":"a&b=c#d","enc":"a%26b",
          "ref":"\${FAKE_TOKEN}","n":1,"z":null,"o":{"k":"x"},"l":["x"],"t":true}
      }}}`
    );
    const query =
      "?v=old&__proto__=literal&v=new&sep=a%26b%3Dc%23d&enc=a%2526b&ref=%24%7BFAKE_TOKEN%7D";
    expect(await requestsFor("button")).toEqual([
      `https://tpl.example.test/r/registry.json${query}`,
      `https://tpl.example.test/r/button.json${query}`,
      `https://tpl.example.test/r/demos/button${query}`,
    ]);
    expect(printedAdd("button")).toContain(
      `npx shadcn@latest add 'https://tpl.example.test/r/button.json${query}'\n`
    );
  });

  it("adds a query when the template has none", async () => {
    entry({
      url: "https://tpl.example.test/r/{name}.json",
      params: { v: "2" },
    });
    expect(await requestsFor("button")).toEqual([
      "https://tpl.example.test/r/registry.json?v=2",
      "https://tpl.example.test/r/button.json?v=2",
      "https://tpl.example.test/r/demos/button?v=2",
    ]);
  });
});

describe("a URL whose authority is spelled unusually", () => {
  // The URL parser accepts more or fewer slashes after the scheme, either
  // slash, and drops tabs and newlines. Composition must read the host where
  // the parser does, or not compose at all: every request and every printed
  // URL keeps the origin the parser gives the configured URL.
  const urls = [
    ["an empty authority before the path", "https:///{name}.json"],
    ["four slashes", "https:////{name}.json"],
    ["mixed slashes around an empty authority", "https:/\\/{name}.json"],
    ["mixed slashes before a host", "https:\\/tpl.example.test/r/{name}.json"],
    ["a newline as the whole authority", "https://\n/{name}.json"],
    ["a tab as the whole authority", "https://\t/{name}.json"],
    ["a newline inside the host", "https://tpl.ex\nample.test/r/{name}.json"],
  ];

  /**
   * Every URL printed for the configured `url`. A tab or newline in its
   * authority is printed as configured, so it is dropped here, as the
   * parser drops it, before the URLs are cut out of the text.
   */
  function printedUrls(url: string): string[] {
    const config = loadProjectConfig();
    const head = url.slice(0, url.indexOf("/", "https://".length));
    const text = [printedAdd("button"), getThemeInfoTool(config)]
      .join("\n")
      .replaceAll(head, head.replace(/[\t\n\r]/g, ""));
    const added = [...text.matchAll(/shadcn@latest add (\S+)/g)].map((m) =>
      unquoted(m[1])
    );
    return [...added, registryLink()];
  }

  it.each(urls)("an object template with %s", async (_label, url) => {
    const origin = new URL(url).origin;
    entry({ url });
    const requests = await requestsFor("button");
    expect(requests).toHaveLength(3);
    const printed = printedUrls(url);
    if (BREAK_OR_CONTROL.test(url)) {
      expect(printedAdd("button")).toContain("No install command");
      expect(printed).toEqual([registryLink()]);
    } else {
      expect(printed.length).toBeGreaterThanOrEqual(4);
    }
    for (const sent of [...requests, ...printed]) {
      expect(new URL(sent).origin).toBe(origin);
    }
  });

  it.each(urls)("a base URL with %s", async (_label, template) => {
    const url = template.replace("/{name}.json", "/r?v=1");
    const origin = new URL(url).origin;
    envRegistry(url);
    const requests = await requestsFor("button");
    expect(requests).toHaveLength(3);
    for (const sent of [...requests, ...printedUrls(url)]) {
      expect(new URL(sent).origin).toBe(origin);
    }
  });
});

describe("a registry derived from the docs-site URL", () => {
  // With no registry configured, the registry is the docs site's `/r`,
  // composed into the docs URL by the same rules as any base URL.
  function docs(url: string): void {
    project();
    process.env.KEYSTONEUI_URL = url;
  }

  function info(): { registryUrl: string; registry: string } {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    runInfo(["--json"]);
    const out = JSON.parse(log.mock.calls.map((c) => c.join(" ")).join("\n"));
    log.mockRestore();
    return {
      registryUrl: out.environment.registryUrl,
      registry: out.links.registry,
    };
  }

  it.each([
    [
      "a query",
      "https://h.example.test?x=1",
      "https://h.example.test/r",
      "?x=1",
    ],
    ["a fragment", "https://h.example.test#f", "https://h.example.test/r", ""],
    [
      "a query and a fragment",
      "https://h.example.test/d?x=1#f",
      "https://h.example.test/d/r",
      "?x=1",
    ],
    [
      "a trailing slash",
      "https://h.example.test/",
      "https://h.example.test/r",
      "",
    ],
    [
      "trailing slashes after a path",
      "https://h.example.test/d//",
      "https://h.example.test/d/r",
      "",
    ],
  ])("with %s puts the resource under /r", async (_label, url, base, query) => {
    docs(url);
    expect(await requestsFor("button")).toEqual([
      `${base}/registry.json${query}`,
      `${base}/button.json${query}`,
      `${base}/demos/button${query}`,
    ]);
    const word = `${base}/button.json${query}`;
    expect(printedAdd("button")).toContain(
      `npx shadcn@latest add ${query ? `'${word}'` : word}\n`
    );
    const text = getThemeInfoTool(loadProjectConfig());
    // A URL with a query is one quoted word, as in get_add_command.
    const style = `${base}/default.json${query}`;
    const theme = `${base}/theme/<code>.json${query}`;
    expect(text).toContain(
      `npx shadcn@latest add ${query ? `'${style}'` : style}\n`
    );
    expect(text).toContain(
      `npx shadcn@latest add ${query ? `'${theme}'` : theme}\n`
    );
    const hidden = query.replace("=1", "=REDACTED");
    expect(info()).toEqual({
      registryUrl: `${base}${hidden}`,
      registry: `${base}/registry.json${hidden}`,
    });
  });

  // The parser ignores a space or C0 control at the end, so the text no
  // longer shows where it reads the URL: the docs URL is not composed, and
  // every resource keeps the plain join it always had, `<docs>/r/<path>`.
  it.each([
    ["a query and a trailing space", "https://h.example.test?x=1 "],
    ["a fragment and a trailing space", "https://h.example.test#f "],
    ["a query and a trailing control", "https://h.example.test?x=1\u0001"],
    ["a fragment and a trailing control", "https://h.example.test#f\u0001"],
  ])("with %s keeps the plain join throughout", async (_label, url) => {
    docs(url);
    const base = `${url}/r`;
    expect(await requestsFor("button")).toEqual([
      `${base}/registry.json`,
      `${base}/button.json`,
      `${base}/demos/button`,
    ]);
    const text = getThemeInfoTool(loadProjectConfig());
    if (BREAK_OR_CONTROL.test(url)) {
      // No command line can hold a control character: the guidance alone.
      expect(printedAdd("button")).toContain("No install command");
      expect(text).not.toContain("npx shadcn@latest add");
      expect(text).toContain("(No command:");
    } else {
      // The space makes the printed word quoted.
      expect(printedAdd("button")).toContain(
        `npx shadcn@latest add '${base}/button.json'\n`
      );
      expect(text).toContain(`npx shadcn@latest add '${base}/default.json'\n`);
      expect(text).toContain(
        `npx shadcn@latest add '${base}/theme/<code>.json'\n`
      );
    }
    expect(info()).toEqual({
      registryUrl: displayUrl(base),
      registry: displayUrl(`${base}/registry.json`),
    });
  });

  it("is overridden by the registry URL variable", async () => {
    docs("https://h.example.test?x=1");
    process.env.KEYSTONEUI_REGISTRY_URL = "https://env.example.test/r";
    expect(await requestsFor("button")).toEqual([
      "https://env.example.test/r/registry.json",
      "https://env.example.test/r/button.json",
      "https://env.example.test/r/demos/button",
    ]);
  });

  it("is overridden by a project registry", async () => {
    entry({ url: "https://proj.example.test/r" });
    process.env.KEYSTONEUI_URL = "https://h.example.test?x=1";
    expect(await requestsFor("button")).toEqual([
      "https://proj.example.test/r/registry.json",
      "https://proj.example.test/r/button.json",
      "https://proj.example.test/r/demos/button",
    ]);
  });
});

describe("composing from the configured URL", () => {
  // The rule: whether a configured URL is composed is decided once, on the
  // URL as configured. Every resource built from it, requested or printed,
  // is then either fully composed (its path after the base path, and `/r`
  // for a docs URL, and before the base's query) or exactly the plain join
  // `<configured>/<path>` it always was; never a mix of the two.
  interface Case {
    /** The configured URL with its `{name}` file removed: what it composes into. */
    base: string;
    kind: "docs" | "env" | "template";
    params?: Record<string, string>;
    url: string;
  }

  const awkwardAuthorities = [
    "https:///{name}.json",
    "https:////{name}.json",
    "https:/\\/{name}.json",
    "https:\\/tpl.example.test/r/{name}.json",
    "https://\n/{name}.json",
    "https://\t/{name}.json",
    "https://tpl.ex\nample.test/r/{name}.json",
  ];

  const cases: Case[] = [
    ...[
      "https://h.example.test?x=1 ",
      "https://h.example.test#f ",
      "https://h.example.test?x=1\u0001",
      "https://h.example.test#f\u0001",
      "https://h.example.test/d?x=1#f",
      "https://h.example.test/",
      ...awkwardAuthorities.map((t) => t.replace("/{name}.json", "/d?v=1")),
    ].map((url): Case => ({ kind: "docs", url, base: url })),
    ...[
      "https://reg.example.test/r?a=1&b=2",
      "https://reg.example.test/r?v=1 ",
      "https://reg.example.test/r#f\u0001",
      ...awkwardAuthorities.map((t) => t.replace("/{name}.json", "/r?v=1")),
    ].map((url): Case => ({ kind: "env", url, base: url })),
    ...[
      "https://tpl.example.test/r/{name}.json?v=1",
      "https://tpl.example.test/r/{name}.json?v=1 ",
      ...awkwardAuthorities,
    ].map(
      (url): Case => ({
        kind: "template",
        url,
        base: url.replace("/{name}.json", ""),
        params: { p: "2" },
      })
    ),
  ];

  function configure({ kind, url, params }: Case): void {
    if (kind === "template") {
      entry({ url, params });
      return;
    }
    project();
    process.env[
      kind === "docs" ? "KEYSTONEUI_URL" : "KEYSTONEUI_REGISTRY_URL"
    ] = url;
  }

  function fullyComposed(c: Case, path: string, sent: string): boolean {
    let url: URL;
    let base: URL;
    try {
      url = new URL(sent);
      base = new URL(c.base);
    } catch {
      return false;
    }
    const dir =
      base.pathname.replace(TRAILING_SLASHES, "") +
      (c.kind === "docs" ? "/r" : "");
    const query = [
      base.search.slice(1),
      new URLSearchParams(c.params).toString(),
    ].filter(Boolean);
    return (
      url.origin === base.origin &&
      url.pathname === dir + new URL(path, "https://x.test/").pathname &&
      url.search === (query.length ? `?${query.join("&")}` : "") &&
      url.hash === ""
    );
  }

  function printed(text: string): string[] {
    return [...text.matchAll(/npx shadcn@latest add ([\s\S]*?)\n```/g)].map(
      (m) => unquoted(m[1])
    );
  }

  it.each(cases.map((c) => [c.kind, JSON.stringify(c.url), c] as const))(
    "%s %s",
    async (_kind, _label, c) => {
      configure(c);
      const configured = c.kind === "docs" ? `${c.url}/r` : c.url;
      const requests = await requestsFor("button");
      const config = loadProjectConfig();
      const resources: [string, string][] = [
        ["registry.json", requests[0]],
        ["button.json", requests[1]],
        ["demos/button", requests[2]],
        ...printed(getAddCommandTool(config, { names: ["button"] })).map(
          (sent): [string, string] => ["button.json", sent]
        ),
        ...printed(getThemeInfoTool(config)).map(
          (sent, i): [string, string] => [
            i === 0 ? "default.json" : "theme/<code>.json",
            sent,
          ]
        ),
      ];
      // A URL with a line break or control character prints no command.
      const printable = !BREAK_OR_CONTROL.test(c.url);
      expect(resources).toHaveLength(printable ? 7 : 3);
      if (!printable) {
        expect(getAddCommandTool(config, { names: ["button"] })).toContain(
          "No install command"
        );
      }
      const plain = resources.map(([path, sent]) => [
        path,
        sent === `${configured}/${path}`,
      ]);
      const composed = resources.map(([path, sent]) => [
        path,
        fullyComposed(c, path, sent),
      ]);
      // One decision for every resource: all plain, or all composed.
      expect(
        plain.every(([, ok]) => ok) || composed.every(([, ok]) => ok)
      ).toBe(true);
      expect(registryLink()).toBe(displayUrl(requests[0]));
    }
  );
});
