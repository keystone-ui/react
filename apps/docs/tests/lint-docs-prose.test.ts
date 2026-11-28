/**
 * `scripts/lint-docs-prose.mjs`: the prose rules, the zones they skip, the
 * allowlist and the baseline ratchet.
 *
 * Rules and skip zones run through the exported `lintProse`. The ratchet runs
 * the CLI as a subprocess against a throwaway content dir, baseline and
 * allowlist under the OS temp dir (removed afterwards). No test writes to the
 * repo.
 */

import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  applyAllowlist,
  lintProse,
} from "../../../scripts/lint-docs-prose.mjs";

const SCRIPT = join(
  import.meta.dirname,
  "../../../scripts/lint-docs-prose.mjs"
);

const FM =
  "---\ntitle: Probe\ndescription: A probe.\ncontentType: Reference\n---\n\n";

interface Finding {
  line: number;
  match: string;
  rule: string;
}

/** Findings for a body under valid frontmatter. */
function lint(body: string, options?: { properNouns?: string[] }): Finding[] {
  return lintProse(FM + body, "probe.mdx", options);
}

function rules(body: string) {
  return lint(body).map((f) => f.rule);
}

describe("lint-docs-prose rules", () => {
  it.each([
    [
      "em-dash",
      "The tile reads well — and fast.",
      "The tile reads well, and fast.",
    ],
    [
      "em-dash",
      "The tile reads well -- and fast.",
      "Pages 1 - 2 hold the range.",
    ],
    [
      "em-dash",
      "The tile reads well - and fast.",
      "- **Bold** is a list item.",
    ],
    ["ellipsis", "Wait for it...", "Wait for it…"],
    ["banned-word", "Just add the class.", "Add the class; adjustment helps."],
    ["banned-word", "It is EASY to miss.", "It is easygoing."],
    [
      "the-user",
      "When the user clicks, it opens.",
      "When users click, it opens.",
    ],
    ["the-user", "One can override it.", "Someone can override it."],
    [
      "heading-case",
      "## Getting Started",
      "## Getting started with Keystone UI",
    ],
    ["heading-case", "### With Description", "### With `DataTable` and React"],
    ["rhetorical-question", "## What is MCP?", "## What MCP is"],
    ["rhetorical-question", "Ready to start? Read on.", "Read on to start."],
    [
      "unit-spacing",
      "It weighs 16KB and takes 200ms.",
      "It weighs 16 KB, waits 30s.",
    ],
    ["code-fence-lang", "```\nplain\n```", "```text\nplain\n```"],
    ["horizontal-rule", "Above.\n\n---\n\nBelow.", "Above.\n\nBelow."],
    [
      "anchor-text",
      "Read more [here](/docs).",
      "Read [the theming guide](/docs).",
    ],
    [
      "anchor-text",
      "See https://example.com for more.",
      "See [the example](https://example.com).",
    ],
  ])("%s: flags %j, passes %j", (rule, bad, good) => {
    expect(rules(bad)).toContain(rule);
    expect(rules(good)).not.toContain(rule);
  });

  it("counts each occurrence on a line", () => {
    const found = lint("One — two — three.");
    expect(found.filter((f) => f.rule === "em-dash")).toHaveLength(2);
  });

  it("reports the source line number", () => {
    const found = lint("Fine.\n\nJust fine.");
    expect(found).toEqual([
      expect.objectContaining({ rule: "banned-word", line: 9 }),
    ]);
  });

  it("treats the list marker as a marker and flags the dash after it", () => {
    const found = lint("- **50+ Components** -- Buttons and more");
    expect(found.map((f) => f.rule)).toEqual(["em-dash"]);
    expect(found[0].match).toBe(" -- ");
  });

  it("keeps component names capitalized in headings when told them", () => {
    expect(rules("### Inside a Card")).toContain("heading-case");
    expect(
      lint("### Inside a Card", { properNouns: ["Card"] }).map((f) => f.rule)
    ).not.toContain("heading-case");
  });

  it("treats the first word after a colon as a first word", () => {
    expect(rules("## Step 1: Install the package")).not.toContain(
      "heading-case"
    );
  });

  describe("content-type", () => {
    it("flags frontmatter without contentType", () => {
      const found = lintProse("---\ntitle: Probe\n---\n\nText.\n", "p.mdx");
      expect(found.map((f) => f.rule)).toEqual(["content-type"]);
    });

    it("flags an unknown contentType", () => {
      const found = lintProse(
        "---\ntitle: Probe\ncontentType: Guide\n---\n\nText.\n",
        "p.mdx"
      );
      expect(found.map((f) => f.rule)).toEqual(["content-type"]);
    });

    it("accepts a known contentType, quoted or not", () => {
      for (const value of ["How-to", '"Landing"']) {
        const src = `---\ntitle: Probe\ncontentType: ${value}\n---\n\nText.\n`;
        expect(lintProse(src, "p.mdx")).toEqual([]);
      }
    });
  });
});

describe("lint-docs-prose skip zones", () => {
  it("skips fenced code, backtick and tilde", () => {
    expect(
      rules(
        "```tsx\n// just a very simple demo...\n```\n\n~~~bash\necho — here\n~~~"
      )
    ).toEqual([]);
  });

  it("skips inline code", () => {
    expect(rules("Pass `simple` and `a...b` to it.")).toEqual([]);
  });

  it("skips JSX lines and their attributes, across lines", () => {
    expect(
      rules(
        '<ComponentPreview name="just-simple" />\n\n<Callout\n  title="Quick — really easy..."\n  description={"the user"}\n/>'
      )
    ).toEqual([]);
  });

  it("skips inline JSX attributes inside prose", () => {
    expect(rules('Press <Kbd title="just">K</Kbd> to open.')).toEqual([]);
  });

  it("skips {/* */} comments and expressions", () => {
    expect(
      rules("{/* just a very quick note... */}\n\n{[\n  'easy',\n]}")
    ).toEqual([]);
  });

  it("skips table rows", () => {
    expect(
      rules("| Prop | Notes |\n| --- | --- |\n| a | just — easy |")
    ).toEqual([]);
  });

  it("skips frontmatter other than contentType", () => {
    const src =
      "---\ntitle: Just Very Simple — Guide...\ndescription: Quick.\ncontentType: Reference\n---\n\nText.\n";
    expect(lintProse(src, "p.mdx")).toEqual([]);
  });

  it("skips the generated backlinks block", () => {
    expect(
      rules(
        "{/* backlinks:start */}\n\n## Related Blocks\n\n- [Sign in](/docs/blocks/signin-01) — A simple form.\n\n{/* backlinks:end */}\n\nAfter."
      )
    ).toEqual([]);
  });

  it("skips link destinations but lints link text", () => {
    expect(rules("Read [the guide](/docs/installation/quick-start).")).toEqual(
      []
    );
    expect(rules("Read [the quick guide](/docs/guide).")).toEqual([
      "banned-word",
    ]);
  });

  it("lints prose again after a fence closes", () => {
    expect(rules("```ts\nconst a = 1;\n```\n\nJust this.")).toEqual([
      "banned-word",
    ]);
  });
});

describe("lint-docs-prose allowlist", () => {
  const source = `${FM}## Quick Start\n\nA quick-pick row. A quick note.\n`;

  it("drops a finding its match covers, and only that one", () => {
    const findings = lintProse(source, "a.mdx");
    const kept = applyAllowlist(
      findings,
      [{ rule: "banned-word", match: "quick-pick", reason: "block term" }],
      "a.mdx"
    );
    expect(
      findings.filter((f: Finding) => f.rule === "banned-word")
    ).toHaveLength(3);
    expect(kept.filter((f: Finding) => f.rule === "banned-word")).toHaveLength(
      2
    );
  });

  it("covers a heading-case finding only when every offending word is covered", () => {
    const findings = lintProse(source, "a.mdx");
    const kept = applyAllowlist(
      findings,
      [{ rule: "heading-case", match: "Quick Start", reason: "page title" }],
      "a.mdx"
    );
    expect(kept.map((f: Finding) => f.rule)).not.toContain("heading-case");
  });

  it("scopes an entry with a file to that file", () => {
    const entry = {
      file: "b.mdx",
      rule: "banned-word",
      match: "quick-pick",
      reason: "x",
    };
    const kept = applyAllowlist(lintProse(source, "a.mdx"), [entry], "a.mdx");
    expect(kept.filter((f: Finding) => f.rule === "banned-word")).toHaveLength(
      3
    );
  });
});

describe("lint-docs-prose ratchet (CLI)", () => {
  const temps: string[] = [];

  afterEach(() => {
    for (const dir of temps.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  function tree(
    pages: Record<string, string>,
    baseline?: object,
    allowlist: object[] = []
  ) {
    const dir = realpathSync(mkdtempSync(join(tmpdir(), "ks-docs-prose-")));
    temps.push(dir);
    for (const [path, body] of Object.entries(pages)) {
      mkdirSync(dirname(join(dir, "content", path)), { recursive: true });
      writeFileSync(join(dir, "content", path), FM + body);
    }
    if (baseline) {
      writeFileSync(join(dir, "baseline.json"), JSON.stringify(baseline));
    }
    writeFileSync(join(dir, "allowlist.json"), JSON.stringify(allowlist));
    return dir;
  }

  function cli(dir: string, ...args: string[]) {
    return spawnSync(
      process.execPath,
      [
        SCRIPT,
        "--content-dir",
        join(dir, "content"),
        "--baseline",
        join(dir, "baseline.json"),
        "--allowlist",
        join(dir, "allowlist.json"),
        ...args,
      ],
      { encoding: "utf8", timeout: 30_000 }
    );
  }

  const baselineOf = (dir: string) =>
    JSON.parse(readFileSync(join(dir, "baseline.json"), "utf8"));

  it("passes at the baseline and skips files starting with _", () => {
    const dir = tree(
      { "a.mdx": "Just one.", "_template.mdx": "Just very easy." },
      { "a.mdx": { "banned-word": 1 } }
    );
    const result = cli(dir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("OK — 1 docs MDX files");
  });

  it("fails when a count exceeds its baseline and names the findings", () => {
    const dir = tree(
      { "a.mdx": "Just one. Just two." },
      { "a.mdx": { "banned-word": 1 } }
    );
    const result = cli(dir);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("a.mdx:7 banned-word");
    expect(result.stdout).toContain("FAIL — 1 error(s)");
  });

  it("treats a file missing from the baseline as 0", () => {
    const dir = tree({ "new/b.mdx": "Wait..." }, {});
    const result = cli(dir);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("new/b.mdx:7 ellipsis");
  });

  it("passes on a decrease and hints at --update-baseline", () => {
    const dir = tree({ "a.mdx": "Fine." }, { "a.mdx": { "banned-word": 2 } });
    const result = cli(dir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("--update-baseline");
  });

  it("--update-baseline lowers counts and drops zero entries", () => {
    const dir = tree(
      { "a.mdx": "Just one.", "b.mdx": "Fine." },
      { "a.mdx": { "banned-word": 2, ellipsis: 1 }, "b.mdx": { "em-dash": 3 } }
    );
    expect(cli(dir, "--update-baseline").status).toBe(0);
    expect(baselineOf(dir)).toEqual({ "a.mdx": { "banned-word": 1 } });
  });

  it("--update-baseline refuses an increase and leaves the file untouched", () => {
    const dir = tree(
      { "a.mdx": "Just one. Just two." },
      { "a.mdx": { "banned-word": 1 } }
    );
    const before = readFileSync(join(dir, "baseline.json"), "utf8");
    const result = cli(dir, "--update-baseline");
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("a.mdx banned-word: 1 → 2");
    expect(readFileSync(join(dir, "baseline.json"), "utf8")).toBe(before);
  });

  it("--update-baseline --allow-increase raises the count", () => {
    const dir = tree(
      { "a.mdx": "Just one. Just two." },
      { "a.mdx": { "banned-word": 1 } }
    );
    expect(cli(dir, "--update-baseline", "--allow-increase").status).toBe(0);
    expect(baselineOf(dir)).toEqual({ "a.mdx": { "banned-word": 2 } });
  });

  it("applies the allowlist before counting", () => {
    const dir = tree({ "a.mdx": "A quick-pick row." }, {}, [
      { rule: "banned-word", match: "quick-pick", reason: "block term" },
    ]);
    expect(cli(dir).status).toBe(0);
  });

  it("rejects an allowlist entry without a reason", () => {
    const dir = tree({ "a.mdx": "Fine." }, {}, [
      { rule: "banned-word", match: "quick-pick" },
    ]);
    const result = cli(dir);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("needs a `reason`");
  });
});
