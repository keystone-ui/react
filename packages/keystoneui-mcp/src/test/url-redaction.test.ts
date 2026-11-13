import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { inspect } from "node:util";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { runCli } from "../cli.js";
import type { ProjectConfig } from "../config.js";
import { displayUrl } from "../display-url.js";
import { clearCache, fetchManifest } from "../fetcher.js";
import { runInfo } from "../info.js";
import { getDocsTool } from "../tools.js";

// Obviously fake: never a real credential.
const SECRET = "FAKE_SECRET_not_a_real_token";
const FETCHER_500 = /^Failed to fetch .+: 500$/;
const CLI_500 = /^Failed to fetch .+: 500 Internal Server Error$/;

let server: Server;
let origin: string;
const requests: string[] = [];

beforeAll(async () => {
  server = createServer((req, res) => {
    requests.push(req.url ?? "");
    if (req.url?.startsWith("/fail")) {
      res.statusCode = 500;
      res.end("boom");
      return;
    }
    if (req.url?.startsWith("/html")) {
      res.end("<html>not json</html>");
      return;
    }
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ items: [] }));
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise((done) => server.close(done));
});

const env = { ...process.env };

beforeEach(() => {
  requests.length = 0;
  clearCache();
});

afterEach(() => {
  process.env = { ...env };
  process.exitCode = undefined;
  vi.restoreAllMocks();
});

function fullText(error: unknown): string {
  // `inspect` prints message, stack and the whole `cause` chain -- what an
  // uncaught CLI error shows on stderr.
  return inspect(error, { depth: 10 });
}

describe("displayUrl", () => {
  it("drops userinfo", () => {
    expect(displayUrl(`https://user:${SECRET}@host.test/r`)).toBe(
      "https://host.test/r"
    );
  });

  it("drops percent-encoded userinfo", () => {
    const out = displayUrl(`https://us%40er:${SECRET}%2Fx@host.test/r`);
    expect(out).toBe("https://host.test/r");
  });

  it("masks every query value, keeps keys and order, drops the fragment", () => {
    expect(
      displayUrl(
        `https://host.test/r?token=${SECRET}&a=1&a=2&x[y]=${SECRET}#${SECRET}`
      )
    ).toBe(
      "https://host.test/r?token=REDACTED&a=REDACTED&a=REDACTED&x%5By%5D=REDACTED"
    );
  });

  it("keeps port and path", () => {
    expect(
      displayUrl(`http://user:${SECRET}@host.test:8443/private/r?k=${SECRET}`)
    ).toBe("http://host.test:8443/private/r?k=REDACTED");
  });

  it("handles an IPv6 host", () => {
    expect(displayUrl(`http://user:${SECRET}@[::1]:8080/r`)).toBe(
      "http://[::1]:8080/r"
    );
  });

  it("returns a clean URL unchanged (no trailing slash added)", () => {
    expect(displayUrl("https://keystoneui.io")).toBe("https://keystoneui.io");
    expect(displayUrl("https://keystoneui.io/r/registry.json")).toBe(
      "https://keystoneui.io/r/registry.json"
    );
    expect(displayUrl("file:///tmp/r")).toBe("file:///tmp/r");
  });

  it("never echoes a string that does not parse as a URL", () => {
    expect(displayUrl(`not a url ${SECRET}`)).toBe("<unparseable URL>");
    expect(displayUrl(`./r?token=${SECRET}`)).toBe("<unparseable URL>");
  });
});

describe("fetcher errors", () => {
  it("does not echo a query secret on a non-2xx response", async () => {
    const error = await fetchManifest(`${origin}/fail?token=${SECRET}`).catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toMatch(FETCHER_500);
    expect(fullText(error)).not.toContain(SECRET);
    // The request itself is unchanged: the server got the real token.
    expect(requests).toEqual([`/fail?token=${SECRET}/registry.json`]);
  });

  it("does not echo userinfo when fetch refuses the URL", async () => {
    const error = await fetchManifest(
      `http://user:${SECRET}@127.0.0.1:1/r`
    ).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TypeError);
    expect((error as Error).message).toContain(
      "Request cannot be constructed from a URL that includes credentials"
    );
    expect(fullText(error)).not.toContain(SECRET);
  });

  it("passes the unredacted URL to fetch", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    await fetchManifest(`http://user:${SECRET}@127.0.0.1:1/r`).catch(
      () => undefined
    );
    expect(spy).toHaveBeenCalledWith(
      `http://user:${SECRET}@127.0.0.1:1/r/registry.json`
    );
  });

  it("does not echo a secret on a network failure", async () => {
    const error = await fetchManifest(
      `http://127.0.0.1:1/r?token=${SECRET}`
    ).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect(fullText(error)).not.toContain(SECRET);
  });

  it("quotes the body, not the URL, on a non-JSON response", async () => {
    const error = await fetchManifest(`${origin}/html?token=${SECRET}`).catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(SyntaxError);
    expect(fullText(error)).not.toContain(SECRET);
  });

  it("keys the cache on the real URL, not the redacted one", async () => {
    await fetchManifest(`${origin}/ok?token=${SECRET}`);
    await fetchManifest(`${origin}/ok?token=${SECRET}`);
    await fetchManifest(`${origin}/ok?token=other`);
    // Same token is cached; a different token (same redacted form) is not.
    expect(requests).toEqual([
      `/ok?token=${SECRET}/registry.json`,
      "/ok?token=other/registry.json",
    ]);
  });
});

describe("info", () => {
  function capture(args: string[]): string {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    runInfo(args);
    return log.mock.calls.map((c) => c.join(" ")).join("\n");
  }

  it("does not print secrets in text output", () => {
    process.env.KEYSTONEUI_URL = `https://user:${SECRET}@docs.test?t=${SECRET}`;
    process.env.KEYSTONEUI_REGISTRY_URL = `https://user:${SECRET}@reg.test/r`;
    const out = capture([]);
    expect(out).toContain("https://reg.test/r");
    expect(out).not.toContain(SECRET);
  });

  it("does not print secrets in JSON output", () => {
    process.env.KEYSTONEUI_URL = `https://user:${SECRET}@docs.test`;
    process.env.KEYSTONEUI_REGISTRY_URL = `https://reg.test/r?token=${SECRET}`;
    const data = JSON.parse(capture(["--json"]));
    expect(data.environment.registryUrl).toBe(
      "https://reg.test/r?token=REDACTED"
    );
    expect(data.environment.docsUrl).toBe("https://docs.test/");
    expect(JSON.stringify(data)).not.toContain(SECRET);
  });

  it("prints the default URLs exactly as before", () => {
    delete process.env.KEYSTONEUI_URL;
    delete process.env.KEYSTONEUI_REGISTRY_URL;
    vi.spyOn(process, "cwd").mockReturnValue("/nonexistent-keystone-test");
    const data = JSON.parse(capture(["--json"]));
    expect(data.environment.registryUrl).toBe("https://keystoneui.io/r");
    expect(data.environment.docsUrl).toBe("https://keystoneui.io");
    expect(data.links).toEqual({
      docs: "https://keystoneui.io",
      registry: "https://keystoneui.io/r/registry.json",
      llms: "https://keystoneui.io/llms.txt",
    });
  });
});

describe("get_docs tool", () => {
  it("does not echo the docs URL when it cannot reach it", async () => {
    const config: ProjectConfig = {
      docsUrl: `http://user:${SECRET}@127.0.0.1:1`,
      registry: { url: "https://reg.test/r" },
    };
    const out = await getDocsTool(config, {
      name: "button",
      type: "component",
    });
    expect(out).toContain("could not reach");
    expect(out).not.toContain(SECRET);
  });
});

describe("cli docs", () => {
  it("does not echo a query secret on a non-2xx response", async () => {
    process.env.KEYSTONEUI_URL = `${origin}/fail?t=${SECRET}`;
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await runCli(["docs", "button"]);
    expect(process.exitCode).toBe(1);
    const out = err.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(out).toMatch(CLI_500);
    expect(out).not.toContain(SECRET);
  });

  it("does not echo userinfo when fetch refuses the URL", async () => {
    process.env.KEYSTONEUI_URL = `http://user:${SECRET}@127.0.0.1:1`;
    const error = await runCli(["docs", "button"]).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TypeError);
    expect(fullText(error)).not.toContain(SECRET);
  });
});
