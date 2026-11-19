/**
 * The template placeholders of this package's output files: each must be
 * one whole call of a render.ts helper (`shown`, `inlineCode`,
 * `shellWord`, `codeBlock`, `tableCell`), with nothing before or after it,
 * or carry a reason on the allow-list below. A placeholder nested inside
 * another is judged on its own. Keys name the file, the enclosing function
 * and the expression, so an allowance does not travel to another function.
 *
 * What this scan does not see: output built without a placeholder (by
 * concatenation, `.join`, or a variable passed to a sink). Those sinks are
 * covered by behaviour tests instead:
 * - list, search and view entries and metadata lines: kits-untrusted
 *   ("registry text in list, search and view"), kits.test ("metadata lines");
 * - source and demo code blocks: kits-sinks ("source in view_component",
 *   "demo files in get_examples"), kits-edges ("how a source body ends");
 * - install and theme commands: kits-untrusted, kits-sinks ("theme
 *   commands"), kits-edges ("install commands are code blocks");
 * - refusals printed by the CLI (`console.error(refusal)`): kits-cli,
 *   kits-untrusted;
 * - docs Markdown printed by the CLI (`console.log(result.text)`): an
 *   exemption, kits-cli;
 * - thrown and rethrown errors (fetcher, docs, audit read, `init` writes):
 *   kits-sinks ("thrown messages"), kits-edges ("an error caught from the
 *   platform"), kits-fs-errors;
 * - project context table cells: kits-edges ("a table cell");
 * - `info --json`: a JSON document (exemption), kits-output-guards for the
 *   text form.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC_DIR = join(import.meta.dirname, "..");
const HELPER = /^(?:shown|inlineCode|shellWord|codeBlock|tableCell)\(/;
const ENCLOSING =
  /^(?:export )?(?:async )?function (\w+)|^(?:export )?const (\w+) =/;
const WHITESPACE = /\s+/g;

/** Files that print nothing, or are the helpers themselves. */
const NOT_SCANNED: Record<string, string> = {
  "config.ts": "reads configuration; prints nothing",
  "display-url.ts":
    "builds display URLs and redacted errors; every caller renders or escapes them",
  "index.ts":
    "entry point; builds no output text of its own. An error the package neither catches nor rethrows is outside this scan",
  "package-version.ts": "reads the own package.json; prints nothing",
  "registry-url.ts": "composes request URLs; prints nothing",
  "render.ts": "the helpers",
  "search.ts": "builds the fuzzy-search target; prints nothing",
  "server.ts": "registers tools; their text is rendered by the tools",
  "types.ts": "types only",
};

const NUMBER = "a number";
const CONSTANT = "a constant of this package";
const RENDERED = "already rendered by a helper where it was built";
const VALIDATED_CODE =
  "from a theme code that passed the theme-code pattern (letters, digits, `.`, `_`, `-`)";
const REQUEST_URL = "composes a request URL; never printed";
const ENUM = "an enum of this package";

/** `file<TAB>enclosing function<TAB>expression` → why it may skip the helpers. */
const ALLOWED: Record<string, string> = {
  'cli.ts\tparseType\tTYPES.join(", ")': CONSTANT,
  "cli.ts\trunCli\texhaustive": "unreachable (`never`)",
  "cli.ts\trunDocs\tresult.status": NUMBER,
  "cli.ts\trunTheme\tcode": VALIDATED_CODE,
  "cli.ts\trunTheme\tfields.base": VALIDATED_CODE,
  "cli.ts\trunTheme\tfields.font": VALIDATED_CODE,
  "cli.ts\trunTheme\tfields.primary": VALIDATED_CODE,
  "cli.ts\trunTheme\tfields.radius": VALIDATED_CODE,
  "cli.ts\trunTheme\tthemeInstallCommand(code, siteUrl, only)":
    "its URL is one `shellWord` (theme.ts)",
  "docs.ts\tdocsPageUrl\tdocsUrl": REQUEST_URL,
  "docs.ts\tdocsPageUrl\tpath": REQUEST_URL,
  "docs.ts\tpointerFor\tparent.name": `${REQUEST_URL}; the name passed nameRefusal`,
  "docs.ts\tpointerFor\tsection": REQUEST_URL,
  "docs.ts\tresolveDocs\tawait pointed.text()":
    "documentation Markdown returned as Markdown (exemption)",
  "docs.ts\tresolveDocs\tname": REQUEST_URL,
  "docs.ts\tresolveDocs\tpointer.path": REQUEST_URL,
  "docs.ts\tresolveDocs\tsection": REQUEST_URL,
  "docs.ts\tresolveDocs\twhere": RENDERED,
  "fetcher.ts\tfetchJson\tresponse.status": NUMBER,
  "fetcher.ts\tlookupManifest\tms": NUMBER,
  "info.ts\tcollect\tdocsUrl":
    "composes the llms.txt URL; displayUrl, then printed through `shown`",
  "info.ts\tdetectInstalledPackages\tdeclared[name]":
    "a declared version, printed through `shown` (printText)",
  "info.ts\tpad\tlabel": "pad() of a constant label or a rendered value",
  "info.ts\tprintText\tdata.package.name": CONSTANT,
  "info.ts\tprintText\tdata.package.version": "the own package.json version",
  "info.ts\tprintText\tp.installMode": ENUM,
  'info.ts\tprintText\tp.isRSC === null ? "(unknown)" : String(p.isRSC)':
    "a boolean",
  'info.ts\tprintText\tpad("Docs URL")': CONSTANT,
  'info.ts\tprintText\tpad("Docs")': CONSTANT,
  'info.ts\tprintText\tpad("Icon library")': CONSTANT,
  'info.ts\tprintText\tpad("Install mode")': CONSTANT,
  'info.ts\tprintText\tpad("llms.txt")': CONSTANT,
  'info.ts\tprintText\tpad("Node")': CONSTANT,
  'info.ts\tprintText\tpad("Package manager")': CONSTANT,
  'info.ts\tprintText\tpad("Platform")': CONSTANT,
  'info.ts\tprintText\tpad("Project root")': CONSTANT,
  'info.ts\tprintText\tpad("Registry URL")': CONSTANT,
  'info.ts\tprintText\tpad("Registry")': CONSTANT,
  'info.ts\tprintText\tpad("RSC")': CONSTANT,
  'info.ts\tprintText\tpad("Theme CSS")': CONSTANT,
  'info.ts\tprintText\tpad("UI alias")': CONSTANT,
  "info.ts\tprintText\tpad(client.name)": CONSTANT,
  "info.ts\tprintText\tpad(shown(pkg.name), 28)": RENDERED,
  "info.ts\tprintText\tshownOr(p.aliases?.ui)": RENDERED,
  "info.ts\tprintText\tshownOr(p.iconLibrary)": RENDERED,
  "info.ts\tprintText\tshownOr(p.packageManager)": RENDERED,
  "info.ts\tprintText\tshownOr(p.tailwindCssFile)": RENDERED,
  "init.ts\tprintUsage\tnames": CONSTANT,
  "init.ts\twriteJsonClient\tclient.configPath": CONSTANT,
  "init.ts\twriteJsonClient\tclient.name": CONSTANT,
  "init.ts\twriteJsonClient\tJSON.stringify(merged, null, 2)":
    "a JSON document written as JSON (exemption)",
  'item-meta.ts\tmetaLines\tmeta.partOf.map(shown).join(", ")': RENDERED,
  "item-meta.ts\tpointerUrl\tpage":
    "a composed, redacted URL; the whole Docs line is printed through `shown` (metaLines)",
  "item-meta.ts\tpointerUrl\tpointer.anchor":
    "passed the docs pointer pattern ([a-z0-9-])",
  "item-name.ts\tnameRefusal\tlabel": RENDERED,
  "item-name.ts\tnameRefusal\treason": CONSTANT,
  "item-name.ts\tnameRefusal\tshownName(name)": RENDERED,
  "item-name.ts\tonlyMessage\tcli": RENDERED,
  "project-context.ts\tdescribeInstallMode\tversion": RENDERED,
  "project-context.ts\timportLineFor\tname": 'a constant ("button")',
  "project-context.ts\timportLineFor\tui":
    "the result is printed inside `inlineCode` (formatProjectContext)",
  "theme-audit.ts\tauditTheme\tbg": CONSTANT,
  "theme-audit.ts\tauditTheme\tfg": CONSTANT,
  "theme-audit.ts\tformatAudit\tAA_TEXT": NUMBER,
  "theme-audit.ts\tformatAudit\tfailed": NUMBER,
  "theme-audit.ts\tformatAudit\tmark": CONSTANT,
  "theme-audit.ts\tformatAudit\tr.mode.padEnd(5)": CONSTANT,
  "theme-audit.ts\tformatAudit\tr.pair.padEnd(42)": CONSTANT,
  "theme-audit.ts\tformatAudit\tr.ratio.toFixed(2)": NUMBER,
  "theme-audit.ts\tformatAudit\tratio": NUMBER,
  "theme.ts\tparseThemeCode\tc": VALIDATED_CODE,
  "theme.ts\tparseThemeCode\th": VALIDATED_CODE,
  "theme.ts\tparseThemeCode\tl": VALIDATED_CODE,
  "theme.ts\tthemeBuilderUrl\tparams": VALIDATED_CODE,
  "theme.ts\tthemeBuilderUrl\tsiteUrl":
    "composes a URL printed only through `shellWord` (install) or `shown` (builder link)",
  "theme.ts\tthemeInstallUrl\tcode": VALIDATED_CODE,
  'theme.ts\tthemeInstallUrl\tonly.join(",")':
    "parts of this package's enum (theme, font)",
  "theme.ts\tthemeInstallUrl\tquery": "built from parts of this package's enum",
  "theme.ts\tthemeInstallUrl\tsiteUrl":
    "composes a URL printed only through `shellWord` (install) or `shown` (builder link)",
  "tools.ts\tauditChecklistTool\tctx.installMode": ENUM,
  'tools.ts\tauditChecklistTool\tregistryMode ? `- [ ] Importing from the project alias: ${inlineCode(`import { Button } from "${uiAlias}/button"`)} - [ ] NOT importing from \\`@keystoneui/react\\` -- it is not a dependency in this project` : `- [ ] Using subpath imports: \\`import { Button } from "@keystoneui/react/button"\\` - [ ] NOT using barrel imports from \\`@keystoneui/react\\``':
    "constants, and the alias inside `inlineCode`",
  "tools.ts\tauditChecklistTool\tuiAlias": "inside an `inlineCode` call",
  "tools.ts\tcommandBlock\tword":
    "the URL as printed before: its probe, with a safe stand-in for `<code>`, needs no quoting and the URL holds no line break or control; otherwise a `shellWord`",
  'tools.ts\texamplesHint\tused.map(shown).join(", ")': RENDERED,
  'tools.ts\tformatItemSummary\titem.categories.map(shown).join(", ")':
    RENDERED,
  'tools.ts\tformatItemSummary\titem.dependencies.map(shown).join(", ")':
    RENDERED,
  'tools.ts\tformatItemSummary\titem.registryDependencies.map(shown).join(", ")':
    RENDERED,
  "tools.ts\tgetAddCommandTool\tr": RENDERED,
  "tools.ts\tgetDocsTool\tinput.type": "an enum of the tool schema",
  "tools.ts\tgetDocsTool\tresult.status": NUMBER,
  "tools.ts\tgetExamplesTool\tbundle.files.length": NUMBER,
  'tools.ts\tgetExamplesTool\tbundle.files.length === 1 ? "" : "s"': CONSTANT,
  "tools.ts\tgetExamplesTool\thint": RENDERED,
  "tools.ts\tgetExamplesTool\tnotFound": RENDERED,
  "tools.ts\tgetThemeInfoTool\tcommandBlock(defaultStyleUrl)": RENDERED,
  "tools.ts\tgetThemeInfoTool\tcommandBlock(themeUrl, themeProbeUrl)": RENDERED,
  'tools.ts\tinstallText\tunsafe .map((url) => shown(displayUrl(url))) .join( ", " )':
    RENDERED,
  "tools.ts\tinstallText\tword": "a `shellWord`",
  'tools.ts\tinstallText\twords.join(" ")': "`shellWord`s",
  "tools.ts\tlistComponentsTool\tinput.offset + items.length": NUMBER,
  "tools.ts\tlistComponentsTool\titems.length": NUMBER,
  "tools.ts\tlistComponentsTool\ttotal": NUMBER,
  "tools.ts\tpackageAddCommand\tindex": RENDERED,
  "tools.ts\tpackageAddCommand\tinstallText( names.map((name) => registryItemUrl(config.registry, name)) )":
    RENDERED,
  "tools.ts\tpackageAddCommand\tinstallText( targets.map((target) => registryItemUrl(config.registry, target)) )":
    RENDERED,
  "tools.ts\tpackageAddCommand\tperName": RENDERED,
  "tools.ts\tpackageAddCommand\tpick.line": RENDERED,
  "tools.ts\tpackageAddCommand\tpick.refusal": RENDERED,
  "tools.ts\tpickTarget\tVENDORS_SOURCE": CONSTANT,
  "tools.ts\tpickTarget\tversionNote(flavourMeta?.minPackageVersion, declared)":
    RENDERED,
  "tools.ts\tpickTarget\tversionNote(meta.minPackageVersion, declared)":
    RENDERED,
  "tools.ts\tsearchComponentsTool\ttotal": NUMBER,
  'tools.ts\tsearchComponentsTool\ttotal === 1 ? "" : "s"': CONSTANT,
  "tools.ts\tversionNote\tdeclared": RENDERED,
};

/** The index of the parenthesis that closes the one at `open`. */
function closingParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") {
      for (i++; i < text.length && text[i] !== c; i++) {
        if (text[i] === "\\") {
          i++;
        }
      }
    } else if (c === "(") {
      depth++;
    } else if (c === ")") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

/** Whether `expr` is one whole helper call, with nothing after it. */
export function isHelperCall(expr: string): boolean {
  const match = HELPER.exec(expr);
  return (
    match !== null &&
    closingParen(expr, match[0].length - 1) === expr.length - 1
  );
}

/**
 * Each `${…}` in a source text, nested ones included, with its line and
 * enclosing function.
 */
export function interpolations(
  source: string
): { expr: string; fn: string; line: number }[] {
  const lines = source.split("\n");
  const found: { expr: string; fn: string; line: number }[] = [];
  const scan = (text: string, offset: number) => {
    let at = text.indexOf("${");
    while (at !== -1) {
      let depth = 1;
      let end = at + 2;
      while (depth > 0 && end < text.length) {
        if (text[end] === "{") {
          depth++;
        } else if (text[end] === "}") {
          depth--;
        }
        end++;
      }
      const inner = text.slice(at + 2, end - 1);
      const line = source.slice(0, offset + at).split("\n").length;
      let fn = "<module>";
      for (let i = line - 1; i >= 0; i--) {
        const match = ENCLOSING.exec(lines[i]);
        if (match) {
          fn = match[1] ?? match[2];
          break;
        }
      }
      found.push({
        expr: inner.replace(WHITESPACE, " ").trim(),
        fn,
        line,
      });
      scan(inner, offset + at + 2);
      at = text.indexOf("${", end);
    }
  };
  scan(source, 0);
  return found;
}

function scannedFiles(): string[] {
  return readdirSync(SRC_DIR)
    .filter((file) => file.endsWith(".ts") && !(file in NOT_SCANNED))
    .sort();
}

function keysOf(file: string): { key: string; line: number }[] {
  return interpolations(readFileSync(join(SRC_DIR, file), "utf-8")).map(
    ({ expr, fn, line }) => ({ key: `${file}\t${fn}\t${expr}`, line })
  );
}

describe("output interpolations", () => {
  // Built with a "$" variable so a sample is not itself a placeholder.
  const $ = "$";

  it("the scanner finds nested placeholders and their function", () => {
    const sample = [
      "function f() {",
      `  return \`x ${$}{shown(b)} ${$}{d ? \`${$}{e}\` : g}\`;`,
      "}",
    ].join("\n");
    expect(
      interpolations(sample).map(({ expr, fn }) => `${fn} ${expr}`)
    ).toEqual(["f shown(b)", `f d ? \`${$}{e}\` : g`, "f e"]);
  });

  it("accepts only one whole helper call", () => {
    expect(isHelperCall("shown(a)")).toBe(true);
    expect(isHelperCall(`inlineCode(\`x ${$}{y} (z)\`)`)).toBe(true);
    expect(isHelperCall("shown(a) + b")).toBe(false);
    expect(isHelperCall("b + shown(a)")).toBe(false);
    expect(isHelperCall("shown(a)(b)")).toBe(false);
    expect(isHelperCall("shownName(a)")).toBe(false);
  });

  it("a raw placeholder nested in a helper call is judged on its own", () => {
    const sample = `const a = \`${$}{shown(\`${$}{raw}\`)}\`;`;
    const raw = interpolations(sample).filter(
      ({ expr }) => !isHelperCall(expr)
    );
    expect(raw.map(({ expr }) => expr)).toEqual(["raw"]);
  });

  it("every one is a helper call or has a reason", () => {
    const offenders = scannedFiles().flatMap((file) =>
      keysOf(file)
        .filter(({ key }) => {
          const expr = key.split("\t")[2];
          return !(isHelperCall(expr) || key in ALLOWED);
        })
        .map(({ key, line }) => `${file}:${line} ${key}`)
    );
    expect(offenders).toEqual([]);
  });

  it("the allow-list holds nothing that is gone", () => {
    const present = new Set(
      scannedFiles().flatMap((file) => keysOf(file).map(({ key }) => key))
    );
    expect(Object.keys(ALLOWED).filter((key) => !present.has(key))).toEqual([]);
  });

  it("every file is scanned or excused with a reason", () => {
    for (const reason of Object.values({ ...NOT_SCANNED, ...ALLOWED })) {
      expect(reason.length).toBeGreaterThan(5);
    }
    const all = readdirSync(SRC_DIR).filter((file) => file.endsWith(".ts"));
    for (const file of Object.keys(NOT_SCANNED)) {
      expect(all, file).toContain(file);
    }
  });
});
