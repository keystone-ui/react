/**
 * The published skill loads on a signal the project controls, so it must run
 * nothing when it loads and pre-approve no commands. These are the pure
 * checks scripts/lint-skill.mjs applies to SKILL.md, run against fixtures.
 */

import { describe, expect, it } from "vitest";

import {
  frontMatterProblems,
  loadTimeCommandProblems,
} from "../../../scripts/lib/skill-checks.mjs";

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

describe("frontMatterProblems: hooks", () => {
  it("fails on a hooks key", () => {
    const lines = ["hooks:", "  PreToolUse:", "    - command: echo hi"];
    expect(frontMatterProblems(skill(lines))).toHaveLength(1);
  });
});

describe("loadTimeCommandProblems", () => {
  const BANG = "!";
  const TICK = "`";
  const FENCE = TICK.repeat(3);
  const inline = `${BANG}${TICK}echo context${TICK}`;

  const runsAtLoad: [string, string][] = [
    ["the inline form at the start of a line", inline],
    ["the inline form after a list marker", `- Context: ${inline}`],
    ["the inline form indented by two spaces", `  ${inline}`],
    ["a backtick fence followed by an exclamation mark", `${FENCE}${BANG}`],
    ["a tilde fence followed by an exclamation mark", `~~~${BANG}`],
    [
      "a longer fence followed by an exclamation mark",
      `${TICK.repeat(4)}${BANG}`,
    ],
  ];

  const containers: [string, string][] = [
    ["a list item", "- "],
    ["a numbered item", "1. "],
    ["a blockquote", "> "],
    ["a blockquote with no space", ">"],
    ["a blockquote inside a list item", "- > "],
    ["a list item inside a blockquote", "> 1. "],
  ];
  for (const [where, prefix] of containers) {
    runsAtLoad.push(
      [`the inline form in ${where}`, `${prefix}${inline}`],
      [`a backtick fence with ! in ${where}`, `${prefix}${FENCE}${BANG}`]
    );
  }
  runsAtLoad.push(
    ["a tilde fence with ! in a list item", `- ~~~${BANG}`],
    ["a long tilde fence with ! in a numbered item", `1. ~~~~${BANG}`]
  );

  for (const [label, line] of runsAtLoad) {
    it(`fails on ${label}`, () => {
      const body = `${BODY}\n## Current Project Context\n\n${line}\n`;
      expect(loadTimeCommandProblems(skill([], body))).toHaveLength(1);
    });
  }

  it("passes the clean skill", () => {
    expect(loadTimeCommandProblems(skill([]))).toEqual([]);
  });

  it("passes an ordinary fenced bash block with a documented command", () => {
    const body = `${FENCE}bash\nnpx shadcn@latest add https://keystoneui.io/r/card.json\n${FENCE}\n`;
    expect(loadTimeCommandProblems(skill([], body))).toEqual([]);
  });

  it("passes an ordinary fence inside a list item", () => {
    const body = `- Install:\n\n  ${FENCE}bash\n  npx shadcn@latest add https://keystoneui.io/r/card.json\n  ${FENCE}\n`;
    expect(loadTimeCommandProblems(skill([], body))).toEqual([]);
  });

  it("passes inline code followed by an exclamation mark", () => {
    const body = `Then run ${TICK}keystoneui audit${TICK}! It checks the CSS.\n`;
    expect(loadTimeCommandProblems(skill([], body))).toEqual([]);
  });

  it("passes a sentence containing an exclamation mark", () => {
    const body = "Done! Run the `audit` verb after a first install.\n";
    expect(loadTimeCommandProblems(skill([], body))).toEqual([]);
  });
});
