/**
 * The published skill loads on a signal the project controls, so it must run
 * nothing when it loads and pre-approve no commands. These are the pure
 * checks scripts/lint-skill.mjs applies to SKILL.md, run against fixtures.
 */

import { describe, expect, it } from "vitest";

import { frontMatterProblems } from "../../../scripts/lib/skill-checks.mjs";

const BODY = [
  "# Skill",
  "",
  "Install a component:",
  "",
  "```bash",
  "npx shadcn@latest add https://keystoneui.io/r/button.json",
  "```",
  "",
].join("\n");

function skill(frontMatterLines: string[], body = BODY): string {
  return [
    "---",
    "name: example",
    "description: An example skill.",
    ...frontMatterLines,
    "metadata:",
    '  version: "1.0.0"',
    "---",
    "",
    body,
  ].join("\n");
}

describe("frontMatterProblems: the pre-approval list", () => {
  const nonEmpty: [string, string[]][] = [
    ["an inline value", ["allowed-tools: Read"]],
    ["a value on the next line", ["allowed-tools:", "  Read"]],
    ["an unindented list", ["allowed-tools:", "- Read"]],
    ["an indented list", ["allowed-tools:", "  - Read"]],
    [
      "a list after a comment line",
      ["allowed-tools:", "  # tools", "  - Read"],
    ],
    [
      "a list with a blank line in it",
      ["allowed-tools:", "  - Read", "", "  - Bash(ls *)"],
    ],
    ["an inline list", ["allowed-tools: [Read]"]],
  ];

  for (const [label, lines] of nonEmpty) {
    it(`fails on ${label}`, () => {
      expect(frontMatterProblems(skill(lines))).toHaveLength(1);
    });
  }

  const empty: [string, string[]][] = [
    ["an absent key", []],
    ["a key with no value", ["allowed-tools:"]],
    ["null", ["allowed-tools: null"]],
    ["an empty double-quoted string", ['allowed-tools: ""']],
    ["an empty single-quoted string", ["allowed-tools: ''"]],
    ["an empty list", ["allowed-tools: []"]],
  ];

  for (const [label, lines] of empty) {
    it(`passes ${label}`, () => {
      expect(frontMatterProblems(skill(lines))).toEqual([]);
    });
  }

  it("ignores a documented shell command in the body", () => {
    const body = `${BODY}\nallowed-tools: Bash(npx shadcn@latest add *)\n`;
    expect(frontMatterProblems(skill([], body))).toEqual([]);
  });
});
