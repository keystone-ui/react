/**
 * Kits and package flavours: item metadata under `meta.keystoneui`, the
 * `kit` type filter, `flavour: "package"` on get_add_command, docs and
 * examples pointers, and the names that cannot be a registry path.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProjectConfig } from "../config.js";
import { clearCache } from "../fetcher.js";
import { registryDemosUrl, registryItemUrl } from "../registry-url.js";
import {
  getAddCommandSchema,
  getAddCommandTool,
  getDocsSchema,
  getDocsTool,
  getExamplesTool,
  getProjectContextTool,
  getThemeInfoTool,
  listComponentsSchema,
  listComponentsTool,
  searchComponentsSchema,
  searchComponentsTool,
  viewComponentTool,
} from "../tools.js";
import type { RegistryItem } from "../types.js";
import {
  cleanDirs,
  forbidFetch,
  inDir,
  manifest,
  PACKAGE_PROJECT,
  projectDir,
  REGISTRY_PROJECT,
  stubFetch,
} from "./fixtures.js";

const CONFIG: ProjectConfig = {
  docsUrl: "https://docs.example.test",
  registry: { url: "https://example.test/r" },
};
const R = "https://example.test/r";
const MANIFEST_URL = `${R}/registry.json`;
const DOCS = "https://docs.example.test/llms.mdx/docs";
const ENTRY_NAME = /^\*\*.+\*\* \(`(.+)`\)$/gm;
const FIRST_NAME = /\(`(.+?)`\)/;
const SECRET = "FAKE_SECRET_not_a_real_token";
// biome-ignore lint/suspicious/noControlCharactersInRegex: the characters a name may not hold
const CONTROL = /[\u0000-\u001f\u007f]/g;

const USERS: RegistryItem = {
  name: "users-01",
  type: "registry:block",
  title: "Users 01",
  description: "A users view.",
  categories: ["data", "admin"],
  registryDependencies: [`${R}/button.json`],
};
const NPM_USERS: RegistryItem = {
  name: "npm/users-01",
  type: "registry:block",
  title: "Users 01 (package)",
  description: "The users view for the package.",
  categories: ["data", "admin"],
  dependencies: ["lucide-react"],
  meta: {
    keystoneui: {
      docs: "/docs/blocks/users-01#apps-that-use-the-npm-package",
      flavourOf: "users-01",
      minPackageVersion: "1.0.0-beta.11",
    },
  },
};
const FILTER_PILLS: RegistryItem = {
  name: "filter-pills",
  type: "registry:component",
  title: "Filter Pills",
  description: "Filter pills.",
  categories: ["data"],
  meta: {
    keystoneui: {
      docs: "/docs/blocks/admin-01#reusing-the-filter-pills",
      partOf: ["admin-01"],
    },
  },
};
const SIDEBAR: RegistryItem = {
  name: "sidebar",
  type: "registry:component",
  title: "Sidebar",
  description: "The sidebar.",
  categories: ["navigation"],
  meta: {
    keystoneui: {
      docs: "/docs/interop#the-sidebar-item",
      partOf: ["admin-01"],
    },
  },
};
const NPM_FILTER_PILLS: RegistryItem = {
  name: "npm/filter-pills",
  type: "registry:component",
  title: "Filter Pills (package)",
  description: "Filter pills for the package.",
  categories: ["data"],
  meta: {
    keystoneui: {
      docs: "/docs/blocks/admin-01#reusing-the-filter-pills",
      flavourOf: "filter-pills",
      minPackageVersion: "1.0.0-beta.11",
    },
  },
};
const ITEMS: RegistryItem[] = [
  { name: "button", type: "registry:ui", title: "Button" },
  { name: "admin-01", type: "registry:block", title: "Admin 01" },
  USERS,
  NPM_USERS,
  FILTER_PILLS,
  SIDEBAR,
  NPM_FILTER_PILLS,
  { name: "default", type: "registry:style", title: "Default" },
  { name: "themes/zinc", type: "registry:theme", title: "Zinc" },
  { name: "density/compact", type: "registry:item", title: "Compact" },
  { name: "table-demo", type: "registry:example", title: "Table demo" },
  { name: "loose", type: "registry:component", title: "Loose" },
];

const USERS_ENTRY = `**Users 01** (\`users-01\`)
A users view.
Categories: data, admin
Registry dependencies: ${R}/button.json`;
const NPM_USERS_ENTRY = `**Users 01 (package)** (\`npm/users-01\`)
The users view for the package.
Categories: data, admin
Dependencies: lucide-react`;
const NPM_USERS_LINES = `Flavour of: users-01 — for apps that use the @keystoneui/react package
Needs @keystoneui/react 1.0.0-beta.11 or later
Docs: https://docs.example.test/docs/blocks/users-01#apps-that-use-the-npm-package`;
const FILTER_PILLS_ENTRY = `**Filter Pills** (\`filter-pills\`)
Filter pills.
Categories: data`;
const FILTER_PILLS_LINES = `Kind: kit
Part of: admin-01
Package flavour: npm/filter-pills
Docs: https://docs.example.test/docs/blocks/admin-01#reusing-the-filter-pills`;

const env = { ...process.env };

beforeEach(() => {
  clearCache();
});

afterEach(() => {
  process.env = { ...env };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  cleanDirs();
});

function serveIndex(items: RegistryItem[] = ITEMS, extra = {}) {
  return stubFetch({ [MANIFEST_URL]: { body: manifest(items) }, ...extra });
}

/** Entries of a list or search response, without the totals footer. */
function entries(out: string): string[] {
  return out.split("\n\n\n---\n")[0].split("\n\n");
}

describe("type filter", () => {
  it("accepts kit, style, theme and item, and still rejects widget", () => {
    for (const type of ["kit", "style", "theme", "item"]) {
      expect(listComponentsSchema.safeParse({ type }).success, type).toBe(true);
      expect(
        searchComponentsSchema.safeParse({ query: "x", type }).success,
        type
      ).toBe(true);
    }
    expect(listComponentsSchema.safeParse({ type: "widget" }).success).toBe(
      false
    );
    expect(getDocsSchema.safeParse({ name: "x", type: "kit" }).success).toBe(
      false
    );
  });

  it("selects each registry type", async () => {
    serveIndex();
    const names = async (type: "kit" | "style" | "theme" | "item") =>
      [
        ...(
          await listComponentsTool(CONFIG, { limit: 100, offset: 0, type })
        ).matchAll(ENTRY_NAME),
      ].map((m) => m[1]);
    expect(await names("kit")).toEqual([
      "filter-pills",
      "sidebar",
      "npm/filter-pills",
      "loose",
    ]);
    expect(await names("style")).toEqual(["default"]);
    expect(await names("theme")).toEqual(["themes/zinc"]);
    expect(await names("item")).toEqual(["density/compact"]);
  });

  it("search filters by kit", async () => {
    serveIndex();
    const out = await searchComponentsTool(CONFIG, {
      limit: 10,
      query: "sidebar",
      type: "kit",
    });
    expect([...out.matchAll(ENTRY_NAME)].map((m) => m[1])).toEqual(["sidebar"]);
  });
});

describe("metadata lines", () => {
  it("appends them after each entry's existing lines in list", async () => {
    serveIndex();
    const out = await listComponentsTool(CONFIG, { limit: 100, offset: 0 });
    const byName = new Map(
      entries(out).map((entry) => [FIRST_NAME.exec(entry)?.[1], entry])
    );
    expect(byName.get("users-01")).toBe(
      `${USERS_ENTRY}\nPackage flavour: npm/users-01`
    );
    expect(byName.get("npm/users-01")).toBe(
      `${NPM_USERS_ENTRY}\n${NPM_USERS_LINES}`
    );
    expect(byName.get("filter-pills")).toBe(
      `${FILTER_PILLS_ENTRY}\n${FILTER_PILLS_LINES}`
    );
    expect(byName.get("sidebar")).toBe(`**Sidebar** (\`sidebar\`)
The sidebar.
Categories: navigation
Kind: kit
Part of: admin-01
Docs: https://docs.example.test/docs/interop#the-sidebar-item`);
    // No metadata: no lines, not even Kind.
    expect(byName.get("loose")).toBe("**Loose** (`loose`)");
    expect(byName.get("button")).toBe("**Button** (`button`)");
    expect(out.endsWith("\n\n\n---\nShowing 12 of 12 items.")).toBe(true);
  });

  it("appends the same lines in search", async () => {
    serveIndex();
    const out = await searchComponentsTool(CONFIG, {
      limit: 10,
      query: "users view package",
    });
    expect(entries(out)[0]).toBe(`${NPM_USERS_ENTRY}\n${NPM_USERS_LINES}`);
  });

  it("names the package flavour when the twin is on another page", async () => {
    serveIndex();
    const first = await listComponentsTool(CONFIG, {
      limit: 3,
      offset: 0,
    });
    expect(entries(first)).toEqual([
      "**Button** (`button`)",
      "**Admin 01** (`admin-01`)",
      `${USERS_ENTRY}\nPackage flavour: npm/users-01`,
    ]);
    expect(first).toContain("Showing 3 of 12 items.");
  });

  it("places them between the summary and the source in view", async () => {
    stubFetch({
      [`${R}/npm/users-01.json`]: {
        body: {
          ...NPM_USERS,
          files: [{ content: "export {};\n", path: "users.tsx", type: "x" }],
        },
      },
    });
    expect(await viewComponentTool(CONFIG, { names: ["npm/users-01"] })).toBe(
      `${NPM_USERS_ENTRY}\n${NPM_USERS_LINES}\n\n### users.tsx\n\`\`\`tsx\nexport {};\n\`\`\``
    );
  });

  it("ignores malformed values field by field and keeps the item", async () => {
    serveIndex([
      { name: "a", type: "registry:block", title: "A" },
      {
        name: "bad",
        type: "registry:component",
        title: "Bad",
        meta: {
          keystoneui: {
            docs: "https://elsewhere.test/docs",
            flavourOf: 3,
            minPackageVersion: ["1"],
            partOf: "a",
            unknown: true,
          },
        },
      },
      {
        name: "self",
        type: "registry:block",
        title: "Self",
        meta: { keystoneui: { flavourOf: "self", partOf: ["a", 2] } },
      },
      {
        name: "half",
        type: "registry:component",
        title: "Half",
        meta: { keystoneui: { docs: "/docs/x", flavourOf: 7 } },
      },
      {
        name: "notobject",
        type: "registry:component",
        title: "Not object",
        meta: { keystoneui: "kit" },
      },
    ]);
    const out = await listComponentsTool(CONFIG, { limit: 100, offset: 0 });
    expect(entries(out)).toEqual([
      "**A** (`a`)",
      "**Bad** (`bad`)",
      "**Self** (`self`)",
      "**Half** (`half`)\nKind: kit\nDocs: https://docs.example.test/docs/x",
      "**Not object** (`notobject`)",
    ]);
  });

  it("does not credit an npm/ name without metadata", async () => {
    serveIndex([
      { name: "x", type: "registry:block", title: "X" },
      { name: "npm/x", type: "registry:block", title: "X (package)" },
    ]);
    const out = await listComponentsTool(CONFIG, { limit: 20, offset: 0 });
    expect(entries(out)).toEqual(["**X** (`x`)", "**X (package)** (`npm/x`)"]);
  });

  it("uses the first flavour in index order when two name the same item", async () => {
    serveIndex([
      USERS,
      { ...NPM_USERS, name: "a/users-01" },
      { ...NPM_USERS, name: "b/users-01" },
    ]);
    const out = await listComponentsTool(CONFIG, { limit: 20, offset: 0 });
    expect(entries(out)[0]).toBe(`${USERS_ENTRY}\nPackage flavour: a/users-01`);
  });

  it("prints the docs base without a credential", async () => {
    serveIndex([SIDEBAR]);
    const out = await listComponentsTool(
      { ...CONFIG, docsUrl: `https://user:${SECRET}@docs.example.test` },
      { limit: 20, offset: 0 }
    );
    expect(out).toContain(
      "Docs: https://docs.example.test/docs/interop#the-sidebar-item"
    );
    expect(out).not.toContain(SECRET);
  });
});

describe("get_add_command with flavour: package", () => {
  const add = (names: string[]) =>
    getAddCommandTool(CONFIG, { flavour: "package", names });

  function packageProject() {
    inDir(projectDir(PACKAGE_PROJECT));
  }

  /** Today's install blocks for these names. */
  function commands(names: string[]): string {
    const urls = names.map((name) => `${R}/${name}.json`);
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

  it("keeps a flavour named directly, never npm/npm/", async () => {
    packageProject();
    serveIndex();
    expect(await add(["npm/users-01"])).toBe(
      `- \`npm/users-01\`: package flavour of \`users-01\`. Needs @keystoneui/react 1.0.0-beta.11 or later; package.json declares ^1.0.0-beta.10.\n\n${commands(["npm/users-01"])}`
    );
  });

  it("installs the flavour of an item that has one", async () => {
    packageProject();
    serveIndex();
    expect(await add(["users-01"])).toBe(
      `- \`users-01\` → \`npm/users-01\` (package flavour). Needs @keystoneui/react 1.0.0-beta.11 or later; package.json declares ^1.0.0-beta.10.\n\n${commands(["npm/users-01"])}`
    );
  });

  it("prints a version minimum only for the first-party flavour that documents one", async () => {
    // The first-party entries, read from the registry source, through the
    // same fetch fixture: selection must still work, and only npm/users-01
    // carries a documented minimum.
    const registry = JSON.parse(
      readFileSync(
        join(import.meta.dirname, "../../../../registry.json"),
        "utf-8"
      )
    ) as { items: RegistryItem[] };
    const parents = ["users-01", "sidebar", "filter-pills"];
    const wanted = new Set([...parents, ...parents.map((n) => `npm/${n}`)]);
    packageProject();
    serveIndex(registry.items.filter((item) => wanted.has(item.name)));
    const out = await add(parents);
    for (const name of parents) {
      expect(out).toContain(`${R}/npm/${name}.json`);
    }
    const needs = out
      .split("\n")
      .filter((line) => line.includes("Needs @keystoneui/react"));
    expect(needs).toHaveLength(1);
    expect(needs[0]).toContain("`users-01` → `npm/users-01`");
  });

  it("follows the flavour's actual name", async () => {
    packageProject();
    serveIndex([USERS, { ...NPM_USERS, name: "packages/users-01" }]);
    expect(await add(["users-01"])).toBe(
      `- \`users-01\` → \`packages/users-01\` (package flavour). Needs @keystoneui/react 1.0.0-beta.11 or later; package.json declares ^1.0.0-beta.10.\n\n${commands(["packages/users-01"])}`
    );
  });

  it("vendors a block or kit with no flavour, and says so", async () => {
    packageProject();
    serveIndex();
    expect(await add(["sidebar", "admin-01", "table-demo"])).toBe(
      [
        "- `sidebar`: No package flavour: this vendors source that imports from your ui alias, beside the package.",
        "- `admin-01`: No package flavour: this vendors source that imports from your ui alias, beside the package.",
        "- `table-demo`: No package flavour: this vendors source that imports from your ui alias, beside the package.",
        "",
        commands(["sidebar", "admin-01", "table-demo"]),
      ].join("\n")
    );
  });

  it("prints no command for a component alone", async () => {
    packageProject();
    serveIndex();
    expect(await add(["button"])).toBe(
      [
        '- button is a component. If @keystoneui/react provides it, import it from "@keystoneui/react/button" instead of installing it.',
        "",
        'No install command: none of these names is installed with flavour: "package".',
      ].join("\n")
    );
  });

  it("installs a style, theme or item as named", async () => {
    packageProject();
    serveIndex();
    expect(await add(["default", "themes/zinc", "density/compact"])).toBe(
      [
        "- `default`: a registry:style item, installed as named.",
        "- `themes/zinc`: a registry:theme item, installed as named.",
        "- `density/compact`: a registry:item item, installed as named.",
        "",
        commands(["default", "themes/zinc", "density/compact"]),
      ].join("\n")
    );
  });

  it("composes a name not in the index as today", async () => {
    packageProject();
    serveIndex();
    const code = "theme/k1_slate_0.55_0.2_262.5_large_inter";
    expect(await add([code])).toBe(
      `- \`${code}\`: Not in the registry index; command composed from the name.\n\n${commands([code])}`
    );
  });

  it("attributes a mixed request per name", async () => {
    packageProject();
    serveIndex();
    expect(await add(["users-01", "button", "sidebar"])).toBe(
      [
        "- `users-01` → `npm/users-01` (package flavour). Needs @keystoneui/react 1.0.0-beta.11 or later; package.json declares ^1.0.0-beta.10.",
        '- button is a component. If @keystoneui/react provides it, import it from "@keystoneui/react/button" instead of installing it.',
        "- `sidebar`: No package flavour: this vendors source that imports from your ui alias, beside the package.",
        "",
        commands(["npm/users-01", "sidebar"]),
      ].join("\n")
    );
  });

  it("installs one target once", async () => {
    packageProject();
    serveIndex();
    const out = await add(["users-01", "npm/users-01"]);
    expect(out.endsWith(commands(["npm/users-01"]))).toBe(true);
  });

  it("says what package.json lacks rather than printing nothing", async () => {
    inDir(projectDir(REGISTRY_PROJECT));
    serveIndex([
      USERS,
      { ...NPM_USERS, meta: { keystoneui: { flavourOf: "users-01" } } },
    ]);
    expect(await add(["users-01", "npm/users-01"])).toBe(
      [
        "- `users-01` → `npm/users-01` (package flavour).",
        "- `npm/users-01`: package flavour of `users-01`.",
        "",
        commands(["npm/users-01"]),
      ].join("\n")
    );
    clearCache();
    serveIndex();
    expect(await add(["npm/users-01"])).toContain(
      "Needs @keystoneui/react 1.0.0-beta.11 or later; package.json declares no @keystoneui/react dependency."
    );
  });

  it("keeps the names as supplied when the index cannot be read", async () => {
    packageProject();
    stubFetch({ [MANIFEST_URL]: { reject: true } });
    expect(await add(["users-01", "button"])).toBe(
      `Could not read the registry index (${MANIFEST_URL}); names kept as supplied; package-flavour selection could not be checked.\n\n${commands(["users-01", "button"])}`
    );
  });

  it("keeps the names as supplied when the index answers 500", async () => {
    packageProject();
    stubFetch({ [MANIFEST_URL]: { status: 500 } });
    expect(await add(["users-01"])).toContain(
      "names kept as supplied; package-flavour selection could not be checked."
    );
  });

  it("gives up on the index after ten seconds", async () => {
    vi.useFakeTimers();
    packageProject();
    stubFetch({ [MANIFEST_URL]: { hang: true } });
    const pending = add(["users-01"]);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await pending).toBe(
      `Could not read the registry index (${MANIFEST_URL}); names kept as supplied; package-flavour selection could not be checked.\n\n${commands(["users-01"])}`
    );
  });

  it("redacts a credential in the index URL it reports", async () => {
    packageProject();
    const registry = `https://user:${SECRET}@example.test/r?token=${SECRET}`;
    stubFetch({
      [`https://user:${SECRET}@example.test/r/registry.json?token=${SECRET}`]: {
        reject: true,
      },
    });
    const out = await getAddCommandTool(
      { ...CONFIG, registry: { url: registry } },
      { flavour: "package", names: ["users-01"] }
    );
    const notice = out.split("\n")[0];
    expect(notice).toBe(
      "Could not read the registry index (https://example.test/r/registry.json?token=REDACTED); names kept as supplied; package-flavour selection could not be checked."
    );
  });

  it("refuses an automatically selected target that is not a registry path", async () => {
    packageProject();
    serveIndex([USERS, { ...NPM_USERS, name: "npm/../users-01" }]);
    expect(await add(["users-01"])).toBe(
      [
        "No install command: every name must be a registry item name.",
        "- **npm/../users-01** (the package flavour of users-01): not a valid registry item name (dot segment).",
      ].join("\n")
    );
  });

  it("vendored is the same as no flavour, with no request", async () => {
    inDir(projectDir(PACKAGE_PROJECT));
    const { fn } = forbidFetch();
    expect(
      await getAddCommandTool(CONFIG, {
        flavour: "vendored",
        names: ["users-01"],
      })
    ).toBe(await getAddCommandTool(CONFIG, { names: ["users-01"] }));
    expect(fn).not.toHaveBeenCalled();
  });

  it("accepts the flavour parameter in the schema", () => {
    for (const flavour of ["vendored", "package"]) {
      expect(
        getAddCommandSchema.safeParse({ flavour, names: ["x"] }).success
      ).toBe(true);
    }
    expect(
      getAddCommandSchema.safeParse({ flavour: "auto", names: ["x"] }).success
    ).toBe(false);
  });
});

describe("get_project_context in package mode", () => {
  it("ends with the flavour line after today's lines", () => {
    inDir(projectDir(PACKAGE_PROJECT));
    const out = getProjectContextTool();
    const today = `# Project context

| field | value |
|---|---|
| install mode | **package** -- \`@keystoneui/react\` (^1.0.0-beta.10) is a dependency. Import from subpaths. |
| ui alias | _unknown_ |
| theme CSS file | _unknown_ -- ask which file owns the tokens |
| icon library | _unknown_ -- ask before importing icons |
| RSC | _unknown_ |
| package manager | _unknown_ |

Example import: \`import { … } from "@keystoneui/react/button";\``;
    expect(out).toBe(
      `${today}\nInstalling a block or kit: pass flavour: "package" to get_add_command; it uses the registry's package flavour where one exists, and vendors source where none does.`
    );
  });
});

describe("get_theme_info", () => {
  it("names the sidebar item", () => {
    inDir(projectDir({}));
    const out = getThemeInfoTool(CONFIG);
    expect(out).toContain(
      "- `--sidebar` + 7 `--sidebar-*`: Read by the sidebar item (`sidebar`) and by an imported shadcn sidebar. Declared as aliases"
    );
    expect(out).not.toContain("keystone ships none");
  });
});

describe("get_docs pointers", () => {
  it("follows a kit's pointer after a 404, with its section", async () => {
    const { calls } = serveIndex(ITEMS, {
      [`${DOCS}/components/sidebar`]: { status: 404 },
      [`${DOCS}/interop`]: { body: "# Interop\n" },
    });
    expect(
      await getDocsTool(CONFIG, { name: "sidebar", type: "component" })
    ).toBe(
      "Documented in section #the-sidebar-item of /docs/interop.\n\n# Interop\n"
    );
    expect(calls).toEqual([
      `${DOCS}/components/sidebar`,
      MANIFEST_URL,
      `${DOCS}/interop`,
    ]);
  });

  it("resolves a flavour with the default type", async () => {
    serveIndex(ITEMS, {
      [`${DOCS}/components/npm/users-01`]: { status: 404 },
      [`${DOCS}/blocks/users-01`]: { body: "# Users 01\n" },
    });
    expect(
      await getDocsTool(CONFIG, { name: "npm/users-01", type: "component" })
    ).toBe(
      "Documented in section #apps-that-use-the-npm-package of /docs/blocks/users-01.\n\n# Users 01\n"
    );
  });

  it("takes the parent's pointer, or the parent's page, when a flavour has none", async () => {
    serveIndex(
      [
        FILTER_PILLS,
        USERS,
        {
          name: "pkg/filter-pills",
          type: "registry:component",
          meta: { keystoneui: { flavourOf: "filter-pills" } },
        },
        {
          name: "pkg/users-01",
          type: "registry:block",
          meta: { keystoneui: { flavourOf: "users-01" } },
        },
      ],
      {
        [`${DOCS}/components/pkg/filter-pills`]: { status: 404 },
        [`${DOCS}/components/pkg/users-01`]: { status: 404 },
        [`${DOCS}/blocks/admin-01`]: { body: "# Admin 01\n" },
        [`${DOCS}/blocks/users-01`]: { body: "# Users 01\n" },
      }
    );
    expect(
      await getDocsTool(CONFIG, { name: "pkg/filter-pills", type: "component" })
    ).toBe(
      "Documented in section #reusing-the-filter-pills of /docs/blocks/admin-01.\n\n# Admin 01\n"
    );
    // users-01 has no pointer: its own page, by its type, with no anchor.
    expect(
      await getDocsTool(CONFIG, { name: "pkg/users-01", type: "component" })
    ).toBe("Documented in /docs/blocks/users-01.\n\n# Users 01\n");
  });

  it("prints no anchor for a pointer without one", async () => {
    serveIndex(
      [
        {
          name: "k",
          type: "registry:component",
          meta: { keystoneui: { docs: "/docs/interop" } },
        },
      ],
      {
        [`${DOCS}/components/k`]: { status: 404 },
        [`${DOCS}/interop`]: { body: "# Interop\n" },
      }
    );
    const out = await getDocsTool(CONFIG, { name: "k", type: "component" });
    expect(out).toBe("Documented in /docs/interop.\n\n# Interop\n");
    expect(out).not.toContain("undefined");
  });

  it("gives today's not-found text when the index cannot be read", async () => {
    stubFetch({
      [`${DOCS}/components/sidebar`]: { status: 404 },
      [MANIFEST_URL]: { reject: true },
    });
    expect(
      await getDocsTool(CONFIG, { name: "sidebar", type: "component" })
    ).toBe(
      "**sidebar**: no component docs found (404). Try search_components to find the right name."
    );
  });

  it("gives today's not-found text when the pointed page fails", async () => {
    serveIndex(ITEMS, {
      [`${DOCS}/components/sidebar`]: { status: 404 },
      [`${DOCS}/interop`]: { status: 500 },
    });
    expect(
      await getDocsTool(CONFIG, { name: "sidebar", type: "component" })
    ).toBe(
      "**sidebar**: no component docs found (404). Try search_components to find the right name."
    );
  });

  it("does not read the index on a failure other than 404", async () => {
    const { calls } = stubFetch({
      [`${DOCS}/components/sidebar`]: { status: 500 },
    });
    expect(
      await getDocsTool(CONFIG, { name: "sidebar", type: "component" })
    ).toBe(
      "**sidebar**: no component docs found (500). Try search_components to find the right name."
    );
    expect(calls).toEqual([`${DOCS}/components/sidebar`]);
  });
});

describe("get_examples hint", () => {
  const TODAY = (name: string) =>
    `**${name}**: examples not found in registry.`;

  it("names the containing block for a kit with no demos", async () => {
    serveIndex(ITEMS, { [`${R}/demos/sidebar`]: { status: 404 } });
    expect(await getExamplesTool(CONFIG, { name: "sidebar" })).toBe(
      `${TODAY("sidebar")}\nNo demos of its own; it is used in admin-01: get_examples("admin-01")`
    );
  });

  it("goes from a flavour to its kit to the containing block", async () => {
    serveIndex(ITEMS, { [`${R}/demos/npm/filter-pills`]: { status: 404 } });
    expect(await getExamplesTool(CONFIG, { name: "npm/filter-pills" })).toBe(
      `${TODAY("npm/filter-pills")}\nNo demos of its own; it is used in admin-01: get_examples("admin-01")`
    );
  });

  it("names the parent block for a block's flavour", async () => {
    serveIndex(ITEMS, { [`${R}/demos/npm/users-01`]: { status: 404 } });
    expect(await getExamplesTool(CONFIG, { name: "npm/users-01" })).toBe(
      `${TODAY("npm/users-01")}\nNo demos of its own; it is used in users-01: get_examples("users-01")`
    );
  });

  it("adds nothing when the demos request fails for another reason", async () => {
    const { calls } = stubFetch({ [`${R}/demos/sidebar`]: { reject: true } });
    expect(await getExamplesTool(CONFIG, { name: "sidebar" })).toBe(
      TODAY("sidebar")
    );
    expect(calls).toEqual([`${R}/demos/sidebar`]);
  });

  it("adds nothing when the index cannot be read", async () => {
    stubFetch({
      [`${R}/demos/sidebar`]: { status: 404 },
      [MANIFEST_URL]: { reject: true },
    });
    expect(await getExamplesTool(CONFIG, { name: "sidebar" })).toBe(
      TODAY("sidebar")
    );
  });

  it("leaves a third-party kit's bundle untouched", async () => {
    stubFetch({
      [`${R}/demos/sidebar`]: {
        body: { files: [{ content: "x", path: "a.tsx" }], name: "sidebar" },
      },
    });
    expect(await getExamplesTool(CONFIG, { name: "sidebar" })).toBe(
      "# sidebar examples\n\n1 file:\n\n\n\n### a.tsx\n\n```tsx\nx\n```"
    );
  });
});

describe("names that cannot be a registry path", () => {
  const REFUSED: [string, string][] = [
    ["../x", "dot segment"],
    ["a/../b", "dot segment"],
    ["a/./b", "dot segment"],
    [".", "dot segment"],
    ["..", "dot segment"],
    ["%2e%2e/x", "dot segment"],
    ["a/.%2E/b", "dot segment"],
    ["a/%2E", "dot segment"],
    ["a?b", "query delimiter `?`"],
    ["a#b", "fragment delimiter `#`"],
    ["a\\b", "backslash, read as a path separator"],
    ["/x", "empty path segment"],
    ["a//b", "empty path segment"],
    ["a/", "empty path segment"],
    ["https://x", "empty path segment"],
    ["", "empty name"],
    ["a\nb", "control character"],
    ["a\u007fb", "control character"],
    // The last segment as the URL parser requests it, trailing spaces gone.
    [".. ", "dot segment"],
    ["x/.. ", "dot segment"],
    [". ", "dot segment"],
    ["a/ ", "empty path segment"],
  ];
  const ONLY = "theme/k1_slate_0.55_0.2_262.5_large_inter?only=theme";
  const ONLY_TEXT =
    "**theme/k1_slate_0.55_0.2_262.5_large_inter?only=theme**: ?only is not part of a name: get the command for theme/k1_slate_0.55_0.2_262.5_large_inter, then append ?only=theme to the printed URL (CLI: keystoneui theme k1_slate_0.55_0.2_262.5_large_inter --only theme).";
  // Control characters are shown escaped; everything else as typed.
  const shown = (name: string) =>
    name.replace(
      CONTROL,
      (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`
    );
  const refusal = (name: string, reason: string) =>
    `**${shown(name)}**: not a valid registry item name (${reason}).`;

  it("distinguishes intermediate normalization from terminal filename and empty-segment cases", () => {
    // Intermediate dot segments resolve away; a terminal one stays in the
    // file name, and an empty segment stays. All are refused by rule, not
    // because every one leaves the item's path.
    const path = (name: string) =>
      new URL(registryItemUrl(CONFIG.registry, name)).pathname;
    expect(path("a/%2e%2e/b")).toBe("/r/b.json");
    expect(path("a/.%2E/b")).toBe("/r/b.json");
    expect(path("../x")).toBe("/x.json");
    expect(path("a/%2E")).toBe("/r/a/%2E.json");
    expect(path("a//b")).toBe("/r/a//b.json");
    // Where the name ends the URL (demos, the docs page), the parser drops
    // its trailing spaces, so a last segment of dots and spaces resolves.
    const demos = (name: string) =>
      new URL(registryDemosUrl(CONFIG.registry, name)).pathname;
    const page = (name: string) =>
      new URL(`${CONFIG.docsUrl}/llms.mdx/docs/components/${name}`).pathname;
    expect(demos(".. ")).toBe("/r/");
    expect(demos("x/.. ")).toBe("/r/demos/");
    expect(demos("a/ ")).toBe("/r/demos/a/");
    expect(page(".. ")).toBe("/llms.mdx/docs/");
    expect(page(". ")).toBe("/llms.mdx/docs/components/");
  });

  it.each(REFUSED)(
    "view_component refuses %j in its slot only (%s)",
    async (name, reason) => {
      stubFetch({
        [`${R}/button.json`]: { body: { name: "button", title: "Button" } },
      });
      expect(await viewComponentTool(CONFIG, { names: ["button", name] })).toBe(
        `**Button** (\`button\`)\n\n---\n\n${refusal(name, reason)}`
      );
    }
  );

  it("view_component points ?only at the printed URL", async () => {
    forbidFetch();
    expect(await viewComponentTool(CONFIG, { names: [ONLY] })).toBe(ONLY_TEXT);
  });

  it.each(REFUSED)(
    "get_add_command refuses the whole call for %j, with no request (%s)",
    async (name, reason) => {
      const { fn } = forbidFetch();
      expect(await getAddCommandTool(CONFIG, { names: ["button", name] })).toBe(
        `No install command: every name must be a registry item name.\n- ${refusal(name, reason)}`
      );
      expect(fn).not.toHaveBeenCalled();
    }
  );

  it("get_add_command refuses ?only and a bad name under flavour: package", async () => {
    forbidFetch();
    expect(await getAddCommandTool(CONFIG, { names: [ONLY] })).toBe(
      `No install command: every name must be a registry item name.\n- ${ONLY_TEXT}`
    );
    expect(
      await getAddCommandTool(CONFIG, { flavour: "package", names: ["a?b"] })
    ).toBe(
      `No install command: every name must be a registry item name.\n- ${refusal("a?b", "query delimiter `?`")}`
    );
  });

  it.each(REFUSED)(
    "get_examples and get_docs refuse %j, with no request (%s)",
    async (name, reason) => {
      const { fn } = forbidFetch();
      expect(await getExamplesTool(CONFIG, { name })).toBe(
        refusal(name, reason)
      );
      expect(await getDocsTool(CONFIG, { name, type: "component" })).toBe(
        refusal(name, reason)
      );
      expect(fn).not.toHaveBeenCalled();
    }
  );

  it.each([
    "themes/zinc",
    "density/compact",
    "npm/users-01",
    "theme/k1_slate_0.55_0.2_262.5_large_inter",
    "Button_v2",
    "ui/forms/input",
    "@acme/x",
    "x.json",
    "button+icon",
    "50%off",
    "%40acme/x",
    "a%2eb",
    "a%2Fb",
    "...",
    "a/.x",
  ])("accepts %j and prints its URL unquoted", async (name) => {
    forbidFetch();
    const out = await getAddCommandTool(CONFIG, { names: [name] });
    expect(out).toContain(`\nnpx shadcn@latest add ${R}/${name}.json\n`);
  });

  it.each([
    ["a;b", `'${R}/a;b.json'`],
    ["a b", `'${R}/a b.json'`],
    ["a$b", `'${R}/a$b.json'`],
    ["é-x", `'${R}/é-x.json'`],
    ["it's", `'${R}/it'\\''s.json'`],
  ])("accepts %j and quotes its URL", async (name, url) => {
    forbidFetch();
    const out = await getAddCommandTool(CONFIG, { names: ["button", name] });
    expect(out).toContain(`npx shadcn@latest add ${R}/button.json ${url}\n`);
    expect(out).toContain(`\nnpx shadcn@latest add ${url}\n`);
  });

  it("decides quoting on the whole URL, registry included", async () => {
    const out = await getAddCommandTool(
      { ...CONFIG, registry: { url: "https://example.test/r?team=a&b=c" } },
      { names: ["button"] }
    );
    expect(out).toContain(
      "\nnpx shadcn@latest add 'https://example.test/r/button.json?team=a&b=c'\n"
    );
  });
});

describe("metadata edge cases", () => {
  const CYCLE: RegistryItem[] = [
    {
      name: "a",
      type: "registry:block",
      title: "A",
      meta: { keystoneui: { flavourOf: "b" } },
    },
    {
      name: "b",
      type: "registry:block",
      title: "B",
      meta: { keystoneui: { flavourOf: "a" } },
    },
  ];
  const GHOST: RegistryItem = {
    name: "pkg/ghost",
    type: "registry:block",
    title: "Ghost (package)",
    meta: { keystoneui: { flavourOf: "ghost", minPackageVersion: "1.0.0" } },
  };
  const EXAMPLE_PARENT: RegistryItem[] = [
    { name: "demo", type: "registry:example", title: "Demo" },
    {
      name: "pkg/demo",
      type: "registry:example",
      title: "Demo (package)",
      meta: { keystoneui: { flavourOf: "demo" } },
    },
  ];

  it("a flavour cycle lists each side once and follows one hop", async () => {
    serveIndex(CYCLE, {
      [`${DOCS}/components/a`]: { status: 404 },
      [`${DOCS}/blocks/b`]: { body: "# B\n" },
      [`${R}/demos/a`]: { status: 404 },
    });
    const out = await listComponentsTool(CONFIG, { limit: 20, offset: 0 });
    expect(entries(out)).toEqual([
      "**A** (`a`)\nFlavour of: b — for apps that use the @keystoneui/react package\nPackage flavour: b",
      "**B** (`b`)\nFlavour of: a — for apps that use the @keystoneui/react package\nPackage flavour: a",
    ]);
    expect(await getDocsTool(CONFIG, { name: "a", type: "component" })).toBe(
      "Documented in /docs/blocks/b.\n\n# B\n"
    );
    expect(await getExamplesTool(CONFIG, { name: "a" })).toBe(
      '**a**: examples not found in registry.\nNo demos of its own; it is used in b: get_examples("b")'
    );
    inDir(projectDir(PACKAGE_PROJECT));
    expect(
      (
        await getAddCommandTool(CONFIG, { flavour: "package", names: ["a"] })
      ).split("\n")[0]
    ).toBe("- `a`: package flavour of `b`.");
  });

  it("a flavour of a missing item gives no docs, no hint, and installs as named", async () => {
    serveIndex([GHOST], {
      [`${DOCS}/components/pkg/ghost`]: { status: 404 },
      [`${R}/demos/pkg/ghost`]: { status: 404 },
    });
    expect(
      await getDocsTool(CONFIG, { name: "pkg/ghost", type: "component" })
    ).toBe(
      "**pkg/ghost**: no component docs found (404). Try search_components to find the right name."
    );
    expect(await getExamplesTool(CONFIG, { name: "pkg/ghost" })).toBe(
      "**pkg/ghost**: examples not found in registry."
    );
    inDir(projectDir(PACKAGE_PROJECT));
    expect(
      (
        await getAddCommandTool(CONFIG, {
          flavour: "package",
          names: ["pkg/ghost"],
        })
      ).split("\n")[0]
    ).toBe(
      "- `pkg/ghost`: package flavour of `ghost`. Needs @keystoneui/react 1.0.0 or later; package.json declares ^1.0.0-beta.10."
    );
  });

  it("a parent with no docs section of its own gives today's not-found text", async () => {
    serveIndex(EXAMPLE_PARENT, {
      [`${DOCS}/components/pkg/demo`]: { status: 404 },
    });
    const out = await getDocsTool(CONFIG, {
      name: "pkg/demo",
      type: "component",
    });
    expect(out).toBe(
      "**pkg/demo**: no component docs found (404). Try search_components to find the right name."
    );
    expect(out).not.toContain("undefined");
  });

  it("an example's package flavour is followed as a block's is", async () => {
    inDir(projectDir(PACKAGE_PROJECT));
    serveIndex(EXAMPLE_PARENT);
    expect(
      (
        await getAddCommandTool(CONFIG, { flavour: "package", names: ["demo"] })
      ).split("\n")[0]
    ).toBe("- `demo` → `pkg/demo` (package flavour).");
  });
});
