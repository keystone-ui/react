import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
import { loadProjectConfig, type ProjectConfig } from "../config.js";
import { displayUrl, redactUrlInError } from "../display-url.js";
import { clearCache, fetchManifest } from "../fetcher.js";
import { runInfo } from "../info.js";
import { getDocsTool } from "../tools.js";

// Obviously fake: never a real credential.
const SECRET = "FAKE_SECRET_not_a_real_token";
// A lone UTF-16 surrogate: `JSON.parse` keeps one from components.json, and
// `fetch` quotes the URL after turning it into U+FFFD.
const LONE = String.fromCharCode(0xd8_00);
const ENDS_IN_ROOT = /[/\\]\s*$/;
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

  // KEYSTONEUI_URL is an origin that callers append `/r/...` to, so a
  // trailing slash added by `URL#href` would print `//r`.
  it("does not add a trailing slash to a bare origin", () => {
    expect(displayUrl(`https://user:${SECRET}@docs.test`)).toBe(
      "https://docs.test"
    );
    expect(displayUrl(`https://docs.test?t=${SECRET}`)).toBe(
      "https://docs.test?t=REDACTED"
    );
    expect(displayUrl(`https://user:${SECRET}@docs.test/`)).toBe(
      "https://docs.test/"
    );
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

  // `user:secret@host/r` parses: `user:` is the scheme, the rest an opaque
  // path. Only http(s) and file URLs are displayed at all.
  it.each([
    `user:${SECRET}@host.test/r`,
    `user:${SECRET}@host.test/r?t=other`,
    `user:${SECRET}@host.test/r#frag`,
    `user:${SECRET}@host.test/r?t=${SECRET}#${SECRET}`,
    `mailto:${SECRET}@host.test`,
    `data:text/plain,${SECRET}`,
    `javascript:${SECRET}`,
    `ftp://user:${SECRET}@host.test/r`,
  ])("prints a placeholder for an unsupported scheme: %s", (raw) => {
    expect(displayUrl(raw)).toBe("<unsupported URL>");
  });

  it.each([
    [` https://user:${SECRET}@host.test/ `, "https://host.test/"],
    [`\thttps://user:${SECRET}@host.test\n`, "https://host.test"],
    [`http:\\\\user:${SECRET}@host.test\\`, "http://host.test/"],
    [`http:\\\\user:${SECRET}@host.test\\r`, "http://host.test/r"],
    [` https://host.test?t=${SECRET} `, "https://host.test?t=REDACTED"],
  ])("handles whitespace and backslash roots: %j", (raw, expected) => {
    const out = displayUrl(raw);
    expect(out).toBe(expected);
    expect(out).not.toContain(SECRET);
    // A root the input did not have would make callers print `//r`.
    if (!ENDS_IN_ROOT.test(raw)) {
      expect(`${out}/r`.slice(out.indexOf("//") + 2)).not.toContain("//");
    }
  });
});

describe("displayUrl keeps path data the URL parser keeps", () => {
  // `String#trim` drops U+00A0 and U+FEFF; `URL` keeps them as path data.
  it.each([
    ["https://host.test/r\u00a0", "https://host.test/r\u00a0"],
    ["file:///tmp/r\ufeff", "file:///tmp/r\ufeff"],
    [`https://user:${SECRET}@host.test/r\u00a0`, "https://host.test/r%C2%A0"],
  ])("%j", (raw, expected) => {
    const out = displayUrl(raw);
    expect(out).toBe(expected);
    expect(new URL(out).pathname).toBe(new URL(raw).pathname);
  });

  it("returns a clean whitespace-padded URL exactly as given", () => {
    expect(displayUrl(" https://host.test/r \n")).toBe(
      " https://host.test/r \n"
    );
  });
});

describe("redactUrlInError with a real fetch rejection", () => {
  async function rejection(url: string): Promise<unknown> {
    return await fetch(url).then(
      () => {
        throw new Error("fetch unexpectedly succeeded");
      },
      (e: unknown) => e
    );
  }

  it.each([
    [
      "a lone surrogate in the path",
      `http://user:${SECRET}@127.0.0.1:1/${LONE}/registry.json`,
    ],
    [
      "a lone surrogate in the query",
      `http://user:${SECRET}@127.0.0.1:1/r?t=${LONE}/registry.json`,
    ],
    [
      "a malformed URL with a lone surrogate",
      `http://user:${SECRET}@[127.0.0.1${LONE}/registry.json`,
    ],
  ])("leaves no secret with %s", async (_name, url) => {
    const error = await rejection(url);
    // Precondition: fetch itself quotes the secret.
    expect(fullText(error)).toContain(SECRET);
    const safe = redactUrlInError(error, url);
    expect(safe).toBeInstanceOf(TypeError);
    expect((safe as Error).message).not.toContain(SECRET);
    expect(fullText(safe)).not.toContain(SECRET);
  });

  it("leaves no query secret when the URL has a lone surrogate", async () => {
    const url = `http://[127.0.0.1${LONE}/r?token=${SECRET}`;
    const error = await rejection(url);
    expect(fullText(error)).toContain(SECRET);
    const safe = redactUrlInError(error, url);
    expect(safe).toBeInstanceOf(TypeError);
    expect(fullText(safe)).not.toContain(SECRET);
  });

  it("shows the URL redacted even when a query value reads as its path", () => {
    const url = "https://host.test/registry?k=registry";
    const safe = redactUrlInError(new TypeError(`bad ${url}`), url);
    expect(safe).toBeInstanceOf(TypeError);
    expect((safe as Error).message).toBe(
      "bad https://host.test/registry?k=REDACTED"
    );
  });

  it("redacts a full URL with a short password and query value", () => {
    const url = "http://u:p@host.test/r?v=2";
    const error = new TypeError(`cannot fetch ${url}`, {
      cause: new Error(`inner ${url}`),
    });
    const safe = redactUrlInError(error, url);
    expect(safe).toBeInstanceOf(TypeError);
    expect((safe as Error).message).toBe(
      "cannot fetch http://host.test/r?v=REDACTED"
    );
    expect(fullText(safe)).not.toContain(url);
    expect(fullText(safe)).not.toContain("u:p@");
  });

  // `$&`, `$$`, `$'` and `` $` `` are replacement patterns in a string passed
  // to `replaceAll`; in the displayed path they must print as-is. The URL
  // parser percent-encodes a backtick in a path, so `` $` `` displays `$%60`.
  it.each([
    ["$&", "$&"],
    ["$$", "$$"],
    ["$'", "$'"],
    ["$`", "$%60"],
  ])("prints a literal %s path and no secret", (marker, shownPath) => {
    const url = `http://user:${SECRET}@host.test/${marker}/r?token=${SECRET}#${SECRET}`;
    const shown = `http://host.test/${shownPath}/r?token=REDACTED`;
    const error = new TypeError(`first ${url} then ${url}`, {
      cause: new Error(`inner ${url}`),
    });
    const safe = redactUrlInError(error, url);
    expect(safe).toBeInstanceOf(TypeError);
    expect((safe as Error).message).toBe(`first ${shown} then ${shown}`);
    expect((safe as Error).message).not.toContain(SECRET);
    expect(fullText(safe)).not.toContain(SECRET);
  });

  it.each([
    [
      "a $& path",
      `http://user:${SECRET}@host.test/$&/registry.json?token=${SECRET}#${SECRET}`,
    ],
    [
      "a $& path and a lone surrogate",
      `http://user:${SECRET}@host.test/$&${LONE}/registry.json?token=${SECRET}#${SECRET}`,
    ],
  ])("leaves no secret when Request refuses %s", (_name, url) => {
    let error: unknown;
    try {
      error = new Request(url);
    } catch (e) {
      error = e;
    }
    // Precondition: the native error quotes the secret.
    expect(fullText(error)).toContain(SECRET);
    const safe = redactUrlInError(error, url);
    expect(safe).toBeInstanceOf(TypeError);
    expect((safe as Error).message).not.toContain(SECRET);
    expect(fullText(safe)).not.toContain(SECRET);
  });

  it("returns an unrelated error unchanged", () => {
    const error = new TypeError("fetch failed", {
      cause: Object.assign(new Error("refused"), { code: "ECONNREFUSED" }),
    });
    // A username that cannot occur in a stack path (`/Users/user/...`).
    const url = `https://FAKE_USER_not_real:${SECRET}@host.test/r`;
    expect(redactUrlInError(error, url)).toBe(error);
  });

  // Fixed stacks, so the test does not depend on its own line number or the
  // checkout path. A URL part that shows up only in a stack frame is not the
  // URL being quoted: the network cause and its code must survive.
  function refused(frame: string): TypeError {
    const cause = Object.assign(new Error("refused"), {
      code: "ECONNREFUSED",
    });
    cause.stack = "Error: refused\n    at connect (/tmp/net.js:1:1)";
    const error = new TypeError("fetch failed", { cause });
    error.stack = `TypeError: fetch failed\n    at request (${frame})`;
    return error;
  }

  it.each([
    [
      "a query value matches a line number",
      "https://host.test/r?v=2",
      "/tmp/client.js:2:1",
    ],
    [
      "a username matches a directory",
      `https://user:${SECRET}@host.test/r`,
      "/Users/user/project/client.js:1:1",
    ],
  ])("keeps the original error when %s", (_name, url, frame) => {
    const error = refused(frame);
    const safe = redactUrlInError(error, url);
    expect(safe).toBe(error);
    expect((safe as Error).cause).toBe(error.cause);
    expect(((safe as Error).cause as { code: string }).code).toBe(
      "ECONNREFUSED"
    );
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
    expect(requests).toEqual([`/fail/registry.json?token=${SECRET}`]);
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

  it("does not echo userinfo when the registry base ends in $&", async () => {
    const error = await fetchManifest(
      `http://user:${SECRET}@127.0.0.1:1/$&`
    ).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TypeError);
    expect((error as Error).message).toContain(
      "http://127.0.0.1:1/$&/registry.json"
    );
    expect(fullText(error)).not.toContain(SECRET);
  });

  it("does not echo a short password or query value after a $& path", async () => {
    const error = await fetchManifest("http://u:p@host.test/$&?v=2").catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(TypeError);
    expect((error as Error).message).toContain(
      "http://host.test/$&/registry.json?v=REDACTED"
    );
    expect(fullText(error)).not.toContain("u:p@");
    expect(fullText(error)).not.toContain("v=2");
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
    // A real network failure: a server that drops every connection it
    // accepts (port 1 would stop at fetch's blocked-port check instead).
    let connections = 0;
    const dropper = createServer();
    dropper.on("connection", (socket) => {
      connections += 1;
      socket.destroy();
    });
    await new Promise<void>((done) => dropper.listen(0, "127.0.0.1", done));
    const { port } = dropper.address() as AddressInfo;
    try {
      const error = await fetchManifest(
        `http://127.0.0.1:${port}/r?token=${SECRET}`
      ).catch((e: unknown) => e);
      expect(connections).toBeGreaterThan(0);
      expect(error).toBeInstanceOf(TypeError);
      expect(fullText(error)).not.toContain(SECRET);
    } finally {
      await new Promise((done) => dropper.close(done));
    }
  }, 5000);

  it("keeps the network cause when a short query value is not quoted", async () => {
    let connections = 0;
    const dropper = createServer();
    dropper.on("connection", (socket) => {
      connections += 1;
      socket.destroy();
    });
    await new Promise<void>((done) => dropper.listen(0, "127.0.0.1", done));
    const { port } = dropper.address() as AddressInfo;
    try {
      const error = await fetchManifest(
        `http://127.0.0.1:${port}/r?v=2&format=json`
      ).catch((e: unknown) => e);
      expect(connections).toBeGreaterThan(0);
      expect(error).toBeInstanceOf(TypeError);
      // The code is platform-dependent (ECONNRESET here); it must survive.
      expect(typeof ((error as Error).cause as { code?: unknown }).code).toBe(
        "string"
      );
    } finally {
      await new Promise((done) => dropper.close(done));
    }
  }, 5000);

  it("does not echo a components.json password with a lone surrogate", async () => {
    const dir = mkdtempSync(join(tmpdir(), "keystoneui-mcp-"));
    try {
      // Written as JSON escapes, exactly as a user's file would hold them.
      writeFileSync(
        join(dir, "components.json"),
        `{"registries":{"@keystoneui":{"url":"http://user:${SECRET}@127.0.0.1:1/\\ud800"}}}`
      );
      delete process.env.KEYSTONEUI_URL;
      delete process.env.KEYSTONEUI_REGISTRY_URL;
      vi.spyOn(process, "cwd").mockReturnValue(dir);
      const config = loadProjectConfig();
      expect(config.registry.url).toContain(LONE);
      const error = await fetchManifest(config.registry.url).catch(
        (e: unknown) => e
      );
      expect(error).toBeInstanceOf(TypeError);
      expect((error as Error).message).not.toContain(SECRET);
      expect(fullText(error)).not.toContain(SECRET);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
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
      `/ok/registry.json?token=${SECRET}`,
      "/ok/registry.json?token=other",
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
    expect(data.environment.docsUrl).toBe("https://docs.test");
    expect(JSON.stringify(data)).not.toContain(SECRET);
  });

  it("does not print scheme-less credentials in text output", () => {
    process.env.KEYSTONEUI_URL = `user:${SECRET}@docs.test`;
    process.env.KEYSTONEUI_REGISTRY_URL = `user:${SECRET}@reg.test/r?t=x`;
    const text = capture([]);
    expect(text).toContain("<unsupported URL>");
    expect(text).not.toContain(SECRET);
  });

  it("does not print scheme-less credentials in JSON output", () => {
    process.env.KEYSTONEUI_URL = `user:${SECRET}@docs.test`;
    process.env.KEYSTONEUI_REGISTRY_URL = `user:${SECRET}@reg.test/r?t=x`;
    const data = JSON.parse(capture(["--json"]));
    expect(data.environment.registryUrl).toBe("<unsupported URL>");
    expect(data.environment.docsUrl).toBe("<unsupported URL>");
    expect(data.links.registry).toBe("<unsupported URL>");
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

  it("does not echo scheme-less credentials when it cannot reach them", async () => {
    const config: ProjectConfig = {
      docsUrl: `user:${SECRET}@docs.test`,
      registry: { url: "https://reg.test/r" },
    };
    const out = await getDocsTool(config, {
      name: "button",
      type: "component",
    });
    expect(out).toBe("**button**: could not reach <unsupported URL>.");
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
