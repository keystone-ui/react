/**
 * Checks that loading the published skill runs nothing and that the skill
 * pre-approves nothing.
 *
 * The skill loads on a signal the project controls (`@keystoneui/react` in its
 * dependencies), so a command that runs at load time, or one the skill
 * pre-approves, runs inside a project the agent may not have reviewed.
 *
 * Pure: each function takes the text of SKILL.md and returns problems as
 * `{ line, message }` with 1-based line numbers. Shared by
 * scripts/lint-skill.mjs and its tests.
 */

import { createRequire } from "node:module";

// The YAML parser the docs app already depends on; no new dependency.
const { parse: parseYaml } = createRequire(
  new URL("../../apps/docs/package.json", import.meta.url)
)("yaml");

/**
 * Lines that run a shell command when the skill loads.
 *
 * @param {string} skillMd
 * @returns {{ line: number, message: string }[]}
 */
export function loadTimeCommandProblems(skillMd) {
  const problems = [];
  skillMd.split("\n").forEach((text, i) => {
    if (text.startsWith("!`")) {
      problems.push({
        line: i + 1,
        message: `runs a shell command when the skill loads: ${text.trim().slice(0, 110)}`,
      });
    }
  });
  return problems;
}

/**
 * Front-matter keys that pre-approve commands. The value is judged as a YAML
 * parser reads it, so every spelling of a non-empty value fails: an absent
 * key, null, an empty string and an empty list are the only values that pass.
 * Only the front matter is read; commands documented in the body do not count.
 *
 * @param {string} skillMd
 * @returns {{ line: number, message: string }[]}
 */
export function frontMatterProblems(skillMd) {
  const frontMatter = skillMd.match(FRONT_MATTER);
  if (!frontMatter) {
    return [{ line: 1, message: "no front matter found" }];
  }
  let data;
  try {
    data = parseYaml(frontMatter[1]);
  } catch (error) {
    return [
      { line: 1, message: `front matter is not valid YAML: ${error.message}` },
    ];
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return [{ line: 1, message: "front matter is not a YAML mapping" }];
  }

  const problems = [];
  const value = data["allowed-tools"];
  const empty =
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);
  if (!empty) {
    problems.push({
      line: keyLine(frontMatter[1], "allowed-tools"),
      message: "pre-approves commands; the allowed-tools list must be empty",
    });
  }
  return problems;
}

const FRONT_MATTER = /^---\n([\s\S]*?)\n---\n/;

/** 1-based line of a top-level key in SKILL.md (front matter starts on 2). */
function keyLine(frontMatter, key) {
  const at = frontMatter
    .split("\n")
    .findIndex((line) => line.startsWith(`${key}:`));
  return at === -1 ? 1 : at + 2;
}
