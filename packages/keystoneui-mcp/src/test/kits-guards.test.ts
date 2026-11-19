/**
 * Output that existing callers get today, pinned literally. Kits and package
 * flavours add lines and inputs; none of these outputs may change.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCli } from "../cli.js";
import type { ProjectConfig } from "../config.js";
import { clearCache } from "../fetcher.js";
import {
  getAddCommandTool,
  getDocsTool,
  getProjectContextTool,
  listComponentsTool,
  searchComponentsTool,
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
  REGISTRY_PROJECT,
  stubFetch,
} from "./fixtures.js";

const REPO_ROOT = join(import.meta.dirname, "../../../..");
const KEYSTONE: ProjectConfig = {
  docsUrl: "https://keystoneui.io",
  registry: { url: "https://keystoneui.io/r" },
};
const FIXTURE: ProjectConfig = {
  docsUrl: "https://docs.example.test",
  registry: { url: "https://example.test/r" },
};
const MANIFEST_URL = "https://example.test/r/registry.json";
const ENTRY_NAME = /^\*\*.+\*\* \(`(.+)`\)$/gm;

const env = { ...process.env };

beforeEach(() => {
  clearCache();
});

afterEach(() => {
  process.env = { ...env };
  process.exitCode = undefined;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  cleanDirs();
});

/** Today's get_add_command text for these URLs. */
function addText(urls: string[]): string {
  return [
    "Install these components with the shadcn CLI:",
    "",
    "```bash",
    `npx shadcn@latest add ${urls.join(" ")}`,
    "```",
    "",
    "Or install individually:",
    "",
    ...urls.map((url) => `\`\`\`bash\nnpx shadcn@latest add ${url}\n\`\`\``),
  ].join("\n");
}

describe("get_add_command without a flavour", () => {
  const BUTTON_CARD = `Install these components with the shadcn CLI:

\`\`\`bash
npx shadcn@latest add https://keystoneui.io/r/button.json https://keystoneui.io/r/card.json
\`\`\`

Or install individually:

\`\`\`bash
npx shadcn@latest add https://keystoneui.io/r/button.json
\`\`\`
\`\`\`bash
npx shadcn@latest add https://keystoneui.io/r/card.json
\`\`\``;

  it("the helper reproduces the literal text", () => {
    expect(
      addText([
        "https://keystoneui.io/r/button.json",
        "https://keystoneui.io/r/card.json",
      ])
    ).toBe(BUTTON_CARD);
  });

  const CASES: [string[], string][] = [
    [["button", "card"], BUTTON_CARD],
    [["users-01"], addText(["https://keystoneui.io/r/users-01.json"])],
    [["npm/users-01"], addText(["https://keystoneui.io/r/npm/users-01.json"])],
    [
      ["theme/k1_slate_0.55_0.2_262.5_large_inter"],
      addText([
        "https://keystoneui.io/r/theme/k1_slate_0.55_0.2_262.5_large_inter.json",
      ]),
    ],
  ];

  for (const [mode, files] of [
    ["registry", REGISTRY_PROJECT],
    ["package", PACKAGE_PROJECT],
  ] as const) {
    for (const [names, expected] of CASES) {
      it(`prints today's text for ${names.join(", ")} in a ${mode}-mode project, with no request`, async () => {
        inDir(projectDir(files));
        const { fn } = forbidFetch();
        expect(await getAddCommandTool(KEYSTONE, { names })).toBe(expected);
        expect(fn).not.toHaveBeenCalled();
      });
    }
  }

  it("prints every first-party name and a theme code as today", async () => {
    const registry = JSON.parse(
      readFileSync(join(REPO_ROOT, "registry.json"), "utf-8")
    ) as { items: { name: string }[] };
    const names = [
      ...registry.items.map((item) => item.name),
      "theme/k1_zinc_0.6_0.15_25_default_geist",
    ];
    forbidFetch();
    const outputs = await Promise.all(
      names.map((name) => getAddCommandTool(KEYSTONE, { names: [name] }))
    );
    names.forEach((name, i) => {
      expect(outputs[i], name).toBe(
        addText([`https://keystoneui.io/r/${name}.json`])
      );
    });
  });
});

const PLAIN_ITEMS: RegistryItem[] = [
  {
    name: "button",
    type: "registry:ui",
    title: "Button",
    description: "A button.",
    dependencies: ["@base-ui/react"],
  },
  {
    name: "x",
    type: "registry:block",
    title: "X",
    description: "Block x.",
    categories: ["data"],
    registryDependencies: ["https://example.test/r/button.json"],
  },
  {
    name: "npm/x",
    type: "registry:block",
    title: "X (package)",
    description: "Block x for the package.",
    categories: ["data"],
    dependencies: ["lucide-react"],
  },
  {
    name: "loose",
    type: "registry:component",
    title: "Loose",
    description: "A component item with no metadata.",
  },
];

const BUTTON_ENTRY = `**Button** (\`button\`)
A button.
Dependencies: @base-ui/react`;
const X_ENTRY = `**X** (\`x\`)
Block x.
Categories: data
Registry dependencies: https://example.test/r/button.json`;
const NPM_X_ENTRY = `**X (package)** (\`npm/x\`)
Block x for the package.
Categories: data
Dependencies: lucide-react`;
const LOOSE_ENTRY = `**Loose** (\`loose\`)
A component item with no metadata.`;

describe("list and search on a registry with no metadata", () => {
  it("lists every entry as today", async () => {
    stubFetch({ [MANIFEST_URL]: { body: manifest(PLAIN_ITEMS) } });
    expect(await listComponentsTool(FIXTURE, { limit: 20, offset: 0 })).toBe(
      `${BUTTON_ENTRY}\n\n${X_ENTRY}\n\n${NPM_X_ENTRY}\n\n${LOOSE_ENTRY}\n\n\n---\nShowing 4 of 4 items.`
    );
  });

  it("filters by an existing type as today", async () => {
    stubFetch({ [MANIFEST_URL]: { body: manifest(PLAIN_ITEMS) } });
    expect(
      await listComponentsTool(FIXTURE, {
        limit: 1,
        offset: 0,
        type: "block",
      })
    ).toBe(
      `${X_ENTRY}\n\n\n---\nShowing 1 of 2 items.\n\nUse offset: 1 to see more.`
    );
  });

  it("searches as today", async () => {
    stubFetch({ [MANIFEST_URL]: { body: manifest(PLAIN_ITEMS) } });
    expect(
      await searchComponentsTool(FIXTURE, { limit: 10, query: "package" })
    ).toBe(`${NPM_X_ENTRY}\n\n\n---\n1 result found.`);
    expect(
      await searchComponentsTool(FIXTURE, {
        limit: 10,
        query: "nothing-like-it",
      })
    ).toBe('No results found for "nothing-like-it".');
  });

  it("pages of 20 visit every entry once and sum to the total", async () => {
    const many: RegistryItem[] = Array.from({ length: 45 }, (_, i) => ({
      name: i % 2 ? `npm/item-${i}` : `item-${i}`,
      type: "registry:block",
      title: `Item ${i}`,
    }));
    stubFetch({ [MANIFEST_URL]: { body: manifest(many) } });
    const pages = await Promise.all(
      [0, 20, 40].map((offset) =>
        listComponentsTool(FIXTURE, { limit: 20, offset })
      )
    );
    const seen = pages.flatMap((out) =>
      [...out.matchAll(ENTRY_NAME)].map((m) => m[1])
    );
    for (const out of pages) {
      expect(out).toContain("of 45 items.");
    }
    expect(seen).toEqual(many.map((item) => item.name));
  });
});

describe("get_project_context outside package mode", () => {
  it("registry mode is unchanged", () => {
    inDir(projectDir(REGISTRY_PROJECT));
    expect(getProjectContextTool()).toBe(`# Project context

| field | value |
|---|---|
| install mode | **registry** -- source is vendored via shadcn. Import from \`@/components/ui\`. |
| ui alias | @/components/ui |
| theme CSS file | app/globals.css |
| icon library | _unknown_ -- ask before importing icons |
| RSC | _unknown_ |
| package manager | _unknown_ |

Example import: \`import { … } from "@/components/ui/button";\``);
  });

  it("unknown mode is unchanged", () => {
    inDir(projectDir({}));
    expect(getProjectContextTool()).toBe(`# Project context

| field | value |
|---|---|
| install mode | **unknown** -- neither \`@keystoneui/react\` in dependencies nor a \`components.json\`. Ask before writing imports. |
| ui alias | _unknown_ |
| theme CSS file | _unknown_ -- ask which file owns the tokens |
| icon library | _unknown_ -- ask before importing icons |
| RSC | _unknown_ |
| package manager | _unknown_ |

Example import: \`import { … } from "@keystoneui/react/button";\``);
  });
});

describe("get_docs where today's URL answers", () => {
  it("returns the page unchanged and reads no index", async () => {
    const { calls } = stubFetch({
      "https://docs.example.test/llms.mdx/docs/components/button": {
        body: "# Button\n",
      },
    });
    expect(
      await getDocsTool(FIXTURE, { name: "button", type: "component" })
    ).toBe("# Button\n");
    expect(calls).toEqual([
      "https://docs.example.test/llms.mdx/docs/components/button",
    ]);
  });

  it("keeps today's not-found text when the index has nothing for the name", async () => {
    stubFetch({
      "https://docs.example.test/llms.mdx/docs/components/nope": {
        status: 404,
      },
      [MANIFEST_URL]: { body: manifest(PLAIN_ITEMS) },
    });
    expect(
      await getDocsTool(FIXTURE, { name: "nope", type: "component" })
    ).toBe(
      "**nope**: no component docs found (404). Try search_components to find the right name."
    );
  });
});

describe("CLI paths that keep today's behaviour", () => {
  function useFixture() {
    process.env.KEYSTONEUI_URL = "https://docs.example.test";
    process.env.KEYSTONEUI_REGISTRY_URL = "https://example.test/r";
    inDir(projectDir({}));
  }

  it("`blocks signin-01` views the block, even with the index down", async () => {
    useFixture();
    const { calls } = stubFetch({
      "https://example.test/r/signin-01.json": {
        body: {
          name: "signin-01",
          type: "registry:block",
          title: "Sign In 01",
        },
      },
      [MANIFEST_URL]: { reject: true },
    });
    const io = captureConsole();
    await runCli(["blocks", "signin-01"]);
    expect(io.stdout).toBe("**Sign In 01** (`signin-01`)");
    expect(calls).toContain("https://example.test/r/signin-01.json");
    expect(process.exitCode).toBeUndefined();
  });

  it("`blocks table` searches blocks", async () => {
    useFixture();
    stubFetch({ [MANIFEST_URL]: { body: manifest(PLAIN_ITEMS) } });
    const io = captureConsole();
    await runCli(["blocks", "table"]);
    expect(io.stdout).toBe('No results found for "table".');
  });

  it("a docs 404 exits 1 with today's message", async () => {
    useFixture();
    stubFetch({
      "https://docs.example.test/llms.mdx/docs/components/nope": {
        status: 404,
      },
      [MANIFEST_URL]: { body: manifest(PLAIN_ITEMS) },
    });
    const io = captureConsole();
    await runCli(["docs", "nope"]);
    expect(io.stderr).toBe(
      "Failed to fetch https://docs.example.test/llms.mdx/docs/components/nope: 404 Not Found"
    );
    expect(io.stdout).toBe("");
    expect(process.exitCode).toBe(1);
  });
});
