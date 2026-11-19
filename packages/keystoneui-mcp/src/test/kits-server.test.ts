/**
 * get_add_command through the registered MCP server: the handler is async
 * and still answers with the text content envelope.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearCache } from "../fetcher.js";
import {
  cleanDirs,
  forbidFetch,
  inDir,
  manifest,
  PACKAGE_PROJECT,
  projectDir,
  stubFetch,
} from "./fixtures.js";

const R = "https://example.test/r";
const env = { ...process.env };

beforeEach(() => {
  clearCache();
  vi.resetModules();
  process.env.KEYSTONEUI_URL = "https://docs.example.test";
  process.env.KEYSTONEUI_REGISTRY_URL = R;
  inDir(projectDir(PACKAGE_PROJECT));
});

afterEach(() => {
  process.env = { ...env };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  cleanDirs();
});

async function call(args: Record<string, unknown>) {
  const { server } = await import("../server.js");
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await server.connect(serverSide);
  const client = new Client({ name: "test", version: "0" });
  await client.connect(clientSide);
  try {
    return await client.callTool({ name: "get_add_command", arguments: args });
  } finally {
    await client.close();
    await server.close();
  }
}

describe("get_add_command over MCP", () => {
  it("answers today's text in the envelope, with no request", async () => {
    const { fn } = forbidFetch();
    const result = await call({ names: ["button"] });
    expect(result.content).toEqual([
      {
        type: "text",
        text: [
          "Install these components with the shadcn CLI:",
          "",
          "```bash",
          `npx shadcn@latest add ${R}/button.json`,
          "```",
          "",
          "Or install individually:",
          "",
          `\`\`\`bash\nnpx shadcn@latest add ${R}/button.json\n\`\`\``,
        ].join("\n"),
      },
    ]);
    expect(fn).not.toHaveBeenCalled();
  });

  it("awaits the package lookup before answering", async () => {
    stubFetch({
      [`${R}/registry.json`]: {
        body: manifest([{ name: "button", type: "registry:ui" }]),
      },
    });
    const result = await call({ flavour: "package", names: ["button"] });
    expect(result.content).toEqual([
      {
        type: "text",
        text: '- button is a component. If @keystoneui/react provides it, import it from "@keystoneui/react/button" instead of installing it.\n\nNo install command: none of these names is installed with flavour: "package".',
      },
    ]);
  });
});
