// @vitest-environment node

/**
 * Text-entry controls are 16px on touch devices, 14px only under a fine
 * pointer.
 *
 * iOS Safari zooms the page whenever focus lands on a control whose font is
 * under 16px, and never zooms back out. The old gate was `md:text-sm`, which
 * keyed off width: an iPad is wider than `md`, reports `pointer: coarse`, and
 * zoomed on every input. NativeSelect, CommandInput and ComboboxChips were
 * 14px everywhere. Control *height* comes from `--ks-control-*`, so the
 * 16px font changes nothing about layout.
 *
 * Every `text-sm` token in these files must therefore be
 * `pointer-fine:text-sm` (or `pointer-fine:file:text-sm` for the file
 * button), unless it styles something that never takes focus — those lines
 * are listed in ALLOWED with the reason.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SRC_DIR = import.meta.dirname;

/** Component files that render a focusable text-entry control. */
const TEXT_ENTRY_FILES = [
  "input.tsx",
  "textarea.tsx",
  "input-otp.tsx",
  "input-group.tsx",
  "native-select.tsx",
  "command.tsx",
  "combobox.tsx",
  "date-input.tsx",
] as const;

/**
 * Files whose own control class must carry the gated token. input-group and
 * date-input render `Input`/`Textarea` and inherit it, so they are
 * scan-only; ComboboxInput renders InputGroupInput and ComboboxChipsInput
 * inherits from the ComboboxChips wrapper (preflight gives inputs
 * `font: inherit`).
 */
const MUST_GATE = [
  "input.tsx",
  "textarea.tsx",
  "input-otp.tsx",
  "native-select.tsx",
  "command.tsx",
  "combobox.tsx",
] as const;

/** Any `text-sm` utility with its variant chain, e.g. `md:file:text-sm`. */
const TEXT_SM_TOKEN = /(?:[\w-]+:)*text-sm(?![\w-])/g;
/** Bare `text-base` and its fine-pointer override in one class string (Biome may sort either first). */
const GATED_CLASS =
  /(?<![\w:-])text-base(?![\w-])[^"]*pointer-fine:text-sm|pointer-fine:text-sm[^"]*(?<![\w:-])text-base(?![\w-])/;
const GATED = new Set(["pointer-fine:text-sm", "pointer-fine:file:text-sm"]);

/** Bare `text-sm` lines that style non-focusable parts, each with a reason. */
const ALLOWED: { file: string; lineIncludes: string; reason: string }[] = [
  {
    file: "input-group.tsx",
    lineIncludes: "group/input-group-addon flex",
    reason:
      "addon is an affix/label beside the input and never takes text focus",
  },
  {
    file: "input-group.tsx",
    lineIncludes: '"flex items-center gap-2 text-sm shadow-none"',
    reason: "InputGroupButton is a button; buttons do not trigger focus zoom",
  },
  {
    file: "input-group.tsx",
    lineIncludes: "flex items-center gap-2 text-muted-foreground text-sm",
    reason: "InputGroupText is static text, not a control",
  },
  {
    file: "command.tsx",
    lineIncludes: "py-6 text-center text-sm",
    reason: "CommandEmpty is a message, not a control",
  },
  {
    file: "command.tsx",
    lineIncludes: "group/command-item",
    reason: "CommandItem is an option row; focus stays on the input",
  },
  {
    file: "combobox.tsx",
    lineIncludes:
      "cursor-pointer select-none items-center gap-1.5 rounded-md pr-8",
    reason: "ComboboxItem is an option row; focus stays on the input",
  },
  {
    file: "combobox.tsx",
    lineIncludes: "group-data-empty/combobox-content:flex",
    reason: "ComboboxEmpty is a message, not a control",
  },
];

function ungatedTokens(line: string): string[] {
  return (line.match(TEXT_SM_TOKEN) ?? []).filter((t) => !GATED.has(t));
}

function read(file: string) {
  return readFileSync(join(SRC_DIR, file), "utf-8");
}

describe("text-entry font size", () => {
  it("token check flags width-gated and bare text-sm, passes pointer-fine", () => {
    expect(ungatedTokens('"px-3 text-sm"')).toEqual(["text-sm"]);
    expect(ungatedTokens('"text-base md:text-sm"')).toEqual(["md:text-sm"]);
    expect(ungatedTokens('"file:text-sm"')).toEqual(["file:text-sm"]);
    expect(ungatedTokens('"sm:pointer-fine:text-sm"')).toEqual([
      "sm:pointer-fine:text-sm",
    ]);
    expect(ungatedTokens('"text-base pointer-fine:text-sm"')).toEqual([]);
    expect(ungatedTokens('"file:text-base pointer-fine:file:text-sm"')).toEqual(
      []
    );
    expect(ungatedTokens('"text-small text-sm-foo"')).toEqual([]);
  });

  it("never sets text-sm on a text-entry control without pointer-fine:", () => {
    const offenders: string[] = [];
    const used = new Set<(typeof ALLOWED)[number]>();
    for (const file of TEXT_ENTRY_FILES) {
      read(file)
        .split("\n")
        .forEach((line, i) => {
          if (ungatedTokens(line).length === 0) {
            return;
          }
          const allowed = ALLOWED.find(
            (a) => a.file === file && line.includes(a.lineIncludes)
          );
          if (allowed) {
            used.add(allowed);
            return;
          }
          offenders.push(`${file}:${i + 1} ${ungatedTokens(line).join(" ")}`);
        });
    }
    expect(offenders).toEqual([]);
    // A stale allowlist entry would silently exempt whatever line next
    // happens to match it.
    expect(ALLOWED.filter((a) => !used.has(a)).map((a) => a.reason)).toEqual(
      []
    );
  });

  it.each(MUST_GATE)("%s carries the pointer-fine:text-sm gate", (file) => {
    expect(read(file)).toMatch(GATED_CLASS);
  });
});
