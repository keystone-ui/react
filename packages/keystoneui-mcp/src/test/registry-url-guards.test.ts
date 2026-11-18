import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadProjectConfig } from "../config.js";
import { clearCache } from "../fetcher.js";
import { runInfo } from "../info.js";
import {
  getAddCommandTool,
  getExamplesTool,
  getThemeInfoTool,
  listComponentsTool,
  viewComponentTool,
} from "../tools.js";

// Behaviour that must not move when registry URLs are composed properly:
// the default registry, plain base URLs, where the registry comes from, and
// that this package expands nothing a project entry names. The tests that
// check variable expansion and the template parts left as they were also
// require a composed template's requests, so they pass only with the
// composer; every other test here passes with and without it.

// Obviously fake: never a real credential.
const FAKE = "FAKE_S_not_a_real_value";
// `${NAME}`, the reference syntax shadcn expands in a registries entry.
const ref = (name: string) => `\${${name}}`;

const env = { ...process.env };
let dirs: string[] = [];
// What fetch was asked for: the URL and every header, whether they came in
// a `Request` or in the init argument.
let calls: { url: string; headers: [string, string][] }[] = [];

beforeEach(() => {
  clearCache();
  calls = [];
  delete process.env.KEYSTONEUI_URL;
  delete process.env.KEYSTONEUI_REGISTRY_URL;
  // No request leaves the process: every fetch is answered here.
  vi.spyOn(globalThis, "fetch").mockImplementation(
    (input: string | URL | Request, init?: RequestInit) => {
      const request = input instanceof Request ? input : undefined;
      const headers = new Headers(request?.headers);
      for (const [key, value] of new Headers(init?.headers)) {
        headers.append(key, value);
      }
      calls.push({
        url: request ? request.url : String(input),
        headers: [...headers],
      });
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

/** Run with `dir` as the server's cwd, holding this components.json. */
function project(componentsJson: unknown): void {
  const dir = mkdtempSync(join(tmpdir(), "keystoneui-mcp-registry-"));
  dirs.push(dir);
  if (componentsJson !== undefined) {
    writeFileSync(join(dir, "components.json"), JSON.stringify(componentsJson));
  }
  vi.spyOn(process, "cwd").mockReturnValue(dir);
}

async function requestsFor(names: string[]): Promise<string[]> {
  const config = loadProjectConfig();
  await listComponentsTool(config, { limit: 20, offset: 0 });
  await viewComponentTool(config, { names });
  // Each call reaches fetch synchronously, so the order is stable.
  await Promise.all(names.map((name) => getExamplesTool(config, { name })));
  return calls.map((call) => call.url);
}

function infoJson(): {
  environment: { registryUrl: string };
  links: { registry: string };
} {
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  runInfo(["--json"]);
  const out = log.mock.calls.map((c) => c.join(" ")).join("\n");
  log.mockRestore();
  return JSON.parse(out);
}

describe("default registry", () => {
  it("requests the same URLs", async () => {
    project(undefined);
    expect(await requestsFor(["button", "npm/users-01"])).toEqual([
      "https://keystoneui.io/r/registry.json",
      "https://keystoneui.io/r/button.json",
      "https://keystoneui.io/r/npm/users-01.json",
      "https://keystoneui.io/r/demos/button",
      "https://keystoneui.io/r/demos/npm/users-01",
    ]);
  });

  it("prints the same install command", () => {
    project(undefined);
    expect(
      getAddCommandTool(loadProjectConfig(), { names: ["button", "card"] })
    ).toBe(
      [
        "Install these components with the shadcn CLI:",
        "",
        "```bash",
        "npx shadcn@latest add https://keystoneui.io/r/button.json https://keystoneui.io/r/card.json",
        "```",
        "",
        "Or install individually:",
        "",
        "```bash\nnpx shadcn@latest add https://keystoneui.io/r/button.json\n```",
        "```bash\nnpx shadcn@latest add https://keystoneui.io/r/card.json\n```",
      ].join("\n")
    );
  });

  it("prints the same theme commands", () => {
    project(undefined);
    const text = getThemeInfoTool(loadProjectConfig());
    expect(text).toContain(
      "npx shadcn@latest add https://keystoneui.io/r/default.json\n"
    );
    expect(text).toContain(
      "npx shadcn@latest add https://keystoneui.io/r/theme/<code>.json\n"
    );
    expect(text).toContain("(https://keystoneui.io/theme-builder)");
  });

  it("shows the same registry in info", () => {
    project(undefined);
    const data = infoJson();
    expect(data.environment.registryUrl).toBe("https://keystoneui.io/r");
    expect(data.links.registry).toBe("https://keystoneui.io/r/registry.json");
  });
});

describe("a plain base URL", () => {
  const base = "https://reg.example.test/a/b/r";

  it("from the environment requests the same URLs", async () => {
    project(undefined);
    process.env.KEYSTONEUI_REGISTRY_URL = base;
    expect(await requestsFor(["button"])).toEqual([
      `${base}/registry.json`,
      `${base}/button.json`,
      `${base}/demos/button`,
    ]);
  });

  it("from a components.json object requests the same URLs", async () => {
    project({ registries: { "@keystoneui": { url: base } } });
    expect(await requestsFor(["button"])).toEqual([
      `${base}/registry.json`,
      `${base}/button.json`,
      `${base}/demos/button`,
    ]);
  });

  it("prints the same install command", () => {
    project(undefined);
    process.env.KEYSTONEUI_REGISTRY_URL = base;
    expect(getAddCommandTool(loadProjectConfig(), { names: ["button"] })).toBe(
      [
        "Install these components with the shadcn CLI:",
        "",
        "```bash",
        `npx shadcn@latest add ${base}/button.json`,
        "```",
        "",
        "Or install individually:",
        "",
        `\`\`\`bash\nnpx shadcn@latest add ${base}/button.json\n\`\`\``,
      ].join("\n")
    );
  });

  // Names come from the agent. Whatever an awkward name does to the URL
  // today, it still does: checking names is a separate change.
  it.each([
    "theme/k1_slate_0.55_0.2_250_md_inter",
    "a?b",
    "a#b",
    "a b",
    "../x",
    "%2e%2e/x",
    "a\\b",
    "@evil.example/x",
  ])("sends the name %j exactly as before", async (name) => {
    project(undefined);
    process.env.KEYSTONEUI_REGISTRY_URL = base;
    const config = loadProjectConfig();
    await viewComponentTool(config, { names: [name] });
    expect(calls.map((call) => call.url)).toEqual([`${base}/${name}.json`]);
    expect(getAddCommandTool(config, { names: [name] })).toContain(
      `npx shadcn@latest add ${base}/${name}.json\n`
    );
  });
});

describe("where the registry comes from", () => {
  // Today's precedence: KEYSTONEUI_REGISTRY_URL, then the @keystoneui
  // object's url, then KEYSTONEUI_URL + /r, then the default. A string entry
  // and the @keystone key are not read.
  const local = "http://localhost:3999";
  const envUrl = "https://env.example.test/r";
  const rows: [string, unknown, string, string][] = [
    ["none", undefined, "https://keystoneui.io/r", `${local}/r`],
    [
      "a base url object",
      {
        registries: { "@keystoneui": { url: "https://legacy.example.test/r" } },
      },
      "https://legacy.example.test/r",
      "https://legacy.example.test/r",
    ],
    [
      "a string template",
      {
        registries: { "@keystoneui": "https://str.example.test/r/{name}.json" },
      },
      "https://keystoneui.io/r",
      `${local}/r`,
    ],
    [
      "an object template with headers",
      {
        registries: {
          "@keystoneui": {
            url: "https://tpl.example.test/r/{name}.json",
            headers: { "X-A": ref("FAKE_TOKEN") },
          },
        },
      },
      "https://tpl.example.test/r/{name}.json",
      "https://tpl.example.test/r/{name}.json",
    ],
    [
      "the @keystone string",
      { registries: { "@keystone": "https://keystoneui.io/r/{name}.json" } },
      "https://keystoneui.io/r",
      `${local}/r`,
    ],
  ];

  it.each(rows)("with %s", (_label, json, noEnv, withDocsEnv) => {
    project(json);
    expect(loadProjectConfig().registry.url).toBe(noEnv);
    process.env.KEYSTONEUI_URL = local;
    expect(loadProjectConfig().registry.url).toBe(withDocsEnv);
    process.env.KEYSTONEUI_REGISTRY_URL = envUrl;
    expect(loadProjectConfig().registry.url).toBe(envUrl);
  });
});

describe("a project entry cannot make this package expand a variable", () => {
  it("sends no configured header and no variable's value", async () => {
    process.env.FAKE_TOKEN = FAKE;
    project({
      registries: {
        "@keystoneui": {
          url: "https://tpl.example.test/r/{name}.json",
          params: { t: ref("FAKE_TOKEN") },
          headers: { Authorization: `Bearer ${ref("FAKE_TOKEN")}`, "X-A": "x" },
        },
      },
    });
    const config = loadProjectConfig();
    const urls = await requestsFor(["button"]);
    // The catalogue, the item and its demos, each without a header and with
    // the reference in params kept as literal text.
    expect(urls).toEqual([
      "https://tpl.example.test/r/registry.json?t=%24%7BFAKE_TOKEN%7D",
      "https://tpl.example.test/r/button.json?t=%24%7BFAKE_TOKEN%7D",
      "https://tpl.example.test/r/demos/button?t=%24%7BFAKE_TOKEN%7D",
    ]);
    for (const call of calls) {
      expect(call.headers).toEqual([]);
    }
    const printed = [
      getAddCommandTool(config, { names: ["button"] }),
      getThemeInfoTool(config),
      JSON.stringify(infoJson()),
    ].join("\n");
    expect([...urls, printed].join("\n")).not.toContain(FAKE);
  });
});

describe("a template the composer does not handle", () => {
  // Placeholders outside the path, or one this package cannot resolve, keep
  // today's requests: the URL as configured with the path appended.
  it.each([
    "https://tpl.example.test/r/{style}/{name}.json",
    "https://{name}.example.test/r",
    "https://tpl.example.test/r?item={name}",
    "https://tpl.example.test/r#{name}",
  ])("%s keeps today's requests", async (url) => {
    project({ registries: { "@keystoneui": { url } } });
    expect(await requestsFor(["button"])).toEqual([
      `${url}/registry.json`,
      `${url}/button.json`,
      `${url}/demos/button`,
    ]);
  });

  it("an object template never sends a request to another host", async () => {
    project({
      registries: {
        "@keystoneui": { url: "https://tpl.example.test/r/{name}.json" },
      },
    });
    const names = [
      "@evil.example/x",
      "//evil.example/x",
      "\\\\evil.example\\x",
      "x/../../..//evil.example",
    ];
    await requestsFor(names);
    // The catalogue, then every item and every demo bundle: none of them is
    // dropped before it reaches fetch.
    expect(calls).toHaveLength(1 + 2 * names.length);
    for (const call of calls) {
      expect(new URL(call.url).origin).toBe("https://tpl.example.test");
    }
  });
});

describe("template parts this package leaves as they were", () => {
  it("drops a params value that is not a string", async () => {
    project({
      registries: {
        "@keystoneui": {
          url: "https://tpl.example.test/r/{name}.json",
          params: { n: 1, b: true, z: null, o: { k: "v" }, l: ["v"], s: "v" },
        },
      },
    });
    await viewComponentTool(loadProjectConfig(), { names: ["button"] });
    expect(calls.map((call) => call.url)).toEqual([
      "https://tpl.example.test/r/button.json?s=v",
    ]);
  });

  // Without a path ending in one `/{name}.json` there is no directory to
  // put the catalogue and demos in: they keep the plain join.
  it.each([
    [
      "https://tpl.example.test/items/{name}/index.json",
      "https://tpl.example.test/items/button/index.json",
    ],
    [
      "https://tpl.example.test/{name}/{name}.json",
      "https://tpl.example.test/button/button.json",
    ],
  ])(
    "%s keeps the plain join for the catalogue and demos",
    async (url, item) => {
      project({ registries: { "@keystoneui": { url } } });
      expect(await requestsFor(["button"])).toEqual([
        `${url}/registry.json`,
        item,
        `${url}/demos/button`,
      ]);
    }
  );
});
