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
 * Front-matter keys that pre-approve commands.
 *
 * @param {string} skillMd
 * @returns {{ line: number, message: string }[]}
 */
export function frontMatterProblems(skillMd) {
  const frontMatter = skillMd.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontMatter) {
    return [{ line: 1, message: "no front matter found" }];
  }
  const fmLines = frontMatter[1].split("\n");
  const at = fmLines.findIndex((line) => line.startsWith("allowed-tools:"));
  if (at === -1) {
    return [];
  }
  const inline = fmLines[at].slice("allowed-tools:".length).trim();
  const listed = [];
  for (const line of fmLines.slice(at + 1)) {
    if (!/^\s+-/.test(line)) {
      break;
    }
    listed.push(line.trim());
  }
  const empty =
    (inline === "" || inline === "[]" || inline === '""') &&
    listed.length === 0;
  return empty
    ? []
    : [
        {
          line: at + 2,
          message:
            "pre-approves commands; the allowed-tools list must be empty",
        },
      ];
}
